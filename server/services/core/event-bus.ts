/**
 * ALTUS INK - ENTERPRISE EVENT BUS CORE
 * Central nervous system for decoupling SaaS micro-services
 * 
 * Purpose:
 * Allows services to communicate asynchronously without tight coupling.
 * Critical for workflows like:
 * - New Booking -> Notify Artist + Block Calendar + Charge Deposit + AI Schedule Optimization
 * - Subscription Change -> Update Usage Limits + Notify Billing + Adjust Features
 * 
 * Features:
 * - Distributed event handling (simulated)
 * - Message persistence & replay
 * - Dead letter queues for failed events
 * - Priority processing
 * - Middleware support (Audit logging, Metrics)
 * - Typed event payloads
 */

import { randomUUID } from "crypto";

// =============================================================================
// EVENT TYPES
// =============================================================================

export type EventPriority = "critical" | "high" | "normal" | "low" | "background";

export interface EventEnvelope<T = any> {
    id: string;
    topic: string;
    source: string;
    payload: T;
    priority: EventPriority;
    timestamp: Date;
    correlationId: string;
    version: string;
    metadata: Record<string, any>;
    retryCount: number;
}

export interface EventHandler<T = any> {
    id: string;
    topic: string; // Supports wildcards: "booking.*", "billing.invoice.paid"
    handle: (event: EventEnvelope<T>) => Promise<void>;
    options?: HandlerOptions;
}

export interface HandlerOptions {
    name: string;
    concurrency?: number;
    retryPolicy?: RetryPolicy;
    filter?: (event: EventEnvelope) => boolean;
}

export interface RetryPolicy {
    maxAttempts: number;
    backoff: "fixed" | "exponential";
    initialDelayMs: number;
    maxDelayMs: number;
}

// =============================================================================
// ALTUS SPECIFIC DOMAIN EVENTS (Examples)
// =============================================================================

export const TOPICS = {
    // Booking Domain
    BOOKING_CREATED: "booking.created",
    BOOKING_CONFIRMED: "booking.confirmed",
    BOOKING_CANCELLED: "booking.cancelled",
    BOOKING_RESCHEDULED: "booking.rescheduled",
    BOOKING_COMPLETED: "booking.completed",

    // Payment Domain
    PAYMENT_PROCESSED: "payment.processed",
    PAYMENT_FAILED: "payment.failed",
    REFUND_PROCESSED: "payment.refunded",

    // Subscription Domain
    SUBSCRIPTION_CREATED: "subscription.created",
    SUBSCRIPTION_UPDATED: "subscription.updated",
    SUBSCRIPTION_CANCELLED: "subscription.cancelled",
    USAGE_LIMIT_REACHED: "subscription.usage_limit_reached",

    // Artist Domain
    ARTIST_ONBOARDED: "artist.onboarded",
    ARTIST_VERIFIED: "artist.verified",
    PORTFOLIO_UPDATED: "artist.portfolio_updated",

    // AI Domain
    AI_PREDICTION_READY: "ai.prediction_ready",
    AI_IMAGE_GENERATED: "ai.image_generated",

    // System
    SYSTEM_ALERT: "system.alert",
    AUDIT_LOG: "system.audit",
} as const;

// =============================================================================
// EVENT BUS IMPLEMENTATION
// =============================================================================

export class EventBus {
    private handlers: Map<string, EventHandler[]> = new Map();
    private middlewares: Middleware[] = [];
    private dlq: EventEnvelope[] = []; // Dead Letter Queue
    private eventStore: EventEnvelope[] = []; // Persistence (In-memory for now)

    // Metrics
    private metrics = {
        published: 0,
        processed: 0,
        failed: 0,
        retried: 0,
        handlers: 0
    };

    constructor() {
        this.setupSystemHandlers();
    }

    /**
     * Register a middleware to intercept events
     */
    use(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * Publish an event to the bus
     */
    async publish<T>(
        topic: string,
        payload: T,
        options: {
            source?: string;
            priority?: EventPriority;
            correlationId?: string;
            metadata?: Record<string, any>;
        } = {}
    ): Promise<string> {
        const event: EventEnvelope<T> = {
            id: randomUUID(),
            topic,
            source: options.source || "system",
            payload,
            priority: options.priority || "normal",
            timestamp: new Date(),
            correlationId: options.correlationId || randomUUID(),
            version: "1.0.0",
            metadata: options.metadata || {},
            retryCount: 0
        };

        // Run Middlewares (Pre-processing)
        for (const mw of this.middlewares) {
            if (mw.onPublish) {
                try {
                    await mw.onPublish(event);
                } catch (err) {
                    console.error(`[EventBus] Middleware error on publish:`, err);
                    // Decide whether to block or continue. For now, log and continue.
                }
            }
        }

        // Persist
        this.eventStore.push(event);
        this.metrics.published++;

        // Asynchronously dispatch to handlers
        this.dispatch(event).catch(err => {
            console.error(`[EventBus] Critical dispatch error for ${event.id}:`, err);
        });

        return event.id;
    }

    /**
     * Subscribe to a topic
     */
    subscribe<T>(
        topic: string,
        handlerFn: (event: EventEnvelope<T>) => Promise<void>,
        options: HandlerOptions
    ): () => void {
        const handler: EventHandler<T> = {
            id: randomUUID(),
            topic,
            handle: handlerFn,
            options
        };

        if (!this.handlers.has(topic)) {
            this.handlers.set(topic, []);
        }
        this.handlers.get(topic)!.push(handler);
        this.metrics.handlers++;

        console.log(`[EventBus] Subscribed ${options.name} to ${topic}`);

        // Return unsubscribe function
        return () => {
            const handlers = this.handlers.get(topic);
            if (handlers) {
                const idx = handlers.findIndex(h => h.id === handler.id);
                if (idx !== -1) {
                    handlers.splice(idx, 1);
                    this.metrics.handlers--;
                }
            }
        };
    }

    /**
     * Internal Dispatch Logic
     */
    private async dispatch(event: EventEnvelope) {
        const matchedHandlers = this.getHandlersForTopic(event.topic);

        if (matchedHandlers.length === 0) {
            // console.warn(`[EventBus] No handlers for topic: ${event.topic}`);
            return;
        }

        const promises = matchedHandlers.map(handler => this.executeHandler(handler, event));
        await Promise.allSettled(promises);
    }

    /**
     * Execute a single handler with retry logic
     */
    private async executeHandler(handler: EventHandler, event: EventEnvelope) {
        // Filter check
        if (handler.options?.filter && !handler.options.filter(event)) {
            return;
        }

        const start = Date.now();
        try {
            await handler.handle(event);
            this.metrics.processed++;

            // Middleware Post-Process
            // if (this.metrics.processed % 100 === 0) console.log(`[EventBus] Processed ${this.metrics.processed} events`);

        } catch (error) {
            this.metrics.failed++;
            // console.error(`[EventBus] Handler ${handler.options?.name} failed for ${event.topic}:`, error);

            // Retry Logic
            const policy = handler.options?.retryPolicy || { maxAttempts: 3, backoff: "fixed", initialDelayMs: 1000, maxDelayMs: 5000 };

            if (event.retryCount < policy.maxAttempts) {
                event.retryCount++;
                this.metrics.retried++;

                let delay = policy.initialDelayMs;
                if (policy.backoff === "exponential") {
                    delay = Math.min(policy.maxDelayMs, policy.initialDelayMs * Math.pow(2, event.retryCount));
                }

                setTimeout(() => {
                    // console.log(`[EventBus] Retrying ${handler.options?.name} for ${event.topic} (Attempt ${event.retryCount})`);
                    this.executeHandler(handler, event);
                }, delay);

            } else {
                // DLQ
                // console.error(`[EventBus] Max retries reached used for ${handler.options?.name}. Moving to DLQ.`);
                this.dlq.push({ ...event, metadata: { ...event.metadata, failedHandler: handler.options?.name, error: String(error) } });
            }
        }
    }

    private getHandlersForTopic(topic: string): EventHandler[] {
        const matches: EventHandler[] = [];

        // Direct match
        if (this.handlers.has(topic)) {
            matches.push(...this.handlers.get(topic)!);
        }

        // Wildcard match (Simple * support)
        for (const [key, handlers] of this.handlers.entries()) {
            if (key.includes("*")) {
                const regex = new RegExp("^" + key.replace("*", ".*") + "$");
                if (regex.test(topic)) {
                    matches.push(...handlers);
                }
            }
        }

        return matches;
    }

    private setupSystemHandlers() {
        // Example: Audit Logger always listens to everything
        this.subscribe("*", async (event) => {
            // In a real app, this would write to the AuditService
            // console.log(`[Audit] ${event.timestamp.toISOString()} | ${event.priority.toUpperCase()} | ${event.topic} | ${event.id}`);
        }, { name: "AuditLogger", retryPolicy: { maxAttempts: 1, backoff: "fixed", initialDelayMs: 0, maxDelayMs: 0 } });
    }

    /**
     * Replay events for recovery or debugging
     */
    async replayEvents(fromDate: Date, topicFilter?: string) {
        const events = this.eventStore.filter(e =>
            e.timestamp >= fromDate &&
            (!topicFilter || e.topic.includes(topicFilter))
        );

        console.log(`[EventBus] Replaying ${events.length} events...`);
        for (const event of events) {
            await this.dispatch({ ...event, id: randomUUID(), metadata: { ...event.metadata, isReplay: true } });
        }
    }

    getStats() {
        return {
            activeHandlers: this.metrics.handlers,
            topicCount: this.handlers.size,
            queueDepth: this.eventStore.length,
            dlqSize: this.dlq.length,
            metrics: this.metrics
        };
    }
}

export interface Middleware {
    onPublish?: (event: EventEnvelope) => Promise<void>;
    onConsume?: (event: EventEnvelope, handlerName: string) => Promise<void>;
}

// Singleton Instance
export const eventBus = new EventBus();

// =============================================================================
// DEMO MIDDLEWARE
// =============================================================================

export class PerformanceMonitorMiddleware implements Middleware {
    async onPublish(event: EventEnvelope) {
        // Attach trace ID if missing
        if (!event.metadata.traceId) {
            event.metadata.traceId = randomUUID();
        }
    }
}

eventBus.use(new PerformanceMonitorMiddleware());
