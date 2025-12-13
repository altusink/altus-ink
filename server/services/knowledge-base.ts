/**
 * ALTUS INK - KNOWLEDGE BASE
 * Comprehensive knowledge of the entire system structure for AI Oracle
 * 
 * Contains:
 * - Complete project architecture
 * - File structure and purposes
 * - API endpoints documentation
 * - Database schema
 * - Business logic rules
 * - Common issues and solutions
 * - Operational procedures
 * - Integration details
 */

// =============================================================================
// PROJECT STRUCTURE
// =============================================================================

export const PROJECT_STRUCTURE = {
    root: {
        description: "Altus Ink SaaS Platform - Tattoo Booking Management",
        files: {
            "package.json": "NPM dependencies and scripts",
            "railway.toml": "Railway deployment configuration",
            "drizzle.config.ts": "Drizzle ORM database configuration",
            "vite.config.ts": "Vite bundler configuration",
            "tsconfig.json": "TypeScript configuration",
            ".env.example": "Environment variables template"
        }
    },

    client: {
        path: "client/",
        description: "React + TypeScript frontend application",
        structure: {
            "src/App.tsx": "Main application component with routing",
            "src/index.css": "Global styles and design system CSS variables",
            "src/main.tsx": "Application entry point",
            "src/hooks/": "Custom React hooks (useAuth, useToast, etc.)",
            "src/lib/": "Utility functions and API client",
            "src/components/": "Reusable UI components",
            "src/components/ui/": "Shadcn/UI base components",
            "src/pages/": "Page components organized by route"
        },
        pages: {
            "landing.tsx": "Public landing page with hero, features, artists",
            "login.tsx": "Authentication page (login/register)",
            "artists.tsx": "Public artist gallery with filters",
            "artist-feed.tsx": "Individual artist profile (Instagram-style)",
            "dashboard/": "Authenticated dashboard pages",
            "dashboard/ceo/": "CEO/Admin management pages",
            "dashboard/artist/": "Artist-specific pages"
        }
    },

    server: {
        path: "server/",
        description: "Node.js + Express backend API",
        structure: {
            "index.ts": "Express app setup and middleware",
            "routes.ts": "API endpoint definitions (700+ lines)",
            "db.ts": "Database connection and Drizzle setup",
            "config/index.ts": "Environment configuration with Zod validation",
            "services/": "Business logic services"
        },
        services: {
            "stripe.ts": "Payment processing, checkout, refunds, Connect payouts (800+ lines)",
            "email.ts": "Email sending with SendGrid/Resend, HTML templates (700+ lines)",
            "booking.ts": "Booking lifecycle, availability, waitlist (800+ lines)",
            "chatwoot.ts": "Live chat integration, contacts, conversations (600+ lines)",
            "storage.ts": "File uploads with Cloudinary/S3/Local (700+ lines)",
            "oracle.ts": "AI Oracle for monitoring and support (700+ lines)",
            "index.ts": "Service exports and health check"
        }
    },

    shared: {
        path: "shared/",
        description: "Code shared between client and server",
        structure: {
            "schema.ts": "Drizzle ORM database schema definitions",
            "types/index.ts": "TypeScript type definitions (500+ lines)",
            "constants/index.ts": "Business constants and configurations (600+ lines)"
        }
    }
};

// =============================================================================
// DATABASE SCHEMA
// =============================================================================

export const DATABASE_SCHEMA = {
    tables: {
        users: {
            description: "User accounts (CEO, Artist, Customer)",
            columns: ["id", "email", "username", "password", "role", "displayName", "avatarUrl", "createdAt", "updatedAt"],
            relationships: ["One-to-One with artists (for artist users)"]
        },
        artists: {
            description: "Artist profiles and settings",
            columns: [
                "id", "userId", "username", "email", "displayName", "bio", "specialty",
                "styles (json array)", "city", "country", "timezone", "instagram", "website",
                "coverImageUrl", "isActive", "isVerified", "tourModeEnabled",
                "stripeAccountId", "stripeAccountStatus", "commissionRate",
                "depositRequirement (json)", "workingHours (json)",
                "bufferMinutes", "minAdvanceBookingHours", "maxAdvanceBookingDays",
                "cancellationPolicy", "preferredCurrency", "languages (json array)",
                "profileViews", "createdAt", "updatedAt"
            ],
            relationships: ["One-to-Many with bookings", "One-to-Many with portfolioImages", "One-to-Many with tourLocations"]
        },
        bookings: {
            description: "Customer booking records",
            columns: [
                "id", "artistId", "customerName", "customerEmail", "customerPhone",
                "slotDatetime", "durationMinutes", "depositAmount", "totalAmount", "currency",
                "status (pending/confirmed/completed/cancelled/no_show/rescheduled)",
                "notes", "referenceImages (json array)", "tattooSize", "tattooPlacement",
                "paymentIntentId", "paymentStatus", "refundAmount", "cancellationReason",
                "cancelledBy", "cancelledAt", "confirmedAt", "completedAt",
                "rescheduledFrom", "remindersSent", "lastReminderAt", "locale",
                "createdAt", "updatedAt"
            ],
            relationships: ["Many-to-One with artists"]
        },
        portfolioImages: {
            description: "Artist portfolio images",
            columns: ["id", "artistId", "url", "thumbnailUrl", "publicId", "category", "description", "order", "createdAt"],
            relationships: ["Many-to-One with artists"]
        },
        tourLocations: {
            description: "Artist tour locations and dates",
            columns: ["id", "artistId", "city", "country", "startDate", "endDate", "studio", "address", "notes", "isActive"],
            relationships: ["Many-to-One with artists"]
        },
        blockedSlots: {
            description: "Artist blocked time slots",
            columns: ["id", "artistId", "startDatetime", "endDatetime", "reason", "isRecurring"],
            relationships: ["Many-to-One with artists"]
        }
    }
};

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
    public: {
        "GET /api/public/artists": "List active artists with filtering (city, style, search)",
        "GET /api/public/artists/:username": "Get artist profile by username",
        "GET /api/public/artists/:id/availability": "Get available slots for date range"
    },
    bookings: {
        "POST /api/bookings": "Create new booking (requires payment)",
        "GET /api/bookings/:id": "Get booking details (with email verification)",
        "POST /api/bookings/:id/cancel": "Cancel a booking (triggers refund)"
    },
    artist: {
        "GET /api/artist/profile": "Get authenticated artist's profile",
        "PATCH /api/artist/profile": "Update artist profile",
        "GET /api/artist/bookings": "Get artist's bookings with filters",
        "POST /api/artist/bookings/:id/confirm": "Confirm a pending booking",
        "GET /api/artist/earnings": "Get earnings summary",
        "POST /api/artist/portfolio": "Upload portfolio image"
    },
    ceo: {
        "GET /api/ceo/stats": "Platform-wide statistics",
        "GET /api/ceo/artists": "List all artists with management data",
        "PATCH /api/ceo/artists/:id": "Update artist (admin)",
        "GET /api/ceo/bookings": "List all bookings",
        "POST /api/ceo/payouts/process": "Process artist payouts via Stripe Connect"
    },
    webhooks: {
        "POST /api/webhooks/stripe": "Handle Stripe payment events"
    }
};

// =============================================================================
// BUSINESS RULES
// =============================================================================

export const BUSINESS_RULES = {
    bookings: {
        "Availability Check": [
            "Must be within artist's working hours",
            "Cannot overlap with existing bookings",
            "Must respect buffer time between sessions",
            "Must meet min advance booking hours",
            "Cannot exceed max advance booking days"
        ],
        "Deposit Calculation": [
            "Fixed amount: Set EUR value (default €100)",
            "Percentage: Calculated from estimated session value (€75/hour average)",
            "Min/max limits applied",
            "All amounts in cents for Stripe"
        ],
        "Cancellation Policy": {
            "Flexible": "100% refund 24h+, 50% refund 6-24h, 0% under 6h",
            "Moderate": "100% refund 48h+, 75% 24-48h, 50% 12-24h, 25% under 12h",
            "Strict": "100% refund 72h+, 50% 48-72h, 0% under 48h"
        }
    },
    payments: {
        "Commission Split": "Platform 15%, Artist 85%",
        "Processing Fees": "Stripe 2.9% + €0.30 per transaction",
        "Payout Schedule": "Weekly/bi-weekly to Stripe Connect accounts",
        "Supported Methods": "Card, iDEAL, Bancontact, SEPA, Multibanco, MB Way, Bizum"
    },
    artists: {
        "Verification": "Manual approval by CEO required",
        "Stripe Onboarding": "Required for receiving payouts",
        "Tour Mode": "Overrides default location with tour locations"
    }
};

// =============================================================================
// COMMON ISSUES & SOLUTIONS
// =============================================================================

export const TROUBLESHOOTING = [
    {
        issue: "Payment failed with 'card_declined'",
        cause: "Customer's card was declined by their bank",
        solution: "Customer should try another payment method or contact their bank",
        severity: "low",
        category: "payments"
    },
    {
        issue: "Booking creation timeout",
        cause: "Database connection pool exhausted or slow query",
        solution: "Check database connections (max 20 for Railway), optimize queries, check for locks",
        severity: "high",
        category: "database"
    },
    {
        issue: "Email delivery failed",
        cause: "Invalid email address, provider rate limiting, or API key issue",
        solution: "Verify email validity, check SendGrid/Resend dashboard for bounces, verify API key",
        severity: "medium",
        category: "email"
    },
    {
        issue: "Stripe webhook signature invalid",
        cause: "STRIPE_WEBHOOK_SECRET mismatch or request tampering",
        solution: "Verify webhook secret matches Stripe dashboard, check raw body parsing",
        severity: "high",
        category: "payments"
    },
    {
        issue: "Artist payout failed",
        cause: "Stripe Connect account not fully onboarded or restricted",
        solution: "Check account status in Stripe dashboard, complete verification requirements",
        severity: "medium",
        category: "payments"
    },
    {
        issue: "Calendar showing wrong availability",
        cause: "Timezone mismatch between artist settings and booking requests",
        solution: "Verify artist timezone in profile, ensure frontend sends UTC times",
        severity: "medium",
        category: "bookings"
    },
    {
        issue: "Images not uploading",
        cause: "Cloudinary/S3 credentials invalid or quota exceeded",
        solution: "Check storage provider credentials, verify quota/limits",
        severity: "medium",
        category: "storage"
    },
    {
        issue: "Slow dashboard loading",
        cause: "Unoptimized database queries or missing indexes",
        solution: "Add database indexes on frequently queried columns (artistId, status, createdAt)",
        severity: "medium",
        category: "performance"
    },
    {
        issue: "Login session expiring unexpectedly",
        cause: "SESSION_SECRET changed or server restart clearing memory sessions",
        solution: "Use persistent session store (Redis/PostgreSQL sessions)",
        severity: "low",
        category: "auth"
    },
    {
        issue: "Chatwoot widget not loading",
        cause: "Invalid widget token or CSP blocking scripts",
        solution: "Verify CHATWOOT_WIDGET_TOKEN, check Content Security Policy headers",
        severity: "low",
        category: "chat"
    }
];

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

export const ENVIRONMENT_VARIABLES = {
    required: {
        "DATABASE_URL": "PostgreSQL connection string",
        "SESSION_SECRET": "Secret for session encryption (32+ chars)",
        "APP_URL": "Production URL (e.g., https://altusink.railway.app)"
    },
    stripe: {
        "STRIPE_SECRET_KEY": "Stripe API secret key",
        "STRIPE_PUBLISHABLE_KEY": "Stripe public key for frontend",
        "STRIPE_WEBHOOK_SECRET": "Webhook endpoint secret"
    },
    email: {
        "EMAIL_PROVIDER": "sendgrid | resend",
        "SENDGRID_API_KEY": "SendGrid API key",
        "RESEND_API_KEY": "Resend API key",
        "EMAIL_FROM": "From address (e.g., booking@altusink.com)"
    },
    storage: {
        "STORAGE_PROVIDER": "cloudinary | s3 | local",
        "CLOUDINARY_CLOUD_NAME": "Cloudinary cloud name",
        "CLOUDINARY_API_KEY": "Cloudinary API key",
        "CLOUDINARY_API_SECRET": "Cloudinary API secret"
    },
    ai: {
        "ORACLE_PROVIDER": "gemini | anthropic | openai | groq | mistral | cohere",
        "ORACLE_MODEL": "Model ID (e.g., gemini-2.0-flash-exp)",
        "GEMINI_API_KEY": "Google AI API key",
        "ANTHROPIC_API_KEY": "Anthropic Claude API key",
        "OPENAI_API_KEY": "OpenAI API key",
        "GROQ_API_KEY": "Groq API key",
        "MISTRAL_API_KEY": "Mistral AI API key",
        "COHERE_API_KEY": "Cohere API key"
    }
};

// =============================================================================
// INTEGRATIONS
// =============================================================================

export const INTEGRATIONS = {
    stripe: {
        description: "Payment processing and artist payouts",
        features: ["Checkout Sessions", "Payment Intents", "Refunds", "Connect (Payouts)", "Webhooks"],
        documentation: "https://stripe.com/docs"
    },
    sendgrid: {
        description: "Transactional email delivery",
        features: ["Template emails", "Delivery tracking", "Bounce handling"],
        documentation: "https://docs.sendgrid.com"
    },
    resend: {
        description: "Modern email API (alternative to SendGrid)",
        features: ["React email templates", "Webhooks", "Analytics"],
        documentation: "https://resend.com/docs"
    },
    chatwoot: {
        description: "Live chat and customer support",
        features: ["Widget embedding", "Contact sync", "Conversation management"],
        documentation: "https://www.chatwoot.com/docs"
    },
    cloudinary: {
        description: "Image upload and transformation",
        features: ["Auto-optimization", "Transformations", "CDN delivery"],
        documentation: "https://cloudinary.com/documentation"
    },
    railway: {
        description: "Hosting platform",
        features: ["Git deploy", "PostgreSQL", "Environment variables", "Custom domains"],
        documentation: "https://docs.railway.app"
    }
};

// =============================================================================
// DEPLOYMENT
// =============================================================================

export const DEPLOYMENT = {
    railway: {
        configuration: "railway.toml defines build and start commands",
        buildCommand: "npm run build",
        startCommand: "npm run start",
        healthCheck: "/api/health",
        database: "PostgreSQL addon",
        migrations: "npm run db:push (Drizzle)"
    },
    checklist: [
        "Set all required environment variables",
        "Connect PostgreSQL database",
        "Run database migrations",
        "Configure Stripe webhook endpoint",
        "Set custom domain",
        "Enable SSL (automatic on Railway)"
    ]
};

// =============================================================================
// METRICS & MONITORING
// =============================================================================

export const MONITORING = {
    healthChecks: {
        "Database": "SELECT 1 query",
        "Stripe": "API connectivity test",
        "Email": "Configuration verification",
        "Storage": "Upload/download test"
    },
    keyMetrics: {
        "Booking Rate": "New bookings per day/week/month",
        "Cancellation Rate": "% of bookings cancelled (target < 20%)",
        "Payment Success Rate": "% of payments successful (target > 95%)",
        "Artist Response Time": "Average time to confirm pending bookings",
        "Customer Retention": "% of returning customers"
    },
    alerts: {
        "Critical": ["Database down", "Payment failures > 10%", "Email delivery failure"],
        "Warning": ["High cancellation rate", "Pending bookings not confirmed", "Low artist activity"],
        "Info": ["New artist registration", "Milestone reached"]
    }
};

// =============================================================================
// BUILD KNOWLEDGE PROMPT
// =============================================================================

export function buildKnowledgePrompt(): string {
    return `
# ALTUS INK - Complete System Knowledge Base

## Project Overview
Altus Ink is a SaaS platform for tattoo booking management. It connects tattoo artists with customers, handles bookings, payments, and provides management dashboards for both artists and platform administrators.

## Technology Stack
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Drizzle ORM
- Payments: Stripe (Checkout, Connect)
- Email: SendGrid / Resend
- Storage: Cloudinary / S3
- Hosting: Railway
- State: TanStack Query (React Query)
- Routing: Wouter
- UI: Shadcn/UI + Radix + Framer Motion

## File Structure
${JSON.stringify(PROJECT_STRUCTURE, null, 2)}

## Database Schema
${JSON.stringify(DATABASE_SCHEMA, null, 2)}

## API Endpoints
${JSON.stringify(API_ENDPOINTS, null, 2)}

## Business Rules
${JSON.stringify(BUSINESS_RULES, null, 2)}

## Common Issues & Solutions
${TROUBLESHOOTING.map(t => `- ${t.issue}: ${t.solution}`).join('\n')}

## Environment Variables
${JSON.stringify(ENVIRONMENT_VARIABLES, null, 2)}

## Key Integrations
${Object.entries(INTEGRATIONS).map(([k, v]) => `- ${k}: ${v.description}`).join('\n')}

Use this knowledge to:
1. Diagnose system issues
2. Answer technical questions
3. Suggest optimizations
4. Guide troubleshooting
5. Provide code references
`;
}

export default {
    PROJECT_STRUCTURE,
    DATABASE_SCHEMA,
    API_ENDPOINTS,
    BUSINESS_RULES,
    TROUBLESHOOTING,
    ENVIRONMENT_VARIABLES,
    INTEGRATIONS,
    DEPLOYMENT,
    MONITORING,
    buildKnowledgePrompt
};
