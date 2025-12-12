import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  createLockSchema,
  createBookingRequestSchema,
  updateArtistSchema,
  createCityScheduleRequestSchema,
  upsertAvailabilitySchema,
  PLATFORM_FEE_PERCENTAGE,
  ARTIST_PERCENTAGE,
  VENDOR_PERCENTAGE,
  DEPOSIT_RETENTION_DAYS,
  BOOKING_LOCK_DURATION_MS,
  USER_ROLES,
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { stripeService } from "./stripeService";
import { isStripeConfigured, getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { emailService } from "./services/email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // ==================== STRIPE WEBHOOK (must be before json parsing) ====================
  // Note: This route uses express.raw() for webhook signature verification
  app.post("/api/stripe/webhook/:uuid", async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;
      const signature = req.headers["stripe-signature"] as string;
      
      if (!signature) {
        return res.status(400).json({ message: "Missing stripe-signature header" });
      }
      
      // rawBody is set by express.json verify callback in index.ts
      const rawBody = (req as any).rawBody;
      if (!rawBody || !Buffer.isBuffer(rawBody)) {
        console.error("[stripe webhook] rawBody not available or not a Buffer");
        return res.status(400).json({ message: "Invalid request body" });
      }
      
      await WebhookHandlers.processWebhook(rawBody, signature, uuid);
      res.json({ received: true });
    } catch (error: any) {
      console.error("[stripe webhook] Error:", error.message);
      res.status(400).json({ message: error.message });
    }
  });

  // Auth routes
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser((req.user as any).id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  // ==================== ARTIST API ROUTES ====================
  
  // Get current artist profile
  app.get("/api/artist/me", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      let artist = await storage.getArtistByUserId(userId);
      
      // Auto-create artist profile if doesn't exist
      if (!artist) {
        const user = await storage.getUser(userId);
        artist = await storage.createArtist({
          userId,
          subdomain: user?.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9-]/g, "") || `artist-${Date.now()}`,
          displayName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "New Artist",
        });
      }
      
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist:", error);
      res.status(500).json({ message: "Failed to fetch artist profile" });
    }
  });

  // Update artist profile
  app.patch("/api/artist/me", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Validate request body
      const parseResult = updateArtistSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: fromError(parseResult.error).message });
      }
      
      const updated = await storage.updateArtist(artist.id, parseResult.data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating artist:", error);
      res.status(500).json({ message: "Failed to update artist profile" });
    }
  });

  // Get artist stats
  app.get("/api/artist/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json({
          upcomingBookings: 0,
          thisWeekBookings: 0,
          totalEarnings: 0,
          totalClients: 0,
          heldDeposits: 0,
          availableDeposits: 0,
        });
      }
      
      const stats = await storage.getArtistStats(artist.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get artist availability
  app.get("/api/artist/availability", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json([]);
      }
      
      const availability = await storage.getArtistAvailability(artist.id);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Update artist availability
  app.post("/api/artist/availability", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Validate request body
      const parseResult = upsertAvailabilitySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: fromError(parseResult.error).message });
      }
      
      const availability = await storage.upsertAvailability({
        ...parseResult.data,
        artistId: artist.id,
      });
      
      res.json(availability);
    } catch (error) {
      console.error("Error updating availability:", error);
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  // Get artist bookings
  app.get("/api/artist/bookings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json([]);
      }
      
      const { month, year } = req.query;
      
      if (month !== undefined && year !== undefined) {
        const bookings = await storage.getArtistBookingsByMonth(
          artist.id,
          parseInt(month as string),
          parseInt(year as string)
        );
        return res.json(bookings);
      }
      
      const bookings = await storage.getArtistBookings(artist.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get artist city schedules
  app.get("/api/artist/city-schedules", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json([]);
      }
      
      const schedules = await storage.getCitySchedules(artist.id);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching city schedules:", error);
      res.status(500).json({ message: "Failed to fetch city schedules" });
    }
  });

  // Create city schedule
  app.post("/api/artist/city-schedules", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Validate request body
      const parseResult = createCityScheduleRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: fromError(parseResult.error).message });
      }
      
      const schedule = await storage.createCitySchedule({
        ...parseResult.data,
        artistId: artist.id,
      });
      
      res.json(schedule);
    } catch (error) {
      console.error("Error creating city schedule:", error);
      res.status(500).json({ message: "Failed to create city schedule" });
    }
  });

  // Delete city schedule
  app.delete("/api/artist/city-schedules/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteCitySchedule(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting city schedule:", error);
      res.status(500).json({ message: "Failed to delete city schedule" });
    }
  });

  // Get artist deposits
  app.get("/api/artist/deposits", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json([]);
      }
      
      const deposits = await storage.getArtistDeposits(artist.id);
      res.json(deposits);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  // ==================== PORTFOLIO ROUTES ====================
  
  // Get artist portfolio categories
  app.get("/api/artist/portfolio/categories", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json([]);
      }
      
      const categories = await storage.getPortfolioCategories(artist.id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching portfolio categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create portfolio category
  app.post("/api/artist/portfolio/categories", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const { name, description } = req.body;
      if (!name || name.length < 2) {
        return res.status(400).json({ message: "Category name must be at least 2 characters" });
      }
      
      const category = await storage.createPortfolioCategory({
        artistId: artist.id,
        name,
        description,
      });
      
      res.json(category);
    } catch (error) {
      console.error("Error creating portfolio category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update portfolio category
  app.patch("/api/artist/portfolio/categories/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { name, description, sortOrder, isActive } = req.body;
      const category = await storage.updatePortfolioCategory(req.params.id, {
        name,
        description,
        sortOrder,
        isActive,
      });
      res.json(category);
    } catch (error) {
      console.error("Error updating portfolio category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete portfolio category
  app.delete("/api/artist/portfolio/categories/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deletePortfolioCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting portfolio category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Get photos by category
  app.get("/api/artist/portfolio/categories/:categoryId/photos", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const photos = await storage.getPortfolioPhotos(req.params.categoryId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching portfolio photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Get all artist photos
  app.get("/api/artist/portfolio/photos", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json([]);
      }
      
      const photos = await storage.getAllArtistPhotos(artist.id);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching portfolio photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Add photo to category (max 20)
  app.post("/api/artist/portfolio/categories/:categoryId/photos", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Check photo limit (max 20 per category)
      const count = await storage.getPhotosCountByCategory(req.params.categoryId);
      if (count >= 20) {
        return res.status(400).json({ message: "Maximum 20 photos per category" });
      }
      
      const { photoUrl, description } = req.body;
      if (!photoUrl) {
        return res.status(400).json({ message: "Photo URL is required" });
      }
      
      const photo = await storage.createPortfolioPhoto({
        categoryId: req.params.categoryId,
        artistId: artist.id,
        photoUrl,
        description,
      });
      
      res.json(photo);
    } catch (error) {
      console.error("Error adding portfolio photo:", error);
      res.status(500).json({ message: "Failed to add photo" });
    }
  });

  // Delete photo
  app.delete("/api/artist/portfolio/photos/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deletePortfolioPhoto(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting portfolio photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // ==================== DEPOSIT VALUES ROUTES ====================
  
  // Get deposit values
  app.get("/api/artist/deposit-values", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json([]);
      }
      
      const values = await storage.getDepositValues(artist.id);
      res.json(values);
    } catch (error) {
      console.error("Error fetching deposit values:", error);
      res.status(500).json({ message: "Failed to fetch deposit values" });
    }
  });

  // Create deposit value
  app.post("/api/artist/deposit-values", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const { name, durationHours, depositAmount } = req.body;
      
      const value = await storage.createDepositValue({
        artistId: artist.id,
        name,
        durationHours: String(durationHours),
        depositAmount: String(depositAmount),
      });
      
      res.json(value);
    } catch (error) {
      console.error("Error creating deposit value:", error);
      res.status(500).json({ message: "Failed to create deposit value" });
    }
  });

  // Delete deposit value
  app.delete("/api/artist/deposit-values/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteDepositValue(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting deposit value:", error);
      res.status(500).json({ message: "Failed to delete deposit value" });
    }
  });

  // Get artist earnings stats
  app.get("/api/artist/earnings/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.json({
          totalEarnings: 0,
          availableEarnings: 0,
          heldEarnings: 0,
          platformFees: 0,
          totalBookings: 0,
          currency: "EUR",
        });
      }
      
      const stats = await storage.getArtistStats(artist.id);
      const bookings = await storage.getArtistBookings(artist.id);
      
      res.json({
        totalEarnings: stats.totalEarnings,
        availableEarnings: stats.availableDeposits,
        heldEarnings: stats.heldDeposits,
        platformFees: stats.totalEarnings * 0.3 / 0.7, // Reverse calculate
        totalBookings: bookings.length,
        currency: artist.currency || "EUR",
      });
    } catch (error) {
      console.error("Error fetching earnings stats:", error);
      res.status(500).json({ message: "Failed to fetch earnings stats" });
    }
  });

  // ==================== CEO API ROUTES ====================
  
  // CEO stats
  app.get("/api/ceo/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getCEOStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching CEO stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all artists
  app.get("/api/ceo/artists", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { status } = req.query;
      
      if (status === "pending") {
        const artists = await storage.getPendingArtists();
        return res.json(artists);
      }
      
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  // Approve artist
  app.post("/api/ceo/artists/:id/approve", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const artist = await storage.approveArtist(req.params.id);
      res.json(artist);
    } catch (error) {
      console.error("Error approving artist:", error);
      res.status(500).json({ message: "Failed to approve artist" });
    }
  });

  // Deactivate artist
  app.post("/api/ceo/artists/:id/deactivate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const artist = await storage.deactivateArtist(req.params.id);
      res.json(artist);
    } catch (error) {
      console.error("Error deactivating artist:", error);
      res.status(500).json({ message: "Failed to deactivate artist" });
    }
  });

  // Get all bookings
  app.get("/api/ceo/bookings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { status } = req.query;
      
      if (status === "recent") {
        const bookings = await storage.getRecentBookings(10);
        return res.json(bookings);
      }
      
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get all deposits
  app.get("/api/ceo/deposits", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const deposits = await storage.getAllDeposits();
      res.json(deposits);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  // Financial stats
  app.get("/api/ceo/financial/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getCEOStats();
      res.json({
        totalRevenue: stats.totalRevenue,
        platformFees: stats.platformFees,
        artistPayouts: stats.totalRevenue - stats.platformFees,
        heldDeposits: stats.heldDeposits,
        availableDeposits: stats.availableDeposits,
        monthlyRevenue: stats.monthlyRevenue,
        currency: "EUR",
      });
    } catch (error) {
      console.error("Error fetching financial stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Update booking status
  app.patch("/api/ceo/bookings/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { status } = req.body;
      if (!status || !["pending", "confirmed", "completed", "cancelled", "no_show"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.updateBookingStatus(req.params.id, status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Reports endpoint
  app.get("/api/ceo/reports", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { period = "30" } = req.query;
      const days = parseInt(period as string, 10);
      
      const stats = await storage.getCEOStats();
      const topArtists = await storage.getTopArtists(5);
      
      res.json({
        totalRevenue: stats.totalRevenue,
        revenueChange: 12,
        totalBookings: stats.totalBookings,
        bookingsChange: 8,
        averageDeposit: stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings) : 0,
        depositChange: 5,
        activeArtists: stats.activeArtists,
        artistsChange: 0,
        monthlyBreakdown: [],
        topArtists: topArtists.map(a => ({
          id: a.id,
          name: a.displayName,
          bookings: 0,
          revenue: 0,
        })),
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Integration status endpoint
  app.get("/api/ceo/integration-status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json({
        smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
        stripe: !!process.env.STRIPE_SECRET_KEY,
        whatsapp: !!(process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_TOKEN),
        revolut: false,
        wise: false,
      });
    } catch (error) {
      console.error("Error fetching integration status:", error);
      res.status(500).json({ message: "Failed to fetch integration status" });
    }
  });

  // SMTP settings (placeholder - actual credentials should be set via env vars)
  app.post("/api/ceo/settings/smtp", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // In production, SMTP settings should be configured via environment variables
      // This endpoint confirms receipt but doesn't store credentials in DB
      res.json({ success: true, message: "SMTP settings received. Configure via environment variables for security." });
    } catch (error) {
      console.error("Error saving SMTP settings:", error);
      res.status(500).json({ message: "Failed to save SMTP settings" });
    }
  });

  // SMTP test email
  app.post("/api/ceo/settings/smtp/test", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        return res.status(400).json({ message: "SMTP not configured. Please set SMTP environment variables." });
      }
      
      res.json({ success: true, message: "Test email would be sent if SMTP is configured" });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // ==================== EXPORT ROUTES ====================

  // Export bookings as CSV
  app.get("/api/ceo/export/bookings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await storage.getAllBookings();
      
      const csv = [
        "ID,Artist,Customer Name,Customer Email,Date,Status,Deposit,Currency",
        ...bookings.map(b => 
          `"${b.id}","${b.artistId}","${b.customerName}","${b.customerEmail}","${new Date(b.slotDatetime).toISOString()}","${b.status}","${b.depositAmount}","${b.currency}"`
        )
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=bookings.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error exporting bookings:", error);
      res.status(500).json({ message: "Failed to export bookings" });
    }
  });

  // Export deposits as CSV
  app.get("/api/ceo/export/deposits", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== "ceo") {
        return res.status(403).json({ message: "Access denied" });
      }

      const allDeposits = await storage.getAllDeposits();
      
      const csv = [
        "ID,Booking ID,Artist ID,Amount,Currency,Platform Fee,Artist Amount,Status,Retention Until,Created At",
        ...allDeposits.map(d => 
          `"${d.id}","${d.bookingId}","${d.artistId}","${d.amount}","${d.currency}","${d.platformFee}","${d.artistAmount}","${d.status}","${d.retentionUntil?.toISOString() || ''}","${d.createdAt?.toISOString() || ''}"`
        )
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=deposits.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error exporting deposits:", error);
      res.status(500).json({ message: "Failed to export deposits" });
    }
  });

  // ==================== ALTERNATIVE PAYMENT METHODS ====================

  // Get Revolut payment instructions
  app.post("/api/public/artist/:subdomain/payment/revolut", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      if (!artist || !artist.isActive) {
        return res.status(404).json({ message: "Artist not found" });
      }

      const { lockId, amount, currency } = req.body;
      
      // Generate Revolut payment instructions
      // In production, this would integrate with Revolut API
      res.json({
        method: "revolut",
        instructions: {
          recipientTag: `@altusink`,
          amount: amount,
          currency: currency,
          reference: `ALTUSINK-${lockId?.slice(-8).toUpperCase() || 'BOOKING'}`,
          note: `After payment, send screenshot to confirm your booking.`,
        },
        expiresIn: 600, // 10 minutes to complete
      });
    } catch (error) {
      console.error("Error getting Revolut instructions:", error);
      res.status(500).json({ message: "Failed to get payment instructions" });
    }
  });

  // Get Wise payment instructions
  app.post("/api/public/artist/:subdomain/payment/wise", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      if (!artist || !artist.isActive) {
        return res.status(404).json({ message: "Artist not found" });
      }

      const { lockId, amount, currency } = req.body;
      
      // Generate Wise payment instructions
      // In production, this would integrate with Wise API
      res.json({
        method: "wise",
        instructions: {
          email: "payments@altusink.io",
          amount: amount,
          currency: currency,
          reference: `ALTUSINK-${lockId?.slice(-8).toUpperCase() || 'BOOKING'}`,
          note: `After payment, send confirmation email to complete your booking.`,
        },
        expiresIn: 600, // 10 minutes to complete
      });
    } catch (error) {
      console.error("Error getting Wise instructions:", error);
      res.status(500).json({ message: "Failed to get payment instructions" });
    }
  });

  // ==================== PUBLIC API ROUTES ====================
  
  // Get public artist profile
  app.get("/api/public/artist/:subdomain", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      
      if (!artist || !artist.isActive || !artist.isApproved) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Return public-safe fields only
      res.json({
        id: artist.id,
        subdomain: artist.subdomain,
        displayName: artist.displayName,
        bio: artist.bio,
        instagram: artist.instagram,
        depositAmount: artist.depositAmount,
        currency: artist.currency,
        timezone: artist.timezone,
        tourModeEnabled: artist.tourModeEnabled,
        themeColor: artist.themeColor,
        coverImageUrl: artist.coverImageUrl,
      });
    } catch (error) {
      console.error("Error fetching public artist:", error);
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  // Get public artist availability
  app.get("/api/public/artist/:subdomain/availability", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      
      if (!artist || !artist.isActive || !artist.isApproved) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const availability = await storage.getArtistAvailability(artist.id);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching public availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Get public artist city schedules
  app.get("/api/public/artist/:subdomain/city-schedules", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      
      if (!artist || !artist.isActive || !artist.isApproved) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const schedules = await storage.getCitySchedules(artist.id);
      
      // Return schedules without full address (until after payment)
      res.json(
        schedules.map((s) => ({
          id: s.id,
          city: s.city,
          country: s.country,
          countryCode: s.countryCode,
          venueName: s.venueName,
          startDate: s.startDate,
          endDate: s.endDate,
          isActive: s.isActive,
          // Full address hidden until after payment
        }))
      );
    } catch (error) {
      console.error("Error fetching public city schedules:", error);
      res.status(500).json({ message: "Failed to fetch city schedules" });
    }
  });

  // Get public artist portfolio categories
  app.get("/api/public/artist/:subdomain/portfolio", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      
      if (!artist || !artist.isActive || !artist.isApproved) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const categories = await storage.getPortfolioCategories(artist.id);
      
      // Get photos for each category
      const categoriesWithPhotos = await Promise.all(
        categories.filter(c => c.isActive).map(async (category) => {
          const photos = await storage.getPortfolioPhotos(category.id);
          return {
            ...category,
            photos,
          };
        })
      );
      
      res.json(categoriesWithPhotos);
    } catch (error) {
      console.error("Error fetching public portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Get public deposit values
  app.get("/api/public/artist/:subdomain/deposit-values", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      
      if (!artist || !artist.isActive || !artist.isApproved) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const values = await storage.getDepositValues(artist.id);
      res.json(values.filter(v => v.isActive));
    } catch (error) {
      console.error("Error fetching public deposit values:", error);
      res.status(500).json({ message: "Failed to fetch deposit values" });
    }
  });

  // Create booking lock
  app.post("/api/public/artist/:subdomain/lock", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      
      if (!artist || !artist.isActive || !artist.isApproved) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Validate request body
      const parseResult = createLockSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: fromError(parseResult.error).message });
      }
      
      const { slotDatetime, customerEmail, customerName, customerPhone } = parseResult.data;
      
      // Expire old locks first
      await storage.expireOldLocks();
      
      // Check if slot is already locked or booked
      const isAvailable = await storage.isSlotAvailable(
        artist.id,
        new Date(slotDatetime)
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "This time slot is no longer available" });
      }
      
      // Create 10-minute lock
      const expiresAt = new Date(Date.now() + BOOKING_LOCK_DURATION_MS);
      
      const lock = await storage.createBookingLock({
        artistId: artist.id,
        slotDatetime: new Date(slotDatetime),
        customerEmail,
        customerName,
        customerPhone,
        expiresAt,
        status: "pending",
      });
      
      res.json({
        lockId: lock.id,
        expiresAt: expiresAt.toISOString(),
        lockDurationMs: BOOKING_LOCK_DURATION_MS,
      });
    } catch (error) {
      console.error("Error creating booking lock:", error);
      res.status(500).json({ message: "Failed to create booking lock" });
    }
  });

  // Create Stripe checkout session for booking
  app.post("/api/public/artist/:subdomain/checkout", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      
      if (!artist || !artist.isActive || !artist.isApproved) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const { lockId, customerInstagram, tattooDescription, referenceImages, depositValueId } = req.body;
      
      if (!lockId) {
        return res.status(400).json({ message: "Lock ID is required" });
      }
      
      // Get and verify lock
      const lock = await storage.getBookingLock(lockId);
      if (!lock) {
        return res.status(404).json({ message: "Booking lock not found" });
      }
      
      // SECURITY: Verify lock belongs to this artist (prevent cross-tenant misuse)
      if (lock.artistId !== artist.id) {
        return res.status(403).json({ message: "Lock does not belong to this artist" });
      }
      
      if (lock.status !== "pending") {
        return res.status(409).json({ message: "Booking lock is no longer valid" });
      }
      if (new Date(lock.expiresAt) < new Date()) {
        return res.status(409).json({ message: "Booking lock has expired" });
      }
      
      // Update lock with additional form data before checkout
      if (customerInstagram || tattooDescription || referenceImages || depositValueId) {
        await storage.updateBookingLock(lockId, {
          customerInstagram,
          tattooDescription,
          referenceImageUrl: referenceImages?.[0] || null,
          depositValueId,
        });
      }
      
      // Refresh lock with updated data
      const updatedLock = await storage.getBookingLock(lockId);
      if (!updatedLock) {
        return res.status(404).json({ message: "Lock not found after update" });
      }
      
      // Check if Stripe is configured
      const stripeReady = await isStripeConfigured();
      
      if (!stripeReady) {
        // Fallback: Create booking without Stripe (for development)
        console.log("[booking] Stripe not configured, creating booking directly");
        
        const booking = await storage.createBooking({
          artistId: artist.id,
          lockId: updatedLock.id,
          customerName: updatedLock.customerName,
          customerEmail: updatedLock.customerEmail,
          customerPhone: updatedLock.customerPhone || undefined,
          customerInstagram: updatedLock.customerInstagram || undefined,
          slotDatetime: updatedLock.slotDatetime,
          durationMinutes: updatedLock.durationMinutes || 60,
          depositAmount: artist.depositAmount || "100",
          currency: artist.currency || "EUR",
          referenceImageUrl: updatedLock.referenceImageUrl || undefined,
          tattooDescription: updatedLock.tattooDescription || undefined,
          authorizePortfolio: updatedLock.authorizePortfolio || false,
          status: "confirmed",
        });
        
        await storage.confirmBookingLock(lockId);
        
        // Create deposit record
        const depositAmount = Number(artist.depositAmount || 100);
        const platformFee = depositAmount * PLATFORM_FEE_PERCENTAGE;
        const artistAmount = depositAmount * (1 - PLATFORM_FEE_PERCENTAGE);
        const retentionUntil = new Date();
        retentionUntil.setDate(retentionUntil.getDate() + DEPOSIT_RETENTION_DAYS);
        
        await storage.createDeposit({
          artistId: artist.id,
          bookingId: booking.id,
          amount: depositAmount.toFixed(2),
          currency: artist.currency || "EUR",
          platformFee: platformFee.toFixed(2),
          artistAmount: artistAmount.toFixed(2),
          isRefundable: false,
          status: "held",
          retentionUntil,
        });
        
        // Create payment record for consistency across environments
        await storage.createPayment({
          artistId: artist.id,
          bookingId: booking.id,
          lockId: updatedLock.id,
          amount: depositAmount.toFixed(2),
          currency: artist.currency || "EUR",
          paymentMethod: "development",
          paymentIntentId: `dev_${booking.id}`,
          status: "completed",
        });
        
        return res.json({
          success: true,
          bookingId: booking.id,
          mode: "development",
        });
      }
      
      // Create Stripe checkout session
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || req.get('host')}`;
      const successUrl = `${baseUrl}/book/${artist.subdomain}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/book/${artist.subdomain}?cancelled=true`;
      
      const { url, sessionId } = await stripeService.createBookingCheckoutSession(
        artist,
        updatedLock,
        successUrl,
        cancelUrl
      );
      
      res.json({
        success: true,
        checkoutUrl: url,
        sessionId,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Legacy booking endpoint (for backward compatibility)
  app.post("/api/public/artist/:subdomain/book", async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtistBySubdomain(req.params.subdomain);
      
      if (!artist || !artist.isActive || !artist.isApproved) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Validate request body
      const parseResult = createBookingRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: fromError(parseResult.error).message });
      }
      
      const { lockId, customerName, customerEmail, customerPhone, customerInstagram, slotDatetime, notes } = parseResult.data;
      
      // Verify lock if provided
      if (lockId) {
        const lock = await storage.getBookingLock(lockId);
        if (!lock) {
          return res.status(404).json({ message: "Booking lock not found" });
        }
        if (lock.status !== "pending") {
          return res.status(409).json({ message: "Booking lock is no longer valid" });
        }
        if (new Date(lock.expiresAt) < new Date()) {
          return res.status(409).json({ message: "Booking lock has expired" });
        }
        
        await storage.confirmBookingLock(lockId);
      } else {
        const isAvailable = await storage.isSlotAvailable(artist.id, new Date(slotDatetime));
        if (!isAvailable) {
          return res.status(409).json({ message: "This time slot is no longer available" });
        }
      }
      
      // Create booking with studioId for multi-tenant isolation
      const booking = await storage.createBooking({
        artistId: artist.id,
        studioId: artist.studioId || undefined,
        lockId,
        customerName,
        customerEmail,
        customerPhone,
        customerInstagram,
        slotDatetime: new Date(slotDatetime),
        depositAmount: artist.depositAmount || "100",
        currency: artist.currency || "EUR",
        notes,
        status: "confirmed",
      });
      
      // Create deposit with 68/30/2 split and studioId
      const depositAmount = Number(artist.depositAmount || 100);
      const platformFee = depositAmount * PLATFORM_FEE_PERCENTAGE; // 30%
      const artistAmountCalc = depositAmount * ARTIST_PERCENTAGE; // 68%
      const vendorAmountCalc = depositAmount * VENDOR_PERCENTAGE; // 2%
      const retentionUntil = new Date();
      retentionUntil.setDate(retentionUntil.getDate() + DEPOSIT_RETENTION_DAYS);
      
      await storage.createDeposit({
        artistId: artist.id,
        studioId: artist.studioId || undefined,
        bookingId: booking.id,
        amount: depositAmount.toFixed(2),
        currency: artist.currency || "EUR",
        platformFee: platformFee.toFixed(2),
        artistAmount: artistAmountCalc.toFixed(2),
        vendorAmount: vendorAmountCalc.toFixed(2),
        isRefundable: false,
        status: "held",
        retentionUntil,
      });
      
      res.json({
        success: true,
        bookingId: booking.id,
        depositAmount: depositAmount.toFixed(2),
        currency: artist.currency || "EUR",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/publishable-key", async (req: Request, res: Response) => {
    try {
      const configured = await isStripeConfigured();
      if (!configured) {
        return res.json({ configured: false });
      }
      const key = await stripeService.getPublishableKey();
      res.json({ configured: true, publishableKey: key });
    } catch (error) {
      console.error("Error getting Stripe key:", error);
      res.status(500).json({ message: "Failed to get Stripe configuration" });
    }
  });

  // ==================== STUDIO API ROUTES (CEO only) ====================
  
  // Get all studios
  app.get("/api/ceo/studios", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      const allStudios = await storage.getAllStudios();
      res.json(allStudios);
    } catch (error) {
      console.error("Error fetching studios:", error);
      res.status(500).json({ message: "Failed to fetch studios" });
    }
  });

  // Create studio
  app.post("/api/ceo/studios", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { name, slug, description, address, city, country, primaryColor } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      const studio = await storage.createStudio({
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        description,
        address,
        city,
        country,
        primaryColor: primaryColor || "#C9A227",
        ownerId: user.id,
      });
      res.json(studio);
    } catch (error) {
      console.error("Error creating studio:", error);
      res.status(500).json({ message: "Failed to create studio" });
    }
  });

  // Update studio
  app.patch("/api/ceo/studios/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      const studio = await storage.updateStudio(req.params.id, req.body);
      if (!studio) {
        return res.status(404).json({ message: "Studio not found" });
      }
      res.json(studio);
    } catch (error) {
      console.error("Error updating studio:", error);
      res.status(500).json({ message: "Failed to update studio" });
    }
  });

  // Delete studio
  app.delete("/api/ceo/studios/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteStudio(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting studio:", error);
      res.status(500).json({ message: "Failed to delete studio" });
    }
  });

  // ==================== CONNECTED ACCOUNTS API ROUTES ====================
  
  // Get user's connected accounts
  app.get("/api/accounts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const accounts = await storage.getConnectedAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
      res.status(500).json({ message: "Failed to fetch connected accounts" });
    }
  });

  // Create connected account
  app.post("/api/accounts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { provider, accountName, accountEmail, accountId, iban, bic, currency } = req.body;
      
      if (!provider) {
        return res.status(400).json({ message: "Provider is required" });
      }
      
      const account = await storage.createConnectedAccount({
        userId,
        provider,
        accountName,
        accountEmail,
        accountId,
        iban,
        bic,
        currency: currency || "EUR",
      });
      res.json(account);
    } catch (error) {
      console.error("Error creating connected account:", error);
      res.status(500).json({ message: "Failed to create connected account" });
    }
  });

  // Update connected account
  app.patch("/api/accounts/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const account = await storage.getConnectedAccount(req.params.id);
      if (!account || account.userId !== (req.user as any).id) {
        return res.status(404).json({ message: "Account not found" });
      }
      const updated = await storage.updateConnectedAccount(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating connected account:", error);
      res.status(500).json({ message: "Failed to update connected account" });
    }
  });

  // Delete connected account
  app.delete("/api/accounts/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const account = await storage.getConnectedAccount(req.params.id);
      if (!account || account.userId !== (req.user as any).id) {
        return res.status(404).json({ message: "Account not found" });
      }
      await storage.deleteConnectedAccount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting connected account:", error);
      res.status(500).json({ message: "Failed to delete connected account" });
    }
  });

  // Set default connected account
  app.post("/api/accounts/:id/default", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const account = await storage.getConnectedAccount(req.params.id);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }
      await storage.setDefaultConnectedAccount(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default account:", error);
      res.status(500).json({ message: "Failed to set default account" });
    }
  });

  // ==================== PAYOUT REQUEST API ROUTES ====================
  
  // Get user's payout requests
  app.get("/api/payouts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const payouts = await storage.getPayoutRequests(userId);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      res.status(500).json({ message: "Failed to fetch payout requests" });
    }
  });

  // Get available balance
  app.get("/api/balance", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      // Coordinators cannot request payouts
      if (user?.role === USER_ROLES.COORDINATOR) {
        return res.json({ availableBalance: 0, canRequestPayout: false, reason: "Coordinators cannot request payouts" });
      }
      
      const availableBalance = await storage.getUserAvailableBalance(userId);
      res.json({ availableBalance, canRequestPayout: availableBalance > 0 });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // Request payout
  app.post("/api/payouts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      // Coordinators cannot request payouts
      if (user?.role === USER_ROLES.COORDINATOR) {
        return res.status(403).json({ message: "Coordinators cannot request payouts" });
      }
      
      const { amount, connectedAccountId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      // Check available balance
      const availableBalance = await storage.getUserAvailableBalance(userId);
      if (amount > availableBalance) {
        return res.status(400).json({ message: "Insufficient available balance" });
      }
      
      const payout = await storage.createPayoutRequest({
        userId,
        connectedAccountId,
        amount: amount.toFixed(2),
        currency: user?.preferredCurrency || "EUR",
        status: "requested",
      });
      
      res.json(payout);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // CEO: Get all payout requests
  app.get("/api/ceo/payouts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      const payouts = await storage.getAllPayoutRequests();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching all payout requests:", error);
      res.status(500).json({ message: "Failed to fetch payout requests" });
    }
  });

  // CEO: Get pending payout requests
  app.get("/api/ceo/payouts/pending", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      const payouts = await storage.getPendingPayoutRequests();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching pending payout requests:", error);
      res.status(500).json({ message: "Failed to fetch pending payout requests" });
    }
  });

  // CEO: Approve payout request
  app.post("/api/ceo/payouts/:id/approve", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const payout = await storage.getPayoutRequest(req.params.id);
      if (!payout) {
        return res.status(404).json({ message: "Payout request not found" });
      }
      if (payout.status !== "requested") {
        return res.status(400).json({ message: "Payout is not in requested status" });
      }
      
      const approved = await storage.approvePayoutRequest(req.params.id, user.id);
      res.json(approved);
    } catch (error) {
      console.error("Error approving payout:", error);
      res.status(500).json({ message: "Failed to approve payout" });
    }
  });

  // CEO: Execute payout (mark as paid)
  app.post("/api/ceo/payouts/:id/execute", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const payout = await storage.getPayoutRequest(req.params.id);
      if (!payout) {
        return res.status(404).json({ message: "Payout request not found" });
      }
      if (payout.status !== "approved") {
        return res.status(400).json({ message: "Payout must be approved first" });
      }
      
      // Mark as processing, then paid
      await storage.updatePayoutRequestStatus(req.params.id, "processing");
      const executed = await storage.updatePayoutRequestStatus(req.params.id, "paid");
      res.json(executed);
    } catch (error) {
      console.error("Error executing payout:", error);
      res.status(500).json({ message: "Failed to execute payout" });
    }
  });

  // CEO: Reject/cancel payout
  app.post("/api/ceo/payouts/:id/reject", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (user?.role !== USER_ROLES.CEO) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { reason } = req.body;
      const rejected = await storage.updatePayoutRequestStatus(req.params.id, "cancelled", reason || "Rejected by admin");
      res.json(rejected);
    } catch (error) {
      console.error("Error rejecting payout:", error);
      res.status(500).json({ message: "Failed to reject payout" });
    }
  });

  return httpServer;
}
