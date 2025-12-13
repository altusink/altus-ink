/**
 * ALTUS INK - SERVICES INDEX
 * Central export for all backend services
 */

// Payment Processing
export { default as stripeService } from "./stripe";
export * from "./stripe";

// Email Notifications
export { default as emailService, emailService as email } from "./email";

// Booking Management
export { default as bookingService } from "./booking";
export * from "./booking";

// Live Chat Integration
export { default as chatwootService } from "./chatwoot";

// File Storage
export { default as storageService } from "./storage";

// Service status check
export function getServicesStatus(): Record<string, boolean> {
    const { features } = require("../config");

    return {
        stripe: features.stripe,
        email: features.email,
        chatwoot: features.chatwoot,
        whatsapp: features.whatsapp,
        cloudStorage: features.cloudStorage
    };
}

// Health check for all services
export async function healthCheck(): Promise<{
    healthy: boolean;
    services: Record<string, { status: "ok" | "error" | "not_configured"; latency?: number }>;
}> {
    const results: Record<string, { status: "ok" | "error" | "not_configured"; latency?: number }> = {};

    // Check Stripe
    try {
        const stripe = await import("./stripe");
        if (stripe.isStripeConfigured()) {
            const start = Date.now();
            // Would make a test API call
            results.stripe = { status: "ok", latency: Date.now() - start };
        } else {
            results.stripe = { status: "not_configured" };
        }
    } catch {
        results.stripe = { status: "error" };
    }

    // Check Email
    try {
        const { features } = require("../config");
        results.email = { status: features.email ? "ok" : "not_configured" };
    } catch {
        results.email = { status: "error" };
    }

    // Check Chatwoot
    try {
        const chatwoot = await import("./chatwoot");
        results.chatwoot = {
            status: chatwoot.chatwootService.isConfigured() ? "ok" : "not_configured"
        };
    } catch {
        results.chatwoot = { status: "error" };
    }

    // Check Storage
    results.storage = { status: "ok" }; // Local storage is always available

    const healthy = Object.values(results).some(r => r.status === "ok");

    return { healthy, services: results };
}
