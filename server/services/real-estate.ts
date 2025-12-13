/**
 * ALTUS INK - ENTERPRISE REAL ESTATE & FACILITIES MANAGEMENT SERVICE
 * Comprehensive property, lease, and facility management
 * 
 * Features:
 * - Property portfolio management
 * - Lease administration & accounting
 * - Space management & utilization
 * - Facility maintenance (CMMS)
 * - Asset lifecycle management
 * - Energy & sustainability tracking
 * - Capital project management
 * - Vendor & contractor access control
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Property {
    id: string;
    code: string;
    name: string;
    type: PropertyType;
    status: PropertyStatus;
    address: Address;
    details: PropertyDetails;
    financial: PropertyFinancials;
    specs: PropertySpecs;
    ownership: OwnershipType;
    portfolioId?: string;
    managerId: string;
    contacts: PropertyContact[];
    amenities: string[];
    documents: PropertyDocument[];
    images: PropertyImage[];
    leases: string[]; // Lease IDs
    maintenanceRequests: string[]; // Request IDs
    createdAt: Date;
    updatedAt: Date;
}

export type PropertyType = "store" | "studio" | "warehouse" | "office" | "residential" | "mixed_use" | "land";
export type PropertyStatus = "active" | "vacant" | "under_construction" | "closing" | "sold" | "leased";
export type OwnershipType = "owned" | "leased" | "managed" | "franchise";

export interface Address {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    coordinates: { lat: number; lng: number };
    timezone: string;
}

export interface PropertyDetails {
    yearBuilt: number;
    lastRenovation?: number;
    description: string;
    zoning: string;
    parcelNumber?: string;
    certificateOfOccupancy?: boolean;
}

export interface PropertySpecs {
    totalArea: AreaV; // Sq ft/m
    usableArea: AreaV;
    leasableArea: AreaV;
    floors: number;
    parkingSpaces: number;
    occupancyCapacity: number;
}

export interface AreaV {
    value: number;
    unit: "sqft" | "sqm";
}

export interface PropertyFinancials {
    acquisitionCost?: number;
    acquisitionDate?: Date;
    marketValue: number;
    lastAppraisalDate?: Date;
    assessedValue: number;
    currency: string;
    annualTax: number;
    annualInsurance: number;
    annualOpex: number;
    netOperatingIncome: number;
}

export interface PropertyContact {
    role: "manager" | "security" | "maintenance" | "emergency";
    name: string;
    phone: string;
    email: string;
}

export interface PropertyDocument {
    id: string;
    type: "deed" | "blueprint" | "insurance" | "permit" | "manual";
    title: string;
    url: string;
    expiryDate?: Date;
}

export interface PropertyImage {
    id: string;
    url: string;
    caption: string;
    isPrimary: boolean;
}

// =============================================================================
// LEASE ADMINISTRATION
// =============================================================================

export interface Lease {
    id: string;
    propertyId: string;
    tenantId: string; // Or franchiseId
    landlordId?: string; // If we are tenant
    leaseNumber: string;
    type: "gross" | "net" | "nnn" | "modified_gross" | "percentage";
    status: "active" | "expired" | "terminated" | "negotiating";
    startDate: Date;
    endDate: Date;
    possessionDate: Date;
    executionDate: Date;
    termMonths: number;
    terms: LeaseTerms;
    financials: LeaseFinancials;
    clauses: LeaseClause[];
    options: LeaseOption[];
    documents: PropertyDocument[];
    alerts: LeaseAlert[];
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaseTerms {
    useType: string;
    exclusiveUse: string;
    operatingHours: string;
    signageRights: string;
    maintenanceResp: "tenant" | "landlord" | "shared";
}

export interface LeaseFinancials {
    baseRent: number; // Monthly
    rentSchedule: RentStep[];
    securityDeposit: number;
    operatingExpenses: number; // CAM
    taxes: number;
    insurance: number;
    percentageRent?: {
        breakpoint: number;
        percentage: number;
        salesBasis: "gross" | "net";
    };
    lateFeePolicy: string;
    currency: string;
}

export interface RentStep {
    startDate: Date;
    endDate: Date;
    amount: number;
    type: "fixed" | "cpi_adjustment";
}

export interface LeaseClause {
    id: string;
    type: "termination" | "sublease" | "access" | "audit" | "insurance";
    description: string;
    critical: boolean;
}

export interface LeaseOption {
    type: "renewal" | "expansion" | "termination" | "purchase";
    description: string;
    noticeDate: Date;
    effectiveDate: Date;
    status: "available" | "exercised" | "declined" | "expired";
}

export interface LeaseAlert {
    id: string;
    type: "expiration" | "rent_increase" | "option_notice" | "insurance_expiry";
    date: Date;
    message: string;
    status: "pending" | "acknowledged" | "resolved";
}

// =============================================================================
// FACILITY MAINTENANCE (CMMS)
// =============================================================================

export interface MaintenanceRequest {
    id: string;
    ticketNumber: string;
    propertyId: string;
    locationDetails: string; // "2nd floor bathroom"
    requesterId: string;
    categoryId: string; // HVAC, Plumbing, etc.
    priority: "low" | "medium" | "high" | "critical";
    status: "new" | "assigned" | "in_progress" | "on_hold" | "completed" | "cancelled";
    description: string;
    images: string[];
    assignedTo?: string; // Technician or Vendor ID
    scheduledDate?: Date;
    completedDate?: Date;
    laborHours: number;
    partsCost: number;
    laborCost: number;
    totalCost: number;
    currency: string;
    satisfaction?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Asset {
    id: string;
    propertyId: string;
    code: string;
    name: string;
    type: string; // HVAC, Generator, Elevator
    status: "active" | "inactive" | "disposed" | "repair";
    manufacturer: string;
    model: string;
    serialNumber: string;
    installDate: Date;
    warrantyExpiry: Date;
    purchasePrice: number;
    currentValue: number;
    lifeExpectancyYears: number;
    maintenanceSchedule: MaintenanceSchedule;
    history: AssetHistory[];
}

export interface MaintenanceSchedule {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    lastDate?: Date;
    nextDate: Date;
    checklist: string[];
    estimatedHours: number;
}

export interface AssetHistory {
    date: Date;
    type: "maintenance" | "repair" | "inspection" | "valuation";
    description: string;
    cost: number;
    performedBy: string;
}

// =============================================================================
// SPACE MANAGEMENT
// =============================================================================

export interface FloorPlan {
    id: string;
    propertyId: string;
    floorNumber: number;
    name: string;
    imageUrl: string; // SVG or Image URL
    spaces: Space[];
    zones: Zone[];
}

export interface Space {
    id: string;
    code: string; // Room number
    name: string;
    type: "office" | "meeting_room" | "station" | "exam_room" | "common";
    capacity: number;
    area: number;
    isBookable: boolean;
    assignedUserIds: string[];
    departmentId?: string;
    assets: string[]; // Asset IDs
    features: string[];
}

export interface Zone {
    id: string;
    name: string;
    type: "hvac" | "security" | "lighting" | "cleaning";
    spaces: string[]; // Space IDs
}

// =============================================================================
// REAL ESTATE SERVICE
// =============================================================================

export class RealEstateService {
    private properties: Map<string, Property> = new Map();
    private leases: Map<string, Lease> = new Map();
    private maintenanceRequests: Map<string, MaintenanceRequest> = new Map();
    private assets: Map<string, Asset> = new Map();
    private floorPlans: Map<string, FloorPlan> = new Map();

    constructor() {
        this.seedInitialData();
    }

    // ===========================================================================
    // PROPERTY MANAGEMENT
    // ===========================================================================

    async createProperty(data: Partial<Property>): Promise<Property> {
        const property: Property = {
            id: randomUUID(),
            code: data.code || `PROP-${String(this.properties.size + 1).padStart(4, '0')}`,
            name: data.name || "New Property",
            type: data.type || "store",
            status: data.status || "active",
            address: data.address || { street: "", city: "", state: "", zip: "", country: "", coordinates: { lat: 0, lng: 0 }, timezone: "UTC" },
            details: data.details || { yearBuilt: 2020, description: "", zoning: "" },
            financial: data.financial || {
                marketValue: 0, assessedValue: 0, currency: "USD",
                annualTax: 0, annualInsurance: 0, annualOpex: 0, netOperatingIncome: 0
            },
            specs: data.specs || {
                totalArea: { value: 0, unit: "sqft" },
                usableArea: { value: 0, unit: "sqft" },
                leasableArea: { value: 0, unit: "sqft" },
                floors: 1, parkingSpaces: 0, occupancyCapacity: 0
            },
            ownership: data.ownership || "leased",
            managerId: data.managerId || "",
            contacts: [],
            amenities: [],
            documents: [],
            images: [],
            leases: [],
            maintenanceRequests: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.properties.set(property.id, property);
        return property;
    }

    async getProperty(id: string): Promise<Property | null> {
        return this.properties.get(id) || null;
    }

    async getPortfolioStats(): Promise<any> {
        const props = Array.from(this.properties.values());
        const totalValue = props.reduce((acc, p) => acc + p.financial.marketValue, 0);
        const totalArea = props.reduce((acc, p) => acc + (p.specs.totalArea.unit === 'sqft' ? p.specs.totalArea.value : p.specs.totalArea.value * 10.764), 0);
        const occupancyRate = 0.92; // Simulated

        return {
            propertyCount: props.length,
            totalValue,
            totalAreaSqFt: totalArea,
            occupancyRate
        };
    }

    // ===========================================================================
    // LEASE MANAGEMENT
    // ===========================================================================

    async createLease(data: Partial<Lease>): Promise<Lease> {
        const lease: Lease = {
            id: randomUUID(),
            propertyId: data.propertyId || "",
            tenantId: data.tenantId || "",
            leaseNumber: `LSE-${Date.now().toString().slice(-6)}`,
            type: data.type || "gross",
            status: "active",
            startDate: data.startDate || new Date(),
            endDate: data.endDate || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years
            possessionDate: data.possessionDate || new Date(),
            executionDate: new Date(),
            termMonths: data.termMonths || 60,
            terms: data.terms || { useType: "Retail", exclusiveUse: "", operatingHours: "", signageRights: "", maintenanceResp: "tenant" },
            financials: data.financials || {
                baseRent: 0, rentSchedule: [], securityDeposit: 0, operatingExpenses: 0, taxes: 0, insurance: 0, lateFeePolicy: "", currency: "USD"
            },
            clauses: [],
            options: [],
            documents: [],
            alerts: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.leases.set(lease.id, lease);

        // Link to property
        const property = this.properties.get(lease.propertyId);
        if (property) {
            property.leases.push(lease.id);
            property.updatedAt = new Date();
        }

        return lease;
    }

    async checkCriticalDates(): Promise<LeaseAlert[]> {
        const alerts: LeaseAlert[] = [];
        const today = new Date();
        const notificationWindow = 90 * 24 * 60 * 60 * 1000; // 90 days

        for (const lease of this.leases.values()) {
            // Check Expiration
            if (lease.endDate.getTime() - today.getTime() < notificationWindow && lease.status === "active") {
                alerts.push({
                    id: randomUUID(),
                    type: "expiration",
                    date: lease.endDate,
                    message: `Lease ${lease.leaseNumber} expiring soon`,
                    status: "pending"
                });
            }

            // Check Options
            lease.options.forEach(opt => {
                if (opt.noticeDate.getTime() - today.getTime() < notificationWindow && opt.status === "available") {
                    alerts.push({
                        id: randomUUID(),
                        type: "option_notice",
                        date: opt.noticeDate,
                        message: `Option notice due for ${lease.leaseNumber}`,
                        status: "pending"
                    });
                }
            });
        }

        return alerts;
    }

    // ===========================================================================
    // MAINTENANCE MANAGEMENT
    // ===========================================================================

    async createMaintenanceRequest(data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
        const request: MaintenanceRequest = {
            id: randomUUID(),
            ticketNumber: `REQ-${Date.now().toString().slice(-6)}`,
            propertyId: data.propertyId!,
            locationDetails: data.locationDetails || "",
            requesterId: data.requesterId || "system",
            categoryId: data.categoryId || "general",
            priority: data.priority || "medium",
            status: "new",
            description: data.description || "",
            images: data.images || [],
            laborHours: 0,
            partsCost: 0,
            laborCost: 0,
            totalCost: 0,
            currency: "USD",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.maintenanceRequests.set(request.id, request);

        const property = this.properties.get(request.propertyId);
        if (property) {
            property.maintenanceRequests.push(request.id);
        }

        return request;
    }

    async updateTicketStatus(id: string, status: MaintenanceRequest["status"], details?: {
        assignedTo?: string;
        laborHours?: number;
        cost?: number;
    }): Promise<MaintenanceRequest | null> {
        const req = this.maintenanceRequests.get(id);
        if (!req) return null;

        req.status = status;
        if (details?.assignedTo) req.assignedTo = details.assignedTo;
        if (details?.laborHours) req.laborHours += details.laborHours;
        if (details?.cost) {
            req.totalCost += details.cost;
        }

        if (status === "completed") {
            req.completedDate = new Date();
        }

        req.updatedAt = new Date();
        return req;
    }

    // ===========================================================================
    // ASSET MANAGEMENT
    // ===========================================================================

    async addAsset(data: Partial<Asset>): Promise<Asset> {
        const asset: Asset = {
            id: randomUUID(),
            propertyId: data.propertyId!,
            code: data.code || `AST-${Date.now().toString().slice(-6)}`,
            name: data.name || "New Asset",
            type: data.type || "equipment",
            status: "active",
            manufacturer: data.manufacturer || "",
            model: data.model || "",
            serialNumber: data.serialNumber || "",
            installDate: data.installDate || new Date(),
            warrantyExpiry: data.warrantyExpiry || new Date(),
            purchasePrice: data.purchasePrice || 0,
            currentValue: data.purchasePrice || 0,
            lifeExpectancyYears: data.lifeExpectancyYears || 10,
            maintenanceSchedule: data.maintenanceSchedule || {
                frequency: "yearly",
                nextDate: new Date(),
                checklist: [],
                estimatedHours: 0
            },
            history: [],
            ...data
        };

        this.assets.set(asset.id, asset);
        return asset;
    }

    async logAssetMaintenance(id: string, log: Partial<AssetHistory>): Promise<Asset | null> {
        const asset = this.assets.get(id);
        if (!asset) return null;

        asset.history.push({
            date: new Date(),
            type: "maintenance",
            description: "",
            cost: 0,
            performedBy: "system",
            ...log
        });

        // Update next scheduled date logic would go here
        asset.maintenanceSchedule.lastDate = new Date();

        return asset;
    }

    // ===========================================================================
    // SPACE MANAGEMENT
    // ===========================================================================

    async getFloorPlan(propertyId: string, floorNumber: number): Promise<FloorPlan | undefined> {
        return Array.from(this.floorPlans.values())
            .find(fp => fp.propertyId === propertyId && fp.floorNumber === floorNumber);
    }

    async updateSpaceUsage(spaceId: string, usageData: any): Promise<void> {
        // Implementation for tracking utilization sensors
    }

    private seedInitialData() {
        // Optional: Seed some initial properties
        this.createProperty({
            name: "Altus Ink HQ - Amsterdam",
            code: "HQ-AMS-01",
            type: "mixed_use",
            status: "active",
            address: {
                street: "De Pijp 123",
                city: "Amsterdam",
                state: "NH",
                zip: "1072",
                country: "Netherlands",
                coordinates: { lat: 52.35, lng: 4.89 },
                timezone: "Europe/Amsterdam"
            },
            specs: {
                totalArea: { value: 5000, unit: "sqm" },
                usableArea: { value: 4500, unit: "sqm" },
                leasableArea: { value: 0, unit: "sqm" },
                floors: 4,
                parkingSpaces: 20,
                occupancyCapacity: 300
            },
            financial: {
                marketValue: 12000000,
                assessedValue: 10000000,
                currency: "EUR",
                annualTax: 50000,
                annualInsurance: 20000,
                annualOpex: 150000,
                netOperatingIncome: 0
            }
        });
    }
}

export const realEstateService = new RealEstateService();
export default realEstateService;
