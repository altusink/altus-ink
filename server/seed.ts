/**
 * Seed script to create initial admin user if none exists
 */
import { db } from "./db";
import { users } from "@shared/schema";
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
            console.log("[seed] CEO user already exists, skipping seed");
            return;
        }

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

        // Also create a sample artist user
        const artistPassword = await bcrypt.hash("artist123", 10);

        await db.insert(users).values({
            email: "artist@altusink.com",
            username: "artist",
            password: artistPassword,
            firstName: "Demo",
            lastName: "Artist",
            role: "artist",
            isActive: true,
        });

        console.log("[seed] Created sample artist user:");
        console.log("  Username: artist");
        console.log("  Password: artist123");

    } catch (error: any) {
        // If table doesn't exist or user already exists, ignore
        if (error?.code === "23505") {
            console.log("[seed] Users already exist, skipping seed");
            return;
        }
        console.error("[seed] Error seeding data:", error.message);
    }
}
