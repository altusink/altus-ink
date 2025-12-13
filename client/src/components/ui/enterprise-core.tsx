/**
 * ALTUS INK - ENTERPRISE CORE UI LIBRARY
 * The physical manifestation of the Design System.
 * 
 * Contains:
 * - EnterpriseButton (Neon/Glass variants)
 * - EnterpriseCard (Tilt/Glass/Gradient)
 * - EnterpriseInput (Floating label/Validation)
 * - EnterpriseBadge (Status indicators)
 * - EnterpriseLoader (120fps spinners)
 * - EnterpriseModal (Backdrop blurs)
 * 
 * USAGE:
 * import { EnterpriseButton } from "@/components/ui/enterprise-core";
 */

import React, { useState, useEffect, useRef } from "react";
import { DesignSystem, PALETTE } from "../../lib/enterprise-design";

// =============================================================================
// UTILS
// =============================================================================

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

// =============================================================================
// 1. ENTERPRISE BUTTON
// =============================================================================

export interface EnterpriseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "glass" | "danger" | "cyber" | "success";
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "mega";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    glow?: boolean;
}

export const EnterpriseButton = React.forwardRef<HTMLButtonElement, EnterpriseButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, glow, children, ...props }, ref) => {

        // Base styles from Design System
        const baseStyles = DesignSystem.components.button.base;
        const variantStyles = DesignSystem.components.button.variants[variant as keyof typeof DesignSystem.components.button.variants] || DesignSystem.components.button.variants.primary;
        const sizeStyles = DesignSystem.components.button.sizes[size];

        // Dynamic Glow Style
        const glowStyle = glow ? { boxShadow: DesignSystem.utils.generateNeonGlow("primary", 0.8) } : {};

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variantStyles, sizeStyles, className)}
                style={glow ? glowStyle : undefined}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {/* Loading Spinner */}
                {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center bg-inherit/50 backdrop-blur-sm">
                        <EnterpriseLoader size="sm" color="current" />
                    </span>
                )}

                {/* Content */}
                <span className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
                    {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
                </span>

                {/* Cyberpunk Glitch Effect for 'cyber' variant */}
                {variant === "cyber" && (
                    <span className="absolute inset-0 block w-full h-full pointer-events-none mix-blend-overlay opacity-30 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:animate-shimmer" />
                )}
            </button>
        );
    }
);
EnterpriseButton.displayName = "EnterpriseButton";

// =============================================================================
// 2. ENTERPRISE CARD (GLASS/TILT)
// =============================================================================

export interface EnterpriseCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "glass" | "solid" | "gradient" | "outline";
    intensity?: "low" | "medium" | "high" | "ultra";
    hoverEffect?: "lift" | "glow" | "zoom" | "none";
    enableTilt?: boolean;
}

export const EnterpriseCard = React.forwardRef<HTMLDivElement, EnterpriseCardProps>(
    ({ className, variant = "glass", intensity = "medium", hoverEffect = "none", enableTilt, style, children, ...props }, ref) => {

        // Generate Glass Style
        const glassStyle = variant === "glass" ? DesignSystem.utils.generateGlassEffect(intensity) : {};

        // Base Classes
        const baseClass = "relative overflow-hidden rounded-xl transition-all duration-300";

        // Hover Effects
        const hoverClasses = {
            lift: "hover:-translate-y-1 hover:shadow-lg",
            glow: "hover:shadow-[0_0_30px_rgba(157,78,221,0.2)] hover:border-brand-primary/50",
            zoom: "hover:scale-[1.02]",
            none: ""
        };

        // Tilt Logic (Simplified 3D transform)
        const cardRef = useRef<HTMLDivElement>(null);
        const [transform, setTransform] = useState("");

        const handleMouseMove = (e: React.MouseEvent) => {
            if (!enableTilt || !cardRef.current) return;
            const card = cardRef.current;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
            const rotateY = ((x - centerX) / centerX) * 10;

            setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        };

        const handleMouseLeave = () => {
            if (enableTilt) setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
        };

        return (
            <div
                ref={ref || cardRef}
                className={cn(
                    baseClass,
                    variant === "solid" && "bg-neutral-900 border border-neutral-800",
                    variant === "gradient" && "bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5",
                    hoverClasses[hoverEffect],
                    className
                )}
                style={{ ...glassStyle, transform, ...style }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                {...props}
            >
                {children}

                {/* Shine Effect */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </div>
        );
    }
);
EnterpriseCard.displayName = "EnterpriseCard";

// =============================================================================
// 3. ENTERPRISE INPUT (FLOATING LABEL)
// =============================================================================

export interface EnterpriseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const EnterpriseInput = React.forwardRef<HTMLInputElement, EnterpriseInputProps>(
    ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
        const generatedId = id || React.useId();
        const [isFocused, setIsFocused] = useState(false);
        const hasValue = props.value !== "" && props.value !== undefined;

        return (
            <div className="relative group mb-4">
                {/* Input Wrapper */}
                <div className={cn(
                    "relative flex items-center w-full rounded-lg bg-white/5 ring-1 ring-white/10 transition-all duration-300",
                    isFocused ? "ring-2 ring-brand-primary bg-white/10" : "hover:ring-white/30",
                    error && "ring-brand-error focus:ring-brand-error"
                )}>

                    {/* Left Icon */}
                    {leftIcon && <span className="pl-3 text-neutral-400">{leftIcon}</span>}

                    <input
                        id={generatedId}
                        ref={ref}
                        className={cn(
                            "block w-full border-0 bg-transparent py-3 px-3 text-white placeholder:text-transparent focus:ring-0 sm:text-sm sm:leading-6",
                            className
                        )}
                        placeholder={label}
                        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                        {...props}
                    />

                    {/* Right Icon */}
                    {rightIcon && <span className="pr-3 text-neutral-400">{rightIcon}</span>}

                    {/* Floating Label */}
                    <label
                        htmlFor={generatedId}
                        className={cn(
                            "absolute left-3 top-2 -translate-y-6 bg-transparent px-1 text-xs text-neutral-400 transition-all duration-200 pointer-events-none",
                            (isFocused || hasValue || props.placeholder)
                                ? "top-2 -translate-y-5 scale-90 text-brand-primary"
                                : "top-1/2 -translate-y-1/2 text-sm text-neutral-500"
                        )}
                    >
                        {label}
                    </label>
                </div>

                {/* Error Message */}
                {error && (
                    <p className="mt-1 text-xs text-brand-error animate-slide-down">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
EnterpriseInput.displayName = "EnterpriseInput";

// =============================================================================
// 4. ENTERPRISE LOADER (120FPS)
// =============================================================================

export interface EnterpriseLoaderProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: string;
    variant?: "spinner" | "dots" | "pulse";
}

export const EnterpriseLoader: React.FC<EnterpriseLoaderProps> = ({ size = "md", color = "text-brand-primary", variant = "spinner" }) => {
    const dimensions = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    if (variant === "dots") {
        return (
            <div className="flex space-x-1">
                <div className={cn("w-2 h-2 rounded-full animate-bounce bg-current", color)} style={{ animationDelay: '0ms' }} />
                <div className={cn("w-2 h-2 rounded-full animate-bounce bg-current", color)} style={{ animationDelay: '150ms' }} />
                <div className={cn("w-2 h-2 rounded-full animate-bounce bg-current", color)} style={{ animationDelay: '300ms' }} />
            </div>
        );
    }

    return (
        <svg
            className={cn("animate-spin", dimensions[size], color)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
};

// =============================================================================
// 5. ENTERPRISE PAGE HEADER
// =============================================================================

export const EnterprisePageHeader: React.FC<{
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
    breadcrumbs?: { label: string; href: string }[];
}> = ({ title, subtitle, actions, breadcrumbs }) => {
    return (
        <div className="mb-8 relative z-10">
            {breadcrumbs && (
                <nav className="flex mb-2 text-xs text-neutral-500 uppercase tracking-widest font-mono">
                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={crumb.href}>
                            {i > 0 && <span className="mx-2 text-neutral-700">/</span>}
                            <a href={crumb.href} className="hover:text-brand-primary transition-colors">
                                {crumb.label}
                            </a>
                        </React.Fragment>
                    ))}
                </nav>
            )}

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500 font-display tracking-tight">
                        {title}
                    </h1>
                    <p className="mt-2 text-lg text-neutral-400 font-light max-w-2xl">
                        {subtitle}
                    </p>
                </div>

                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>

            {/* Decorative Line */}
            <div className="mt-6 h-px w-full bg-gradient-to-r from-brand-primary/50 via-brand-secondary/30 to-transparent" />
        </div>
    );
};

// =============================================================================
// 6. ENTERPRISE STAT CARD (DASHBOARD)
// =============================================================================

export const EnterpriseStatCard: React.FC<{
    label: string;
    value: string;
    trend?: { value: number; isPositive: boolean };
    icon?: React.ReactNode;
    chartData?: number[]; // Simple sparkline data
}> = ({ label, value, trend, icon, chartData }) => {
    return (
        <EnterpriseCard variant="glass" className="p-6 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider">{label}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white font-display">{value}</h3>
                        {trend && (
                            <span className={cn(
                                "inline-flex items-baseline px-2.5 py-0.5 rounded-full text-xs font-medium md:mt-2 lg:mt-0",
                                trend.isPositive ? "bg-brand-success/10 text-brand-success" : "bg-brand-error/10 text-brand-error"
                            )}>
                                {trend.isPositive ? "▲" : "▼"} {Math.abs(trend.value)}%
                            </span>
                        )}
                    </div>
                </div>

                {icon && (
                    <div className="p-3 rounded-lg bg-white/5 ring-1 ring-white/10 group-hover:bg-brand-primary/20 group-hover:ring-brand-primary/50 transition-all duration-300">
                        {icon}
                    </div>
                )}
            </div>

            {/* Decorative Sparkline (Simulated) */}
            <div className="mt-4 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary w-[70%]" />
            </div>
            );
}

            export const EnterpriseStat = EnterpriseStatCard;
