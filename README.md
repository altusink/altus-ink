# Altus Ink V2 - Premium Tattoo Booking Platform

![Altus Ink](https://img.shields.io/badge/Altus-Ink-FF006E?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)

Plataforma híbrida (Landing Page + Portal de Agendamento) para estúdio de tatuagem premium com design futurista estilo Lovable/Figma.

## ✨ Status do Projeto

- ✅ **Landing Page Premium** - Design futurista com glassmorphism
- ✅ **Sistema de Agendamento** - API completa com Supabase
- ✅ **Pagamentos Stripe** - Multi-currency + métodos europeus
- ✅ **Database Schema** - Todas as tabelas + RLS policies
- ✅ **Webhooks** - Confirmação automática de pagamentos
- ✅ **Pronto para Deploy** - Vercel + Supabase + Stripe
- ⏳ **Dashboard CEO/Artista** - Em desenvolvimento (Fase 2)
- ⏳ **Sistema de Emails** - Resend configurado (Fase 2)

## 🚀 Deploy Rápido

**Veja o guia completo:** [`DEPLOY.md`](./DEPLOY.md)

```bash
# 1. Clone e instale
git clone <seu-repo>
cd altus-ink-v2
npm install --legacy-peer-deps

# 2. Configure .env.local (copie de .env.example)

# 3. Deploy no Vercel
vercel --prod
```

### Fase 2 - Crescimento (Em breve)
- ⏳ Modo tour para artistas
- ⏳ Sistema de reviews
- ⏳ Galeria de clientes
- ⏳ Aftercare inteligente
- ⏳ WhatsApp integration
- ⏳ Analytics avançado
- ⏳ Programa de fidelidade

### Fase 3 - Premium (Futuro)
- 📅 Orçamento com IA
- 📅 Vouchers & Gift Cards
- 📅 Flash Tattoos
- 📅 Integrações sociais
- 📅 Chat ao vivo
- 📅 Multi-idioma

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Email:** Resend
- **Deployment:** Vercel

## 📦 Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Resend
RESEND_API_KEY=your_resend_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 Project Structure

```
altus-ink-v2/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (landing, artists)
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected routes (CEO, Artist dashboards)
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utilities and clients
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── public/                # Static assets
```

## 🎨 Design System

### Colors
- **Neon Pink:** `#FF006E`
- **Neon Blue:** `#00F5FF`
- **Neon Purple:** `#8B00FF`
- **Neon Green:** `#39FF14`

### Fonts
- **Heading:** Orbitron (futuristic)
- **Body:** Inter (modern, readable)

### Components
- Glass cards with backdrop blur
- Neon glow effects
- Smooth animations
- Gradient backgrounds

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🗄️ Database Setup

1. Create a Supabase project
2. Run the SQL migrations (coming soon)
3. Configure Row Level Security policies
4. Add your Supabase credentials to `.env.local`

## 💳 Stripe Setup

1. Create a Stripe account
2. Get your API keys (test mode)
3. Configure webhook endpoint
4. Add supported payment methods (iDEAL, Bancontact, etc.)

## 📧 Email Setup

1. Create a Resend account
2. Verify your domain
3. Get your API key
4. Configure email templates

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual

```bash
# Build
npm run build

# Start
npm start
```

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For support, email support@altusink.com

---

**Built with ❤️ and neon by Altus Ink Team**
