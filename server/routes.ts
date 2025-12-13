/**
 * ALTUS INK - API ROUTES
 * Comprehensive API endpoints for bookings, artists, and payments
 * 
 * Endpoints:
 * - /api/public/artists - Public artist listings
 * - /api/bookings - Booking management
 * - /api/artist/* - Artist-specific endpoints
 * - /api/ceo/* - CEO/Admin endpoints
 * - /api/webhooks - Payment webhooks
 */

import { Router, Request, Response, NextFunction } from "express";
import { eq, and, gte, lte, desc, asc, sql, like } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import { stripeService, emailService, bookingService, storageService } from "./services";
import { config } from "./config";

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Require authenticated user
 */
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

/**
 * Require specific role
 */
const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// =============================================================================
// ROUTER
// =============================================================================

export function registerRoutes(app: Router) {

  // ===========================================================================
  // PUBLIC ROUTES
  // ===========================================================================

  /**
   * GET /api/public/artists
   * List all active artists (public)
   */
  app.get("/api/public/artists", asyncHandler(async (req: Request, res: Response) => {
    const { city, style, search, limit = "20", offset = "0" } = req.query;

    const artists = await db
      .select({
        id: schema.artists.id,
        username: schema.artists.username,
        displayName: schema.artists.displayName,
        bio: schema.artists.bio,
        specialty: schema.artists.specialty,
        styles: schema.artists.styles,
        city: schema.artists.city,
        country: schema.artists.country,
        coverImageUrl: schema.artists.coverImageUrl,
        isVerified: schema.artists.isVerified,
        tourModeEnabled: schema.artists.tourModeEnabled,
        instagram: schema.artists.instagram
      })
      .from(schema.artists)
      .where(
        and(
          eq(schema.artists.isActive, true),
          search ? like(schema.artists.displayName, `%${search}%`) : undefined,
          city ? eq(schema.artists.city, String(city)) : undefined
        )
      )
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(desc(schema.artists.isVerified));

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.artists)
      .where(eq(schema.artists.isActive, true));

    res.json({
      items: artists,
      meta: {
        total: countResult[0]?.count || 0,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  }));

  /**
   * GET /api/public/artists/:username
   * Get single artist by username (public)
   */
  app.get("/api/public/artists/:username", asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;

    const artist = await db.query.artists.findFirst({
      where: and(
        eq(schema.artists.username, username),
        eq(schema.artists.isActive, true)
      ),
      with: {
        portfolioImages: {
          orderBy: asc(schema.portfolioImages.order)
        },
        tourLocations: {
          where: eq(schema.tourLocations.isActive, true)
        }
      }
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    // Increment profile views
    await db
      .update(schema.artists)
      .set({
        profileViews: sql`${schema.artists.profileViews} + 1`
      })
      .where(eq(schema.artists.id, artist.id));

    res.json(artist);
  }));

  /**
   * GET /api/public/artists/:id/availability
   * Get artist availability for a date range
   */
  app.get("/api/public/artists/:id/availability", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "start and end dates required" });
    }

    const startDate = new Date(String(start));
    const endDate = new Date(String(end));

    const availability = await bookingService.getAvailableSlots(
      id,
      startDate,
      endDate
    );

    res.json(availability);
  }));

  // ===========================================================================
  // BOOKING ROUTES
  // ===========================================================================

  /**
   * POST /api/bookings
   * Create a new booking (initiates payment)
   */
  app.post("/api/bookings", asyncHandler(async (req: Request, res: Response) => {
    const {
      artistId,
      customerName,
      customerEmail,
      customerPhone,
      slotDatetime,
      durationMinutes,
      notes,
      tattooSize,
      tattooPlacement,
      locale = "en"
    } = req.body;

    // Validate required fields
    if (!artistId || !customerName || !customerEmail || !slotDatetime || !durationMinutes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check availability
    const isAvailable = await bookingService.checkAvailability(
      artistId,
      new Date(slotDatetime),
      durationMinutes
    );

    if (!isAvailable.available) {
      return res.status(409).json({
        error: "Slot not available",
        reason: isAvailable.reason
      });
    }

    // Get artist for deposit calculation
    const artist = await db.query.artists.findFirst({
      where: eq(schema.artists.id, artistId)
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    // Calculate deposit
    const depositAmount = calculateDeposit(artist, durationMinutes);

    // Create booking
    const booking = await bookingService.createBooking({
      artistId,
      customerName,
      customerEmail,
      customerPhone,
      slotDatetime: new Date(slotDatetime),
      durationMinutes,
      notes,
      tattooSize,
      tattooPlacement,
      locale
    });

    // Create Stripe checkout session
    const session = await stripeService.createCheckoutSession({
      bookingId: booking.id,
      amount: depositAmount,
      currency: artist.preferredCurrency || "EUR",
      customerEmail,
      customerName,
      artistName: artist.displayName,
      successUrl: `${config.APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${config.APP_URL}/booking/cancel?booking_id=${booking.id}`
    });

    res.status(201).json({
      booking,
      checkoutUrl: session.url,
      checkoutSessionId: session.id
    });
  }));

  /**
   * GET /api/bookings/:id
   * Get booking details (public with booking ID)
   */
  app.get("/api/bookings/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email } = req.query;

    const booking = await db.query.bookings.findFirst({
      where: eq(schema.bookings.id, id),
      with: {
        artist: {
          columns: {
            displayName: true,
            username: true,
            city: true,
            country: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify email for security (if provided)
    if (email && booking.customerEmail !== email) {
      return res.status(403).json({ error: "Invalid booking access" });
    }

    res.json(booking);
  }));

  /**
   * POST /api/bookings/:id/cancel
   * Cancel a booking
   */
  app.post("/api/bookings/:id/cancel", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, reason } = req.body;

    const booking = await db.query.bookings.findFirst({
      where: eq(schema.bookings.id, id)
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify ownership
    if (booking.customerEmail !== email) {
      return res.status(403).json({ error: "Invalid booking access" });
    }

    // Process cancellation
    const result = await bookingService.cancelBooking(id, "customer", reason);

    res.json(result);
  }));

  // ===========================================================================
  // ARTIST ROUTES (Authenticated)
  // ===========================================================================

  /**
   * GET /api/artist/profile
   * Get current artist profile
   */
  app.get("/api/artist/profile", requireAuth, requireRole("artist"), asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;

    const artist = await db.query.artists.findFirst({
      where: eq(schema.artists.userId, user.id),
      with: {
        portfolioImages: true,
        tourLocations: true
      }
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist profile not found" });
    }

    res.json(artist);
  }));

  /**
   * PATCH /api/artist/profile
   * Update artist profile
   */
  app.patch("/api/artist/profile", requireAuth, requireRole("artist"), asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const updates = req.body;

    // Get current artist
    const artist = await db.query.artists.findFirst({
      where: eq(schema.artists.userId, user.id)
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist profile not found" });
    }

    // Allowed fields to update
    const allowedFields = [
      "displayName", "bio", "specialty", "styles", "city", "country",
      "instagram", "website", "timezone", "bufferMinutes",
      "minAdvanceBookingHours", "maxAdvanceBookingDays", "cancellationPolicy",
      "preferredCurrency", "languages"
    ];

    const filteredUpdates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Update
    await db
      .update(schema.artists)
      .set({ ...filteredUpdates, updatedAt: new Date() })
      .where(eq(schema.artists.id, artist.id));

    const updated = await db.query.artists.findFirst({
      where: eq(schema.artists.id, artist.id)
    });

    res.json(updated);
  }));

  /**
   * GET /api/artist/bookings
   * Get artist's bookings
   */
  app.get("/api/artist/bookings", requireAuth, requireRole("artist"), asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const { status, start, end, limit = "50", offset = "0" } = req.query;

    const artist = await db.query.artists.findFirst({
      where: eq(schema.artists.userId, user.id)
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const conditions = [eq(schema.bookings.artistId, artist.id)];

    if (status) {
      conditions.push(eq(schema.bookings.status, String(status)));
    }
    if (start) {
      conditions.push(gte(schema.bookings.slotDatetime, new Date(String(start))));
    }
    if (end) {
      conditions.push(lte(schema.bookings.slotDatetime, new Date(String(end))));
    }

    const bookings = await db
      .select()
      .from(schema.bookings)
      .where(and(...conditions))
      .orderBy(desc(schema.bookings.slotDatetime))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({ items: bookings });
  }));

  /**
   * POST /api/artist/bookings/:id/confirm
   * Confirm a pending booking
   */
  app.post("/api/artist/bookings/:id/confirm", requireAuth, requireRole("artist"), asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;

    const artist = await db.query.artists.findFirst({
      where: eq(schema.artists.userId, user.id)
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(schema.bookings.id, id),
        eq(schema.bookings.artistId, artist.id)
      )
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const result = await bookingService.confirmBooking(id);
    res.json(result);
  }));

  /**
   * GET /api/artist/earnings
   * Get artist earnings summary
   */
  app.get("/api/artist/earnings", requireAuth, requireRole("artist"), asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const { period = "month" } = req.query;

    const artist = await db.query.artists.findFirst({
      where: eq(schema.artists.userId, user.id)
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const stats = await bookingService.getArtistBookingStats(artist.id);
    const earnings = await getArtistEarnings(artist.id, String(period));

    res.json({
      ...stats,
      earnings
    });
  }));

  /**
   * POST /api/artist/portfolio
   * Upload portfolio image
   */
  app.post("/api/artist/portfolio", requireAuth, requireRole("artist"), asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;

    const artist = await db.query.artists.findFirst({
      where: eq(schema.artists.userId, user.id)
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    // Handle file upload (simplified - real implementation would use multer)
    const { imageData, category } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const buffer = Buffer.from(imageData, "base64");
    const result = await storageService.uploadPortfolioImage(artist.id, buffer, category);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Save to database
    const image = await db
      .insert(schema.portfolioImages)
      .values({
        artistId: artist.id,
        url: result.url!,
        thumbnailUrl: storageService.getThumbnailUrl(result.publicId!),
        publicId: result.publicId!,
        category,
        order: 0 // Would calculate proper order
      })
      .returning();

    res.status(201).json(image[0]);
  }));

  // ===========================================================================
  // CEO ROUTES (Admin only)
  // ===========================================================================

  /**
   * GET /api/ceo/stats
   * Platform-wide statistics
   */
  app.get("/api/ceo/stats", requireAuth, requireRole("ceo", "admin"), asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get booking counts
    const totalBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.bookings);

    const thisMonthBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.bookings)
      .where(gte(schema.bookings.createdAt, startOfMonth));

    // Get revenue
    const totalRevenue = await db
      .select({ sum: sql<number>`sum(${schema.bookings.depositAmount})` })
      .from(schema.bookings)
      .where(eq(schema.bookings.paymentStatus, "succeeded"));

    const thisMonthRevenue = await db
      .select({ sum: sql<number>`sum(${schema.bookings.depositAmount})` })
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.paymentStatus, "succeeded"),
        gte(schema.bookings.createdAt, startOfMonth)
      ));

    const lastMonthRevenue = await db
      .select({ sum: sql<number>`sum(${schema.bookings.depositAmount})` })
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.paymentStatus, "succeeded"),
        gte(schema.bookings.createdAt, startOfLastMonth),
        lte(schema.bookings.createdAt, endOfLastMonth)
      ));

    // Get artist counts
    const artistCounts = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when ${schema.artists.isActive} = true then 1 end)`,
        onTour: sql<number>`count(case when ${schema.artists.tourModeEnabled} = true then 1 end)`
      })
      .from(schema.artists);

    const tmr = thisMonthRevenue[0]?.sum || 0;
    const lmr = lastMonthRevenue[0]?.sum || 0;
    const growth = lmr > 0 ? ((tmr - lmr) / lmr * 100) : 0;

    res.json({
      revenue: {
        total: totalRevenue[0]?.sum || 0,
        thisMonth: tmr,
        lastMonth: lmr,
        growth: growth.toFixed(1)
      },
      bookings: {
        total: totalBookings[0]?.count || 0,
        thisMonth: thisMonthBookings[0]?.count || 0
      },
      artists: artistCounts[0]
    });
  }));

  /**
   * GET /api/ceo/artists
   * List all artists with management data
   */
  app.get("/api/ceo/artists", requireAuth, requireRole("ceo", "admin"), asyncHandler(async (req: Request, res: Response) => {
    const { status, search, limit = "50", offset = "0" } = req.query;

    const conditions = [];
    if (status === "active") {
      conditions.push(eq(schema.artists.isActive, true));
    } else if (status === "inactive") {
      conditions.push(eq(schema.artists.isActive, false));
    }
    if (search) {
      conditions.push(like(schema.artists.displayName, `%${search}%`));
    }

    const artists = await db
      .select()
      .from(schema.artists)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.artists.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({ items: artists });
  }));

  /**
   * PATCH /api/ceo/artists/:id
   * Update artist (admin)
   */
  app.patch("/api/ceo/artists/:id", requireAuth, requireRole("ceo", "admin"), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const artist = await db.query.artists.findFirst({
      where: eq(schema.artists.id, id)
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    await db
      .update(schema.artists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.artists.id, id));

    const updated = await db.query.artists.findFirst({
      where: eq(schema.artists.id, id)
    });

    res.json(updated);
  }));

  /**
   * GET /api/ceo/bookings
   * List all bookings (admin)
   */
  app.get("/api/ceo/bookings", requireAuth, requireRole("ceo", "admin"), asyncHandler(async (req: Request, res: Response) => {
    const { status, artistId, start, end, limit = "50", offset = "0" } = req.query;

    const conditions = [];
    if (status) {
      conditions.push(eq(schema.bookings.status, String(status)));
    }
    if (artistId) {
      conditions.push(eq(schema.bookings.artistId, String(artistId)));
    }
    if (start) {
      conditions.push(gte(schema.bookings.slotDatetime, new Date(String(start))));
    }
    if (end) {
      conditions.push(lte(schema.bookings.slotDatetime, new Date(String(end))));
    }

    const bookings = await db.query.bookings.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.bookings.createdAt)],
      limit: Number(limit),
      offset: Number(offset),
      with: {
        artist: {
          columns: {
            displayName: true,
            username: true
          }
        }
      }
    });

    res.json({ items: bookings });
  }));

  /**
   * POST /api/ceo/payouts/process
   * Process artist payouts
   */
  app.post("/api/ceo/payouts/process", requireAuth, requireRole("ceo", "admin"), asyncHandler(async (req: Request, res: Response) => {
    const { artistIds } = req.body;

    if (!artistIds || !Array.isArray(artistIds) || artistIds.length === 0) {
      return res.status(400).json({ error: "Artist IDs required" });
    }

    const results = [];

    for (const artistId of artistIds) {
      const artist = await db.query.artists.findFirst({
        where: eq(schema.artists.id, artistId)
      });

      if (!artist || !artist.stripeAccountId) {
        results.push({ artistId, success: false, error: "No Stripe account" });
        continue;
      }

      try {
        // Calculate pending amount (simplified)
        const pendingBookings = await db
          .select({ sum: sql<number>`sum(${schema.bookings.depositAmount})` })
          .from(schema.bookings)
          .where(and(
            eq(schema.bookings.artistId, artistId),
            eq(schema.bookings.status, "completed"),
            eq(schema.bookings.paymentStatus, "succeeded")
            // Would also check payout status
          ));

        const amount = pendingBookings[0]?.sum || 0;
        if (amount <= 0) {
          results.push({ artistId, success: false, error: "No pending amount" });
          continue;
        }

        // Calculate artist share (85%)
        const artistAmount = Math.floor(amount * 0.85);

        // Create transfer
        const transfer = await stripeService.createArtistPayout(
          artist.stripeAccountId,
          artistAmount,
          artist.preferredCurrency || "EUR",
          `Payout for ${artist.displayName}`
        );

        results.push({
          artistId,
          success: true,
          transferId: transfer.id,
          amount: artistAmount
        });
      } catch (error: any) {
        results.push({ artistId, success: false, error: error.message });
      }
    }

    res.json({ results });
  }));

  // ===========================================================================
  // WEBHOOK ROUTES
  // ===========================================================================

  /**
   * POST /api/webhooks/stripe
   * Handle Stripe webhooks
   */
  app.post("/api/webhooks/stripe", asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    try {
      const result = await stripeService.handleWebhook(req.body, signature);
      res.json({ received: true, ...result });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: error.message });
    }
  }));

  // ===========================================================================
  // HELPER FUNCTIONS
  // ===========================================================================

  function calculateDeposit(artist: any, durationMinutes: number): number {
    const config = artist.depositRequirement;
    let deposit: number;

    if (config?.type === "fixed") {
      deposit = config.value;
    } else if (config?.type === "percentage") {
      // Estimate booking value based on duration (€75/hour average)
      const estimatedValue = (durationMinutes / 60) * 7500; // cents
      deposit = Math.floor(estimatedValue * (config.value / 100));
    } else {
      // Default: €100 deposit
      deposit = 10000;
    }

    // Apply min/max
    if (config?.minAmount && deposit < config.minAmount) {
      deposit = config.minAmount;
    }
    if (config?.maxAmount && deposit > config.maxAmount) {
      deposit = config.maxAmount;
    }

    return deposit;
  }

  async function getArtistEarnings(artistId: string, period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const earnings = await db
      .select({
        total: sql<number>`sum(${schema.bookings.depositAmount})`,
        count: sql<number>`count(*)`
      })
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.artistId, artistId),
        eq(schema.bookings.paymentStatus, "succeeded"),
        gte(schema.bookings.completedAt, startDate)
      ));

    const total = earnings[0]?.total || 0;
    const artistShare = Math.floor(total * 0.85); // 85% to artist

    return {
      period,
      gross: total,
      commission: total - artistShare,
      net: artistShare,
      bookingsCount: earnings[0]?.count || 0
    };
  }

  return app;
}

export default registerRoutes;
