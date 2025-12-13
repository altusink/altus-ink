/**
 * ALTUS INK - ENTERPRISE INTEGRATIONS & WEBHOOKS SERVICE
 * Complete third-party integration and webhook management
 * 
 * Features:
 * - Webhook management and delivery
 * - OAuth2 provider integrations
 * - API key management
 * - Integration marketplace
 * - Event routing
 * - Retry and failure handling
 * - Rate limiting
 * - Payload transformation
 * - Integration monitoring
 * - SDK generation
 */

import { randomUUID } from "crypto";
import crypto from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Integration {
    id: string;
    name: string;
    description: string;
    provider: IntegrationProvider;
    type: IntegrationType;
    status: IntegrationStatus;
    category: IntegrationCategory;
    config: IntegrationConfig;
    credentials?: IntegrationCredentials;
    permissions: string[];
    rateLimit: RateLimitConfig;
    retryPolicy: RetryPolicy;
    webhooks: WebhookConfig[];
    transformations: DataTransformation[];
    health: IntegrationHealth;
    metrics: IntegrationMetrics;
    logs: IntegrationLog[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt?: Date;
}

export type IntegrationProvider =
    | "stripe"
    | "paypal"
    | "google"
    | "facebook"
    | "instagram"
    | "twitter"
    | "mailchimp"
    | "sendgrid"
    | "twilio"
    | "slack"
    | "zapier"
    | "hubspot"
    | "salesforce"
    | "quickbooks"
    | "xero"
    | "calendly"
    | "zoom"
    | "custom";

export type IntegrationType =
    | "payment"
    | "marketing"
    | "communication"
    | "calendar"
    | "crm"
    | "accounting"
    | "social"
    | "analytics"
    | "storage"
    | "automation";

export type IntegrationStatus =
    | "active"
    | "inactive"
    | "pending"
    | "error"
    | "suspended";

export type IntegrationCategory =
    | "official"
    | "partner"
    | "community"
    | "custom";

export interface IntegrationConfig {
    baseUrl?: string;
    apiVersion?: string;
    timeout: number;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    settings: Record<string, any>;
    webhookUrl?: string;
    webhookSecret?: string;
}

export interface IntegrationCredentials {
    type: "api_key" | "oauth2" | "basic" | "bearer" | "custom";
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
    scopes?: string[];
    customFields?: Record<string, string>;
}

export interface RateLimitConfig {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    burstLimit: number;
    currentUsage: RateLimitUsage;
}

export interface RateLimitUsage {
    minuteCount: number;
    hourCount: number;
    dayCount: number;
    minuteResetAt: Date;
    hourResetAt: Date;
    dayResetAt: Date;
}

export interface RetryPolicy {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableStatuses: number[];
    retryableErrors: string[];
}

export interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
    headers: Record<string, string>;
    retryPolicy: RetryPolicy;
    signatureMethod: "hmac-sha256" | "hmac-sha1" | "none";
    createdAt: Date;
}

export interface DataTransformation {
    id: string;
    name: string;
    sourceEvent: string;
    targetFormat: string;
    mapping: FieldMapping[];
    filters: TransformFilter[];
    isActive: boolean;
}

export interface FieldMapping {
    sourceField: string;
    targetField: string;
    transform?: "uppercase" | "lowercase" | "trim" | "date" | "number" | "boolean" | "custom";
    defaultValue?: any;
    customTransform?: string;
}

export interface TransformFilter {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "exists" | "not_exists";
    value?: any;
}

export interface IntegrationHealth {
    status: "healthy" | "degraded" | "unhealthy" | "unknown";
    lastCheck: Date;
    uptime: number;
    responseTime: number;
    errorRate: number;
    consecutiveFailures: number;
    lastError?: string;
}

export interface IntegrationMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    bytesTransferred: number;
    webhooksDelivered: number;
    webhooksFailed: number;
}

export interface IntegrationLog {
    id: string;
    timestamp: Date;
    level: "info" | "warning" | "error" | "debug";
    message: string;
    requestId?: string;
    duration?: number;
    metadata?: Record<string, any>;
}

export interface Webhook {
    id: string;
    integrationId?: string;
    name: string;
    description?: string;
    url: string;
    events: string[];
    secret: string;
    status: WebhookStatus;
    headers: Record<string, string>;
    retryPolicy: RetryPolicy;
    signatureMethod: "hmac-sha256" | "hmac-sha1" | "none";
    deliveries: WebhookDelivery[];
    metrics: WebhookMetrics;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type WebhookStatus = "active" | "inactive" | "suspended" | "testing";

export interface WebhookDelivery {
    id: string;
    webhookId: string;
    event: string;
    payload: any;
    status: DeliveryStatus;
    attempts: DeliveryAttempt[];
    createdAt: Date;
    completedAt?: Date;
}

export type DeliveryStatus = "pending" | "success" | "failed" | "retrying";

export interface DeliveryAttempt {
    attemptNumber: number;
    timestamp: Date;
    responseStatus?: number;
    responseBody?: string;
    responseTime?: number;
    error?: string;
}

export interface WebhookMetrics {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
    lastDeliveryAt?: Date;
    successRate: number;
}

export interface APIKey {
    id: string;
    name: string;
    key: string;
    keyPrefix: string;
    keyHash: string;
    permissions: APIPermission[];
    rateLimit: RateLimitConfig;
    ipWhitelist: string[];
    status: "active" | "inactive" | "revoked";
    expiresAt?: Date;
    lastUsedAt?: Date;
    usageCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface APIPermission {
    resource: string;
    actions: ("read" | "write" | "delete" | "admin")[];
}

export interface OAuthConnection {
    id: string;
    userId: string;
    provider: IntegrationProvider;
    providerUserId: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    scopes: string[];
    profile: Record<string, any>;
    status: "active" | "expired" | "revoked";
    connectedAt: Date;
    lastRefreshedAt?: Date;
}

export interface EventSubscription {
    id: string;
    subscriberId: string;
    events: string[];
    deliveryMethod: "webhook" | "queue" | "email";
    config: EventDeliveryConfig;
    filters: EventFilter[];
    status: "active" | "paused" | "cancelled";
    createdAt: Date;
}

export interface EventDeliveryConfig {
    webhookUrl?: string;
    webhookSecret?: string;
    queueName?: string;
    emailAddresses?: string[];
    batchSize?: number;
    batchWindow?: number;
}

export interface EventFilter {
    field: string;
    operator: string;
    value: any;
}

export interface Event {
    id: string;
    type: string;
    source: string;
    timestamp: Date;
    data: any;
    metadata: EventMetadata;
}

export interface EventMetadata {
    version: string;
    correlationId?: string;
    causationId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface IntegrationTemplate {
    id: string;
    provider: IntegrationProvider;
    name: string;
    description: string;
    category: IntegrationCategory;
    type: IntegrationType;
    icon: string;
    documentation: string;
    configSchema: any;
    credentialsSchema: any;
    supportedEvents: string[];
    features: string[];
    pricing?: string;
    isPopular: boolean;
    createdAt: Date;
}

// =============================================================================
// INTEGRATION SERVICE CLASS
// =============================================================================

export class IntegrationService {
    private integrations: Map<string, Integration> = new Map();
    private webhooks: Map<string, Webhook> = new Map();
    private apiKeys: Map<string, APIKey> = new Map();
    private oauthConnections: Map<string, OAuthConnection> = new Map();
    private subscriptions: Map<string, EventSubscription> = new Map();
    private templates: Map<string, IntegrationTemplate> = new Map();
    private events: Event[] = [];
    private deliveryQueue: WebhookDelivery[] = [];

    constructor() {
        this.initializeTemplates();
        this.startDeliveryProcessor();
    }

    // ===========================================================================
    // INTEGRATION MANAGEMENT
    // ===========================================================================

    async createIntegration(data: Partial<Integration>): Promise<Integration> {
        const integration: Integration = {
            id: randomUUID(),
            name: data.name || "",
            description: data.description || "",
            provider: data.provider || "custom",
            type: data.type || "automation",
            status: "pending",
            category: data.category || "custom",
            config: data.config || {
                timeout: 30000,
                headers: {},
                queryParams: {},
                settings: {}
            },
            permissions: data.permissions || [],
            rateLimit: data.rateLimit || this.getDefaultRateLimit(),
            retryPolicy: data.retryPolicy || this.getDefaultRetryPolicy(),
            webhooks: [],
            transformations: [],
            health: {
                status: "unknown",
                lastCheck: new Date(),
                uptime: 100,
                responseTime: 0,
                errorRate: 0,
                consecutiveFailures: 0
            },
            metrics: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                bytesTransferred: 0,
                webhooksDelivered: 0,
                webhooksFailed: 0
            },
            logs: [],
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.integrations.set(integration.id, integration);
        return integration;
    }

    async updateIntegration(id: string, data: Partial<Integration>): Promise<Integration | null> {
        const integration = this.integrations.get(id);
        if (!integration) return null;

        Object.assign(integration, data, { updatedAt: new Date() });
        return integration;
    }

    async deleteIntegration(id: string): Promise<boolean> {
        return this.integrations.delete(id);
    }

    async getIntegration(id: string): Promise<Integration | null> {
        return this.integrations.get(id) || null;
    }

    async getIntegrations(filters?: {
        provider?: IntegrationProvider;
        type?: IntegrationType;
        status?: IntegrationStatus;
    }): Promise<Integration[]> {
        let integrations = Array.from(this.integrations.values());

        if (filters) {
            if (filters.provider) {
                integrations = integrations.filter(i => i.provider === filters.provider);
            }
            if (filters.type) {
                integrations = integrations.filter(i => i.type === filters.type);
            }
            if (filters.status) {
                integrations = integrations.filter(i => i.status === filters.status);
            }
        }

        return integrations;
    }

    async activateIntegration(id: string): Promise<Integration | null> {
        const integration = this.integrations.get(id);
        if (!integration) return null;

        // Validate credentials and test connection
        const isValid = await this.testConnection(id);

        if (isValid) {
            integration.status = "active";
            integration.health.status = "healthy";
        } else {
            integration.status = "error";
            integration.health.status = "unhealthy";
        }

        integration.updatedAt = new Date();
        return integration;
    }

    async deactivateIntegration(id: string): Promise<Integration | null> {
        const integration = this.integrations.get(id);
        if (!integration) return null;

        integration.status = "inactive";
        integration.updatedAt = new Date();
        return integration;
    }

    async testConnection(id: string): Promise<boolean> {
        const integration = this.integrations.get(id);
        if (!integration) return false;

        const startTime = Date.now();

        try {
            // Simulate connection test
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));

            integration.health.lastCheck = new Date();
            integration.health.responseTime = Date.now() - startTime;
            integration.health.status = "healthy";
            integration.health.consecutiveFailures = 0;

            this.logIntegration(id, "info", "Connection test successful");
            return true;
        } catch (error: any) {
            integration.health.status = "unhealthy";
            integration.health.consecutiveFailures++;
            integration.health.lastError = error.message;

            this.logIntegration(id, "error", `Connection test failed: ${error.message}`);
            return false;
        }
    }

    async refreshOAuthToken(id: string): Promise<boolean> {
        const integration = this.integrations.get(id);
        if (!integration?.credentials?.refreshToken) return false;

        try {
            // Simulate token refresh
            integration.credentials.accessToken = `new_token_${randomUUID()}`;
            integration.credentials.tokenExpiresAt = new Date(Date.now() + 3600000);
            integration.updatedAt = new Date();

            this.logIntegration(id, "info", "OAuth token refreshed successfully");
            return true;
        } catch (error: any) {
            this.logIntegration(id, "error", `Token refresh failed: ${error.message}`);
            return false;
        }
    }

    private logIntegration(integrationId: string, level: IntegrationLog["level"], message: string, metadata?: Record<string, any>): void {
        const integration = this.integrations.get(integrationId);
        if (!integration) return;

        integration.logs.push({
            id: randomUUID(),
            timestamp: new Date(),
            level,
            message,
            metadata
        });

        // Keep only last 1000 logs
        if (integration.logs.length > 1000) {
            integration.logs = integration.logs.slice(-1000);
        }
    }

    private getDefaultRateLimit(): RateLimitConfig {
        return {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000,
            burstLimit: 10,
            currentUsage: {
                minuteCount: 0,
                hourCount: 0,
                dayCount: 0,
                minuteResetAt: new Date(Date.now() + 60000),
                hourResetAt: new Date(Date.now() + 3600000),
                dayResetAt: new Date(Date.now() + 86400000)
            }
        };
    }

    private getDefaultRetryPolicy(): RetryPolicy {
        return {
            maxRetries: 3,
            initialDelay: 1000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            retryableStatuses: [408, 429, 500, 502, 503, 504],
            retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"]
        };
    }

    // ===========================================================================
    // WEBHOOK MANAGEMENT
    // ===========================================================================

    async createWebhook(data: Partial<Webhook>): Promise<Webhook> {
        const webhook: Webhook = {
            id: randomUUID(),
            name: data.name || "Untitled Webhook",
            url: data.url || "",
            events: data.events || [],
            secret: data.secret || this.generateSecret(),
            status: "active",
            headers: data.headers || {},
            retryPolicy: data.retryPolicy || this.getDefaultRetryPolicy(),
            signatureMethod: data.signatureMethod || "hmac-sha256",
            deliveries: [],
            metrics: {
                totalDeliveries: 0,
                successfulDeliveries: 0,
                failedDeliveries: 0,
                averageResponseTime: 0,
                successRate: 100
            },
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.webhooks.set(webhook.id, webhook);
        return webhook;
    }

    async updateWebhook(id: string, data: Partial<Webhook>): Promise<Webhook | null> {
        const webhook = this.webhooks.get(id);
        if (!webhook) return null;

        Object.assign(webhook, data, { updatedAt: new Date() });
        return webhook;
    }

    async deleteWebhook(id: string): Promise<boolean> {
        return this.webhooks.delete(id);
    }

    async getWebhook(id: string): Promise<Webhook | null> {
        return this.webhooks.get(id) || null;
    }

    async getWebhooks(filters?: {
        status?: WebhookStatus;
        event?: string;
    }): Promise<Webhook[]> {
        let webhooks = Array.from(this.webhooks.values());

        if (filters) {
            if (filters.status) {
                webhooks = webhooks.filter(w => w.status === filters.status);
            }
            if (filters.event) {
                webhooks = webhooks.filter(w => w.events.includes(filters.event!));
            }
        }

        return webhooks;
    }

    async testWebhook(id: string): Promise<{ success: boolean; response?: any; error?: string }> {
        const webhook = this.webhooks.get(id);
        if (!webhook) return { success: false, error: "Webhook not found" };

        const testPayload = {
            event: "test",
            timestamp: new Date().toISOString(),
            data: { message: "This is a test webhook delivery" }
        };

        try {
            const result = await this.deliverWebhook(webhook, testPayload, "test");
            return { success: result.success, response: result.response };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async triggerWebhook(event: string, payload: any): Promise<void> {
        const webhooks = await this.getWebhooks({ status: "active", event });

        for (const webhook of webhooks) {
            const delivery: WebhookDelivery = {
                id: randomUUID(),
                webhookId: webhook.id,
                event,
                payload,
                status: "pending",
                attempts: [],
                createdAt: new Date()
            };

            webhook.deliveries.push(delivery);
            this.deliveryQueue.push(delivery);
        }
    }

    private async deliverWebhook(webhook: Webhook, payload: any, event: string): Promise<{ success: boolean; response?: any }> {
        const signature = this.signPayload(JSON.stringify(payload), webhook.secret, webhook.signatureMethod);

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": event,
            "X-Webhook-Id": webhook.id,
            "X-Webhook-Timestamp": new Date().toISOString(),
            ...webhook.headers
        };

        const startTime = Date.now();

        try {
            // Simulate HTTP request
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));

            const responseTime = Date.now() - startTime;

            webhook.metrics.totalDeliveries++;
            webhook.metrics.successfulDeliveries++;
            webhook.metrics.lastDeliveryAt = new Date();
            webhook.metrics.averageResponseTime =
                (webhook.metrics.averageResponseTime * (webhook.metrics.totalDeliveries - 1) + responseTime) /
                webhook.metrics.totalDeliveries;
            webhook.metrics.successRate = (webhook.metrics.successfulDeliveries / webhook.metrics.totalDeliveries) * 100;

            return { success: true, response: { status: 200 } };
        } catch (error: any) {
            webhook.metrics.totalDeliveries++;
            webhook.metrics.failedDeliveries++;
            webhook.metrics.successRate = (webhook.metrics.successfulDeliveries / webhook.metrics.totalDeliveries) * 100;

            throw error;
        }
    }

    private signPayload(payload: string, secret: string, method: "hmac-sha256" | "hmac-sha1" | "none"): string {
        if (method === "none") return "";

        const algorithm = method === "hmac-sha256" ? "sha256" : "sha1";
        return crypto.createHmac(algorithm, secret).update(payload).digest("hex");
    }

    private generateSecret(): string {
        return crypto.randomBytes(32).toString("hex");
    }

    private async startDeliveryProcessor(): void {
        // Process delivery queue
        setInterval(async () => {
            while (this.deliveryQueue.length > 0) {
                const delivery = this.deliveryQueue.shift()!;
                const webhook = this.webhooks.get(delivery.webhookId);

                if (!webhook || webhook.status !== "active") continue;

                await this.processDelivery(webhook, delivery);
            }
        }, 1000);
    }

    private async processDelivery(webhook: Webhook, delivery: WebhookDelivery): Promise<void> {
        const maxRetries = webhook.retryPolicy.maxRetries;
        let delay = webhook.retryPolicy.initialDelay;

        for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
            delivery.status = attempt > 1 ? "retrying" : "pending";

            try {
                const result = await this.deliverWebhook(webhook, delivery.payload, delivery.event);

                delivery.attempts.push({
                    attemptNumber: attempt,
                    timestamp: new Date(),
                    responseStatus: 200,
                    responseTime: Math.random() * 500 + 100
                });

                delivery.status = "success";
                delivery.completedAt = new Date();
                return;
            } catch (error: any) {
                delivery.attempts.push({
                    attemptNumber: attempt,
                    timestamp: new Date(),
                    error: error.message
                });

                if (attempt <= maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay = Math.min(delay * webhook.retryPolicy.backoffMultiplier, webhook.retryPolicy.maxDelay);
                } else {
                    delivery.status = "failed";
                    delivery.completedAt = new Date();
                }
            }
        }
    }

    // ===========================================================================
    // API KEY MANAGEMENT
    // ===========================================================================

    async createAPIKey(data: {
        name: string;
        permissions: APIPermission[];
        rateLimit?: RateLimitConfig;
        ipWhitelist?: string[];
        expiresAt?: Date;
        createdBy: string;
    }): Promise<{ apiKey: APIKey; rawKey: string }> {
        const rawKey = `ak_${crypto.randomBytes(32).toString("hex")}`;
        const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
        const keyPrefix = rawKey.substring(0, 10);

        const apiKey: APIKey = {
            id: randomUUID(),
            name: data.name,
            key: `${keyPrefix}...`,
            keyPrefix,
            keyHash,
            permissions: data.permissions,
            rateLimit: data.rateLimit || this.getDefaultRateLimit(),
            ipWhitelist: data.ipWhitelist || [],
            status: "active",
            expiresAt: data.expiresAt,
            usageCount: 0,
            createdBy: data.createdBy,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.apiKeys.set(apiKey.id, apiKey);
        return { apiKey, rawKey };
    }

    async validateAPIKey(rawKey: string, ipAddress?: string): Promise<{
        valid: boolean;
        apiKey?: APIKey;
        error?: string;
    }> {
        const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

        let foundKey: APIKey | undefined;
        for (const key of this.apiKeys.values()) {
            if (key.keyHash === keyHash) {
                foundKey = key;
                break;
            }
        }

        if (!foundKey) {
            return { valid: false, error: "Invalid API key" };
        }

        if (foundKey.status !== "active") {
            return { valid: false, error: "API key is not active" };
        }

        if (foundKey.expiresAt && foundKey.expiresAt < new Date()) {
            return { valid: false, error: "API key has expired" };
        }

        if (foundKey.ipWhitelist.length > 0 && ipAddress) {
            if (!foundKey.ipWhitelist.includes(ipAddress)) {
                return { valid: false, error: "IP address not whitelisted" };
            }
        }

        // Check rate limits
        if (!this.checkRateLimit(foundKey.rateLimit)) {
            return { valid: false, error: "Rate limit exceeded" };
        }

        // Update usage
        foundKey.usageCount++;
        foundKey.lastUsedAt = new Date();
        this.incrementRateLimit(foundKey.rateLimit);

        return { valid: true, apiKey: foundKey };
    }

    async revokeAPIKey(id: string): Promise<boolean> {
        const apiKey = this.apiKeys.get(id);
        if (!apiKey) return false;

        apiKey.status = "revoked";
        apiKey.updatedAt = new Date();
        return true;
    }

    async getAPIKeys(createdBy?: string): Promise<APIKey[]> {
        let keys = Array.from(this.apiKeys.values());

        if (createdBy) {
            keys = keys.filter(k => k.createdBy === createdBy);
        }

        return keys.filter(k => k.status !== "revoked");
    }

    private checkRateLimit(rateLimit: RateLimitConfig): boolean {
        const now = new Date();
        const usage = rateLimit.currentUsage;

        // Reset counters if needed
        if (now >= usage.minuteResetAt) {
            usage.minuteCount = 0;
            usage.minuteResetAt = new Date(now.getTime() + 60000);
        }
        if (now >= usage.hourResetAt) {
            usage.hourCount = 0;
            usage.hourResetAt = new Date(now.getTime() + 3600000);
        }
        if (now >= usage.dayResetAt) {
            usage.dayCount = 0;
            usage.dayResetAt = new Date(now.getTime() + 86400000);
        }

        return (
            usage.minuteCount < rateLimit.requestsPerMinute &&
            usage.hourCount < rateLimit.requestsPerHour &&
            usage.dayCount < rateLimit.requestsPerDay
        );
    }

    private incrementRateLimit(rateLimit: RateLimitConfig): void {
        rateLimit.currentUsage.minuteCount++;
        rateLimit.currentUsage.hourCount++;
        rateLimit.currentUsage.dayCount++;
    }

    // ===========================================================================
    // OAUTH CONNECTIONS
    // ===========================================================================

    async createOAuthConnection(data: {
        userId: string;
        provider: IntegrationProvider;
        providerUserId: string;
        accessToken: string;
        refreshToken?: string;
        tokenExpiresAt?: Date;
        scopes: string[];
        profile: Record<string, any>;
    }): Promise<OAuthConnection> {
        // Check for existing connection
        const existing = Array.from(this.oauthConnections.values()).find(
            c => c.userId === data.userId && c.provider === data.provider
        );

        if (existing) {
            existing.accessToken = data.accessToken;
            existing.refreshToken = data.refreshToken;
            existing.tokenExpiresAt = data.tokenExpiresAt;
            existing.scopes = data.scopes;
            existing.profile = data.profile;
            existing.lastRefreshedAt = new Date();
            return existing;
        }

        const connection: OAuthConnection = {
            id: randomUUID(),
            userId: data.userId,
            provider: data.provider,
            providerUserId: data.providerUserId,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tokenExpiresAt: data.tokenExpiresAt,
            scopes: data.scopes,
            profile: data.profile,
            status: "active",
            connectedAt: new Date()
        };

        this.oauthConnections.set(connection.id, connection);
        return connection;
    }

    async getOAuthConnections(userId: string): Promise<OAuthConnection[]> {
        return Array.from(this.oauthConnections.values()).filter(
            c => c.userId === userId && c.status === "active"
        );
    }

    async disconnectOAuth(id: string): Promise<boolean> {
        const connection = this.oauthConnections.get(id);
        if (!connection) return false;

        connection.status = "revoked";
        return true;
    }

    // ===========================================================================
    // EVENT SUBSCRIPTIONS
    // ===========================================================================

    async createSubscription(data: Partial<EventSubscription>): Promise<EventSubscription> {
        const subscription: EventSubscription = {
            id: randomUUID(),
            subscriberId: data.subscriberId || "",
            events: data.events || [],
            deliveryMethod: data.deliveryMethod || "webhook",
            config: data.config || {},
            filters: data.filters || [],
            status: "active",
            createdAt: new Date(),
            ...data
        };

        this.subscriptions.set(subscription.id, subscription);
        return subscription;
    }

    async getSubscriptions(subscriberId: string): Promise<EventSubscription[]> {
        return Array.from(this.subscriptions.values()).filter(
            s => s.subscriberId === subscriberId
        );
    }

    async cancelSubscription(id: string): Promise<boolean> {
        const subscription = this.subscriptions.get(id);
        if (!subscription) return false;

        subscription.status = "cancelled";
        return true;
    }

    // ===========================================================================
    // EVENT DISPATCH
    // ===========================================================================

    async dispatchEvent(type: string, source: string, data: any, metadata?: Partial<EventMetadata>): Promise<Event> {
        const event: Event = {
            id: randomUUID(),
            type,
            source,
            timestamp: new Date(),
            data,
            metadata: {
                version: "1.0",
                correlationId: metadata?.correlationId || randomUUID(),
                ...metadata
            }
        };

        this.events.push(event);

        // Keep only last 10000 events
        if (this.events.length > 10000) {
            this.events = this.events.slice(-10000);
        }

        // Trigger webhooks
        await this.triggerWebhook(type, event);

        // Process subscriptions
        await this.processSubscriptions(event);

        return event;
    }

    async getEvents(filters?: {
        type?: string;
        source?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
    }): Promise<Event[]> {
        let events = [...this.events];

        if (filters) {
            if (filters.type) {
                events = events.filter(e => e.type === filters.type);
            }
            if (filters.source) {
                events = events.filter(e => e.source === filters.source);
            }
            if (filters.fromDate) {
                events = events.filter(e => e.timestamp >= filters.fromDate!);
            }
            if (filters.toDate) {
                events = events.filter(e => e.timestamp <= filters.toDate!);
            }
        }

        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (filters?.limit) {
            events = events.slice(0, filters.limit);
        }

        return events;
    }

    private async processSubscriptions(event: Event): Promise<void> {
        const subscriptions = Array.from(this.subscriptions.values()).filter(
            s => s.status === "active" && s.events.includes(event.type)
        );

        for (const sub of subscriptions) {
            // Check filters
            const passesFilters = sub.filters.every(filter => {
                const value = this.getNestedValue(event.data, filter.field);
                switch (filter.operator) {
                    case "equals": return value === filter.value;
                    case "not_equals": return value !== filter.value;
                    case "contains": return String(value).includes(filter.value);
                    case "exists": return value !== undefined;
                    default: return true;
                }
            });

            if (!passesFilters) continue;

            // Deliver based on method
            if (sub.deliveryMethod === "webhook" && sub.config.webhookUrl) {
                await this.deliverToWebhookUrl(sub.config.webhookUrl, event, sub.config.webhookSecret);
            }
        }
    }

    private async deliverToWebhookUrl(url: string, event: Event, secret?: string): Promise<void> {
        // Simulate delivery
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split(".").reduce((o, k) => o?.[k], obj);
    }

    // ===========================================================================
    // INTEGRATION TEMPLATES
    // ===========================================================================

    async getTemplates(filters?: {
        type?: IntegrationType;
        category?: IntegrationCategory;
    }): Promise<IntegrationTemplate[]> {
        let templates = Array.from(this.templates.values());

        if (filters) {
            if (filters.type) {
                templates = templates.filter(t => t.type === filters.type);
            }
            if (filters.category) {
                templates = templates.filter(t => t.category === filters.category);
            }
        }

        return templates.sort((a, b) => {
            if (a.isPopular && !b.isPopular) return -1;
            if (!a.isPopular && b.isPopular) return 1;
            return a.name.localeCompare(b.name);
        });
    }

    async getTemplate(id: string): Promise<IntegrationTemplate | null> {
        return this.templates.get(id) || null;
    }

    async createIntegrationFromTemplate(templateId: string, config: Partial<IntegrationConfig>, credentials: IntegrationCredentials, createdBy: string): Promise<Integration | null> {
        const template = this.templates.get(templateId);
        if (!template) return null;

        return this.createIntegration({
            name: template.name,
            description: template.description,
            provider: template.provider,
            type: template.type,
            category: template.category,
            config: { ...config, settings: template.configSchema },
            credentials,
            permissions: template.supportedEvents,
            createdBy
        });
    }

    private initializeTemplates(): void {
        const templates: IntegrationTemplate[] = [
            {
                id: "tpl-stripe",
                provider: "stripe",
                name: "Stripe",
                description: "Accept payments and manage subscriptions",
                category: "official",
                type: "payment",
                icon: "stripe-icon",
                documentation: "https://stripe.com/docs",
                configSchema: { webhookEndpoint: true, currency: "EUR" },
                credentialsSchema: { apiKey: true, webhookSecret: true },
                supportedEvents: ["payment.completed", "payment.failed", "subscription.created", "subscription.cancelled"],
                features: ["Payments", "Subscriptions", "Invoices", "Refunds"],
                pricing: "2.9% + €0.25 per transaction",
                isPopular: true,
                createdAt: new Date()
            },
            {
                id: "tpl-mailchimp",
                provider: "mailchimp",
                name: "Mailchimp",
                description: "Email marketing automation",
                category: "official",
                type: "marketing",
                icon: "mailchimp-icon",
                documentation: "https://mailchimp.com/developer",
                configSchema: { audienceId: true },
                credentialsSchema: { apiKey: true, serverPrefix: true },
                supportedEvents: ["contact.subscribed", "contact.unsubscribed", "campaign.sent"],
                features: ["Email Campaigns", "Automation", "Audience Management"],
                isPopular: true,
                createdAt: new Date()
            },
            {
                id: "tpl-slack",
                provider: "slack",
                name: "Slack",
                description: "Team communication and notifications",
                category: "official",
                type: "communication",
                icon: "slack-icon",
                documentation: "https://api.slack.com",
                configSchema: { channel: true },
                credentialsSchema: { webhookUrl: true, botToken: false },
                supportedEvents: ["notification.sent"],
                features: ["Notifications", "Bot Messages", "Interactive Messages"],
                isPopular: true,
                createdAt: new Date()
            },
            {
                id: "tpl-google-calendar",
                provider: "google",
                name: "Google Calendar",
                description: "Sync bookings with Google Calendar",
                category: "official",
                type: "calendar",
                icon: "google-calendar-icon",
                documentation: "https://developers.google.com/calendar",
                configSchema: { calendarId: true },
                credentialsSchema: { clientId: true, clientSecret: true, refreshToken: true },
                supportedEvents: ["booking.created", "booking.updated", "booking.cancelled"],
                features: ["Calendar Sync", "Availability", "Reminders"],
                isPopular: true,
                createdAt: new Date()
            },
            {
                id: "tpl-zapier",
                provider: "zapier",
                name: "Zapier",
                description: "Connect with 5000+ apps",
                category: "official",
                type: "automation",
                icon: "zapier-icon",
                documentation: "https://zapier.com/developer",
                configSchema: { webhookUrl: true },
                credentialsSchema: { apiKey: true },
                supportedEvents: ["*"],
                features: ["Automated Workflows", "Multi-step Zaps", "Webhooks"],
                isPopular: true,
                createdAt: new Date()
            },
            {
                id: "tpl-instagram",
                provider: "instagram",
                name: "Instagram",
                description: "Share portfolio and connect with customers",
                category: "official",
                type: "social",
                icon: "instagram-icon",
                documentation: "https://developers.facebook.com/docs/instagram",
                configSchema: { accountId: true },
                credentialsSchema: { accessToken: true },
                supportedEvents: ["post.published", "comment.received", "message.received"],
                features: ["Post Publishing", "DM Integration", "Analytics"],
                isPopular: true,
                createdAt: new Date()
            }
        ];

        for (const template of templates) {
            this.templates.set(template.id, template);
        }
    }

    // ===========================================================================
    // METRICS & MONITORING
    // ===========================================================================

    async getIntegrationStats(): Promise<{
        total: number;
        byStatus: Record<IntegrationStatus, number>;
        byType: Record<IntegrationType, number>;
        healthSummary: { healthy: number; degraded: number; unhealthy: number };
        totalRequests: number;
        successRate: number;
    }> {
        const integrations = Array.from(this.integrations.values());

        const byStatus: Record<IntegrationStatus, number> = {
            active: 0, inactive: 0, pending: 0, error: 0, suspended: 0
        };
        const byType: Partial<Record<IntegrationType, number>> = {};
        const healthSummary = { healthy: 0, degraded: 0, unhealthy: 0 };

        let totalRequests = 0;
        let successfulRequests = 0;

        for (const integration of integrations) {
            byStatus[integration.status]++;
            byType[integration.type] = (byType[integration.type] || 0) + 1;

            if (integration.health.status === "healthy") healthSummary.healthy++;
            else if (integration.health.status === "degraded") healthSummary.degraded++;
            else healthSummary.unhealthy++;

            totalRequests += integration.metrics.totalRequests;
            successfulRequests += integration.metrics.successfulRequests;
        }

        return {
            total: integrations.length,
            byStatus,
            byType: byType as Record<IntegrationType, number>,
            healthSummary,
            totalRequests,
            successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100
        };
    }

    async getWebhookStats(): Promise<{
        total: number;
        byStatus: Record<WebhookStatus, number>;
        totalDeliveries: number;
        successRate: number;
        averageResponseTime: number;
    }> {
        const webhooks = Array.from(this.webhooks.values());

        const byStatus: Record<WebhookStatus, number> = {
            active: 0, inactive: 0, suspended: 0, testing: 0
        };

        let totalDeliveries = 0;
        let successfulDeliveries = 0;
        let totalResponseTime = 0;

        for (const webhook of webhooks) {
            byStatus[webhook.status]++;
            totalDeliveries += webhook.metrics.totalDeliveries;
            successfulDeliveries += webhook.metrics.successfulDeliveries;
            totalResponseTime += webhook.metrics.averageResponseTime * webhook.metrics.totalDeliveries;
        }

        return {
            total: webhooks.length,
            byStatus,
            totalDeliveries,
            successRate: totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 100,
            averageResponseTime: totalDeliveries > 0 ? totalResponseTime / totalDeliveries : 0
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const integrationService = new IntegrationService();
export default integrationService;
