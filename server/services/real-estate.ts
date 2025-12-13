/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE REAL ESTATE & FACILITIES MANAGEMENT SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive property, lease, and facility management
 * 
 * TARGET SCALE: 500+ Properties, 1000+ Leases
 * COMPLIANCE: FASB ASC 842, IFRS 16, SOC 2
 * 
 * FEATURES:
 * - Property Portfolio Management
 * - Lease Administration & Accounting
 * - Space Management & Utilization
 * - Facility Maintenance (CMMS)
 * - Asset Lifecycle Management
 * - Energy & Sustainability Tracking
 * - Capital Project Management
 * - Vendor & Contractor Access Control
 * - Occupancy & Space Planning
 * - Move Management
 * - Visitor Management
 * - Building Automation Integration
 * - Emergency Response Planning
 * 
 * @module services/real-estate
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Property {
    id: string;
    code: string;
    name: string;
    type: PropertyType;
    subtype?: string;
    status: PropertyStatus;
    classification: PropertyClassification;
    address: Address;
    details: PropertyDetails;
    financial: PropertyFinancials;
    specs: PropertySpecs;
    ownership: OwnershipInfo;
    portfolio: PortfolioInfo;
    management: ManagementInfo;
    contacts: PropertyContact[];
    amenities: Amenity[];
    certifications: BuildingCertification[];
    documents: PropertyDocument[];
    images: PropertyImage[];
    leases: string[];
    maintenanceRequests: string[];
    assets: string[];
    incidents: string[];
    compliance: ComplianceInfo;
    sustainability: SustainabilityInfo;
    metadata: Record<string, any>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type PropertyType = "store" | "studio" | "warehouse" | "office" | "residential" | "mixed_use" | "land" | "industrial" | "retail" | "hospitality";
export type PropertyStatus = "active" | "vacant" | "under_construction" | "renovation" | "closing" | "sold" | "leased" | "inactive";
export type PropertyClassification = "A" | "B" | "C" | "unclassified";

export interface Address {
    street: string;
    street2?: string;
    unit?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    countryCode: string;
    coordinates: { lat: number; lng: number };
    timezone: string;
    region?: string;
    district?: string;
}

export interface PropertyDetails {
    yearBuilt: number;
    yearRenovated?: number;
    architect?: string;
    constructionType: string;
    structureType: string;
    description: string;
    zoning: string;
    zoningDescription?: string;
    parcelNumber?: string;
    apn?: string;
    titleStatus?: string;
    certificateOfOccupancy: boolean;
    accessibilityCompliant: boolean;
    historicDesignation?: boolean;
}

export interface PropertySpecs {
    totalArea: AreaMeasurement;
    usableArea: AreaMeasurement;
    leasableArea: AreaMeasurement;
    commonArea: AreaMeasurement;
    floors: number;
    belowGradeFloors: number;
    parkingSpaces: number;
    parkingType: "surface" | "garage" | "underground" | "mixed";
    occupancyCapacity: number;
    loadingDocks: number;
    elevators: number;
    clearHeight?: AreaMeasurement;
    ceilingHeight?: AreaMeasurement;
    columnSpacing?: string;
    hvacType: string;
    fireProtection: string;
    securityFeatures: string[];
}

export interface AreaMeasurement {
    value: number;
    unit: "sqft" | "sqm";
}

export interface PropertyFinancials {
    acquisitionCost?: number;
    acquisitionDate?: Date;
    marketValue: number;
    bookValue: number;
    lastAppraisalDate?: Date;
    lastAppraisalValue?: number;
    assessedValue: number;
    assessmentYear?: number;
    currency: string;
    annualTax: number;
    annualInsurance: number;
    annualOpex: number;
    annualRevenue: number;
    netOperatingIncome: number;
    capRate: number;
    pricePerSqFt: number;
    depreciationMethod?: string;
    depreciationLife?: number;
    accumulatedDepreciation: number;
}

export interface OwnershipInfo {
    type: "owned" | "leased" | "managed" | "franchise" | "joint_venture";
    ownerEntity?: string;
    ownershipPercentage: number;
    holdingCompany?: string;
    legalEntity?: string;
    taxId?: string;
}

export interface PortfolioInfo {
    portfolioId?: string;
    portfolioName?: string;
    regionId?: string;
    regionName?: string;
    divisionId?: string;
    divisionName?: string;
}

export interface ManagementInfo {
    managerId: string;
    managerName: string;
    managementCompany?: string;
    propertyManagerContact?: string;
    leasingAgent?: string;
    maintenanceVendorId?: string;
    securityVendorId?: string;
}

export interface PropertyContact {
    id: string;
    role: "manager" | "security" | "maintenance" | "emergency" | "leasing" | "accounting";
    name: string;
    title?: string;
    phone: string;
    email: string;
    isPrimary: boolean;
    availability?: string;
}

export interface Amenity {
    id: string;
    name: string;
    category: string;
    description?: string;
    available: boolean;
    fee?: number;
}

export interface BuildingCertification {
    id: string;
    type: "leed" | "energy_star" | "breeam" | "well" | "fitwel" | "other";
    level?: string;
    certificationNumber?: string;
    issuedDate: Date;
    expiryDate?: Date;
    status: "active" | "pending" | "expired";
}

export interface PropertyDocument {
    id: string;
    type: DocumentType;
    title: string;
    description?: string;
    url: string;
    fileSize?: number;
    mimeType?: string;
    version: string;
    expiryDate?: Date;
    isConfidential: boolean;
    uploadedBy: string;
    uploadedAt: Date;
}

export type DocumentType = "deed" | "title" | "survey" | "blueprint" | "floorplan" | "insurance" | "permit" | "certificate" | "contract" | "report" | "manual" | "photo" | "other";

export interface PropertyImage {
    id: string;
    url: string;
    thumbnailUrl?: string;
    caption: string;
    category: "exterior" | "interior" | "aerial" | "floor" | "amenity";
    isPrimary: boolean;
    order: number;
    uploadedAt: Date;
}

export interface ComplianceInfo {
    adaCompliant: boolean;
    fireCodeCompliant: boolean;
    lastInspectionDate?: Date;
    nextInspectionDate?: Date;
    inspectionStatus: "passed" | "failed" | "pending" | "scheduled";
    violations: Violation[];
    permits: Permit[];
}

export interface Violation {
    id: string;
    code: string;
    description: string;
    severity: "minor" | "major" | "critical";
    issuedDate: Date;
    dueDate: Date;
    resolvedDate?: Date;
    status: "open" | "in_progress" | "resolved" | "appealed";
    fineAmount?: number;
}

export interface Permit {
    id: string;
    type: string;
    number: string;
    description: string;
    issuedDate: Date;
    expiryDate: Date;
    status: "active" | "expired" | "pending" | "revoked";
}

export interface SustainabilityInfo {
    energyRating?: number;
    energyStarScore?: number;
    annualEnergyConsumption: number;
    energyUnit: "kWh" | "therms" | "mmbtu";
    annualWaterConsumption: number;
    waterUnit: "gallons" | "liters";
    annualCarbonEmissions: number;
    carbonUnit: "tons" | "kg";
    wasteRecyclingRate: number;
    renewableEnergyPercentage: number;
    sustainabilityGoals: SustainabilityGoal[];
}

export interface SustainabilityGoal {
    id: string;
    metric: string;
    target: number;
    current: number;
    deadline: Date;
    status: "on_track" | "at_risk" | "achieved" | "missed";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: LEASE ADMINISTRATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface Lease {
    id: string;
    propertyId: string;
    propertyName: string;
    spaceIds: string[];
    tenantId: string;
    tenantName: string;
    landlordId?: string;
    landlordName?: string;
    leaseNumber: string;
    type: LeaseType;
    subtype?: string;
    status: LeaseStatus;
    dates: LeaseDates;
    terms: LeaseTerms;
    financials: LeaseFinancials;
    rentSchedule: RentScheduleItem[];
    clauses: LeaseClause[];
    options: LeaseOption[];
    amendments: LeaseAmendment[];
    contacts: LeaseContact[];
    documents: PropertyDocument[];
    alerts: LeaseAlert[];
    accounting: LeaseAccounting;
    customFields: Record<string, any>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type LeaseType = "gross" | "net" | "nnn" | "modified_gross" | "percentage" | "ground" | "sublease" | "license";
export type LeaseStatus = "draft" | "negotiating" | "pending_approval" | "active" | "expired" | "terminated" | "month_to_month" | "holdover";

export interface LeaseDates {
    executionDate: Date;
    commencementDate: Date;
    rentCommencementDate: Date;
    possessionDate: Date;
    expirationDate: Date;
    terminationDate?: Date;
    termMonths: number;
    freeRentMonths: number;
    buildoutPeriodDays: number;
    noticeToVacateDays: number;
}

export interface LeaseTerms {
    useType: string;
    useDescription: string;
    exclusiveUse?: string;
    prohibitedUses?: string[];
    operatingHours: string;
    requiresHoursApproval: boolean;
    signageRights: string;
    requiresSignageApproval: boolean;
    maintenanceResponsibility: "tenant" | "landlord" | "shared";
    tenantMaintenanceItems: string[];
    landlordMaintenanceItems: string[];
    alterationsAllowed: boolean;
    alterationsApprovalRequired: boolean;
    subleaseAllowed: boolean;
    subleaseApprovalRequired: boolean;
    assignmentAllowed: boolean;
    assignmentApprovalRequired: boolean;
    guarantorRequired: boolean;
    guarantorInfo?: string;
    insuranceRequirements: InsuranceRequirement[];
    specialTerms: string[];
}

export interface InsuranceRequirement {
    type: "general_liability" | "property" | "workers_comp" | "umbrella" | "auto";
    minimumCoverage: number;
    deductible?: number;
    namedInsured: boolean;
}

export interface LeaseFinancials {
    baseRent: number;
    baseRentPeriod: "monthly" | "annually";
    rentPsf: number;
    securityDeposit: number;
    letterOfCredit?: number;
    operatingExpenses: number;
    opexType: "actual" | "estimated" | "cap";
    opexCap?: number;
    opexBaseYear?: number;
    taxes: number;
    taxBaseYear?: number;
    insurance: number;
    cam: number;
    percentageRent?: PercentageRent;
    tenantImprovementAllowance: number;
    tiAmortization?: AmortizationTerms;
    leasingCommission: number;
    commissionSchedule: CommissionPayment[];
    lateFeePolicy: LateFeePolicy;
    currency: string;
}

export interface PercentageRent {
    breakpoint: number;
    percentage: number;
    naturalBreakpoint: boolean;
    salesBasis: "gross" | "net";
    exclusions: string[];
    reportingFrequency: "monthly" | "quarterly" | "annually";
}

export interface AmortizationTerms {
    amount: number;
    term: number;
    rate: number;
    startDate: Date;
}

export interface CommissionPayment {
    recipient: string;
    amount: number;
    percentage?: number;
    dueDate: Date;
    paidDate?: Date;
    status: "pending" | "paid";
}

export interface LateFeePolicy {
    gracePeriodDays: number;
    feeType: "flat" | "percentage" | "per_diem";
    feeAmount: number;
    maxFee?: number;
}

export interface RentScheduleItem {
    id: string;
    startDate: Date;
    endDate: Date;
    baseRent: number;
    opex: number;
    taxes: number;
    totalRent: number;
    adjustmentType: "fixed" | "cpi" | "market" | "step";
    adjustmentRate?: number;
    notes?: string;
}

export interface LeaseClause {
    id: string;
    type: ClauseType;
    title: string;
    description: string;
    section?: string;
    page?: number;
    isCritical: boolean;
    requiresAction: boolean;
    actionDate?: Date;
    actionDescription?: string;
}

export type ClauseType = "termination" | "co_tenancy" | "kick_out" | "radius" | "sublease" | "assignment" | "operating_covenant" | "continuous_operation" | "access" | "audit" | "insurance" | "indemnification" | "default" | "force_majeure" | "other";

export interface LeaseOption {
    id: string;
    type: OptionType;
    description: string;
    terms: string;
    noticeDate: Date;
    effectiveDate: Date;
    expirationDate?: Date;
    rentAdjustment?: string;
    status: "available" | "exercised" | "declined" | "expired" | "waived";
    exercisedDate?: Date;
    exercisedBy?: string;
}

export type OptionType = "renewal" | "extension" | "expansion" | "contraction" | "termination" | "purchase" | "rofo" | "rofr";

export interface LeaseAmendment {
    id: string;
    number: string;
    title: string;
    description: string;
    effectiveDate: Date;
    executedDate: Date;
    changes: string[];
    documentUrl?: string;
}

export interface LeaseContact {
    id: string;
    role: "tenant_primary" | "tenant_accounting" | "landlord_primary" | "landlord_accounting" | "broker" | "attorney";
    name: string;
    company?: string;
    phone: string;
    email: string;
}

export interface LeaseAlert {
    id: string;
    type: AlertType;
    severity: "info" | "warning" | "critical";
    date: Date;
    message: string;
    description?: string;
    status: "pending" | "acknowledged" | "snoozed" | "resolved";
    snoozedUntil?: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
    assignedTo?: string;
}

export type AlertType = "expiration" | "rent_increase" | "option_notice" | "insurance_expiry" | "renewal_deadline" | "termination_notice" | "percentage_rent_due" | "cam_reconciliation" | "audit_right" | "custom";

export interface LeaseAccounting {
    asc842Compliant: boolean;
    classificationType: "operating" | "finance";
    rightOfUseAsset: number;
    leaseLiability: number;
    discountRate: number;
    paymentSchedule: AccountingPayment[];
    straightLineRent: number;
    deferredRent: number;
}

export interface AccountingPayment {
    date: Date;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: MAINTENANCE & CMMS
// ═══════════════════════════════════════════════════════════════════════════════

export interface MaintenanceRequest {
    id: string;
    ticketNumber: string;
    propertyId: string;
    propertyName: string;
    spaceId?: string;
    locationDetails: string;
    requesterId: string;
    requesterName: string;
    requesterContact: string;
    category: MaintenanceCategory;
    subcategory?: string;
    priority: Priority;
    status: TicketStatus;
    type: "corrective" | "preventive" | "emergency" | "inspection";
    description: string;
    detailedDescription?: string;
    images: string[];
    assignment: TicketAssignment;
    schedule: TicketSchedule;
    resolution: TicketResolution;
    costs: TicketCosts;
    relatedAssetId?: string;
    relatedWorkOrderIds: string[];
    slaInfo: SLAInfo;
    communications: TicketCommunication[];
    history: TicketHistory[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export type MaintenanceCategory = "hvac" | "plumbing" | "electrical" | "structural" | "safety" | "cleaning" | "landscaping" | "elevator" | "fire_safety" | "security" | "general";
export type Priority = "low" | "medium" | "high" | "critical" | "emergency";
export type TicketStatus = "new" | "triaged" | "assigned" | "in_progress" | "on_hold" | "pending_parts" | "pending_vendor" | "completed" | "closed" | "cancelled";

export interface TicketAssignment {
    assignedTo?: string;
    assignedName?: string;
    teamId?: string;
    teamName?: string;
    vendorId?: string;
    vendorName?: string;
    assignedAt?: Date;
    assignedBy?: string;
}

export interface TicketSchedule {
    requestedDate?: Date;
    scheduledDate?: Date;
    scheduledTimeSlot?: string;
    estimatedDuration: number;
    actualStartDate?: Date;
    actualEndDate?: Date;
    dueDate: Date;
}

export interface TicketResolution {
    resolvedAt?: Date;
    resolvedBy?: string;
    resolutionType?: "repaired" | "replaced" | "no_issue_found" | "referred" | "deferred";
    resolutionNotes?: string;
    rootCause?: string;
    preventiveActions?: string;
    followUpRequired: boolean;
    followUpDate?: Date;
    satisfactionRating?: number;
    satisfactionFeedback?: string;
}

export interface TicketCosts {
    laborHours: number;
    laborRate: number;
    laborCost: number;
    partsCost: number;
    vendorCost: number;
    otherCost: number;
    totalCost: number;
    budgetCode?: string;
    invoiceNumber?: string;
    billedTo?: "owner" | "tenant" | "warranty";
    currency: string;
}

export interface SLAInfo {
    slaId?: string;
    responseTimeTarget: number;
    resolutionTimeTarget: number;
    responseTimeActual?: number;
    resolutionTimeActual?: number;
    slaBreached: boolean;
    breachReason?: string;
}

export interface TicketCommunication {
    id: string;
    type: "note" | "email" | "call" | "sms";
    direction: "inbound" | "outbound" | "internal";
    from: string;
    to?: string;
    subject?: string;
    content: string;
    attachments: string[];
    createdAt: Date;
}

export interface TicketHistory {
    id: string;
    action: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    userId: string;
    userName: string;
    timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: ASSETS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Asset {
    id: string;
    propertyId: string;
    spaceId?: string;
    code: string;
    barcode?: string;
    name: string;
    description?: string;
    category: string;
    subcategory?: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    status: AssetStatus;
    condition: AssetCondition;
    criticality: "low" | "medium" | "high" | "critical";
    location: AssetLocation;
    acquisition: AssetAcquisition;
    depreciation: AssetDepreciation;
    specifications: Record<string, any>;
    maintenance: AssetMaintenance;
    warranty: AssetWarranty;
    history: AssetHistoryEntry[];
    documents: PropertyDocument[];
    images: string[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export type AssetStatus = "active" | "inactive" | "in_storage" | "in_repair" | "disposed" | "lost" | "leased_out";
export type AssetCondition = "excellent" | "good" | "fair" | "poor" | "critical";

export interface AssetLocation {
    building?: string;
    floor?: string;
    room?: string;
    zone?: string;
    coordinates?: { x: number; y: number };
}

export interface AssetAcquisition {
    purchaseDate: Date;
    purchasePrice: number;
    vendor?: string;
    purchaseOrderNumber?: string;
    installationDate?: Date;
    commissionedDate?: Date;
    expectedLifeYears: number;
    endOfLifeDate?: Date;
}

export interface AssetDepreciation {
    method: "straight_line" | "declining_balance" | "sum_of_years" | "units_of_production";
    currentValue: number;
    residualValue: number;
    accumulatedDepreciation: number;
    lastDepreciationDate?: Date;
}

export interface AssetMaintenance {
    maintenanceType: "preventive" | "predictive" | "condition_based" | "breakdown";
    schedule: MaintenanceSchedule;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate: Date;
    totalMaintenanceCost: number;
    maintenanceCount: number;
    meanTimeBetweenFailures?: number;
    meanTimeToRepair?: number;
}

export interface MaintenanceSchedule {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "semi_annually" | "annually" | "custom";
    customDays?: number;
    lastDate?: Date;
    nextDate: Date;
    checklist: ChecklistItem[];
    estimatedHours: number;
    estimatedCost: number;
    assignedTeam?: string;
}

export interface ChecklistItem {
    id: string;
    task: string;
    isRequired: boolean;
    estimatedTime: number;
}

export interface AssetWarranty {
    hasWarranty: boolean;
    warrantyProvider?: string;
    warrantyType?: "manufacturer" | "extended" | "third_party";
    startDate?: Date;
    endDate?: Date;
    coverageDetails?: string;
    claimProcess?: string;
}

export interface AssetHistoryEntry {
    id: string;
    date: Date;
    type: "maintenance" | "repair" | "inspection" | "relocation" | "valuation" | "incident" | "upgrade";
    description: string;
    cost: number;
    performedBy: string;
    workOrderId?: string;
    notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: SPACE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface FloorPlan {
    id: string;
    propertyId: string;
    floorNumber: number;
    name: string;
    description?: string;
    imageUrl: string;
    cadFileUrl?: string;
    totalArea: AreaMeasurement;
    usableArea: AreaMeasurement;
    spaces: Space[];
    zones: Zone[];
    occupancy: FloorOccupancy;
    lastUpdated: Date;
}

export interface Space {
    id: string;
    code: string;
    name: string;
    type: SpaceType;
    status: SpaceStatus;
    capacity: number;
    area: AreaMeasurement;
    isBookable: boolean;
    bookingRules?: BookingRules;
    assignment: SpaceAssignment;
    features: string[];
    assets: string[];
    amenities: string[];
    occupancySensors: SensorInfo[];
    utilization: UtilizationMetrics;
    coordinates: { x: number; y: number; width: number; height: number };
}

export type SpaceType = "office" | "meeting_room" | "conference_room" | "station" | "exam_room" | "common_area" | "kitchen" | "storage" | "restroom" | "lobby" | "corridor" | "mechanical" | "parking";
export type SpaceStatus = "available" | "occupied" | "reserved" | "under_construction" | "maintenance";

export interface BookingRules {
    minDuration: number;
    maxDuration: number;
    advanceBookingDays: number;
    requiresApproval: boolean;
    allowRecurring: boolean;
    cancellationPolicy: string;
}

export interface SpaceAssignment {
    assignedTo?: string;
    assignedToType?: "user" | "team" | "department";
    assignedName?: string;
    assignedFrom?: Date;
    assignedTo?: Date;
}

export interface SensorInfo {
    sensorId: string;
    type: "occupancy" | "temperature" | "humidity" | "co2" | "light";
    lastReading?: any;
    lastUpdated?: Date;
}

export interface UtilizationMetrics {
    averageOccupancy: number;
    peakOccupancy: number;
    utilizationRate: number;
    bookingRate: number;
    noShowRate: number;
    averageSessionDuration: number;
    lastCalculated: Date;
}

export interface Zone {
    id: string;
    name: string;
    type: "hvac" | "security" | "lighting" | "cleaning" | "fire" | "access";
    color?: string;
    spaces: string[];
    settings?: Record<string, any>;
}

export interface FloorOccupancy {
    totalCapacity: number;
    currentOccupancy: number;
    assignedSeats: number;
    availableSeats: number;
    utilizationRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REAL ESTATE SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class RealEstateService extends EventEmitter {
    private properties: Map<string, Property> = new Map();
    private leases: Map<string, Lease> = new Map();
    private maintenanceRequests: Map<string, MaintenanceRequest> = new Map();
    private assets: Map<string, Asset> = new Map();
    private floorPlans: Map<string, FloorPlan> = new Map();

    constructor() {
        super();
        this.seedInitialData();
        this.startAlertMonitor();
        this.startMaintenanceScheduler();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROPERTY MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createProperty(data: Partial<Property>): Promise<Property> {
        const property: Property = {
            id: randomUUID(),
            code: data.code || `PROP-${String(this.properties.size + 1).padStart(4, "0")}`,
            name: data.name || "New Property",
            type: data.type || "store",
            status: data.status || "active",
            classification: data.classification || "unclassified",
            address: data.address || { street: "", city: "", state: "", zip: "", country: "", countryCode: "", coordinates: { lat: 0, lng: 0 }, timezone: "UTC" },
            details: data.details || { yearBuilt: 2020, constructionType: "", structureType: "", description: "", zoning: "", certificateOfOccupancy: false, accessibilityCompliant: false },
            financial: data.financial || { marketValue: 0, bookValue: 0, assessedValue: 0, currency: "USD", annualTax: 0, annualInsurance: 0, annualOpex: 0, annualRevenue: 0, netOperatingIncome: 0, capRate: 0, pricePerSqFt: 0, accumulatedDepreciation: 0 },
            specs: data.specs || { totalArea: { value: 0, unit: "sqft" }, usableArea: { value: 0, unit: "sqft" }, leasableArea: { value: 0, unit: "sqft" }, commonArea: { value: 0, unit: "sqft" }, floors: 1, belowGradeFloors: 0, parkingSpaces: 0, parkingType: "surface", occupancyCapacity: 0, loadingDocks: 0, elevators: 0, hvacType: "", fireProtection: "", securityFeatures: [] },
            ownership: data.ownership || { type: "leased", ownershipPercentage: 100 },
            portfolio: data.portfolio || {},
            management: data.management || { managerId: "", managerName: "" },
            contacts: [],
            amenities: [],
            certifications: [],
            documents: [],
            images: [],
            leases: [],
            maintenanceRequests: [],
            assets: [],
            incidents: [],
            compliance: { adaCompliant: false, fireCodeCompliant: false, inspectionStatus: "pending", violations: [], permits: [] },
            sustainability: { annualEnergyConsumption: 0, energyUnit: "kWh", annualWaterConsumption: 0, waterUnit: "gallons", annualCarbonEmissions: 0, carbonUnit: "tons", wasteRecyclingRate: 0, renewableEnergyPercentage: 0, sustainabilityGoals: [] },
            metadata: {},
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.properties.set(property.id, property);

        await eventBus.publish("realestate.property_created", { propertyId: property.id });

        return property;
    }

    async getPortfolioStats(): Promise<PortfolioStatistics> {
        const props = Array.from(this.properties.values());
        const leasesArr = Array.from(this.leases.values());

        return {
            propertyCount: props.length,
            totalValue: props.reduce((acc, p) => acc + p.financial.marketValue, 0),
            totalAreaSqFt: props.reduce((acc, p) => acc + (p.specs.totalArea.unit === "sqft" ? p.specs.totalArea.value : p.specs.totalArea.value * 10.764), 0),
            occupancyRate: 0.92,
            activeLeases: leasesArr.filter(l => l.status === "active").length,
            expiringLeases30Days: leasesArr.filter(l => l.status === "active" && l.dates.expirationDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000).length,
            totalAnnualRent: leasesArr.filter(l => l.status === "active").reduce((acc, l) => acc + l.financials.baseRent * 12, 0),
            openMaintenanceTickets: Array.from(this.maintenanceRequests.values()).filter(r => !["completed", "closed", "cancelled"].includes(r.status)).length,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LEASE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createLease(data: Partial<Lease>): Promise<Lease> {
        const lease: Lease = {
            id: randomUUID(),
            propertyId: data.propertyId || "",
            propertyName: data.propertyName || "",
            spaceIds: data.spaceIds || [],
            tenantId: data.tenantId || "",
            tenantName: data.tenantName || "",
            leaseNumber: `LSE-${Date.now().toString().slice(-8)}`,
            type: data.type || "gross",
            status: "draft",
            dates: data.dates || { executionDate: new Date(), commencementDate: new Date(), rentCommencementDate: new Date(), possessionDate: new Date(), expirationDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), termMonths: 60, freeRentMonths: 0, buildoutPeriodDays: 0, noticeToVacateDays: 90 },
            terms: data.terms || { useType: "", useDescription: "", operatingHours: "", requiresHoursApproval: false, signageRights: "", requiresSignageApproval: false, maintenanceResponsibility: "tenant", tenantMaintenanceItems: [], landlordMaintenanceItems: [], alterationsAllowed: false, alterationsApprovalRequired: true, subleaseAllowed: false, subleaseApprovalRequired: true, assignmentAllowed: false, assignmentApprovalRequired: true, guarantorRequired: false, insuranceRequirements: [], specialTerms: [] },
            financials: data.financials || { baseRent: 0, baseRentPeriod: "monthly", rentPsf: 0, securityDeposit: 0, operatingExpenses: 0, opexType: "actual", taxes: 0, insurance: 0, cam: 0, tenantImprovementAllowance: 0, leasingCommission: 0, commissionSchedule: [], lateFeePolicy: { gracePeriodDays: 5, feeType: "percentage", feeAmount: 5 }, currency: "USD" },
            rentSchedule: [],
            clauses: [],
            options: [],
            amendments: [],
            contacts: [],
            documents: [],
            alerts: [],
            accounting: { asc842Compliant: true, classificationType: "operating", rightOfUseAsset: 0, leaseLiability: 0, discountRate: 0.05, paymentSchedule: [], straightLineRent: 0, deferredRent: 0 },
            customFields: {},
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.leases.set(lease.id, lease);

        const property = this.properties.get(lease.propertyId);
        if (property) {
            property.leases.push(lease.id);
            property.updatedAt = new Date();
        }

        await eventBus.publish("realestate.lease_created", { leaseId: lease.id });

        return lease;
    }

    async checkCriticalDates(): Promise<LeaseAlert[]> {
        const alerts: LeaseAlert[] = [];
        const today = new Date();
        const notificationWindow = 90 * 24 * 60 * 60 * 1000;

        for (const lease of this.leases.values()) {
            if (lease.status !== "active") continue;

            if (lease.dates.expirationDate.getTime() - today.getTime() < notificationWindow) {
                alerts.push({ id: randomUUID(), type: "expiration", severity: "warning", date: lease.dates.expirationDate, message: `Lease ${lease.leaseNumber} expiring soon`, status: "pending" });
            }

            for (const opt of lease.options) {
                if (opt.status === "available" && opt.noticeDate.getTime() - today.getTime() < notificationWindow) {
                    alerts.push({ id: randomUUID(), type: "option_notice", severity: "warning", date: opt.noticeDate, message: `Option notice due for ${lease.leaseNumber}`, status: "pending" });
                }
            }
        }

        return alerts;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MAINTENANCE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createMaintenanceRequest(data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
        const request: MaintenanceRequest = {
            id: randomUUID(),
            ticketNumber: `REQ-${Date.now().toString().slice(-8)}`,
            propertyId: data.propertyId!,
            propertyName: data.propertyName || "",
            locationDetails: data.locationDetails || "",
            requesterId: data.requesterId || "system",
            requesterName: data.requesterName || "",
            requesterContact: data.requesterContact || "",
            category: data.category || "general",
            priority: data.priority || "medium",
            status: "new",
            type: data.type || "corrective",
            description: data.description || "",
            images: data.images || [],
            assignment: {},
            schedule: { estimatedDuration: 60, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            resolution: { followUpRequired: false },
            costs: { laborHours: 0, laborRate: 50, laborCost: 0, partsCost: 0, vendorCost: 0, otherCost: 0, totalCost: 0, currency: "USD" },
            relatedWorkOrderIds: [],
            slaInfo: { responseTimeTarget: 4, resolutionTimeTarget: 24, slaBreached: false },
            communications: [],
            history: [{ id: randomUUID(), action: "created", userId: "system", userName: "System", timestamp: new Date() }],
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.maintenanceRequests.set(request.id, request);

        const property = this.properties.get(request.propertyId);
        if (property) {
            property.maintenanceRequests.push(request.id);
        }

        await eventBus.publish("realestate.maintenance_request_created", { requestId: request.id, priority: request.priority });

        return request;
    }

    async updateTicketStatus(id: string, status: TicketStatus, details?: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
        const req = this.maintenanceRequests.get(id);
        if (!req) throw new Error("Request not found");

        const oldStatus = req.status;
        req.status = status;

        if (details) {
            if (details.assignment) Object.assign(req.assignment, details.assignment);
            if (details.costs) Object.assign(req.costs, details.costs);
            if (details.resolution) Object.assign(req.resolution, details.resolution);
        }

        if (status === "completed") {
            req.resolution.resolvedAt = new Date();
            req.schedule.actualEndDate = new Date();
        }

        req.history.push({ id: randomUUID(), action: "status_changed", field: "status", oldValue: oldStatus, newValue: status, userId: "system", userName: "System", timestamp: new Date() });
        req.updatedAt = new Date();

        return req;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ASSET MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async addAsset(data: Partial<Asset>): Promise<Asset> {
        const asset: Asset = {
            id: randomUUID(),
            propertyId: data.propertyId!,
            code: data.code || `AST-${Date.now().toString().slice(-8)}`,
            name: data.name || "New Asset",
            category: data.category || "equipment",
            manufacturer: data.manufacturer || "",
            model: data.model || "",
            serialNumber: data.serialNumber || "",
            status: "active",
            condition: "good",
            criticality: data.criticality || "medium",
            location: data.location || {},
            acquisition: data.acquisition || { purchaseDate: new Date(), purchasePrice: 0, expectedLifeYears: 10 },
            depreciation: { method: "straight_line", currentValue: data.acquisition?.purchasePrice || 0, residualValue: 0, accumulatedDepreciation: 0 },
            specifications: {},
            maintenance: { maintenanceType: "preventive", schedule: { frequency: "annually", nextDate: new Date(), checklist: [], estimatedHours: 1, estimatedCost: 100 }, nextMaintenanceDate: new Date(), totalMaintenanceCost: 0, maintenanceCount: 0 },
            warranty: { hasWarranty: false },
            history: [],
            documents: [],
            images: [],
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.assets.set(asset.id, asset);

        return asset;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BACKGROUND PROCESSES
    // ═══════════════════════════════════════════════════════════════════════════

    private startAlertMonitor(): void {
        setInterval(async () => {
            const alerts = await this.checkCriticalDates();
            if (alerts.length > 0) {
                telemetry.info(`Found ${alerts.length} lease alerts`, "RealEstate");
            }
        }, 3600000);
    }

    private startMaintenanceScheduler(): void {
        setInterval(() => {
            for (const asset of this.assets.values()) {
                if (asset.maintenance.nextMaintenanceDate <= new Date()) {
                    this.createMaintenanceRequest({
                        propertyId: asset.propertyId,
                        description: `Scheduled preventive maintenance for ${asset.name}`,
                        category: "general",
                        priority: "low",
                        type: "preventive",
                        relatedAssetId: asset.id,
                    });
                }
            }
        }, 86400000);
    }

    private seedInitialData(): void {
        this.createProperty({
            name: "Altus Ink HQ - Amsterdam",
            code: "HQ-AMS-01",
            type: "mixed_use",
            status: "active",
            classification: "A",
            address: { street: "De Pijp 123", city: "Amsterdam", state: "NH", zip: "1072", country: "Netherlands", countryCode: "NL", coordinates: { lat: 52.35, lng: 4.89 }, timezone: "Europe/Amsterdam" },
            specs: { totalArea: { value: 5000, unit: "sqm" }, usableArea: { value: 4500, unit: "sqm" }, leasableArea: { value: 0, unit: "sqm" }, commonArea: { value: 500, unit: "sqm" }, floors: 4, belowGradeFloors: 1, parkingSpaces: 20, parkingType: "underground", occupancyCapacity: 300, loadingDocks: 1, elevators: 2, hvacType: "Central HVAC", fireProtection: "Sprinkler", securityFeatures: ["24/7 Security", "CCTV", "Access Control"] },
            financial: { marketValue: 12000000, bookValue: 10000000, assessedValue: 10000000, currency: "EUR", annualTax: 50000, annualInsurance: 20000, annualOpex: 150000, annualRevenue: 0, netOperatingIncome: 0, capRate: 0, pricePerSqFt: 0, accumulatedDepreciation: 0 },
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PortfolioStatistics {
    propertyCount: number;
    totalValue: number;
    totalAreaSqFt: number;
    occupancyRate: number;
    activeLeases: number;
    expiringLeases30Days: number;
    totalAnnualRent: number;
    openMaintenanceTickets: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const realEstateService = new RealEstateService();
export default realEstateService;
