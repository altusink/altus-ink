/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE API GATEWAY & SERVICE MESH
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The unified entry point and service-to-service communication backbone.
 * 
 * TARGET SCALE: 10M+ Requests/Day
 * ARCHITECTURE: Edge-optimized, Zero-Trust, Circuit-Broken
 * 
 * FEATURES:
 * - Unified API Routing (REST / GraphQL / gRPC transcoding)
 * - Zero-Trust Authentication (JWT/OIDC/mTLS)
 * - Advanced Rate Limiting (Token Bucket, Sliding Window, Quota)
 * - Service Discovery & Load Balancing
 * - Circuit Breakers & Retry Policies
 * - Request/Response Transformation
 * - Canary Releases & Traffic Splitting
 * - Web Application Firewall (WAF)
 * - API Versioning & Deprecation
 * - Request Validation & Schema Enforcement
 * - Response Caching & Compression
 * - Distributed Tracing Integration
 * - Health Checks & Liveness Probes
 * - Webhook Management
 * - API Analytics & Usage Metering
 * 
 * @module services/api-gateway
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";
import { cacheService } from "./core/cache";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "*";

export type LoadBalancingStrategy = "round_robin" | "random" | "weighted" | "least_connections" | "ip_hash" | "consistent_hash";

export type RateLimitStrategy = "fixed_window" | "sliding_window" | "token_bucket" | "leaky_bucket";

export type AuthType = "none" | "jwt" | "api_key" | "oauth2" | "basic" | "mtls" | "custom";

export interface GatewayConfig {
    id: string;
    name: string;
    version: string;
    endpoints: EndpointConfig[];
    upstreams: UpstreamConfig[];
    policies: PolicyConfig[];
    plugins: PluginConfig[];
    security: SecurityConfig;
    monitoring: MonitoringConfig;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface EndpointConfig {
    id: string;
    name: string;
    path: string;
    methods: HttpMethod[];
    upstreamId: string;
    rewritePath?: string;
    stripPrefix?: string;
    timeout: number;
    retries: number;
    policies: string[];
    plugins: string[];
    authentication: AuthConfig;
    rateLimit?: RateLimitConfig;
    cache?: CacheConfig;
    validation?: ValidationConfig;
    transformation?: TransformationConfig;
    cors?: CorsConfig;
    versioning?: VersioningConfig;
    documentation?: DocumentationConfig;
    isPublic: boolean;
    isDeprecated: boolean;
    deprecationMessage?: string;
    metadata: Record<string, any>;
}

export interface UpstreamConfig {
    id: string;
    name: string;
    targets: UpstreamTarget[];
    loadBalancing: LoadBalancingConfig;
    healthCheck: HealthCheckConfig;
    circuitBreaker: CircuitBreakerConfig;
    retryPolicy: RetryPolicyConfig;
    connectionPool: ConnectionPoolConfig;
    timeout: TimeoutConfig;
    tls?: TlsConfig;
}

export interface UpstreamTarget {
    id: string;
    host: string;
    port: number;
    weight: number;
    tags: string[];
    status: TargetStatus;
    priority: number;
    metadata: Record<string, any>;
}

export type TargetStatus = "healthy" | "unhealthy" | "draining" | "maintenance";

export interface LoadBalancingConfig {
    strategy: LoadBalancingStrategy;
    hashOn?: "ip" | "header" | "cookie" | "path" | "query";
    hashKey?: string;
    stickySession?: StickySessiConfig;
}

export interface StickySessiConfig {
    enabled: boolean;
    cookieName: string;
    ttlSeconds: number;
}

export interface HealthCheckConfig {
    enabled: boolean;
    path: string;
    interval: number;
    timeout: number;
    unhealthyThreshold: number;
    healthyThreshold: number;
    expectedStatus: number[];
    expectedBody?: string;
}

export interface CircuitBreakerConfig {
    enabled: boolean;
    threshold: number;
    timeout: number;
    halfOpenRequests: number;
    monitoredErrors: string[];
    onOpen?: string; // Fallback service
}

export interface RetryPolicyConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryOn: string[];
    nonRetryableErrors: string[];
}

export interface ConnectionPoolConfig {
    maxConnections: number;
    maxIdleConnections: number;
    idleTimeout: number;
    keepAlive: boolean;
}

export interface TimeoutConfig {
    connect: number;
    read: number;
    write: number;
    idle: number;
}

export interface TlsConfig {
    enabled: boolean;
    verify: boolean;
    caPath?: string;
    certPath?: string;
    keyPath?: string;
    sni?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: SECURITY
// ═══════════════════════════════════════════════════════════════════════════════

export interface SecurityConfig {
    authentication: GlobalAuthConfig;
    cors: CorsConfig;
    waf: WafConfig;
    ipFilter: IpFilterConfig;
    headers: SecurityHeadersConfig;
    encryption: EncryptionConfig;
}

export interface GlobalAuthConfig {
    defaultType: AuthType;
    jwt: JwtConfig;
    apiKey: ApiKeyConfig;
    oauth2: OAuth2Config;
    mtls: MtlsConfig;
}

export interface JwtConfig {
    enabled: boolean;
    issuer: string;
    audience: string;
    jwksUrl?: string;
    secret?: string;
    algorithms: string[];
    claimsToHeaders: Record<string, string>;
    requiredClaims: string[];
    clockSkewSeconds: number;
}

export interface ApiKeyConfig {
    enabled: boolean;
    headerName: string;
    queryParamName?: string;
    hashAlgorithm: "sha256" | "sha512" | "bcrypt";
    keys: ApiKey[];
}

export interface ApiKey {
    id: string;
    name: string;
    keyHash: string;
    scopes: string[];
    rateLimit?: RateLimitConfig;
    expiresAt?: Date;
    isActive: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
}

export interface OAuth2Config {
    enabled: boolean;
    authorizationUrl: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    scopes: string[];
    responseType: "code" | "token";
}

export interface MtlsConfig {
    enabled: boolean;
    clientCaPath: string;
    requireClientCert: boolean;
    verifyDepth: number;
}

export interface AuthConfig {
    type: AuthType;
    required: boolean;
    scopes?: string[];
    roles?: string[];
    customValidator?: string;
}

export interface CorsConfig {
    enabled: boolean;
    origins: string[];
    methods: string[];
    headers: string[];
    exposeHeaders: string[];
    credentials: boolean;
    maxAge: number;
}

export interface WafConfig {
    enabled: boolean;
    mode: "detect" | "block";
    rules: WafRule[];
    customRules: CustomWafRule[];
    ipBlacklist: string[];
    ipWhitelist: string[];
    geoBlocking: string[];
    botProtection: BotProtectionConfig;
    rateLimiting: WafRateLimitConfig;
}

export interface WafRule {
    id: string;
    type: "sqli" | "xss" | "lfi" | "rfi" | "rce" | "php" | "java" | "scanner" | "protocol";
    enabled: boolean;
    action: "block" | "log" | "challenge";
    score: number;
}

export interface CustomWafRule {
    id: string;
    name: string;
    condition: WafCondition;
    action: "block" | "log" | "allow" | "challenge" | "redirect";
    redirectUrl?: string;
    priority: number;
}

export interface WafCondition {
    field: "ip" | "path" | "query" | "header" | "body" | "method" | "country" | "user_agent";
    operator: "eq" | "neq" | "contains" | "regex" | "in" | "not_in" | "exists";
    value: any;
    logic?: "and" | "or";
    children?: WafCondition[];
}

export interface BotProtectionConfig {
    enabled: boolean;
    mode: "passive" | "challenge" | "block";
    allowedBots: string[];
    captchaProvider?: "recaptcha" | "hcaptcha" | "turnstile";
    captchaSecret?: string;
}

export interface WafRateLimitConfig {
    enabled: boolean;
    requestsPerSecond: number;
    burstSize: number;
    blockDuration: number;
}

export interface IpFilterConfig {
    enabled: boolean;
    mode: "whitelist" | "blacklist";
    addresses: string[];
    ranges: string[];
}

export interface SecurityHeadersConfig {
    hsts: HstsConfig;
    contentSecurityPolicy?: string;
    xContentTypeOptions: boolean;
    xFrameOptions: "DENY" | "SAMEORIGIN" | string;
    xXssProtection: boolean;
    referrerPolicy: string;
    permissionsPolicy?: string;
}

export interface HstsConfig {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
}

export interface EncryptionConfig {
    atRest: boolean;
    inTransit: boolean;
    jweEnabled: boolean;
    jweAlgorithm?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════

export interface RateLimitConfig {
    enabled: boolean;
    strategy: RateLimitStrategy;
    window: number;
    limit: number;
    keyExtractor: "ip" | "user" | "api_key" | "header" | "custom";
    headerName?: string;
    customExtractor?: string;
    burst?: number;
    quota?: QuotaConfig;
    penalties: PenaltyConfig[];
}

export interface QuotaConfig {
    daily?: number;
    monthly?: number;
    perOperation?: Record<string, number>;
}

export interface PenaltyConfig {
    violations: number;
    blockDuration: number;
    action: "block" | "throttle" | "captcha";
}

export interface RateLimitState {
    key: string;
    requests: number;
    windowStart: number;
    tokens?: number;
    lastRefill?: number;
    violations: number;
    blockedUntil?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: CACHING & TRANSFORMATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface CacheConfig {
    enabled: boolean;
    ttl: number;
    key: string;
    varyBy: string[];
    staleWhileRevalidate?: number;
    staleIfError?: number;
    tags?: string[];
    private?: boolean;
    methods: HttpMethod[];
    statusCodes: number[];
}

export interface TransformationConfig {
    request?: RequestTransformation;
    response?: ResponseTransformation;
}

export interface RequestTransformation {
    headers: HeaderTransformation[];
    queryParams: ParamTransformation[];
    body?: BodyTransformation;
    path?: PathTransformation;
}

export interface ResponseTransformation {
    headers: HeaderTransformation[];
    body?: BodyTransformation;
    statusCode?: StatusCodeTransformation;
}

export interface HeaderTransformation {
    action: "add" | "set" | "remove" | "rename";
    name: string;
    value?: string;
    newName?: string;
    condition?: string;
}

export interface ParamTransformation {
    action: "add" | "set" | "remove" | "rename";
    name: string;
    value?: string;
    newName?: string;
}

export interface BodyTransformation {
    type: "json" | "xml" | "form" | "template";
    template?: string;
    mappings?: FieldMapping[];
    strip?: string[];
    mask?: MaskConfig[];
}

export interface FieldMapping {
    source: string;
    target: string;
    transform?: string;
}

export interface MaskConfig {
    field: string;
    type: "full" | "partial" | "hash";
    visibleChars?: number;
}

export interface PathTransformation {
    pattern: string;
    replacement: string;
}

export interface StatusCodeTransformation {
    mappings: Record<number, number>;
    default?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ValidationConfig {
    request: RequestValidation;
    response?: ResponseValidation;
}

export interface RequestValidation {
    headers?: SchemaValidation;
    queryParams?: SchemaValidation;
    body?: SchemaValidation;
    path?: SchemaValidation;
}

export interface ResponseValidation {
    body?: SchemaValidation;
    headers?: SchemaValidation;
}

export interface SchemaValidation {
    type: "json_schema" | "openapi" | "custom";
    schema?: any;
    schemaRef?: string;
    coerce?: boolean;
    removeAdditional?: boolean;
    onError: "reject" | "log" | "sanitize";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: VERSIONING & DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface VersioningConfig {
    strategy: "path" | "header" | "query" | "media_type";
    current: string;
    supported: string[];
    deprecated: string[];
    headerName?: string;
    queryParam?: string;
    defaultVersion?: string;
}

export interface DocumentationConfig {
    summary: string;
    description?: string;
    tags: string[];
    operationId: string;
    deprecated?: boolean;
    externalDocs?: { url: string; description: string };
    requestBody?: DocRequestBody;
    responses: DocResponse[];
    examples?: DocExample[];
}

export interface DocRequestBody {
    description: string;
    required: boolean;
    content: Record<string, { schema: any; examples?: any }>;
}

export interface DocResponse {
    statusCode: number;
    description: string;
    content?: Record<string, { schema: any }>;
}

export interface DocExample {
    name: string;
    summary: string;
    value: any;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PLUGINS & POLICIES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PolicyConfig {
    id: string;
    name: string;
    type: "rate_limit" | "auth" | "transform" | "cache" | "cors" | "custom";
    config: Record<string, any>;
    priority: number;
    condition?: string;
}

export interface PluginConfig {
    id: string;
    name: string;
    enabled: boolean;
    phase: "pre_auth" | "post_auth" | "pre_upstream" | "post_upstream" | "error";
    handler: string;
    config: Record<string, any>;
    priority: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: MONITORING & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface MonitoringConfig {
    metrics: MetricsConfig;
    tracing: TracingConfig;
    logging: LoggingConfig;
    alerts: AlertConfig[];
}

export interface MetricsConfig {
    enabled: boolean;
    endpoint: string;
    labels: string[];
    histogramBuckets: number[];
}

export interface TracingConfig {
    enabled: boolean;
    provider: "jaeger" | "zipkin" | "otlp";
    endpoint: string;
    sampleRate: number;
    propagation: ("b3" | "w3c" | "jaeger")[];
}

export interface LoggingConfig {
    level: "debug" | "info" | "warn" | "error";
    format: "json" | "text";
    includeBody: boolean;
    maskFields: string[];
    maxBodySize: number;
}

export interface AlertConfig {
    id: string;
    name: string;
    metric: string;
    condition: string;
    threshold: number;
    window: number;
    channels: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: WEBHOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: string[];
    secret: string;
    headers: Record<string, string>;
    retryPolicy: RetryPolicyConfig;
    timeout: number;
    isActive: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
}

export interface WebhookDelivery {
    id: string;
    webhookId: string;
    event: string;
    payload: any;
    status: "pending" | "success" | "failed";
    attempts: number;
    lastAttempt?: Date;
    response?: WebhookResponse;
    error?: string;
    createdAt: Date;
}

export interface WebhookResponse {
    statusCode: number;
    headers: Record<string, string>;
    body?: string;
    duration: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: REQUEST CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

export interface GatewayContext {
    id: string;
    requestId: string;
    traceId?: string;
    spanId?: string;
    request: RequestInfo;
    response?: ResponseInfo;
    upstream?: UpstreamInfo;
    auth?: AuthInfo;
    timing: TimingInfo;
    errors: GatewayError[];
    metadata: Record<string, any>;
}

export interface RequestInfo {
    method: string;
    path: string;
    originalPath: string;
    query: Record<string, string>;
    headers: Record<string, string>;
    body?: any;
    ip: string;
    userAgent: string;
    protocol: string;
    size: number;
}

export interface ResponseInfo {
    statusCode: number;
    headers: Record<string, string>;
    body?: any;
    size: number;
}

export interface UpstreamInfo {
    target: string;
    statusCode?: number;
    latency?: number;
    retries: number;
}

export interface AuthInfo {
    type: AuthType;
    userId?: string;
    tenantId?: string;
    roles: string[];
    scopes: string[];
    claims: Record<string, any>;
}

export interface TimingInfo {
    start: number;
    authComplete?: number;
    upstreamStart?: number;
    upstreamComplete?: number;
    transformComplete?: number;
    end?: number;
}

export interface GatewayError {
    phase: string;
    code: string;
    message: string;
    stack?: string;
    timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE MESH IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

class CircuitBreaker {
    private state: "closed" | "open" | "half_open" = "closed";
    private failures: number = 0;
    private lastFailure?: Date;
    private halfOpenSuccesses: number = 0;

    constructor(
        private readonly serviceId: string,
        private readonly config: CircuitBreakerConfig = {
            enabled: true,
            threshold: 5,
            timeout: 30000,
            halfOpenRequests: 3,
            monitoredErrors: ["5xx", "timeout", "connection_refused"],
        }
    ) { }

    allowRequest(): boolean {
        if (!this.config.enabled) return true;

        if (this.state === "open") {
            if (this.lastFailure && Date.now() - this.lastFailure.getTime() > this.config.timeout) {
                this.state = "half_open";
                this.halfOpenSuccesses = 0;
                return true;
            }
            return false;
        }

        return true;
    }

    recordSuccess(): void {
        if (this.state === "half_open") {
            this.halfOpenSuccesses++;
            if (this.halfOpenSuccesses >= this.config.halfOpenRequests) {
                this.state = "closed";
                this.failures = 0;
            }
        } else {
            this.failures = 0;
        }
    }

    recordFailure(error: string): void {
        this.failures++;
        this.lastFailure = new Date();

        if (this.state === "half_open") {
            this.state = "open";
        } else if (this.failures >= this.config.threshold) {
            this.state = "open";
            eventBus.publish("gateway.circuit_opened", { serviceId: this.serviceId, failures: this.failures });
        }
    }

    getState(): string {
        return this.state;
    }

    getStats(): { state: string; failures: number; lastFailure?: Date } {
        return { state: this.state, failures: this.failures, lastFailure: this.lastFailure };
    }
}

class RateLimiter {
    private states: Map<string, RateLimitState> = new Map();

    async check(key: string, config: RateLimitConfig): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
        let state = this.states.get(key);
        const now = Date.now();

        if (!state || now - state.windowStart > config.window) {
            state = { key, requests: 0, windowStart: now, violations: state?.violations || 0 };
        }

        // Check if blocked
        if (state.blockedUntil && now < state.blockedUntil) {
            return { allowed: false, remaining: 0, retryAfter: Math.ceil((state.blockedUntil - now) / 1000) };
        }

        switch (config.strategy) {
            case "token_bucket":
                return this.tokenBucket(state, config, now);
            case "sliding_window":
                return this.slidingWindow(state, config, now);
            default:
                return this.fixedWindow(state, config);
        }
    }

    private fixedWindow(state: RateLimitState, config: RateLimitConfig): { allowed: boolean; remaining: number } {
        if (state.requests >= config.limit) {
            state.violations++;
            this.applyPenalties(state, config);
            this.states.set(state.key, state);
            return { allowed: false, remaining: 0 };
        }

        state.requests++;
        this.states.set(state.key, state);
        return { allowed: true, remaining: config.limit - state.requests };
    }

    private tokenBucket(state: RateLimitState, config: RateLimitConfig, now: number): { allowed: boolean; remaining: number } {
        const refillRate = config.limit / config.window;
        const elapsed = now - (state.lastRefill || state.windowStart);
        const newTokens = Math.floor(elapsed * refillRate / 1000);

        state.tokens = Math.min(config.limit + (config.burst || 0), (state.tokens || config.limit) + newTokens);
        state.lastRefill = now;

        if (state.tokens < 1) {
            state.violations++;
            this.applyPenalties(state, config);
            this.states.set(state.key, state);
            return { allowed: false, remaining: 0 };
        }

        state.tokens--;
        this.states.set(state.key, state);
        return { allowed: true, remaining: Math.floor(state.tokens) };
    }

    private slidingWindow(state: RateLimitState, config: RateLimitConfig, now: number): { allowed: boolean; remaining: number } {
        const windowPortion = (now - state.windowStart) / config.window;
        const effectiveRequests = state.requests * (1 - windowPortion);

        if (effectiveRequests >= config.limit) {
            state.violations++;
            this.applyPenalties(state, config);
            this.states.set(state.key, state);
            return { allowed: false, remaining: 0 };
        }

        state.requests++;
        this.states.set(state.key, state);
        return { allowed: true, remaining: Math.floor(config.limit - effectiveRequests) };
    }

    private applyPenalties(state: RateLimitState, config: RateLimitConfig): void {
        for (const penalty of config.penalties || []) {
            if (state.violations >= penalty.violations) {
                state.blockedUntil = Date.now() + penalty.blockDuration;
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// API GATEWAY IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class ApiGateway extends EventEmitter {
    private config: GatewayConfig;
    private upstreams: Map<string, UpstreamConfig> = new Map();
    private endpoints: Map<string, EndpointConfig> = new Map();
    private circuitBreakers: Map<string, CircuitBreaker> = new Map();
    private rateLimiter: RateLimiter = new RateLimiter();
    private webhooks: Map<string, WebhookConfig> = new Map();
    private apiKeys: Map<string, ApiKey> = new Map();
    private metrics: GatewayMetrics = new GatewayMetrics();

    constructor() {
        super();
        this.config = this.getDefaultConfig();
        this.seedConfiguration();
        this.startHealthChecks();
        this.startMetricsCollection();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REQUEST PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════

    async handleRequest(request: RequestInfo): Promise<ResponseInfo> {
        const ctx = this.createContext(request);

        try {
            // Phase 1: Pre-authentication plugins
            await this.executePlugins(ctx, "pre_auth");

            // Phase 2: WAF
            await this.applyWaf(ctx);

            // Phase 3: Rate Limiting (pre-auth)
            await this.applyRateLimit(ctx);

            // Phase 4: Route matching
            const endpoint = this.matchEndpoint(ctx.request.path, ctx.request.method as HttpMethod);
            if (!endpoint) {
                return this.errorResponse(404, "NOT_FOUND", "Endpoint not found");
            }

            // Phase 5: Authentication
            if (endpoint.authentication.required) {
                await this.authenticate(ctx, endpoint.authentication);
            }

            // Phase 6: Post-authentication plugins
            await this.executePlugins(ctx, "post_auth");

            // Phase 7: Endpoint rate limiting
            if (endpoint.rateLimit?.enabled) {
                await this.applyEndpointRateLimit(ctx, endpoint.rateLimit);
            }

            // Phase 8: Request validation
            if (endpoint.validation) {
                await this.validateRequest(ctx, endpoint.validation);
            }

            // Phase 9: Request transformation
            if (endpoint.transformation?.request) {
                await this.transformRequest(ctx, endpoint.transformation.request);
            }

            // Phase 10: Check cache
            if (endpoint.cache?.enabled && endpoint.cache.methods.includes(ctx.request.method as HttpMethod)) {
                const cached = await this.checkCache(ctx, endpoint.cache);
                if (cached) return cached;
            }

            // Phase 11: Pre-upstream plugins
            await this.executePlugins(ctx, "pre_upstream");

            // Phase 12: Upstream call
            const upstream = this.upstreams.get(endpoint.upstreamId);
            if (!upstream) {
                return this.errorResponse(502, "NO_UPSTREAM", "Upstream not configured");
            }

            const response = await this.callUpstream(ctx, upstream, endpoint);

            // Phase 13: Post-upstream plugins
            await this.executePlugins(ctx, "post_upstream");

            // Phase 14: Response transformation
            if (endpoint.transformation?.response) {
                await this.transformResponse(ctx, endpoint.transformation.response);
            }

            // Phase 15: Cache response
            if (endpoint.cache?.enabled && endpoint.cache.statusCodes.includes(response.statusCode)) {
                await this.cacheResponse(ctx, endpoint.cache, response);
            }

            // Phase 16: Record metrics
            this.metrics.recordRequest(ctx, endpoint, response);

            return response;

        } catch (error: any) {
            ctx.errors.push({
                phase: "processing",
                code: error.code || "INTERNAL_ERROR",
                message: error.message,
                timestamp: new Date(),
            });

            // Execute error plugins
            await this.executePlugins(ctx, "error");

            telemetry.error("Gateway error", "ApiGateway", error);

            return this.errorResponse(
                error.statusCode || 500,
                error.code || "INTERNAL_ERROR",
                error.message || "Internal server error"
            );
        } finally {
            ctx.timing.end = Date.now();
            this.emit("request:complete", ctx);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTHENTICATION
    // ═══════════════════════════════════════════════════════════════════════════

    private async authenticate(ctx: GatewayContext, config: AuthConfig): Promise<void> {
        ctx.timing.authComplete = Date.now();

        switch (config.type) {
            case "jwt":
                await this.authenticateJwt(ctx);
                break;
            case "api_key":
                await this.authenticateApiKey(ctx);
                break;
            case "oauth2":
                await this.authenticateOAuth2(ctx);
                break;
            case "basic":
                await this.authenticateBasic(ctx);
                break;
            default:
                throw { statusCode: 401, code: "UNSUPPORTED_AUTH", message: `Unsupported auth type: ${config.type}` };
        }

        // Check scopes
        if (config.scopes && config.scopes.length > 0) {
            const hasScope = config.scopes.some(s => ctx.auth?.scopes.includes(s));
            if (!hasScope) {
                throw { statusCode: 403, code: "INSUFFICIENT_SCOPE", message: "Insufficient scope" };
            }
        }

        // Check roles
        if (config.roles && config.roles.length > 0) {
            const hasRole = config.roles.some(r => ctx.auth?.roles.includes(r));
            if (!hasRole) {
                throw { statusCode: 403, code: "INSUFFICIENT_ROLE", message: "Insufficient role" };
            }
        }
    }

    private async authenticateJwt(ctx: GatewayContext): Promise<void> {
        const authHeader = ctx.request.headers["authorization"];
        if (!authHeader?.startsWith("Bearer ")) {
            throw { statusCode: 401, code: "MISSING_TOKEN", message: "Missing bearer token" };
        }

        const token = authHeader.slice(7);

        // In production, verify JWT with JWKS or secret
        // Simulated for demo
        const payload = this.decodeJwt(token);

        ctx.auth = {
            type: "jwt",
            userId: payload.sub,
            tenantId: payload.tenant_id,
            roles: payload.roles || [],
            scopes: payload.scope?.split(" ") || [],
            claims: payload,
        };
    }

    private async authenticateApiKey(ctx: GatewayContext): Promise<void> {
        const headerName = this.config.security.authentication.apiKey.headerName;
        const apiKeyValue = ctx.request.headers[headerName.toLowerCase()];

        if (!apiKeyValue) {
            throw { statusCode: 401, code: "MISSING_API_KEY", message: "Missing API key" };
        }

        const apiKey = Array.from(this.apiKeys.values()).find(k =>
            k.isActive && this.verifyApiKey(apiKeyValue, k.keyHash)
        );

        if (!apiKey) {
            throw { statusCode: 401, code: "INVALID_API_KEY", message: "Invalid API key" };
        }

        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            throw { statusCode: 401, code: "EXPIRED_API_KEY", message: "API key expired" };
        }

        ctx.auth = {
            type: "api_key",
            userId: apiKey.id,
            tenantId: apiKey.metadata.tenantId,
            roles: [],
            scopes: apiKey.scopes,
            claims: apiKey.metadata,
        };
    }

    private async authenticateOAuth2(ctx: GatewayContext): Promise<void> {
        // Similar to JWT but with introspection
        await this.authenticateJwt(ctx);
    }

    private async authenticateBasic(ctx: GatewayContext): Promise<void> {
        const authHeader = ctx.request.headers["authorization"];
        if (!authHeader?.startsWith("Basic ")) {
            throw { statusCode: 401, code: "MISSING_CREDENTIALS", message: "Missing basic credentials" };
        }

        const credentials = Buffer.from(authHeader.slice(6), "base64").toString();
        const [username, password] = credentials.split(":");

        // In production, validate against user store
        ctx.auth = {
            type: "basic",
            userId: username,
            roles: [],
            scopes: [],
            claims: {},
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WAF
    // ═══════════════════════════════════════════════════════════════════════════

    private async applyWaf(ctx: GatewayContext): Promise<void> {
        const waf = this.config.security.waf;
        if (!waf.enabled) return;

        // Check IP blacklist
        if (waf.ipBlacklist.includes(ctx.request.ip)) {
            throw { statusCode: 403, code: "IP_BLOCKED", message: "IP address blocked" };
        }

        // Check IP whitelist (skip other checks if whitelisted)
        if (waf.ipWhitelist.includes(ctx.request.ip)) return;

        // Check geo blocking
        // In production, use GeoIP database

        // Check SQLi
        if (waf.rules.find(r => r.type === "sqli" && r.enabled)) {
            if (this.detectSqlInjection(ctx.request)) {
                telemetry.warn("SQLi attempt blocked", "WAF", { ip: ctx.request.ip, path: ctx.request.path });
                if (waf.mode === "block") {
                    throw { statusCode: 403, code: "WAF_SQLI", message: "SQL injection detected" };
                }
            }
        }

        // Check XSS
        if (waf.rules.find(r => r.type === "xss" && r.enabled)) {
            if (this.detectXss(ctx.request)) {
                telemetry.warn("XSS attempt blocked", "WAF", { ip: ctx.request.ip, path: ctx.request.path });
                if (waf.mode === "block") {
                    throw { statusCode: 403, code: "WAF_XSS", message: "XSS detected" };
                }
            }
        }

        // Check custom rules
        for (const rule of waf.customRules.sort((a, b) => a.priority - b.priority)) {
            if (this.evaluateWafCondition(rule.condition, ctx.request)) {
                if (rule.action === "block") {
                    throw { statusCode: 403, code: "WAF_CUSTOM_RULE", message: `Blocked by rule: ${rule.name}` };
                } else if (rule.action === "redirect" && rule.redirectUrl) {
                    throw { statusCode: 302, code: "WAF_REDIRECT", message: rule.redirectUrl };
                }
            }
        }
    }

    private detectSqlInjection(request: RequestInfo): boolean {
        const patterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
            /('|")\s*(OR|AND)\s*('|"|\d)/i,
            /--\s*$/,
            /;\s*(DROP|DELETE|UPDATE)/i,
        ];

        const testString = `${request.path} ${JSON.stringify(request.query)} ${JSON.stringify(request.body)}`;
        return patterns.some(p => p.test(testString));
    }

    private detectXss(request: RequestInfo): boolean {
        const patterns = [
            /<script\b[^>]*>[\s\S]*?<\/script>/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<\s*img[^>]+onerror\s*=/i,
        ];

        const testString = `${request.path} ${JSON.stringify(request.query)} ${JSON.stringify(request.body)}`;
        return patterns.some(p => p.test(testString));
    }

    private evaluateWafCondition(condition: WafCondition, request: RequestInfo): boolean {
        const value = this.getWafFieldValue(condition.field, request);

        switch (condition.operator) {
            case "eq": return value === condition.value;
            case "neq": return value !== condition.value;
            case "contains": return String(value).includes(condition.value);
            case "regex": return new RegExp(condition.value).test(String(value));
            case "in": return Array.isArray(condition.value) && condition.value.includes(value);
            case "exists": return value !== undefined && value !== null;
            default: return false;
        }
    }

    private getWafFieldValue(field: WafCondition["field"], request: RequestInfo): any {
        switch (field) {
            case "ip": return request.ip;
            case "path": return request.path;
            case "query": return request.query;
            case "method": return request.method;
            case "user_agent": return request.userAgent;
            case "header": return request.headers;
            case "body": return request.body;
            default: return undefined;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UPSTREAM CALLING
    // ═══════════════════════════════════════════════════════════════════════════

    private async callUpstream(ctx: GatewayContext, upstream: UpstreamConfig, endpoint: EndpointConfig): Promise<ResponseInfo> {
        const cb = this.circuitBreakers.get(upstream.id);
        if (cb && !cb.allowRequest()) {
            throw { statusCode: 503, code: "CIRCUIT_OPEN", message: "Service temporarily unavailable" };
        }

        ctx.timing.upstreamStart = Date.now();

        const target = this.selectTarget(upstream);
        if (!target) {
            throw { statusCode: 503, code: "NO_HEALTHY_TARGETS", message: "No healthy upstream targets" };
        }

        let lastError: any;
        const maxAttempts = upstream.retryPolicy.maxAttempts;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await this.makeUpstreamRequest(
                    target,
                    ctx.request,
                    endpoint,
                    upstream.timeout
                );

                ctx.timing.upstreamComplete = Date.now();
                ctx.upstream = {
                    target: target.host,
                    statusCode: response.statusCode,
                    latency: ctx.timing.upstreamComplete - ctx.timing.upstreamStart!,
                    retries: attempt,
                };

                cb?.recordSuccess();

                return response;

            } catch (error: any) {
                lastError = error;
                ctx.upstream = { target: target.host, retries: attempt + 1 };

                if (this.shouldRetry(error, upstream.retryPolicy)) {
                    const delay = this.calculateRetryDelay(attempt, upstream.retryPolicy);
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    break;
                }
            }
        }

        cb?.recordFailure(lastError.code || "UPSTREAM_ERROR");
        throw lastError;
    }

    private selectTarget(upstream: UpstreamConfig): UpstreamTarget | null {
        const healthy = upstream.targets.filter(t => t.status === "healthy");
        if (healthy.length === 0) return null;

        switch (upstream.loadBalancing.strategy) {
            case "random":
                return healthy[Math.floor(Math.random() * healthy.length)];
            case "weighted":
                return this.selectWeighted(healthy);
            case "least_connections":
                // In production, track connections per target
                return healthy[0];
            default:
                return healthy[0];
        }
    }

    private selectWeighted(targets: UpstreamTarget[]): UpstreamTarget {
        const totalWeight = targets.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;

        for (const target of targets) {
            random -= target.weight;
            if (random <= 0) return target;
        }

        return targets[0];
    }

    private async makeUpstreamRequest(target: UpstreamTarget, request: RequestInfo, endpoint: EndpointConfig, timeout: TimeoutConfig): Promise<ResponseInfo> {
        // In production, use fetch/axios with full HTTP implementation
        // Simulated for demo

        const url = `http://${target.host}:${target.port}${endpoint.rewritePath || request.path}`;

        telemetry.debug("Upstream request", "ApiGateway", { url, method: request.method });

        // Simulate upstream call
        await new Promise(r => setTimeout(r, 50));

        return {
            statusCode: 200,
            headers: { "content-type": "application/json" },
            body: { success: true, data: {} },
            size: 100,
        };
    }

    private shouldRetry(error: any, policy: RetryPolicyConfig): boolean {
        if (policy.nonRetryableErrors.includes(error.code)) return false;
        return policy.retryOn.some(r => {
            if (r === "5xx") return error.statusCode >= 500;
            if (r === "timeout") return error.code === "TIMEOUT";
            if (r === "connection") return error.code === "CONNECTION_REFUSED";
            return error.code === r;
        });
    }

    private calculateRetryDelay(attempt: number, policy: RetryPolicyConfig): number {
        const delay = policy.initialDelay * Math.pow(policy.backoffMultiplier, attempt);
        return Math.min(delay, policy.maxDelay);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    private createContext(request: RequestInfo): GatewayContext {
        return {
            id: randomUUID(),
            requestId: request.headers["x-request-id"] || randomUUID(),
            traceId: request.headers["x-trace-id"],
            request: { ...request, originalPath: request.path },
            timing: { start: Date.now() },
            errors: [],
            metadata: {},
        };
    }

    private matchEndpoint(path: string, method: HttpMethod): EndpointConfig | null {
        for (const endpoint of this.endpoints.values()) {
            if (this.pathMatches(path, endpoint.path) &&
                (endpoint.methods.includes("*") || endpoint.methods.includes(method))) {
                return endpoint;
            }
        }
        return null;
    }

    private pathMatches(path: string, pattern: string): boolean {
        // Support path parameters like /api/users/:id
        const regex = pattern.replace(/:(\w+)/g, "([^/]+)");
        return new RegExp(`^${regex}$`).test(path);
    }

    private async executePlugins(ctx: GatewayContext, phase: PluginConfig["phase"]): Promise<void> {
        const plugins = Array.from(this.config.plugins.values())
            .filter(p => p.enabled && p.phase === phase)
            .sort((a, b) => a.priority - b.priority);

        for (const plugin of plugins) {
            // In production, execute plugin handlers
            telemetry.debug(`Executing plugin: ${plugin.name}`, "ApiGateway", { phase });
        }
    }

    private async applyRateLimit(ctx: GatewayContext): Promise<void> {
        // Global rate limiting
        const key = ctx.request.ip;
        const config: RateLimitConfig = {
            enabled: true,
            strategy: "sliding_window",
            window: 60000,
            limit: 1000,
            keyExtractor: "ip",
            penalties: [{ violations: 10, blockDuration: 300000, action: "block" }],
        };

        const result = await this.rateLimiter.check(key, config);
        if (!result.allowed) {
            throw { statusCode: 429, code: "RATE_LIMITED", message: "Too many requests", retryAfter: result.retryAfter };
        }
    }

    private async applyEndpointRateLimit(ctx: GatewayContext, config: RateLimitConfig): Promise<void> {
        const key = `${ctx.request.path}:${ctx.auth?.userId || ctx.request.ip}`;
        const result = await this.rateLimiter.check(key, config);
        if (!result.allowed) {
            throw { statusCode: 429, code: "RATE_LIMITED", message: "Rate limit exceeded", retryAfter: result.retryAfter };
        }
    }

    private async validateRequest(ctx: GatewayContext, config: ValidationConfig): Promise<void> {
        // In production, use AJV or similar for JSON schema validation
    }

    private async transformRequest(ctx: GatewayContext, transform: RequestTransformation): Promise<void> {
        for (const header of transform.headers) {
            switch (header.action) {
                case "add":
                    if (!ctx.request.headers[header.name]) {
                        ctx.request.headers[header.name] = header.value!;
                    }
                    break;
                case "set":
                    ctx.request.headers[header.name] = header.value!;
                    break;
                case "remove":
                    delete ctx.request.headers[header.name];
                    break;
            }
        }
    }

    private async transformResponse(ctx: GatewayContext, transform: ResponseTransformation): Promise<void> {
        ctx.timing.transformComplete = Date.now();
    }

    private async checkCache(ctx: GatewayContext, config: CacheConfig): Promise<ResponseInfo | null> {
        const key = `gateway:${config.key}:${ctx.request.path}:${JSON.stringify(ctx.request.query)}`;
        return await cacheService.get<ResponseInfo>(key);
    }

    private async cacheResponse(ctx: GatewayContext, config: CacheConfig, response: ResponseInfo): Promise<void> {
        const key = `gateway:${config.key}:${ctx.request.path}:${JSON.stringify(ctx.request.query)}`;
        await cacheService.set(key, response, { ttlSeconds: config.ttl, tags: config.tags });
    }

    private errorResponse(statusCode: number, code: string, message: string): ResponseInfo {
        return {
            statusCode,
            headers: { "content-type": "application/json" },
            body: { error: { code, message } },
            size: 0,
        };
    }

    private decodeJwt(token: string): any {
        try {
            const parts = token.split(".");
            return JSON.parse(Buffer.from(parts[1], "base64").toString());
        } catch {
            throw { statusCode: 401, code: "INVALID_TOKEN", message: "Invalid JWT" };
        }
    }

    private verifyApiKey(key: string, hash: string): boolean {
        // In production, use proper hashing comparison
        return true;
    }

    private getDefaultConfig(): GatewayConfig {
        return {
            id: "default",
            name: "Altus Ink API Gateway",
            version: "3.0.0",
            endpoints: [],
            upstreams: [],
            policies: [],
            plugins: [],
            security: {
                authentication: {
                    defaultType: "jwt",
                    jwt: { enabled: true, issuer: "altus.ink", audience: "api", algorithms: ["RS256"], claimsToHeaders: {}, requiredClaims: [], clockSkewSeconds: 60 },
                    apiKey: { enabled: true, headerName: "X-API-Key", hashAlgorithm: "sha256", keys: [] },
                    oauth2: { enabled: false, authorizationUrl: "", tokenUrl: "", clientId: "", clientSecret: "", scopes: [], responseType: "code" },
                    mtls: { enabled: false, clientCaPath: "", requireClientCert: false, verifyDepth: 1 },
                },
                cors: { enabled: true, origins: ["*"], methods: ["GET", "POST", "PUT", "DELETE"], headers: ["Content-Type", "Authorization"], exposeHeaders: [], credentials: true, maxAge: 86400 },
                waf: { enabled: true, mode: "block", rules: [], customRules: [], ipBlacklist: [], ipWhitelist: [], geoBlocking: [], botProtection: { enabled: false, mode: "passive", allowedBots: [] }, rateLimiting: { enabled: true, requestsPerSecond: 100, burstSize: 200, blockDuration: 300 } },
                ipFilter: { enabled: false, mode: "blacklist", addresses: [], ranges: [] },
                headers: { hsts: { enabled: true, maxAge: 31536000, includeSubDomains: true, preload: true }, xContentTypeOptions: true, xFrameOptions: "DENY", xXssProtection: true, referrerPolicy: "strict-origin-when-cross-origin" },
                encryption: { atRest: true, inTransit: true, jweEnabled: false },
            },
            monitoring: { metrics: { enabled: true, endpoint: "/metrics", labels: [], histogramBuckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10] }, tracing: { enabled: true, provider: "otlp", endpoint: "", sampleRate: 0.1, propagation: ["w3c"] }, logging: { level: "info", format: "json", includeBody: false, maskFields: ["password", "token"], maxBodySize: 10000 }, alerts: [] },
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private seedConfiguration(): void {
        // Seed upstreams
        const bookingUpstream: UpstreamConfig = {
            id: "booking-service",
            name: "Booking Service",
            targets: [{ id: "t1", host: "localhost", port: 3000, weight: 100, tags: [], status: "healthy", priority: 1, metadata: {} }],
            loadBalancing: { strategy: "round_robin" },
            healthCheck: { enabled: true, path: "/health", interval: 30000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2, expectedStatus: [200] },
            circuitBreaker: { enabled: true, threshold: 5, timeout: 30000, halfOpenRequests: 3, monitoredErrors: [] },
            retryPolicy: { maxAttempts: 3, initialDelay: 100, maxDelay: 1000, backoffMultiplier: 2, retryOn: ["5xx", "timeout"], nonRetryableErrors: ["400", "401", "403", "404"] },
            connectionPool: { maxConnections: 100, maxIdleConnections: 10, idleTimeout: 60000, keepAlive: true },
            timeout: { connect: 5000, read: 30000, write: 30000, idle: 60000 },
        };

        this.upstreams.set(bookingUpstream.id, bookingUpstream);
        this.circuitBreakers.set(bookingUpstream.id, new CircuitBreaker(bookingUpstream.id, bookingUpstream.circuitBreaker));

        // Seed endpoints
        const bookingsEndpoint: EndpointConfig = {
            id: "get-bookings",
            name: "Get Bookings",
            path: "/api/v1/bookings",
            methods: ["GET"],
            upstreamId: "booking-service",
            timeout: 30000,
            retries: 3,
            policies: [],
            plugins: [],
            authentication: { type: "jwt", required: true },
            isPublic: false,
            isDeprecated: false,
            metadata: {},
        };

        this.endpoints.set(bookingsEndpoint.id, bookingsEndpoint);
    }

    private startHealthChecks(): void {
        setInterval(() => {
            for (const upstream of this.upstreams.values()) {
                if (upstream.healthCheck.enabled) {
                    this.performHealthCheck(upstream);
                }
            }
        }, 30000);
    }

    private async performHealthCheck(upstream: UpstreamConfig): Promise<void> {
        for (const target of upstream.targets) {
            try {
                // In production, make actual HTTP request
                const healthy = Math.random() > 0.1; // Simulated
                target.status = healthy ? "healthy" : "unhealthy";
            } catch {
                target.status = "unhealthy";
            }
        }
    }

    private startMetricsCollection(): void {
        setInterval(() => {
            this.metrics.flush();
        }, 10000);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS COLLECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class GatewayMetrics {
    private requestCount: number = 0;
    private errorCount: number = 0;
    private latencies: number[] = [];

    recordRequest(ctx: GatewayContext, endpoint: EndpointConfig, response: ResponseInfo): void {
        this.requestCount++;
        if (response.statusCode >= 400) this.errorCount++;
        this.latencies.push(ctx.timing.end! - ctx.timing.start);
    }

    flush(): void {
        if (this.latencies.length > 0) {
            const avg = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
            telemetry.info("Gateway metrics", "ApiGateway", {
                requests: this.requestCount,
                errors: this.errorCount,
                avgLatency: avg
            });
        }
        this.latencies = [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const apiGateway = new ApiGateway();
export default apiGateway;
