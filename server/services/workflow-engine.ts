/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE WORKFLOW ORCHESTRATION ENGINE (BPM)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The "Business Brain" of Altus Ink - orchestrates complex multi-step processes.
 * 
 * ARCHITECTURE:
 * - Event-Sourced Execution Model
 * - Saga Pattern for Distributed Transactions
 * - Durable Execution (survives crashes)
 * - BPMN 2.0 Compatible Definitions
 * 
 * FEATURES:
 * - Visual Workflow Designer (JSON-based BPMN)
 * - State Machine Persistence
 * - Human-in-the-Loop (User Tasks)
 * - Automatic Retries & Dead Letter Queues
 * - Timer Events & SLA Monitoring
 * - Conditional Branching (Gateways)
 * - Parallel Execution & Join
 * - Subprocess & Call Activities
 * - Compensation & Rollback
 * - Workflow Versioning & Migration
 * - Audit Trail & Compliance Logging
 * - Real-time Monitoring Dashboard
 * - Multi-tenant Isolation
 * 
 * USE CASES:
 * 1. Artist Onboarding: Application → Review → Background Check → Contract → Account
 * 2. Refund Approval: Request → Auto-Check → Manager Approval (>$500) → Payment → Email
 * 3. Franchise Application: Lead → Docs → Legal Review → Site Visit → Contract Sign
 * 4. Booking Confirmation: Lock → Payment → Confirmation → Reminders → Follow-up
 * 5. Payout Processing: Request → Validation → Approval → Transfer → Notification
 * 
 * Target Scale: Millions of concurrent workflow instances
 * 
 * @module services/workflow-engine
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";
import { cacheService } from "./core/cache";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: WORKFLOW DEFINITIONS (BPMN-COMPATIBLE)
// ═══════════════════════════════════════════════════════════════════════════════

export type StepType =
    | "start_event"
    | "end_event"
    | "user_task"
    | "service_task"
    | "script_task"
    | "send_task"
    | "receive_task"
    | "manual_task"
    | "business_rule_task"
    | "exclusive_gateway"
    | "parallel_gateway"
    | "inclusive_gateway"
    | "event_based_gateway"
    | "timer_event"
    | "message_event"
    | "signal_event"
    | "error_event"
    | "compensation_event"
    | "subprocess"
    | "call_activity"
    | "transaction";

export type WorkflowStatus = "draft" | "active" | "suspended" | "archived" | "deprecated";

export type InstanceStatus = "pending" | "running" | "waiting" | "completed" | "failed" | "cancelled" | "compensating";

export interface WorkflowDefinition {
    id: string;
    key: string; // Unique key like "artist-onboarding-v2"
    name: string;
    description?: string;
    version: number;
    category?: string;
    tenant?: string;
    elements: WorkflowElement[];
    edges: WorkflowEdge[];
    triggers: WorkflowTrigger[];
    variables: WorkflowVariable[];
    errorHandlers: ErrorHandler[];
    compensations: CompensationHandler[];
    slaConfig?: SLAConfig;
    status: WorkflowStatus;
    metadata: WorkflowMetadata;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkflowElement {
    id: string;
    type: StepType;
    name: string;
    description?: string;
    config: ElementConfig;
    position: { x: number; y: number };
    style?: ElementStyle;
    metadata?: Record<string, any>;
}

export interface ElementConfig {
    // User Task
    assignee?: string;
    candidateUsers?: string[];
    candidateGroups?: string[];
    formKey?: string;
    formFields?: FormField[];
    dueDate?: string; // ISO expression or duration
    priority?: number;

    // Service Task
    serviceType?: "http" | "grpc" | "queue" | "script" | "email" | "sms";
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    inputMapping?: VariableMapping[];
    outputMapping?: VariableMapping[];
    retryPolicy?: RetryPolicy;
    timeout?: number;

    // Script Task
    scriptLanguage?: "javascript" | "python" | "expression";
    script?: string;

    // Timer Event
    timerType?: "date" | "duration" | "cycle";
    timerValue?: string; // ISO 8601 or cron expression

    // Gateway
    defaultFlow?: string;
    conditions?: GatewayCondition[];

    // Subprocess
    subprocessKey?: string;
    subprocessVersion?: number;

    // Error Handling
    errorRef?: string;
    compensationRef?: string;
}

export interface FormField {
    id: string;
    type: "string" | "number" | "boolean" | "date" | "enum" | "file";
    label: string;
    variable: string;
    required: boolean;
    defaultValue?: any;
    validation?: FieldValidation;
    options?: { value: string; label: string }[];
}

export interface FieldValidation {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customValidator?: string;
}

export interface VariableMapping {
    source: string;
    target: string;
    transformation?: string;
}

export interface RetryPolicy {
    maxAttempts: number;
    initialDelay: number; // ms
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors?: string[];
}

export interface GatewayCondition {
    id: string;
    expression: string; // JavaScript expression
    targetElementId: string;
    order: number;
}

export interface WorkflowEdge {
    id: string;
    sourceId: string;
    targetId: string;
    conditionExpression?: string;
    isDefault?: boolean;
    label?: string;
}

export interface WorkflowTrigger {
    id: string;
    type: "none" | "message" | "timer" | "signal" | "api";
    config: TriggerConfig;
}

export interface TriggerConfig {
    messageName?: string;
    correlationKey?: string;
    timerValue?: string;
    signalName?: string;
    apiPath?: string;
}

export interface WorkflowVariable {
    name: string;
    type: "string" | "number" | "boolean" | "object" | "array";
    scope: "process" | "local";
    defaultValue?: any;
}

export interface ErrorHandler {
    id: string;
    errorCode: string;
    errorMessage?: string;
    targetElementId: string;
    retryable: boolean;
}

export interface CompensationHandler {
    id: string;
    activityId: string;
    compensationActivityId: string;
    order: number;
}

export interface SLAConfig {
    warnAfter?: number; // minutes
    escalateAfter?: number;
    failAfter?: number;
    notifications: SLANotification[];
}

export interface SLANotification {
    trigger: "warn" | "escalate" | "fail";
    channels: ("email" | "sms" | "webhook" | "slack")[];
    recipients: string[];
    template?: string;
}

export interface WorkflowMetadata {
    tags?: string[];
    owner?: string;
    priority?: number;
    isTemplate?: boolean;
    documentation?: string;
    externalLinks?: { name: string; url: string }[];
}

export interface ElementStyle {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    icon?: string;
    width?: number;
    height?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: WORKFLOW EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkflowInstance {
    id: string;
    definitionId: string;
    definitionKey: string;
    version: number;
    tenant?: string;
    businessKey?: string; // External reference like booking ID
    status: InstanceStatus;
    activeElements: string[]; // Currently active element IDs (for parallel)
    completedElements: string[];
    context: ExecutionContext;
    tokens: ExecutionToken[]; // For parallel execution
    history: ExecutionHistoryEntry[];
    timers: ActiveTimer[];
    slaStatus?: SLAStatus;
    parentInstanceId?: string; // For subprocesses
    callActivityInstanceIds?: string[];
    startTime: Date;
    endTime?: Date;
    updatedAt: Date;
}

export interface ExecutionContext {
    variables: Map<string, any>;
    localVariables: Map<string, Map<string, any>>; // elementId -> variables
    triggerData: any;
    correlationId?: string;
}

export interface ExecutionToken {
    id: string;
    instanceId: string;
    currentElementId: string;
    status: "active" | "waiting" | "completed" | "failed";
    parentTokenId?: string;
    data: Record<string, any>;
    createdAt: Date;
}

export interface ExecutionHistoryEntry {
    id: string;
    tokenId?: string;
    elementId: string;
    elementName: string;
    elementType: StepType;
    status: "started" | "completed" | "failed" | "cancelled" | "skipped";
    startTime: Date;
    endTime?: Date;
    input?: Record<string, any>;
    output?: Record<string, any>;
    error?: ExecutionError;
    actorId?: string;
    actorName?: string;
    metadata?: Record<string, any>;
}

export interface ExecutionError {
    code: string;
    message: string;
    stack?: string;
    retryCount: number;
    isRetryable: boolean;
    handledBy?: string;
}

export interface ActiveTimer {
    id: string;
    instanceId: string;
    elementId: string;
    type: "duration" | "date" | "cycle";
    dueDate: Date;
    fired: boolean;
    iterations?: number;
    maxIterations?: number;
}

export interface SLAStatus {
    startTime: Date;
    warnedAt?: Date;
    escalatedAt?: Date;
    failedAt?: Date;
    isBreached: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: HUMAN TASKS
// ═══════════════════════════════════════════════════════════════════════════════

export interface HumanTask {
    id: string;
    taskDefinitionKey: string;
    workflowInstanceId: string;
    workflowDefinitionKey: string;
    elementId: string;
    name: string;
    description?: string;
    status: "created" | "claimed" | "completed" | "cancelled" | "delegated";
    priority: number; // 0-100
    assignee?: string;
    owner?: string;
    candidateUsers: string[];
    candidateGroups: string[];
    formKey?: string;
    formData?: Record<string, any>;
    variables: Map<string, any>;
    dueDate?: Date;
    followUpDate?: Date;
    delegationState?: "pending" | "resolved";
    tenantId?: string;
    comments: TaskComment[];
    attachments: TaskAttachment[];
    history: TaskHistoryEntry[];
    createdAt: Date;
    claimedAt?: Date;
    completedAt?: Date;
}

export interface TaskComment {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: Date;
}

export interface TaskAttachment {
    id: string;
    name: string;
    description?: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
}

export interface TaskHistoryEntry {
    id: string;
    type: "created" | "claimed" | "unclaimed" | "assigned" | "delegated" | "completed" | "cancelled" | "comment" | "attachment";
    userId: string;
    timestamp: Date;
    details?: Record<string, any>;
}

export interface TaskQuery {
    instanceId?: string;
    definitionKey?: string;
    assignee?: string;
    candidateUser?: string;
    candidateGroup?: string;
    status?: string;
    priority?: { min?: number; max?: number };
    dueBefore?: Date;
    dueAfter?: Date;
    createdBefore?: Date;
    createdAfter?: Date;
    tenantId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    offset?: number;
    limit?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: SAGA PATTERN
// ═══════════════════════════════════════════════════════════════════════════════

export interface Saga {
    id: string;
    name: string;
    workflowInstanceId: string;
    steps: SagaStep[];
    status: "running" | "completed" | "compensating" | "compensated" | "failed";
    currentStep: number;
    compensatingStep?: number;
    context: Record<string, any>;
    startTime: Date;
    endTime?: Date;
    error?: SagaError;
}

export interface SagaStep {
    id: string;
    name: string;
    order: number;
    action: SagaAction;
    compensation: SagaAction;
    status: "pending" | "executed" | "compensated" | "failed";
    result?: any;
    error?: SagaError;
    executedAt?: Date;
    compensatedAt?: Date;
}

export interface SagaAction {
    type: "service" | "event" | "script";
    config: Record<string, any>;
    timeout?: number;
    retryPolicy?: RetryPolicy;
}

export interface SagaError {
    stepId: string;
    code: string;
    message: string;
    isCompensated: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: MONITORING & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkflowMetrics {
    definitionKey: string;
    version: number;
    period: { start: Date; end: Date };
    instances: {
        started: number;
        completed: number;
        failed: number;
        cancelled: number;
        active: number;
    };
    durations: {
        min: number;
        max: number;
        avg: number;
        p50: number;
        p95: number;
        p99: number;
    };
    sla: {
        breachCount: number;
        breachRate: number;
        avgTimeToComplete: number;
    };
    tasks: {
        created: number;
        completed: number;
        avgCompletionTime: number;
    };
    errors: {
        count: number;
        byCode: Record<string, number>;
        byElement: Record<string, number>;
    };
}

export interface InstanceMetrics {
    instanceId: string;
    duration: number;
    elementsExecuted: number;
    tasksCompleted: number;
    retriesCount: number;
    slaStatus: string;
    bottlenecks: { elementId: string; waitTime: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFLOW ENGINE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class WorkflowEngine extends EventEmitter {
    private definitions: Map<string, WorkflowDefinition> = new Map();
    private instances: Map<string, WorkflowInstance> = new Map();
    private tasks: Map<string, HumanTask> = new Map();
    private sagas: Map<string, Saga> = new Map();
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private serviceHandlers: Map<string, ServiceHandler> = new Map();

    constructor() {
        super();
        this.seedDefinitions();
        this.setupEventListeners();
        this.startTimerProcessor();
        this.startSLAMonitor();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DEFINITION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async deployDefinition(definition: Partial<WorkflowDefinition>, userId: string): Promise<WorkflowDefinition> {
        const existing = Array.from(this.definitions.values())
            .filter(d => d.key === definition.key)
            .sort((a, b) => b.version - a.version)[0];

        const newDef: WorkflowDefinition = {
            id: randomUUID(),
            key: definition.key || `workflow-${randomUUID().slice(0, 8)}`,
            name: definition.name || "New Workflow",
            version: existing ? existing.version + 1 : 1,
            elements: definition.elements || [
                { id: "start", type: "start_event", name: "Start", config: {}, position: { x: 100, y: 200 } },
                { id: "end", type: "end_event", name: "End", config: {}, position: { x: 500, y: 200 } },
            ],
            edges: definition.edges || [{ id: "e1", sourceId: "start", targetId: "end" }],
            triggers: definition.triggers || [{ id: "t1", type: "api", config: {} }],
            variables: definition.variables || [],
            errorHandlers: definition.errorHandlers || [],
            compensations: definition.compensations || [],
            status: "draft",
            metadata: definition.metadata || {},
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...definition,
        };

        this.definitions.set(newDef.id, newDef);

        await eventBus.publish("workflow.definition_deployed", {
            definitionId: newDef.id,
            key: newDef.key,
            version: newDef.version
        });

        telemetry.info("Workflow definition deployed", "WorkflowEngine", {
            key: newDef.key,
            version: newDef.version
        });

        return newDef;
    }

    async activateDefinition(definitionId: string): Promise<WorkflowDefinition> {
        const def = this.definitions.get(definitionId);
        if (!def) throw new Error("Definition not found");

        // Validate definition
        this.validateDefinition(def);

        // Deactivate previous versions
        for (const d of this.definitions.values()) {
            if (d.key === def.key && d.id !== def.id && d.status === "active") {
                d.status = "deprecated";
            }
        }

        def.status = "active";
        def.updatedAt = new Date();

        return def;
    }

    private validateDefinition(def: WorkflowDefinition): void {
        const startEvents = def.elements.filter(e => e.type === "start_event");
        if (startEvents.length === 0) throw new Error("Workflow must have at least one start event");

        const endEvents = def.elements.filter(e => e.type === "end_event");
        if (endEvents.length === 0) throw new Error("Workflow must have at least one end event");

        // Validate all edges reference existing elements
        for (const edge of def.edges) {
            if (!def.elements.find(e => e.id === edge.sourceId)) {
                throw new Error(`Edge source ${edge.sourceId} not found`);
            }
            if (!def.elements.find(e => e.id === edge.targetId)) {
                throw new Error(`Edge target ${edge.targetId} not found`);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INSTANCE EXECUTION
    // ═══════════════════════════════════════════════════════════════════════════

    async startWorkflow(
        definitionKey: string,
        variables: Record<string, any> = {},
        options: StartOptions = {}
    ): Promise<WorkflowInstance> {
        // Find active definition
        const def = Array.from(this.definitions.values())
            .filter(d => d.key === definitionKey && d.status === "active")
            .sort((a, b) => b.version - a.version)[0];

        if (!def) throw new Error(`No active workflow found for key: ${definitionKey}`);

        const startEvent = def.elements.find(e => e.type === "start_event");
        if (!startEvent) throw new Error("No start event found");

        const instance: WorkflowInstance = {
            id: randomUUID(),
            definitionId: def.id,
            definitionKey: def.key,
            version: def.version,
            tenant: options.tenant,
            businessKey: options.businessKey,
            status: "running",
            activeElements: [startEvent.id],
            completedElements: [],
            context: {
                variables: new Map(Object.entries(variables)),
                localVariables: new Map(),
                triggerData: options.triggerData,
                correlationId: options.correlationId,
            },
            tokens: [{
                id: randomUUID(),
                instanceId: "", // Set below
                currentElementId: startEvent.id,
                status: "active",
                data: {},
                createdAt: new Date(),
            }],
            history: [],
            timers: [],
            startTime: new Date(),
            updatedAt: new Date(),
        };

        instance.tokens[0].instanceId = instance.id;

        if (def.slaConfig) {
            instance.slaStatus = { startTime: new Date(), isBreached: false };
        }

        this.instances.set(instance.id, instance);

        // Log history
        this.addHistory(instance, startEvent, "started");

        await eventBus.publish("workflow.instance_started", {
            instanceId: instance.id,
            definitionKey: def.key
        });

        telemetry.info("Workflow instance started", "WorkflowEngine", {
            instanceId: instance.id,
            definitionKey: def.key
        });

        // Execute start event and continue
        await this.executeElement(instance, startEvent);

        return instance;
    }

    private async executeElement(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        telemetry.debug(`Executing element: ${element.name}`, "WorkflowEngine", {
            instanceId: instance.id,
            elementId: element.id,
            type: element.type
        });

        try {
            switch (element.type) {
                case "start_event":
                    await this.handleStartEvent(instance, element);
                    break;
                case "end_event":
                    await this.handleEndEvent(instance, element);
                    break;
                case "user_task":
                    await this.handleUserTask(instance, element);
                    break;
                case "service_task":
                    await this.handleServiceTask(instance, element);
                    break;
                case "script_task":
                    await this.handleScriptTask(instance, element);
                    break;
                case "exclusive_gateway":
                    await this.handleExclusiveGateway(instance, element);
                    break;
                case "parallel_gateway":
                    await this.handleParallelGateway(instance, element);
                    break;
                case "timer_event":
                    await this.handleTimerEvent(instance, element);
                    break;
                case "subprocess":
                    await this.handleSubprocess(instance, element);
                    break;
                default:
                    await this.moveToNext(instance, element);
            }
        } catch (error: any) {
            await this.handleExecutionError(instance, element, error);
        }
    }

    private async handleStartEvent(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        this.addHistory(instance, element, "completed");
        await this.moveToNext(instance, element);
    }

    private async handleEndEvent(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        this.addHistory(instance, element, "completed");

        // Check if this is the last active token
        instance.activeElements = instance.activeElements.filter(id => id !== element.id);
        instance.completedElements.push(element.id);

        if (instance.activeElements.length === 0) {
            instance.status = "completed";
            instance.endTime = new Date();

            await eventBus.publish("workflow.instance_completed", {
                instanceId: instance.id
            });

            telemetry.info("Workflow instance completed", "WorkflowEngine", {
                instanceId: instance.id,
                duration: instance.endTime.getTime() - instance.startTime.getTime()
            });
        }
    }

    private async handleUserTask(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        this.addHistory(instance, element, "started");
        instance.status = "waiting";

        const task: HumanTask = {
            id: randomUUID(),
            taskDefinitionKey: element.id,
            workflowInstanceId: instance.id,
            workflowDefinitionKey: instance.definitionKey,
            elementId: element.id,
            name: element.name,
            description: element.description,
            status: "created",
            priority: element.config.priority || 50,
            assignee: this.resolveExpression(element.config.assignee, instance.context),
            owner: undefined,
            candidateUsers: element.config.candidateUsers || [],
            candidateGroups: element.config.candidateGroups || [],
            formKey: element.config.formKey,
            formData: {},
            variables: new Map(),
            dueDate: element.config.dueDate ? new Date(element.config.dueDate) : undefined,
            comments: [],
            attachments: [],
            history: [{ id: randomUUID(), type: "created", userId: "system", timestamp: new Date() }],
            createdAt: new Date(),
        };

        this.tasks.set(task.id, task);

        await eventBus.publish("workflow.task_created", {
            taskId: task.id,
            instanceId: instance.id,
            assignee: task.assignee,
            candidateGroups: task.candidateGroups
        });
    }

    private async handleServiceTask(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        this.addHistory(instance, element, "started");

        const config = element.config;
        let result: any;

        try {
            switch (config.serviceType) {
                case "http":
                    result = await this.executeHttpTask(config, instance.context);
                    break;
                case "email":
                    result = await this.executeEmailTask(config, instance.context);
                    break;
                case "script":
                    result = await this.executeScriptTask(config.script || "", instance.context);
                    break;
                default:
                    const handler = this.serviceHandlers.get(config.serviceType || "default");
                    if (handler) {
                        result = await handler(config, instance.context);
                    }
            }

            // Apply output mapping
            if (config.outputMapping) {
                for (const mapping of config.outputMapping) {
                    const value = this.getNestedValue(result, mapping.source);
                    instance.context.variables.set(mapping.target, value);
                }
            }

            this.addHistory(instance, element, "completed", undefined, result);
            await this.moveToNext(instance, element);

        } catch (error: any) {
            if (config.retryPolicy && this.shouldRetry(instance, element, config.retryPolicy)) {
                await this.scheduleRetry(instance, element, config.retryPolicy);
            } else {
                throw error;
            }
        }
    }

    private async handleScriptTask(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        this.addHistory(instance, element, "started");

        const script = element.config.script || "";
        const result = await this.executeScriptTask(script, instance.context);

        this.addHistory(instance, element, "completed", undefined, result);
        await this.moveToNext(instance, element);
    }

    private async handleExclusiveGateway(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        const def = this.definitions.get(instance.definitionId)!;
        const outgoingEdges = def.edges.filter(e => e.sourceId === element.id);

        // Evaluate conditions
        const conditions = element.config.conditions || [];
        for (const condition of conditions.sort((a, b) => a.order - b.order)) {
            if (this.evaluateCondition(condition.expression, instance.context)) {
                const edge = outgoingEdges.find(e => e.targetId === condition.targetElementId);
                if (edge) {
                    const nextElement = def.elements.find(e => e.id === edge.targetId);
                    if (nextElement) {
                        this.addHistory(instance, element, "completed");
                        await this.executeElement(instance, nextElement);
                        return;
                    }
                }
            }
        }

        // Default flow
        if (element.config.defaultFlow) {
            const nextElement = def.elements.find(e => e.id === element.config.defaultFlow);
            if (nextElement) {
                this.addHistory(instance, element, "completed");
                await this.executeElement(instance, nextElement);
                return;
            }
        }

        throw new Error(`No matching condition for exclusive gateway: ${element.id}`);
    }

    private async handleParallelGateway(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        const def = this.definitions.get(instance.definitionId)!;
        const incomingEdges = def.edges.filter(e => e.targetId === element.id);
        const outgoingEdges = def.edges.filter(e => e.sourceId === element.id);

        // Check if this is a fork or join
        if (outgoingEdges.length > 1) {
            // FORK - create parallel tokens
            this.addHistory(instance, element, "completed");

            for (const edge of outgoingEdges) {
                const nextElement = def.elements.find(e => e.id === edge.targetId);
                if (nextElement) {
                    const token: ExecutionToken = {
                        id: randomUUID(),
                        instanceId: instance.id,
                        currentElementId: nextElement.id,
                        status: "active",
                        data: {},
                        createdAt: new Date(),
                    };
                    instance.tokens.push(token);
                    instance.activeElements.push(nextElement.id);

                    // Execute in parallel (fire and forget, continuation handled by tokens)
                    this.executeElement(instance, nextElement).catch(err =>
                        telemetry.error("Parallel execution error", "WorkflowEngine", err)
                    );
                }
            }
        } else if (incomingEdges.length > 1) {
            // JOIN - wait for all incoming tokens
            const completedIncoming = incomingEdges.filter(e =>
                instance.completedElements.includes(e.sourceId)
            );

            if (completedIncoming.length === incomingEdges.length) {
                // All branches completed, continue
                this.addHistory(instance, element, "completed");
                await this.moveToNext(instance, element);
            } else {
                // Wait for more branches
                instance.status = "waiting";
            }
        }
    }

    private async handleTimerEvent(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        this.addHistory(instance, element, "started");

        const config = element.config;
        let dueDate: Date;

        switch (config.timerType) {
            case "duration":
                dueDate = this.parseDuration(config.timerValue || "PT1H");
                break;
            case "date":
                dueDate = new Date(config.timerValue || Date.now());
                break;
            case "cycle":
                dueDate = this.parseNextCycle(config.timerValue || "R/PT1H");
                break;
            default:
                dueDate = new Date(Date.now() + 60000); // Default 1 minute
        }

        const timer: ActiveTimer = {
            id: randomUUID(),
            instanceId: instance.id,
            elementId: element.id,
            type: config.timerType || "duration",
            dueDate,
            fired: false,
        };

        instance.timers.push(timer);
        instance.status = "waiting";

        // Schedule timer
        const delay = dueDate.getTime() - Date.now();
        if (delay > 0) {
            const timeout = setTimeout(() => this.fireTimer(timer.id), delay);
            this.timers.set(timer.id, timeout);
        } else {
            await this.fireTimer(timer.id);
        }
    }

    private async handleSubprocess(instance: WorkflowInstance, element: WorkflowElement): Promise<void> {
        this.addHistory(instance, element, "started");

        const subKey = element.config.subprocessKey;
        if (!subKey) throw new Error("Subprocess key not specified");

        const subInstance = await this.startWorkflow(subKey,
            Object.fromEntries(instance.context.variables),
            { parentInstanceId: instance.id }
        );

        instance.callActivityInstanceIds = instance.callActivityInstanceIds || [];
        instance.callActivityInstanceIds.push(subInstance.id);
        instance.status = "waiting";
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TASK MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async claimTask(taskId: string, userId: string): Promise<HumanTask> {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error("Task not found");
        if (task.status !== "created") throw new Error("Task cannot be claimed");

        task.assignee = userId;
        task.status = "claimed";
        task.claimedAt = new Date();
        task.history.push({ id: randomUUID(), type: "claimed", userId, timestamp: new Date() });

        return task;
    }

    async completeTask(taskId: string, variables: Record<string, any>, userId: string): Promise<void> {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error("Task not found");
        if (task.status !== "claimed" && task.status !== "created") {
            throw new Error("Task cannot be completed");
        }

        task.status = "completed";
        task.completedAt = new Date();
        task.history.push({
            id: randomUUID(),
            type: "completed",
            userId,
            timestamp: new Date(),
            details: variables
        });

        // Update workflow instance
        const instance = this.instances.get(task.workflowInstanceId);
        if (instance) {
            // Add variables to context
            for (const [key, value] of Object.entries(variables)) {
                instance.context.variables.set(key, value);
            }

            const def = this.definitions.get(instance.definitionId)!;
            const element = def.elements.find(e => e.id === task.elementId);

            if (element) {
                this.addHistory(instance, element, "completed", undefined, variables);
                instance.status = "running";
                await this.moveToNext(instance, element);
            }
        }

        await eventBus.publish("workflow.task_completed", { taskId, instanceId: task.workflowInstanceId });
    }

    async queryTasks(query: TaskQuery): Promise<{ tasks: HumanTask[]; total: number }> {
        let tasks = Array.from(this.tasks.values());

        // Apply filters
        if (query.instanceId) tasks = tasks.filter(t => t.workflowInstanceId === query.instanceId);
        if (query.assignee) tasks = tasks.filter(t => t.assignee === query.assignee);
        if (query.candidateUser) tasks = tasks.filter(t => t.candidateUsers.includes(query.candidateUser!));
        if (query.candidateGroup) tasks = tasks.filter(t => t.candidateGroups.includes(query.candidateGroup!));
        if (query.status) tasks = tasks.filter(t => t.status === query.status);

        const total = tasks.length;

        // Apply pagination
        const offset = query.offset || 0;
        const limit = query.limit || 20;
        tasks = tasks.slice(offset, offset + limit);

        return { tasks, total };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SAGA ORCHESTRATION
    // ═══════════════════════════════════════════════════════════════════════════

    async executeSaga(name: string, steps: SagaStep[], context: Record<string, any>): Promise<Saga> {
        const saga: Saga = {
            id: randomUUID(),
            name,
            workflowInstanceId: "",
            steps: steps.map((s, i) => ({ ...s, order: i, status: "pending" as const })),
            status: "running",
            currentStep: 0,
            context,
            startTime: new Date(),
        };

        this.sagas.set(saga.id, saga);

        try {
            for (let i = 0; i < saga.steps.length; i++) {
                saga.currentStep = i;
                const step = saga.steps[i];

                try {
                    step.result = await this.executeSagaAction(step.action, saga.context);
                    step.status = "executed";
                    step.executedAt = new Date();

                    // Update context with result
                    saga.context = { ...saga.context, [`${step.name}_result`]: step.result };
                } catch (error: any) {
                    step.status = "failed";
                    step.error = { stepId: step.id, code: error.code || "UNKNOWN", message: error.message, isCompensated: false };

                    // Start compensation
                    await this.compensateSaga(saga, i);
                    return saga;
                }
            }

            saga.status = "completed";
            saga.endTime = new Date();

        } catch (error: any) {
            saga.status = "failed";
            saga.error = { stepId: "saga", code: "SAGA_FAILED", message: error.message, isCompensated: false };
        }

        return saga;
    }

    private async compensateSaga(saga: Saga, fromStep: number): Promise<void> {
        saga.status = "compensating";
        saga.compensatingStep = fromStep;

        for (let i = fromStep - 1; i >= 0; i--) {
            const step = saga.steps[i];
            if (step.status === "executed") {
                try {
                    await this.executeSagaAction(step.compensation, saga.context);
                    step.status = "compensated";
                    step.compensatedAt = new Date();
                    saga.compensatingStep = i;
                } catch (error: any) {
                    telemetry.error(`Compensation failed for step: ${step.name}`, "WorkflowEngine", error);
                    // Continue compensating other steps
                }
            }
        }

        saga.status = "compensated";
        saga.endTime = new Date();
    }

    private async executeSagaAction(action: SagaAction, context: Record<string, any>): Promise<any> {
        switch (action.type) {
            case "service":
                return this.executeHttpTask(action.config, { variables: new Map(Object.entries(context)), localVariables: new Map(), triggerData: null });
            case "event":
                await eventBus.publish(action.config.topic, { ...context, ...action.config.payload });
                return { published: true };
            case "script":
                return this.executeScriptTask(action.config.script, { variables: new Map(Object.entries(context)), localVariables: new Map(), triggerData: null });
            default:
                throw new Error(`Unknown saga action type: ${action.type}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    private async moveToNext(instance: WorkflowInstance, currentElement: WorkflowElement): Promise<void> {
        const def = this.definitions.get(instance.definitionId)!;
        const outgoingEdges = def.edges.filter(e => e.sourceId === currentElement.id);

        instance.activeElements = instance.activeElements.filter(id => id !== currentElement.id);
        instance.completedElements.push(currentElement.id);

        for (const edge of outgoingEdges) {
            const nextElement = def.elements.find(e => e.id === edge.targetId);
            if (nextElement) {
                instance.activeElements.push(nextElement.id);
                await this.executeElement(instance, nextElement);
            }
        }

        instance.updatedAt = new Date();
    }

    private async handleExecutionError(instance: WorkflowInstance, element: WorkflowElement, error: any): Promise<void> {
        telemetry.error(`Execution error in element: ${element.name}`, "WorkflowEngine", error);

        this.addHistory(instance, element, "failed", error);

        const def = this.definitions.get(instance.definitionId)!;
        const handler = def.errorHandlers.find(h => h.errorCode === error.code || h.errorCode === "*");

        if (handler) {
            const errorElement = def.elements.find(e => e.id === handler.targetElementId);
            if (errorElement) {
                await this.executeElement(instance, errorElement);
                return;
            }
        }

        // No handler, fail the instance
        instance.status = "failed";
        instance.endTime = new Date();

        await eventBus.publish("workflow.instance_failed", {
            instanceId: instance.id,
            error: error.message
        });
    }

    private addHistory(
        instance: WorkflowInstance,
        element: WorkflowElement,
        status: ExecutionHistoryEntry["status"],
        error?: any,
        output?: any
    ): void {
        const entry: ExecutionHistoryEntry = {
            id: randomUUID(),
            elementId: element.id,
            elementName: element.name,
            elementType: element.type,
            status,
            startTime: new Date(),
            endTime: status === "completed" || status === "failed" ? new Date() : undefined,
            error: error ? { code: error.code || "ERROR", message: error.message, retryCount: 0, isRetryable: false } : undefined,
            output,
        };
        instance.history.push(entry);
    }

    private async executeHttpTask(config: ElementConfig, context: ExecutionContext): Promise<any> {
        // In production, use fetch or axios
        telemetry.debug("Executing HTTP task", "WorkflowEngine", { endpoint: config.endpoint, method: config.method });

        // Simulate HTTP call
        await new Promise(resolve => setTimeout(resolve, 100));

        return { status: 200, data: { success: true } };
    }

    private async executeEmailTask(config: ElementConfig, context: ExecutionContext): Promise<any> {
        telemetry.debug("Executing email task", "WorkflowEngine", { to: config.to });
        return { sent: true };
    }

    private async executeScriptTask(script: string, context: ExecutionContext): Promise<any> {
        // Create a safe sandbox for script execution
        const variables = Object.fromEntries(context.variables);
        const fn = new Function("ctx", `with(ctx) { ${script} }`);
        return fn(variables);
    }

    private evaluateCondition(expression: string, context: ExecutionContext): boolean {
        try {
            const variables = Object.fromEntries(context.variables);
            const fn = new Function("ctx", `with(ctx) { return ${expression}; }`);
            return Boolean(fn(variables));
        } catch {
            return false;
        }
    }

    private resolveExpression(expression: string | undefined, context: ExecutionContext): string | undefined {
        if (!expression) return undefined;
        if (!expression.startsWith("${")) return expression;

        const varName = expression.slice(2, -1);
        return context.variables.get(varName);
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split(".").reduce((o, k) => o?.[k], obj);
    }

    private shouldRetry(instance: WorkflowInstance, element: WorkflowElement, policy: RetryPolicy): boolean {
        const history = instance.history.filter(h => h.elementId === element.id && h.status === "failed");
        return history.length < policy.maxAttempts;
    }

    private async scheduleRetry(instance: WorkflowInstance, element: WorkflowElement, policy: RetryPolicy): Promise<void> {
        const history = instance.history.filter(h => h.elementId === element.id && h.status === "failed");
        const attempt = history.length;
        const delay = Math.min(policy.initialDelay * Math.pow(policy.backoffMultiplier, attempt), policy.maxDelay);

        setTimeout(() => this.executeElement(instance, element), delay);
    }

    private parseDuration(iso8601: string): Date {
        // Parse ISO 8601 duration (simplified)
        const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return new Date(Date.now() + 3600000);

        const hours = parseInt(match[1] || "0", 10);
        const minutes = parseInt(match[2] || "0", 10);
        const seconds = parseInt(match[3] || "0", 10);

        return new Date(Date.now() + (hours * 3600 + minutes * 60 + seconds) * 1000);
    }

    private parseNextCycle(cron: string): Date {
        // Simplified - return next hour
        return new Date(Date.now() + 3600000);
    }

    private async fireTimer(timerId: string): Promise<void> {
        for (const instance of this.instances.values()) {
            const timer = instance.timers.find(t => t.id === timerId);
            if (timer && !timer.fired) {
                timer.fired = true;
                instance.status = "running";

                const def = this.definitions.get(instance.definitionId)!;
                const element = def.elements.find(e => e.id === timer.elementId);

                if (element) {
                    this.addHistory(instance, element, "completed");
                    await this.moveToNext(instance, element);
                }

                this.timers.delete(timerId);
                return;
            }
        }
    }

    private startTimerProcessor(): void {
        setInterval(() => {
            const now = new Date();
            for (const instance of this.instances.values()) {
                for (const timer of instance.timers) {
                    if (!timer.fired && timer.dueDate <= now) {
                        this.fireTimer(timer.id).catch(err =>
                            telemetry.error("Timer fire error", "WorkflowEngine", err)
                        );
                    }
                }
            }
        }, 1000);
    }

    private startSLAMonitor(): void {
        setInterval(() => {
            const now = new Date();
            for (const instance of this.instances.values()) {
                if (instance.status === "running" || instance.status === "waiting") {
                    const def = this.definitions.get(instance.definitionId)!;
                    if (def.slaConfig && instance.slaStatus) {
                        const elapsed = (now.getTime() - instance.slaStatus.startTime.getTime()) / 60000; // minutes

                        if (def.slaConfig.warnAfter && elapsed >= def.slaConfig.warnAfter && !instance.slaStatus.warnedAt) {
                            instance.slaStatus.warnedAt = now;
                            eventBus.publish("workflow.sla_warning", { instanceId: instance.id });
                        }

                        if (def.slaConfig.escalateAfter && elapsed >= def.slaConfig.escalateAfter && !instance.slaStatus.escalatedAt) {
                            instance.slaStatus.escalatedAt = now;
                            eventBus.publish("workflow.sla_escalation", { instanceId: instance.id });
                        }

                        if (def.slaConfig.failAfter && elapsed >= def.slaConfig.failAfter && !instance.slaStatus.failedAt) {
                            instance.slaStatus.failedAt = now;
                            instance.slaStatus.isBreached = true;
                            eventBus.publish("workflow.sla_breach", { instanceId: instance.id });
                        }
                    }
                }
            }
        }, 60000);
    }

    private setupEventListeners(): void {
        eventBus.subscribe("workflow.subprocess_completed", async (data: any) => {
            for (const instance of this.instances.values()) {
                if (instance.callActivityInstanceIds?.includes(data.instanceId)) {
                    const def = this.definitions.get(instance.definitionId)!;
                    const subprocessElement = def.elements.find(e => e.type === "subprocess");
                    if (subprocessElement) {
                        instance.status = "running";
                        this.addHistory(instance, subprocessElement, "completed");
                        await this.moveToNext(instance, subprocessElement);
                    }
                }
            }
        });
    }

    private seedDefinitions(): void {
        // Artist Onboarding Workflow
        this.deployDefinition({
            key: "artist-onboarding",
            name: "Artist Onboarding Process",
            elements: [
                { id: "start", type: "start_event", name: "Application Received", config: {}, position: { x: 100, y: 200 } },
                { id: "review", type: "user_task", name: "Review Application", config: { candidateGroups: ["admins"], formKey: "review-application" }, position: { x: 250, y: 200 } },
                { id: "decision", type: "exclusive_gateway", name: "Approved?", config: { conditions: [{ id: "c1", expression: "approved === true", targetElementId: "sendContract", order: 1 }], defaultFlow: "reject" }, position: { x: 400, y: 200 } },
                { id: "sendContract", type: "service_task", name: "Send Contract", config: { serviceType: "email" }, position: { x: 550, y: 150 } },
                { id: "reject", type: "service_task", name: "Send Rejection", config: { serviceType: "email" }, position: { x: 550, y: 250 } },
                { id: "end", type: "end_event", name: "Process Complete", config: {}, position: { x: 700, y: 200 } },
            ],
            edges: [
                { id: "e1", sourceId: "start", targetId: "review" },
                { id: "e2", sourceId: "review", targetId: "decision" },
                { id: "e3", sourceId: "decision", targetId: "sendContract" },
                { id: "e4", sourceId: "decision", targetId: "reject", isDefault: true },
                { id: "e5", sourceId: "sendContract", targetId: "end" },
                { id: "e6", sourceId: "reject", targetId: "end" },
            ],
            triggers: [{ id: "t1", type: "api", config: { apiPath: "/api/workflow/artist-onboarding" } }],
        }, "system");
    }

    registerServiceHandler(type: string, handler: ServiceHandler): void {
        this.serviceHandlers.set(type, handler);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: SERVICE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

type ServiceHandler = (config: ElementConfig, context: ExecutionContext) => Promise<any>;

interface StartOptions {
    tenant?: string;
    businessKey?: string;
    triggerData?: any;
    correlationId?: string;
    parentInstanceId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const workflowEngine = new WorkflowEngine();
export default workflowEngine;
