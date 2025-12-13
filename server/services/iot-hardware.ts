/**
 * ALTUS INK - ENTERPRISE IOT & HARDWARE INTEGRATION SERVICE
 * Bridging the physical and digital worlds of the tattoo studio
 * 
 * Features:
 * - Tattoo Machine Telemetry (Voltage, Duty Cycle, Run Time)
 * - Thermal Printer Integration (Stencil printing)
 * - Smart Studio Lighting (Philips Hue / DMX control)
 * - Environmental Sensors (Temp, Humidity for ink integrity)
 * - Biometric Access Control (Fingerprint/FaceID readers)
 * - Inventory Smart Scales (Auto-reordering ink)
 * - Digital Signage control
 */

import { randomUUID } from "crypto";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface IoTDevice {
    id: string;
    name: string;
    type: DeviceType;
    status: DeviceStatus;
    locationId: string;
    roomId?: string;
    ipAddress: string;
    macAddress: string;
    firmwareVersion: string;
    lastHeartbeat: Date;
    config: Record<string, any>;
    metadata: Record<string, any>;
    metrics: DeviceMetrics;
    createdAt: Date;
    updatedAt: Date;
}

export type DeviceType =
    | "tattoo_machine_controller"
    | "thermal_printer"
    | "smart_light"
    | "sensor_env"
    | "smart_scale"
    | "access_control"
    | "digital_signage"
    | "camera";

export type DeviceStatus = "online" | "offline" | "error" | "updating" | "maintenance";

export interface DeviceMetrics {
    batteryLevel?: number;
    wifiSignalStrength?: number; // dBm
    uptime: number;
    cpuUsage?: number;
    memoryUsage?: number;
    temperature?: number;
}

// =============================================================================
// TATTOO MACHINE TELEMETRY
// =============================================================================

export interface TattooSessionData {
    id: string;
    deviceId: string;
    artistId: string;
    bookingId: string;
    startTime: Date;
    endTime?: Date;
    totalRunTimeSeconds: number;
    averageVoltage: number;
    averageDutyCycle: number; // For coil machines
    averageHertz: number;
    needleCartridge: string;
    sessionTimeline: MachineEvent[];
}

export interface MachineEvent {
    timestamp: Date;
    type: "start" | "stop" | "voltage_change";
    value: number;
}

// =============================================================================
// ENVIRONMENT & INVENTORY
// =============================================================================

export interface EnvironmentReading {
    id: string;
    deviceId: string;
    locationId: string;
    temperatureC: number;
    humidityPercent: number;
    airQualityIndex: number; // AQI
    voc: number; // Volatile Organic Compounds
    timestamp: Date;
}

export interface InventoryScaleReading {
    id: string;
    deviceId: string;
    productId: string;
    weightGrams: number;
    percentageRemaining: number;
    timestamp: Date;
}

// =============================================================================
// PRINTING & LIGHTING
// =============================================================================

export interface PrintJob {
    id: string;
    printerId: string;
    userId: string;
    fileUrl: string;
    type: "stencil" | "receipt" | "label";
    status: "queued" | "printing" | "completed" | "failed";
    pages: number;
    createdAt: Date;
    completedAt?: Date;
}

export interface LightingScene {
    id: string;
    name: string; // "Work Mode", "Relax", "Photography"
    locationId: string;
    config: LightConfig[];
}

export interface LightConfig {
    deviceId: string;
    on: boolean;
    brightness: number; // 0-100
    color: string; // Hex or Temp
}

// =============================================================================
// IOT SERVICE
// =============================================================================

export class IoTService {
    private devices: Map<string, IoTDevice> = new Map();
    private sessions: Map<string, TattooSessionData> = new Map();
    private printJobs: Map<string, PrintJob> = new Map();

    constructor() {
        this.seedDevices();
        this.startHeartbeatMonitor();
    }

    // ===========================================================================
    // DEVICE MANAGEMENT
    // ===========================================================================

    async registerDevice(data: Partial<IoTDevice>): Promise<IoTDevice> {
        const device: IoTDevice = {
            id: randomUUID(),
            name: data.name || "New Device",
            type: data.type || "sensor_env",
            status: "offline",
            locationId: data.locationId!,
            ipAddress: data.ipAddress || "0.0.0.0",
            macAddress: data.macAddress || "",
            firmwareVersion: data.firmwareVersion || "1.0.0",
            lastHeartbeat: new Date(),
            config: data.config || {},
            metadata: data.metadata || {},
            metrics: { uptime: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.devices.set(device.id, device);
        telemetry.info(`New IoT Device Registered: ${device.name}`, "IoTService");

        return device;
    }

    async heartbeat(deviceId: string, metrics: DeviceMetrics): Promise<void> {
        const device = this.devices.get(deviceId);
        if (!device) return;

        device.lastHeartbeat = new Date();
        device.status = "online";
        device.metrics = metrics;
        device.updatedAt = new Date();
    }

    // ===========================================================================
    // TATTOO MACHINE TELEMETRY
    // ===========================================================================

    async startMachineSession(artistId: string, deviceId: string, bookingId: string): Promise<TattooSessionData> {
        const session: TattooSessionData = {
            id: randomUUID(),
            deviceId,
            artistId,
            bookingId,
            startTime: new Date(),
            totalRunTimeSeconds: 0,
            averageVoltage: 0,
            averageDutyCycle: 0,
            averageHertz: 0,
            needleCartridge: "unknown",
            sessionTimeline: [{ timestamp: new Date(), type: "start", value: 1 }]
        };

        this.sessions.set(session.id, session);

        // Set Lighting to "Work Mode" automatically
        await this.activateScene("SCENE-WORK", "LOC-1");

        return session;
    }

    async logMachineData(sessionId: string, voltage: number, hertz: number): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        session.averageVoltage = (session.averageVoltage + voltage) / 2; // Simple avg
        session.averageHertz = (session.averageHertz + hertz) / 2;
        // Real implementation would append to time series DB
    }

    // ===========================================================================
    // PRINTING (STENCILS)
    // ===========================================================================

    async printStencil(printerId: string, imageUrl: string, userId: string): Promise<PrintJob> {
        const job: PrintJob = {
            id: randomUUID(),
            printerId,
            userId,
            fileUrl: imageUrl,
            type: "stencil",
            status: "queued",
            pages: 1,
            createdAt: new Date()
        };

        this.printJobs.set(job.id, job);

        // Communicate with physical printer (Simulated)
        // await printerAdapter.send(printerId, job);

        await eventBus.publish("biot.print_job_started", { jobId: job.id, printerId });

        return job;
    }

    // ===========================================================================
    // ENVIRONMENTAL MONITORING
    // ===========================================================================

    async receiveSensorData(deviceId: string, data: Partial<EnvironmentReading>): Promise<void> {
        // Check thresholds
        if (data.temperatureC && (data.temperatureC > 25 || data.temperatureC < 18)) {
            await eventBus.publish("system.alert", {
                type: "environment",
                severity: "warning",
                message: `Studio temperature out of range: ${data.temperatureC}C`
            });
        }

        if (data.humidityPercent && data.humidityPercent > 60) {
            await eventBus.publish("system.alert", {
                type: "environment",
                severity: "warning",
                message: `High humidity detected: ${data.humidityPercent}% (Ink Risk)`
            });
        }

        // Store in TimeSeries DB
    }

    // ===========================================================================
    // SMART LIGHTING
    // ===========================================================================

    async activateScene(sceneId: string, locationId: string): Promise<void> {
        // Send DMX/Hue commands
        console.log(`[IoT] Activating Lighting Scene: ${sceneId} at ${locationId}`);

        // Example: Turn lights bright white for tattooing
        // await hue.setGroupState(locationId, { on: true, bri: 254, ct: 400 });
    }

    // ===========================================================================
    // INTERNAL
    // ===========================================================================

    private startHeartbeatMonitor() {
        setInterval(() => {
            const now = new Date();
            for (const device of this.devices.values()) {
                const silence = now.getTime() - device.lastHeartbeat.getTime();
                if (silence > 5 * 60 * 1000 && device.status === "online") { // 5 mins
                    device.status = "offline";
                    eventBus.publish("iot.device_offline", { deviceId: device.id, name: device.name });
                }
            }
        }, 60000); // Check every minute
    }

    private seedDevices() {
        this.registerDevice({
            name: "Main Thermostat",
            type: "sensor_env",
            locationId: "LOC-AMSTERDAM",
            macAddress: "AA:BB:CC:DD:EE:FF"
        });

        this.registerDevice({
            name: "Front Door Cam",
            type: "camera",
            locationId: "LOC-AMSTERDAM",
            ipAddress: "192.168.1.50"
        });

        this.registerDevice({
            name: "Stencil Printer 1",
            type: "thermal_printer",
            locationId: "LOC-AMSTERDAM",
            ipAddress: "192.168.1.101"
        });
    }
}

export const iotService = new IoTService();
export default iotService;
