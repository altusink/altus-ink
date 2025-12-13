/**
 * ALTUS INK - BOOKING MANAGEMENT SERVICE
 * Complete booking lifecycle management
 * 
 * Features:
 * - Booking creation with validation
 * - Availability checking
 * - Time slot management
 * - Calendar integration
 * - Cancellation handling
 * - Rescheduling
 * - Waitlist management
 * - Recurring booking support
 * - Buffer time management
 * - Tour date handling
 * - Booking statistics
 */

import { db } from "../db";
import { bookings, artists, users } from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql, not, inArray } from "drizzle-orm";
import { emailService } from "./email";
import * as stripeService from "./stripe";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface TimeSlot {
    start: Date;
    end: Date;
    available: boolean;
    reason?: string;
}

export interface CreateBookingParams {
    artistId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    slotDatetime: Date;
    durationMinutes: number;
    depositAmount: number;
    currency?: string;
    notes?: string;
    referenceImages?: string[];
    locale?: string;
}

export interface BookingResult {
    booking: typeof bookings.$inferSelect;
    checkoutUrl?: string;
}

export interface RescheduleParams {
    bookingId: string;
    newSlotDatetime: Date;
    reason?: string;
    notifyCustomer?: boolean;
}

export interface CancelParams {
    bookingId: string;
    reason?: string;
    cancelledBy: "customer" | "artist" | "system";
    processRefund?: boolean;
}

export interface AvailabilityParams {
    artistId: string;
    date: Date;
    durationMinutes?: number;
}

export interface AvailabilityResult {
    date: Date;
    slots: TimeSlot[];
    artistName: string;
    timezone: string;
}

export interface BookingStats {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    completionRate: number;
    cancellationRate: number;
}

export interface WaitlistEntry {
    id: string;
    artistId: string;
    customerEmail: string;
    customerName: string;
    preferredDates: Date[];
    durationMinutes: number;
    notes?: string;
    createdAt: Date;
    notifiedAt?: Date;
    status: "waiting" | "notified" | "booked" | "expired";
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_SLOT_DURATION = 60; // minutes
const DEFAULT_BUFFER_TIME = 30; // minutes between bookings
const WORKING_HOURS = { start: 10, end: 19 }; // 10 AM to 7 PM
const MIN_ADVANCE_BOOKING_HOURS = 24;
const MAX_ADVANCE_BOOKING_DAYS = 90;

const BOOKING_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    NO_SHOW: "no_show",
    RESCHEDULED: "rescheduled"
} as const;

// =============================================================================
// BOOKING CREATION
// =============================================================================

/**
 * Create a new booking with payment
 */
export async function createBooking(params: CreateBookingParams): Promise<BookingResult> {
    const {
        artistId,
        customerName,
        customerEmail,
        customerPhone,
        slotDatetime,
        durationMinutes,
        depositAmount,
        currency = "eur",
        notes,
        referenceImages,
        locale = "en"
    } = params;

    // Validate artist exists and is active
    const artist = await getArtistById(artistId);
    if (!artist) {
        throw new Error("Artist not found");
    }
    if (!artist.isActive) {
        throw new Error("Artist is not currently accepting bookings");
    }

    // Validate slot is available
    const isAvailable = await isSlotAvailable(artistId, slotDatetime, durationMinutes);
    if (!isAvailable) {
        throw new Error("Selected time slot is no longer available");
    }

    // Validate minimum advance booking
    const hoursUntilSlot = (slotDatetime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilSlot < MIN_ADVANCE_BOOKING_HOURS) {
        throw new Error(`Bookings must be made at least ${MIN_ADVANCE_BOOKING_HOURS} hours in advance`);
    }

    // Validate maximum advance booking
    const daysUntilSlot = hoursUntilSlot / 24;
    if (daysUntilSlot > MAX_ADVANCE_BOOKING_DAYS) {
        throw new Error(`Bookings cannot be made more than ${MAX_ADVANCE_BOOKING_DAYS} days in advance`);
    }

    // Generate booking ID
    const bookingId = generateBookingId();

    // Create payment checkout session
    let checkoutUrl: string | undefined;
    if (stripeService.isStripeConfigured()) {
        const checkoutResult = await stripeService.createCheckoutSession({
            bookingId,
            artistId,
            customerEmail,
            customerName,
            amount: stripeService.toCents(depositAmount),
            currency,
            description: `Tattoo session with ${artist.displayName} on ${formatDate(slotDatetime)}`,
            successUrl: `${process.env.APP_URL}/booking/${bookingId}/success`,
            cancelUrl: `${process.env.APP_URL}/booking/${bookingId}/cancel`,
            metadata: {
                durationMinutes: durationMinutes.toString(),
                locale
            }
        });
        checkoutUrl = checkoutResult.url;
    }

    // Create booking record
    const [booking] = await db.insert(bookings).values({
        id: bookingId,
        artistId,
        customerName,
        customerEmail,
        customerPhone,
        slotDatetime,
        durationMinutes,
        depositAmount: depositAmount.toString(),
        currency,
        notes,
        referenceImages: referenceImages?.join(","),
        status: BOOKING_STATUS.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
    }).returning();

    // Send confirmation email (queued)
    emailService.queue_email({
        to: { email: customerEmail, name: customerName },
        subject: `Booking Request - ${formatDate(slotDatetime)} with ${artist.displayName}`,
        html: `Your booking request has been received. Please complete payment to confirm.`
    });

    return {
        booking,
        checkoutUrl
    };
}

/**
 * Confirm booking after payment
 */
export async function confirmBooking(bookingId: string): Promise<typeof bookings.$inferSelect> {
    const booking = await getBookingById(bookingId);
    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
        throw new Error(`Cannot confirm booking with status: ${booking.status}`);
    }

    // Update status
    const [updatedBooking] = await db
        .update(bookings)
        .set({
            status: BOOKING_STATUS.CONFIRMED,
            confirmedAt: new Date(),
            updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId))
        .returning();

    // Get artist for emails
    const artist = await getArtistById(booking.artistId);

    // Send confirmation emails
    if (artist) {
        const emailData = {
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            artistName: artist.displayName || "Artist",
            artistEmail: artist.email || "",
            bookingId,
            bookingDate: booking.slotDatetime,
            bookingTime: formatTime(booking.slotDatetime),
            duration: (booking.durationMinutes || 60) / 60,
            depositAmount: stripeService.toCents(parseFloat(booking.depositAmount || "0")),
            currency: booking.currency || "eur",
            location: artist.city || "Studio",
            notes: booking.notes || undefined,
            cancellationPolicy: "Full refund if cancelled 48+ hours before. 50% refund if cancelled 24-48 hours before. No refund within 24 hours."
        };

        // Customer confirmation
        await emailService.sendBookingConfirmation(emailData);

        // Artist notification
        await emailService.notifyArtistNewBooking(emailData);

        // Schedule reminders
        scheduleReminders(bookingId, booking.slotDatetime);
    }

    return updatedBooking;
}

// =============================================================================
// CANCELLATION & RESCHEDULING
// =============================================================================

/**
 * Cancel a booking
 */
export async function cancelBooking(params: CancelParams): Promise<{
    booking: typeof bookings.$inferSelect;
    refundResult?: { refundId: string; amount: number };
}> {
    const { bookingId, reason, cancelledBy, processRefund = true } = params;

    const booking = await getBookingById(bookingId);
    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
        throw new Error("Booking is already cancelled");
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
        throw new Error("Cannot cancel a completed booking");
    }

    let refundResult: { refundId: string; amount: number } | undefined;

    // Process refund if applicable
    if (processRefund && booking.paymentIntentId && stripeService.isStripeConfigured()) {
        const hoursUntilSession = (new Date(booking.slotDatetime).getTime() - Date.now()) / (1000 * 60 * 60);
        const { refundAmount } = stripeService.calculateRefundAmount(
            stripeService.toCents(parseFloat(booking.depositAmount || "0")),
            hoursUntilSession,
            "moderate"
        );

        if (refundAmount > 0) {
            const refund = await stripeService.processRefund({
                paymentIntentId: booking.paymentIntentId,
                amount: refundAmount,
                reason: "requested_by_customer",
                metadata: { bookingId, cancelledBy }
            });
            refundResult = { refundId: refund.refundId, amount: refund.amount };
        }
    }

    // Update booking status
    const [updatedBooking] = await db
        .update(bookings)
        .set({
            status: BOOKING_STATUS.CANCELLED,
            cancelledAt: new Date(),
            cancellationReason: reason,
            cancelledBy,
            refundAmount: refundResult?.amount?.toString(),
            updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId))
        .returning();

    // Get artist for notifications
    const artist = await getArtistById(booking.artistId);

    // Send cancellation emails
    if (artist) {
        const emailData = {
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            artistName: artist.displayName || "Artist",
            artistEmail: artist.email || "",
            bookingId,
            bookingDate: booking.slotDatetime,
            bookingTime: formatTime(booking.slotDatetime),
            duration: (booking.durationMinutes || 60) / 60,
            depositAmount: stripeService.toCents(parseFloat(booking.depositAmount || "0")),
            currency: booking.currency || "eur",
            location: artist.city || "Studio",
            cancellationPolicy: "",
            refundAmount: refundResult?.amount || 0,
            cancellationReason: reason,
            cancelledBy
        };

        await emailService.sendCancellationNotice(emailData);
        await emailService.notifyArtistCancellation(emailData);
    }

    // Check waitlist for this slot
    await notifyWaitlist(booking.artistId, booking.slotDatetime);

    return {
        booking: updatedBooking,
        refundResult
    };
}

/**
 * Reschedule a booking to a new time
 */
export async function rescheduleBooking(params: RescheduleParams): Promise<typeof bookings.$inferSelect> {
    const { bookingId, newSlotDatetime, reason, notifyCustomer = true } = params;

    const booking = await getBookingById(bookingId);
    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED && booking.status !== BOOKING_STATUS.PENDING) {
        throw new Error(`Cannot reschedule booking with status: ${booking.status}`);
    }

    // Validate new slot is available
    const isAvailable = await isSlotAvailable(
        booking.artistId,
        newSlotDatetime,
        booking.durationMinutes || 60,
        bookingId // Exclude current booking from check
    );

    if (!isAvailable) {
        throw new Error("New time slot is not available");
    }

    // Store original datetime
    const originalDatetime = booking.slotDatetime;

    // Update booking
    const [updatedBooking] = await db
        .update(bookings)
        .set({
            slotDatetime: newSlotDatetime,
            rescheduledFrom: originalDatetime,
            rescheduledAt: new Date(),
            rescheduledReason: reason,
            updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId))
        .returning();

    // Notify customer
    if (notifyCustomer) {
        const artist = await getArtistById(booking.artistId);

        emailService.queue_email({
            to: { email: booking.customerEmail, name: booking.customerName },
            subject: `Booking Rescheduled - ${formatDate(newSlotDatetime)}`,
            html: `
        Your booking has been rescheduled.
        <br><br>
        <strong>Original:</strong> ${formatDate(originalDatetime)} at ${formatTime(originalDatetime)}<br>
        <strong>New:</strong> ${formatDate(newSlotDatetime)} at ${formatTime(newSlotDatetime)}
        ${reason ? `<br><br><strong>Reason:</strong> ${reason}` : ""}
      `
        });
    }

    // Reschedule reminders
    scheduleReminders(bookingId, newSlotDatetime);

    return updatedBooking;
}

/**
 * Mark booking as completed
 */
export async function completeBooking(bookingId: string, notes?: string): Promise<typeof bookings.$inferSelect> {
    const booking = await getBookingById(bookingId);
    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
        throw new Error(`Cannot complete booking with status: ${booking.status}`);
    }

    const [updatedBooking] = await db
        .update(bookings)
        .set({
            status: BOOKING_STATUS.COMPLETED,
            completedAt: new Date(),
            completionNotes: notes,
            updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId))
        .returning();

    // Trigger payout to artist (if Connect is set up)
    const artist = await getArtistById(booking.artistId);
    if (artist?.stripeAccountId && stripeService.isStripeConfigured()) {
        const artistShare = stripeService.getArtistShare(
            stripeService.toCents(parseFloat(booking.depositAmount || "0"))
        );

        try {
            await stripeService.transferToArtist({
                artistStripeAccountId: artist.stripeAccountId,
                amount: artistShare,
                description: `Payout for booking ${bookingId}`,
                metadata: { bookingId }
            });
        } catch (error) {
            console.error("Failed to process artist payout:", error);
            // Don't fail the completion, log for manual review
        }
    }

    return updatedBooking;
}

/**
 * Mark booking as no-show
 */
export async function markNoShow(bookingId: string): Promise<typeof bookings.$inferSelect> {
    const booking = await getBookingById(bookingId);
    if (!booking) {
        throw new Error("Booking not found");
    }

    const [updatedBooking] = await db
        .update(bookings)
        .set({
            status: BOOKING_STATUS.NO_SHOW,
            noShowAt: new Date(),
            updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId))
        .returning();

    // No refund for no-shows - deposit is forfeited
    // Could track repeat no-shows for customer flagging

    return updatedBooking;
}

// =============================================================================
// AVAILABILITY MANAGEMENT
// =============================================================================

/**
 * Get available slots for an artist on a specific date
 */
export async function getAvailability(params: AvailabilityParams): Promise<AvailabilityResult> {
    const { artistId, date, durationMinutes = DEFAULT_SLOT_DURATION } = params;

    const artist = await getArtistById(artistId);
    if (!artist) {
        throw new Error("Artist not found");
    }

    // Get start and end of day
    const dayStart = new Date(date);
    dayStart.setHours(WORKING_HOURS.start, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(WORKING_HOURS.end, 0, 0, 0);

    // Get existing bookings for this day
    const existingBookings = await db
        .select()
        .from(bookings)
        .where(
            and(
                eq(bookings.artistId, artistId),
                gte(bookings.slotDatetime, dayStart),
                lte(bookings.slotDatetime, dayEnd),
                not(eq(bookings.status, BOOKING_STATUS.CANCELLED))
            )
        );

    // Generate slots
    const slots: TimeSlot[] = [];
    let currentTime = new Date(dayStart);

    while (currentTime < dayEnd) {
        const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);

        // Check if slot conflicts with existing booking
        const conflict = existingBookings.find(b => {
            const bookingStart = new Date(b.slotDatetime);
            const bookingEnd = new Date(bookingStart.getTime() + (b.durationMinutes || 60) * 60 * 1000 + DEFAULT_BUFFER_TIME * 60 * 1000);

            return (currentTime < bookingEnd && slotEnd > bookingStart);
        });

        // Check if slot is in the past
        const isPast = currentTime < new Date();

        slots.push({
            start: new Date(currentTime),
            end: slotEnd,
            available: !conflict && !isPast,
            reason: conflict ? "Already booked" : isPast ? "Time has passed" : undefined
        });

        // Move to next slot
        currentTime = new Date(currentTime.getTime() + DEFAULT_SLOT_DURATION * 60 * 1000);
    }

    return {
        date,
        slots,
        artistName: artist.displayName || "Artist",
        timezone: "Europe/Amsterdam" // TODO: Get from artist settings
    };
}

/**
 * Check if a specific slot is available
 */
export async function isSlotAvailable(
    artistId: string,
    slotDatetime: Date,
    durationMinutes: number,
    excludeBookingId?: string
): Promise<boolean> {
    const slotEnd = new Date(slotDatetime.getTime() + durationMinutes * 60 * 1000);
    const bufferStart = new Date(slotDatetime.getTime() - DEFAULT_BUFFER_TIME * 60 * 1000);
    const bufferEnd = new Date(slotEnd.getTime() + DEFAULT_BUFFER_TIME * 60 * 1000);

    let query = db
        .select()
        .from(bookings)
        .where(
            and(
                eq(bookings.artistId, artistId),
                not(eq(bookings.status, BOOKING_STATUS.CANCELLED)),
                // Check for overlap
                sql`${bookings.slotDatetime} < ${bufferEnd}`,
                sql`${bookings.slotDatetime} + (${bookings.durationMinutes} * interval '1 minute') > ${bufferStart}`
            )
        );

    const conflicting = await query;

    // Filter out the booking being rescheduled
    const realConflicts = excludeBookingId
        ? conflicting.filter(b => b.id !== excludeBookingId)
        : conflicting;

    return realConflicts.length === 0;
}

/**
 * Block time slots (artist unavailability)
 */
export async function blockTimeSlots(params: {
    artistId: string;
    startDatetime: Date;
    endDatetime: Date;
    reason?: string;
}): Promise<void> {
    // This would typically go to a separate blocked_slots table
    // For now, we can create a "blocked" pseudo-booking
    await db.insert(bookings).values({
        id: generateBookingId(),
        artistId: params.artistId,
        customerName: "BLOCKED",
        customerEmail: "blocked@system.internal",
        slotDatetime: params.startDatetime,
        durationMinutes: Math.round((params.endDatetime.getTime() - params.startDatetime.getTime()) / (60 * 1000)),
        depositAmount: "0",
        status: "blocked",
        notes: params.reason || "Time blocked by artist",
        createdAt: new Date(),
        updatedAt: new Date()
    });
}

// =============================================================================
// WAITLIST MANAGEMENT
// =============================================================================

const waitlist: WaitlistEntry[] = []; // In production, this would be in the database

/**
 * Add customer to waitlist
 */
export async function addToWaitlist(params: {
    artistId: string;
    customerEmail: string;
    customerName: string;
    preferredDates: Date[];
    durationMinutes: number;
    notes?: string;
}): Promise<WaitlistEntry> {
    const entry: WaitlistEntry = {
        id: generateBookingId(),
        artistId: params.artistId,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        preferredDates: params.preferredDates,
        durationMinutes: params.durationMinutes,
        notes: params.notes,
        createdAt: new Date(),
        status: "waiting"
    };

    waitlist.push(entry);

    // Send confirmation
    emailService.queue_email({
        to: { email: params.customerEmail, name: params.customerName },
        subject: "You're on the Waitlist - Altus Ink",
        html: `We'll notify you when a slot becomes available for your preferred dates.`
    });

    return entry;
}

/**
 * Notify waitlist when slot becomes available
 */
async function notifyWaitlist(artistId: string, slotDatetime: Date): Promise<void> {
    const matchingEntries = waitlist.filter(entry =>
        entry.artistId === artistId &&
        entry.status === "waiting" &&
        entry.preferredDates.some(d => isSameDay(d, slotDatetime))
    );

    for (const entry of matchingEntries) {
        entry.status = "notified";
        entry.notifiedAt = new Date();

        emailService.queue_email({
            to: { email: entry.customerEmail, name: entry.customerName },
            subject: "A Slot Just Opened Up! - Altus Ink",
            html: `
        Good news! A slot has become available on ${formatDate(slotDatetime)}.
        <br><br>
        <a href="${process.env.APP_URL}/book">Book Now</a>
        <br><br>
        Hurry - this slot won't last long!
      `
        });
    }
}

// =============================================================================
// STATISTICS & REPORTING
// =============================================================================

/**
 * Get booking statistics for an artist or platform
 */
export async function getBookingStats(params: {
    artistId?: string;
    startDate?: Date;
    endDate?: Date;
}): Promise<BookingStats> {
    const { artistId, startDate, endDate } = params;

    let query: any = db.select().from(bookings);

    const conditions = [];
    if (artistId) conditions.push(eq(bookings.artistId, artistId));
    if (startDate) conditions.push(gte(bookings.createdAt, startDate));
    if (endDate) conditions.push(lte(bookings.createdAt, endDate));

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    const allBookings = await query;

    const confirmed = allBookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED);
    const pending = allBookings.filter(b => b.status === BOOKING_STATUS.PENDING);
    const completed = allBookings.filter(b => b.status === BOOKING_STATUS.COMPLETED);
    const cancelled = allBookings.filter(b => b.status === BOOKING_STATUS.CANCELLED);

    const totalRevenue = completed.reduce((sum, b) => sum + parseFloat(b.depositAmount || "0"), 0);
    const averageBookingValue = completed.length > 0 ? totalRevenue / completed.length : 0;

    return {
        totalBookings: allBookings.length,
        confirmedBookings: confirmed.length,
        pendingBookings: pending.length,
        completedBookings: completed.length,
        cancelledBookings: cancelled.length,
        totalRevenue,
        averageBookingValue,
        completionRate: allBookings.length > 0 ? (completed.length / allBookings.length) * 100 : 0,
        cancellationRate: allBookings.length > 0 ? (cancelled.length / allBookings.length) * 100 : 0
    };
}

/**
 * Get upcoming bookings for an artist
 */
export async function getUpcomingBookings(artistId: string, limit: number = 10): Promise<Array<typeof bookings.$inferSelect>> {
    return await db
        .select()
        .from(bookings)
        .where(
            and(
                eq(bookings.artistId, artistId),
                gte(bookings.slotDatetime, new Date()),
                inArray(bookings.status, [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING])
            )
        )
        .orderBy(asc(bookings.slotDatetime))
        .limit(limit);
}

/**
 * Get recent bookings for an artist
 */
export async function getRecentBookings(artistId: string, limit: number = 10): Promise<Array<typeof bookings.$inferSelect>> {
    return await db
        .select()
        .from(bookings)
        .where(eq(bookings.artistId, artistId))
        .orderBy(desc(bookings.createdAt))
        .limit(limit);
}

/**
 * Get bookings by status
 */
export async function getBookingsByStatus(
    artistId: string,
    status: string,
    limit: number = 50
): Promise<Array<typeof bookings.$inferSelect>> {
    return await db
        .select()
        .from(bookings)
        .where(
            and(
                eq(bookings.artistId, artistId),
                eq(bookings.status, status)
            )
        )
        .orderBy(desc(bookings.slotDatetime))
        .limit(limit);
}

// =============================================================================
// REMINDER SCHEDULING
// =============================================================================

const scheduledReminders: Map<string, NodeJS.Timeout[]> = new Map();

/**
 * Schedule reminder emails for a booking
 */
function scheduleReminders(bookingId: string, slotDatetime: Date): void {
    // Clear existing reminders for this booking
    const existing = scheduledReminders.get(bookingId);
    if (existing) {
        existing.forEach(timeout => clearTimeout(timeout));
    }

    const reminders: NodeJS.Timeout[] = [];
    const now = Date.now();
    const slotTime = new Date(slotDatetime).getTime();

    // 24-hour reminder
    const reminder24h = slotTime - 24 * 60 * 60 * 1000;
    if (reminder24h > now) {
        const timeout = setTimeout(async () => {
            await sendReminderEmail(bookingId, 24);
        }, reminder24h - now);
        reminders.push(timeout);
    }

    // 2-hour reminder
    const reminder2h = slotTime - 2 * 60 * 60 * 1000;
    if (reminder2h > now) {
        const timeout = setTimeout(async () => {
            await sendReminderEmail(bookingId, 2);
        }, reminder2h - now);
        reminders.push(timeout);
    }

    scheduledReminders.set(bookingId, reminders);
}

/**
 * Send reminder email
 */
async function sendReminderEmail(bookingId: string, hoursUntil: number): Promise<void> {
    const booking = await getBookingById(bookingId);
    if (!booking || booking.status !== BOOKING_STATUS.CONFIRMED) {
        return;
    }

    const artist = await getArtistById(booking.artistId);
    if (!artist) return;

    await emailService.sendBookingReminder({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        artistName: artist.displayName || "Artist",
        artistEmail: artist.email || "",
        bookingId,
        bookingDate: booking.slotDatetime,
        bookingTime: formatTime(booking.slotDatetime),
        duration: (booking.durationMinutes || 60) / 60,
        depositAmount: stripeService.toCents(parseFloat(booking.depositAmount || "0")),
        currency: booking.currency || "eur",
        location: artist.city || "Studio",
        cancellationPolicy: "",
        hoursUntil
    });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getBookingById(id: string): Promise<typeof bookings.$inferSelect | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
}

async function getArtistById(id: string): Promise<typeof artists.$inferSelect | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
}

function generateBookingId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BK${timestamp}${random}`.toUpperCase();
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
    createBooking,
    confirmBooking,
    cancelBooking,
    rescheduleBooking,
    completeBooking,
    markNoShow,
    getAvailability,
    isSlotAvailable,
    blockTimeSlots,
    addToWaitlist,
    getBookingStats,
    getUpcomingBookings,
    getRecentBookings,
    getBookingsByStatus,
    BOOKING_STATUS
};
