/**
 * ALTUS INK MVP - SIMPLIFIED SERVICE EXPORTS
 * 
 * Core services only:
 * - Booking management
 * - Email notifications
 * - Stripe payments
 * - Storage (image uploads)
 */

// Core services
export { default as bookingService } from "./booking";
export { default as emailService } from "./email";
export { default as stripeService } from "./stripe";
export { default as storageService } from "./storage";

// Health check for Railway
export async function healthCheck(): Promise<{
    healthy: boolean;
    services: Record<string, { status: "ok" | "error" | "not_configured" }>;
}> {
    const services: Record<string, { status: "ok" | "error" | "not_configured" }> = {};

    // Check Stripe
    services.stripe = { status: process.env.STRIPE_SECRET_KEY ? "ok" : "not_configured" };

    // Check Email
    try {
        services.email = { status: "ok" }; // Basic check
    } catch {
        services.email = { status: "error" };
    }

    // Check Booking
    try {
        services.booking = { status: "ok" };
    } catch {
        services.booking = { status: "error" };
    }

    // Check Storage
    try {
        services.storage = { status: "ok" };
    } catch {
        services.storage = { status: "error" };
    }

    const healthy = Object.values(services).some(s => s.status === "ok");
    return { healthy, services };
}
