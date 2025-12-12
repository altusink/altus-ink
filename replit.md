# ALTUSINK.IO - Tattoo Booking SaaS Platform

## Overview
ALTUSINK.IO is a premium multi-tenant tattoo booking SaaS platform for Altus Ink agency. The platform enables tattoo artists to manage their bookings, availability, and earnings while clients can book appointments through personalized artist pages.

## Current State
The application is functional with core features implemented:
- Authentication (Replit Auth with development mode fallback)
- Artist dashboard with overview, calendar, earnings, tour mode, personalization, portfolio, and settings
- CEO dashboard with overview, artists, bookings, financial, reports, and settings pages
- Public booking pages at `/book/:subdomain`
- Database schema with full deposit retention and booking lock support
- All dashboard menu items connected to dedicated pages with database integration

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite, TanStack Query, Wouter routing
- **Backend**: Express.js, PostgreSQL with Drizzle ORM
- **UI**: Shadcn/ui components, Tailwind CSS, Lucide icons
- **Auth**: Dual auth system - Replit OpenID Connect (production) + Username/Password (development)
- **Payments**: Stripe Checkout with stripe-replit-sync integration
- **Security**: bcrypt for password hashing

## Stripe Payment Flow
1. Customer selects date/time and creates 10-minute booking lock
2. Frontend calls `/api/public/artist/:subdomain/checkout` with lockId
3. Backend creates Stripe Checkout session with deposit amount
4. Customer completes payment on Stripe hosted checkout page
5. Webhook processes `checkout.session.completed` event
6. Booking is confirmed and deposit record created with 70/30 split

### Key Files
- `server/stripeClient.ts` - Stripe credentials via Replit Connectors
- `server/stripeService.ts` - Checkout session creation
- `server/webhookHandlers.ts` - Payment event processing
- Fallback: If Stripe not configured, bookings are created directly (dev mode)

## Key Features

### Internationalization (i18n)
- 8 languages supported: EN, PT-BR, PT-PT, ES, FR, DE, IT, NL
- LocaleProvider context for global language state management
- Language Selector modal on first visit (stored in localStorage)
- Language Switcher in navigation header for changing language
- All UI components use translation keys from `client/src/lib/i18n/translations.ts`

### Premium Gold Branding
- Pure gold color scheme: hsl(45, 93%, 47%) - no amber/orange
- Gold gradient variants for hover and active states
- Consistent gold styling across navigation, buttons, and accents

### Multi-Tenant Architecture
- Artists have personalized booking pages at `artist.altusink.io` or `/book/:subdomain`
- Each artist can customize their theme color, bio, and branding
- Subdomain-based routing for public pages

### Booking System
- 10-minute slot locking to prevent double-booking
- Real-time countdown timer during booking process
- 4-step booking flow: Calendar → Time → Details → Payment

### Financial Model
- Non-refundable deposits (configurable per artist)
- 90-day deposit retention period
- 70/30 revenue split (70% artist, 30% platform)
- Held → Available → Released deposit lifecycle

### Tour Mode
- Artists can enable tour mode for traveling
- City schedules with venue information
- Payment-gated address exposure (address revealed after deposit payment)

### Authentication System
- Dual auth: Replit OIDC for production, Username/Password for development
- Login page at `/login` with username/password form
- Passwords stored securely with bcrypt hashing
- CEO account: username "Jander" (password hashed with bcrypt)
- All user creation and password reset flows must use bcrypt for hashing

### Role-Based Access
- **CEO**: Full platform access, artist approval, financial overview
- **Artist**: Own profile, bookings, calendar, earnings management
- **Client**: Public booking pages only

## File Structure
```
client/src/
├── pages/
│   ├── dashboard/
│   │   ├── artist/      # Artist dashboard pages
│   │   └── ceo/         # CEO dashboard pages
│   └── book/            # Public booking page
├── components/
│   ├── ui/              # Shadcn components
│   └── dashboard-layout.tsx
├── hooks/
│   └── useAuth.ts       # Authentication hook
└── lib/
    ├── queryClient.ts   # TanStack Query config
    └── i18n/
        ├── translations.ts    # All translation strings (8 languages)
        └── locale-context.tsx # LocaleProvider context

server/
├── routes.ts            # API endpoints
├── storage.ts           # Database operations
├── replitAuth.ts        # Auth configuration
└── index.ts             # Server entry

shared/
└── schema.ts            # Drizzle schema & Zod validation
```

## API Routes

### Artist APIs
- `GET /api/artist/me` - Get current artist profile
- `PATCH /api/artist/me` - Update artist profile
- `GET /api/artist/stats` - Get dashboard stats
- `GET /api/artist/availability` - Get availability schedule
- `POST /api/artist/availability` - Update availability
- `GET /api/artist/bookings` - Get bookings
- `GET /api/artist/deposits` - Get earnings/deposits

### CEO APIs
- `GET /api/ceo/stats` - Platform stats
- `GET /api/ceo/artists` - List all artists
- `POST /api/ceo/artists/:id/approve` - Approve artist
- `POST /api/ceo/artists/:id/deactivate` - Deactivate artist
- `GET /api/ceo/bookings` - All bookings with filters
- `PATCH /api/ceo/bookings/:id/status` - Update booking status
- `GET /api/ceo/deposits` - All deposits
- `GET /api/ceo/financial/stats` - Financial overview
- `GET /api/ceo/reports` - Reports and analytics
- `GET /api/ceo/integration-status` - Check integration status (SMTP, Stripe, WhatsApp)
- `POST /api/ceo/settings/smtp` - Save SMTP settings
- `POST /api/ceo/settings/smtp/test` - Test SMTP configuration

### Public APIs
- `GET /api/public/artist/:subdomain` - Get public artist profile
- `GET /api/public/artist/:subdomain/availability` - Get availability
- `POST /api/public/artist/:subdomain/lock` - Create 10-min booking lock
- `POST /api/public/artist/:subdomain/checkout` - Create Stripe checkout session
- `POST /api/public/artist/:subdomain/book` - Legacy booking endpoint (for backward compatibility)

### Stripe APIs
- `GET /api/stripe/publishable-key` - Get Stripe publishable key for frontend

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret
- `REPLIT_DEPLOYMENT` - Set in production for Replit Auth

## Development
The application runs on port 5000. Use `npm run dev` to start the development server.

## Integrations Configuration

### CEO Settings Page (`/dashboard/ceo/settings`)
The settings page provides centralized configuration for all platform integrations:
- **Email (SMTP)**: Hostinger SMTP configuration for booking confirmations
- **Payments**: Stripe (configured via Replit), Revolut, Wise (display options)
- **WhatsApp**: Z-API integration for notifications
- **Domain**: DNS configuration guide for Hostinger

### Required Environment Variables
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` - For email notifications
- `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN` - For WhatsApp notifications
- `STRIPE_SECRET_KEY` - For payment processing (configured via Replit integration)

## Planned Features (Not Yet Implemented)
- Full subdomain routing (artist.altusink.io)
- Tour mode payment-gated address display UI
- Real-time WhatsApp notifications
