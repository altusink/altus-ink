/**
 * ALTUS INK - ENTERPRISE FLEET MANAGEMENT SERVICE
 * Comprehensive vehicle, driver, and logistics tracking
 * 
 * Features:
 * - Vehicle lifecycle management (acquisition to disposal)
 * - Maintenance scheduling & tracking
 * - Driver management & safety monitoring
 * - Fuel management & card integration
 * - Route planning & optimization
 * - Real-time telematics integration
 * - Accident & incident reporting
 * - Compliance (MOT, Insurance, Taxes)
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Vehicle {
    id: string;
    vin: string;
    plateNumber: string;
    make: string;
    model: string;
    year: number;
    type: VehicleType;
    status: VehicleStatus;
    driverId?: string;
    odometer: number;
    odometerUnit: "km" | "mi";
    fuelType: FuelType;
    tankCapacity: number;
    fuelEfficiency: number; // MPG or L/100km
    specifications: VehicleSpecs;
    purchaseDate: Date;
    purchasePrice: number;
    warrantyExpiry: Date;
    insurance: InsuranceDetails;
    location: GeoLocation;
    telematicsId?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export type VehicleType = "car" | "van" | "truck" | "motorcycle" | "scooter";
export type VehicleStatus = "active" | "maintenance" | "accident" | "impounded" | "sold" | "written_off";
export type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "hydrogen";

export interface VehicleSpecs {
    color: string;
    transmission: "manual" | "automatic";
    engineSize: string;
    seats: number;
    cargoVolume?: number;
    maxLoad?: number;
    tireSize: string;
}

export interface GeoLocation {
    lat: number;
    lng: number;
    address?: string;
    timestamp: Date;
    speed?: number;
    heading?: number;
}

export interface InsuranceDetails {
    provider: string;
    policyNumber: string;
    coverageType: string;
    startDate: Date;
    endDate: Date;
    premium: number;
    deductible: number;
}

// =============================================================================
// DRIVER MANAGEMENT
// =============================================================================

export interface Driver {
    id: string;
    userId: string;
    licenseNumber: string;
    licenseClass: string;
    licenseExpiry: Date;
    status: "active" | "suspended" | "inactive";
    assignedVehicleId?: string;
    score: number; // 0-100 Safety Score
    certifications: string[];
    documents: DriverDocument[];
    tripHistory: string[];
    incidentHistory: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DriverDocument {
    id: string;
    type: "license" | "insurance" | "medical" | "background_check";
    url: string;
    expiryDate?: Date;
    verified: boolean;
}

// =============================================================================
// MAINTENANCE & SERVICE
// =============================================================================

export interface ServiceRecord {
    id: string;
    vehicleId: string;
    type: "routine" | "repair" | "inspection" | "tire_change" | "cleaning";
    status: "scheduled" | "in_progress" | "completed" | "cancelled";
    date: Date;
    odometer: number;
    cost: number;
    provider: string;
    description: string;
    parts: ServicePart[];
    laborHours: number;
    invoiceUrl?: string;
    performedBy?: string;
    notes?: string;
}

export interface ServicePart {
    partNumber: string;
    name: string;
    quantity: number;
    cost: number;
}

export interface Incident {
    id: string;
    vehicleId: string;
    driverId: string;
    date: Date;
    type: "accident" | "breakdown" | "theft" | "citation" | "other";
    severity: "minor" | "major" | "critical";
    description: string;
    location: GeoLocation;
    weatherConditions?: string;
    injuries: boolean;
    policeReport?: string;
    insuranceClaimId?: string;
    images: string[];
    costForFix: number;
    status: "new" | "investigating" | "closed";
}

// =============================================================================
// TRIPS & ROUTING (Simulated)
// =============================================================================

export interface Trip {
    id: string;
    vehicleId: string;
    driverId: string;
    startLocation: GeoLocation;
    endLocation?: GeoLocation;
    startTime: Date;
    endTime?: Date;
    distance: number;
    fuelConsumed: number;
    purpose: "delivery" | "service" | "commute" | "personal";
    route?: GeoLocation[]; // Breadcrumbs
    events: TelematicsEvent[];
    status: "in_progress" | "completed";
}

export interface TelematicsEvent {
    type: "speeding" | "harsh_braking" | "harsh_cornering" | "idling" | "accident";
    timestamp: Date;
    location: GeoLocation;
    value: number; // e.g. Speed in km/h
    severity: number;
}

// =============================================================================
// FUEL MANAGEMENT
// =============================================================================

export interface FuelEntry {
    id: string;
    vehicleId: string;
    driverId: string;
    date: Date;
    odometer: number;
    quantity: number; // Liters/Gallons
    cost: number;
    costPerUnit: number;
    location: string;
    fuelCardId?: string;
    fullTank: boolean;
    receiptUrl?: string;
}

// =============================================================================
// FLEET SERVICE
// =============================================================================

export class FleetService {
    private vehicles: Map<string, Vehicle> = new Map();
    private drivers: Map<string, Driver> = new Map();
    private serviceRecords: Map<string, ServiceRecord> = new Map();
    private incidents: Map<string, Incident> = new Map();
    private trips: Map<string, Trip> = new Map();
    private fuelEntries: Map<string, FuelEntry> = new Map();

    constructor() {
        this.seedVehicles();
    }

    // ===========================================================================
    // VEHICLE MANAGEMENT
    // ===========================================================================

    async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
        const vehicle: Vehicle = {
            id: randomUUID(),
            vin: data.vin || randomUUID().replace(/-/g, '').toUpperCase().slice(0, 17),
            plateNumber: data.plateNumber || `XYZ-${Date.now().toString().slice(-4)}`,
            make: data.make || "Toyota",
            model: data.model || "Proace",
            year: data.year || 2024,
            type: data.type || "van",
            status: "active",
            odometer: data.odometer || 0,
            odometerUnit: "km",
            fuelType: "electric",
            tankCapacity: 75,
            fuelEfficiency: 15,
            specifications: data.specifications || {
                color: "White", transmission: "automatic", engineSize: "Electric",
                seats: 3, tireSize: "215/65R16"
            },
            purchaseDate: data.purchaseDate || new Date(),
            purchasePrice: data.purchasePrice || 45000,
            warrantyExpiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
            insurance: data.insurance || {
                provider: "InsureCo", policyNumber: "POL123", coverageType: "Comprehensive",
                startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                premium: 1200, deductible: 500
            },
            location: { lat: 0, lng: 0, timestamp: new Date() },
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.vehicles.set(vehicle.id, vehicle);
        return vehicle;
    }

    async getVehicle(id: string): Promise<Vehicle | null> {
        return this.vehicles.get(id) || null;
    }

    async updateOdometer(id: string, reading: number): Promise<Vehicle | null> {
        const vehicle = this.vehicles.get(id);
        if (!vehicle) return null;

        if (reading < vehicle.odometer) {
            throw new Error("New odometer reading cannot be less than current reading");
        }

        vehicle.odometer = reading;
        vehicle.updatedAt = new Date();

        // Check maintenance triggers
        await this.checkMaintenanceSchedule(vehicle);

        return vehicle;
    }

    async reportTelematics(id: string, data: Partial<GeoLocation>): Promise<void> {
        const vehicle = this.vehicles.get(id);
        if (!vehicle) return;

        vehicle.location = {
            lat: data.lat || 0,
            lng: data.lng || 0,
            timestamp: new Date(),
            speed: data.speed,
            heading: data.heading
        };

        // If active trip, update trip route/location
        const activeTrip = Array.from(this.trips.values()).find(t => t.vehicleId === id && t.status === "in_progress");
        if (activeTrip) {
            activeTrip.route = activeTrip.route || [];
            activeTrip.route.push(vehicle.location);
            activeTrip.distance += 0.1; // Simulated distance calculation
        }
    }

    // ===========================================================================
    // DRIVER MANAGEMENT
    // ===========================================================================

    async registerDriver(data: Partial<Driver>): Promise<Driver> {
        const driver: Driver = {
            id: randomUUID(),
            userId: data.userId || randomUUID(),
            licenseNumber: data.licenseNumber || "",
            licenseClass: data.licenseClass || "B",
            licenseExpiry: data.licenseExpiry || new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000),
            status: "active",
            score: 100,
            certifications: [],
            documents: [],
            tripHistory: [],
            incidentHistory: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.drivers.set(driver.id, driver);
        return driver;
    }

    async assignVehicle(vehicleId: string, driverId: string): Promise<void> {
        const vehicle = this.vehicles.get(vehicleId);
        const driver = this.drivers.get(driverId);
        if (!vehicle || !driver) return;

        // Unassign previous
        if (vehicle.driverId) {
            const prevDriver = this.drivers.get(vehicle.driverId);
            if (prevDriver) prevDriver.assignedVehicleId = undefined;
        }

        vehicle.driverId = driverId;
        driver.assignedVehicleId = vehicleId;
        vehicle.updatedAt = new Date();
        driver.updatedAt = new Date();
    }

    // ===========================================================================
    // MAINTENANCE & SERVICE
    // ===========================================================================

    async scheduleService(data: Partial<ServiceRecord>): Promise<ServiceRecord> {
        const record: ServiceRecord = {
            id: randomUUID(),
            vehicleId: data.vehicleId!,
            type: data.type || "routine",
            status: "scheduled",
            date: data.date || new Date(),
            odometer: data.odometer || 0,
            cost: data.cost || 0,
            provider: data.provider || "In-house",
            description: data.description || "Routine Service",
            parts: data.parts || [],
            laborHours: 0,
            ...data
        };

        this.serviceRecords.set(record.id, record);
        return record;
    }

    private async checkMaintenanceSchedule(vehicle: Vehicle): Promise<void> {
        // Example logic: Service every 10,000 km
        const lastService = Array.from(this.serviceRecords.values())
            .filter(r => r.vehicleId === vehicle.id && r.status === "completed")
            .sort((a, b) => b.odometer - a.odometer)[0];

        const lastOdo = lastService ? lastService.odometer : 0;

        if (vehicle.odometer - lastOdo >= 10000) {
            // Schedule new service if none pending
            const pending = Array.from(this.serviceRecords.values())
                .some(r => r.vehicleId === vehicle.id && r.status === "scheduled");

            if (!pending) {
                await this.scheduleService({
                    vehicleId: vehicle.id,
                    type: "routine",
                    description: "Auto-scheduled 10k maintenance",
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });
            }
        }
    }

    // ===========================================================================
    // ANALYTICS
    // ===========================================================================

    async getFleetStats(): Promise<any> {
        const vehicles = Array.from(this.vehicles.values());
        const trips = Array.from(this.trips.values());

        const totalDistance = trips.reduce((sum, t) => sum + t.distance, 0);
        const totalFuel = trips.reduce((sum, t) => sum + t.fuelConsumed, 0);

        return {
            totalVehicles: vehicles.length,
            activeVehicles: vehicles.filter(v => v.status === "active").length,
            totalDistance,
            avgFuelEfficiency: totalDistance / (totalFuel || 1),
            maintenanceCost: Array.from(this.serviceRecords.values()).reduce((sum, r) => sum + r.cost, 0)
        };
    }

    private seedVehicles() {
        this.createVehicle({ make: "Mercedes", model: "Sprinter", type: "van", plateNumber: "INK-VAN-01" });
        this.createVehicle({ make: "Tesla", model: "Model Y", type: "car", plateNumber: "INK-CEO-01" });
    }
}

export const fleetService = new FleetService();
export default fleetService;
