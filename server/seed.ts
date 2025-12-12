/**
 * Seed script to create initial data if none exists
 */
import { db } from "./db";
import { users, artists, citySchedule, artistAvailability } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedInitialData() {
    try {
        // Check if any CEO user exists
        const existingCEO = await db
            .select()
            .from(users)
            .where(eq(users.role, "ceo"))
            .limit(1);

        if (existingCEO.length > 0) {
            console.log("[seed] CEO user already exists, skipping user seed");
        } else {
            // Create default CEO user
            const hashedPassword = await bcrypt.hash("admin123", 10);

            await db.insert(users).values({
                email: "admin@altusink.com",
                username: "admin",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "ALTUS INK",
                role: "ceo",
                isActive: true,
            });

            console.log("[seed] Created initial CEO user:");
            console.log("  Username: admin");
            console.log("  Password: admin123");
            console.log("  ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!");
        }

        // Check if Danilo Santos artist exists
        const existingArtist = await db
            .select()
            .from(artists)
            .where(eq(artists.subdomain, "danilo-santos"))
            .limit(1);

        if (existingArtist.length === 0) {
            // Create Danilo Santos user
            const artistPassword = await bcrypt.hash("danilo123", 10);

            const [daniloUser] = await db.insert(users).values({
                email: "danilo@altusink.com",
                username: "danilo",
                password: artistPassword,
                firstName: "Danilo",
                lastName: "Santos",
                role: "artist",
                isActive: true,
            }).returning();

            // Create Danilo Santos artist profile
            const [daniloArtist] = await db.insert(artists).values({
                userId: daniloUser.id,
                subdomain: "danilo-santos",
                displayName: "Danilo Santos",
                bio: "Artista internacional especializado em Blackwork, Dotwork e Neo-Traditional. Com mais de 10 anos de experiência, já atendeu clientes em mais de 15 países. Cada peça é única e personalizada para refletir a história do cliente.",
                instagram: "danilosantos.ink",
                depositAmount: "150.00",
                currency: "EUR",
                timezone: "Europe/Lisbon",
                tourModeEnabled: true,
                isActive: true,
                isApproved: true,
                themeColor: "#00D4FF",
                coverImageUrl: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800",
            }).returning();

            console.log("[seed] Created Danilo Santos artist profile");

            // Create city schedules for Danilo
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const twoMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 2, 1);
            const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 1);

            await db.insert(citySchedule).values([
                {
                    artistId: daniloArtist.id,
                    city: "Lisboa",
                    country: "Portugal",
                    countryCode: "PT",
                    fullAddress: "Rua Augusta 123, 1100-053 Lisboa",
                    venueName: "ALTUS INK Lisboa Studio",
                    startDate: nextMonth.toISOString().split('T')[0],
                    endDate: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    addressVisibleAfterPayment: true,
                    isActive: true,
                },
                {
                    artistId: daniloArtist.id,
                    city: "São Paulo",
                    country: "Brasil",
                    countryCode: "BR",
                    fullAddress: "Av. Paulista 1000, São Paulo - SP",
                    venueName: "Tattoo Week São Paulo",
                    startDate: twoMonthsAhead.toISOString().split('T')[0],
                    endDate: new Date(twoMonthsAhead.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    addressVisibleAfterPayment: true,
                    isActive: true,
                },
                {
                    artistId: daniloArtist.id,
                    city: "Madrid",
                    country: "Espanha",
                    countryCode: "ES",
                    fullAddress: "Calle Gran Vía 45, 28013 Madrid",
                    venueName: "Madrid Tattoo Convention",
                    startDate: threeMonthsAhead.toISOString().split('T')[0],
                    endDate: new Date(threeMonthsAhead.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    addressVisibleAfterPayment: true,
                    isActive: true,
                },
            ]);

            console.log("[seed] Created city schedules for Danilo: Lisboa 🇵🇹, São Paulo 🇧🇷, Madrid 🇪🇸");

            // Create weekly availability for Danilo
            await db.insert(artistAvailability).values([
                { artistId: daniloArtist.id, dayOfWeek: 1, startTime: "10:00", endTime: "18:00", slotDurationMinutes: 120, isActive: true },
                { artistId: daniloArtist.id, dayOfWeek: 2, startTime: "10:00", endTime: "18:00", slotDurationMinutes: 120, isActive: true },
                { artistId: daniloArtist.id, dayOfWeek: 3, startTime: "10:00", endTime: "18:00", slotDurationMinutes: 120, isActive: true },
                { artistId: daniloArtist.id, dayOfWeek: 4, startTime: "10:00", endTime: "18:00", slotDurationMinutes: 120, isActive: true },
                { artistId: daniloArtist.id, dayOfWeek: 5, startTime: "10:00", endTime: "16:00", slotDurationMinutes: 120, isActive: true },
                { artistId: daniloArtist.id, dayOfWeek: 6, startTime: "11:00", endTime: "15:00", slotDurationMinutes: 120, isActive: true },
            ]);

            console.log("[seed] Created availability schedule for Danilo (Mon-Sat)");

        } else {
            console.log("[seed] Danilo Santos already exists, skipping artist seed");
        }

    } catch (error: any) {
        // If user already exists, ignore
        if (error?.code === "23505") {
            console.log("[seed] Data already exists, skipping seed");
            return;
        }
        console.error("[seed] Error seeding data:", error.message);
    }
}
