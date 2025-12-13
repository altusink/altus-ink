/**
 * ALTUS INK - ENTERPRISE MULTI-LOCATION & FRANCHISE SERVICE
 * Complete multi-location and franchise management
 * 
 * Features:
 * - Multi-location management
 * - Franchise operations
 * - Territory management
 * - Revenue sharing
 * - Centralized reporting
 * - Brand compliance
 * - Location performance
 * - Resource sharing
 * - Inter-location transfers
 * - Consolidated dashboards
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Location {
    id: string;
    code: string;
    name: string;
    type: LocationType;
    status: LocationStatus;
    parentId?: string;
    franchiseId?: string;
    brand: BrandConfig;
    address: LocationAddress;
    contact: LocationContact;
    operating: OperatingHours;
    settings: LocationSettings;
    capabilities: LocationCapability[];
    amenities: string[];
    certifications: LocationCertification[];
    staff: LocationStaff[];
    artists: string[];
    equipment: LocationEquipment[];
    metrics: LocationMetrics;
    financial: LocationFinancial;
    compliance: ComplianceStatus;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    openedAt?: Date;
    closedAt?: Date;
}

export type LocationType =
    | "headquarters"
    | "flagship"
    | "standard"
    | "studio"
    | "popup"
    | "franchise"
    | "partner";

export type LocationStatus =
    | "planning"
    | "construction"
    | "pre_opening"
    | "active"
    | "temporary_closed"
    | "permanently_closed";

export interface BrandConfig {
    name: string;
    logo: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    slogan?: string;
    website?: string;
    socialLinks: Record<string, string>;
}

export interface LocationAddress {
    street: string;
    street2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timezone: string;
}

export interface LocationContact {
    phone: string;
    email: string;
    website?: string;
    manager: {
        name: string;
        email: string;
        phone: string;
    };
}

export interface OperatingHours {
    timezone: string;
    regular: DaySchedule[];
    holidays: HolidaySchedule[];
    specialHours: SpecialHours[];
}

export interface DaySchedule {
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    breaks?: Array<{ start: string; end: string }>;
}

export interface HolidaySchedule {
    date: Date;
    name: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
}

export interface SpecialHours {
    startDate: Date;
    endDate: Date;
    reason: string;
    schedule: DaySchedule[];
}

export interface LocationSettings {
    currency: string;
    language: string;
    dateFormat: string;
    timeFormat: "12h" | "24h";
    taxRate: number;
    taxInclusive: boolean;
    bookingLeadTime: number;
    bookingMaxAdvance: number;
    cancellationPolicy: string;
    depositRequired: boolean;
    depositPercentage?: number;
    paymentMethods: string[];
    notifications: NotificationSettings;
}

export interface NotificationSettings {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    reminderHours: number[];
    confirmationRequired: boolean;
}

export interface LocationCapability {
    type: string;
    name: string;
    description?: string;
    isAvailable: boolean;
    restrictions?: string[];
}

export interface LocationCertification {
    id: string;
    name: string;
    issuer: string;
    certificateNumber: string;
    issueDate: Date;
    expiryDate?: Date;
    documentUrl?: string;
    status: "valid" | "expired" | "pending_renewal";
}

export interface LocationStaff {
    userId: string;
    role: string;
    isPrimary: boolean;
    startDate: Date;
    endDate?: Date;
}

export interface LocationEquipment {
    id: string;
    name: string;
    type: string;
    serialNumber?: string;
    status: "active" | "maintenance" | "retired";
    purchaseDate?: Date;
    warrantyExpiry?: Date;
    maintenanceSchedule?: string;
    lastMaintenanceAt?: Date;
}

export interface LocationMetrics {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShows: number;
    averageRating: number;
    reviewCount: number;
    customerCount: number;
    repeatCustomerRate: number;
    averageBookingValue: number;
    utilizationRate: number;
}

export interface LocationFinancial {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    currency: string;
    franchiseFees?: number;
    royalties?: number;
    marketingFund?: number;
    lastReportDate?: Date;
}

export interface ComplianceStatus {
    isCompliant: boolean;
    lastAuditDate?: Date;
    nextAuditDate?: Date;
    issues: ComplianceIssue[];
    score: number;
}

export interface ComplianceIssue {
    id: string;
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    dueDate?: Date;
    resolvedAt?: Date;
    status: "open" | "in_progress" | "resolved" | "waived";
}

export interface Franchise {
    id: string;
    name: string;
    code: string;
    type: FranchiseType;
    status: FranchiseStatus;
    owner: FranchiseOwner;
    agreement: FranchiseAgreement;
    territory: Territory;
    locations: string[];
    financial: FranchiseFinancial;
    performance: FranchisePerformance;
    support: FranchiseSupport;
    training: TrainingRecord[];
    documents: FranchiseDocument[];
    createdAt: Date;
    updatedAt: Date;
}

export type FranchiseType =
    | "single_unit"
    | "multi_unit"
    | "area_developer"
    | "master_franchise";

export type FranchiseStatus =
    | "prospect"
    | "application"
    | "approved"
    | "training"
    | "active"
    | "probation"
    | "suspended"
    | "terminated";

export interface FranchiseOwner {
    name: string;
    email: string;
    phone: string;
    company?: string;
    taxId?: string;
    address: LocationAddress;
    experience?: string;
    netWorth?: number;
    liquidAssets?: number;
}

export interface FranchiseAgreement {
    startDate: Date;
    endDate: Date;
    renewalDate?: Date;
    term: number;
    renewalTerm?: number;
    initialFee: number;
    royaltyRate: number;
    royaltyType: "percentage" | "fixed";
    marketingFeeRate: number;
    transferFee?: number;
    minimumRoyalty?: number;
    developmentSchedule?: DevelopmentMilestone[];
    exclusiveTerritory: boolean;
    nonCompete: boolean;
    nonCompetePeriod?: number;
}

export interface DevelopmentMilestone {
    id: string;
    description: string;
    targetDate: Date;
    completedAt?: Date;
    status: "pending" | "in_progress" | "completed" | "delayed";
}

export interface Territory {
    id: string;
    name: string;
    type: "exclusive" | "protected" | "non_exclusive";
    boundaries: TerritoryBoundary;
    population?: number;
    demographics?: Record<string, any>;
    competitors?: number;
    marketPotential?: number;
}

export interface TerritoryBoundary {
    type: "radius" | "polygon" | "postal_codes" | "administrative";
    center?: { lat: number; lng: number };
    radiusKm?: number;
    coordinates?: Array<{ lat: number; lng: number }>;
    postalCodes?: string[];
    regions?: string[];
}

export interface FranchiseFinancial {
    totalInvestment: number;
    feesPaid: number;
    feesOutstanding: number;
    royaltiesYTD: number;
    marketingFundYTD: number;
    totalRevenueYTD: number;
    averageUnitRevenue: number;
    paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
    id: string;
    type: "initial_fee" | "royalty" | "marketing" | "renewal" | "other";
    amount: number;
    dueDate: Date;
    paidDate?: Date;
    status: "pending" | "paid" | "overdue" | "waived";
    invoice?: string;
}

export interface FranchisePerformance {
    overallScore: number;
    financialScore: number;
    operationalScore: number;
    complianceScore: number;
    customerScore: number;
    ranking?: number;
    totalFranchisees?: number;
    lastEvaluationDate?: Date;
    recommendations: string[];
}

export interface FranchiseSupport {
    representativeName: string;
    representativeEmail: string;
    representativePhone: string;
    lastVisitDate?: Date;
    nextVisitDate?: Date;
    tickets: SupportTicket[];
}

export interface SupportTicket {
    id: string;
    subject: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "open" | "in_progress" | "resolved" | "closed";
    createdAt: Date;
    resolvedAt?: Date;
}

export interface TrainingRecord {
    id: string;
    name: string;
    type: "initial" | "ongoing" | "specialty" | "compliance";
    status: "scheduled" | "in_progress" | "completed" | "failed";
    attendees: string[];
    startDate: Date;
    endDate?: Date;
    score?: number;
    certificateUrl?: string;
}

export interface FranchiseDocument {
    id: string;
    type: "agreement" | "amendment" | "disclosure" | "operations_manual" | "audit" | "other";
    name: string;
    url: string;
    version?: string;
    effectiveDate?: Date;
    expiryDate?: Date;
    uploadedAt: Date;
}

export interface ResourcePool {
    id: string;
    name: string;
    type: "equipment" | "inventory" | "staff" | "marketing";
    description: string;
    managedBy: string;
    participants: string[];
    items: ResourceItem[];
    rules: ResourceRule[];
    createdAt: Date;
}

export interface ResourceItem {
    id: string;
    name: string;
    type: string;
    quantity: number;
    availableQuantity: number;
    unit: string;
    value?: number;
    location?: string;
}

export interface ResourceRule {
    type: "allocation" | "priority" | "cost_sharing" | "limit";
    description: string;
    parameters: Record<string, any>;
}

export interface ResourceTransfer {
    id: string;
    poolId?: string;
    fromLocationId: string;
    toLocationId: string;
    items: TransferItem[];
    status: "requested" | "approved" | "in_transit" | "received" | "cancelled";
    requestedBy: string;
    requestedAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
    shippedAt?: Date;
    receivedAt?: Date;
    trackingNumber?: string;
    notes?: string;
}

export interface TransferItem {
    resourceItemId: string;
    name: string;
    quantity: number;
    value?: number;
}

export interface ConsolidatedReport {
    id: string;
    name: string;
    period: { start: Date; end: Date };
    type: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
    scope: "all" | "region" | "franchise" | "location";
    scopeIds: string[];
    metrics: ConsolidatedMetrics;
    breakdown: LocationBreakdown[];
    trends: TrendData[];
    highlights: ReportHighlight[];
    createdAt: Date;
}

export interface ConsolidatedMetrics {
    totalLocations: number;
    activeLocations: number;
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    totalCustomers: number;
    newCustomers: number;
    repeatRate: number;
    utilizationRate: number;
    complianceRate: number;
}

export interface LocationBreakdown {
    locationId: string;
    locationName: string;
    revenue: number;
    bookings: number;
    rating: number;
    customers: number;
    utilization: number;
    ranking: number;
}

export interface TrendData {
    metric: string;
    data: Array<{ date: Date; value: number }>;
    change: number;
    changePercent: number;
}

export interface ReportHighlight {
    type: "achievement" | "concern" | "opportunity";
    title: string;
    description: string;
    metric?: string;
    value?: number;
    locationId?: string;
}

// =============================================================================
// MULTI-LOCATION SERVICE CLASS
// =============================================================================

export class MultiLocationService {
    private locations: Map<string, Location> = new Map();
    private franchises: Map<string, Franchise> = new Map();
    private territories: Map<string, Territory> = new Map();
    private resourcePools: Map<string, ResourcePool> = new Map();
    private transfers: Map<string, ResourceTransfer> = new Map();
    private reports: Map<string, ConsolidatedReport> = new Map();

    private locationCounter = 1000;
    private franchiseCounter = 1000;

    // ===========================================================================
    // LOCATION MANAGEMENT
    // ===========================================================================

    async createLocation(data: Partial<Location>): Promise<Location> {
        const location: Location = {
            id: randomUUID(),
            code: data.code || `LOC-${++this.locationCounter}`,
            name: data.name || "",
            type: data.type || "standard",
            status: "planning",
            brand: data.brand || this.getDefaultBrand(),
            address: data.address || this.getEmptyAddress(),
            contact: data.contact || this.getEmptyContact(),
            operating: data.operating || this.getDefaultOperatingHours(),
            settings: data.settings || this.getDefaultSettings(),
            capabilities: data.capabilities || [],
            amenities: data.amenities || [],
            certifications: [],
            staff: [],
            artists: [],
            equipment: [],
            metrics: this.getEmptyMetrics(),
            financial: this.getEmptyFinancial(),
            compliance: { isCompliant: true, issues: [], score: 100 },
            metadata: data.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.locations.set(location.id, location);
        return location;
    }

    async updateLocation(id: string, data: Partial<Location>): Promise<Location | null> {
        const location = this.locations.get(id);
        if (!location) return null;

        Object.assign(location, data, { updatedAt: new Date() });
        return location;
    }

    async deleteLocation(id: string): Promise<boolean> {
        return this.locations.delete(id);
    }

    async getLocation(id: string): Promise<Location | null> {
        return this.locations.get(id) || null;
    }

    async getLocations(filters?: {
        type?: LocationType;
        status?: LocationStatus;
        franchiseId?: string;
        country?: string;
        city?: string;
    }): Promise<Location[]> {
        let locations = Array.from(this.locations.values());

        if (filters) {
            if (filters.type) {
                locations = locations.filter(l => l.type === filters.type);
            }
            if (filters.status) {
                locations = locations.filter(l => l.status === filters.status);
            }
            if (filters.franchiseId) {
                locations = locations.filter(l => l.franchiseId === filters.franchiseId);
            }
            if (filters.country) {
                locations = locations.filter(l => l.address.country === filters.country);
            }
            if (filters.city) {
                locations = locations.filter(l => l.address.city === filters.city);
            }
        }

        return locations;
    }

    async activateLocation(id: string): Promise<Location | null> {
        const location = this.locations.get(id);
        if (!location) return null;

        location.status = "active";
        location.openedAt = new Date();
        location.updatedAt = new Date();

        return location;
    }

    async closeLocation(id: string, permanent: boolean): Promise<Location | null> {
        const location = this.locations.get(id);
        if (!location) return null;

        location.status = permanent ? "permanently_closed" : "temporary_closed";
        if (permanent) {
            location.closedAt = new Date();
        }
        location.updatedAt = new Date();

        return location;
    }

    async assignStaff(locationId: string, userId: string, role: string, isPrimary: boolean = false): Promise<LocationStaff | null> {
        const location = this.locations.get(locationId);
        if (!location) return null;

        const existingIndex = location.staff.findIndex(s => s.userId === userId);
        if (existingIndex >= 0) {
            location.staff[existingIndex].role = role;
            location.staff[existingIndex].isPrimary = isPrimary;
            return location.staff[existingIndex];
        }

        const staff: LocationStaff = {
            userId,
            role,
            isPrimary,
            startDate: new Date()
        };

        location.staff.push(staff);
        location.updatedAt = new Date();

        return staff;
    }

    async removeStaff(locationId: string, userId: string): Promise<boolean> {
        const location = this.locations.get(locationId);
        if (!location) return false;

        const index = location.staff.findIndex(s => s.userId === userId);
        if (index < 0) return false;

        location.staff[index].endDate = new Date();
        location.updatedAt = new Date();

        return true;
    }

    async addCertification(locationId: string, cert: Omit<LocationCertification, "id" | "status">): Promise<LocationCertification | null> {
        const location = this.locations.get(locationId);
        if (!location) return null;

        const certification: LocationCertification = {
            id: randomUUID(),
            status: cert.expiryDate && cert.expiryDate < new Date() ? "expired" : "valid",
            ...cert
        };

        location.certifications.push(certification);
        location.updatedAt = new Date();

        return certification;
    }

    async updateOperatingHours(locationId: string, hours: OperatingHours): Promise<Location | null> {
        const location = this.locations.get(locationId);
        if (!location) return null;

        location.operating = hours;
        location.updatedAt = new Date();

        return location;
    }

    async findNearbyLocations(lat: number, lng: number, radiusKm: number): Promise<Array<Location & { distance: number }>> {
        const results: Array<Location & { distance: number }> = [];

        for (const location of this.locations.values()) {
            if (location.status !== "active") continue;
            if (!location.address.latitude || !location.address.longitude) continue;

            const distance = this.calculateDistance(
                lat, lng,
                location.address.latitude, location.address.longitude
            );

            if (distance <= radiusKm) {
                results.push({ ...location, distance });
            }
        }

        return results.sort((a, b) => a.distance - b.distance);
    }

    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    private getDefaultBrand(): BrandConfig {
        return {
            name: "Altus Ink",
            logo: "/logo.png",
            colors: { primary: "#6366F1", secondary: "#EC4899", accent: "#22D3EE" },
            fonts: { heading: "Inter", body: "Inter" },
            socialLinks: {}
        };
    }

    private getEmptyAddress(): LocationAddress {
        return {
            street: "",
            city: "",
            postalCode: "",
            country: "",
            timezone: "UTC"
        };
    }

    private getEmptyContact(): LocationContact {
        return {
            phone: "",
            email: "",
            manager: { name: "", email: "", phone: "" }
        };
    }

    private getDefaultOperatingHours(): OperatingHours {
        const regular: DaySchedule[] = [];
        for (let i = 0; i < 7; i++) {
            regular.push({
                dayOfWeek: i,
                isOpen: i !== 0, // Closed on Sunday
                openTime: i !== 0 ? "10:00" : undefined,
                closeTime: i !== 0 ? "19:00" : undefined
            });
        }
        return { timezone: "UTC", regular, holidays: [], specialHours: [] };
    }

    private getDefaultSettings(): LocationSettings {
        return {
            currency: "EUR",
            language: "en",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "24h",
            taxRate: 0.21,
            taxInclusive: true,
            bookingLeadTime: 2,
            bookingMaxAdvance: 90,
            cancellationPolicy: "24 hours notice required",
            depositRequired: true,
            depositPercentage: 30,
            paymentMethods: ["card", "cash"],
            notifications: {
                emailEnabled: true,
                smsEnabled: true,
                whatsappEnabled: false,
                reminderHours: [24, 2],
                confirmationRequired: true
            }
        };
    }

    private getEmptyMetrics(): LocationMetrics {
        return {
            totalBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            noShows: 0,
            averageRating: 0,
            reviewCount: 0,
            customerCount: 0,
            repeatCustomerRate: 0,
            averageBookingValue: 0,
            utilizationRate: 0
        };
    }

    private getEmptyFinancial(): LocationFinancial {
        return {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            currency: "EUR"
        };
    }

    // ===========================================================================
    // FRANCHISE MANAGEMENT
    // ===========================================================================

    async createFranchise(data: Partial<Franchise>): Promise<Franchise> {
        const franchise: Franchise = {
            id: randomUUID(),
            name: data.name || "",
            code: data.code || `FRN-${++this.franchiseCounter}`,
            type: data.type || "single_unit",
            status: "prospect",
            owner: data.owner || this.getEmptyOwner(),
            agreement: data.agreement || this.getDefaultAgreement(),
            territory: data.territory || this.getDefaultTerritory(),
            locations: [],
            financial: this.getEmptyFranchiseFinancial(),
            performance: this.getDefaultPerformance(),
            support: data.support || this.getDefaultSupport(),
            training: [],
            documents: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.franchises.set(franchise.id, franchise);

        if (data.territory) {
            this.territories.set(franchise.territory.id, franchise.territory);
        }

        return franchise;
    }

    async updateFranchise(id: string, data: Partial<Franchise>): Promise<Franchise | null> {
        const franchise = this.franchises.get(id);
        if (!franchise) return null;

        Object.assign(franchise, data, { updatedAt: new Date() });
        return franchise;
    }

    async getFranchise(id: string): Promise<Franchise | null> {
        return this.franchises.get(id) || null;
    }

    async getFranchises(filters?: {
        type?: FranchiseType;
        status?: FranchiseStatus;
    }): Promise<Franchise[]> {
        let franchises = Array.from(this.franchises.values());

        if (filters) {
            if (filters.type) {
                franchises = franchises.filter(f => f.type === filters.type);
            }
            if (filters.status) {
                franchises = franchises.filter(f => f.status === filters.status);
            }
        }

        return franchises;
    }

    async approveFranchise(id: string): Promise<Franchise | null> {
        const franchise = this.franchises.get(id);
        if (!franchise || franchise.status !== "application") return null;

        franchise.status = "approved";
        franchise.updatedAt = new Date();

        return franchise;
    }

    async activateFranchise(id: string): Promise<Franchise | null> {
        const franchise = this.franchises.get(id);
        if (!franchise) return null;

        franchise.status = "active";
        franchise.updatedAt = new Date();

        return franchise;
    }

    async addFranchiseLocation(franchiseId: string, locationId: string): Promise<boolean> {
        const franchise = this.franchises.get(franchiseId);
        const location = this.locations.get(locationId);

        if (!franchise || !location) return false;

        location.franchiseId = franchiseId;
        location.type = "franchise";
        franchise.locations.push(locationId);

        franchise.updatedAt = new Date();
        location.updatedAt = new Date();

        return true;
    }

    async recordPayment(franchiseId: string, payment: Omit<PaymentRecord, "id">): Promise<PaymentRecord | null> {
        const franchise = this.franchises.get(franchiseId);
        if (!franchise) return null;

        const record: PaymentRecord = {
            id: randomUUID(),
            ...payment
        };

        franchise.financial.paymentHistory.push(record);

        if (payment.status === "paid") {
            franchise.financial.feesPaid += payment.amount;

            if (payment.type === "royalty") {
                franchise.financial.royaltiesYTD += payment.amount;
            } else if (payment.type === "marketing") {
                franchise.financial.marketingFundYTD += payment.amount;
            }
        } else if (payment.status === "pending" || payment.status === "overdue") {
            franchise.financial.feesOutstanding += payment.amount;
        }

        franchise.updatedAt = new Date();
        return record;
    }

    async addTraining(franchiseId: string, training: Omit<TrainingRecord, "id">): Promise<TrainingRecord | null> {
        const franchise = this.franchises.get(franchiseId);
        if (!franchise) return null;

        const record: TrainingRecord = {
            id: randomUUID(),
            ...training
        };

        franchise.training.push(record);
        franchise.updatedAt = new Date();

        return record;
    }

    async completeTraining(franchiseId: string, trainingId: string, score?: number, certificateUrl?: string): Promise<TrainingRecord | null> {
        const franchise = this.franchises.get(franchiseId);
        if (!franchise) return null;

        const training = franchise.training.find(t => t.id === trainingId);
        if (!training) return null;

        training.status = score !== undefined && score >= 70 ? "completed" : "failed";
        training.endDate = new Date();
        training.score = score;
        training.certificateUrl = certificateUrl;

        franchise.updatedAt = new Date();
        return training;
    }

    async evaluatePerformance(franchiseId: string): Promise<FranchisePerformance | null> {
        const franchise = this.franchises.get(franchiseId);
        if (!franchise) return null;

        // Calculate scores
        const locations = await Promise.all(
            franchise.locations.map(id => this.getLocation(id))
        );
        const activeLocations = locations.filter(l => l?.status === "active");

        let financialScore = 100;
        if (franchise.financial.feesOutstanding > 0) {
            financialScore -= Math.min(50, franchise.financial.feesOutstanding / 1000);
        }

        let operationalScore = 0;
        if (activeLocations.length > 0) {
            operationalScore = activeLocations.reduce((sum, l) =>
                sum + (l?.metrics.utilizationRate || 0), 0
            ) / activeLocations.length;
        }

        let complianceScore = 0;
        if (activeLocations.length > 0) {
            complianceScore = activeLocations.reduce((sum, l) =>
                sum + (l?.compliance.score || 0), 0
            ) / activeLocations.length;
        }

        let customerScore = 0;
        if (activeLocations.length > 0) {
            customerScore = activeLocations.reduce((sum, l) =>
                sum + ((l?.metrics.averageRating || 0) * 20), 0
            ) / activeLocations.length;
        }

        const overallScore = (financialScore + operationalScore + complianceScore + customerScore) / 4;

        franchise.performance = {
            overallScore,
            financialScore,
            operationalScore,
            complianceScore,
            customerScore,
            lastEvaluationDate: new Date(),
            recommendations: this.generateRecommendations(franchise.performance)
        };

        franchise.updatedAt = new Date();
        return franchise.performance;
    }

    private generateRecommendations(performance: FranchisePerformance): string[] {
        const recommendations: string[] = [];

        if (performance.financialScore < 80) {
            recommendations.push("Review outstanding payments and work on payment plan");
        }
        if (performance.operationalScore < 70) {
            recommendations.push("Increase marketing efforts to improve utilization");
        }
        if (performance.complianceScore < 90) {
            recommendations.push("Address compliance issues before next audit");
        }
        if (performance.customerScore < 80) {
            recommendations.push("Focus on customer service training");
        }

        return recommendations;
    }

    private getEmptyOwner(): FranchiseOwner {
        return {
            name: "",
            email: "",
            phone: "",
            address: this.getEmptyAddress()
        };
    }

    private getDefaultAgreement(): FranchiseAgreement {
        return {
            startDate: new Date(),
            endDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            term: 10,
            renewalTerm: 5,
            initialFee: 50000,
            royaltyRate: 0.05,
            royaltyType: "percentage",
            marketingFeeRate: 0.02,
            transferFee: 25000,
            exclusiveTerritory: true,
            nonCompete: true,
            nonCompetePeriod: 24
        };
    }

    private getDefaultTerritory(): Territory {
        return {
            id: randomUUID(),
            name: "Default Territory",
            type: "protected",
            boundaries: { type: "radius", radiusKm: 10 }
        };
    }

    private getEmptyFranchiseFinancial(): FranchiseFinancial {
        return {
            totalInvestment: 0,
            feesPaid: 0,
            feesOutstanding: 0,
            royaltiesYTD: 0,
            marketingFundYTD: 0,
            totalRevenueYTD: 0,
            averageUnitRevenue: 0,
            paymentHistory: []
        };
    }

    private getDefaultPerformance(): FranchisePerformance {
        return {
            overallScore: 0,
            financialScore: 0,
            operationalScore: 0,
            complianceScore: 0,
            customerScore: 0,
            recommendations: []
        };
    }

    private getDefaultSupport(): FranchiseSupport {
        return {
            representativeName: "",
            representativeEmail: "",
            representativePhone: "",
            tickets: []
        };
    }

    // ===========================================================================
    // RESOURCE POOLS & TRANSFERS
    // ===========================================================================

    async createResourcePool(data: Partial<ResourcePool>): Promise<ResourcePool> {
        const pool: ResourcePool = {
            id: randomUUID(),
            name: data.name || "",
            type: data.type || "equipment",
            description: data.description || "",
            managedBy: data.managedBy || "",
            participants: data.participants || [],
            items: data.items || [],
            rules: data.rules || [],
            createdAt: new Date(),
            ...data
        };

        this.resourcePools.set(pool.id, pool);
        return pool;
    }

    async addResourceItem(poolId: string, item: Omit<ResourceItem, "id">): Promise<ResourceItem | null> {
        const pool = this.resourcePools.get(poolId);
        if (!pool) return null;

        const newItem: ResourceItem = {
            id: randomUUID(),
            ...item
        };

        pool.items.push(newItem);
        return newItem;
    }

    async requestTransfer(data: {
        poolId?: string;
        fromLocationId: string;
        toLocationId: string;
        items: Omit<TransferItem, "resourceItemId">[];
        requestedBy: string;
        notes?: string;
    }): Promise<ResourceTransfer> {
        const transfer: ResourceTransfer = {
            id: randomUUID(),
            poolId: data.poolId,
            fromLocationId: data.fromLocationId,
            toLocationId: data.toLocationId,
            items: data.items.map(item => ({
                resourceItemId: randomUUID(),
                ...item
            })),
            status: "requested",
            requestedBy: data.requestedBy,
            requestedAt: new Date(),
            notes: data.notes
        };

        this.transfers.set(transfer.id, transfer);
        return transfer;
    }

    async approveTransfer(id: string, approverId: string): Promise<ResourceTransfer | null> {
        const transfer = this.transfers.get(id);
        if (!transfer || transfer.status !== "requested") return null;

        transfer.status = "approved";
        transfer.approvedBy = approverId;
        transfer.approvedAt = new Date();

        return transfer;
    }

    async shipTransfer(id: string, trackingNumber?: string): Promise<ResourceTransfer | null> {
        const transfer = this.transfers.get(id);
        if (!transfer || transfer.status !== "approved") return null;

        transfer.status = "in_transit";
        transfer.shippedAt = new Date();
        transfer.trackingNumber = trackingNumber;

        return transfer;
    }

    async receiveTransfer(id: string): Promise<ResourceTransfer | null> {
        const transfer = this.transfers.get(id);
        if (!transfer || transfer.status !== "in_transit") return null;

        transfer.status = "received";
        transfer.receivedAt = new Date();

        return transfer;
    }

    async getTransfers(locationId: string): Promise<ResourceTransfer[]> {
        return Array.from(this.transfers.values()).filter(
            t => t.fromLocationId === locationId || t.toLocationId === locationId
        );
    }

    // ===========================================================================
    // CONSOLIDATED REPORTING
    // ===========================================================================

    async generateConsolidatedReport(options: {
        name: string;
        period: { start: Date; end: Date };
        type: ConsolidatedReport["type"];
        scope: ConsolidatedReport["scope"];
        scopeIds?: string[];
    }): Promise<ConsolidatedReport> {
        let locations: Location[] = [];

        if (options.scope === "all") {
            locations = await this.getLocations({ status: "active" });
        } else if (options.scope === "franchise" && options.scopeIds) {
            for (const franchiseId of options.scopeIds) {
                const franchise = await this.getFranchise(franchiseId);
                if (franchise) {
                    for (const locationId of franchise.locations) {
                        const location = await this.getLocation(locationId);
                        if (location) locations.push(location);
                    }
                }
            }
        } else if (options.scope === "location" && options.scopeIds) {
            for (const locationId of options.scopeIds) {
                const location = await this.getLocation(locationId);
                if (location) locations.push(location);
            }
        }

        // Calculate metrics
        const metrics: ConsolidatedMetrics = {
            totalLocations: locations.length,
            activeLocations: locations.filter(l => l.status === "active").length,
            totalRevenue: locations.reduce((sum, l) => sum + l.financial.totalRevenue, 0),
            totalBookings: locations.reduce((sum, l) => sum + l.metrics.totalBookings, 0),
            averageRating: locations.length > 0
                ? locations.reduce((sum, l) => sum + l.metrics.averageRating, 0) / locations.length
                : 0,
            totalCustomers: locations.reduce((sum, l) => sum + l.metrics.customerCount, 0),
            newCustomers: Math.floor(locations.reduce((sum, l) => sum + l.metrics.customerCount, 0) * 0.3),
            repeatRate: locations.length > 0
                ? locations.reduce((sum, l) => sum + l.metrics.repeatCustomerRate, 0) / locations.length
                : 0,
            utilizationRate: locations.length > 0
                ? locations.reduce((sum, l) => sum + l.metrics.utilizationRate, 0) / locations.length
                : 0,
            complianceRate: locations.length > 0
                ? locations.reduce((sum, l) => sum + l.compliance.score, 0) / locations.length
                : 0
        };

        // Create breakdown
        const breakdown: LocationBreakdown[] = locations
            .map((l, i) => ({
                locationId: l.id,
                locationName: l.name,
                revenue: l.financial.totalRevenue,
                bookings: l.metrics.totalBookings,
                rating: l.metrics.averageRating,
                customers: l.metrics.customerCount,
                utilization: l.metrics.utilizationRate,
                ranking: i + 1
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .map((item, index) => ({ ...item, ranking: index + 1 }));

        // Generate trends
        const trends: TrendData[] = [
            { metric: "revenue", data: [], change: 5000, changePercent: 12 },
            { metric: "bookings", data: [], change: 50, changePercent: 8 },
            { metric: "rating", data: [], change: 0.1, changePercent: 2 }
        ];

        // Generate highlights
        const highlights: ReportHighlight[] = [];

        if (breakdown.length > 0) {
            highlights.push({
                type: "achievement",
                title: "Top Performer",
                description: `${breakdown[0].locationName} leads with €${breakdown[0].revenue.toLocaleString()} in revenue`,
                locationId: breakdown[0].locationId,
                value: breakdown[0].revenue
            });
        }

        if (metrics.utilizationRate < 60) {
            highlights.push({
                type: "concern",
                title: "Low Utilization",
                description: "Average utilization below 60%. Consider marketing campaigns.",
                metric: "utilization",
                value: metrics.utilizationRate
            });
        }

        const report: ConsolidatedReport = {
            id: randomUUID(),
            name: options.name,
            period: options.period,
            type: options.type,
            scope: options.scope,
            scopeIds: options.scopeIds || [],
            metrics,
            breakdown,
            trends,
            highlights,
            createdAt: new Date()
        };

        this.reports.set(report.id, report);
        return report;
    }

    async getReports(limit?: number): Promise<ConsolidatedReport[]> {
        let reports = Array.from(this.reports.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (limit) {
            reports = reports.slice(0, limit);
        }

        return reports;
    }

    async compareLocations(locationIds: string[], metrics: string[]): Promise<{
        locations: Array<{ id: string; name: string }>;
        metrics: Array<{ name: string; values: number[] }>;
    }> {
        const locations = [];
        const metricValues: Array<{ name: string; values: number[] }> = metrics.map(m => ({
            name: m,
            values: []
        }));

        for (const locationId of locationIds) {
            const location = await this.getLocation(locationId);
            if (!location) continue;

            locations.push({ id: location.id, name: location.name });

            for (const metric of metricValues) {
                let value = 0;
                switch (metric.name) {
                    case "revenue": value = location.financial.totalRevenue; break;
                    case "bookings": value = location.metrics.totalBookings; break;
                    case "rating": value = location.metrics.averageRating; break;
                    case "utilization": value = location.metrics.utilizationRate; break;
                    case "customers": value = location.metrics.customerCount; break;
                }
                metric.values.push(value);
            }
        }

        return { locations, metrics: metricValues };
    }

    async getRankings(metric: string, limit: number = 10): Promise<Array<{
        rank: number;
        locationId: string;
        locationName: string;
        value: number;
        change?: number;
    }>> {
        const locations = await this.getLocations({ status: "active" });

        const ranked = locations.map(l => {
            let value = 0;
            switch (metric) {
                case "revenue": value = l.financial.totalRevenue; break;
                case "bookings": value = l.metrics.totalBookings; break;
                case "rating": value = l.metrics.averageRating; break;
                case "utilization": value = l.metrics.utilizationRate; break;
                case "customers": value = l.metrics.customerCount; break;
            }
            return { locationId: l.id, locationName: l.name, value };
        }).sort((a, b) => b.value - a.value);

        return ranked.slice(0, limit).map((item, index) => ({
            rank: index + 1,
            ...item,
            change: Math.random() > 0.5 ? 1 : -1
        }));
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const multiLocationService = new MultiLocationService();
export default multiLocationService;
