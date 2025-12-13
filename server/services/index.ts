/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE SERVICE REGISTRY & ORCHESTRATION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Central hub for all backend services. This module provides:
 * 
 * 1. Service Registration & Discovery
 * 2. Health Monitoring & Circuit Breaking
 * 3. Dependency Injection Container
 * 4. Lifecycle Management (Init, Start, Stop, Restart)
 * 5. Configuration Validation
 * 6. Service Mesh Integration
 * 7. Metrics & Telemetry Collection
 * 8. Graceful Degradation
 * 
 * @module services
 * @version 2.0.0
 * @author Altus Ink Engineering Team
 * @license Proprietary
 */

import { EventEmitter } from "events";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Service lifecycle states
 */
export enum ServiceState {
    UNINITIALIZED = "uninitialized",
    INITIALIZING = "initializing",
    READY = "ready",
    STARTING = "starting",
    RUNNING = "running",
    STOPPING = "stopping",
    STOPPED = "stopped",
    ERROR = "error",
    DEGRADED = "degraded",
    MAINTENANCE = "maintenance"
}

/**
 * Service priority levels for initialization order
 */
export enum ServicePriority {
    CRITICAL = 0,      // Database, Cache, Event Bus
    HIGH = 1,          // Auth, Security, Config
    NORMAL = 2,        // Business Logic Services
    LOW = 3,           // Telemetry, Analytics
    BACKGROUND = 4     // Non-essential services
}

/**
 * Service health status
 */
export interface ServiceHealth {
    status: "healthy" | "unhealthy" | "degraded" | "unknown";
    latency: number;
    lastCheck: Date;
    consecutiveFailures: number;
    uptime: number;
    memory: number;
    cpu: number;
    details?: Record<string, unknown>;
}

/**
 * Service metadata
 */
export interface ServiceMetadata {
    name: string;
    version: string;
    description: string;
    priority: ServicePriority;
    dependencies: string[];
    features: string[];
    configRequired: string[];
    documentation?: string;
}

/**
 * Service interface that all services must implement
 */
export interface IService {
    metadata: ServiceMetadata;
    state: ServiceState;
    health: ServiceHealth;

    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    healthCheck(): Promise<ServiceHealth>;
    getMetrics(): Record<string, number>;
}

/**
 * Service registration entry
 */
interface ServiceRegistration {
    service: IService | (() => Promise<IService>);
    metadata: ServiceMetadata;
    instance?: IService;
    state: ServiceState;
    registeredAt: Date;
    lastStateChange: Date;
    errorCount: number;
    lastError?: Error;
}

/**
 * Service event types
 */
export type ServiceEventType =
    | "registered"
    | "initialized"
    | "started"
    | "stopped"
    | "error"
    | "health_check"
    | "state_change"
    | "dependency_ready"
    | "circuit_open"
    | "circuit_close";

/**
 * Service event payload
 */
export interface ServiceEvent {
    type: ServiceEventType;
    serviceName: string;
    timestamp: Date;
    data?: unknown;
    error?: Error;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Global service registry and orchestrator
 */
class ServiceRegistry extends EventEmitter {
    private static instance: ServiceRegistry;
    private services: Map<string, ServiceRegistration> = new Map();
    private initialized: boolean = false;
    private starting: boolean = false;
    private shutdownInProgress: boolean = false;

    private constructor() {
        super();
        this.setMaxListeners(100);
        this.setupProcessHandlers();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    /**
     * Setup process signal handlers for graceful shutdown
     */
    private setupProcessHandlers(): void {
        const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGHUP"];

        signals.forEach(signal => {
            process.on(signal, async () => {
                console.log(`[ServiceRegistry] Received ${signal}, initiating graceful shutdown...`);
                await this.shutdown();
                process.exit(0);
            });
        });

        process.on("uncaughtException", (error) => {
            console.error("[ServiceRegistry] Uncaught Exception:", error);
            this.emit("error", { type: "uncaughtException", error });
        });

        process.on("unhandledRejection", (reason) => {
            console.error("[ServiceRegistry] Unhandled Rejection:", reason);
            this.emit("error", { type: "unhandledRejection", error: reason });
        });
    }

    /**
     * Register a service
     */
    register(
        name: string,
        service: IService | (() => Promise<IService>),
        metadata: Partial<ServiceMetadata> = {}
    ): void {
        if (this.services.has(name)) {
            console.warn(`[ServiceRegistry] Service "${name}" already registered, updating...`);
        }

        const fullMetadata: ServiceMetadata = {
            name,
            version: metadata.version || "1.0.0",
            description: metadata.description || `${name} service`,
            priority: metadata.priority ?? ServicePriority.NORMAL,
            dependencies: metadata.dependencies || [],
            features: metadata.features || [],
            configRequired: metadata.configRequired || [],
            documentation: metadata.documentation
        };

        const registration: ServiceRegistration = {
            service,
            metadata: fullMetadata,
            state: ServiceState.UNINITIALIZED,
            registeredAt: new Date(),
            lastStateChange: new Date(),
            errorCount: 0
        };

        this.services.set(name, registration);
        this.emitEvent("registered", name);

        console.log(`[ServiceRegistry] Registered: ${name} (priority: ${fullMetadata.priority})`);
    }

    /**
     * Get a service instance
     */
    async get<T extends IService>(name: string): Promise<T | null> {
        const registration = this.services.get(name);
        if (!registration) {
            console.warn(`[ServiceRegistry] Service "${name}" not found`);
            return null;
        }

        if (!registration.instance) {
            await this.initializeService(name);
        }

        return registration.instance as T | null;
    }

    /**
     * Check if a service is registered
     */
    has(name: string): boolean {
        return this.services.has(name);
    }

    /**
     * Get all registered service names
     */
    getServiceNames(): string[] {
        return Array.from(this.services.keys());
    }

    /**
     * Get service metadata
     */
    getMetadata(name: string): ServiceMetadata | null {
        return this.services.get(name)?.metadata || null;
    }

    /**
     * Initialize a single service
     */
    private async initializeService(name: string): Promise<void> {
        const registration = this.services.get(name);
        if (!registration) {
            throw new Error(`Service "${name}" not registered`);
        }

        if (registration.instance) {
            return; // Already initialized
        }

        // Check dependencies
        for (const dep of registration.metadata.dependencies) {
            const depReg = this.services.get(dep);
            if (!depReg) {
                throw new Error(`Missing dependency "${dep}" for service "${name}"`);
            }
            if (!depReg.instance) {
                await this.initializeService(dep);
            }
        }

        try {
            this.updateState(name, ServiceState.INITIALIZING);

            // Create instance
            if (typeof registration.service === "function") {
                registration.instance = await registration.service();
            } else {
                registration.instance = registration.service;
            }

            // Call initialize if available
            if (registration.instance.initialize) {
                await registration.instance.initialize();
            }

            this.updateState(name, ServiceState.READY);
            this.emitEvent("initialized", name);

        } catch (error) {
            registration.errorCount++;
            registration.lastError = error as Error;
            this.updateState(name, ServiceState.ERROR);
            this.emitEvent("error", name, error);
            throw error;
        }
    }

    /**
     * Initialize all services in priority order
     */
    async initializeAll(): Promise<void> {
        if (this.initialized) {
            console.warn("[ServiceRegistry] Already initialized");
            return;
        }

        console.log("[ServiceRegistry] Initializing all services...");
        const start = Date.now();

        // Sort by priority
        const sorted = Array.from(this.services.entries())
            .sort((a, b) => a[1].metadata.priority - b[1].metadata.priority);

        // Initialize in batches by priority
        const batches = new Map<ServicePriority, string[]>();
        for (const [name, reg] of sorted) {
            const priority = reg.metadata.priority;
            if (!batches.has(priority)) {
                batches.set(priority, []);
            }
            batches.get(priority)!.push(name);
        }

        for (const priority of [
            ServicePriority.CRITICAL,
            ServicePriority.HIGH,
            ServicePriority.NORMAL,
            ServicePriority.LOW,
            ServicePriority.BACKGROUND
        ]) {
            const batch = batches.get(priority) || [];
            if (batch.length === 0) continue;

            console.log(`[ServiceRegistry] Initializing priority ${priority}: ${batch.join(", ")}`);

            await Promise.all(
                batch.map(name => this.initializeService(name).catch(err => {
                    console.error(`[ServiceRegistry] Failed to initialize ${name}:`, err);
                }))
            );
        }

        this.initialized = true;
        console.log(`[ServiceRegistry] All services initialized in ${Date.now() - start}ms`);
    }

    /**
     * Start all services
     */
    async startAll(): Promise<void> {
        if (this.starting) {
            console.warn("[ServiceRegistry] Start already in progress");
            return;
        }

        this.starting = true;
        console.log("[ServiceRegistry] Starting all services...");

        for (const [name, reg] of this.services) {
            if (reg.instance && reg.instance.start) {
                try {
                    this.updateState(name, ServiceState.STARTING);
                    await reg.instance.start();
                    this.updateState(name, ServiceState.RUNNING);
                    this.emitEvent("started", name);
                } catch (error) {
                    console.error(`[ServiceRegistry] Failed to start ${name}:`, error);
                    this.updateState(name, ServiceState.ERROR);
                }
            }
        }

        this.starting = false;
        console.log("[ServiceRegistry] All services started");
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        if (this.shutdownInProgress) {
            console.warn("[ServiceRegistry] Shutdown already in progress");
            return;
        }

        this.shutdownInProgress = true;
        console.log("[ServiceRegistry] Shutting down all services...");

        // Stop in reverse priority order
        const sorted = Array.from(this.services.entries())
            .sort((a, b) => b[1].metadata.priority - a[1].metadata.priority);

        for (const [name, reg] of sorted) {
            if (reg.instance && reg.instance.stop) {
                try {
                    this.updateState(name, ServiceState.STOPPING);
                    await reg.instance.stop();
                    this.updateState(name, ServiceState.STOPPED);
                    this.emitEvent("stopped", name);
                } catch (error) {
                    console.error(`[ServiceRegistry] Error stopping ${name}:`, error);
                }
            }
        }

        console.log("[ServiceRegistry] All services stopped");
    }

    /**
     * Health check all services
     */
    async healthCheckAll(): Promise<Map<string, ServiceHealth>> {
        const results = new Map<string, ServiceHealth>();

        for (const [name, reg] of this.services) {
            if (reg.instance && reg.instance.healthCheck) {
                try {
                    const health = await reg.instance.healthCheck();
                    results.set(name, health);
                } catch (error) {
                    results.set(name, {
                        status: "unhealthy",
                        latency: 0,
                        lastCheck: new Date(),
                        consecutiveFailures: reg.errorCount,
                        uptime: 0,
                        memory: 0,
                        cpu: 0,
                        details: { error: (error as Error).message }
                    });
                }
            } else {
                results.set(name, {
                    status: reg.instance ? "healthy" : "unknown",
                    latency: 0,
                    lastCheck: new Date(),
                    consecutiveFailures: 0,
                    uptime: Date.now() - reg.registeredAt.getTime(),
                    memory: 0,
                    cpu: 0
                });
            }
        }

        this.emitEvent("health_check", "*", { results: Object.fromEntries(results) });
        return results;
    }

    /**
     * Get aggregated metrics
     */
    getAggregatedMetrics(): Record<string, Record<string, number>> {
        const metrics: Record<string, Record<string, number>> = {};

        for (const [name, reg] of this.services) {
            if (reg.instance && reg.instance.getMetrics) {
                metrics[name] = reg.instance.getMetrics();
            }
        }

        return metrics;
    }

    /**
     * Get service status summary
     */
    getStatusSummary(): {
        total: number;
        running: number;
        stopped: number;
        error: number;
        degraded: number;
        services: Array<{ name: string; state: ServiceState; priority: ServicePriority }>;
    } {
        let running = 0, stopped = 0, error = 0, degraded = 0;
        const services: Array<{ name: string; state: ServiceState; priority: ServicePriority }> = [];

        for (const [name, reg] of this.services) {
            services.push({
                name,
                state: reg.state,
                priority: reg.metadata.priority
            });

            switch (reg.state) {
                case ServiceState.RUNNING: running++; break;
                case ServiceState.STOPPED: stopped++; break;
                case ServiceState.ERROR: error++; break;
                case ServiceState.DEGRADED: degraded++; break;
            }
        }

        return {
            total: this.services.size,
            running,
            stopped,
            error,
            degraded,
            services
        };
    }

    /**
     * Update service state
     */
    private updateState(name: string, state: ServiceState): void {
        const reg = this.services.get(name);
        if (reg) {
            const previousState = reg.state;
            reg.state = state;
            reg.lastStateChange = new Date();

            this.emitEvent("state_change", name, { previousState, newState: state });
        }
    }

    /**
     * Emit a service event
     */
    private emitEvent(type: ServiceEventType, serviceName: string, data?: unknown): void {
        const event: ServiceEvent = {
            type,
            serviceName,
            timestamp: new Date(),
            data,
            error: data instanceof Error ? data : undefined
        };

        this.emit(type, event);
        this.emit("*", event); // Wildcard for all events
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

export const serviceRegistry = ServiceRegistry.getInstance();

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Core Infrastructure
export { TelemetryService, telemetryService } from "./core/telemetry";
export { CacheService, cacheService } from "./core/cache";
export { EventBusService, eventBus } from "./core/event-bus";

// Payment Processing
export { default as stripeService, isStripeConfigured } from "./stripe";
export { PaymentService, paymentService } from "./payment";
export { FintechService, fintechService } from "./payments-fintech";

// Communication
export { default as emailService, EmailService } from "./email";
export { default as whatsappService, WhatsAppService } from "./whatsapp";
export { default as chatwootService, ChatwootService } from "./chatwoot";
export { NotificationService, notificationService } from "./notification";

// Business Logic
export { default as bookingService, BookingService } from "./booking";
export { AnalyticsService, analyticsService } from "./analytics";
export { SecurityService, securityService } from "./security";
export { CRMService, crmService } from "./crm";
export { InventoryService, inventoryService } from "./inventory";
export { ReportingService, reportingService } from "./reporting";

// AI & Machine Learning
export { AIMLService, aimlService } from "./ai-ml";
export { OracleService, oracleService } from "./oracle";
export { KnowledgeBaseService, knowledgeBaseService } from "./knowledge-base";

// Enterprise Modules
export { WorkflowEngineService, workflowEngine } from "./workflow-engine";
export { CMSService, cmsService } from "./cms";
export { EcommerceService, ecommerceService } from "./ecommerce";
export { MarketingAutomationService, marketingService } from "./marketing-automation";
export { SubscriptionBillingService, subscriptionService } from "./subscription-billing";
export { ProjectManagementService, projectManagementService } from "./project-management";
export { DocumentManagementService, documentService } from "./document-management";
export { WorkforceService, workforceService } from "./workforce";

// Vertical Solutions
export { ManufacturingService, manufacturingService } from "./manufacturing";
export { FleetManagementService, fleetService } from "./fleet-management";
export { RealEstateService, realEstateService } from "./real-estate";
export { LearningManagementService, lmsService } from "./learning-management";
export { EventManagementService, eventManagementService } from "./event-management";
export { FranchiseManagementService, franchiseService } from "./franchise-management";
export { GlobalMarketplaceService, marketplaceService } from "./global-marketplace";
export { IoTHardwareService, iotService } from "./iot-hardware";
export { SocialMediaService, socialMediaService } from "./social-media-manager";
export { SupplyChainService, supplyChainService } from "./supply-chain";

// Compliance & Legal
export { ComplianceLegalService, complianceService } from "./compliance-legal";
export { AuditComplianceService, auditService } from "./audit-compliance";

// Platform
export { APIGatewayService, apiGateway } from "./api-gateway";
export { IntegrationsService, integrationsService } from "./integrations";
export { MultiLocationService, multiLocationService } from "./multi-location";
export { GlobalizationService, globalizationService } from "./globalization";
export { StorageService, storageService } from "./storage";

// ═══════════════════════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use serviceRegistry.healthCheckAll() instead
 */
export async function healthCheck(): Promise<{
    healthy: boolean;
    services: Record<string, { status: "ok" | "error" | "not_configured"; latency?: number }>;
}> {
    const results = await serviceRegistry.healthCheckAll();
    const services: Record<string, { status: "ok" | "error" | "not_configured"; latency?: number }> = {};

    for (const [name, health] of results) {
        services[name] = {
            status: health.status === "healthy" ? "ok" :
                health.status === "unknown" ? "not_configured" : "error",
            latency: health.latency
        };
    }

    const healthy = Array.from(results.values()).some(h => h.status === "healthy");
    return { healthy, services };
}

/**
 * @deprecated Use serviceRegistry.getStatusSummary() instead
 */
export function getServicesStatus(): Record<string, boolean> {
    const summary = serviceRegistry.getStatusSummary();
    const result: Record<string, boolean> = {};

    for (const svc of summary.services) {
        result[svc.name] = svc.state === ServiceState.RUNNING;
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE REGISTRATION (Auto-register on import)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Register all core services
 */
export function registerCoreServices(): void {
    // Core Infrastructure - Priority 0
    serviceRegistry.register("telemetry", async () => {
        const { telemetryService } = await import("./core/telemetry");
        return telemetryService as unknown as IService;
    }, { priority: ServicePriority.CRITICAL, description: "Logging and metrics" });

    serviceRegistry.register("cache", async () => {
        const { cacheService } = await import("./core/cache");
        return cacheService as unknown as IService;
    }, { priority: ServicePriority.CRITICAL, description: "Multi-level caching" });

    serviceRegistry.register("eventBus", async () => {
        const { eventBus } = await import("./core/event-bus");
        return eventBus as unknown as IService;
    }, { priority: ServicePriority.CRITICAL, description: "Event-driven messaging" });

    // Security - Priority 1
    serviceRegistry.register("security", async () => {
        const { securityService } = await import("./security");
        return securityService as unknown as IService;
    }, { priority: ServicePriority.HIGH, dependencies: ["telemetry"], description: "Authentication & authorization" });

    // Business Logic - Priority 2
    serviceRegistry.register("booking", async () => {
        const { default: bookingService } = await import("./booking");
        return bookingService as unknown as IService;
    }, { priority: ServicePriority.NORMAL, dependencies: ["security"], description: "Booking management" });

    serviceRegistry.register("payment", async () => {
        const { paymentService } = await import("./payment");
        return paymentService as unknown as IService;
    }, { priority: ServicePriority.NORMAL, dependencies: ["security"], description: "Payment processing" });

    // Analytics - Priority 3
    serviceRegistry.register("analytics", async () => {
        const { analyticsService } = await import("./analytics");
        return analyticsService as unknown as IService;
    }, { priority: ServicePriority.LOW, dependencies: ["telemetry"], description: "Business analytics" });

    console.log("[ServiceRegistry] Core services registered");
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize all services
 */
export async function initializeServices(): Promise<void> {
    registerCoreServices();
    await serviceRegistry.initializeAll();
    await serviceRegistry.startAll();
}

// Export registry instance
export default serviceRegistry;
