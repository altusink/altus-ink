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
  DEPOSIT_RETENTION_DAYS,
  BOOKING_LOCK_DURATION_MS,
} from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

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
        durationHours: parseInt(durationHours),
        depositAmount,
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

  // Create booking (process payment)
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
        
        // Mark lock as confirmed
        await storage.confirmBookingLock(lockId);
      } else {
        // Check slot availability if no lock
        const isAvailable = await storage.isSlotAvailable(
          artist.id,
          new Date(slotDatetime)
        );
        if (!isAvailable) {
          return res.status(409).json({ message: "This time slot is no longer available" });
        }
      }
      
      // Create booking
      const booking = await storage.createBooking({
        artistId: artist.id,
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
      
      // Create deposit record with proper 70/30 split
      const depositAmount = Number(artist.depositAmount || 100);
      const platformFee = depositAmount * PLATFORM_FEE_PERCENTAGE; // 30% platform fee
      const artistAmount = depositAmount * (1 - PLATFORM_FEE_PERCENTAGE); // 70% to artist
      
      // Calculate retention date (90 days from now)
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
      
      // Return success (in production, this would return a Stripe checkout URL)
      res.json({
        success: true,
        bookingId: booking.id,
        depositAmount: depositAmount.toFixed(2),
        currency: artist.currency || "EUR",
        // In production: checkoutUrl: stripeSession.url
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  return httpServer;
}
