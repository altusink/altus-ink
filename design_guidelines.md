# ALTUSINK.IO Design Guidelines

## Design Approach

**Reference-Based Hybrid Approach** drawing from:
- **Airbnb** - Booking flow, trust elements, calendar interactions
- **Linear** - Dashboard sophistication, typography hierarchy
- **Instagram** - Visual portfolio presentation, artist profiles
- **Stripe** - Payment UI patterns, professional restraint

**Core Design Principles:**
1. Premium sophistication befitting a professional agency
2. Artist work takes visual precedence
3. Trust-building through clarity and professionalism
4. Seamless mobile-first booking experience

## Typography System

**Font Families:**
- Primary: Inter (headers, UI elements, body)
- Accent: Space Grotesk (artist names, hero statements)

**Scale:**
- Hero/Display: text-5xl md:text-6xl lg:text-7xl (font-bold)
- Page Titles: text-3xl md:text-4xl lg:text-5xl (font-bold)
- Section Headers: text-2xl md:text-3xl (font-semibold)
- Card Titles: text-xl md:text-2xl (font-semibold)
- Body: text-base lg:text-lg (font-normal)
- Small/Meta: text-sm (font-medium)
- Buttons: text-base (font-semibold)

## Brand Logo Usage

**Official Logo:** `attached_assets/altus1_1765480827921.png` (Altus International Ink)

**Logo Component:** Use `@/components/logo` for consistent branding

**Size Variants:**
- `sm` (32px height): Footer, compact spaces
- `md` (40px height): Dashboard sidebar, secondary navigation
- `lg` (48px height): Main navigation header
- `xl` (64px height): Hero sections, splash screens

**Usage Guidelines:**
- Import: `import { Logo, LogoCompact } from "@/components/logo"`
- Always use the reusable component, never import the asset directly
- Maintain clear space equal to the height of the "A" around the logo
- Only place on high-contrast backgrounds (dark surfaces preferred)
- Never add shadows, filters, or color modifications to the logo
- For "Powered by" attributions, use `LogoCompact` with text beside it

**Placement:**
- Landing page: Header (size lg) + Footer (size sm)
- Dashboard sidebar: Header area (size md)
- Booking pages: Footer with "Powered by" text (LogoCompact)
- Login/auth screens: Center placement (size xl)

## Layout System

**Spacing Primitives:** 
Tailwind units of 2, 3, 4, 6, 8, 12, 16, 20, 24 (e.g., p-4, gap-6, mt-12, py-20)

**Container Strategy:**
- Full-width sections: w-full with max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Content sections: max-w-6xl mx-auto
- Dashboard content: max-w-screen-2xl mx-auto
- Form containers: max-w-2xl

**Grid Patterns:**
- Artist gallery: grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4
- Feature cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8
- Dashboard stats: grid grid-cols-2 lg:grid-cols-4 gap-4

**Mobile-First Breakpoints:**
- Base: 375px minimum, stack all columns, p-4 spacing
- md (768px): 2-column max, p-6 spacing
- lg (1024px): Full multi-column, p-8 spacing

## Component Library

### Navigation
**Main Navigation:**
- Fixed header with backdrop-blur-xl bg-black/80
- Logo + primary CTA (right-aligned on mobile, left on desktop)
- Hamburger menu (mobile) → full horizontal nav (desktop)
- Artist subdomain: Simplified nav with artist name prominent

**Dashboard Sidebar:**
- Collapsed on mobile (bottom nav bar with icons)
- Expanded on lg: (w-64 sidebar, transitions smooth)
- Role-based menu items with active state indicators

### Booking Components
**Calendar Interface:**
- Month view: Grid with available/booked/locked states
- Time slot picker: Vertical list (mobile), grid (desktop)
- 10-minute lock indicator: Animated countdown timer
- Minimum touch target: 44px for all slots

**Booking Cards:**
- Rounded corners: rounded-xl md:rounded-2xl
- Padding: p-4 md:p-6
- Shadow: shadow-lg hover:shadow-xl
- Artist image + name + time + status badge

### Artist Profile Components
**Hero Section:**
- Full-width artist cover image or pattern background
- Artist portrait: Circular, size-20 md:size-24 lg:size-32
- Bio overlay with frosted glass effect (backdrop-blur-md)
- Primary CTA: "Book Now" with blurred background

**Portfolio Grid:**
- Masonry-style layout for tattoo images
- Hover: Subtle scale and overlay with project details
- Lightbox for full-screen viewing

**Availability Display:**
- Visual weekly calendar grid
- City schedule cards for tour mode (with map pin icons)
- Hidden address badge with lock icon (revealed post-payment)

### Dashboard Components
**Stat Cards:**
- Compact: p-4 rounded-lg border
- Icon + label + large number + trend indicator
- Grid of 2 (mobile) to 4 (desktop)

**Data Tables:**
- Sticky header on scroll
- Row height: min-h-[60px] for touch
- Expandable rows for booking details
- Mobile: Stacked card view instead of table

**Earnings Overview:**
- Bar chart visualization (90-day retention timeline)
- Status badges: held/available/released
- Artist split (70%) vs Platform fee (30%) clearly displayed

### Form Elements
**Input Fields:**
- Height: h-12 md:h-14 (44px+ touch target)
- Rounded: rounded-lg
- Focus: ring-2 with accent color
- Labels: text-sm font-medium mb-2
- Error states: border-red-500 with text-red-600 message

**Buttons:**
- Primary CTA: h-12 md:h-14, px-8, rounded-lg, font-semibold
- Secondary: border-2 with transparent background
- Icon buttons: size-12 rounded-full
- Loading states: Spinner + disabled opacity
- Hover/active: Integrated component states

**Date/Time Pickers:**
- Native mobile inputs where appropriate
- Custom calendar with large touch targets
- Time slots as button group with selection state

### Payment UI
**Stripe Integration:**
- Embedded Stripe elements with custom styling
- Clear deposit amount display (never show full price)
- Platform fee breakdown (30% agency, 70% artist)
- Non-refundable policy statement prominent
- Security badges and trust indicators

### Modal/Overlays
**Booking Confirmation:**
- Centered modal: max-w-lg on mobile, max-w-2xl on desktop
- Close button: size-10 top-right
- Smooth entry: Framer Motion slide-up animation
- Backdrop: bg-black/60 backdrop-blur-sm

**Tour Mode Address Reveal:**
- Payment success → animated unlock transition
- Address displayed with map integration
- Directions link and save-to-calendar option

### Notifications
**Toast Messages:**
- Bottom-right on desktop, bottom-center on mobile
- Auto-dismiss after 5s
- Icon + message + close button
- Success/Error/Info variants

## Images

**Hero Images:**
- Landing page: Full-width hero (min-h-[60vh] md:min-h-[80vh]) showcasing tattoo artistry - dramatic, high-contrast image of detailed tattoo work
- Artist profile: Cover image (h-64 md:h-96) - artist's signature style or best work showcase
- CEO dashboard: No hero, immediate data focus

**Placement Strategy:**
- Artist portfolio: Masonry grid of tattoo photos (2 cols mobile, 3-4 cols desktop)
- Booking confirmation: Artist headshot thumbnail
- City schedule cards: City landmark thumbnails (if tour mode)
- About/Team section: Professional artist headshots

**Image Treatment:**
- Aspect ratios: 1:1 (portraits), 4:3 (tattoo work), 16:9 (covers)
- Lazy loading with blur-up placeholders
- Hover effects: Scale 1.05 with smooth transition

## Animations

**Minimal & Purposeful:**
- Page transitions: Fade (150ms)
- Calendar slot selection: Scale 0.95 → 1 (100ms)
- Booking lock countdown: Pulse animation on timer
- Payment success: Checkmark draw animation (500ms)
- Address reveal: Slide-down with blur fade (300ms)
- NO scroll-triggered animations
- NO excessive hover effects

## Key UX Patterns

**Booking Flow:**
1. Artist profile → Select date → Choose time → Lock acquired (10-min countdown visible)
2. Customer info form → Stripe payment → Confirmation with details
3. Tour mode: Address hidden until step 3 complete

**Multi-Tenant Routing:**
- artist.altusink.io shows personalized theme (artist custom color as accent)
- Consistent structure, customized aesthetics per artist

**Trust Elements:**
- Payment security badges near Stripe form
- "Non-refundable deposit" clearly stated but not aggressive
- Artist verification badge (approved status)
- Platform branding subtle but present

**Mobile Optimizations:**
- Bottom navigation for dashboard (mobile)
- Swipeable calendar month view
- Pull-to-refresh on booking lists
- Safe area insets for notched devices (safe-bottom class)