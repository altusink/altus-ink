import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  decimal,
  integer,
  time,
  date,
  jsonb,
  index,
  inet,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User profiles - extends Replit Auth users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  role: varchar("role", { length: 20 }).notNull().default("artist"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Artists - multi-tenant profiles
export const artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  subdomain: varchar("subdomain", { length: 50 }).unique().notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  bio: text("bio"),
  instagram: varchar("instagram", { length: 100 }),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull().default("100.00"),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  timezone: varchar("timezone", { length: 50 }).default("Europe/Berlin"),
  tourModeEnabled: boolean("tour_mode_enabled").default(false),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  stripeAccountId: varchar("stripe_account_id"),
  themeColor: varchar("theme_color", { length: 7 }).default("#F59E0B"),
  fontPreset: varchar("font_preset", { length: 50 }).default("Inter"),
  coverImageUrl: varchar("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Artist availability schedule
export const artistAvailability = pgTable("artist_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  slotDurationMinutes: integer("slot_duration_minutes").default(60),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// City schedule for tour mode
export const citySchedule = pgTable("city_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  countryCode: varchar("country_code", { length: 3 }),
  fullAddress: text("full_address").notNull(),
  venueName: varchar("venue_name", { length: 200 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  addressVisibleAfterPayment: boolean("address_visible_after_payment").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking locks - 10-minute hold system
export const bookingLocks = pgTable(
  "booking_locks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
    slotDatetime: timestamp("slot_datetime").notNull(),
    durationMinutes: integer("duration_minutes").default(60),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerName: varchar("customer_name", { length: 200 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }),
    customerInstagram: varchar("customer_instagram", { length: 100 }),
    referenceImageUrl: text("reference_image_url"),
    tattooDescription: text("tattoo_description"),
    authorizePortfolio: boolean("authorize_portfolio").default(false),
    confirmationChannel: varchar("confirmation_channel", { length: 20 }).default("whatsapp"),
    depositValueId: varchar("deposit_value_id"),
    paymentIntentId: varchar("payment_intent_id"),
    status: varchar("status", { length: 20 }).default("pending"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("idx_locks_expires").on(table.expiresAt)]
);

// Confirmed bookings
export const bookings = pgTable(
  "bookings",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
    lockId: varchar("lock_id").references(() => bookingLocks.id),
    cityScheduleId: varchar("city_schedule_id").references(() => citySchedule.id),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerName: varchar("customer_name", { length: 200 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }),
    customerInstagram: varchar("customer_instagram", { length: 100 }),
    referenceImageUrl: text("reference_image_url"),
    tattooDescription: text("tattoo_description"),
    authorizePortfolio: boolean("authorize_portfolio").default(false),
    slotDatetime: timestamp("slot_datetime").notNull(),
    durationMinutes: integer("duration_minutes").default(60),
    depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("EUR"),
    status: varchar("status", { length: 20 }).default("confirmed"),
    notes: text("notes"),
    resultPhotoUrl: text("result_photo_url"),
    ratingStars: integer("rating_stars"),
    ratingText: text("rating_text"),
    addedToPortfolio: boolean("added_to_portfolio").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_bookings_artist_date").on(table.artistId, table.slotDatetime)]
);

// Payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").references(() => artists.id),
  bookingId: varchar("booking_id").references(() => bookings.id),
  lockId: varchar("lock_id").references(() => bookingLocks.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  paymentMethod: varchar("payment_method", { length: 50 }).default("stripe"),
  paymentIntentId: varchar("payment_intent_id").unique(),
  status: varchar("status", { length: 20 }).default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Deposits with 90-day retention
export const deposits = pgTable(
  "deposits",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    paymentId: varchar("payment_id").references(() => payments.id),
    artistId: varchar("artist_id").references(() => artists.id),
    bookingId: varchar("booking_id").references(() => bookings.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("EUR"),
    platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(), // 30%
    artistAmount: decimal("artist_amount", { precision: 10, scale: 2 }).notNull(), // 70%
    isRefundable: boolean("is_refundable").default(false),
    status: varchar("status", { length: 20 }).default("held"),
    retentionUntil: timestamp("retention_until"),
    releasedAt: timestamp("released_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("idx_deposits_retention").on(table.retentionUntil)]
);

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  artistId: varchar("artist_id").references(() => artists.id),
  bookingId: varchar("booking_id").references(() => bookings.id),
  type: varchar("type", { length: 20 }).notNull(),
  template: varchar("template", { length: 100 }).notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  data: jsonb("data").default({}),
  status: varchar("status", { length: 20 }).default("pending"),
  attempts: integer("attempts").default(0),
  sentAt: timestamp("sent_at"),
  scheduledFor: timestamp("scheduled_for").defaultNow(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial ledger
export const financialLedger = pgTable("financial_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").references(() => artists.id),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  description: text("description"),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: varchar("reference_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit log for GDPR compliance
export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  artistId: varchar("artist_id"),
  action: varchar("action", { length: 100 }).notNull(),
  tableName: varchar("table_name", { length: 100 }),
  recordId: varchar("record_id"),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Global settings
export const globalSettings = pgTable("global_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio categories
export const portfolioCategories = pgTable("portfolio_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio photos (max 20 per category enforced in application)
export const portfolioPhotos = pgTable(
  "portfolio_photos",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    categoryId: varchar("category_id").references(() => portfolioCategories.id, { onDelete: "cascade" }).notNull(),
    artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
    photoUrl: text("photo_url").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0),
    fromBookingId: varchar("from_booking_id").references(() => bookings.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("idx_photos_category").on(table.categoryId)]
);

// Deposit values by duration
export const depositValues = pgTable("deposit_values", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  durationHours: integer("duration_hours").notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor goals
export const vendorGoals = pgTable(
  "vendor_goals",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    vendorId: varchar("vendor_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    setBy: varchar("set_by").references(() => users.id),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    goalAmount: decimal("goal_amount", { precision: 10, scale: 2 }).notNull(),
    achievedAmount: decimal("achieved_amount", { precision: 10, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("idx_vendor_goals").on(table.vendorId, table.year, table.month)]
);

// Vendor commissions (2%)
export const vendorCommissions = pgTable("vendor_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("2.00"),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Waiting list
export const waitingList = pgTable(
  "waiting_list",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    artistId: varchar("artist_id").references(() => artists.id, { onDelete: "cascade" }).notNull(),
    cityScheduleId: varchar("city_schedule_id").references(() => citySchedule.id),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    desiredDurationHours: integer("desired_duration_hours").notNull(),
    status: varchar("status", { length: 20 }).default("waiting"),
    notifiedAt: timestamp("notified_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("idx_waiting_list").on(table.artistId, table.status)]
);

// Email templates
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateKey: varchar("template_key", { length: 100 }).unique().notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  htmlBody: text("html_body").notNull(),
  variables: text("variables").array(),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Terms acceptance
export const termsAcceptance = pgTable("terms_acceptance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  clientEmail: varchar("client_email", { length: 255 }),
  termType: varchar("term_type", { length: 50 }).notNull(),
  version: varchar("version", { length: 20 }).default("v1.0"),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  acceptedAt: timestamp("accepted_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  artist: one(artists, {
    fields: [users.id],
    references: [artists.userId],
  }),
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, {
    fields: [artists.userId],
    references: [users.id],
  }),
  availability: many(artistAvailability),
  citySchedules: many(citySchedule),
  bookings: many(bookings),
  deposits: many(deposits),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  artist: one(artists, {
    fields: [bookings.artistId],
    references: [artists.id],
  }),
  citySchedule: one(citySchedule, {
    fields: [bookings.cityScheduleId],
    references: [citySchedule.id],
  }),
}));

// Insert schemas
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

export const insertAvailabilitySchema = createInsertSchema(artistAvailability).omit({
  id: true,
  createdAt: true,
});

export const insertCityScheduleSchema = createInsertSchema(citySchedule).omit({
  id: true,
  createdAt: true,
});

export const insertBookingLockSchema = createInsertSchema(bookingLocks).omit({
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
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioCategorySchema = createInsertSchema(portfolioCategories).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioPhotoSchema = createInsertSchema(portfolioPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertDepositValueSchema = createInsertSchema(depositValues).omit({
  id: true,
  createdAt: true,
});

export const insertVendorGoalSchema = createInsertSchema(vendorGoals).omit({
  id: true,
  createdAt: true,
});

export const insertVendorCommissionSchema = createInsertSchema(vendorCommissions).omit({
  id: true,
  createdAt: true,
});

export const insertWaitingListSchema = createInsertSchema(waitingList).omit({
  id: true,
  createdAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof artistAvailability.$inferSelect;
export type InsertCitySchedule = z.infer<typeof insertCityScheduleSchema>;
export type CitySchedule = typeof citySchedule.$inferSelect;
export type InsertBookingLock = z.infer<typeof insertBookingLockSchema>;
export type BookingLock = typeof bookingLocks.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type FinancialLedger = typeof financialLedger.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;
export type GlobalSetting = typeof globalSettings.$inferSelect;
export type InsertPortfolioCategory = z.infer<typeof insertPortfolioCategorySchema>;
export type PortfolioCategory = typeof portfolioCategories.$inferSelect;
export type InsertPortfolioPhoto = z.infer<typeof insertPortfolioPhotoSchema>;
export type PortfolioPhoto = typeof portfolioPhotos.$inferSelect;
export type InsertDepositValue = z.infer<typeof insertDepositValueSchema>;
export type DepositValue = typeof depositValues.$inferSelect;
export type InsertVendorGoal = z.infer<typeof insertVendorGoalSchema>;
export type VendorGoal = typeof vendorGoals.$inferSelect;
export type InsertVendorCommission = z.infer<typeof insertVendorCommissionSchema>;
export type VendorCommission = typeof vendorCommissions.$inferSelect;
export type InsertWaitingList = z.infer<typeof insertWaitingListSchema>;
export type WaitingListEntry = typeof waitingList.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type TermsAcceptance = typeof termsAcceptance.$inferSelect;

// Booking form schema for frontend validation
export const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().optional(),
  customerInstagram: z.string().optional(),
  slotDatetime: z.string(),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// API validation schemas
export const createLockSchema = z.object({
  slotDatetime: z.string().datetime(),
  customerEmail: z.string().email(),
  customerName: z.string().min(2),
  customerPhone: z.string().optional(),
});

export const createBookingRequestSchema = z.object({
  lockId: z.string().optional(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerInstagram: z.string().optional(),
  slotDatetime: z.string(),
  notes: z.string().optional(),
});

export const updateArtistSchema = z.object({
  displayName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  instagram: z.string().max(100).optional(),
  depositAmount: z.string().optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  tourModeEnabled: z.boolean().optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  isActive: z.boolean().optional(),
});

export const createCityScheduleRequestSchema = z.object({
  city: z.string().min(2),
  country: z.string().min(2),
  countryCode: z.string().length(2).optional(),
  fullAddress: z.string().min(5),
  venueName: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export const upsertAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMinutes: z.number().min(15).max(480).optional(),
  isActive: z.boolean(),
});

// Deposit status flow: pending -> held -> available -> released
export const DEPOSIT_STATUS = {
  PENDING: "pending",
  HELD: "held",
  AVAILABLE: "available",
  RELEASED: "released",
} as const;

// Lock status flow: pending -> confirmed/expired
export const LOCK_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  EXPIRED: "expired",
} as const;

// Booking status
export const BOOKING_STATUS = {
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

// Platform fee percentage (30%)
export const PLATFORM_FEE_PERCENTAGE = 0.3;

// Deposit retention period (90 days)
export const DEPOSIT_RETENTION_DAYS = 90;

// Booking lock duration (10 minutes)
export const BOOKING_LOCK_DURATION_MS = 10 * 60 * 1000;

// Helper type for deposit with calculated fields
export interface DepositWithProgress extends Deposit {
  daysRemaining: number;
  retentionProgress: number;
  isAvailable: boolean;
}
