/**
 * ALTUS INK - ENTERPRISE MANUFACTURING & PRODUCTION SERVICE
 * Comprehensive production planning, execution, and control for Ink & Merch
 * 
 * Features:
 * - Bill of Materials (BOM) management
 * - Work Order (WO) management
 * - Production planning & scheduling
 * - Shop floor control
 * - Quality Control (QC) & QA
 * - Equipment maintenance
 * - Lot/Batch tracking
 * - Costing & WIP tracking
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BillOfMaterial {
    id: string;
    productId: string;
    name: string;
    version: string;
    status: "active" | "draft" | "obsolete" | "pending_approval";
    components: BOMComponent[];
    routings: RoutingStep[];
    laborCosts: number;
    materialCosts: number;
    overheadCosts: number;
    totalCost: number;
    yield: number; // Percentage
    validFrom: Date;
    validTo?: Date;
    approvedBy?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface BOMComponent {
    itemId: string; // From Inventory
    quantity: number;
    unit: string;
    scrappage: number; // Percent waste
    isCritical: boolean;
    alternates: string[];
}

export interface RoutingStep {
    id: string;
    sequence: number;
    workCenterId: string;
    operation: string;
    description: string;
    setupTime: number; // Minutes
    runTime: number; // Minutes per unit
    waitQueueTime: number; // Minutes
    machineOrLabor: "machine" | "labor";
    resourcesRequired: number;
    skillsRequired: string[];
    instructions: string; // or URL
}

// =============================================================================
// WORK ORDERS
// =============================================================================

export interface WorkOrder {
    id: string;
    woNumber: string;
    productId: string;
    bomId: string;
    quantity: number;
    priority: "low" | "medium" | "high" | "critical";
    status: "planned" | "released" | "in_progress" | "completed" | "closed" | "cancelled" | "hold";
    startDate: Date;
    dueDate: Date;
    actualStartDate?: Date;
    actualCompletionDate?: Date;
    completedQuantity: number;
    scrappedQuantity: number;
    assignedTo?: string; // Production Manager
    lotNumber?: string;
    batchNumber?: string;
    components: WOComponent[];
    operations: WOOperation[];
    costs: WOCosts;
    customerId?: string; // If MTO
    salesOrderId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WOComponent {
    itemId: string;
    requiredQuantity: number;
    reservedQuantity: number;
    issuedQuantity: number;
    status: "pending" | "partial" | "issued";
}

export interface WOOperation {
    stepId: string;
    sequence: number;
    workCenterId: string;
    status: "pending" | "in_progress" | "completed";
    scheduledStart: Date;
    scheduledEnd: Date;
    actualStart?: Date;
    actualEnd?: Date;
    completedQuantity: number;
    rejectedQuantity: number;
    laborHours: number;
    machineHours: number;
    operatorId?: string;
}

export interface WOCosts {
    estimatedMaterial: number;
    actualMaterial: number;
    estimatedLabor: number;
    actualLabor: number;
    estimatedOverhead: number;
    actualOverhead: number;
    totalActual: number;
    variance: number;
}

// =============================================================================
// PRODUCTION PLANNING
// =============================================================================

export interface ProductionPlan {
    id: string;
    period: string; // YYYY-MM
    items: PlanItem[];
    status: "draft" | "firmed" | "published";
    generatedAt: Date;
}

export interface PlanItem {
    productId: string;
    quantity: number;
    dueDate: Date;
    source: "forecast" | "order" | "safety_stock";
}

export interface WorkCenter {
    id: string;
    code: string;
    name: string;
    type: "assembly" | "mixing" | "packaging" | "testing";
    locationId: string;
    capacityPerDay: number; // Hours
    efficiency: number; // Percentage
    hourlyRate: number;
    status: "active" | "maintenance" | "down";
    schedule: WorkCenterSchedule[];
}

export interface WorkCenterSchedule {
    date: Date;
    woOperationId: string;
    hoursChange: number;
}

// =============================================================================
// QUALITY CONTROL
// =============================================================================

export interface QCInspection {
    id: string;
    type: "incoming" | "in_process" | "final" | "first_article";
    referenceId: string; // PO Recipt or WO Operation or WO
    productId: string;
    inspectorId: string;
    date: Date;
    quantityInspected: number;
    quantityPassed: number;
    quantityFailed: number;
    status: "pass" | "fail" | "conditional";
    measurements: Measurement[];
    defects: Defect[];
    disposition: "release" | "rework" | "scrap" | "return";
    notes?: string;
    photos: string[];
}

export interface Measurement {
    parameter: string;
    specification: string; // e.g. "10.0 +/- 0.1"
    actual: number;
    unit: string;
    pass: boolean;
}

export interface Defect {
    code: string;
    description: string;
    severity: "minor" | "major" | "critical";
    quantity: number;
    location?: string;
}

// =============================================================================
// MANUFACTURING SERVICE
// =============================================================================

export class ManufacturingService {
    private boms: Map<string, BillOfMaterial> = new Map();
    private workOrders: Map<string, WorkOrder> = new Map();
    private workCenters: Map<string, WorkCenter> = new Map();
    private productionPlans: Map<string, ProductionPlan> = new Map();
    private inspections: Map<string, QCInspection> = new Map();

    constructor() {
        this.seedWorkCenters();
    }

    // ===========================================================================
    // BOM MANAGEMENT
    // ===========================================================================

    async createBOM(data: Partial<BillOfMaterial>): Promise<BillOfMaterial> {
        const bom: BillOfMaterial = {
            id: randomUUID(),
            productId: data.productId!,
            name: data.name || "Standard BOM",
            version: data.version || "1.0",
            status: data.status || "draft",
            components: data.components || [],
            routings: data.routings || [],
            laborCosts: 0, // Should be calculated
            materialCosts: 0,
            overheadCosts: 0,
            totalCost: 0,
            yield: data.yield || 100,
            validFrom: data.validFrom || new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.calculateBOMCosts(bom);
        this.boms.set(bom.id, bom);
        return bom;
    }

    async getBOM(id: string): Promise<BillOfMaterial | null> {
        return this.boms.get(id) || null;
    }

    private calculateBOMCosts(bom: BillOfMaterial) {
        // Logic to sum up component costs and routing labor/overhead
        // Simulated:
        bom.materialCosts = bom.components.reduce((sum, c) => sum + (c.quantity * 10), 0); // Assuming $10 per unit cost
        bom.laborCosts = bom.routings.reduce((sum, r) => sum + ((r.setupTime + r.runTime) / 60 * 50), 0); // Assuming $50/hr
        bom.overheadCosts = bom.laborCosts * 0.5; // 50% overhead
        bom.totalCost = bom.materialCosts + bom.laborCosts + bom.overheadCosts;
    }

    // ===========================================================================
    // WORK ORDER MANAGEMENT
    // ===========================================================================

    async createWorkOrder(data: Partial<WorkOrder>): Promise<WorkOrder> {
        const bom = data.bomId ? this.boms.get(data.bomId) : null;

        const wo: WorkOrder = {
            id: randomUUID(),
            woNumber: `WO-${Date.now().toString().slice(-6)}`,
            productId: data.productId!,
            bomId: data.bomId!,
            quantity: data.quantity || 1,
            priority: data.priority || "medium",
            status: "planned",
            startDate: data.startDate || new Date(),
            dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            completedQuantity: 0,
            scrappedQuantity: 0,
            components: bom ? bom.components.map(c => ({
                itemId: c.itemId,
                requiredQuantity: c.quantity * (data.quantity || 1),
                reservedQuantity: 0,
                issuedQuantity: 0,
                status: "pending"
            })) : [],
            operations: bom ? bom.routings.map(r => ({
                stepId: r.id,
                sequence: r.sequence,
                workCenterId: r.workCenterId,
                status: "pending",
                scheduledStart: new Date(), // Scheduling logic needed
                scheduledEnd: new Date(),
                completedQuantity: 0,
                rejectedQuantity: 0,
                laborHours: 0,
                machineHours: 0
            })) : [],
            costs: {
                estimatedMaterial: bom ? bom.materialCosts * (data.quantity || 1) : 0,
                actualMaterial: 0,
                estimatedLabor: bom ? bom.laborCosts * (data.quantity || 1) : 0,
                actualLabor: 0,
                estimatedOverhead: bom ? bom.overheadCosts * (data.quantity || 1) : 0,
                actualOverhead: 0,
                totalActual: 0,
                variance: 0
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.workOrders.set(wo.id, wo);
        return wo;
    }

    async releaseWorkOrder(id: string): Promise<WorkOrder | null> {
        const wo = this.workOrders.get(id);
        if (!wo) return null;

        if (wo.status === "planned") {
            // Check stock availability logic here
            wo.status = "released";
            // Reserve inventory logic here
            wo.updatedAt = new Date();
        }

        return wo;
    }

    async reportOperation(woId: string, stepId: string, data: {
        quantity: number;
        laborHours: number;
        machineHours: number;
        scrapped?: number;
        operatorId: string;
    }): Promise<WorkOrder | null> {
        const wo = this.workOrders.get(woId);
        if (!wo) return null;

        const op = wo.operations.find(o => o.stepId === stepId);
        if (!op) return null;

        op.completedQuantity += data.quantity;
        op.rejectedQuantity += (data.scrapped || 0);
        op.laborHours += data.laborHours;
        op.machineHours += data.machineHours;
        op.operatorId = data.operatorId;

        if (op.completedQuantity >= wo.quantity) {
            op.status = "completed";
            op.actualEnd = new Date();
        } else {
            op.status = "in_progress";
            if (!op.actualStart) op.actualStart = new Date();
        }

        // Update costs (Simulated)
        wo.costs.actualLabor += data.laborHours * 50; // $50/hr
        wo.costs.totalActual = wo.costs.actualMaterial + wo.costs.actualLabor + wo.costs.actualOverhead;

        // Check if all ops completed
        if (wo.operations.every(o => o.status === "completed")) {
            wo.status = "completed";
            wo.actualCompletionDate = new Date();
        } else {
            wo.status = "in_progress";
            if (!wo.actualStartDate) wo.actualStartDate = new Date();
        }

        wo.updatedAt = new Date();
        return wo;
    }

    // ===========================================================================
    // WORK CENTER MANAGEMENT
    // ===========================================================================

    async createWorkCenter(data: Partial<WorkCenter>): Promise<WorkCenter> {
        const wc: WorkCenter = {
            id: randomUUID(),
            code: data.code || `WC-${String(this.workCenters.size + 1)}`,
            name: data.name || "New Work Center",
            type: data.type || "assembly",
            locationId: data.locationId || "MAIN",
            capacityPerDay: data.capacityPerDay || 8,
            efficiency: data.efficiency || 100,
            hourlyRate: data.hourlyRate || 50,
            status: "active",
            schedule: [],
            ...data
        };

        this.workCenters.set(wc.id, wc);
        return wc;
    }

    // ===========================================================================
    // QUALITY CONTROL
    // ===========================================================================

    async createInspection(data: Partial<QCInspection>): Promise<QCInspection> {
        const inspection: QCInspection = {
            id: randomUUID(),
            type: data.type || "final",
            referenceId: data.referenceId!,
            productId: data.productId!,
            inspectorId: data.inspectorId || "system",
            date: new Date(),
            quantityInspected: data.quantityInspected || 0,
            quantityPassed: data.quantityPassed || 0,
            quantityFailed: data.quantityFailed || 0,
            status: data.status || "pass",
            measurements: data.measurements || [],
            defects: data.defects || [],
            disposition: data.disposition || "release",
            photos: [],
            ...data
        };

        this.inspections.set(inspection.id, inspection);
        return inspection;
    }

    private seedWorkCenters() {
        this.createWorkCenter({ name: "Ink Mixing Station A", code: "MIX-01", type: "mixing", capacityPerDay: 16 });
        this.createWorkCenter({ name: "Bottle Filling Line 1", code: "FILL-01", type: "assembly", capacityPerDay: 24 });
        this.createWorkCenter({ name: "QC Lab Main", code: "QC-01", type: "testing", capacityPerDay: 8 });
        this.createWorkCenter({ name: "Packing Station", code: "PAK-01", type: "packaging", capacityPerDay: 16 });
    }
}

export const manufacturingService = new ManufacturingService();
export default manufacturingService;
