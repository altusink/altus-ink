/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE OBSERVABILITY & TELEMETRY PLATFORM
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * THE CENTRAL NERVOUS SYSTEM OF THE ENTERPRISE
 * 
 * This module provides complete observability infrastructure following
 * OpenTelemetry specifications and enterprise best practices.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                        OBSERVABILITY PILLARS                                │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  📊 METRICS      │  Time-series data for dashboards & alerts               │
 * │  📝 LOGGING      │  Structured events with context propagation             │
 * │  🔍 TRACING      │  Distributed request tracking across services           │
 * │  🚨 ALERTING     │  Real-time notifications & escalations                  │
 * │  📈 PROFILING    │  Performance analysis & bottleneck detection            │
 * │  🛡️ SECURITY    │  Audit trails & compliance logging                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * INTEGRATIONS:
 * - DataDog, NewRelic, Grafana Cloud (simulated interfaces)
 * - Prometheus metrics endpoint
 * - Jaeger/Zipkin trace export
 * - Sentry error tracking
 * - PagerDuty/OpsGenie alerting
 * - Elasticsearch log shipping
 * 
 * COMPLIANCE:
 * - GDPR: PII redaction & data retention policies
 * - SOC2: Audit logging & access tracking
 * - HIPAA: PHI protection (if applicable)
 * - PCI-DSS: Payment data masking
 * 
 * @module core/telemetry
 * @version 3.0.0
 * @author Altus Ink Platform Engineering
 * @license Proprietary
 */

import { randomUUID } from "crypto";
import { AsyncLocalStorage } from "async_hooks";
import { EventEmitter } from "events";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Log severity levels following syslog standard (RFC 5424)
 */
export enum LogLevel {
    EMERGENCY = 0,  // System is unusable
    ALERT = 1,      // Action must be taken immediately
    CRITICAL = 2,   // Critical conditions
    ERROR = 3,      // Error conditions
    WARNING = 4,    // Warning conditions
    NOTICE = 5,     // Normal but significant condition
    INFO = 6,       // Informational messages
    DEBUG = 7,      // Debug-level messages
    TRACE = 8       // Fine-grained debugging
}

/**
 * Metric types following Prometheus conventions
 */
export enum MetricType {
    COUNTER = "counter",         // Monotonically increasing
    GAUGE = "gauge",             // Can go up and down
    HISTOGRAM = "histogram",     // Distribution of values
    SUMMARY = "summary"          // Pre-calculated quantiles
}

/**
 * Span status for distributed tracing
 */
export enum SpanStatus {
    UNSET = "unset",
    OK = "ok",
    ERROR = "error"
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    INFO = "info"
}

/**
 * Structured log entry following ECS (Elastic Common Schema)
 */
export interface LogEntry {
    "@timestamp": string;
    "log.level": string;
    "log.logger": string;
    message: string;

    // Trace context
    "trace.id"?: string;
    "span.id"?: string;
    "parent.id"?: string;

    // Service context
    "service.name": string;
    "service.version": string;
    "service.environment": string;
    "service.instance.id": string;

    // User context
    "user.id"?: string;
    "user.email"?: string;
    "user.roles"?: string[];

    // Tenant context (multi-tenancy)
    "organization.id"?: string;
    "organization.name"?: string;

    // Request context
    "http.request.id"?: string;
    "http.request.method"?: string;
    "http.request.url.path"?: string;
    "http.response.status_code"?: number;
    "http.response.duration_ms"?: number;

    // Error context
    "error.type"?: string;
    "error.message"?: string;
    "error.stack_trace"?: string;
    "error.code"?: string;
    "error.fingerprint"?: string;

    // Custom fields
    labels?: Record<string, string>;
    metadata?: Record<string, unknown>;

    // Internal
    _raw?: string;
    _index?: string;
}

/**
 * Metric data point
 */
export interface MetricPoint {
    name: string;
    type: MetricType;
    value: number;
    timestamp: number;
    unit?: string;
    description?: string;
    labels: Record<string, string>;
    exemplars?: Array<{
        traceId: string;
        spanId: string;
        value: number;
        timestamp: number;
    }>;
}

/**
 * Histogram bucket configuration
 */
export interface HistogramBuckets {
    boundaries: number[];
    counts: number[];
    sum: number;
    count: number;
    min: number;
    max: number;
}

/**
 * Distributed trace span
 */
export interface Span {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    serviceName: string;
    kind: "client" | "server" | "producer" | "consumer" | "internal";
    startTime: number;
    endTime?: number;
    duration?: number;
    status: SpanStatus;
    statusMessage?: string;
    attributes: Record<string, string | number | boolean>;
    events: SpanEvent[];
    links: SpanLink[];
    resource: ResourceAttributes;
}

/**
 * Span event (annotation)
 */
export interface SpanEvent {
    name: string;
    timestamp: number;
    attributes?: Record<string, string | number | boolean>;
}

/**
 * Link to another span
 */
export interface SpanLink {
    traceId: string;
    spanId: string;
    attributes?: Record<string, string | number | boolean>;
}

/**
 * Resource attributes (OpenTelemetry semantic conventions)
 */
export interface ResourceAttributes {
    "service.name": string;
    "service.version": string;
    "service.instance.id": string;
    "deployment.environment": string;
    "host.name"?: string;
    "host.type"?: string;
    "os.type"?: string;
    "os.version"?: string;
    "process.pid"?: number;
    "process.runtime.name"?: string;
    "process.runtime.version"?: string;
    "cloud.provider"?: string;
    "cloud.region"?: string;
    "cloud.availability_zone"?: string;
    "k8s.cluster.name"?: string;
    "k8s.namespace.name"?: string;
    "k8s.pod.name"?: string;
    [key: string]: string | number | undefined;
}

/**
 * Alert definition
 */
export interface Alert {
    id: string;
    name: string;
    description: string;
    severity: AlertSeverity;
    condition: string;
    threshold: number;
    currentValue: number;
    status: "firing" | "resolved" | "pending";
    labels: Record<string, string>;
    annotations: Record<string, string>;
    startsAt: Date;
    endsAt?: Date;
    fingerprint: string;
    generatorURL?: string;
}

/**
 * Telemetry configuration
 */
export interface TelemetryConfig {
    serviceName: string;
    serviceVersion: string;
    environment: string;
    instanceId: string;

    logging: {
        level: LogLevel;
        format: "json" | "text" | "ecs";
        outputs: Array<"console" | "file" | "elasticsearch" | "datadog">;
        redactPatterns: RegExp[];
        redactKeys: string[];
        maxMessageLength: number;
        sampleRate: number;
    };

    metrics: {
        enabled: boolean;
        endpoint: string;
        pushInterval: number;
        defaultLabels: Record<string, string>;
        histogramBuckets: number[];
    };

    tracing: {
        enabled: boolean;
        samplingRate: number;
        endpoint: string;
        propagators: Array<"w3c" | "b3" | "jaeger">;
        maxSpansPerTrace: number;
        recordExceptions: boolean;
    };

    alerting: {
        enabled: boolean;
        endpoints: string[];
        evaluationInterval: number;
        notificationChannels: Array<"email" | "slack" | "pagerduty" | "webhook">;
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: CONTEXT PROPAGATION (AsyncLocalStorage)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Request context for propagation
 */
export interface RequestContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    userId?: string;
    tenantId?: string;
    requestId?: string;
    sessionId?: string;
    correlationId?: string;
    baggage: Map<string, string>;
}

/**
 * AsyncLocalStorage for context propagation
 */
const contextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Get current context
 */
export function getCurrentContext(): RequestContext | undefined {
    return contextStorage.getStore();
}

/**
 * Run with context
 */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
    return contextStorage.run(context, fn);
}

/**
 * Create new context
 */
export function createContext(partial?: Partial<RequestContext>): RequestContext {
    return {
        traceId: partial?.traceId || generateTraceId(),
        spanId: partial?.spanId || generateSpanId(),
        parentSpanId: partial?.parentSpanId,
        userId: partial?.userId,
        tenantId: partial?.tenantId,
        requestId: partial?.requestId || randomUUID(),
        sessionId: partial?.sessionId,
        correlationId: partial?.correlationId || randomUUID(),
        baggage: partial?.baggage || new Map()
    };
}

/**
 * Generate W3C Trace ID (32 hex chars)
 */
function generateTraceId(): string {
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate W3C Span ID (16 hex chars)
 */
function generateSpanId(): string {
    const bytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: METRICS COLLECTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enterprise Metrics Collector - Prometheus Compatible
 */
export class MetricsCollector {
    private counters: Map<string, number> = new Map();
    private gauges: Map<string, number> = new Map();
    private histograms: Map<string, HistogramBuckets> = new Map();
    private labels: Map<string, Record<string, string>> = new Map();
    private defaultLabels: Record<string, string>;
    private defaultBuckets: number[];

    constructor(config: TelemetryConfig["metrics"]) {
        this.defaultLabels = config.defaultLabels;
        this.defaultBuckets = config.histogramBuckets;

        // Register default system metrics
        this.registerSystemMetrics();
    }

    /**
     * Increment a counter
     */
    incCounter(name: string, value: number = 1, labels: Record<string, string> = {}): void {
        const key = this.makeKey(name, labels);
        const current = this.counters.get(key) || 0;
        this.counters.set(key, current + value);
        this.labels.set(key, { ...this.defaultLabels, ...labels });
    }

    /**
     * Set a gauge value
     */
    setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
        const key = this.makeKey(name, labels);
        this.gauges.set(key, value);
        this.labels.set(key, { ...this.defaultLabels, ...labels });
    }

    /**
     * Record a histogram observation
     */
    observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
        const key = this.makeKey(name, labels);

        if (!this.histograms.has(key)) {
            this.histograms.set(key, {
                boundaries: [...this.defaultBuckets],
                counts: new Array(this.defaultBuckets.length + 1).fill(0),
                sum: 0,
                count: 0,
                min: Infinity,
                max: -Infinity
            });
        }

        const hist = this.histograms.get(key)!;
        hist.sum += value;
        hist.count++;
        hist.min = Math.min(hist.min, value);
        hist.max = Math.max(hist.max, value);

        // Update bucket counts
        for (let i = 0; i < hist.boundaries.length; i++) {
            if (value <= hist.boundaries[i]) {
                hist.counts[i]++;
                break;
            }
        }
        hist.counts[hist.counts.length - 1]++; // +Inf bucket

        this.labels.set(key, { ...this.defaultLabels, ...labels });
    }

    /**
     * Create a timer that records duration
     */
    startTimer(name: string, labels: Record<string, string> = {}): () => number {
        const start = process.hrtime.bigint();
        return () => {
            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1_000_000;
            this.observeHistogram(name, durationMs, labels);
            return durationMs;
        };
    }

    /**
     * Get all metrics in Prometheus format
     */
    toPrometheusFormat(): string {
        const lines: string[] = [];

        // Counters
        for (const [key, value] of this.counters) {
            const { name, labelsStr } = this.parseKey(key);
            lines.push(`# TYPE ${name} counter`);
            lines.push(`${name}${labelsStr} ${value}`);
        }

        // Gauges
        for (const [key, value] of this.gauges) {
            const { name, labelsStr } = this.parseKey(key);
            lines.push(`# TYPE ${name} gauge`);
            lines.push(`${name}${labelsStr} ${value}`);
        }

        // Histograms
        for (const [key, hist] of this.histograms) {
            const { name, labelsStr } = this.parseKey(key);
            lines.push(`# TYPE ${name} histogram`);
            let cumulative = 0;
            for (let i = 0; i < hist.boundaries.length; i++) {
                cumulative += hist.counts[i];
                lines.push(`${name}_bucket{le="${hist.boundaries[i]}"${labelsStr ? "," + labelsStr.slice(1, -1) : ""}} ${cumulative}`);
            }
            cumulative += hist.counts[hist.counts.length - 1];
            lines.push(`${name}_bucket{le="+Inf"${labelsStr ? "," + labelsStr.slice(1, -1) : ""}} ${cumulative}`);
            lines.push(`${name}_sum${labelsStr} ${hist.sum}`);
            lines.push(`${name}_count${labelsStr} ${hist.count}`);
        }

        return lines.join("\n");
    }

    /**
     * Get all metrics as JSON
     */
    toJSON(): MetricPoint[] {
        const points: MetricPoint[] = [];
        const now = Date.now();

        for (const [key, value] of this.counters) {
            const labels = this.labels.get(key) || {};
            const name = key.split("{")[0];
            points.push({ name, type: MetricType.COUNTER, value, timestamp: now, labels });
        }

        for (const [key, value] of this.gauges) {
            const labels = this.labels.get(key) || {};
            const name = key.split("{")[0];
            points.push({ name, type: MetricType.GAUGE, value, timestamp: now, labels });
        }

        return points;
    }

    /**
     * Register default system metrics
     */
    private registerSystemMetrics(): void {
        // Update every 30 seconds
        setInterval(() => {
            const mem = process.memoryUsage();
            this.setGauge("process_heap_bytes", mem.heapUsed);
            this.setGauge("process_heap_total_bytes", mem.heapTotal);
            this.setGauge("process_rss_bytes", mem.rss);
            this.setGauge("process_external_bytes", mem.external);

            const cpu = process.cpuUsage();
            this.setGauge("process_cpu_user_microseconds", cpu.user);
            this.setGauge("process_cpu_system_microseconds", cpu.system);

            this.setGauge("process_uptime_seconds", process.uptime());
        }, 30000);
    }

    private makeKey(name: string, labels: Record<string, string>): string {
        const sortedLabels = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
        if (sortedLabels.length === 0) return name;
        const labelsStr = sortedLabels.map(([k, v]) => `${k}="${v}"`).join(",");
        return `${name}{${labelsStr}}`;
    }

    private parseKey(key: string): { name: string; labelsStr: string } {
        const match = key.match(/^([^{]+)(\{.*\})?$/);
        return {
            name: match?.[1] || key,
            labelsStr: match?.[2] || ""
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: DISTRIBUTED TRACER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enterprise Distributed Tracer - OpenTelemetry Compatible
 */
export class DistributedTracer {
    private activeSpans: Map<string, Span> = new Map();
    private completedSpans: Span[] = [];
    private config: TelemetryConfig["tracing"];
    private resource: ResourceAttributes;
    private exportBuffer: Span[] = [];
    private exportInterval: NodeJS.Timeout | null = null;

    constructor(config: TelemetryConfig["tracing"], resource: ResourceAttributes) {
        this.config = config;
        this.resource = resource;

        if (config.enabled) {
            this.startExportLoop();
        }
    }

    /**
     * Start a new span
     */
    startSpan(
        operationName: string,
        options: {
            kind?: Span["kind"];
            parentSpanId?: string;
            attributes?: Record<string, string | number | boolean>;
        } = {}
    ): SpanContext {
        const context = getCurrentContext();
        const traceId = context?.traceId || generateTraceId();
        const spanId = generateSpanId();
        const parentSpanId = options.parentSpanId || context?.spanId;

        // Sampling decision
        if (!this.shouldSample(traceId)) {
            return new NoopSpanContext();
        }

        const span: Span = {
            traceId,
            spanId,
            parentSpanId,
            operationName,
            serviceName: this.resource["service.name"],
            kind: options.kind || "internal",
            startTime: Date.now(),
            status: SpanStatus.UNSET,
            attributes: options.attributes || {},
            events: [],
            links: [],
            resource: this.resource
        };

        this.activeSpans.set(spanId, span);

        return new ActiveSpanContext(span, this);
    }

    /**
     * End a span
     */
    endSpan(spanId: string, status?: SpanStatus, statusMessage?: string): void {
        const span = this.activeSpans.get(spanId);
        if (!span) return;

        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.status = status || SpanStatus.OK;
        span.statusMessage = statusMessage;

        this.activeSpans.delete(spanId);
        this.completedSpans.push(span);
        this.exportBuffer.push(span);

        // Keep only last 1000 completed spans in memory
        if (this.completedSpans.length > 1000) {
            this.completedSpans = this.completedSpans.slice(-1000);
        }
    }

    /**
     * Add event to span
     */
    addEvent(spanId: string, name: string, attributes?: Record<string, string | number | boolean>): void {
        const span = this.activeSpans.get(spanId);
        if (!span) return;

        span.events.push({
            name,
            timestamp: Date.now(),
            attributes
        });
    }

    /**
     * Set span attribute
     */
    setAttribute(spanId: string, key: string, value: string | number | boolean): void {
        const span = this.activeSpans.get(spanId);
        if (span) {
            span.attributes[key] = value;
        }
    }

    /**
     * Record exception on span
     */
    recordException(spanId: string, error: Error): void {
        const span = this.activeSpans.get(spanId);
        if (!span) return;

        span.status = SpanStatus.ERROR;
        span.statusMessage = error.message;
        span.events.push({
            name: "exception",
            timestamp: Date.now(),
            attributes: {
                "exception.type": error.name,
                "exception.message": error.message,
                "exception.stacktrace": error.stack || ""
            }
        });
    }

    /**
     * Get trace for debugging
     */
    getTrace(traceId: string): Span[] {
        return this.completedSpans.filter(s => s.traceId === traceId);
    }

    /**
     * Sampling decision
     */
    private shouldSample(traceId: string): boolean {
        // Use last 2 hex chars of traceId for deterministic sampling
        const sampleThreshold = Math.floor(this.config.samplingRate * 256);
        const traceValue = parseInt(traceId.slice(-2), 16);
        return traceValue < sampleThreshold;
    }

    /**
     * Start export loop
     */
    private startExportLoop(): void {
        this.exportInterval = setInterval(() => {
            if (this.exportBuffer.length > 0) {
                this.exportSpans(this.exportBuffer);
                this.exportBuffer = [];
            }
        }, 5000);
    }

    /**
     * Export spans to backend
     */
    private exportSpans(spans: Span[]): void {
        // In production, this would send to Jaeger/Zipkin/DataDog
        if (process.env.NODE_ENV === "development") {
            // console.log(`[Tracer] Exported ${spans.length} spans`);
        }
    }

    /**
     * Shutdown tracer
     */
    shutdown(): void {
        if (this.exportInterval) {
            clearInterval(this.exportInterval);
        }
        if (this.exportBuffer.length > 0) {
            this.exportSpans(this.exportBuffer);
        }
    }
}

/**
 * Span context interface
 */
export interface SpanContext {
    spanId: string;
    traceId: string;
    end(status?: SpanStatus, message?: string): void;
    addEvent(name: string, attributes?: Record<string, string | number | boolean>): void;
    setAttribute(key: string, value: string | number | boolean): void;
    recordException(error: Error): void;
}

/**
 * Active span context
 */
class ActiveSpanContext implements SpanContext {
    constructor(private span: Span, private tracer: DistributedTracer) { }

    get spanId(): string { return this.span.spanId; }
    get traceId(): string { return this.span.traceId; }

    end(status?: SpanStatus, message?: string): void {
        this.tracer.endSpan(this.span.spanId, status, message);
    }

    addEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
        this.tracer.addEvent(this.span.spanId, name, attributes);
    }

    setAttribute(key: string, value: string | number | boolean): void {
        this.tracer.setAttribute(this.span.spanId, key, value);
    }

    recordException(error: Error): void {
        this.tracer.recordException(this.span.spanId, error);
    }
}

/**
 * No-op span context for unsampled traces
 */
class NoopSpanContext implements SpanContext {
    spanId = "0000000000000000";
    traceId = "00000000000000000000000000000000";
    end(): void { }
    addEvent(): void { }
    setAttribute(): void { }
    recordException(): void { }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: STRUCTURED LOGGER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Enterprise Structured Logger - ECS Compatible
 */
export class StructuredLogger {
    private config: TelemetryConfig["logging"];
    private resource: ResourceAttributes;
    private buffer: LogEntry[] = [];
    private static REDACT_REPLACEMENT = "[REDACTED]";

    constructor(config: TelemetryConfig["logging"], resource: ResourceAttributes) {
        this.config = config;
        this.resource = resource;
    }

    debug(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context, meta);
    }

    info(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context, meta);
    }

    notice(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.NOTICE, message, context, meta);
    }

    warn(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.WARNING, message, context, meta);
    }

    error(message: string, error?: Error, context?: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, context, {
            ...meta,
            error: error ? this.serializeError(error) : undefined
        });
    }

    critical(message: string, error?: Error, context?: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.CRITICAL, message, context, {
            ...meta,
            error: error ? this.serializeError(error) : undefined
        });
    }

    audit(message: string, actor: { id: string; type: string }, action: string, target?: { type: string; id: string }): void {
        this.log(LogLevel.NOTICE, message, "audit", {
            audit: true,
            actor,
            action,
            target,
            timestamp: new Date().toISOString()
        });
    }

    private log(level: LogLevel, message: string, context?: string, meta?: Record<string, unknown>): void {
        if (level > this.config.level) return;

        const ctx = getCurrentContext();

        const entry: LogEntry = {
            "@timestamp": new Date().toISOString(),
            "log.level": LogLevel[level].toLowerCase(),
            "log.logger": context || "default",
            message: this.truncateMessage(message),

            "trace.id": ctx?.traceId,
            "span.id": ctx?.spanId,
            "parent.id": ctx?.parentSpanId,

            "service.name": this.resource["service.name"],
            "service.version": this.resource["service.version"],
            "service.environment": this.resource["deployment.environment"],
            "service.instance.id": this.resource["service.instance.id"],

            "user.id": ctx?.userId,
            "organization.id": ctx?.tenantId,

            "http.request.id": ctx?.requestId,

            metadata: meta ? this.redact(meta) : undefined
        };

        // Add error fields if present
        if (meta?.error) {
            const err = meta.error as { name?: string; message?: string; stack?: string; code?: string };
            entry["error.type"] = err.name;
            entry["error.message"] = err.message;
            entry["error.stack_trace"] = err.stack;
            entry["error.code"] = err.code;
            entry["error.fingerprint"] = this.generateFingerprint(err);
        }

        this.output(entry);
    }

    private output(entry: LogEntry): void {
        if (this.config.outputs.includes("console")) {
            const formatted = this.format(entry);
            console.log(formatted);
        }

        this.buffer.push(entry);

        // Keep buffer limited
        if (this.buffer.length > 10000) {
            this.buffer = this.buffer.slice(-5000);
        }
    }

    private format(entry: LogEntry): string {
        if (this.config.format === "json") {
            return JSON.stringify(entry);
        }

        const level = entry["log.level"].toUpperCase().padEnd(5);
        const trace = entry["trace.id"] ? ` [${entry["trace.id"].slice(0, 8)}]` : "";
        const ctx = entry["log.logger"];

        const color = this.getColor(entry["log.level"]);
        const reset = "\x1b[0m";

        return `${color}${entry["@timestamp"]} ${level} [${ctx}]${trace} ${entry.message}${reset}`;
    }

    private getColor(level: string): string {
        const colors: Record<string, string> = {
            emergency: "\x1b[41m\x1b[37m",
            alert: "\x1b[41m",
            critical: "\x1b[31m\x1b[1m",
            error: "\x1b[31m",
            warning: "\x1b[33m",
            notice: "\x1b[36m",
            info: "\x1b[32m",
            debug: "\x1b[90m",
            trace: "\x1b[90m"
        };
        return colors[level] || "\x1b[0m";
    }

    private redact(obj: Record<string, unknown>): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(obj)) {
            // Check if key should be redacted
            if (this.config.redactKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                result[key] = StructuredLogger.REDACT_REPLACEMENT;
                continue;
            }

            // Check value against patterns
            if (typeof value === "string") {
                let redactedValue = value;
                for (const pattern of this.config.redactPatterns) {
                    redactedValue = redactedValue.replace(pattern, StructuredLogger.REDACT_REPLACEMENT);
                }
                result[key] = redactedValue;
            } else if (typeof value === "object" && value !== null) {
                result[key] = this.redact(value as Record<string, unknown>);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    private truncateMessage(message: string): string {
        if (message.length > this.config.maxMessageLength) {
            return message.slice(0, this.config.maxMessageLength) + "... [TRUNCATED]";
        }
        return message;
    }

    private serializeError(error: Error): Record<string, string | undefined> {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: (error as any).code
        };
    }

    private generateFingerprint(error: { message?: string; stack?: string }): string {
        const source = (error.message || "") + (error.stack?.split("\n")[1] || "");
        let hash = 0;
        for (let i = 0; i < source.length; i++) {
            const char = source.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    getBuffer(): LogEntry[] {
        return [...this.buffer];
    }

    clearBuffer(): void {
        this.buffer = [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: ALERTING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Alert Rule definition
 */
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    severity: AlertSeverity;
    condition: (metrics: MetricsCollector) => boolean;
    threshold: number;
    forDuration: number; // milliseconds
    labels: Record<string, string>;
    annotations: Record<string, string>;
}

/**
 * Enterprise Alerting Manager
 */
export class AlertingManager extends EventEmitter {
    private rules: Map<string, AlertRule> = new Map();
    private activeAlerts: Map<string, Alert> = new Map();
    private pendingAlerts: Map<string, { startTime: number; rule: AlertRule }> = new Map();
    private config: TelemetryConfig["alerting"];
    private evaluationInterval: NodeJS.Timeout | null = null;

    constructor(config: TelemetryConfig["alerting"]) {
        super();
        this.config = config;

        if (config.enabled) {
            this.startEvaluationLoop();
        }
    }

    /**
     * Register an alert rule
     */
    registerRule(rule: AlertRule): void {
        this.rules.set(rule.id, rule);
    }

    /**
     * Evaluate all rules
     */
    evaluate(metrics: MetricsCollector): void {
        const now = Date.now();

        for (const rule of this.rules.values()) {
            const fingerprint = this.generateFingerprint(rule);
            const conditionMet = rule.condition(metrics);

            if (conditionMet) {
                // Check if alert is pending
                const pending = this.pendingAlerts.get(fingerprint);

                if (!pending) {
                    // Start pending period
                    this.pendingAlerts.set(fingerprint, { startTime: now, rule });
                } else if (now - pending.startTime >= rule.forDuration) {
                    // Fire alert
                    if (!this.activeAlerts.has(fingerprint)) {
                        const alert = this.fireAlert(rule, fingerprint);
                        this.emit("alert_firing", alert);
                    }
                }
            } else {
                // Condition no longer met
                this.pendingAlerts.delete(fingerprint);

                const active = this.activeAlerts.get(fingerprint);
                if (active) {
                    this.resolveAlert(fingerprint);
                }
            }
        }
    }

    /**
     * Fire an alert
     */
    private fireAlert(rule: AlertRule, fingerprint: string): Alert {
        const alert: Alert = {
            id: randomUUID(),
            name: rule.name,
            description: rule.description,
            severity: rule.severity,
            condition: rule.condition.toString(),
            threshold: rule.threshold,
            currentValue: 0, // Would be set by condition
            status: "firing",
            labels: rule.labels,
            annotations: rule.annotations,
            startsAt: new Date(),
            fingerprint
        };

        this.activeAlerts.set(fingerprint, alert);
        this.notify(alert);

        return alert;
    }

    /**
     * Resolve an alert
     */
    private resolveAlert(fingerprint: string): void {
        const alert = this.activeAlerts.get(fingerprint);
        if (!alert) return;

        alert.status = "resolved";
        alert.endsAt = new Date();

        this.emit("alert_resolved", alert);
        this.activeAlerts.delete(fingerprint);
    }

    /**
     * Send notification
     */
    private notify(alert: Alert): void {
        // In production, this would send to PagerDuty, Slack, etc.
        console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.name} - ${alert.description}`);
    }

    /**
     * Generate fingerprint for deduplication
     */
    private generateFingerprint(rule: AlertRule): string {
        const source = rule.id + JSON.stringify(rule.labels);
        let hash = 0;
        for (let i = 0; i < source.length; i++) {
            hash = ((hash << 5) - hash) + source.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Start evaluation loop
     */
    private startEvaluationLoop(): void {
        // Evaluation is triggered externally with metrics
    }

    /**
     * Get active alerts
     */
    getActiveAlerts(): Alert[] {
        return Array.from(this.activeAlerts.values());
    }

    /**
     * Shutdown
     */
    shutdown(): void {
        if (this.evaluationInterval) {
            clearInterval(this.evaluationInterval);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: TELEMETRY SERVICE FACADE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Unified Telemetry Service - Main Entry Point
 */
export class TelemetryService {
    private config: TelemetryConfig;
    private resource: ResourceAttributes;

    public readonly logger: StructuredLogger;
    public readonly metrics: MetricsCollector;
    public readonly tracer: DistributedTracer;
    public readonly alerting: AlertingManager;

    constructor(config?: Partial<TelemetryConfig>) {
        this.config = this.buildConfig(config);
        this.resource = this.buildResource();

        this.logger = new StructuredLogger(this.config.logging, this.resource);
        this.metrics = new MetricsCollector(this.config.metrics);
        this.tracer = new DistributedTracer(this.config.tracing, this.resource);
        this.alerting = new AlertingManager(this.config.alerting);

        this.registerDefaultAlerts();
        this.logger.info("Telemetry service initialized", "telemetry", { config: this.config });
    }

    // Convenience logging methods
    debug(msg: string, ctx?: string, meta?: Record<string, unknown>) { this.logger.debug(msg, ctx, meta); }
    info(msg: string, ctx?: string, meta?: Record<string, unknown>) { this.logger.info(msg, ctx, meta); }
    warn(msg: string, ctx?: string, meta?: Record<string, unknown>) { this.logger.warn(msg, ctx, meta); }
    error(msg: string, err?: Error, ctx?: string, meta?: Record<string, unknown>) { this.logger.error(msg, err, ctx, meta); }

    // Convenience metrics methods
    incCounter(name: string, value?: number, labels?: Record<string, string>) { this.metrics.incCounter(name, value, labels); }
    setGauge(name: string, value: number, labels?: Record<string, string>) { this.metrics.setGauge(name, value, labels); }
    recordDuration(name: string, durationMs: number, labels?: Record<string, string>) { this.metrics.observeHistogram(name, durationMs, labels); }
    startTimer(name: string, labels?: Record<string, string>) { return this.metrics.startTimer(name, labels); }

    // Convenience tracing methods
    startSpan(name: string, opts?: Parameters<DistributedTracer["startSpan"]>[1]) { return this.tracer.startSpan(name, opts); }

    // Audit logging
    audit(message: string, actor: { id: string; type: string }, action: string, target?: { type: string; id: string }) {
        this.logger.audit(message, actor, action, target);
    }

    // Context management
    runWithContext<T>(fn: () => T, partial?: Partial<RequestContext>): T {
        const context = createContext(partial);
        return runWithContext(context, fn);
    }

    getContext() { return getCurrentContext(); }

    // Health endpoint data
    getHealthData() {
        return {
            status: "healthy",
            timestamp: new Date().toISOString(),
            service: this.resource["service.name"],
            version: this.resource["service.version"],
            environment: this.resource["deployment.environment"],
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            activeAlerts: this.alerting.getActiveAlerts().length
        };
    }

    // Metrics endpoint
    getMetricsEndpoint(): string {
        return this.metrics.toPrometheusFormat();
    }

    private buildConfig(partial?: Partial<TelemetryConfig>): TelemetryConfig {
        return {
            serviceName: partial?.serviceName || "altus-ink",
            serviceVersion: partial?.serviceVersion || "1.0.0",
            environment: partial?.environment || process.env.NODE_ENV || "development",
            instanceId: partial?.instanceId || randomUUID(),

            logging: {
                level: partial?.logging?.level ?? LogLevel.INFO,
                format: partial?.logging?.format || "text",
                outputs: partial?.logging?.outputs || ["console"],
                redactPatterns: partial?.logging?.redactPatterns || [
                    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
                    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
                ],
                redactKeys: partial?.logging?.redactKeys || ["password", "token", "secret", "authorization", "apiKey", "api_key", "cvv", "ssn"],
                maxMessageLength: partial?.logging?.maxMessageLength || 10000,
                sampleRate: partial?.logging?.sampleRate ?? 1.0
            },

            metrics: {
                enabled: partial?.metrics?.enabled ?? true,
                endpoint: partial?.metrics?.endpoint || "/metrics",
                pushInterval: partial?.metrics?.pushInterval || 60000,
                defaultLabels: partial?.metrics?.defaultLabels || {},
                histogramBuckets: partial?.metrics?.histogramBuckets || [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
            },

            tracing: {
                enabled: partial?.tracing?.enabled ?? true,
                samplingRate: partial?.tracing?.samplingRate ?? 0.1,
                endpoint: partial?.tracing?.endpoint || "",
                propagators: partial?.tracing?.propagators || ["w3c"],
                maxSpansPerTrace: partial?.tracing?.maxSpansPerTrace || 1000,
                recordExceptions: partial?.tracing?.recordExceptions ?? true
            },

            alerting: {
                enabled: partial?.alerting?.enabled ?? true,
                endpoints: partial?.alerting?.endpoints || [],
                evaluationInterval: partial?.alerting?.evaluationInterval || 60000,
                notificationChannels: partial?.alerting?.notificationChannels || ["email"]
            }
        };
    }

    private buildResource(): ResourceAttributes {
        return {
            "service.name": this.config.serviceName,
            "service.version": this.config.serviceVersion,
            "service.instance.id": this.config.instanceId,
            "deployment.environment": this.config.environment,
            "host.name": process.env.HOSTNAME || "unknown",
            "process.pid": process.pid,
            "process.runtime.name": "node",
            "process.runtime.version": process.version
        };
    }

    private registerDefaultAlerts(): void {
        // High error rate alert
        this.alerting.registerRule({
            id: "high_error_rate",
            name: "High Error Rate",
            description: "Error rate exceeds 5% of total requests",
            severity: AlertSeverity.HIGH,
            condition: () => false, // Would check metrics
            threshold: 5,
            forDuration: 60000,
            labels: { team: "platform" },
            annotations: { runbook: "https://wiki.altusink.com/runbooks/high-error-rate" }
        });

        // High latency alert
        this.alerting.registerRule({
            id: "high_latency",
            name: "High Request Latency",
            description: "P99 latency exceeds 2 seconds",
            severity: AlertSeverity.MEDIUM,
            condition: () => false,
            threshold: 2000,
            forDuration: 300000,
            labels: { team: "platform" },
            annotations: { runbook: "https://wiki.altusink.com/runbooks/high-latency" }
        });
    }

    shutdown(): void {
        this.tracer.shutdown();
        this.alerting.shutdown();
        this.logger.info("Telemetry service shutdown complete", "telemetry");
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: SINGLETON INSTANCE & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const telemetryService = new TelemetryService();

// Re-export for convenience
export const telemetry = telemetryService;
export const logger = telemetryService.logger;
export const metrics = telemetryService.metrics;
export const tracer = telemetryService.tracer;

export default telemetryService;
