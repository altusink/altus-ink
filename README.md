# Altus Ink - Tattoo Booking SaaS Platform

A premium multi-tenant tattoo booking platform for Altus Ink agency.

## Features

- 🎨 **Multi-tenant Architecture** - White-label support with custom branding
- 📅 **Smart Booking System** - 10-minute slot locking to prevent double-booking
- 💳 **Stripe Payments** - Secure checkout with webhook processing
- 💰 **68/30/2 Revenue Split** - Artist (68%), Platform (30%), Vendor (2%)
- 🌍 **8 Languages** - EN, PT-BR, PT-PT, ES, FR, DE, IT, NL
- 📧 **Email Notifications** - SMTP integration for booking confirmations
- 📱 **WhatsApp Notifications** - Z-API integration for instant alerts
- 👥 **Role-based Access** - CEO, Artist, Coordinator, Vendor roles

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Tailwind CSS
- **Backend**: Express.js, PostgreSQL, Drizzle ORM
- **Payments**: Stripe Checkout + Webhooks
- **Auth**: Passport.js with bcrypt password hashing

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+

### Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

```bash
# Copy and configure environment
cp .env.example .env

# Start with Docker Compose
docker-compose up -d
```

## Environment Variables

See [.env.example](.env.example) for all configuration options.

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure session encryption key
- `STRIPE_SECRET_KEY` - Stripe API key

### Optional
- `SMTP_*` - Email notification settings
- `ZAPI_*` - WhatsApp notification settings

## API Documentation

### Public Endpoints
- `GET /api/public/artist/:subdomain` - Artist profile
- `POST /api/public/artist/:subdomain/lock` - Create booking lock
- `POST /api/public/artist/:subdomain/checkout` - Stripe checkout

### Authenticated Endpoints
- `GET /api/artist/me` - Current artist profile
- `GET /api/artist/bookings` - Artist bookings
- `GET /api/ceo/stats` - Platform statistics (CEO only)

## Deployment Platforms

This project is ready for deployment on:

- **Railway** - `railway up`
- **Render** - Connect GitHub repo
- **DigitalOcean App Platform** - Deploy from repo
- **Any Docker host** - Use provided Dockerfile

## License

MIT
