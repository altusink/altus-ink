/**
 * ALTUS INK - DATABASE SEED DATA
 * Comprehensive seed data for development and testing
 * 
 * This script populates the database with realistic test data including:
 * - Users (CEO, Artists, Coordinators, Vendors, Customers)
 * - Artists with complete profiles
 * - Bookings with various statuses
 * - Payments and transactions
 * - Reviews and ratings
 * - Notifications
 */

import { db } from "./db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    users: {
        ceo: 1,
        artists: 15,
        coordinators: 3,
        vendors: 5,
        customers: 50
    },
    bookingsPerArtist: { min: 5, max: 20 },
    portfolioImagesPerArtist: { min: 8, max: 20 },
    reviewsPerArtist: { min: 3, max: 15 }
};

// =============================================================================
// DATA CONSTANTS
// =============================================================================

const FIRST_NAMES = [
    "João", "Maria", "Pedro", "Ana", "Carlos", "Juliana", "Lucas", "Beatriz",
    "Gabriel", "Larissa", "Rafael", "Amanda", "Leonardo", "Camila", "Bruno",
    "Sophie", "Jack", "Emma", "Oliver", "Ava", "William", "Mia", "James",
    "Hans", "Greta", "Pierre", "Marie", "Marco", "Lucia", "Erik", "Ingrid",
    "Alessandro", "Francesca", "Diego", "Carmen", "Miguel", "Isabella"
];

const LAST_NAMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Müller", "Schmidt", "Weber", "Schneider", "Dubois", "Martin", "Rossi",
    "Andersson", "Johansson", "Berg", "Nielsen", "Bakker", "de Vries"
];

const CITIES = [
    { city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam" },
    { city: "Rotterdam", country: "Netherlands", timezone: "Europe/Amsterdam" },
    { city: "Utrecht", country: "Netherlands", timezone: "Europe/Amsterdam" },
    { city: "Lisbon", country: "Portugal", timezone: "Europe/Lisbon" },
    { city: "Porto", country: "Portugal", timezone: "Europe/Lisbon" },
    { city: "Berlin", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Munich", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Hamburg", country: "Germany", timezone: "Europe/Berlin" },
    { city: "Paris", country: "France", timezone: "Europe/Paris" },
    { city: "Lyon", country: "France", timezone: "Europe/Paris" },
    { city: "London", country: "United Kingdom", timezone: "Europe/London" },
    { city: "Manchester", country: "United Kingdom", timezone: "Europe/London" },
    { city: "Barcelona", country: "Spain", timezone: "Europe/Madrid" },
    { city: "Madrid", country: "Spain", timezone: "Europe/Madrid" },
    { city: "Milan", country: "Italy", timezone: "Europe/Rome" },
    { city: "Rome", country: "Italy", timezone: "Europe/Rome" },
    { city: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm" },
    { city: "Copenhagen", country: "Denmark", timezone: "Europe/Copenhagen" },
    { city: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo" },
    { city: "Rio de Janeiro", country: "Brazil", timezone: "America/Sao_Paulo" }
];

const TATTOO_STYLES = [
    "Traditional", "Neo-Traditional", "Realism", "Blackwork", "Dotwork",
    "Japanese", "Tribal", "Watercolor", "Geometric", "Minimalist",
    "Illustrative", "Trash Polka", "New School", "Fine Line", "Microrealism",
    "Surrealism", "Biomechanical", "Chicano", "Celtic", "Nordic"
];

const TATTOO_SPECIALTIES = [
    "Portraits", "Animals", "Florals", "Mandalas", "Lettering",
    "Cover-ups", "Sleeves", "Back Pieces", "Custom Designs", "Flash Art",
    "Pet Portraits", "Memorials", "Music", "Nature", "Abstract"
];

const BIOS = [
    "Professional tattoo artist with {years} years of experience specializing in {style} style. Passionate about creating unique, meaningful pieces for each client.",
    "Award-winning artist known for intricate {style} work. Every tattoo tells a story - let me help tell yours.",
    "Self-taught artist turned professional. Specializing in {style} tattoos with a focus on clean lines and bold colors.",
    "From sketch to skin - creating art that lasts a lifetime. {years} years crafting {style} masterpieces.",
    "Internationally recognized {style} artist. Featured in Tattoo Life, Inked Magazine, and more.",
    "Combining traditional techniques with modern aesthetics. Your vision, my expertise - together we create art.",
    "Dedicated to the craft since {years}. Clean, precise, and always pushing creative boundaries.",
    "European touring artist specializing in {style}. Book your session while I'm in your city!"
];

const PORTFOLIO_CATEGORIES = [
    "Sleeve", "Back Piece", "Forearm", "Leg", "Chest", "Hand", "Neck",
    "Cover-up", "Small", "Large", "Color", "Black & Grey"
];

const REVIEW_COMMENTS = [
    "Absolutely amazing work! The attention to detail is incredible.",
    "Best tattoo experience I've ever had. Clean studio, professional artist.",
    "Exceeded all my expectations. Will definitely be back for more.",
    "The artist really listened to what I wanted and delivered perfectly.",
    "Great communication throughout the process. Highly recommend!",
    "Such a talented artist. The design turned out better than I imagined.",
    "Professional, friendly, and incredibly skilled. 5 stars!",
    "The healing was perfect and the colors are vibrant. Love it!",
    "Worth every penny. True artistry at its finest.",
    "Can't stop looking at my new tattoo! Thank you so much!",
    "So happy with the result. Already planning my next piece.",
    "The artist made me feel so comfortable. First tattoo was perfect.",
    "Incredible work on my cover-up. You can't even see the old tattoo.",
    "Fast, clean, and painless. Amazing artist!"
];

const BOOKING_NOTES = [
    "First tattoo, a bit nervous but excited!",
    "Want something similar to the reference image but with some personal touches.",
    "Looking to cover an old tattoo. Happy to discuss options.",
    "Anniversary present - need it done before next month.",
    "Continuation of my sleeve project.",
    "Simple design, minimal shading preferred.",
    "Want bold colors that will last.",
    "Prefer fine line work.",
    "Memorial piece for my grandmother.",
    "Matching tattoo with my partner."
];

// =============================================================================
// HELPER FUNCTIONS
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

function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function randomDate(startDays: number, endDays: number): Date {
    const now = Date.now();
    const start = now + startDays * 24 * 60 * 60 * 1000;
    const end = now + endDays * 24 * 60 * 60 * 1000;
    return new Date(start + Math.random() * (end - start));
}

function generateId(): string {
    return crypto.randomUUID();
}

function generateEmail(firstName: string, lastName: string): string {
    const domains = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "protonmail.com"];
    const separator = randomElement([".", "_", ""]);
    const number = randomInt(1, 999);
    return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${number}@${randomElement(domains)}`;
}

function generatePhone(country: string): string {
    const prefixes: Record<string, string> = {
        "Netherlands": "+31",
        "Portugal": "+351",
        "Germany": "+49",
        "France": "+33",
        "United Kingdom": "+44",
        "Spain": "+34",
        "Italy": "+39",
        "Sweden": "+46",
        "Denmark": "+45",
        "Brazil": "+55"
    };
    const prefix = prefixes[country] || "+31";
    const number = Array.from({ length: 9 }, () => randomInt(0, 9)).join("");
    return `${prefix}${number}`;
}

function generateUsername(firstName: string, lastName: string): string {
    const styles = [
        `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${randomInt(1, 999)}`,
        `${firstName.toLowerCase()}.tattoo`,
        `ink.${firstName.toLowerCase()}`,
        `${lastName.toLowerCase()}.art`,
        `${firstName.toLowerCase()}_ink`,
        `tattoo.${firstName.toLowerCase()}`
    ];
    return randomElement(styles);
}

function generateBio(style: string): string {
    const template = randomElement(BIOS);
    const years = randomInt(3, 20);
    return template.replace("{years}", years.toString()).replace(/{style}/g, style);
}

function generateWorkingHours(): Record<string, any> {
    const defaultSlot = { start: "10:00", end: "19:00" };
    return {
        monday: { isWorking: true, slots: [defaultSlot] },
        tuesday: { isWorking: true, slots: [defaultSlot] },
        wednesday: { isWorking: true, slots: [defaultSlot] },
        thursday: { isWorking: true, slots: [defaultSlot] },
        friday: { isWorking: true, slots: [defaultSlot] },
        saturday: { isWorking: Math.random() > 0.3, slots: [{ start: "11:00", end: "17:00" }] },
        sunday: { isWorking: false, slots: [] }
    };
}

function generateDepositConfig(): Record<string, any> {
    const type = randomElement(["fixed", "percentage"]);
    return {
        type,
        value: type === "fixed" ? randomElement([5000, 7500, 10000]) : randomElement([20, 25, 30]),
        minAmount: 5000,
        maxAmount: 50000
    };
}

function generatePortfolioImages(artistId: string, count: number): any[] {
    const images: any[] = [];
    for (let i = 0; i < count; i++) {
        images.push({
            id: generateId(),
            artistId,
            url: `https://images.unsplash.com/photo-${1500000000000 + randomInt(1, 999999999)}?w=800`,
            thumbnailUrl: `https://images.unsplash.com/photo-${1500000000000 + randomInt(1, 999999999)}?w=300`,
            publicId: `portfolio_${artistId}_${i}`,
            category: randomElement(PORTFOLIO_CATEGORIES),
            description: `${randomElement(TATTOO_STYLES)} style ${randomElement(["piece", "work", "design", "tattoo"])}`,
            order: i,
            createdAt: randomDate(-180, 0)
        });
    }
    return images;
}

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedUsers(): Promise<Map<string, any>> {
    console.log("🌱 Seeding users...");
    const userMap = new Map<string, any>();

    // CEO
    for (let i = 0; i < CONFIG.users.ceo; i++) {
        const firstName = "Admin";
        const lastName = "CEO";
        const user = {
            id: generateId(),
            email: "ceo@altusink.com",
            username: "admin_ceo",
            displayName: "Admin CEO",
            role: "ceo",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=ceo`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        userMap.set(user.id, { ...user, type: "ceo" });
    }

    // Artists
    for (let i = 0; i < CONFIG.users.artists; i++) {
        const firstName = randomElement(FIRST_NAMES);
        const lastName = randomElement(LAST_NAMES);
        const user = {
            id: generateId(),
            email: generateEmail(firstName, lastName),
            username: generateUsername(firstName, lastName),
            displayName: `${firstName} ${lastName}`,
            role: "artist",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}`,
            createdAt: randomDate(-365, -30),
            updatedAt: new Date()
        };
        userMap.set(user.id, { ...user, type: "artist", firstName, lastName });
    }

    // Coordinators
    for (let i = 0; i < CONFIG.users.coordinators; i++) {
        const firstName = randomElement(FIRST_NAMES);
        const lastName = randomElement(LAST_NAMES);
        const user = {
            id: generateId(),
            email: generateEmail(firstName, lastName),
            username: generateUsername(firstName, lastName),
            displayName: `${firstName} ${lastName}`,
            role: "coordinator",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=coord${i}`,
            createdAt: randomDate(-180, -30),
            updatedAt: new Date()
        };
        userMap.set(user.id, { ...user, type: "coordinator" });
    }

    // Vendors
    for (let i = 0; i < CONFIG.users.vendors; i++) {
        const firstName = randomElement(FIRST_NAMES);
        const lastName = randomElement(LAST_NAMES);
        const user = {
            id: generateId(),
            email: generateEmail(firstName, lastName),
            username: generateUsername(firstName, lastName),
            displayName: `${firstName} ${lastName}`,
            role: "vendor",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=vendor${i}`,
            createdAt: randomDate(-180, -30),
            updatedAt: new Date()
        };
        userMap.set(user.id, { ...user, type: "vendor" });
    }

    // Customers
    for (let i = 0; i < CONFIG.users.customers; i++) {
        const firstName = randomElement(FIRST_NAMES);
        const lastName = randomElement(LAST_NAMES);
        const location = randomElement(CITIES);
        const user = {
            id: generateId(),
            email: generateEmail(firstName, lastName),
            username: generateUsername(firstName, lastName),
            displayName: `${firstName} ${lastName}`,
            role: "customer",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=cust${i}`,
            createdAt: randomDate(-365, 0),
            updatedAt: new Date()
        };
        userMap.set(user.id, { ...user, type: "customer", firstName, lastName, location });
    }

    console.log(`   ✅ Created ${userMap.size} users`);
    return userMap;
}

async function seedArtists(userMap: Map<string, any>): Promise<Map<string, any>> {
    console.log("🎨 Seeding artists...");
    const artistMap = new Map<string, any>();

    const artistUsers = Array.from(userMap.values()).filter(u => u.type === "artist");

    for (const user of artistUsers) {
        const location = randomElement(CITIES);
        const styles = randomElements(TATTOO_STYLES, 2, 5);
        const specialty = randomElement(TATTOO_SPECIALTIES);

        const artist = {
            id: generateId(),
            userId: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            bio: generateBio(styles[0]),
            specialty,
            styles: JSON.stringify(styles),
            city: location.city,
            country: location.country,
            timezone: location.timezone,
            instagram: `@${user.username}`,
            website: Math.random() > 0.5 ? `https://${user.username}.com` : null,
            coverImageUrl: `https://images.unsplash.com/photo-${1500000000000 + randomInt(1, 999999999)}?w=1200`,
            isActive: Math.random() > 0.1,
            isVerified: Math.random() > 0.3,
            tourModeEnabled: Math.random() > 0.7,
            stripeAccountId: Math.random() > 0.2 ? `acct_${generateId().slice(0, 16)}` : null,
            stripeAccountStatus: Math.random() > 0.2 ? "active" : "not_connected",
            commissionRate: 85,
            depositRequirement: JSON.stringify(generateDepositConfig()),
            workingHours: JSON.stringify(generateWorkingHours()),
            bufferMinutes: randomElement([15, 30, 45, 60]),
            minAdvanceBookingHours: randomElement([24, 48, 72]),
            maxAdvanceBookingDays: randomElement([30, 60, 90]),
            cancellationPolicy: randomElement(["flexible", "moderate", "strict"]),
            preferredCurrency: "EUR",
            languages: JSON.stringify(randomElements(["en", "pt", "nl", "de", "fr", "es", "it"], 1, 3)),
            createdAt: user.createdAt,
            updatedAt: new Date()
        };

        artistMap.set(artist.id, artist);
    }

    console.log(`   ✅ Created ${artistMap.size} artist profiles`);
    return artistMap;
}

async function seedBookings(artistMap: Map<string, any>, userMap: Map<string, any>): Promise<Map<string, any>> {
    console.log("📅 Seeding bookings...");
    const bookingMap = new Map<string, any>();

    const artists = Array.from(artistMap.values());
    const customers = Array.from(userMap.values()).filter(u => u.type === "customer");

    for (const artist of artists) {
        const bookingCount = randomInt(CONFIG.bookingsPerArtist.min, CONFIG.bookingsPerArtist.max);

        for (let i = 0; i < bookingCount; i++) {
            const customer = randomElement(customers);
            const status = randomElement(["pending", "confirmed", "completed", "cancelled", "no_show"]);
            const depositAmount = randomElement([5000, 7500, 10000, 15000, 20000]);
            const isPast = Math.random() > 0.4;

            const booking = {
                id: generateId(),
                artistId: artist.id,
                customerName: customer.displayName,
                customerEmail: customer.email,
                customerPhone: generatePhone(customer.location?.country || "Netherlands"),
                slotDatetime: isPast ? randomDate(-90, -1) : randomDate(1, 60),
                durationMinutes: randomElement([60, 90, 120, 180, 240, 300, 360]),
                depositAmount,
                totalAmount: depositAmount * randomInt(2, 4),
                currency: "EUR",
                status: isPast ? randomElement(["completed", "cancelled", "no_show"]) : status,
                notes: Math.random() > 0.5 ? randomElement(BOOKING_NOTES) : null,
                tattooSize: randomElement(["tiny", "small", "medium", "large", "extra_large"]),
                tattooPlacement: randomElement(["Arm", "Forearm", "Back", "Leg", "Chest", "Shoulder"]),
                paymentIntentId: status !== "pending" ? `pi_${generateId().slice(0, 24)}` : null,
                paymentStatus: status === "completed" || status === "confirmed" ? "succeeded" : "pending",
                locale: randomElement(["en", "pt", "nl", "de"]),
                remindersSent: isPast ? randomInt(1, 3) : 0,
                createdAt: randomDate(-120, isPast ? -7 : 0),
                updatedAt: new Date()
            };

            // Add cancellation details if cancelled
            if (status === "cancelled") {
                (booking as any).cancellationReason = randomElement([
                    "Schedule conflict",
                    "Changed mind",
                    "Health reasons",
                    "Financial reasons"
                ]);
                (booking as any).cancelledBy = randomElement(["customer", "artist"]);
                (booking as any).cancelledAt = new Date(booking.createdAt.getTime() + randomInt(1, 48) * 60 * 60 * 1000);
            }

            // Add completion details if completed
            if (status === "completed") {
                (booking as any).confirmedAt = new Date(booking.createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000);
                (booking as any).completedAt = booking.slotDatetime;
            }

            bookingMap.set(booking.id, booking);
        }
    }

    console.log(`   ✅ Created ${bookingMap.size} bookings`);
    return bookingMap;
}

async function seedReviews(artistMap: Map<string, any>, bookingMap: Map<string, any>): Promise<any[]> {
    console.log("⭐ Seeding reviews...");
    const reviews: any[] = [];

    const artists = Array.from(artistMap.values());
    const completedBookings = Array.from(bookingMap.values()).filter(b => b.status === "completed");

    for (const artist of artists) {
        const artistBookings = completedBookings.filter(b => b.artistId === artist.id);
        const reviewCount = Math.min(
            randomInt(CONFIG.reviewsPerArtist.min, CONFIG.reviewsPerArtist.max),
            artistBookings.length
        );

        const bookingsToReview = artistBookings.slice(0, reviewCount);

        for (const booking of bookingsToReview) {
            const rating = randomElement([4, 4, 4, 5, 5, 5, 5, 5, 3]); // Skewed towards positive

            const review = {
                id: generateId(),
                bookingId: booking.id,
                artistId: artist.id,
                customerName: booking.customerName,
                rating,
                comment: rating >= 4 ? randomElement(REVIEW_COMMENTS) : "Good experience overall.",
                response: Math.random() > 0.6 ? "Thank you so much! It was a pleasure working with you!" : null,
                responseAt: Math.random() > 0.6 ? randomDate(-30, 0) : null,
                isPublic: true,
                createdAt: new Date(booking.completedAt.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            };

            reviews.push(review);
        }
    }

    console.log(`   ✅ Created ${reviews.length} reviews`);
    return reviews;
}

async function seedPortfolioImages(artistMap: Map<string, any>): Promise<any[]> {
    console.log("🖼️ Seeding portfolio images...");
    const allImages: any[] = [];

    for (const artist of artistMap.values()) {
        const imageCount = randomInt(
            CONFIG.portfolioImagesPerArtist.min,
            CONFIG.portfolioImagesPerArtist.max
        );
        const images = generatePortfolioImages(artist.id, imageCount);
        allImages.push(...images);
    }

    console.log(`   ✅ Created ${allImages.length} portfolio images`);
    return allImages;
}

async function seedNotifications(userMap: Map<string, any>, bookingMap: Map<string, any>): Promise<any[]> {
    console.log("🔔 Seeding notifications...");
    const notifications: any[] = [];

    const notificationTypes = [
        { type: "booking_new", title: "New Booking", message: "You have a new booking request" },
        { type: "booking_confirmed", title: "Booking Confirmed", message: "Your booking has been confirmed" },
        { type: "booking_reminder", title: "Reminder", message: "Your session is coming up soon" },
        { type: "payment_received", title: "Payment Received", message: "Payment received successfully" },
        { type: "payout_sent", title: "Payout Sent", message: "Your payout has been processed" },
        { type: "review_received", title: "New Review", message: "You received a new review" }
    ];

    for (const user of userMap.values()) {
        const notifCount = randomInt(5, 15);

        for (let i = 0; i < notifCount; i++) {
            const notifType = randomElement(notificationTypes);

            notifications.push({
                id: generateId(),
                userId: user.id,
                type: notifType.type,
                title: notifType.title,
                message: notifType.message,
                data: null,
                read: Math.random() > 0.4,
                readAt: Math.random() > 0.4 ? randomDate(-30, 0) : null,
                createdAt: randomDate(-60, 0)
            });
        }
    }

    console.log(`   ✅ Created ${notifications.length} notifications`);
    return notifications;
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

export async function seed(): Promise<void> {
    console.log("\n🚀 Starting database seed...\n");
    const startTime = Date.now();

    try {
        // Generate data
        const userMap = await seedUsers();
        const artistMap = await seedArtists(userMap);
        const bookingMap = await seedBookings(artistMap, userMap);
        const reviews = await seedReviews(artistMap, bookingMap);
        const portfolioImages = await seedPortfolioImages(artistMap);
        const notifications = await seedNotifications(userMap, bookingMap);

        // Summary
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log("\n" + "=".repeat(50));
        console.log("📊 SEED SUMMARY");
        console.log("=".repeat(50));
        console.log(`Users:             ${userMap.size}`);
        console.log(`Artists:           ${artistMap.size}`);
        console.log(`Bookings:          ${bookingMap.size}`);
        console.log(`Reviews:           ${reviews.length}`);
        console.log(`Portfolio Images:  ${portfolioImages.length}`);
        console.log(`Notifications:     ${notifications.length}`);
        console.log(`Duration:          ${duration}s`);
        console.log("=".repeat(50));
        console.log("\n✅ Database seeded successfully!\n");

        // Export data for reference
        return {
            users: Array.from(userMap.values()),
            artists: Array.from(artistMap.values()),
            bookings: Array.from(bookingMap.values()),
            reviews,
            portfolioImages,
            notifications
        } as any;

    } catch (error) {
        console.error("\n❌ Seed failed:", error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default seed;
export { seed as seedInitialData };
