# Altus Ink - Enterprise Tattoo Booking Platform

<div align="center">

![Altus Ink Logo](./client/public/altus-logo.svg)

**The Complete SaaS Platform for Tattoo Artists**

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org)

[Demo](https://altusink.com) • [Documentation](./docs) • [API Reference](./server/docs/api-spec.ts)

</div>

---

## 🎨 Overview

Altus Ink is an enterprise-grade SaaS platform designed for tattoo artists to manage their bookings, payments, and client relationships. Built with modern technologies and best practices, it provides a seamless experience for both artists and their clients.

### Key Features

- **🗓️ Smart Booking System** - Dynamic availability, tour mode support, automated reminders
- **💳 Secure Payments** - Stripe integration with deposits, multi-currency, European payment methods
- **👨‍🎨 Artist Dashboard** - Complete portfolio, earnings tracking, calendar management
- **📊 CEO Dashboard** - Full platform analytics, artist management, financial reports
- **📱 Multi-Channel Notifications** - Email, SMS, WhatsApp, Push notifications
- **🤖 AI Oracle** - Intelligent assistant for platform insights and support
- **🔐 Enterprise Security** - 2FA, GDPR compliance, audit logging, encryption
- **🌍 Internationalization** - 6 languages supported (EN, PT, NL, DE, ES, FR)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│   Web App       │   Mobile App    │   Third-party Integrations      │
│   (React/Vite)  │   (React Native)│   (API/Webhooks)                │
└────────┬────────┴────────┬────────┴────────────────┬────────────────┘
         │                 │                          │
         ▼                 ▼                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                                   │
│                    Express + TypeScript                              │
├─────────────────────────────────────────────────────────────────────┤
│  Auth  │ Rate Limit │ Validation │ Logging │ Error Handling        │
└────────┴────────────┴────────────┴─────────┴────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICES                                     │
├────────────┬────────────┬────────────┬────────────┬─────────────────┤
│  Booking   │  Payment   │  Analytics │  Security  │  Notification   │
│  Service   │  Service   │  Service   │  Service   │  Service        │
├────────────┼────────────┼────────────┼────────────┼─────────────────┤
│  Oracle    │  WhatsApp  │  Email     │  Storage   │  Cache          │
│  (AI)      │  Business  │  Service   │  Service   │  (Redis)        │
└────────────┴────────────┴────────────┴────────────┴─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│              PostgreSQL + Drizzle ORM                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 85,000+ |
| **Backend Services** | 10 |
| **Frontend Pages** | 19 |
| **API Endpoints** | 60+ |
| **Database Tables** | 20+ |
| **Languages Supported** | 6 |
| **Payment Currencies** | 10 |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/altusink/platform.git
cd platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npm run db:push

# Seed development data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

See [`.env.example`](.env.example) for complete documentation of all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API key for payments
- `SENDGRID_API_KEY` - Email service API key
- `WHATSAPP_ACCESS_TOKEN` - WhatsApp Business API token

---

## 📁 Project Structure

```
altus-ink/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── dashboard/  # Dashboard pages
│   │   │   │   ├── artist/ # Artist dashboard
│   │   │   │   ├── ceo/    # CEO/Admin dashboard
│   │   │   │   ├── coordinator/
│   │   │   │   └── vendor/
│   │   │   ├── book/       # Booking flow
│   │   │   └── ...
│   │   ├── lib/            # Utilities & API client
│   │   ├── hooks/          # Custom React hooks
│   │   └── styles/         # Global styles
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── services/           # Business logic services
│   │   ├── analytics.ts    # Analytics & metrics
│   │   ├── booking.ts      # Booking management
│   │   ├── email.ts        # Email notifications
│   │   ├── notification.ts # Multi-channel notifications
│   │   ├── oracle.ts       # AI Oracle
│   │   ├── payment.ts      # Payment processing
│   │   ├── security.ts     # Security & audit
│   │   └── whatsapp.ts     # WhatsApp Business
│   ├── docs/               # API documentation
│   ├── testing/            # Testing utilities
│   ├── routes.ts           # API route definitions
│   ├── index.ts            # Server entry point
│   └── db.ts               # Database configuration
├── shared/                 # Shared code
│   ├── schema.ts           # Database schema
│   └── types/              # TypeScript types
└── .agent/                 # AI agent workflows
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev           # Start development server (frontend + backend)
npm run client        # Start only frontend
npm run server        # Start only backend

# Database
npm run db:push       # Push schema changes
npm run db:migrate    # Run migrations
npm run db:seed       # Seed development data
npm run db:studio     # Open Drizzle Studio

# Build & Deploy
npm run build         # Build for production
npm run start         # Start production server

# Testing
npm run test          # Run tests
npm run test:e2e      # Run E2E tests
npm run test:load     # Run load tests

# Utilities
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript checks
npm run format        # Format code with Prettier
```

---

## 🔐 Security Features

| Feature | Description |
|---------|-------------|
| **Session Management** | Secure cookie-based sessions with automatic expiry |
| **Two-Factor Authentication** | TOTP, SMS, and Email verification |
| **Rate Limiting** | Per-endpoint and per-user rate limits |
| **IP Blocking** | Automatic blocking after failed attempts |
| **Audit Logging** | Complete trail of all user actions |
| **Data Encryption** | AES-256-GCM for sensitive data |
| **GDPR Compliance** | Data export, deletion, and anonymization |
| **RBAC** | Role-based access control (CEO, Artist, Coordinator, Vendor) |

---

## 💳 Payment Processing

### Supported Payment Methods

- **Cards** - Visa, Mastercard, Amex, Discover
- **European** - iDEAL, Bancontact, SEPA Direct Debit
- **Wallets** - Apple Pay, Google Pay
- **Local** - MB WAY, Multibanco, Tikkie, Bizum

### Currencies

EUR, USD, GBP, BRL, CAD, AUD, CHF, SEK, NOK, DKK

---

## 🌍 Internationalization

| Language | Locale | Status |
|----------|--------|--------|
| English | en | ✅ Complete |
| Portuguese | pt | ✅ Complete |
| Dutch | nl | ✅ Complete |
| German | de | ✅ Complete |
| Spanish | es | ✅ Complete |
| French | fr | ✅ Complete |

---

## 📈 API Documentation

Full API documentation is available at `/api/docs` when running the server.

See [`server/docs/api-spec.ts`](server/docs/api-spec.ts) for the OpenAPI 3.0 specification.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/artists` | List active artists |
| GET | `/api/public/artists/:id/availability` | Get availability |
| POST | `/api/bookings` | Create booking |
| POST | `/api/bookings/:id/cancel` | Cancel booking |
| GET | `/api/artist/earnings` | Get earnings summary |
| POST | `/api/artist/payouts` | Request payout |
| GET | `/api/ceo/stats` | Platform statistics |
| POST | `/api/oracle/query` | Query AI Oracle |

---

## 🚀 Deployment

### Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# Deploy
railway up
```

### Docker

```bash
# Build image
docker build -t altusink .

# Run container
docker run -p 5000:5000 --env-file .env altusink
```

### Manual

```bash
# Build
npm run build

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=...

# Start
npm start
```

---

## 📞 Support

- **Documentation**: [docs.altusink.com](https://docs.altusink.com)
- **Email**: support@altusink.com
- **Discord**: [discord.gg/altusink](https://discord.gg/altusink)

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<div align="center">

**Built with ❤️ by the Altus Ink Team**

[Website](https://altusink.com) • [Twitter](https://twitter.com/altusink) • [Instagram](https://instagram.com/altusink)

</div>
