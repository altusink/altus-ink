/**
 * ALTUS INK - SHARED CONSTANTS
 * Constants shared between client and server
 */

// =============================================================================
// BOOKING CONSTANTS
// =============================================================================

export const BOOKING_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    NO_SHOW: "no_show",
    RESCHEDULED: "rescheduled"
} as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
    rescheduled: "Rescheduled"
};

export const PAYMENT_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    SUCCEEDED: "succeeded",
    FAILED: "failed",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "partially_refunded"
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    succeeded: "Paid",
    failed: "Failed",
    refunded: "Refunded",
    partially_refunded: "Partially Refunded"
};

// =============================================================================
// TATTOO SIZES
// =============================================================================

export const TATTOO_SIZES = {
    TINY: "tiny",
    SMALL: "small",
    MEDIUM: "medium",
    LARGE: "large",
    EXTRA_LARGE: "extra_large",
    FULL_SLEEVE: "full_sleeve",
    HALF_SLEEVE: "half_sleeve",
    FULL_BACK: "full_back",
    OTHER: "other"
} as const;

export const TATTOO_SIZE_LABELS: Record<string, string> = {
    tiny: "Tiny (< 5cm)",
    small: "Small (5-10cm)",
    medium: "Medium (10-20cm)",
    large: "Large (20-40cm)",
    extra_large: "Extra Large (> 40cm)",
    full_sleeve: "Full Sleeve",
    half_sleeve: "Half Sleeve",
    full_back: "Full Back",
    other: "Other"
};

export const TATTOO_SIZE_DURATIONS: Record<string, { min: number; max: number }> = {
    tiny: { min: 30, max: 60 },
    small: { min: 60, max: 120 },
    medium: { min: 120, max: 240 },
    large: { min: 240, max: 480 },
    extra_large: { min: 480, max: 960 },
    full_sleeve: { min: 1440, max: 2880 }, // Multiple sessions
    half_sleeve: { min: 720, max: 1440 },
    full_back: { min: 1440, max: 2880 },
    other: { min: 60, max: 480 }
};

// =============================================================================
// TATTOO STYLES
// =============================================================================

export const TATTOO_STYLES = [
    "Fineline",
    "Blackwork",
    "Realism",
    "Traditional",
    "Neo-Traditional",
    "Japanese",
    "Watercolor",
    "Geometric",
    "Dotwork",
    "Tribal",
    "Minimalist",
    "Portrait",
    "Cover-up",
    "Lettering",
    "Script",
    "Abstract",
    "Micro",
    "Ornamental",
    "Mandala",
    "Botanical",
    "Illustrative",
    "Surrealism",
    "New School",
    "Old School",
    "Chicano",
    "Celtic",
    "Maori",
    "Polynesian",
    "Sketch",
    "Trash Polka"
] as const;

// =============================================================================
// BODY PLACEMENTS
// =============================================================================

export const BODY_PLACEMENTS = [
    "Arm - Upper",
    "Arm - Lower",
    "Arm - Full Sleeve",
    "Arm - Half Sleeve",
    "Wrist",
    "Hand",
    "Finger",
    "Shoulder",
    "Chest",
    "Back - Upper",
    "Back - Lower",
    "Back - Full",
    "Stomach",
    "Ribs",
    "Hip",
    "Thigh",
    "Calf",
    "Ankle",
    "Foot",
    "Neck",
    "Behind Ear",
    "Face",
    "Other"
] as const;

// =============================================================================
// COUNTRIES & CURRENCIES
// =============================================================================

export const SUPPORTED_COUNTRIES = [
    { code: "NL", name: "Netherlands", currency: "EUR", timezone: "Europe/Amsterdam" },
    { code: "PT", name: "Portugal", currency: "EUR", timezone: "Europe/Lisbon" },
    { code: "DE", name: "Germany", currency: "EUR", timezone: "Europe/Berlin" },
    { code: "FR", name: "France", currency: "EUR", timezone: "Europe/Paris" },
    { code: "IT", name: "Italy", currency: "EUR", timezone: "Europe/Rome" },
    { code: "ES", name: "Spain", currency: "EUR", timezone: "Europe/Madrid" },
    { code: "GB", name: "United Kingdom", currency: "GBP", timezone: "Europe/London" },
    { code: "BE", name: "Belgium", currency: "EUR", timezone: "Europe/Brussels" },
    { code: "LU", name: "Luxembourg", currency: "EUR", timezone: "Europe/Luxembourg" },
    { code: "AT", name: "Austria", currency: "EUR", timezone: "Europe/Vienna" },
    { code: "CH", name: "Switzerland", currency: "CHF", timezone: "Europe/Zurich" },
    { code: "IE", name: "Ireland", currency: "EUR", timezone: "Europe/Dublin" },
    { code: "DK", name: "Denmark", currency: "DKK", timezone: "Europe/Copenhagen" },
    { code: "SE", name: "Sweden", currency: "SEK", timezone: "Europe/Stockholm" },
    { code: "NO", name: "Norway", currency: "NOK", timezone: "Europe/Oslo" },
    { code: "PL", name: "Poland", currency: "PLN", timezone: "Europe/Warsaw" }
] as const;

export const CURRENCIES = {
    EUR: { code: "EUR", symbol: "€", name: "Euro" },
    USD: { code: "USD", symbol: "$", name: "US Dollar" },
    GBP: { code: "GBP", symbol: "£", name: "British Pound" },
    CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc" }
} as const;

// =============================================================================
// PAYMENT METHODS
// =============================================================================

export const PAYMENT_METHODS = {
    CARD: { id: "card", name: "Credit/Debit Card", icon: "credit-card" },
    IDEAL: { id: "ideal", name: "iDEAL", icon: "ideal", countries: ["NL"] },
    BANCONTACT: { id: "bancontact", name: "Bancontact", icon: "bancontact", countries: ["BE"] },
    SEPA: { id: "sepa_debit", name: "SEPA Direct Debit", icon: "bank" },
    PAYPAL: { id: "paypal", name: "PayPal", icon: "paypal" },
    MULTIBANCO: { id: "multibanco", name: "Multibanco", icon: "multibanco", countries: ["PT"] },
    MB_WAY: { id: "mb_way", name: "MB WAY", icon: "mb-way", countries: ["PT"] },
    BIZUM: { id: "bizum", name: "Bizum", icon: "bizum", countries: ["ES"] },
    GIROPAY: { id: "giropay", name: "Giropay", icon: "giropay", countries: ["DE"] },
    EPS: { id: "eps", name: "EPS", icon: "eps", countries: ["AT"] }
} as const;

// =============================================================================
// TIME & SCHEDULE
// =============================================================================

export const DEFAULT_WORKING_HOURS = {
    monday: { isWorking: true, slots: [{ start: "10:00", end: "19:00" }] },
    tuesday: { isWorking: true, slots: [{ start: "10:00", end: "19:00" }] },
    wednesday: { isWorking: true, slots: [{ start: "10:00", end: "19:00" }] },
    thursday: { isWorking: true, slots: [{ start: "10:00", end: "19:00" }] },
    friday: { isWorking: true, slots: [{ start: "10:00", end: "19:00" }] },
    saturday: { isWorking: false, slots: [] },
    sunday: { isWorking: false, slots: [] }
} as const;

export const SLOT_DURATIONS = [
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
    { value: 180, label: "3 hours" },
    { value: 240, label: "4 hours" },
    { value: 300, label: "5 hours" },
    { value: 360, label: "6 hours" },
    { value: 480, label: "8 hours (Full Day)" }
] as const;

export const BUFFER_TIMES = [
    { value: 0, label: "No buffer" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" }
] as const;

export const ADVANCE_BOOKING = {
    MIN_HOURS: [
        { value: 12, label: "12 hours" },
        { value: 24, label: "24 hours" },
        { value: 48, label: "48 hours" },
        { value: 72, label: "72 hours (3 days)" },
        { value: 168, label: "1 week" }
    ],
    MAX_DAYS: [
        { value: 30, label: "30 days" },
        { value: 60, label: "60 days" },
        { value: 90, label: "90 days" },
        { value: 180, label: "6 months" },
        { value: 365, label: "1 year" }
    ]
} as const;

// =============================================================================
// CANCELLATION POLICIES
// =============================================================================

export const CANCELLATION_POLICIES = {
    flexible: {
        id: "flexible",
        name: "Flexible",
        description: "Full refund if cancelled 24+ hours before. 50% refund 6-24 hours before. No refund within 6 hours.",
        rules: [
            { hoursBeforeMin: 24, refundPercent: 100 },
            { hoursBeforeMin: 6, hoursBeforeMax: 24, refundPercent: 50 },
            { hoursBeforeMax: 6, refundPercent: 0 }
        ]
    },
    moderate: {
        id: "moderate",
        name: "Moderate",
        description: "Full refund if cancelled 48+ hours before. 75% refund 24-48 hours. 50% refund 12-24 hours. 25% within 12 hours.",
        rules: [
            { hoursBeforeMin: 48, refundPercent: 100 },
            { hoursBeforeMin: 24, hoursBeforeMax: 48, refundPercent: 75 },
            { hoursBeforeMin: 12, hoursBeforeMax: 24, refundPercent: 50 },
            { hoursBeforeMax: 12, refundPercent: 25 }
        ]
    },
    strict: {
        id: "strict",
        name: "Strict",
        description: "Full refund if cancelled 72+ hours before. 50% refund 48-72 hours. No refund within 48 hours.",
        rules: [
            { hoursBeforeMin: 72, refundPercent: 100 },
            { hoursBeforeMin: 48, hoursBeforeMax: 72, refundPercent: 50 },
            { hoursBeforeMax: 48, refundPercent: 0 }
        ]
    }
} as const;

// =============================================================================
// COMMISSION RATES
// =============================================================================

export const PLATFORM_FEE = {
    DEFAULT_PERCENT: 15,
    MIN_PERCENT: 10,
    MAX_PERCENT: 25,
    PROCESSING_FEE_PERCENT: 2.9, // Stripe fee
    PROCESSING_FEE_FIXED: 30 // 30 cents per transaction
} as const;

export const ARTIST_COMMISSION_TIERS = [
    { bookings: 0, rate: 85 },
    { bookings: 50, rate: 87 },
    { bookings: 100, rate: 88 },
    { bookings: 200, rate: 90 }
] as const;

// =============================================================================
// DEPOSIT REQUIREMENTS
// =============================================================================

export const DEPOSIT_PRESETS = [
    { type: "fixed", value: 5000, label: "€50 fixed deposit" },
    { type: "fixed", value: 10000, label: "€100 fixed deposit" },
    { type: "fixed", value: 15000, label: "€150 fixed deposit" },
    { type: "percentage", value: 25, label: "25% of booking value" },
    { type: "percentage", value: 50, label: "50% of booking value" },
    { type: "percentage", value: 100, label: "Full payment upfront" }
] as const;

// =============================================================================
// USER ROLES
// =============================================================================

export const USER_ROLES = {
    CEO: "ceo",
    ARTIST: "artist",
    CUSTOMER: "customer",
    ADMIN: "admin"
} as const;

export const ROLE_PERMISSIONS = {
    ceo: [
        "manage_artists",
        "manage_bookings",
        "view_financial",
        "process_payouts",
        "manage_settings",
        "view_reports"
    ],
    artist: [
        "manage_own_profile",
        "manage_own_bookings",
        "view_own_earnings",
        "upload_portfolio"
    ],
    customer: [
        "create_booking",
        "view_own_bookings",
        "cancel_own_booking"
    ],
    admin: ["*"] // All permissions
} as const;

// =============================================================================
// SUPPORTED LANGUAGES
// =============================================================================

export const SUPPORTED_LANGUAGES = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "it", name: "Italiano", flag: "🇮🇹" }
] as const;

// =============================================================================
// VALIDATION LIMITS
// =============================================================================

export const VALIDATION = {
    USERNAME: { minLength: 3, maxLength: 30, pattern: /^[a-z0-9_]+$/ },
    PASSWORD: { minLength: 8, maxLength: 100 },
    DISPLAY_NAME: { minLength: 2, maxLength: 50 },
    BIO: { maxLength: 500 },
    NOTES: { maxLength: 1000 },
    PHONE: { pattern: /^\+?[0-9\s-()]+$/, minLength: 7, maxLength: 20 },
    EMAIL: { maxLength: 255 },
    INSTAGRAM: { pattern: /^[a-zA-Z0-9._]+$/, maxLength: 30 },
    BOOKING_ID: { length: 16 }
} as const;

// =============================================================================
// FILE UPLOAD
// =============================================================================

export const FILE_UPLOAD = {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    MAX_PORTFOLIO_IMAGES: 50,
    THUMBNAIL_SIZE: { width: 300, height: 300 },
    PORTFOLIO_SIZE: { width: 1200, height: 1200 },
    COVER_SIZE: { width: 1920, height: 1080 },
    AVATAR_SIZE: { width: 200, height: 200 }
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        LOGOUT: "/api/auth/logout",
        REGISTER: "/api/auth/register",
        USER: "/api/auth/user",
        REFRESH: "/api/auth/refresh"
    },
    ARTISTS: {
        LIST: "/api/public/artists",
        DETAIL: "/api/public/artists/:username",
        AVAILABILITY: "/api/public/artists/:id/availability"
    },
    BOOKINGS: {
        CREATE: "/api/bookings",
        DETAIL: "/api/bookings/:id",
        CANCEL: "/api/bookings/:id/cancel"
    },
    CEO: {
        STATS: "/api/ceo/stats",
        ARTISTS: "/api/ceo/artists",
        BOOKINGS: "/api/ceo/bookings",
        FINANCIAL: "/api/ceo/financial"
    },
    ARTIST: {
        PROFILE: "/api/artist/profile",
        BOOKINGS: "/api/artist/bookings",
        EARNINGS: "/api/artist/earnings",
        PORTFOLIO: "/api/artist/portfolio"
    }
} as const;

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export const NOTIFICATION_TYPES = {
    BOOKING_NEW: "booking_new",
    BOOKING_CONFIRMED: "booking_confirmed",
    BOOKING_CANCELLED: "booking_cancelled",
    BOOKING_REMINDER: "booking_reminder",
    PAYMENT_RECEIVED: "payment_received",
    PAYOUT_SENT: "payout_sent",
    REVIEW_RECEIVED: "review_received",
    ARTIST_APPROVED: "artist_approved",
    SYSTEM: "system"
} as const;

// =============================================================================
// ERROR CODES
// =============================================================================

export const ERROR_CODES = {
    // Auth errors
    INVALID_CREDENTIALS: "auth/invalid-credentials",
    TOKEN_EXPIRED: "auth/token-expired",
    UNAUTHORIZED: "auth/unauthorized",

    // Booking errors
    SLOT_UNAVAILABLE: "booking/slot-unavailable",
    BOOKING_NOT_FOUND: "booking/not-found",
    CANNOT_CANCEL: "booking/cannot-cancel",
    ALREADY_CANCELLED: "booking/already-cancelled",

    // Payment errors
    PAYMENT_FAILED: "payment/failed",
    REFUND_FAILED: "payment/refund-failed",

    // Artist errors
    ARTIST_NOT_FOUND: "artist/not-found",
    ARTIST_INACTIVE: "artist/inactive",

    // Validation errors
    VALIDATION_ERROR: "validation/error",

    // Generic errors
    NOT_FOUND: "error/not-found",
    INTERNAL_ERROR: "error/internal",
    RATE_LIMITED: "error/rate-limited"
} as const;
