/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE DESIGN SYSTEM ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The visual physics, color theory, and interaction model for the platform.
 * 
 * DESIGN PHILOSOPHY: "Neon Glass Realism"
 * - 120fps GPU-Accelerated Animations
 * - Glassmorphism with Depth Layers
 * - Dynamic Color Theming
 * - Physics-Based Interactions
 * - Accessibility First
 * 
 * FEATURES:
 * - Complete Color Palette System
 * - Fluid Typography Scales
 * - Physics-Based Animation Constants
 * - Glassmorphism Utilities
 * - Component Schema Definitions
 * - Iconography System
 * - Spacing & Layout Tokens
 * - Shadow & Elevation System
 * - Responsive Breakpoints
 * - Motion Design Language
 * - Theme Configuration
 * - Accessibility Utilities
 * 
 * @module lib/enterprise-design
 * @version 3.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. COLOR PALETTES (HSL-Based for Dynamic Theming)
// ═══════════════════════════════════════════════════════════════════════════════

export interface HSLColor {
    h: number;
    s: number;
    l: number;
    name?: string;
}

export const PALETTE = {
    // Brand Colors (Neon Cyberpunk)
    brand: {
        primary: { h: 265, s: 98, l: 60, name: "Electric Purple" } as HSLColor,
        secondary: { h: 180, s: 100, l: 50, name: "Cyan Future" } as HSLColor,
        tertiary: { h: 330, s: 100, l: 60, name: "Neon Pink" } as HSLColor,
        accent: { h: 45, s: 100, l: 50, name: "Gold Spark" } as HSLColor,
        gradient: {
            start: { h: 265, s: 98, l: 60 },
            mid: { h: 300, s: 100, l: 50 },
            end: { h: 180, s: 100, l: 50 },
        },
    },

    // Neutral Colors (Dark Mode First)
    neutral: {
        0: { h: 240, s: 10, l: 3, name: "Void Black" } as HSLColor,
        50: { h: 240, s: 8, l: 6, name: "Deep Space" } as HSLColor,
        100: { h: 240, s: 6, l: 10, name: "Midnight" } as HSLColor,
        200: { h: 240, s: 5, l: 15, name: "Carbon" } as HSLColor,
        300: { h: 240, s: 4, l: 25, name: "Graphite" } as HSLColor,
        400: { h: 240, s: 3, l: 40, name: "Steel" } as HSLColor,
        500: { h: 240, s: 2, l: 55, name: "Slate" } as HSLColor,
        600: { h: 240, s: 3, l: 70, name: "Cloud" } as HSLColor,
        700: { h: 240, s: 4, l: 82, name: "Silver" } as HSLColor,
        800: { h: 240, s: 5, l: 92, name: "Mist" } as HSLColor,
        900: { h: 240, s: 6, l: 97, name: "Snow" } as HSLColor,
        950: { h: 0, s: 0, l: 100, name: "Pure White" } as HSLColor,
    },

    // Semantic Colors
    semantic: {
        success: { h: 145, s: 80, l: 45, name: "Matrix Green" } as HSLColor,
        warning: { h: 45, s: 100, l: 50, name: "Amber Alert" } as HSLColor,
        error: { h: 0, s: 85, l: 55, name: "Critical Red" } as HSLColor,
        info: { h: 210, s: 90, l: 55, name: "Info Blue" } as HSLColor,
    },

    // Glass Overlays (Alpha Values)
    glass: {
        ultraLight: 0.03,
        thin: 0.1,
        light: 0.15,
        medium: 0.25,
        heavy: 0.4,
        frosted: 0.7,
        solid: 0.85,
        opaque: 0.95,
    },

    // Neon Glow Colors
    neon: {
        purple: "rgba(157, 78, 221, 0.8)",
        cyan: "rgba(0, 255, 255, 0.8)",
        pink: "rgba(255, 0, 128, 0.8)",
        green: "rgba(0, 255, 128, 0.8)",
        orange: "rgba(255, 128, 0, 0.8)",
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TYPOGRAPHY SYSTEM (Fluid Responsive)
// ═══════════════════════════════════════════════════════════════════════════════

export const TYPOGRAPHY = {
    fontFamily: {
        sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "'Outfit', 'Inter', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        heading: "'Inter', sans-serif",
        body: "'Inter', sans-serif",
    },

    // Fluid Scale (clamp-based for responsiveness)
    scale: {
        xs: "clamp(0.625rem, 0.6rem + 0.125vw, 0.75rem)",
        sm: "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
        base: "clamp(0.875rem, 0.8rem + 0.375vw, 1rem)",
        lg: "clamp(1rem, 0.9rem + 0.5vw, 1.125rem)",
        xl: "clamp(1.125rem, 1rem + 0.625vw, 1.25rem)",
        "2xl": "clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)",
        "3xl": "clamp(1.5rem, 1.3rem + 1vw, 1.875rem)",
        "4xl": "clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem)",
        "5xl": "clamp(2.25rem, 1.8rem + 2.25vw, 3rem)",
        "6xl": "clamp(3rem, 2.4rem + 3vw, 3.75rem)",
        "7xl": "clamp(3.75rem, 3rem + 3.75vw, 4.5rem)",
        "8xl": "clamp(4.5rem, 3.6rem + 4.5vw, 6rem)",
        "9xl": "clamp(6rem, 4.8rem + 6vw, 8rem)",
    },

    // Line Heights
    lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    },

    // Letter Spacing
    letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
    },

    // Font Weights
    fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
    },

    // Text Styles (Presets)
    presets: {
        h1: { fontSize: "5xl", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em" },
        h2: { fontSize: "4xl", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" },
        h3: { fontSize: "3xl", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.015em" },
        h4: { fontSize: "2xl", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" },
        h5: { fontSize: "xl", fontWeight: 600, lineHeight: 1.3, letterSpacing: "0em" },
        h6: { fontSize: "lg", fontWeight: 600, lineHeight: 1.35, letterSpacing: "0em" },
        body: { fontSize: "base", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0em" },
        bodyLarge: { fontSize: "lg", fontWeight: 400, lineHeight: 1.6, letterSpacing: "0em" },
        bodySmall: { fontSize: "sm", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0em" },
        caption: { fontSize: "xs", fontWeight: 500, lineHeight: 1.4, letterSpacing: "0.02em" },
        overline: { fontSize: "xs", fontWeight: 600, lineHeight: 1.4, letterSpacing: "0.1em", textTransform: "uppercase" },
        label: { fontSize: "sm", fontWeight: 500, lineHeight: 1.4, letterSpacing: "0.01em" },
        code: { fontSize: "sm", fontWeight: 400, lineHeight: 1.6, fontFamily: "mono" },
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SPACING SYSTEM (8px Base Grid)
// ═══════════════════════════════════════════════════════════════════════════════

export const SPACING = {
    // Base Unit: 4px
    px: "1px",
    0: "0",
    0.5: "0.125rem",   // 2px
    1: "0.25rem",      // 4px
    1.5: "0.375rem",   // 6px
    2: "0.5rem",       // 8px
    2.5: "0.625rem",   // 10px
    3: "0.75rem",      // 12px
    3.5: "0.875rem",   // 14px
    4: "1rem",         // 16px
    5: "1.25rem",      // 20px
    6: "1.5rem",       // 24px
    7: "1.75rem",      // 28px
    8: "2rem",         // 32px
    9: "2.25rem",      // 36px
    10: "2.5rem",      // 40px
    11: "2.75rem",     // 44px
    12: "3rem",        // 48px
    14: "3.5rem",      // 56px
    16: "4rem",        // 64px
    20: "5rem",        // 80px
    24: "6rem",        // 96px
    28: "7rem",        // 112px
    32: "8rem",        // 128px
    36: "9rem",        // 144px
    40: "10rem",       // 160px
    44: "11rem",       // 176px
    48: "12rem",       // 192px
    52: "13rem",       // 208px
    56: "14rem",       // 224px
    60: "15rem",       // 240px
    64: "16rem",       // 256px
    72: "18rem",       // 288px
    80: "20rem",       // 320px
    96: "24rem",       // 384px

    // Semantic Spacing
    section: "4rem",
    container: "1.5rem",
    card: "1.5rem",
    cardSm: "1rem",
    cardLg: "2rem",
    input: "0.75rem",
    button: "0.75rem 1.5rem",
    buttonSm: "0.5rem 1rem",
    buttonLg: "1rem 2rem",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 4. BORDER RADIUS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export const RADIUS = {
    none: "0",
    sm: "0.25rem",     // 4px
    DEFAULT: "0.5rem", // 8px
    md: "0.75rem",     // 12px
    lg: "1rem",        // 16px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "2rem",     // 32px
    "4xl": "2.5rem",   // 40px
    full: "9999px",

    // Semantic
    button: "0.75rem",
    input: "0.75rem",
    card: "1.25rem",
    cardSm: "0.75rem",
    cardLg: "1.5rem",
    modal: "1.5rem",
    badge: "9999px",
    avatar: "9999px",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SHADOWS & ELEVATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export const SHADOWS = {
    // Standard Shadows
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",

    // Neon Glow Shadows
    neonPurple: "0 0 20px rgba(157, 78, 221, 0.5), 0 0 40px rgba(157, 78, 221, 0.3)",
    neonCyan: "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)",
    neonPink: "0 0 20px rgba(255, 0, 128, 0.5), 0 0 40px rgba(255, 0, 128, 0.3)",
    neonGreen: "0 0 20px rgba(0, 255, 128, 0.5), 0 0 40px rgba(0, 255, 128, 0.3)",

    // Glass Shadows
    glassLight: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    glassMedium: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    glassHeavy: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",

    // Elevation
    elevation: {
        0: "none",
        1: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        2: "0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)",
        3: "0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)",
        4: "0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)",
        5: "0 20px 40px rgba(0,0,0,0.2)",
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PHYSICS & ANIMATION CONSTANTS (Framer Motion Compatible)
// ═══════════════════════════════════════════════════════════════════════════════

export const PHYSICS = {
    // Spring Configurations
    springs: {
        gentle: { stiffness: 100, damping: 30, mass: 1 },
        wobbly: { stiffness: 180, damping: 12, mass: 1 },
        stiff: { stiffness: 200, damping: 20, mass: 1 },
        molasses: { stiffness: 100, damping: 40, mass: 1 },
        snappy: { stiffness: 400, damping: 30, mass: 0.8 },
        bouncy: { stiffness: 300, damping: 10, mass: 1 },
        slow: { stiffness: 50, damping: 20, mass: 1 },
        fast: { stiffness: 500, damping: 40, mass: 0.5 },
        instant: { stiffness: 1000, damping: 50, mass: 0.2 },
    },

    // Easing Functions (Cubic Bezier)
    easing: {
        linear: [0, 0, 1, 1],
        easeIn: [0.4, 0, 1, 1],
        easeOut: [0, 0, 0.2, 1],
        easeInOut: [0.4, 0, 0.2, 1],
        easeInQuad: [0.55, 0.085, 0.68, 0.53],
        easeOutQuad: [0.25, 0.46, 0.45, 0.94],
        easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
        easeInCubic: [0.55, 0.055, 0.675, 0.19],
        easeOutCubic: [0.215, 0.61, 0.355, 1],
        easeInOutCubic: [0.645, 0.045, 0.355, 1],
        easeInExpo: [0.95, 0.05, 0.795, 0.035],
        easeOutExpo: [0.19, 1, 0.22, 1],
        easeInOutExpo: [1, 0, 0, 1],
        easeInBack: [0.6, -0.28, 0.735, 0.045],
        easeOutBack: [0.175, 0.885, 0.32, 1.275],
        easeInOutBack: [0.68, -0.55, 0.265, 1.55],
    },

    // Duration Presets (ms)
    durations: {
        instant: 0,
        fast: 100,
        normal: 200,
        slow: 300,
        slower: 500,
        slowest: 800,
        splash: 1000,
        pageTransition: 400,
        modalOpen: 250,
        modalClose: 200,
        hover: 150,
        focus: 100,
        tooltip: 150,
        notification: 300,
    },

    // Delays
    delays: {
        none: 0,
        short: 50,
        normal: 100,
        long: 200,
        stagger: 50,
        staggerLong: 100,
    },

    // Z-Index Layers
    zIndex: {
        behind: -1,
        base: 0,
        dropdown: 1000,
        sticky: 1100,
        modal: 1200,
        popover: 1300,
        tooltip: 1400,
        toast: 1500,
        overlay: 1600,
        spotlight: 1700,
        cursor: 9999,
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 7. BREAKPOINTS & CONTAINER SIZES
// ═══════════════════════════════════════════════════════════════════════════════

export const BREAKPOINTS = {
    // Screen Breakpoints
    screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
        "4k": "2560px",
    },

    // Container Max Widths
    containers: {
        xs: "100%",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
        full: "100%",
    },

    // Aspect Ratios
    aspectRatio: {
        auto: "auto",
        square: "1 / 1",
        video: "16 / 9",
        portrait: "3 / 4",
        landscape: "4 / 3",
        widescreen: "21 / 9",
        golden: "1.618 / 1",
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 8. GLASSMORPHISM UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export type GlassIntensity = "ultra_light" | "light" | "medium" | "heavy" | "frosted" | "solid";

export interface GlassStyle {
    background: string;
    backdropFilter: string;
    WebkitBackdropFilter: string;
    border: string;
    boxShadow: string;
}

export function generateGlassEffect(
    intensity: GlassIntensity = "medium",
    tint: "neutral" | "brand" | "success" | "error" | "warning" = "neutral"
): GlassStyle {
    const alphas: Record<GlassIntensity, number> = {
        ultra_light: 0.03,
        light: 0.08,
        medium: 0.15,
        heavy: 0.3,
        frosted: 0.6,
        solid: 0.85,
    };

    const blurs: Record<GlassIntensity, number> = {
        ultra_light: 4,
        light: 8,
        medium: 16,
        heavy: 24,
        frosted: 32,
        solid: 40,
    };

    const tintColors: Record<string, string> = {
        neutral: "255, 255, 255",
        brand: "157, 78, 221",
        success: "34, 197, 94",
        error: "239, 68, 68",
        warning: "234, 179, 8",
    };

    const alpha = alphas[intensity];
    const blur = blurs[intensity];
    const color = tintColors[tint];

    return {
        background: `rgba(${color}, ${alpha})`,
        backdropFilter: `blur(${blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
        border: `1px solid rgba(255, 255, 255, ${alpha * 0.5})`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, ${alpha * 1.5}), inset 0 1px 0 rgba(255, 255, 255, ${alpha * 0.3})`,
    };
}

export function generateNeonGlow(
    color: "purple" | "cyan" | "pink" | "green" | "orange" = "purple",
    intensity: number = 1,
    spread: number = 20
): string {
    const colors: Record<string, string> = {
        purple: "157, 78, 221",
        cyan: "0, 255, 255",
        pink: "255, 0, 128",
        green: "0, 255, 128",
        orange: "255, 128, 0",
    };

    const rgb = colors[color];
    const alphaInner = 0.6 * intensity;
    const alphaOuter = 0.3 * intensity;

    return `0 0 ${spread}px rgba(${rgb}, ${alphaInner}), 0 0 ${spread * 2}px rgba(${rgb}, ${alphaOuter})`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. COMPONENT SCHEMAS (Atomic Design)
// ═══════════════════════════════════════════════════════════════════════════════

export type ButtonVariant = "solid" | "outline" | "ghost" | "neon" | "glass" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonColorScheme = "brand" | "neutral" | "success" | "warning" | "error" | "info";

export const COMPONENTS = {
    button: {
        base: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: SPACING[2],
            fontWeight: TYPOGRAPHY.fontWeight.medium,
            borderRadius: RADIUS.button,
            cursor: "pointer",
            transition: `all ${PHYSICS.durations.fast}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            outline: "none",
            whiteSpace: "nowrap",
            userSelect: "none",
        },
        sizes: {
            xs: { height: "28px", padding: "0 12px", fontSize: TYPOGRAPHY.scale.xs },
            sm: { height: "34px", padding: "0 16px", fontSize: TYPOGRAPHY.scale.sm },
            md: { height: "42px", padding: "0 20px", fontSize: TYPOGRAPHY.scale.base },
            lg: { height: "50px", padding: "0 28px", fontSize: TYPOGRAPHY.scale.lg },
            xl: { height: "58px", padding: "0 36px", fontSize: TYPOGRAPHY.scale.xl },
        },
        variants: {
            solid: { background: "var(--color-brand-primary)", color: "white" },
            outline: { background: "transparent", border: "2px solid var(--color-brand-primary)" },
            ghost: { background: "transparent", color: "var(--color-brand-primary)" },
            neon: { background: "transparent", boxShadow: SHADOWS.neonPurple },
            glass: generateGlassEffect("medium", "brand"),
            link: { background: "transparent", textDecoration: "underline" },
        },
    },

    input: {
        base: {
            width: "100%",
            height: "42px",
            padding: SPACING.input,
            borderRadius: RADIUS.input,
            border: "1px solid var(--color-neutral-300)",
            background: "var(--color-neutral-50)",
            color: "var(--color-neutral-900)",
            fontSize: TYPOGRAPHY.scale.base,
            transition: `all ${PHYSICS.durations.fast}ms ease`,
        },
        focus: {
            borderColor: "var(--color-brand-primary)",
            boxShadow: "0 0 0 3px rgba(157, 78, 221, 0.2)",
        },
        error: {
            borderColor: "var(--color-error)",
            boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)",
        },
    },

    card: {
        base: {
            ...generateGlassEffect("medium"),
            borderRadius: RADIUS.card,
            padding: SPACING.card,
            overflow: "hidden",
        },
        variants: {
            elevated: { ...generateGlassEffect("heavy"), boxShadow: SHADOWS.elevation[3] },
            flat: { background: "var(--color-neutral-100)", border: "none" },
            neon: { ...generateGlassEffect("light", "brand"), boxShadow: SHADOWS.neonPurple },
        },
    },

    modal: {
        overlay: {
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: PHYSICS.zIndex.modal,
        },
        content: {
            ...generateGlassEffect("heavy"),
            borderRadius: RADIUS.modal,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
        },
    },

    badge: {
        base: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px 8px",
            borderRadius: RADIUS.badge,
            fontSize: TYPOGRAPHY.scale.xs,
            fontWeight: TYPOGRAPHY.fontWeight.medium,
        },
        variants: {
            solid: { background: "var(--color-brand-primary)", color: "white" },
            outline: { border: "1px solid currentColor", background: "transparent" },
            subtle: { background: "rgba(157, 78, 221, 0.1)", color: "var(--color-brand-primary)" },
        },
    },

    avatar: {
        base: {
            borderRadius: RADIUS.avatar,
            overflow: "hidden",
            objectFit: "cover",
        },
        sizes: {
            xs: { width: "24px", height: "24px" },
            sm: { width: "32px", height: "32px" },
            md: { width: "40px", height: "40px" },
            lg: { width: "56px", height: "56px" },
            xl: { width: "80px", height: "80px" },
            "2xl": { width: "120px", height: "120px" },
        },
    },

    tooltip: {
        base: {
            ...generateGlassEffect("solid"),
            borderRadius: RADIUS.md,
            padding: "6px 12px",
            fontSize: TYPOGRAPHY.scale.sm,
            zIndex: PHYSICS.zIndex.tooltip,
            pointerEvents: "none",
        },
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 10. ICONOGRAPHY SYSTEM (SVG Paths)
// ═══════════════════════════════════════════════════════════════════════════════

export const ICONS = {
    // Navigation
    dashboard: "M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z",
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M6 18L18 6M6 6l12 12",
    back: "M15 19l-7-7 7-7",
    forward: "M9 5l7 7-7 7",
    up: "M5 15l7-7 7 7",
    down: "M19 9l-7 7-7-7",

    // Actions
    plus: "M12 4v16m8-8H4",
    minus: "M20 12H4",
    edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    delete: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    save: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",

    // Status
    check: "M5 13l4 4L19 7",
    warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    error: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",

    // Social
    instagram: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z",
    twitter: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
    linkedin: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z",
    tiktok: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z",

    // User
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 11-8 0 4 4 0 018 0z",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",

    // Business
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    money: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    chart: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 11. ACCESSIBILITY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const A11Y = {
    // ARIA Labels
    labels: {
        navigation: "Main navigation",
        search: "Search",
        menu: "Menu",
        close: "Close",
        loading: "Loading...",
        success: "Success",
        error: "Error",
        warning: "Warning",
    },

    // Focus Styles
    focus: {
        outline: "2px solid var(--color-brand-primary)",
        outlineOffset: "2px",
        boxShadow: "0 0 0 3px rgba(157, 78, 221, 0.3)",
    },

    // Skip Links
    skipLink: {
        position: "absolute",
        top: "-40px",
        left: "0",
        background: "var(--color-brand-primary)",
        color: "white",
        padding: "8px 16px",
        zIndex: PHYSICS.zIndex.spotlight,
        transition: `top ${PHYSICS.durations.fast}ms ease`,
    },

    // Screen Reader Only
    srOnly: {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
    },

    // Touch Target Minimum (48x48)
    minTouchTarget: {
        minWidth: "48px",
        minHeight: "48px",
    },

    // Color Contrast Ratios
    contrastRatios: {
        aaNormal: 4.5,
        aaLarge: 3,
        aaaNormal: 7,
        aaaLarge: 4.5,
    },

    // Motion Preferences
    reducedMotion: {
        transition: "none",
        animation: "none",
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 12. CSS VARIABLE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

export function generateRootCssVariables(): string {
    const hsl = (color: HSLColor) => `${color.h} ${color.s}% ${color.l}%`;

    return `
:root {
    /* Brand Colors */
    --color-brand-primary: hsl(${hsl(PALETTE.brand.primary)});
    --color-brand-secondary: hsl(${hsl(PALETTE.brand.secondary)});
    --color-brand-tertiary: hsl(${hsl(PALETTE.brand.tertiary)});
    --color-brand-accent: hsl(${hsl(PALETTE.brand.accent)});

    /* Neutral Colors */
    --color-neutral-0: hsl(${hsl(PALETTE.neutral[0])});
    --color-neutral-50: hsl(${hsl(PALETTE.neutral[50])});
    --color-neutral-100: hsl(${hsl(PALETTE.neutral[100])});
    --color-neutral-200: hsl(${hsl(PALETTE.neutral[200])});
    --color-neutral-300: hsl(${hsl(PALETTE.neutral[300])});
    --color-neutral-400: hsl(${hsl(PALETTE.neutral[400])});
    --color-neutral-500: hsl(${hsl(PALETTE.neutral[500])});
    --color-neutral-600: hsl(${hsl(PALETTE.neutral[600])});
    --color-neutral-700: hsl(${hsl(PALETTE.neutral[700])});
    --color-neutral-800: hsl(${hsl(PALETTE.neutral[800])});
    --color-neutral-900: hsl(${hsl(PALETTE.neutral[900])});

    /* Semantic Colors */
    --color-success: hsl(${hsl(PALETTE.semantic.success)});
    --color-warning: hsl(${hsl(PALETTE.semantic.warning)});
    --color-error: hsl(${hsl(PALETTE.semantic.error)});
    --color-info: hsl(${hsl(PALETTE.semantic.info)});

    /* Spacing */
    --spacing-1: ${SPACING[1]};
    --spacing-2: ${SPACING[2]};
    --spacing-3: ${SPACING[3]};
    --spacing-4: ${SPACING[4]};
    --spacing-5: ${SPACING[5]};
    --spacing-6: ${SPACING[6]};
    --spacing-8: ${SPACING[8]};

    /* Radius */
    --radius-sm: ${RADIUS.sm};
    --radius-md: ${RADIUS.md};
    --radius-lg: ${RADIUS.lg};
    --radius-xl: ${RADIUS.xl};
    --radius-full: ${RADIUS.full};

    /* Font Family */
    --font-sans: ${TYPOGRAPHY.fontFamily.sans};
    --font-display: ${TYPOGRAPHY.fontFamily.display};
    --font-mono: ${TYPOGRAPHY.fontFamily.mono};

    /* Physics */
    --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --duration-fast: ${PHYSICS.durations.fast}ms;
    --duration-normal: ${PHYSICS.durations.normal}ms;
    --duration-slow: ${PHYSICS.durations.slow}ms;
}
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. DESIGN SYSTEM EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const DesignSystem = {
    colors: PALETTE,
    type: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    physics: PHYSICS,
    breakpoints: BREAKPOINTS,
    components: COMPONENTS,
    icons: ICONS,
    a11y: A11Y,
    utils: {
        generateGlassEffect,
        generateNeonGlow,
        generateRootCssVariables,
    },
};

export default DesignSystem;
