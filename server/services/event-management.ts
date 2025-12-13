/**
 * ALTUS INK - ENTERPRISE EVENT MANAGEMENT SERVICE
 * Comprehensive tools for conventions, guest spots, seminars, and expos
 * 
 * Features:
 * - Event planning & scheduling
 * - Ticketing & registration
 * - Floor plan management (Booth allocation)
 * - Speaker/Artist management
 * - Agenda & Session management
 * - Sponsor management
 * - Volunteer coordination
 * - Budgeting & Financial reporting
 * - Mobile app backend integration
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Event {
    id: string;
    name: string;
    slug: string;
    type: EventType;
    status: EventStatus;
    startDate: Date;
    endDate: Date;
    location: EventLocation;
    organizerId: string;
    description: string;
    capacity: number;
    expectedAttendance: number;
    ticketing: TicketingConfig;
    budget: Budget;
    floorPlanId?: string;
    branding: EventBranding;
    settings: EventSettings;
    tags: string[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export type EventType = "convention" | "workshop" | "seminar" | "contest" | "party" | "guest_spot_series";
export type EventStatus = "draft" | "published" | "cancelled" | "completed" | "live";

export interface EventLocation {
    venueName: string;
    address: string;
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
    timezone: string;
}

export interface TicketingConfig {
    isEnabled: boolean;
    currency: string;
    ticketTypes: TicketType[];
    salesStart: Date;
    salesEnd: Date;
    refundPolicy: string;
}

export interface TicketType {
    id: string;
    name: string; // "General Admission", "VIP", "Artist Booth"
    price: number;
    quantity: number;
    sold: number;
    description: string;
    isHidden: boolean;
    maxPerOrder: number;
    benefits: string[];
}

export interface Budget {
    totalBudget: number;
    allocated: number;
    spent: number;
    revenue: number;
    items: BudgetItem[];
}

export interface BudgetItem {
    id: string;
    category: string; // "marketing", "venue", "staff"
    name: string;
    estimatedCost: number;
    actualCost: number;
    status: "pending" | "paid";
}

export interface EventBranding {
    logoUrl: string;
    bannerUrl: string;
    primaryColor: string;
    websiteUrl?: string;
}

export interface EventSettings {
    isPublic: boolean;
    allowWaitlist: boolean;
    requireApproval: boolean;
    surveyEnabled: boolean;
}

// =============================================================================
// BOOTH & FLOOR PLAN
// =============================================================================

export interface FloorPlan {
    id: string;
    eventId: string;
    name: string;
    imageUrl: string; // SVG or image
    booths: Booth[];
    zones: Zone[];
}

export interface Booth {
    id: string;
    code: string; // "A1", "B2"
    type: "standard" | "corner" | "premium" | "island";
    size: string; // "10x10"
    status: "available" | "reserved" | "sold" | "blocked";
    exhibitorId?: string;
    price: number;
    electricity: boolean;
}

export interface Zone {
    id: string;
    name: string;
    color: string;
    boothIds: string[];
}

export interface Exhibitor {
    id: string;
    eventId: string;
    name: string;
    userId?: string; // If registered user
    contact: { name: string; email: string; phone: string };
    boothId: string;
    status: "pending" | "approved" | "rejected";
    documents: ExhibitorDocument[]; // Insurance, Permit
}

export interface ExhibitorDocument {
    id: string;
    type: string;
    url: string;
    isVerified: boolean;
}

// =============================================================================
// AGENDA & SESSIONS
// =============================================================================

export interface Session {
    id: string;
    eventId: string;
    title: string;
    description: string;
    track: string; // "Tech", "Art", "Business"
    type: "keynote" | "panel" | "workshop" | "contest";
    startTime: Date;
    endTime: Date;
    location: string; // Room name
    speakers: Speaker[];
    capacity: number;
    registrations: string[]; // User IDs
}

export interface Speaker {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl: string;
    socials: Record<string, string>;
}

// =============================================================================
// CONTEST MANAGEMENT
// =============================================================================

export interface Contest {
    id: string;
    eventId: string;
    name: string; // "Best Traditional"
    description: string;
    startTime: Date;
    endTime: Date; // Award time
    judges: string[]; // Judge IDs
    entries: ContestEntry[];
    winners: ContestWinner[];
}

export interface ContestEntry {
    id: string;
    artistId: string;
    artistName: string;
    modelName: string;
    description: string;
    imageUrl?: string;
    score: number;
}

export interface ContestWinner {
    rank: 1 | 2 | 3;
    entryId: string;
    prize: string;
}

// =============================================================================
// EVENT SERVICE
// =============================================================================

export class EventService {
    private events: Map<string, Event> = new Map();
    private exhibitors: Map<string, Exhibitor> = new Map();
    private sessions: Map<string, Session> = new Map();
    private contests: Map<string, Contest> = new Map();
    private floorPlans: Map<string, FloorPlan> = new Map();
    private registrations: Map<string, any> = new Map(); // Simplified

    constructor() {
        this.seedEvents();
    }

    // ===========================================================================
    // EVENT LIFECYCLE
    // ===========================================================================

    async createEvent(data: Partial<Event>): Promise<Event> {
        const event: Event = {
            id: randomUUID(),
            name: data.name || "Untitled Event",
            slug: data.slug || "",
            type: data.type || "convention",
            status: "draft",
            startDate: data.startDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            endDate: data.endDate || new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
            location: data.location || { venueName: "", address: "", city: "", country: "", coordinates: { lat: 0, lng: 0 }, timezone: "UTC" },
            organizerId: data.organizerId || "system",
            description: data.description || "",
            capacity: data.capacity || 1000,
            expectedAttendance: data.expectedAttendance || 500,
            ticketing: data.ticketing || { isEnabled: true, currency: "USD", ticketTypes: [], salesStart: new Date(), salesEnd: new Date(), refundPolicy: "No refunds" },
            budget: { totalBudget: 0, allocated: 0, spent: 0, revenue: 0, items: [] },
            branding: { logoUrl: "", bannerUrl: "", primaryColor: "#000000" },
            settings: { isPublic: true, allowWaitlist: false, requireApproval: false, surveyEnabled: true },
            tags: [],
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        if (!event.slug) {
            event.slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }

        this.events.set(event.id, event);
        return event;
    }

    async getEvent(id: string): Promise<Event | null> {
        return this.events.get(id) || null;
    }

    // ===========================================================================
    // TICKETING
    // ===========================================================================

    async createTicketType(eventId: string, data: Partial<TicketType>): Promise<Event | null> {
        const event = this.events.get(eventId);
        if (!event) return null;

        const ticket: TicketType = {
            id: randomUUID(),
            name: data.name || "General Admission",
            price: data.price || 0,
            quantity: data.quantity || 100,
            sold: 0,
            description: data.description || "",
            isHidden: data.isHidden || false,
            maxPerOrder: data.maxPerOrder || 10,
            benefits: data.benefits || []
        };

        event.ticketing.ticketTypes.push(ticket);
        event.updatedAt = new Date();
        return event;
    }

    async purchaseTicket(eventId: string, ticketTypeId: string, quantity: number, userId: string): Promise<any> {
        const event = this.events.get(eventId);
        if (!event) throw new Error("Event not found");

        const ticketType = event.ticketing.ticketTypes.find(t => t.id === ticketTypeId);
        if (!ticketType) throw new Error("Ticket type not found");

        if (ticketType.sold + quantity > ticketType.quantity) {
            throw new Error("Sold out");
        }

        // Process payment here (skipping for brevity)

        ticketType.sold += quantity;
        event.budget.revenue += ticketType.price * quantity;

        const order = {
            id: randomUUID(),
            eventId,
            userId,
            ticketTypeId,
            quantity,
            total: ticketType.price * quantity,
            date: new Date(),
            status: "completed"
        };

        // Store order
        return order;
    }

    // ===========================================================================
    // EXHIBITOR MANAGEMENT
    // ===========================================================================

    async applyExhibitor(eventId: string, data: Partial<Exhibitor>): Promise<Exhibitor> {
        const application: Exhibitor = {
            id: randomUUID(),
            eventId,
            name: data.name || "",
            contact: data.contact || { name: "", email: "", phone: "" },
            boothId: data.boothId || "",
            status: "pending",
            documents: [],
            ...data
        };

        this.exhibitors.set(application.id, application);
        return application;
    }

    async assignBooth(exhibitorId: string, boothId: string): Promise<Exhibitor | null> {
        const exhibitor = this.exhibitors.get(exhibitorId);
        if (!exhibitor) return null;

        // Check booth availability
        const event = this.events.get(exhibitor.eventId);
        const floorPlan = event?.floorPlanId ? this.floorPlans.get(event.floorPlanId) : null;

        if (floorPlan) {
            const booth = floorPlan.booths.find(b => b.id === boothId);
            if (booth && booth.status === "available") {
                booth.status = "reserved";
                booth.exhibitorId = exhibitorId;
                exhibitor.boothId = boothId;
                exhibitor.status = "approved";
            } else {
                throw new Error("Booth not available");
            }
        }

        return exhibitor;
    }

    // ===========================================================================
    // CONTESTS
    // ===========================================================================

    async createContest(eventId: string, data: Partial<Contest>): Promise<Contest> {
        const contest: Contest = {
            id: randomUUID(),
            eventId,
            name: data.name || "Tattoo Contest",
            description: data.description || "",
            startTime: data.startTime || new Date(),
            endTime: data.endTime || new Date(),
            judges: data.judges || [],
            entries: [],
            winners: []
        };

        this.contests.set(contest.id, contest);
        return contest;
    }

    async registerContestEntry(contestId: string, entryData: Partial<ContestEntry>): Promise<ContestEntry> {
        const contest = this.contests.get(contestId);
        if (!contest) throw new Error("Contest not found");

        const entry: ContestEntry = {
            id: randomUUID(),
            artistId: entryData.artistId || "",
            artistName: entryData.artistName || "",
            modelName: entryData.modelName || "",
            description: entryData.description || "",
            score: 0,
            ...entryData
        };

        contest.entries.push(entry);
        return entry;
    }

    async performJudging(contestId: string): Promise<ContestWinner[]> {
        const contest = this.contests.get(contestId);
        if (!contest) return [];

        // Simulate judging logic (scoring)
        // In reality, judges would submit scores individually

        const ranked = [...contest.entries].sort((a, b) => b.score - a.score);

        contest.winners = ranked.slice(0, 3).map((entry, index) => ({
            rank: (index + 1) as 1 | 2 | 3,
            entryId: entry.id,
            prize: index === 0 ? "Gold Trophy" : index === 1 ? "Silver Plaque" : "Bronze Cert"
        }));

        return contest.winners;
    }

    private seedEvents() {
        this.createEvent({
            name: "Global Ink Amsterdam 2026",
            type: "convention",
            status: "published",
            location: {
                venueName: "RAI Amsterdam",
                address: "Europaplein 24",
                city: "Amsterdam",
                country: "Netherlands",
                coordinates: { lat: 52.34, lng: 4.88 },
                timezone: "Europe/Amsterdam"
            },
            capacity: 15000
        });
    }
}

export const eventService = new EventService();
export default eventService;
