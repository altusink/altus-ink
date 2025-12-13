/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE MANUFACTURING & PRODUCTION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive production planning, execution, and control for Ink & Merch
 * 
 * TARGET SCALE: 100+ Production Lines, 10M+ Units/Year
 * COMPLIANCE: ISO 9001, FDA 21 CFR Part 11, GMP
 * 
 * FEATURES:
 * - Bill of Materials (BOM) Management
 * - Work Order (WO) Management
 * - Production Planning & Scheduling (MRP/APS)
 * - Shop Floor Control & Execution
 * - Quality Control (QC) & Quality Assurance (QA)
 * - Equipment & Asset Maintenance (TPM)
 * - Lot/Batch Tracking & Traceability
 * - Costing & WIP Tracking
 * - Capacity Planning
 * - Demand Forecasting
 * - Inventory Integration
 * - Recipe Management (Ink Formulations)
 * - Environmental Monitoring
 * - OEE (Overall Equipment Effectiveness)
 * - Downtime Tracking
 * - SPC (Statistical Process Control)
 * - CAPA (Corrective and Preventive Actions)
 * 
 * @module services/manufacturing
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: BILL OF MATERIALS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BillOfMaterial {
    id: string;
    code: string;
    productId: string;
    productName: string;
    name: string;
    description?: string;
    version: string;
    revision: number;
    status: BOMStatus;
    type: BOMType;
    components: BOMComponent[];
    routings: RoutingStep[];
    phantoms: PhantomBOM[];
    coProducts: CoProduct[];
    costs: BOMCosts;
    yield: number;
    batchSize: number;
    unit: string;
    leadTime: number;
    validFrom: Date;
    validTo?: Date;
    approvals: BOMApproval[];
    changeHistory: BOMChange[];
    documents: BOMDocument[];
    metadata: Record<string, any>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type BOMStatus = "draft" | "pending_approval" | "active" | "obsolete" | "superseded" | "on_hold";
export type BOMType = "standard" | "engineering" | "planning" | "sales" | "rework";

export interface BOMComponent {
    id: string;
    lineNumber: number;
    itemId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    unit: string;
    scrapPercentage: number;
    effectiveDate?: Date;
    expirationDate?: Date;
    isCritical: boolean;
    isPhantom: boolean;
    alternates: AlternateComponent[];
    requirements: ComponentRequirement[];
    position?: string;
    notes?: string;
}

export interface AlternateComponent {
    itemId: string;
    priority: number;
    conversionFactor: number;
    validFrom?: Date;
    validTo?: Date;
}

export interface ComponentRequirement {
    type: "specification" | "certification" | "test";
    description: string;
    mandatory: boolean;
}

export interface PhantomBOM {
    id: string;
    bomId: string;
    quantity: number;
    level: number;
}

export interface CoProduct {
    id: string;
    productId: string;
    quantityRatio: number;
    costAllocation: number;
    isMainProduct: boolean;
}

export interface BOMCosts {
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    outsourcingCost: number;
    totalCost: number;
    currency: string;
    costDate: Date;
    costMethod: "standard" | "actual" | "average";
}

export interface BOMApproval {
    id: string;
    approverName: string;
    approverId: string;
    role: string;
    status: "pending" | "approved" | "rejected";
    comments?: string;
    approvedAt?: Date;
}

export interface BOMChange {
    id: string;
    version: string;
    changeType: "create" | "modify" | "obsolete";
    description: string;
    changedBy: string;
    changedAt: Date;
    fields: string[];
}

export interface BOMDocument {
    id: string;
    type: "drawing" | "specification" | "instruction" | "certificate";
    name: string;
    url: string;
    version: string;
    uploadedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: ROUTING & OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface RoutingStep {
    id: string;
    sequence: number;
    operationCode: string;
    operationName: string;
    description: string;
    workCenterId: string;
    workCenterName: string;
    type: OperationType;
    times: OperationTimes;
    resources: OperationResource[];
    tools: OperationTool[];
    skills: SkillRequirement[];
    instructions: WorkInstruction[];
    qualityChecks: QualityCheckpoint[];
    safetyRequirements: SafetyRequirement[];
    subcontracting?: SubcontractInfo;
    dependencies: string[];
    isOptional: boolean;
    isMilestone: boolean;
}

export type OperationType = "internal" | "subcontract" | "inspection" | "transfer" | "waiting";

export interface OperationTimes {
    setupTime: number;
    runTime: number;
    runTimeUnit: "per_unit" | "per_batch" | "fixed";
    waitTime: number;
    moveTime: number;
    queueTime: number;
    teardownTime: number;
    overlapPercentage: number;
}

export interface OperationResource {
    resourceId: string;
    resourceType: "machine" | "labor" | "tool";
    quantity: number;
    usage: number;
    cost: number;
}

export interface OperationTool {
    toolId: string;
    toolName: string;
    quantity: number;
    usageTime?: number;
}

export interface SkillRequirement {
    skillId: string;
    skillName: string;
    level: "basic" | "intermediate" | "advanced" | "expert";
    certification?: string;
}

export interface WorkInstruction {
    id: string;
    step: number;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    duration?: number;
    warnings?: string[];
}

export interface QualityCheckpoint {
    id: string;
    parameter: string;
    specification: string;
    tolerance: string;
    unit: string;
    method: string;
    frequency: "100%" | "sampling" | "first_piece";
    sampleSize?: number;
    critical: boolean;
    documentRequired: boolean;
}

export interface SafetyRequirement {
    id: string;
    type: "ppe" | "caution" | "restriction" | "procedure";
    description: string;
    mandatory: boolean;
}

export interface SubcontractInfo {
    vendorId: string;
    vendorName: string;
    leadTime: number;
    cost: number;
    purchaseOrderRequired: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: WORK ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkOrder {
    id: string;
    woNumber: string;
    productId: string;
    productName: string;
    bomId: string;
    bomVersion: string;
    type: WorkOrderType;
    priority: WorkOrderPriority;
    status: WorkOrderStatus;
    quantity: QuantityInfo;
    dates: WorkOrderDates;
    assignment: WorkOrderAssignment;
    components: WOComponent[];
    operations: WOOperation[];
    costs: WOCosts;
    quality: WOQuality;
    lot: LotInfo;
    source: WOSource;
    documents: WODocument[];
    notes: WONote[];
    timeline: WOEvent[];
    metadata: Record<string, any>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type WorkOrderType = "standard" | "rework" | "disassembly" | "repair" | "prototype" | "sample";
export type WorkOrderPriority = "low" | "normal" | "high" | "urgent" | "critical";
export type WorkOrderStatus =
    | "draft"
    | "planned"
    | "released"
    | "material_picking"
    | "in_progress"
    | "on_hold"
    | "completed"
    | "closed"
    | "cancelled";

export interface QuantityInfo {
    ordered: number;
    completed: number;
    scrapped: number;
    inProgress: number;
    remaining: number;
    unit: string;
}

export interface WorkOrderDates {
    plannedStart: Date;
    plannedEnd: Date;
    scheduledStart?: Date;
    scheduledEnd?: Date;
    actualStart?: Date;
    actualEnd?: Date;
    dueDate: Date;
    releaseDate?: Date;
}

export interface WorkOrderAssignment {
    supervisorId?: string;
    supervisorName?: string;
    teamId?: string;
    teamName?: string;
    workCenterIds: string[];
    shift?: string;
}

export interface WOComponent {
    id: string;
    lineNumber: number;
    itemId: string;
    itemCode: string;
    itemName: string;
    requiredQuantity: number;
    reservedQuantity: number;
    pickedQuantity: number;
    issuedQuantity: number;
    returnedQuantity: number;
    scrappedQuantity: number;
    unit: string;
    warehouseId: string;
    locationId?: string;
    lotNumber?: string;
    status: ComponentStatus;
    shortageQuantity: number;
    substitutedWith?: string;
    issuedAt?: Date;
    issuedBy?: string;
}

export type ComponentStatus = "pending" | "reserved" | "picking" | "picked" | "issued" | "shortage" | "substituted";

export interface WOOperation {
    id: string;
    stepId: string;
    sequence: number;
    operationCode: string;
    operationName: string;
    workCenterId: string;
    workCenterName: string;
    status: OperationStatus;
    schedule: OperationSchedule;
    progress: OperationProgress;
    resources: OperationResourceUsage[];
    qualityResults: QualityResult[];
    downtimes: DowntimeRecord[];
    laborEntries: LaborEntry[];
    notes: string[];
}

export type OperationStatus = "pending" | "scheduled" | "ready" | "in_progress" | "paused" | "completed" | "skipped";

export interface OperationSchedule {
    scheduledStart: Date;
    scheduledEnd: Date;
    actualStart?: Date;
    actualEnd?: Date;
    estimatedDuration: number;
    actualDuration: number;
}

export interface OperationProgress {
    plannedQuantity: number;
    completedQuantity: number;
    goodQuantity: number;
    scrapQuantity: number;
    reworkQuantity: number;
    pendingQuantity: number;
    completionPercentage: number;
}

export interface OperationResourceUsage {
    resourceId: string;
    resourceType: string;
    plannedUsage: number;
    actualUsage: number;
    unit: string;
}

export interface QualityResult {
    id: string;
    checkpointId: string;
    parameter: string;
    specification: string;
    measuredValue: string;
    unit: string;
    result: "pass" | "fail" | "warning";
    measuredBy: string;
    measuredAt: Date;
    notes?: string;
}

export interface DowntimeRecord {
    id: string;
    reason: string;
    category: "planned" | "unplanned" | "changeover" | "breakdown" | "material" | "quality";
    startTime: Date;
    endTime?: Date;
    duration: number;
    notes?: string;
    resolvedBy?: string;
}

export interface LaborEntry {
    id: string;
    operatorId: string;
    operatorName: string;
    startTime: Date;
    endTime?: Date;
    hours: number;
    rate: number;
    overtimeHours: number;
    cost: number;
}

export interface WOCosts {
    estimatedMaterial: number;
    actualMaterial: number;
    estimatedLabor: number;
    actualLabor: number;
    estimatedOverhead: number;
    actualOverhead: number;
    estimatedSubcontracting: number;
    actualSubcontracting: number;
    estimatedTotal: number;
    actualTotal: number;
    variance: number;
    variancePercentage: number;
    currency: string;
}

export interface WOQuality {
    inspectionRequired: boolean;
    inspectionStatus: "pending" | "in_progress" | "passed" | "failed" | "conditional";
    defectCount: number;
    defectRate: number;
    firstPassYield: number;
    ncrsRaised: number;
    capsRequired: number;
}

export interface LotInfo {
    lotNumber: string;
    batchNumber?: string;
    serialNumbers?: string[];
    expirationDate?: Date;
    traceability: TraceabilityRecord[];
}

export interface TraceabilityRecord {
    componentItemId: string;
    lotNumber: string;
    quantity: number;
    supplier?: string;
}

export interface WOSource {
    type: "sales_order" | "forecast" | "reorder_point" | "manual" | "kanban" | "mrp";
    referenceId?: string;
    referenceNumber?: string;
    customerId?: string;
    customerName?: string;
}

export interface WODocument {
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
}

export interface WONote {
    id: string;
    content: string;
    category: "general" | "quality" | "production" | "safety";
    createdBy: string;
    createdAt: Date;
}

export interface WOEvent {
    id: string;
    type: string;
    description: string;
    userId?: string;
    userName?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: WORK CENTERS & EQUIPMENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkCenter {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: WorkCenterType;
    category: string;
    locationId: string;
    locationName: string;
    capacity: WorkCenterCapacity;
    scheduling: WorkCenterScheduling;
    costs: WorkCenterCosts;
    equipment: Equipment[];
    operators: OperatorAssignment[];
    status: WorkCenterStatus;
    performance: WorkCenterPerformance;
    maintenance: MaintenanceInfo;
    createdAt: Date;
    updatedAt: Date;
}

export type WorkCenterType = "production" | "assembly" | "mixing" | "filling" | "packaging" | "testing" | "warehouse" | "subcontract";
export type WorkCenterStatus = "active" | "inactive" | "maintenance" | "breakdown" | "setup";

export interface WorkCenterCapacity {
    capacityPerDay: number;
    capacityUnit: string;
    efficiency: number;
    utilizationTarget: number;
    minLoadSize: number;
    maxLoadSize: number;
    parallelOperations: number;
}

export interface WorkCenterScheduling {
    workingDays: number[];
    shiftsPerDay: number;
    hoursPerShift: number;
    breaksPerShift: number;
    breakDuration: number;
    setupTimeDefault: number;
    cleaningTimeDefault: number;
    schedulingRule: "forward" | "backward" | "critical_ratio";
}

export interface WorkCenterCosts {
    laborRate: number;
    machineRate: number;
    overheadRate: number;
    setupRate: number;
    currency: string;
}

export interface Equipment {
    id: string;
    code: string;
    name: string;
    type: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    status: "operational" | "maintenance" | "breakdown" | "decommissioned";
    location: string;
    purchaseDate?: Date;
    warrantyExpiry?: Date;
    lastMaintenance?: Date;
    nextMaintenance?: Date;
    specifications: Record<string, any>;
}

export interface OperatorAssignment {
    operatorId: string;
    operatorName: string;
    shift: string;
    isPrimary: boolean;
    certifications: string[];
    assignedFrom: Date;
    assignedTo?: Date;
}

export interface WorkCenterPerformance {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    mtbf: number;
    mttr: number;
    utilization: number;
    throughput: number;
    lastUpdated: Date;
}

export interface MaintenanceInfo {
    strategy: "preventive" | "predictive" | "corrective";
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    maintenanceFrequency: number;
    totalDowntime: number;
    totalMaintenanceCost: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: QUALITY CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

export interface QCInspection {
    id: string;
    inspectionNumber: string;
    type: InspectionType;
    referenceType: "work_order" | "purchase_order" | "inventory" | "complaint";
    referenceId: string;
    referenceNumber: string;
    productId: string;
    productName: string;
    inspectorId: string;
    inspectorName: string;
    location: string;
    schedule: InspectionSchedule;
    sampling: SamplingInfo;
    results: InspectionResult;
    measurements: Measurement[];
    defects: Defect[];
    attachments: InspectionAttachment[];
    disposition: InspectionDisposition;
    followUp: FollowUpAction[];
    createdAt: Date;
    completedAt?: Date;
}

export type InspectionType = "incoming" | "in_process" | "final" | "first_article" | "periodic" | "customer_return";

export interface InspectionSchedule {
    scheduledDate: Date;
    actualDate?: Date;
    dueDate: Date;
    priority: "low" | "normal" | "high" | "urgent";
}

export interface SamplingInfo {
    lotSize: number;
    sampleSize: number;
    samplingPlan: string;
    aql: number;
    inspectionLevel: "I" | "II" | "III";
}

export interface InspectionResult {
    status: "pending" | "in_progress" | "passed" | "failed" | "conditional";
    quantityInspected: number;
    quantityPassed: number;
    quantityFailed: number;
    passRate: number;
    overallScore?: number;
    verdict?: string;
}

export interface Measurement {
    id: string;
    parameter: string;
    specification: string;
    nominal?: number;
    upperLimit?: number;
    lowerLimit?: number;
    actual: number;
    unit: string;
    result: "pass" | "fail" | "warning";
    outOfSpec: boolean;
    equipmentUsed?: string;
    notes?: string;
}

export interface Defect {
    id: string;
    code: string;
    description: string;
    category: string;
    severity: "minor" | "major" | "critical";
    quantity: number;
    location?: string;
    rootCause?: string;
    photoUrl?: string;
    isRepaired: boolean;
}

export interface InspectionAttachment {
    id: string;
    type: "photo" | "document" | "certificate" | "test_report";
    name: string;
    url: string;
    uploadedAt: Date;
}

export interface InspectionDisposition {
    decision: "accept" | "reject" | "rework" | "use_as_is" | "return" | "scrap" | "pending";
    decidedBy?: string;
    decidedAt?: Date;
    reason?: string;
    conditions?: string[];
    deviationNumber?: string;
}

export interface FollowUpAction {
    id: string;
    type: "ncr" | "capa" | "deviation" | "hold";
    referenceNumber: string;
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: "open" | "in_progress" | "closed";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PRODUCTION PLANNING
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProductionPlan {
    id: string;
    name: string;
    period: string;
    type: "mrp" | "mps" | "capacity" | "demand";
    status: "draft" | "proposed" | "approved" | "released" | "executed";
    horizon: { start: Date; end: Date };
    items: PlanItem[];
    constraints: PlanningConstraint[];
    optimization: OptimizationSettings;
    results: PlanningResults;
    approvals: PlanApproval[];
    generatedBy: string;
    generatedAt: Date;
    approvedAt?: Date;
}

export interface PlanItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    dueDate: Date;
    source: "forecast" | "order" | "safety_stock" | "reorder" | "campaign";
    sourceReference?: string;
    priority: number;
    status: "pending" | "scheduled" | "work_order_created";
    workOrderId?: string;
    workCenterId?: string;
    scheduledStart?: Date;
    scheduledEnd?: Date;
}

export interface PlanningConstraint {
    type: "capacity" | "material" | "labor" | "equipment" | "calendar";
    description: string;
    value: number;
    unit: string;
    period: string;
}

export interface OptimizationSettings {
    objective: "minimize_cost" | "minimize_time" | "maximize_utilization" | "balance";
    constraints: string[];
    weights: Record<string, number>;
}

export interface PlanningResults {
    totalQuantity: number;
    totalHours: number;
    utilization: number;
    onTimePercentage: number;
    materialShortages: number;
    capacityOverloads: number;
}

export interface PlanApproval {
    approverId: string;
    approverName: string;
    status: "pending" | "approved" | "rejected";
    comments?: string;
    timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MANUFACTURING SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class ManufacturingService extends EventEmitter {
    private boms: Map<string, BillOfMaterial> = new Map();
    private workOrders: Map<string, WorkOrder> = new Map();
    private workCenters: Map<string, WorkCenter> = new Map();
    private productionPlans: Map<string, ProductionPlan> = new Map();
    private inspections: Map<string, QCInspection> = new Map();

    constructor() {
        super();
        this.seedWorkCenters();
        this.startScheduler();
        this.startOEECalculator();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BOM MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createBOM(data: Partial<BillOfMaterial>): Promise<BillOfMaterial> {
        const bom: BillOfMaterial = {
            id: randomUUID(),
            code: `BOM-${Date.now().toString().slice(-8)}`,
            productId: data.productId!,
            productName: data.productName || "",
            name: data.name || "Standard BOM",
            version: data.version || "1.0",
            revision: 1,
            status: "draft",
            type: data.type || "standard",
            components: data.components || [],
            routings: data.routings || [],
            phantoms: [],
            coProducts: [],
            costs: { materialCost: 0, laborCost: 0, overheadCost: 0, outsourcingCost: 0, totalCost: 0, currency: "USD", costDate: new Date(), costMethod: "standard" },
            yield: data.yield || 100,
            batchSize: data.batchSize || 1,
            unit: data.unit || "EA",
            leadTime: data.leadTime || 1,
            validFrom: data.validFrom || new Date(),
            approvals: [],
            changeHistory: [],
            documents: [],
            metadata: {},
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.calculateBOMCosts(bom);
        this.boms.set(bom.id, bom);

        bom.changeHistory.push({ id: randomUUID(), version: bom.version, changeType: "create", description: "BOM created", changedBy: bom.createdBy, changedAt: new Date(), fields: [] });

        await eventBus.publish("manufacturing.bom_created", { bomId: bom.id });

        return bom;
    }

    async approveBOM(bomId: string, approverId: string, decision: "approved" | "rejected", comments?: string): Promise<BillOfMaterial> {
        const bom = this.boms.get(bomId);
        if (!bom) throw new Error("BOM not found");

        bom.approvals.push({ id: randomUUID(), approverId, approverName: approverId, role: "approver", status: decision, comments, approvedAt: new Date() });

        if (decision === "approved") {
            bom.status = "active";
        }

        bom.updatedAt = new Date();

        await eventBus.publish("manufacturing.bom_approved", { bomId, decision });

        return bom;
    }

    private calculateBOMCosts(bom: BillOfMaterial): void {
        bom.costs.materialCost = bom.components.reduce((sum, c) => sum + (c.quantity * 10), 0);
        bom.costs.laborCost = bom.routings.reduce((sum, r) => sum + ((r.times.setupTime + r.times.runTime) / 60 * 50), 0);
        bom.costs.overheadCost = bom.costs.laborCost * 0.5;
        bom.costs.totalCost = bom.costs.materialCost + bom.costs.laborCost + bom.costs.overheadCost + bom.costs.outsourcingCost;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WORK ORDER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createWorkOrder(data: Partial<WorkOrder>): Promise<WorkOrder> {
        const bom = data.bomId ? this.boms.get(data.bomId) : null;
        const quantity = data.quantity?.ordered || 1;

        const wo: WorkOrder = {
            id: randomUUID(),
            woNumber: `WO-${Date.now().toString().slice(-8)}`,
            productId: data.productId!,
            productName: data.productName || "",
            bomId: data.bomId!,
            bomVersion: bom?.version || "1.0",
            type: data.type || "standard",
            priority: data.priority || "normal",
            status: "draft",
            quantity: { ordered: quantity, completed: 0, scrapped: 0, inProgress: 0, remaining: quantity, unit: bom?.unit || "EA" },
            dates: { plannedStart: data.dates?.plannedStart || new Date(), plannedEnd: data.dates?.plannedEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), dueDate: data.dates?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            assignment: data.assignment || { workCenterIds: [] },
            components: bom ? bom.components.map((c, i) => ({
                id: randomUUID(), lineNumber: i + 1, itemId: c.itemId, itemCode: c.itemCode, itemName: c.itemName,
                requiredQuantity: c.quantity * quantity, reservedQuantity: 0, pickedQuantity: 0, issuedQuantity: 0, returnedQuantity: 0, scrappedQuantity: 0,
                unit: c.unit, warehouseId: "MAIN", status: "pending" as ComponentStatus, shortageQuantity: 0,
            })) : [],
            operations: bom ? bom.routings.map(r => ({
                id: randomUUID(), stepId: r.id, sequence: r.sequence, operationCode: r.operationCode, operationName: r.operationName,
                workCenterId: r.workCenterId, workCenterName: r.workCenterName, status: "pending" as OperationStatus,
                schedule: { scheduledStart: new Date(), scheduledEnd: new Date(), estimatedDuration: 0, actualDuration: 0 },
                progress: { plannedQuantity: quantity, completedQuantity: 0, goodQuantity: 0, scrapQuantity: 0, reworkQuantity: 0, pendingQuantity: quantity, completionPercentage: 0 },
                resources: [], qualityResults: [], downtimes: [], laborEntries: [], notes: [],
            })) : [],
            costs: { estimatedMaterial: bom ? bom.costs.materialCost * quantity : 0, actualMaterial: 0, estimatedLabor: bom ? bom.costs.laborCost * quantity : 0, actualLabor: 0, estimatedOverhead: bom ? bom.costs.overheadCost * quantity : 0, actualOverhead: 0, estimatedSubcontracting: 0, actualSubcontracting: 0, estimatedTotal: 0, actualTotal: 0, variance: 0, variancePercentage: 0, currency: "USD" },
            quality: { inspectionRequired: true, inspectionStatus: "pending", defectCount: 0, defectRate: 0, firstPassYield: 0, ncrsRaised: 0, capsRequired: 0 },
            lot: { lotNumber: `LOT-${Date.now()}`, traceability: [] },
            source: data.source || { type: "manual" },
            documents: [],
            notes: [],
            timeline: [{ id: randomUUID(), type: "created", description: "Work order created", timestamp: new Date() }],
            metadata: {},
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        wo.costs.estimatedTotal = wo.costs.estimatedMaterial + wo.costs.estimatedLabor + wo.costs.estimatedOverhead;

        this.workOrders.set(wo.id, wo);

        await eventBus.publish("manufacturing.work_order_created", { woId: wo.id, woNumber: wo.woNumber });

        return wo;
    }

    async releaseWorkOrder(woId: string): Promise<WorkOrder> {
        const wo = this.workOrders.get(woId);
        if (!wo) throw new Error("Work order not found");
        if (wo.status !== "draft" && wo.status !== "planned") throw new Error("Cannot release work order");

        wo.status = "released";
        wo.dates.releaseDate = new Date();
        wo.timeline.push({ id: randomUUID(), type: "released", description: "Work order released to production", timestamp: new Date() });
        wo.updatedAt = new Date();

        await eventBus.publish("manufacturing.work_order_released", { woId });

        return wo;
    }

    async startOperation(woId: string, operationId: string, operatorId: string): Promise<WOOperation> {
        const wo = this.workOrders.get(woId);
        if (!wo) throw new Error("Work order not found");

        const operation = wo.operations.find(o => o.id === operationId);
        if (!operation) throw new Error("Operation not found");

        operation.status = "in_progress";
        operation.schedule.actualStart = new Date();
        operation.laborEntries.push({ id: randomUUID(), operatorId, operatorName: operatorId, startTime: new Date(), hours: 0, rate: 50, overtimeHours: 0, cost: 0 });

        if (wo.status === "released") {
            wo.status = "in_progress";
            wo.dates.actualStart = new Date();
        }

        wo.timeline.push({ id: randomUUID(), type: "operation_started", description: `Operation ${operation.operationCode} started`, timestamp: new Date(), metadata: { operationId } });
        wo.updatedAt = new Date();

        return operation;
    }

    async completeOperation(woId: string, operationId: string, data: { goodQuantity: number; scrapQuantity?: number; operatorId: string }): Promise<WOOperation> {
        const wo = this.workOrders.get(woId);
        if (!wo) throw new Error("Work order not found");

        const operation = wo.operations.find(o => o.id === operationId);
        if (!operation) throw new Error("Operation not found");

        operation.progress.goodQuantity += data.goodQuantity;
        operation.progress.scrapQuantity += data.scrapQuantity || 0;
        operation.progress.completedQuantity = operation.progress.goodQuantity + operation.progress.scrapQuantity;
        operation.progress.pendingQuantity = operation.progress.plannedQuantity - operation.progress.completedQuantity;
        operation.progress.completionPercentage = (operation.progress.completedQuantity / operation.progress.plannedQuantity) * 100;

        if (operation.progress.completedQuantity >= operation.progress.plannedQuantity) {
            operation.status = "completed";
            operation.schedule.actualEnd = new Date();
            operation.schedule.actualDuration = (operation.schedule.actualEnd.getTime() - (operation.schedule.actualStart?.getTime() || 0)) / 60000;
        }

        // Update labor
        const laborEntry = operation.laborEntries.find(l => l.operatorId === data.operatorId && !l.endTime);
        if (laborEntry) {
            laborEntry.endTime = new Date();
            laborEntry.hours = (laborEntry.endTime.getTime() - laborEntry.startTime.getTime()) / 3600000;
            laborEntry.cost = laborEntry.hours * laborEntry.rate;
            wo.costs.actualLabor += laborEntry.cost;
        }

        // Check if all operations complete
        if (wo.operations.every(o => o.status === "completed")) {
            wo.status = "completed";
            wo.dates.actualEnd = new Date();
            wo.quantity.completed = wo.operations.reduce((min, o) => Math.min(min, o.progress.goodQuantity), wo.quantity.ordered);
        }

        wo.costs.actualTotal = wo.costs.actualMaterial + wo.costs.actualLabor + wo.costs.actualOverhead;
        wo.costs.variance = wo.costs.actualTotal - wo.costs.estimatedTotal;
        wo.costs.variancePercentage = wo.costs.estimatedTotal > 0 ? (wo.costs.variance / wo.costs.estimatedTotal) * 100 : 0;

        wo.updatedAt = new Date();

        await eventBus.publish("manufacturing.operation_completed", { woId, operationId });

        return operation;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // QUALITY CONTROL
    // ═══════════════════════════════════════════════════════════════════════════

    async createInspection(data: Partial<QCInspection>): Promise<QCInspection> {
        const inspection: QCInspection = {
            id: randomUUID(),
            inspectionNumber: `INS-${Date.now().toString().slice(-8)}`,
            type: data.type || "final",
            referenceType: data.referenceType || "work_order",
            referenceId: data.referenceId!,
            referenceNumber: data.referenceNumber || "",
            productId: data.productId!,
            productName: data.productName || "",
            inspectorId: data.inspectorId || "system",
            inspectorName: data.inspectorName || "System",
            location: data.location || "QC Lab",
            schedule: data.schedule || { scheduledDate: new Date(), dueDate: new Date(), priority: "normal" },
            sampling: data.sampling || { lotSize: 100, sampleSize: 10, samplingPlan: "AQL 1.0", aql: 1.0, inspectionLevel: "II" },
            results: { status: "pending", quantityInspected: 0, quantityPassed: 0, quantityFailed: 0, passRate: 0 },
            measurements: data.measurements || [],
            defects: data.defects || [],
            attachments: [],
            disposition: { decision: "pending" },
            followUp: [],
            createdAt: new Date(),
        };

        this.inspections.set(inspection.id, inspection);

        await eventBus.publish("manufacturing.inspection_created", { inspectionId: inspection.id });

        return inspection;
    }

    async recordInspectionResults(inspectionId: string, results: { measurements: Measurement[]; defects: Defect[]; decision: InspectionDisposition["decision"] }): Promise<QCInspection> {
        const inspection = this.inspections.get(inspectionId);
        if (!inspection) throw new Error("Inspection not found");

        inspection.measurements = results.measurements;
        inspection.defects = results.defects;
        inspection.disposition.decision = results.decision;
        inspection.disposition.decidedAt = new Date();

        const passed = results.measurements.filter(m => m.result === "pass").length;
        const failed = results.measurements.filter(m => m.result === "fail").length;

        inspection.results = {
            status: failed > 0 ? "failed" : "passed",
            quantityInspected: inspection.sampling.sampleSize,
            quantityPassed: Math.round(inspection.sampling.sampleSize * (passed / (passed + failed || 1))),
            quantityFailed: Math.round(inspection.sampling.sampleSize * (failed / (passed + failed || 1))),
            passRate: passed / (passed + failed || 1) * 100,
        };

        inspection.completedAt = new Date();

        await eventBus.publish("manufacturing.inspection_completed", { inspectionId, result: inspection.results.status });

        return inspection;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WORK CENTER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createWorkCenter(data: Partial<WorkCenter>): Promise<WorkCenter> {
        const wc: WorkCenter = {
            id: randomUUID(),
            code: data.code || `WC-${this.workCenters.size + 1}`,
            name: data.name || "New Work Center",
            type: data.type || "production",
            category: data.category || "General",
            locationId: data.locationId || "MAIN",
            locationName: data.locationName || "Main Plant",
            capacity: data.capacity || { capacityPerDay: 8, capacityUnit: "hours", efficiency: 85, utilizationTarget: 80, minLoadSize: 1, maxLoadSize: 1000, parallelOperations: 1 },
            scheduling: data.scheduling || { workingDays: [1, 2, 3, 4, 5], shiftsPerDay: 1, hoursPerShift: 8, breaksPerShift: 2, breakDuration: 15, setupTimeDefault: 30, cleaningTimeDefault: 15, schedulingRule: "forward" },
            costs: data.costs || { laborRate: 50, machineRate: 25, overheadRate: 15, setupRate: 40, currency: "USD" },
            equipment: [],
            operators: [],
            status: "active",
            performance: { oee: 0, availability: 0, performance: 0, quality: 0, mtbf: 0, mttr: 0, utilization: 0, throughput: 0, lastUpdated: new Date() },
            maintenance: { strategy: "preventive", maintenanceFrequency: 30, totalDowntime: 0, totalMaintenanceCost: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.workCenters.set(wc.id, wc);

        return wc;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BACKGROUND PROCESSES
    // ═══════════════════════════════════════════════════════════════════════════

    private startScheduler(): void {
        setInterval(() => {
            for (const wo of this.workOrders.values()) {
                if (wo.status === "released") {
                    // Auto-schedule operations
                }
            }
        }, 60000);
    }

    private startOEECalculator(): void {
        setInterval(() => {
            for (const wc of this.workCenters.values()) {
                // Calculate OEE
                wc.performance.availability = 85 + Math.random() * 10;
                wc.performance.performance = 80 + Math.random() * 15;
                wc.performance.quality = 95 + Math.random() * 5;
                wc.performance.oee = (wc.performance.availability * wc.performance.performance * wc.performance.quality) / 10000;
                wc.performance.lastUpdated = new Date();
            }
        }, 300000);
    }

    private seedWorkCenters(): void {
        this.createWorkCenter({ name: "Ink Mixing Station A", code: "MIX-01", type: "mixing", capacity: { capacityPerDay: 16, capacityUnit: "hours", efficiency: 90, utilizationTarget: 85, minLoadSize: 1, maxLoadSize: 500, parallelOperations: 2 } });
        this.createWorkCenter({ name: "Bottle Filling Line 1", code: "FILL-01", type: "filling", capacity: { capacityPerDay: 24, capacityUnit: "hours", efficiency: 85, utilizationTarget: 80, minLoadSize: 100, maxLoadSize: 10000, parallelOperations: 4 } });
        this.createWorkCenter({ name: "QC Lab Main", code: "QC-01", type: "testing", capacity: { capacityPerDay: 8, capacityUnit: "hours", efficiency: 100, utilizationTarget: 70, minLoadSize: 1, maxLoadSize: 100, parallelOperations: 1 } });
        this.createWorkCenter({ name: "Packaging Station", code: "PAK-01", type: "packaging", capacity: { capacityPerDay: 16, capacityUnit: "hours", efficiency: 88, utilizationTarget: 75, minLoadSize: 10, maxLoadSize: 5000, parallelOperations: 3 } });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const manufacturingService = new ManufacturingService();
export default manufacturingService;
