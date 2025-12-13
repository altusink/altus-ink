/**
 * ALTUS INK - SHARED TYPES
 * Type definitions shared between client and server
 */

// =============================================================================
// USER & AUTHENTICATION
// =============================================================================

export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    displayName?: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type UserRole = "ceo" | "artist" | "customer" | "admin";

export interface AuthSession {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    username: string;
    displayName?: string;
    role?: UserRole;
}

// =============================================================================
// ARTIST
// =============================================================================

export interface Artist {
    id: string;
    userId: string;
    username: string;
    email: string;
    displayName: string;
    bio?: string;
    specialty?: string;
    styles: string[];
    city?: string;
    country?: string;
    timezone: string;
    instagram?: string;
    website?: string;
    coverImageUrl?: string;
    portfolioImages: PortfolioImage[];
    isActive: boolean;
    isVerified: boolean;
    tourModeEnabled: boolean;
    tourLocations: TourLocation[];
    stripeAccountId?: string;
    stripeAccountStatus: StripeAccountStatus;
    commissionRate: number; // Artist percentage (e.g., 85)
    depositRequirement: DepositConfig;
    workingHours: WorkingHours;
    bufferMinutes: number;
    minAdvanceBookingHours: number;
    maxAdvanceBookingDays: number;
    cancellationPolicy: CancellationPolicy;
    preferredCurrency: Currency;
    languages: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PortfolioImage {
    id: string;
    url: string;
    thumbnailUrl: string;
    publicId: string;
    category?: string;
    description?: string;
    order: number;
    createdAt: Date;
}

export interface TourLocation {
    id: string;
    city: string;
    country: string;
    startDate: Date;
    endDate: Date;
    studio?: string;
    address?: string;
    notes?: string;
    isActive: boolean;
}

export interface WorkingHours {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

export interface DaySchedule {
    isWorking: boolean;
    slots: TimeSlot[];
}

export interface TimeSlot {
    start: string; // 24h format: "09:00"
    end: string;   // 24h format: "18:00"
}

export type StripeAccountStatus =
    | "not_connected"
    | "pending"
    | "active"
    | "restricted"
    | "disabled";

export interface DepositConfig {
    type: "fixed" | "percentage";
    value: number; // Fixed amount in cents or percentage
    minAmount: number; // Minimum deposit in cents
    maxAmount?: number; // Maximum deposit in cents
}

export type CancellationPolicy = "flexible" | "moderate" | "strict";

export type Currency = "EUR" | "USD" | "GBP" | "CHF";

// =============================================================================
// BOOKING
// =============================================================================

export interface Booking {
    id: string;
    artistId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    slotDatetime: Date;
    durationMinutes: number;
    depositAmount: number;
    totalAmount?: number;
    currency: Currency;
    status: BookingStatus;
    notes?: string;
    referenceImages?: string[];
    tattooSize?: TattooSize;
    tattooPlacement?: string;
    paymentIntentId?: string;
    paymentStatus: PaymentStatus;
    refundAmount?: number;
    cancellationReason?: string;
    cancelledBy?: "customer" | "artist" | "system";
    cancelledAt?: Date;
    confirmedAt?: Date;
    completedAt?: Date;
    rescheduledFrom?: Date;
    remindersSent: number;
    lastReminderAt?: Date;
    locale: string;
    createdAt: Date;
    updatedAt: Date;
}

export type BookingStatus =
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show"
    | "rescheduled";

export type PaymentStatus =
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "refunded"
    | "partially_refunded";

export type TattooSize =
    | "tiny"      // < 5cm
    | "small"     // 5-10cm
    | "medium"    // 10-20cm
    | "large"     // 20-40cm
    | "extra_large" // > 40cm
    | "full_sleeve"
    | "half_sleeve"
    | "full_back"
    | "other";

export interface BookingCreateInput {
    artistId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    slotDatetime: Date;
    durationMinutes: number;
    notes?: string;
    referenceImages?: string[];
    tattooSize?: TattooSize;
    tattooPlacement?: string;
    locale?: string;
}

export interface TimeSlotAvailability {
    start: Date;
    end: Date;
    available: boolean;
    reason?: string;
}

export interface DayAvailability {
    date: Date;
    slots: TimeSlotAvailability[];
    fullyBooked: boolean;
}

// =============================================================================
// PAYMENT & EARNINGS
// =============================================================================

export interface Payment {
    id: string;
    bookingId: string;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    method: PaymentMethod;
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
    receiptUrl?: string;
    refundId?: string;
    refundReason?: string;
    metadata: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

export type PaymentMethod =
    | "card"
    | "ideal"
    | "bancontact"
    | "sepa_debit"
    | "paypal"
    | "other";

export interface Payout {
    id: string;
    artistId: string;
    amount: number;
    currency: Currency;
    status: PayoutStatus;
    stripeTransferId?: string;
    arrivalDate?: Date;
    description?: string;
    bookingIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

export type PayoutStatus =
    | "pending"
    | "in_transit"
    | "paid"
    | "failed"
    | "cancelled";

export interface EarningsSummary {
    totalEarnings: number;
    thisMonth: number;
    lastMonth: number;
    pendingPayout: number;
    nextPayoutDate: Date;
    currency: Currency;
}

export interface EarningsBreakdown {
    period: string; // "2024-12" or "2024-W50"
    gross: number;
    platformFee: number;
    net: number;
    bookingsCount: number;
}

// =============================================================================
// NOTIFICATION
// =============================================================================

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
}

export type NotificationType =
    | "booking_new"
    | "booking_confirmed"
    | "booking_cancelled"
    | "booking_reminder"
    | "payment_received"
    | "payout_sent"
    | "review_received"
    | "artist_approved"
    | "system";

// =============================================================================
// REVIEW
// =============================================================================

export interface Review {
    id: string;
    bookingId: string;
    artistId: string;
    customerName: string;
    rating: number; // 1-5
    comment?: string;
    response?: string;
    responseAt?: Date;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// =============================================================================
// API RESPONSES
// =============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ApiMeta;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

export interface ApiMeta {
    page?: number;
    perPage?: number;
    total?: number;
    hasMore?: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: Required<Pick<ApiMeta, "page" | "perPage" | "total" | "hasMore">>;
}

// =============================================================================
// STATISTICS
// =============================================================================

export interface ArtistStats {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    completionRate: number;
    totalEarnings: number;
    averageBookingValue: number;
    averageRating: number;
    totalReviews: number;
    profileViews: number;
    portfolioViews: number;
}

export interface PlatformStats {
    totalArtists: number;
    activeArtists: number;
    totalBookings: number;
    totalRevenue: number;
    platformCommission: number;
    totalCustomers: number;
    averageBookingValue: number;
}

export interface RevenueStats {
    period: string;
    total: number;
    byArtist: { artistId: string; amount: number }[];
    byPaymentMethod: { method: PaymentMethod; amount: number }[];
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface BookingFormData {
    artistId: string;
    date: Date;
    timeSlot: string;
    duration: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    notes?: string;
    referenceImages?: File[];
    tattooSize?: TattooSize;
    tattooPlacement?: string;
    agreeToTerms: boolean;
    locale: string;
}

export interface ArtistProfileFormData {
    displayName: string;
    bio: string;
    specialty: string;
    styles: string[];
    city: string;
    country: string;
    instagram?: string;
    website?: string;
}

export interface ArtistSettingsFormData {
    timezone: string;
    workingHours: WorkingHours;
    bufferMinutes: number;
    minAdvanceBookingHours: number;
    maxAdvanceBookingDays: number;
    cancellationPolicy: CancellationPolicy;
    depositRequirement: DepositConfig;
    preferredCurrency: Currency;
    languages: string[];
}
