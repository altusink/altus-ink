# ALTUSINK.IO - Tattoo Booking SaaS Platform

## Overview
ALTUSINK.IO is a premium multi-tenant tattoo booking SaaS platform for Altus Ink agency. The platform enables tattoo artists to manage their bookings, availability, and earnings while clients can book appointments through personalized artist pages.

## Current State
The application is functional with core features implemented:
- Authentication (Replit Auth with development mode fallback)
- Artist dashboard with overview, calendar, earnings, tour mode, personalization, portfolio, and settings
- CEO dashboard with overview, artists, bookings, financial, reports, and settings pages
- Coordinator dashboard with read-only agenda access (no payout permissions)
- Vendor dashboard with commission tracking, goals, and payout requests
- Public booking pages at `/book/:subdomain`
- Database schema with full deposit retention and booking lock support
- Role-based authorization middleware (canWithdraw, isCEO) for security
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

### Financial Model (68/30/2 Split)
- Non-refundable deposits (configurable per artist)
- 90-day deposit retention period
- **68/30/2 revenue split**: 68% artist, 30% platform (Altus), 2% vendor commission
- Held → Available → Released deposit lifecycle
- Multi-currency support: EUR and BRL

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
- **CEO**: Full platform access, artist approval, financial overview, payout approval
- **Artist**: Own profile, bookings, calendar, earnings management, payout requests
- **Coordinator**: Artist permissions but cannot withdraw/request payouts
- **Vendor**: Has agenda access, earns 2% commission, can request payouts
- **Client**: Public booking pages only

## File Structure
```
client/src/
├── pages/
│   ├── dashboard/
│   │   ├── artist/      # Artist dashboard pages
│   │   ├── ceo/         # CEO dashboard pages
│   │   ├── coordinator/ # Coordinator dashboard pages
│   │   └── vendor/      # Vendor dashboard pages
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
├── index.ts             # Server entry
├── webhookHandlers.ts   # Stripe webhook processing
├── stripeClient.ts      # Stripe credentials (Replit Connectors)
├── stripeService.ts     # Stripe checkout session creation
├── services/
│   ├── email.ts         # SMTP email service
│   └── whatsapp.ts      # Z-API WhatsApp service
├── middleware/
│   └── subdomain.ts     # Subdomain routing middleware
└── jobs/
    └── depositRelease.ts # Background job for 90-day deposit release

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
- `POST /api/stripe/webhook/:uuid` - Stripe webhook endpoint (processes payments)

### Export APIs
- `GET /api/ceo/export/bookings` - Export all bookings as CSV
- `GET /api/ceo/export/deposits` - Export all deposits as CSV

### Alternative Payment APIs
- `POST /api/public/artist/:subdomain/payment/revolut` - Get Revolut payment instructions
- `POST /api/public/artist/:subdomain/payment/wise` - Get Wise payment instructions

### Studio APIs (CEO only)
- `GET /api/ceo/studios` - List all studios
- `POST /api/ceo/studios` - Create new studio
- `PATCH /api/ceo/studios/:id` - Update studio
- `DELETE /api/ceo/studios/:id` - Delete studio

### Connected Accounts APIs
- `GET /api/accounts` - Get user's connected payment accounts
- `POST /api/accounts` - Add new payment account (Wise, Revolut, PayPal, IBAN)
- `PATCH /api/accounts/:id` - Update account details
- `DELETE /api/accounts/:id` - Remove account
- `POST /api/accounts/:id/default` - Set as default payout account

### Payout APIs
- `GET /api/payouts` - Get user's payout requests
- `GET /api/balance` - Get user's available balance
- `POST /api/payouts` - Request new payout
- `GET /api/ceo/payouts` - Get all payout requests (CEO only)
- `GET /api/ceo/payouts/pending` - Get pending requests (CEO only)
- `POST /api/ceo/payouts/:id/approve` - Approve payout (CEO only)
- `POST /api/ceo/payouts/:id/execute` - Execute payout (CEO only)
- `POST /api/ceo/payouts/:id/reject` - Reject payout (CEO only)

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

## Recently Implemented Features
- **68/30/2 Revenue Split**: Updated financial model with artist (68%), platform (30%), vendor (2%) split
- **Multi-Studio Architecture**: Studios table for multi-tenant white-label preparation
- **Connected Payment Accounts**: Support for Wise, Revolut, PayPal, and IBAN for payouts
- **Payout Request System**: Full workflow with request → approve → execute flow
- **New Roles**: Added coordinator (no withdrawal) and vendor (2% commission) roles
- **Futuristic UI Theme**: Dark mode with neon teal/blue accents and glassmorphism effects
- **Email Notifications**: Booking confirmations sent via SMTP (requires credentials)
- **WhatsApp Notifications**: Z-API integration for booking alerts (requires credentials)
- **Subdomain Middleware**: Routes artist.altusink.io to /book/:subdomain (requires DNS config)
- **Deposit Release Job**: Automatic release of deposits after 90-day retention
- **CSV Export**: Export bookings and deposits for reporting
- **Revolut/Wise Instructions**: Alternative payment method support

## New Components
- `FinancialBreakdownCard`: Displays 68/30/2 split breakdown for deposits
- `PayoutRequestModal`: Modal for artists/vendors to request payouts
- `ConnectedAccountsManager`: Manage connected payment accounts (Wise, Revolut, PayPal, IBAN)

## Database Schema Updates
- `studios`: Multi-tenant studio support with branding
- `connected_accounts`: Payment accounts for payouts
- `payout_requests`: Payout request tracking with approval workflow
- Added `vendorId`, `vendorAmount` to deposits for commission tracking
- Added `studioId` to artists, bookings, deposits for multi-tenant isolation

## Configuration Required
To enable all features, configure these environment variables:
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` - Email notifications
- `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN` - WhatsApp notifications via Z-API
- DNS wildcard record `*.altusink.io` pointing to deployment - Subdomain routing
