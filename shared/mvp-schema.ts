import { sql } from "drizzle-orm";
import {
    pgTable,
    text,
    varchar,
    boolean,
    timestamp,
    decimal,
    integer,
    jsonb,
    index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * ALTUS INK MVP - SIMPLIFIED SCHEMA
 * 
 * Core tables only:
 * - users: Basic authentication
 * - artists: Artist profiles
 * - portfolio_images: Gallery photos
 * - bookings: Confirmed bookings
 * - payments: Stripe payment records
 */

// =============================================================================
// USERS - Basic authentication
// =============================================================================

export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    role: varchar("role", { length: 20 }).notNull().default("artist"), // artist, admin
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// ARTISTS - Artist profiles
// =============================================================================

export const artists = pgTable(
    "artists",
    {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),

        // Basic info
        displayName: varchar("display_name", { length: 100 }).notNull(),
        username: varchar("username", { length: 50 }).unique().notNull(),
        bio: text("bio"),

        // Location
        city: varchar("city", { length: 100 }),
        country: varchar("country", { length: 100 }),

        // Specialty
        specialty: varchar("specialty", { length: 100 }), // e.g., "Blackwork", "Realism"

        // Contact
        instagram: varchar("instagram", { length: 100 }),
        phone: varchar("phone", { length: 50 }),

        // Images
        profileImageUrl: varchar("profile_image_url"),
        coverImageUrl: varchar("cover_image_url"),

        // Booking settings
        depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull().default("100.00"),
        currency: varchar("currency", { length: 3 }).default("EUR"),
        timezone: varchar("timezone", { length: 50 }).default("Europe/Berlin"),

        // Stripe
        stripeAccountId: varchar("stripe_account_id"),

        // Status
        isActive: boolean("is_active").default(true),
        isVerified: boolean("is_verified").default(false),

        // Timestamps
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (table) => [
        index("idx_artists_username").on(table.username),
        index("idx_artists_city").on(table.city),
    ]
);

// =============================================================================
// PORTFOLIO IMAGES - Artist gallery
// =============================================================================

export const portfolioImages = pgTable(
    "portfolio_images",
    {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),

        // Image data
        imageUrl: text("image_url").notNull(),
        thumbnailUrl: text("thumbnail_url"),

        // Metadata
        title: varchar("title", { length: 200 }),
        description: text("description"),

        // Display
        order: integer("order").default(0),
        isFeatured: boolean("is_featured").default(false),

        // Timestamps
        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => [
        index("idx_portfolio_artist").on(table.artistId),
        index("idx_portfolio_order").on(table.order),
    ]
);

// =============================================================================
// BOOKINGS - Confirmed bookings
// =============================================================================

export const bookings = pgTable(
    "bookings",
    {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),

        // Customer info
        customerName: varchar("customer_name", { length: 200 }).notNull(),
        customerEmail: varchar("customer_email", { length: 255 }).notNull(),
        customerPhone: varchar("customer_phone", { length: 50 }),
        customerInstagram: varchar("customer_instagram", { length: 100 }),

        // Booking details
        slotDatetime: timestamp("slot_datetime").notNull(),
        durationMinutes: integer("duration_minutes").default(60),
        notes: text("notes"),

        // Tattoo details
        tattooDescription: text("tattoo_description"),
        referenceImageUrl: text("reference_image_url"),

        // Payment
        depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(),
        currency: varchar("currency", { length: 3 }).default("EUR"),

        // Status
        status: varchar("status", { length: 20 }).default("confirmed"), // confirmed, completed, cancelled
        paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, succeeded, failed

        // Timestamps
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (table) => [
        index("idx_bookings_artist").on(table.artistId),
        index("idx_bookings_datetime").on(table.slotDatetime),
        index("idx_bookings_email").on(table.customerEmail),
    ]
);

// =============================================================================
// PAYMENTS - Stripe payment records
// =============================================================================

export const payments = pgTable(
    "payments",
    {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        bookingId: varchar("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull(),
        artistId: varchar("artist_id").references(() => artists.id),

        // Payment details
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        currency: varchar("currency", { length: 3 }).default("EUR"),

        // Stripe
        stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
        stripeCheckoutSessionId: varchar("stripe_checkout_session_id"),

        // Status
        status: varchar("status", { length: 20 }).default("pending"), // pending, succeeded, failed, refunded

        // Error handling
        errorMessage: text("error_message"),

        // Metadata
        metadata: jsonb("metadata").default({}),

        // Timestamps
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (table) => [
        index("idx_payments_booking").on(table.bookingId),
        index("idx_payments_stripe_intent").on(table.stripePaymentIntentId),
    ]
);

// =============================================================================
// INSERT SCHEMAS
// =============================================================================

export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertArtistSchema = createInsertSchema(artists).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertPortfolioImageSchema = createInsertSchema(portfolioImages).omit({
    id: true,
    createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

// =============================================================================
// TYPES
// =============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;

export type PortfolioImage = typeof portfolioImages.$inferSelect;
export type InsertPortfolioImage = z.infer<typeof insertPortfolioImageSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(2, "First name required"),
    lastName: z.string().min(2, "Last name required"),
    displayName: z.string().min(2, "Display name required"),
    username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Username must be lowercase letters, numbers, and hyphens only"),
    city: z.string().min(2, "City required"),
    country: z.string().min(2, "Country required"),
});

export const bookingFormSchema = z.object({
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    customerEmail: z.string().email("Please enter a valid email"),
    customerPhone: z.string().optional(),
    customerInstagram: z.string().optional(),
    slotDatetime: z.string(),
    durationMinutes: z.number().min(30).max(480),
    notes: z.string().optional(),
    tattooDescription: z.string().optional(),
});

export const updateArtistProfileSchema = z.object({
    displayName: z.string().min(2).optional(),
    bio: z.string().max(1000).optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    specialty: z.string().optional(),
    instagram: z.string().optional(),
    phone: z.string().optional(),
    depositAmount: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type UpdateArtistProfileData = z.infer<typeof updateArtistProfileSchema>;
