/**
 * ALTUS INK - TESTING UTILITIES
 * Comprehensive testing framework and utilities
 * 
 * Features:
 * - Mock data generators
 * - API testing utilities
 * - Component testing helpers
 * - E2E test scenarios
 * - Performance benchmarks
 * - Load testing utilities
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES
// =============================================================================

export interface MockUser {
    id: string;
    email: string;
    username: string;
    displayName: string;
    role: "ceo" | "artist" | "customer" | "coordinator" | "vendor";
    createdAt: Date;
}

export interface MockArtist {
    id: string;
    userId: string;
    username: string;
    email: string;
    displayName: string;
    bio: string;
    specialty: string;
    styles: string[];
    city: string;
    country: string;
    isActive: boolean;
    isVerified: boolean;
    commissionRate: number;
    createdAt: Date;
}

export interface MockBooking {
    id: string;
    artistId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    slotDatetime: Date;
    durationMinutes: number;
    depositAmount: number;
    currency: string;
    status: string;
    paymentStatus: string;
    createdAt: Date;
}

export interface MockPayment {
    id: string;
    bookingId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    createdAt: Date;
}

export interface TestScenario {
    name: string;
    description: string;
    steps: TestStep[];
    expectedResult: string;
    tags: string[];
}

export interface TestStep {
    action: string;
    data?: Record<string, any>;
    expectedStatus?: number;
    expectedResponse?: Record<string, any>;
    delay?: number;
}

export interface PerformanceResult {
    name: string;
    duration: number;
    memory: number;
    success: boolean;
    error?: string;
}

export interface LoadTestResult {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    requestsPerSecond: number;
    errors: Record<string, number>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const FIRST_NAMES = [
    "João", "Maria", "Pedro", "Ana", "Carlos", "Juliana", "Lucas", "Beatriz",
    "Matheus", "Camila", "Gabriel", "Larissa", "Rafael", "Amanda", "Leonardo",
    "Sophie", "Jack", "Emma", "Oliver", "Ava", "William", "Mia", "James", "Charlotte",
    "Hans", "Greta", "Pierre", "Marie", "Marco", "Lucia", "Erik", "Ingrid"
];

const LAST_NAMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues", "Almeida",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Müller", "Schmidt", "Weber", "Schneider", "Dubois", "Martin", "Rossi", "Andersson"
];

const CITIES = [
    { city: "Amsterdam", country: "Netherlands" },
    { city: "Rotterdam", country: "Netherlands" },
    { city: "Lisbon", country: "Portugal" },
    { city: "Porto", country: "Portugal" },
    { city: "Berlin", country: "Germany" },
    { city: "Munich", country: "Germany" },
    { city: "Paris", country: "France" },
    { city: "London", country: "United Kingdom" },
    { city: "Barcelona", country: "Spain" },
    { city: "Madrid", country: "Spain" },
    { city: "Milan", country: "Italy" },
    { city: "Rome", country: "Italy" },
    { city: "Stockholm", country: "Sweden" },
    { city: "Copenhagen", country: "Denmark" },
    { city: "São Paulo", country: "Brazil" },
    { city: "Rio de Janeiro", country: "Brazil" }
];

const TATTOO_STYLES = [
    "Traditional", "Neo-Traditional", "Realism", "Blackwork", "Dotwork",
    "Japanese", "Tribal", "Watercolor", "Geometric", "Minimalist",
    "Illustrative", "Trash Polka", "New School", "Fine Line", "Microrealism"
];

const TATTOO_SPECIALTIES = [
    "Portraits", "Animals", "Florals", "Mandalas", "Lettering",
    "Cover-ups", "Sleeves", "Back Pieces", "Custom Designs", "Flash Art"
];

const PLACEMENTS = [
    "Arm", "Forearm", "Upper Arm", "Shoulder", "Back", "Chest",
    "Leg", "Thigh", "Calf", "Ankle", "Wrist", "Hand", "Neck", "Ribs"
];

// =============================================================================
// RANDOM GENERATORS
// =============================================================================

function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
}

function randomDate(startDays: number, endDays: number): Date {
    const now = Date.now();
    const start = now + startDays * 24 * 60 * 60 * 1000;
    const end = now + endDays * 24 * 60 * 60 * 1000;
    return new Date(start + Math.random() * (end - start));
}

function randomEmail(firstName: string, lastName: string): string {
    const domains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "icloud.com"];
    const domain = randomElement(domains);
    const separator = randomElement([".", "_", ""]);
    const number = randomInt(1, 999);
    return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${number}@${domain}`;
}

function randomPhone(): string {
    const prefixes = ["+31", "+351", "+49", "+33", "+44", "+34", "+39", "+46", "+45", "+55"];
    const prefix = randomElement(prefixes);
    const number = Array.from({ length: 9 }, () => randomInt(0, 9)).join("");
    return `${prefix}${number}`;
}

function randomUsername(firstName: string, lastName: string): string {
    const styles = [
        `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${randomInt(1, 999)}`,
        `${firstName.toLowerCase()}.tattoo`,
        `ink.${firstName.toLowerCase()}`,
        `${lastName.toLowerCase()}.art`
    ];
    return randomElement(styles);
}

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

export function generateMockUser(role?: MockUser["role"]): MockUser {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);

    return {
        id: randomUUID(),
        email: randomEmail(firstName, lastName),
        username: randomUsername(firstName, lastName),
        displayName: `${firstName} ${lastName}`,
        role: role || randomElement(["ceo", "artist", "customer", "coordinator", "vendor"]),
        createdAt: randomDate(-365, 0)
    };
}

export function generateMockArtist(userId?: string): MockArtist {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const location = randomElement(CITIES);

    return {
        id: randomUUID(),
        userId: userId || randomUUID(),
        username: randomUsername(firstName, lastName),
        email: randomEmail(firstName, lastName),
        displayName: `${firstName} ${lastName}`,
        bio: `Professional tattoo artist specializing in ${randomElement(TATTOO_STYLES)} style. ${randomInt(5, 20)} years of experience.`,
        specialty: randomElement(TATTOO_SPECIALTIES),
        styles: randomElements(TATTOO_STYLES, 2, 5),
        city: location.city,
        country: location.country,
        isActive: Math.random() > 0.1,
        isVerified: Math.random() > 0.3,
        commissionRate: 85,
        createdAt: randomDate(-365, 0)
    };
}

export function generateMockBooking(artistId?: string): MockBooking {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const depositAmount = randomElement([5000, 7500, 10000, 15000, 20000, 25000]);
    const statuses = ["pending", "confirmed", "completed", "cancelled"];
    const status = randomElement(statuses);

    return {
        id: randomUUID(),
        artistId: artistId || randomUUID(),
        customerName: `${firstName} ${lastName}`,
        customerEmail: randomEmail(firstName, lastName),
        customerPhone: randomPhone(),
        slotDatetime: randomDate(1, 60),
        durationMinutes: randomElement([60, 90, 120, 180, 240, 300, 360]),
        depositAmount,
        currency: "EUR",
        status,
        paymentStatus: status === "confirmed" || status === "completed" ? "succeeded" : "pending",
        createdAt: randomDate(-30, 0)
    };
}

export function generateMockPayment(bookingId?: string): MockPayment {
    return {
        id: randomUUID(),
        bookingId: bookingId || randomUUID(),
        amount: randomElement([5000, 7500, 10000, 15000, 20000]),
        currency: "EUR",
        status: randomElement(["pending", "succeeded", "failed"]),
        method: randomElement(["card", "ideal", "bancontact", "sepa_debit"]),
        createdAt: randomDate(-30, 0)
    };
}

export function generateMockDataset(options: {
    users?: number;
    artists?: number;
    bookings?: number;
    payments?: number;
} = {}): {
    users: MockUser[];
    artists: MockArtist[];
    bookings: MockBooking[];
    payments: MockPayment[];
} {
    const users: MockUser[] = [];
    const artists: MockArtist[] = [];
    const bookings: MockBooking[] = [];
    const payments: MockPayment[] = [];

    // Generate users
    const userCount = options.users || 50;
    for (let i = 0; i < userCount; i++) {
        users.push(generateMockUser());
    }

    // Generate artists
    const artistCount = options.artists || 20;
    const artistUsers = users.filter(u => u.role === "artist").slice(0, artistCount);
    for (const user of artistUsers) {
        artists.push(generateMockArtist(user.id));
    }
    // Add more if needed
    while (artists.length < artistCount) {
        const user = generateMockUser("artist");
        users.push(user);
        artists.push(generateMockArtist(user.id));
    }

    // Generate bookings
    const bookingCount = options.bookings || 100;
    for (let i = 0; i < bookingCount; i++) {
        const artist = randomElement(artists);
        bookings.push(generateMockBooking(artist.id));
    }

    // Generate payments
    const paymentCount = options.payments || 80;
    const confirmedBookings = bookings.filter(b =>
        b.status === "confirmed" || b.status === "completed"
    );
    for (let i = 0; i < paymentCount && i < confirmedBookings.length; i++) {
        payments.push(generateMockPayment(confirmedBookings[i].id));
    }

    return { users, artists, bookings, payments };
}

// =============================================================================
// TEST SCENARIOS
// =============================================================================

export const TEST_SCENARIOS: TestScenario[] = [
    {
        name: "Complete Booking Flow",
        description: "Test the entire booking process from artist selection to payment",
        steps: [
            { action: "GET /api/public/artists", expectedStatus: 200 },
            { action: "GET /api/public/artists/:id/availability", expectedStatus: 200 },
            { action: "POST /api/bookings", expectedStatus: 201 },
            { action: "GET /api/bookings/:id", expectedStatus: 200 },
            { action: "Stripe Checkout", expectedStatus: 200 },
            { action: "POST /api/stripe/webhook (payment.succeeded)", expectedStatus: 200 },
            { action: "GET /api/bookings/:id", expectedStatus: 200, expectedResponse: { status: "confirmed" } }
        ],
        expectedResult: "Booking created and confirmed after payment",
        tags: ["booking", "payment", "critical"]
    },
    {
        name: "Artist Registration and Onboarding",
        description: "Test artist signup and Stripe Connect onboarding",
        steps: [
            { action: "POST /api/auth/register", expectedStatus: 201 },
            { action: "POST /api/artist/profile", expectedStatus: 201 },
            { action: "POST /api/artist/stripe/onboarding", expectedStatus: 200 },
            { action: "Stripe Connect Onboarding", expectedStatus: 200 },
            { action: "GET /api/artist/stripe/status", expectedStatus: 200, expectedResponse: { payoutsEnabled: true } }
        ],
        expectedResult: "Artist registered and connected to Stripe",
        tags: ["artist", "onboarding", "stripe"]
    },
    {
        name: "Booking Cancellation with Refund",
        description: "Test customer cancellation and automatic refund",
        steps: [
            { action: "POST /api/bookings/:id/cancel", expectedStatus: 200 },
            { action: "Check refund amount calculation", expectedStatus: 200 },
            { action: "Stripe Refund", expectedStatus: 200 },
            { action: "GET /api/bookings/:id", expectedStatus: 200, expectedResponse: { status: "cancelled" } }
        ],
        expectedResult: "Booking cancelled and refund processed",
        tags: ["booking", "refund", "critical"]
    },
    {
        name: "CEO Dashboard Access",
        description: "Test CEO can access all dashboard features",
        steps: [
            { action: "POST /api/auth/login (CEO)", expectedStatus: 200 },
            { action: "GET /api/ceo/stats", expectedStatus: 200 },
            { action: "GET /api/ceo/artists", expectedStatus: 200 },
            { action: "GET /api/ceo/bookings", expectedStatus: 200 },
            { action: "GET /api/ceo/payouts", expectedStatus: 200 },
            { action: "GET /api/ceo/reports", expectedStatus: 200 }
        ],
        expectedResult: "CEO has full access to all dashboard data",
        tags: ["ceo", "dashboard", "authorization"]
    },
    {
        name: "Artist Payout Request",
        description: "Test artist payout request and CEO approval",
        steps: [
            { action: "GET /api/artist/earnings", expectedStatus: 200 },
            { action: "POST /api/artist/payouts/request", expectedStatus: 201 },
            { action: "GET /api/ceo/payouts", expectedStatus: 200 },
            { action: "POST /api/ceo/payouts/:id/approve", expectedStatus: 200 },
            { action: "GET /api/artist/payouts/:id", expectedStatus: 200, expectedResponse: { status: "in_transit" } }
        ],
        expectedResult: "Payout requested and approved",
        tags: ["payout", "artist", "ceo"]
    },
    {
        name: "WhatsApp Notification Flow",
        description: "Test WhatsApp notifications for booking",
        steps: [
            { action: "Create booking", expectedStatus: 201 },
            { action: "Check WhatsApp confirmation sent", expectedStatus: 200 },
            { action: "Trigger 24h reminder", expectedStatus: 200 },
            { action: "Check reminder delivered", expectedStatus: 200 }
        ],
        expectedResult: "WhatsApp notifications sent and delivered",
        tags: ["notifications", "whatsapp"]
    },
    {
        name: "Two-Factor Authentication",
        description: "Test 2FA setup and verification",
        steps: [
            { action: "POST /api/auth/2fa/setup", expectedStatus: 200 },
            { action: "POST /api/auth/2fa/verify", expectedStatus: 200 },
            { action: "POST /api/auth/logout", expectedStatus: 200 },
            { action: "POST /api/auth/login", expectedStatus: 200, expectedResponse: { requires2FA: true } },
            { action: "POST /api/auth/2fa/validate", expectedStatus: 200 }
        ],
        expectedResult: "2FA enabled and working",
        tags: ["security", "2fa", "authentication"]
    },
    {
        name: "GDPR Data Export",
        description: "Test GDPR data export functionality",
        steps: [
            { action: "POST /api/user/gdpr/export-request", expectedStatus: 201 },
            { action: "Process export request (async)", delay: 5000 },
            { action: "GET /api/user/gdpr/export", expectedStatus: 200 }
        ],
        expectedResult: "User data exported successfully",
        tags: ["gdpr", "privacy", "compliance"]
    }
];

// =============================================================================
// API TESTING UTILITIES
// =============================================================================

export class ApiTester {
    private baseUrl: string;
    private authToken?: string;
    private results: Array<{
        endpoint: string;
        method: string;
        status: number;
        duration: number;
        success: boolean;
        error?: string;
    }> = [];

    constructor(baseUrl: string = "http://localhost:5000") {
        this.baseUrl = baseUrl;
    }

    setAuthToken(token: string): void {
        this.authToken = token;
    }

    async request(
        method: string,
        endpoint: string,
        data?: any,
        expectedStatus: number = 200
    ): Promise<{ status: number; data: any; duration: number }> {
        const startTime = Date.now();

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
                },
                body: data ? JSON.stringify(data) : undefined
            });

            const duration = Date.now() - startTime;
            const responseData = await response.json().catch(() => ({}));
            const success = response.status === expectedStatus;

            this.results.push({
                endpoint,
                method,
                status: response.status,
                duration,
                success,
                error: success ? undefined : `Expected ${expectedStatus}, got ${response.status}`
            });

            return { status: response.status, data: responseData, duration };
        } catch (error) {
            const duration = Date.now() - startTime;

            this.results.push({
                endpoint,
                method,
                status: 0,
                duration,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw error;
        }
    }

    async get(endpoint: string, expectedStatus?: number) {
        return this.request("GET", endpoint, undefined, expectedStatus);
    }

    async post(endpoint: string, data?: any, expectedStatus?: number) {
        return this.request("POST", endpoint, data, expectedStatus || 201);
    }

    async put(endpoint: string, data?: any, expectedStatus?: number) {
        return this.request("PUT", endpoint, data, expectedStatus);
    }

    async delete(endpoint: string, expectedStatus?: number) {
        return this.request("DELETE", endpoint, undefined, expectedStatus);
    }

    getResults() {
        return {
            total: this.results.length,
            passed: this.results.filter(r => r.success).length,
            failed: this.results.filter(r => !r.success).length,
            averageLatency: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
            results: this.results
        };
    }

    clearResults(): void {
        this.results = [];
    }
}

// =============================================================================
// PERFORMANCE TESTING
// =============================================================================

export class PerformanceTester {
    private results: PerformanceResult[] = [];

    async benchmark(
        name: string,
        fn: () => Promise<void>,
        iterations: number = 100
    ): Promise<PerformanceResult> {
        const durations: number[] = [];
        let success = true;
        let error: string | undefined;

        const memoryBefore = process.memoryUsage().heapUsed;

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            try {
                await fn();
            } catch (e) {
                success = false;
                error = e instanceof Error ? e.message : "Unknown error";
                break;
            }
            durations.push(performance.now() - start);
        }

        const memoryAfter = process.memoryUsage().heapUsed;
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        const result: PerformanceResult = {
            name,
            duration: avgDuration,
            memory: memoryAfter - memoryBefore,
            success,
            error
        };

        this.results.push(result);
        return result;
    }

    getResults(): PerformanceResult[] {
        return this.results;
    }

    printReport(): void {
        console.log("\n=== Performance Report ===\n");
        this.results.forEach(r => {
            console.log(`${r.success ? "✅" : "❌"} ${r.name}`);
            console.log(`   Duration: ${r.duration.toFixed(2)}ms`);
            console.log(`   Memory: ${(r.memory / 1024 / 1024).toFixed(2)}MB`);
            if (r.error) console.log(`   Error: ${r.error}`);
            console.log("");
        });
    }
}

// =============================================================================
// LOAD TESTING
// =============================================================================

export class LoadTester {
    private baseUrl: string;

    constructor(baseUrl: string = "http://localhost:5000") {
        this.baseUrl = baseUrl;
    }

    async run(
        endpoint: string,
        options: {
            concurrency: number;
            totalRequests: number;
            method?: string;
            data?: any;
        }
    ): Promise<LoadTestResult> {
        const { concurrency, totalRequests, method = "GET", data } = options;
        const latencies: number[] = [];
        const errors: Record<string, number> = {};
        let successCount = 0;
        let failCount = 0;

        const startTime = Date.now();

        const makeRequest = async (): Promise<void> => {
            const reqStart = Date.now();
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: data ? JSON.stringify(data) : undefined
                });

                latencies.push(Date.now() - reqStart);

                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                    const key = `HTTP ${response.status}`;
                    errors[key] = (errors[key] || 0) + 1;
                }
            } catch (error) {
                failCount++;
                const key = error instanceof Error ? error.message : "Unknown error";
                errors[key] = (errors[key] || 0) + 1;
                latencies.push(Date.now() - reqStart);
            }
        };

        // Run requests in batches of concurrency
        const batches = Math.ceil(totalRequests / concurrency);
        for (let i = 0; i < batches; i++) {
            const batchSize = Math.min(concurrency, totalRequests - i * concurrency);
            await Promise.all(Array.from({ length: batchSize }, makeRequest));
        }

        const totalTime = Date.now() - startTime;
        latencies.sort((a, b) => a - b);

        return {
            totalRequests,
            successfulRequests: successCount,
            failedRequests: failCount,
            averageLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
            p50Latency: latencies[Math.floor(latencies.length * 0.5)],
            p95Latency: latencies[Math.floor(latencies.length * 0.95)],
            p99Latency: latencies[Math.floor(latencies.length * 0.99)],
            requestsPerSecond: totalRequests / (totalTime / 1000),
            errors
        };
    }

    printReport(result: LoadTestResult): void {
        console.log("\n=== Load Test Report ===\n");
        console.log(`Total Requests: ${result.totalRequests}`);
        console.log(`Successful: ${result.successfulRequests}`);
        console.log(`Failed: ${result.failedRequests}`);
        console.log(`Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
        console.log(`\nLatency:`);
        console.log(`  Average: ${result.averageLatency.toFixed(2)}ms`);
        console.log(`  P50: ${result.p50Latency}ms`);
        console.log(`  P95: ${result.p95Latency}ms`);
        console.log(`  P99: ${result.p99Latency}ms`);
        console.log(`\nThroughput: ${result.requestsPerSecond.toFixed(2)} req/s`);

        if (Object.keys(result.errors).length > 0) {
            console.log(`\nErrors:`);
            Object.entries(result.errors).forEach(([key, count]) => {
                console.log(`  ${key}: ${count}`);
            });
        }
    }
}

// =============================================================================
// TEST RUNNER
// =============================================================================

export class TestRunner {
    private apiTester: ApiTester;
    private scenarios: TestScenario[] = [];
    private results: Map<string, {
        scenario: string;
        passed: boolean;
        steps: Array<{ step: string; passed: boolean; error?: string }>;
        duration: number;
    }> = new Map();

    constructor(baseUrl: string = "http://localhost:5000") {
        this.apiTester = new ApiTester(baseUrl);
        this.scenarios = TEST_SCENARIOS;
    }

    async runScenario(scenarioName: string): Promise<boolean> {
        const scenario = this.scenarios.find(s => s.name === scenarioName);
        if (!scenario) {
            throw new Error(`Scenario not found: ${scenarioName}`);
        }

        const startTime = Date.now();
        const stepResults: Array<{ step: string; passed: boolean; error?: string }> = [];
        let allPassed = true;

        console.log(`\n🧪 Running: ${scenario.name}`);
        console.log(`   ${scenario.description}\n`);

        for (const step of scenario.steps) {
            console.log(`   📝 ${step.action}`);

            try {
                if (step.delay) {
                    await new Promise(resolve => setTimeout(resolve, step.delay));
                }

                // Parse action
                const [method, endpoint] = step.action.split(" ");
                if (endpoint && ["GET", "POST", "PUT", "DELETE"].includes(method)) {
                    await this.apiTester.request(method, endpoint, step.data, step.expectedStatus);
                }

                stepResults.push({ step: step.action, passed: true });
                console.log(`      ✅ Passed`);
            } catch (error) {
                allPassed = false;
                const errorMsg = error instanceof Error ? error.message : "Unknown error";
                stepResults.push({ step: step.action, passed: false, error: errorMsg });
                console.log(`      ❌ Failed: ${errorMsg}`);
            }
        }

        const duration = Date.now() - startTime;

        this.results.set(scenarioName, {
            scenario: scenarioName,
            passed: allPassed,
            steps: stepResults,
            duration
        });

        console.log(`\n   ${allPassed ? "✅" : "❌"} ${scenario.name} - ${duration}ms\n`);

        return allPassed;
    }

    async runAll(tags?: string[]): Promise<void> {
        let scenarios = this.scenarios;

        if (tags && tags.length > 0) {
            scenarios = scenarios.filter(s => s.tags.some(t => tags.includes(t)));
        }

        console.log(`\n🚀 Running ${scenarios.length} test scenarios...\n`);

        for (const scenario of scenarios) {
            await this.runScenario(scenario.name);
        }

        this.printSummary();
    }

    printSummary(): void {
        const results = Array.from(this.results.values());
        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;

        console.log("\n" + "=".repeat(50));
        console.log("📊 TEST SUMMARY");
        console.log("=".repeat(50));
        console.log(`Total: ${results.length}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
        console.log("=".repeat(50) + "\n");

        if (failed > 0) {
            console.log("❌ Failed scenarios:");
            results.filter(r => !r.passed).forEach(r => {
                console.log(`   - ${r.scenario}`);
                r.steps.filter(s => !s.passed).forEach(s => {
                    console.log(`     └─ ${s.step}: ${s.error}`);
                });
            });
        }
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
    randomElement,
    randomElements,
    randomInt,
    randomFloat,
    randomDate,
    randomEmail,
    randomPhone,
    randomUsername,
    FIRST_NAMES,
    LAST_NAMES,
    CITIES,
    TATTOO_STYLES,
    TATTOO_SPECIALTIES,
    PLACEMENTS
};
