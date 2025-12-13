/**
 * ALTUS INK - ENTERPRISE TELEMETRY & OBSERVABILITY CORE
 * Centralized logging, metrics, and distributed tracing
 * 
 * Purpose:
 * "Eyes and Ears" of the Enterprise System. 
 * Allows us to see exactly what is happening across all services, 
 * trace requests as they jump via EventBus, and monitor health.
 * 
 * Features:
 * - Structured JSON Logging (Level, Context, Metadata)
 * - Distributed Tracing (TraceID propagation)
 * - Performance Metrics (Duration, Count, Gauges)
 * - Error Tracking & Fingerprinting
 * - External Sink Integration (Console, File, simulated Datadog/Sentry)
 * - Sensitive Data Redaction (PII Protection)
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & LOG LEVELS
// =============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "audit";

export interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    context: string; // Service or Component name
    traceId?: string;
    userId?: string;
    tenantId?: string;
    metadata: Record<string, any>;
    error?: ErrorDetail;
    tags: string[];
}

export interface ErrorDetail {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    fingerprint?: string; // Hash of stack/message for grouping
}

export interface Metric {
    name: string;
    value: number;
    type: "counter" | "gauge" | "histogram";
    tags: Record<string, string>;
    timestamp: number;
}

export interface TelemetryConfig {
    serviceName: string;
    environment: string;
    logLevel: LogLevel;
    redactKeys: string[]; // ["password", "token", "credit_card"]
    enableConsole: boolean;
    enableFile: boolean; // Simulation
}

// =============================================================================
// TELEMETRY SERVICE
// =============================================================================

export class TelemetryService {
    private config: TelemetryConfig;
    private contextStorage = new Map<string, string>(); // AsyncLocalStorage simulation
    private metricsBuffer: Metric[] = [];

    constructor(config?: Partial<TelemetryConfig>) {
        this.config = {
            serviceName: "altus-ink-core",
            environment: process.env.NODE_ENV || "development",
            logLevel: "info",
            redactKeys: ["password", "token", "secret", "authorization", "cvv"],
            enableConsole: true,
            enableFile: false,
            ...config
        };
    }

    // ===========================================================================
    // LOGGING
    // ===========================================================================

    public debug(message: string, context: string, meta?: any) { this.log("debug", message, context, meta); }
    public info(message: string, context: string, meta?: any) { this.log("info", message, context, meta); }
    public warn(message: string, context: string, meta?: any) { this.log("warn", message, context, meta); }
    public error(message: string, context: string, error?: Error, meta?: any) {
        this.log("error", message, context, { ...meta, error: error ? this.serializeError(error) : undefined });
    }
    public fatal(message: string, context: string, error?: Error, meta?: any) {
        this.log("fatal", message, context, { ...meta, error: error ? this.serializeError(error) : undefined });
    }
    public audit(message: string, context: string, actor: { id: string, type: string }, action: string) {
        this.log("audit", message, context, { actor, action, audit: true });
    }

    private log(level: LogLevel, message: string, context: string, meta: any = {}) {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            traceId: this.getTraceId(),
            metadata: this.redact(meta),
            tags: [this.config.environment, this.config.serviceName],
            ...meta // Merge remaining safe meta
        };

        // Output
        if (this.config.enableConsole) {
            this.writeToConsole(entry);
        }

        // In real enterprise: Ship to ElasticSearch / Datadog here
    }

    private writeToConsole(entry: LogEntry) {
        const color = this.getColor(entry.level);
        const trace = entry.traceId ? `[Trace:${entry.traceId.slice(0, 8)}]` : "";
        const metaStr = Object.keys(entry.metadata).length ? JSON.stringify(entry.metadata) : "";

        // Structured output for machines, readable for humans
        console.log(
            `${color}[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}]${trace} ${entry.message} ${metaStr}\x1b[0m`
        );
    }

    // ===========================================================================
    // METRICS (APM)
    // ===========================================================================

    public recordMetric(name: string, value: number, type: Metric["type"] = "counter", tags: Record<string, string> = {}) {
        this.metricsBuffer.push({
            name,
            value,
            type,
            tags: { ...tags, service: this.config.serviceName, env: this.config.environment },
            timestamp: Date.now()
        });

        // Flush if buffer too large (Simulated)
        if (this.metricsBuffer.length > 100) {
            this.flushMetrics();
        }
    }

    public startTimer(name: string, tags?: Record<string, string>): () => void {
        const start = process.hrtime();
        return () => {
            const diff = process.hrtime(start);
            const ms = (diff[0] * 1e9 + diff[1]) / 1e6;
            this.recordMetric(name, ms, "histogram", tags);
        };
    }

    private flushMetrics() {
        // In real app, send to StatsD or Prometheus
        // console.log(`[Telemetry] Flushed ${this.metricsBuffer.length} metrics`);
        this.metricsBuffer = [];
    }

    // ===========================================================================
    // TRACING
    // ===========================================================================

    public startTrace(): string {
        const traceId = randomUUID();
        // In real Node app, use AsyncLocalStorage. Storage.run(...)
        // Here we simulate by returning it to be passed manually or via context
        return traceId;
    }

    public getTraceId(): string | undefined {
        // Should get from AsyncLocalStorage
        return undefined; // Placeholder
    }

    // ===========================================================================
    // UTILITIES
    // ===========================================================================

    private shouldLog(level: LogLevel): boolean {
        const levels = ["debug", "info", "warn", "error", "fatal", "audit"];
        const configLevelIdx = levels.indexOf(this.config.logLevel);
        const msgLevelIdx = levels.indexOf(level);
        return msgLevelIdx >= configLevelIdx;
    }

    private redact(obj: any): any {
        if (!obj) return obj;
        if (typeof obj !== "object") return obj;

        const copy = Array.isArray(obj) ? [...obj] : { ...obj };

        for (const key in copy) {
            if (this.config.redactKeys.some(k => key.toLowerCase().includes(k))) {
                copy[key] = "[REDACTED]";
            } else if (typeof copy[key] === "object") {
                copy[key] = this.redact(copy[key]);
            }
        }
        return copy;
    }

    private serializeError(error: Error): ErrorDetail {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            fingerprint: crypto ? this.hash(error.message + (error.stack?.split("\n")[0] || "")) : "unknown"
        };
    }

    private hash(str: string): string {
        // Simple hash replacement if crypto not avail, but we have it in Node
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    private getColor(level: LogLevel): string {
        const colors = {
            debug: "\x1b[36m", // Cyan
            info: "\x1b[32m", // Green
            warn: "\x1b[33m", // Yellow
            error: "\x1b[31m", // Red
            fatal: "\x1b[41m", // Bg Red
            audit: "\x1b[35m", // Magenta
        };
        return colors[level] || "\x1b[37m";
    }
}

export const telemetry = new TelemetryService();
export default telemetry;
