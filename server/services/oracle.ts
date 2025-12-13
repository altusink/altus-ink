/**
 * ALTUS INK - AI ORACLE SERVICE
 * Internal AI assistant for system monitoring, failure detection, and operational support
 * 
 * Features:
 * - Real-time anomaly detection
 * - System health monitoring
 * - Log analysis and error pattern recognition
 * - Proactive alerts and recommendations
 * - Knowledge base integration
 * - Automated incident response
 * - Performance insights
 * - Codebase-aware assistance
 * 
 * Recommended Models:
 * - Gemini 2.0 Flash (low cost, fast)
 * - Claude 3.5 Haiku (great reasoning, affordable)
 * - GPT-4o-mini (balanced)
 */

import { config, features } from "../config";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface OracleConfig {
    provider: "gemini" | "anthropic" | "openai";
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

export interface SystemHealthStatus {
    overall: "healthy" | "degraded" | "critical";
    services: Record<string, ServiceStatus>;
    timestamp: Date;
    alerts: HealthAlert[];
}

export interface ServiceStatus {
    name: string;
    status: "up" | "degraded" | "down";
    latency?: number;
    lastCheck: Date;
    errors?: string[];
}

export interface HealthAlert {
    id: string;
    severity: "info" | "warning" | "error" | "critical";
    category: string;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
    acknowledged: boolean;
}

export interface AnomalyDetection {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    data: Record<string, any>;
    recommendation: string;
    timestamp: Date;
}

export interface OracleQuery {
    question: string;
    context?: string;
    category?: "technical" | "business" | "operational" | "general";
}

export interface OracleResponse {
    answer: string;
    confidence: number;
    sources?: string[];
    actions?: SuggestedAction[];
}

export interface SuggestedAction {
    type: "investigate" | "fix" | "notify" | "escalate" | "monitor";
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    automated?: boolean;
}

export interface MetricsSnapshot {
    bookings: {
        total24h: number;
        confirmed: number;
        cancelled: number;
        pending: number;
    };
    payments: {
        total24h: number;
        succeeded: number;
        failed: number;
        refunded: number;
    };
    artists: {
        active: number;
        onboarding: number;
        inactive: number;
    };
    errors: {
        count24h: number;
        critical: number;
        byType: Record<string, number>;
    };
}

// =============================================================================
// KNOWLEDGE BASE
// =============================================================================

const SYSTEM_KNOWLEDGE = {
    architecture: `
    Altus Ink is a SaaS platform for tattoo booking management.
    
    Stack:
    - Frontend: React + TypeScript + Vite + Tailwind CSS
    - Backend: Node.js + Express + TypeScript
    - Database: PostgreSQL with Drizzle ORM
    - Payments: Stripe (checkout, connect for payouts)
    - Email: SendGrid/Resend
    - Live Chat: Chatwoot
    - Storage: Cloudinary/S3
    - Hosting: Railway
    
    Key Services:
    - server/services/stripe.ts - Payment processing
    - server/services/email.ts - Email notifications
    - server/services/booking.ts - Booking management
    - server/services/chatwoot.ts - Chat integration
    - server/services/storage.ts - File uploads
    - server/routes.ts - API endpoints
    
    User Roles:
    - CEO: Platform admin, manages artists, payouts, analytics
    - Artist: Manages bookings, calendar, earnings
    - Customer: Books sessions, views history
  `,

    commonIssues: [
        {
            pattern: "Payment failed with card_declined",
            cause: "Customer's card was declined by their bank",
            solution: "Customer should try another payment method or contact their bank"
        },
        {
            pattern: "Booking creation timeout",
            cause: "Database connection pool exhausted or slow query",
            solution: "Check database connections, optimize queries, scale if needed"
        },
        {
            pattern: "Email delivery failed",
            cause: "Invalid email address or provider rate limiting",
            solution: "Verify email addresses, check SendGrid/Resend dashboard for bounces"
        },
        {
            pattern: "Stripe webhook signature invalid",
            cause: "Webhook secret mismatch or request tampering",
            solution: "Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard"
        },
        {
            pattern: "Artist payout failed",
            cause: "Stripe Connect account not fully onboarded or restricted",
            solution: "Check artist's Stripe account status, complete verification"
        }
    ],

    criticalPaths: [
        "Booking creation → Payment → Confirmation email",
        "Artist payout calculation → Stripe transfer",
        "Customer cancellation → Refund processing → Notification",
        "Artist calendar sync → Availability calculation"
    ]
};

// =============================================================================
// ORACLE SERVICE CLASS
// =============================================================================

class OracleService {
    private config: OracleConfig;
    private enabled: boolean;
    private healthHistory: SystemHealthStatus[] = [];
    private alertHistory: HealthAlert[] = [];
    private metricsCache: MetricsSnapshot | null = null;
    private lastMetricsUpdate: Date | null = null;

    constructor() {
        // Default to Gemini (most cost-effective for monitoring)
        this.config = {
            provider: (process.env.ORACLE_PROVIDER as any) || "gemini",
            apiKey: process.env.ORACLE_API_KEY || process.env.GEMINI_API_KEY || "",
            model: process.env.ORACLE_MODEL || "gemini-2.0-flash-exp",
            maxTokens: 1024,
            temperature: 0.3 // Lower for more consistent analysis
        };
        this.enabled = !!this.config.apiKey;
    }

    /**
     * Check if Oracle is configured
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    // ===========================================================================
    // SYSTEM HEALTH MONITORING
    // ===========================================================================

    /**
     * Get current system health status
     */
    async getHealthStatus(): Promise<SystemHealthStatus> {
        const services: Record<string, ServiceStatus> = {};
        const alerts: HealthAlert[] = [];

        // Check Database
        try {
            const start = Date.now();
            await db.execute(sql`SELECT 1`);
            services.database = {
                name: "Database",
                status: "up",
                latency: Date.now() - start,
                lastCheck: new Date()
            };
        } catch (error: any) {
            services.database = {
                name: "Database",
                status: "down",
                lastCheck: new Date(),
                errors: [error.message]
            };
            alerts.push(this.createAlert("critical", "database", "Database connection failed", { error: error.message }));
        }

        // Check Stripe
        try {
            const { stripeService } = await import("./stripe");
            if (stripeService.isStripeConfigured && stripeService.isStripeConfigured()) {
                services.stripe = { name: "Stripe", status: "up", lastCheck: new Date() };
            } else {
                services.stripe = { name: "Stripe", status: "degraded", lastCheck: new Date(), errors: ["Not configured"] };
            }
        } catch (error: any) {
            services.stripe = { name: "Stripe", status: "down", lastCheck: new Date(), errors: [error.message] };
        }

        // Check Email
        try {
            const { features } = await import("../config");
            services.email = {
                name: "Email",
                status: features.email ? "up" : "degraded",
                lastCheck: new Date()
            };
        } catch (error: any) {
            services.email = { name: "Email", status: "down", lastCheck: new Date(), errors: [error.message] };
        }

        // Determine overall status
        const statuses = Object.values(services).map(s => s.status);
        let overall: "healthy" | "degraded" | "critical" = "healthy";
        if (statuses.includes("down")) {
            overall = "critical";
        } else if (statuses.includes("degraded")) {
            overall = "degraded";
        }

        const status: SystemHealthStatus = {
            overall,
            services,
            timestamp: new Date(),
            alerts
        };

        // Store in history
        this.healthHistory.push(status);
        if (this.healthHistory.length > 100) {
            this.healthHistory.shift();
        }

        return status;
    }

    /**
     * Create an alert
     */
    private createAlert(
        severity: HealthAlert["severity"],
        category: string,
        message: string,
        details?: Record<string, any>
    ): HealthAlert {
        const alert: HealthAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            severity,
            category,
            message,
            details,
            timestamp: new Date(),
            acknowledged: false
        };

        this.alertHistory.push(alert);
        return alert;
    }

    // ===========================================================================
    // METRICS & ANOMALY DETECTION
    // ===========================================================================

    /**
     * Collect current metrics
     */
    async collectMetrics(): Promise<MetricsSnapshot> {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Booking metrics
        const bookingStats = await db
            .select({
                total: sql<number>`count(*)`,
                confirmed: sql<number>`count(case when status = 'confirmed' then 1 end)`,
                cancelled: sql<number>`count(case when status = 'cancelled' then 1 end)`,
                pending: sql<number>`count(case when status = 'pending' then 1 end)`
            })
            .from(schema.bookings)
            .where(gte(schema.bookings.createdAt, yesterday));

        // Payment metrics
        const paymentStats = await db
            .select({
                total: sql<number>`count(*)`,
                succeeded: sql<number>`count(case when payment_status = 'succeeded' then 1 end)`,
                failed: sql<number>`count(case when payment_status = 'failed' then 1 end)`,
                refunded: sql<number>`count(case when payment_status = 'refunded' then 1 end)`
            })
            .from(schema.bookings)
            .where(gte(schema.bookings.createdAt, yesterday));

        // Artist metrics
        const artistStats = await db
            .select({
                active: sql<number>`count(case when is_active = true then 1 end)`,
                inactive: sql<number>`count(case when is_active = false then 1 end)`,
                onboarding: sql<number>`count(case when stripe_account_status = 'pending' then 1 end)`
            })
            .from(schema.artists);

        const metrics: MetricsSnapshot = {
            bookings: {
                total24h: bookingStats[0]?.total || 0,
                confirmed: bookingStats[0]?.confirmed || 0,
                cancelled: bookingStats[0]?.cancelled || 0,
                pending: bookingStats[0]?.pending || 0
            },
            payments: {
                total24h: paymentStats[0]?.total || 0,
                succeeded: paymentStats[0]?.succeeded || 0,
                failed: paymentStats[0]?.failed || 0,
                refunded: paymentStats[0]?.refunded || 0
            },
            artists: {
                active: artistStats[0]?.active || 0,
                inactive: artistStats[0]?.inactive || 0,
                onboarding: artistStats[0]?.onboarding || 0
            },
            errors: {
                count24h: 0, // Would come from error logging
                critical: 0,
                byType: {}
            }
        };

        this.metricsCache = metrics;
        this.lastMetricsUpdate = now;

        return metrics;
    }

    /**
     * Detect anomalies in current metrics
     */
    async detectAnomalies(): Promise<AnomalyDetection[]> {
        const metrics = await this.collectMetrics();
        const anomalies: AnomalyDetection[] = [];

        // High cancellation rate
        if (metrics.bookings.total24h > 10) {
            const cancellationRate = metrics.bookings.cancelled / metrics.bookings.total24h;
            if (cancellationRate > 0.3) {
                anomalies.push({
                    type: "high_cancellation_rate",
                    severity: cancellationRate > 0.5 ? "high" : "medium",
                    description: `Cancellation rate of ${(cancellationRate * 100).toFixed(1)}% detected in last 24h`,
                    data: { rate: cancellationRate, cancelled: metrics.bookings.cancelled, total: metrics.bookings.total24h },
                    recommendation: "Review cancellation reasons, check artist availability, verify booking flow",
                    timestamp: new Date()
                });
            }
        }

        // High payment failure rate
        if (metrics.payments.total24h > 5) {
            const failureRate = metrics.payments.failed / metrics.payments.total24h;
            if (failureRate > 0.1) {
                anomalies.push({
                    type: "high_payment_failure_rate",
                    severity: failureRate > 0.2 ? "critical" : "high",
                    description: `Payment failure rate of ${(failureRate * 100).toFixed(1)}% detected`,
                    data: { rate: failureRate, failed: metrics.payments.failed, total: metrics.payments.total24h },
                    recommendation: "Check Stripe dashboard for declined payments, verify payment integration",
                    timestamp: new Date()
                });
            }
        }

        // High pending bookings (not being confirmed)
        const pendingRate = metrics.bookings.pending / Math.max(metrics.bookings.total24h, 1);
        if (metrics.bookings.pending > 10 && pendingRate > 0.5) {
            anomalies.push({
                type: "high_pending_bookings",
                severity: "medium",
                description: `${metrics.bookings.pending} pending bookings (${(pendingRate * 100).toFixed(1)}% of total)`,
                data: { pending: metrics.bookings.pending, rate: pendingRate },
                recommendation: "Artists may not be confirming bookings in timely manner. Send reminders.",
                timestamp: new Date()
            });
        }

        return anomalies;
    }

    // ===========================================================================
    // AI QUERY INTERFACE
    // ===========================================================================

    /**
     * Ask the Oracle a question
     */
    async query(query: OracleQuery): Promise<OracleResponse> {
        if (!this.enabled) {
            return {
                answer: "Oracle AI is not configured. Set ORACLE_API_KEY in environment.",
                confidence: 0,
                actions: []
            };
        }

        const systemPrompt = this.buildSystemPrompt();
        const contextualInfo = await this.gatherContext(query.category);

        try {
            const response = await this.callAI(systemPrompt, query.question, contextualInfo);
            return this.parseAIResponse(response);
        } catch (error: any) {
            console.error("Oracle query error:", error);
            return {
                answer: `Error querying Oracle: ${error.message}`,
                confidence: 0,
                actions: [{ type: "investigate", description: "Check Oracle service configuration", priority: "high" }]
            };
        }
    }

    /**
     * Build system prompt with knowledge base
     */
    private buildSystemPrompt(): string {
        return `You are the AI Oracle for Altus Ink, a tattoo booking SaaS platform.
Your role is to:
1. Monitor system health and detect issues
2. Analyze logs and error patterns
3. Provide technical guidance based on the codebase
4. Suggest solutions for operational problems
5. Help debug issues and optimize performance

You have deep knowledge of the system architecture and common issues.

SYSTEM KNOWLEDGE:
${SYSTEM_KNOWLEDGE.architecture}

KNOWN ISSUES AND SOLUTIONS:
${SYSTEM_KNOWLEDGE.commonIssues.map(i => `- ${i.pattern}: ${i.solution}`).join('\n')}

CRITICAL PATHS TO MONITOR:
${SYSTEM_KNOWLEDGE.criticalPaths.join('\n')}

Always respond with:
1. A clear answer to the question
2. Confidence level (0-100%)
3. Suggested actions if applicable
4. Relevant code files or services to check`;
    }

    /**
     * Gather contextual information
     */
    private async gatherContext(category?: string): Promise<string> {
        const parts: string[] = [];

        // Get current health
        const health = await this.getHealthStatus();
        parts.push(`Current System Health: ${health.overall}`);
        parts.push(`Services: ${Object.entries(health.services).map(([k, v]) => `${k}:${v.status}`).join(", ")}`);

        // Get recent metrics
        if (this.metricsCache) {
            parts.push(`Recent Metrics (24h):`);
            parts.push(`- Bookings: ${this.metricsCache.bookings.total24h} total, ${this.metricsCache.bookings.cancelled} cancelled`);
            parts.push(`- Payments: ${this.metricsCache.payments.succeeded} succeeded, ${this.metricsCache.payments.failed} failed`);
        }

        // Get recent alerts
        const recentAlerts = this.alertHistory.slice(-5);
        if (recentAlerts.length > 0) {
            parts.push(`Recent Alerts:`);
            recentAlerts.forEach(a => parts.push(`- [${a.severity}] ${a.message}`));
        }

        return parts.join("\n");
    }

    /**
     * Call AI provider
     */
    private async callAI(systemPrompt: string, userQuestion: string, context: string): Promise<string> {
        const fullPrompt = `${systemPrompt}\n\nCURRENT CONTEXT:\n${context}\n\nQUESTION: ${userQuestion}`;

        switch (this.config.provider) {
            case "gemini":
                return this.callGemini(fullPrompt);
            case "anthropic":
                return this.callClaude(systemPrompt, `${context}\n\nQuestion: ${userQuestion}`);
            case "openai":
                return this.callOpenAI(systemPrompt, `${context}\n\nQuestion: ${userQuestion}`);
            default:
                throw new Error(`Unknown provider: ${this.config.provider}`);
        }
    }

    /**
     * Call Gemini API
     */
    private async callGemini(prompt: string): Promise<string> {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: this.config.maxTokens,
                        temperature: this.config.temperature
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    /**
     * Call Claude API
     */
    private async callClaude(systemPrompt: string, userMessage: string): Promise<string> {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.config.apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: this.config.model || "claude-3-haiku-20240307",
                max_tokens: this.config.maxTokens,
                system: systemPrompt,
                messages: [{ role: "user", content: userMessage }]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content?.[0]?.text || "";
    }

    /**
     * Call OpenAI API
     */
    private async callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model || "gpt-4o-mini",
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    }

    /**
     * Parse AI response into structured format
     */
    private parseAIResponse(raw: string): OracleResponse {
        // Extract confidence if mentioned
        const confidenceMatch = raw.match(/confidence[:\s]+(\d+)%?/i);
        const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.7;

        // Extract suggested actions
        const actions: SuggestedAction[] = [];
        const actionPatterns = [
            { pattern: /check\s+(.+?)(?:\.|,|$)/gi, type: "investigate" as const },
            { pattern: /fix\s+(.+?)(?:\.|,|$)/gi, type: "fix" as const },
            { pattern: /notify\s+(.+?)(?:\.|,|$)/gi, type: "notify" as const },
            { pattern: /monitor\s+(.+?)(?:\.|,|$)/gi, type: "monitor" as const }
        ];

        for (const { pattern, type } of actionPatterns) {
            let match;
            while ((match = pattern.exec(raw)) !== null) {
                actions.push({
                    type,
                    description: match[1].trim(),
                    priority: raw.toLowerCase().includes("urgent") ? "urgent" : "medium"
                });
            }
        }

        return {
            answer: raw,
            confidence,
            actions: actions.slice(0, 5) // Max 5 actions
        };
    }

    // ===========================================================================
    // AUTOMATED MONITORING
    // ===========================================================================

    /**
     * Run periodic health check (called by scheduler)
     */
    async runHealthCheck(): Promise<{
        health: SystemHealthStatus;
        anomalies: AnomalyDetection[];
        alerts: HealthAlert[];
    }> {
        const health = await this.getHealthStatus();
        const anomalies = await this.detectAnomalies();

        // Create alerts for critical anomalies
        const newAlerts: HealthAlert[] = [];
        for (const anomaly of anomalies) {
            if (anomaly.severity === "critical" || anomaly.severity === "high") {
                newAlerts.push(this.createAlert(
                    anomaly.severity === "critical" ? "critical" : "warning",
                    anomaly.type,
                    anomaly.description,
                    anomaly.data
                ));
            }
        }

        return { health, anomalies, alerts: newAlerts };
    }

    /**
     * Get unacknowledged alerts
     */
    getActiveAlerts(): HealthAlert[] {
        return this.alertHistory.filter(a => !a.acknowledged);
    }

    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string): boolean {
        const alert = this.alertHistory.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            return true;
        }
        return false;
    }

    /**
     * Get system summary for dashboard
     */
    async getSystemSummary(): Promise<{
        health: SystemHealthStatus;
        metrics: MetricsSnapshot;
        activeAlerts: number;
        recentAnomalies: AnomalyDetection[];
    }> {
        const health = await this.getHealthStatus();
        const metrics = await this.collectMetrics();
        const anomalies = await this.detectAnomalies();

        return {
            health,
            metrics,
            activeAlerts: this.getActiveAlerts().length,
            recentAnomalies: anomalies
        };
    }
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const oracleService = new OracleService();

export default oracleService;

// =============================================================================
// SCHEDULED TASKS (would be called by cron/scheduler)
// =============================================================================

/**
 * Schedule regular health checks (every 5 minutes)
 */
export async function scheduleHealthChecks() {
    setInterval(async () => {
        try {
            const result = await oracleService.runHealthCheck();

            if (result.health.overall === "critical") {
                console.error("🚨 CRITICAL: System health is critical!", result.alerts);
                // Would send urgent notification to admin
            } else if (result.anomalies.length > 0) {
                console.warn("⚠️ Anomalies detected:", result.anomalies.map(a => a.description));
            }
        } catch (error) {
            console.error("Health check failed:", error);
        }
    }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Schedule daily report generation
 */
export async function scheduleDailyReport() {
    // Would run at configured time (e.g., 9am)
    const summary = await oracleService.getSystemSummary();

    console.log("📊 Daily System Report:");
    console.log(`Health: ${summary.health.overall}`);
    console.log(`Bookings (24h): ${summary.metrics.bookings.total24h}`);
    console.log(`Active Alerts: ${summary.activeAlerts}`);

    // Would send email to CEO/admin
}
