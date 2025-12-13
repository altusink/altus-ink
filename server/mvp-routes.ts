/**
 * ALTUS INK MVP - SIMPLIFIED API ROUTES
 * 
 * Core endpoints only:
 * - Public artist listing and profiles
 * - Booking creation and management
 * - Artist authentication and dashboard
 * - Stripe webhooks
 */

import { Router, Request, Response, NextFunction } from "express";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "../shared/mvp-schema";
import bcrypt from "bcrypt";
import { bookingService, emailService, stripeService } from "./services";

// =============================================================================
// MIDDLEWARE
// =============================================================================

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
};

// =============================================================================
// ROUTES
// =============================================================================

export function registerRoutes(app: Router) {

    // ===========================================================================
    // PUBLIC ROUTES
    // ===========================================================================

    /**
     * GET /api/health
     * Health check for Railway
     */
    app.get("/api/health", (req: Request, res: Response) => {
        res.json({ status: "ok", timestamp: Date.now() });
    });

    /**
     * GET /api/artists
     * List all active artists
     */
    app.get("/api/artists", asyncHandler(async (req: Request, res: Response) => {
        const { city, search, limit = "20", offset = "0" } = req.query;

        let conditions = [eq(schema.artists.isActive, true)];

        if (city) {
            conditions.push(eq(schema.artists.city, String(city)));
        }

        const artists = await db
            .select({
                id: schema.artists.id,
                username: schema.artists.username,
                displayName: schema.artists.displayName,
                bio: schema.artists.bio,
                specialty: schema.artists.specialty,
                city: schema.artists.city,
                country: schema.artists.country,
                coverImageUrl: schema.artists.coverImageUrl,
                profileImageUrl: schema.artists.profileImageUrl,
                instagram: schema.artists.instagram,
                isVerified: schema.artists.isVerified,
            })
            .from(schema.artists)
            .where(and(...conditions))
            .limit(Number(limit))
            .offset(Number(offset))
            .orderBy(desc(schema.artists.isVerified), desc(schema.artists.createdAt));

        res.json({ items: artists });
    }));

    /**
     * GET /api/artists/:username
     * Get artist profile with portfolio
     */
    app.get("/api/artists/:username", asyncHandler(async (req: Request, res: Response) => {
        const { username } = req.params;

        const artist = await db.query.artists.findFirst({
            where: and(
                eq(schema.artists.username, username),
                eq(schema.artists.isActive, true)
            )
        });

        if (!artist) {
            return res.status(404).json({ error: "Artist not found" });
        }

        // Get portfolio images
        const portfolioImages = await db
            .select()
            .from(schema.portfolioImages)
            .where(eq(schema.portfolioImages.artistId, artist.id))
            .orderBy(desc(schema.portfolioImages.isFeatured), schema.portfolioImages.order);

        res.json({
            ...artist,
            portfolioImages
        });
    }));

    /**
     * GET /api/artists/:id/availability
     * Get available time slots for booking
     */
    app.get("/api/artists/:id/availability", asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: "Date parameter required" });
        }

        const availability = await bookingService.getAvailability({
            artistId: id,
            date: new Date(String(date))
        });

        res.json(availability);
    }));

    // ===========================================================================
    // BOOKING ROUTES
    // ===========================================================================

    /**
     * POST /api/bookings
     * Create a new booking with payment
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
            tattooDescription
        } = req.body;

        // Validate required fields
        if (!artistId || !customerName || !customerEmail || !slotDatetime || !durationMinutes) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get artist for deposit amount
        const artist = await db.query.artists.findFirst({
            where: eq(schema.artists.id, artistId)
        });

        if (!artist) {
            return res.status(404).json({ error: "Artist not found" });
        }

        const depositAmount = Number(artist.depositAmount);

        // Create booking
        const result = await bookingService.createBooking({
            artistId,
            customerName,
            customerEmail,
            customerPhone,
            slotDatetime: new Date(slotDatetime),
            durationMinutes,
            depositAmount,
            currency: artist.currency || "EUR",
            notes,
            referenceImages: []
        });

        res.status(201).json(result);
    }));

    /**
     * GET /api/bookings/:id
     * Get booking details
     */
    app.get("/api/bookings/:id", asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const booking = await db.query.bookings.findFirst({
            where: eq(schema.bookings.id, id)
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json(booking);
    }));

    // ===========================================================================
    // AUTHENTICATION ROUTES
    // ===========================================================================

    /**
     * POST /api/auth/register
     * Register new artist account
     */
    app.post("/api/auth/register", asyncHandler(async (req: Request, res: Response) => {
        const {
            email,
            password,
            firstName,
            lastName,
            displayName,
            username,
            city,
            country
        } = req.body;

        // Validate
        const validation = schema.registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        // Check if email exists
        const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.email, email)
        });

        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        // Check if username exists
        const existingArtist = await db.query.artists.findFirst({
            where: eq(schema.artists.username, username)
        });

        if (existingArtist) {
            return res.status(409).json({ error: "Username already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [user] = await db.insert(schema.users).values({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: "artist"
        }).returning();

        // Create artist profile
        const [artist] = await db.insert(schema.artists).values({
            userId: user.id,
            displayName,
            username,
            city,
            country
        }).returning();

        res.status(201).json({
            user: { id: user.id, email: user.email, firstName: user.firstName },
            artist: { id: artist.id, username: artist.username, displayName: artist.displayName }
        });
    }));

    /**
     * POST /api/auth/login
     * Login artist
     */
    app.post("/api/auth/login", asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const validation = schema.loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        const user = await db.query.users.findFirst({
            where: eq(schema.users.email, email)
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Set session (assuming passport is configured)
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: "Login failed" });
            }
            res.json({ user: { id: user.id, email: user.email, role: user.role } });
        });
    }));

    /**
     * POST /api/auth/logout
     * Logout
     */
    app.post("/api/auth/logout", (req: Request, res: Response) => {
        req.logout(() => {
            res.json({ success: true });
        });
    });

    /**
     * GET /api/auth/me
     * Get current user
     */
    app.get("/api/auth/me", requireAuth, asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as any;

        const artist = await db.query.artists.findFirst({
            where: eq(schema.artists.userId, user.id)
        });

        res.json({
            user: { id: user.id, email: user.email, role: user.role },
            artist
        });
    }));

    // ===========================================================================
    // ARTIST DASHBOARD ROUTES
    // ===========================================================================

    /**
     * GET /api/dashboard/bookings
     * Get artist's bookings
     */
    app.get("/api/dashboard/bookings", requireAuth, asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as any;

        const artist = await db.query.artists.findFirst({
            where: eq(schema.artists.userId, user.id)
        });

        if (!artist) {
            return res.status(404).json({ error: "Artist profile not found" });
        }

        const bookings = await db
            .select()
            .from(schema.bookings)
            .where(eq(schema.bookings.artistId, artist.id))
            .orderBy(desc(schema.bookings.slotDatetime))
            .limit(50);

        res.json({ items: bookings });
    }));

    /**
     * PATCH /api/dashboard/profile
     * Update artist profile
     */
    app.patch("/api/dashboard/profile", requireAuth, asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as any;
        const updates = req.body;

        const artist = await db.query.artists.findFirst({
            where: eq(schema.artists.userId, user.id)
        });

        if (!artist) {
            return res.status(404).json({ error: "Artist profile not found" });
        }

        // Validate updates
        const validation = schema.updateArtistProfileSchema.safeParse(updates);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        // Update
        const [updated] = await db
            .update(schema.artists)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(schema.artists.id, artist.id))
            .returning();

        res.json(updated);
    }));

    /**
     * POST /api/dashboard/portfolio
     * Upload portfolio image
     */
    app.post("/api/dashboard/portfolio", requireAuth, asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as any;
        const { imageUrl, title, description } = req.body;

        const artist = await db.query.artists.findFirst({
            where: eq(schema.artists.userId, user.id)
        });

        if (!artist) {
            return res.status(404).json({ error: "Artist profile not found" });
        }

        const [image] = await db
            .insert(schema.portfolioImages)
            .values({
                artistId: artist.id,
                imageUrl,
                title,
                description
            })
            .returning();

        res.status(201).json(image);
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
            // Handle webhook (this would call stripe service)
            // For now, just acknowledge
            res.json({ received: true });
        } catch (error: any) {
            console.error("Webhook error:", error);
            res.status(400).json({ error: error.message });
        }
    }));

    // ===========================================================================
    // ERROR HANDLER
    // ===========================================================================

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("API Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    });
}
