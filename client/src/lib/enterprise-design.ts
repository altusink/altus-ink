/**
 * ALTUS INK - ENTERPRISE DESIGN SYSTEM ENGINE
 * The visual physics, color theory, and interaction model for the entire platform.
 * 
 * Design Philosophy: "Neon Glass Realism"
 * - 120fps Animations
 * - GPU Accelerated Rendering
 * - HSL Variable-Based Theming
 * - Physical Light Simulation
 * 
 * This engine powers every pixel of the UI to ensure consistency and "wow" factor.
 */

// =============================================================================
// 1. COLOR PALETTES (HSL)
// =============================================================================

export const PALETTE = {
    // Brand Colors (Neon Cyberpunk)
    brand: {
        primary: { h: 265, s: 98, l: 60, name: "Electric Purple" }, // #9D4EDD
        secondary: { h: 180, s: 100, l: 50, name: "Cyan Future" }, // #00FFFF
        accent: { h: 320, s: 100, l: 60, name: "Hot Pink" }, // #FF3399
        success: { h: 145, s: 80, l: 45, name: "Matrix Green" },
        warning: { h: 45, s: 100, l: 50, name: "Hazard Yellow" },
        error: { h: 0, s: 100, l: 60, name: "Critical Red" },
        info: { h: 210, s: 100, l: 60, name: "Hologram Blue" }
    },

    // Neutral Scales (Obsidian Glass)
    neutral: {
        0: { h: 240, s: 20, l: 1 },   // #020203 (Deepest Void)
        50: { h: 240, s: 15, l: 3 },
        100: { h: 240, s: 12, l: 5 },
        200: { h: 240, s: 10, l: 10 },
        300: { h: 240, s: 8, l: 15 },
        400: { h: 240, s: 6, l: 25 },
        500: { h: 240, s: 5, l: 40 },
        600: { h: 240, s: 4, l: 60 },
        700: { h: 240, s: 3, l: 75 },
        800: { h: 240, s: 2, l: 85 },
        900: { h: 240, s: 1, l: 95 },
        1000: { h: 0, s: 0, l: 100 }  // Pure Light
    },

    // Glass Opacities
    glass: {
        thin: 0.1,
        medium: 0.25,
        thick: 0.4,
        frosted: 0.7,
        opaque: 0.95
    }
} as const;

// =============================================================================
// 2. TYPOGRAPHY SCALES (Fluid)
// =============================================================================

export const TYPOGRAPHY = {
    fontFamily: {
        sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "'Outfit', sans-serif",
        mono: "'JetBrains Mono', monospace"
    },

    // Fluid Type Scale (Desktop / Mobile)
    weights: {
        thin: 100,
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        black: 900
    },

    letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em" // For Caps Headers
    },

    lineHeights: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
    }
} as const;

// =============================================================================
// 3. PHYSICS & ANIMATION CONSTANTS (Framer Motion / Spring)
// =============================================================================

export const PHYSICS = {
    springs: {
        gentle: { stiffness: 100, damping: 30, mass: 1 },
        wobbly: { stiffness: 180, damping: 12, mass: 1 },
        stiff: { stiffness: 200, damping: 20, mass: 1 },
        snappy: { stiffness: 400, damping: 30, mass: 1 },
        explosive: { stiffness: 800, damping: 40, mass: 1 } // For critical alerts
    },

    transitions: {
        fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
        medium: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
        slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
        glitch: "50ms step-end"
    },

    zIndices: {
        base: 0,
        glassLayer: 10,
        content: 20,
        sticky: 100,
        dropdown: 200,
        overlay: 300,
        modal: 400,
        toast: 500,
        cursor: 9999
    }
} as const;

// =============================================================================
// 4. GENERATIVE GLASSMORPHISM UTILITIES
// =============================================================================

/**
 * Generates a CSS string for a glassmorphism panel based on intensity
 */
export function generateGlassEffect(
    intensity: "low" | "medium" | "high" | "ultra",
    color: keyof typeof PALETTE.neutral = 0
): Record<string, string> {
    const baseHsl = PALETTE.neutral[color];
    const hslString = `${baseHsl.h} ${baseHsl.s}% ${baseHsl.l}%`;

    const configs = {
        low: { bg: 0.1, blur: "5px", border: 0.1 },
        medium: { bg: 0.2, blur: "12px", border: 0.2 },
        high: { bg: 0.3, blur: "24px", border: 0.3 },
        ultra: { bg: 0.5, blur: "40px", border: 0.4 }
    };

    const cfg = configs[intensity];

    return {
        background: `hsl(${hslString} / ${cfg.bg})`,
        backdropFilter: `blur(${cfg.blur}) saturatel(180%)`,
        WebkitBackdropFilter: `blur(${cfg.blur}) saturate(180%)`, // Safari
        border: `1px solid hsl(255 255 255 / ${cfg.border})`,
        boxShadow: `
      0 4px 6px -1px hsl(0 0% 0% / 0.1), 
      0 2px 4px -1px hsl(0 0% 0% / 0.06),
      inset 0 1px 0 0 hsl(255 255 255 / ${cfg.border})
    `
    };
}

/**
 * Generates a Neon Glow CSS string
 */
export function generateNeonGlow(
    color: keyof typeof PALETTE.brand,
    intensity: number = 1
): string {
    const c = PALETTE.brand[color];
    const hsl = `hsl(${c.h} ${c.s}% ${c.l}%)`;

    return `0 0 ${10 * intensity}px ${hsl}, 0 0 ${20 * intensity}px ${hsl}, 0 0 ${40 * intensity}px ${hsl}`;
}

// =============================================================================
// 5. COMPONENT SCHEMAS (Atomic Design)
// =============================================================================

export type ButtonVariant = "primary" | "secondary" | "ghost" | "glass" | "danger" | "cyber";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "mega";

export const COMPONENTS = {
    button: {
        base: "relative inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden",
        variants: {
            primary: {
                bg: `bg-brand-primary`,
                text: "text-white",
                hover: "hover:bg-brand-primary-light hover:shadow-[0_0_20px_rgba(157,78,221,0.5)]",
                active: "active:scale-95"
            },
            glass: {
                bg: "bg-white/10",
                text: "text-white",
                backdrop: "backdrop-blur-md",
                border: "border border-white/20",
                hover: "hover:bg-white/20 hover:border-white/40",
            },
            cyber: {
                bg: "bg-transparent",
                text: "text-brand-secondary",
                border: "border border-brand-secondary",
                // Advanced clip-path shapes would go here in actual CSS
                hover: "hover:bg-brand-secondary/10 hover:shadow-[0_0_15px_#00FFFF]",
            }
        },
        sizes: {
            xs: "px-2.5 py-1.5 text-xs",
            sm: "px-3 py-2 text-sm",
            md: "px-4 py-2 text-sm",
            lg: "px-6 py-3 text-base",
            xl: "px-8 py-4 text-lg",
            mega: "px-10 py-6 text-xl tracking-widest uppercase"
        }
    },

    card: {
        base: "relative overflow-hidden rounded-xl transition-all duration-300 group",
        variants: {
            glass: "bg-neutral-900/40 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-neutral-900/50",
            solid: "bg-neutral-800 border border-neutral-700",
            gradient: "bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5"
        }
    },

    input: {
        base: "block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6 backdrop-blur-sm transition-all",
        error: "ring-red-500 focus:ring-red-500",
        valid: "ring-green-500 focus:ring-green-500"
    }
} as const;

// =============================================================================
// 6. GLOBAL CSS VARIABLES INJECTION
// =============================================================================

export const generateRootCssVariables = (): string => {
    let css = ":root {\n";

    // Colors
    Object.entries(PALETTE.brand).forEach(([key, val]) => {
        css += `  --color-brand-${key}: ${val.h} ${val.s}% ${val.l}%;\n`;
    });

    Object.entries(PALETTE.neutral).forEach(([key, val]) => {
        css += `  --color-neutral-${key}: ${val.h} ${val.s}% ${val.l}%;\n`;
    });

    // Typography
    css += `  --font-sans: ${TYPOGRAPHY.fontFamily.sans};\n`;
    css += `  --font-display: ${TYPOGRAPHY.fontFamily.display};\n`;

    // Physics
    css += `  --transition-fast: ${PHYSICS.transitions.fast};\n`;
    css += `  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);\n`;

    css += "}\n";
    return css;
};

// =============================================================================
// 7. ICONOGRAPHY SYSTEM (SVG PATHS)
// =============================================================================

export const ICONS = {
    // Custom drawn SVG paths optimized for small sizes
    logo: "M12 2L2 7l10 5 10-5-10-5zm0 9l2-1-10 5-10-5 2 1 8 4 8-4z",
    dashboard: "M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z",
    users: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    settings: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",

    // Social
    instagram: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
} as const;

// =============================================================================
// 8. ACCESSIBILITY HELPERS
// =============================================================================

export const A11Y = {
    srOnly: "absolute width-px height-px padding-0 margin-n1 overflow-hidden clip-rect-0 white-space-nowrap border-0",
    focusRing: "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-neutral-900",
} as const;

// =============================================================================
// EXPORT SYSTEM
// =============================================================================

export const DesignSystem = {
    colors: PALETTE,
    type: TYPOGRAPHY,
    physics: PHYSICS,
    components: COMPONENTS,
    icons: ICONS,
    a11y: A11Y,
    utils: {
        generateGlassEffect,
        generateNeonGlow
    }
};

export default DesignSystem;
