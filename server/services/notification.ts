/**
 * ALTUS INK - NOTIFICATION SERVICE
 * Enterprise notification system with multi-channel support
 * 
 * Features:
 * - Email notifications
 * - SMS notifications
 * - Push notifications
 * - In-app notifications
 * - WhatsApp notifications
 * - Slack integrations
 * - Notification preferences
 * - Templates
 * - Scheduling
 * - Rate limiting
 * - Analytics
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    body: string;
    data?: Record<string, any>;
    status: NotificationStatus;
    priority: NotificationPriority;
    scheduledAt?: Date;
    sentAt?: Date;
    readAt?: Date;
    clickedAt?: Date;
    errorMessage?: string;
    retryCount: number;
    createdAt: Date;
}

export type NotificationType =
    | "booking_confirmed"
    | "booking_reminder"
    | "booking_cancelled"
    | "booking_rescheduled"
    | "booking_completed"
    | "payment_received"
    | "payment_failed"
    | "refund_processed"
    | "payout_sent"
    | "payout_pending"
    | "review_received"
    | "review_reminder"
    | "artist_message"
    | "customer_message"
    | "new_artist_signup"
    | "artist_verified"
    | "system_alert"
    | "marketing"
    | "promotional";

export type NotificationChannel =
    | "email"
    | "sms"
    | "push"
    | "in_app"
    | "whatsapp"
    | "slack";

export type NotificationStatus =
    | "pending"
    | "scheduled"
    | "sending"
    | "sent"
    | "delivered"
    | "read"
    | "clicked"
    | "failed"
    | "bounced";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface NotificationTemplate {
    id: string;
    type: NotificationType;
    channel: NotificationChannel;
    locale: string;
    subject?: string;
    title: string;
    body: string;
    htmlBody?: string;
    variables: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationPreferences {
    userId: string;
    email: ChannelPreferences;
    sms: ChannelPreferences;
    push: ChannelPreferences;
    inApp: ChannelPreferences;
    whatsapp: ChannelPreferences;
    slack: ChannelPreferences;
    quietHours?: QuietHours;
    updatedAt: Date;
}

export interface ChannelPreferences {
    enabled: boolean;
    types: Record<NotificationType, boolean>;
    frequency?: "instant" | "daily_digest" | "weekly_digest";
}

export interface QuietHours {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
    timezone: string;
    excludeUrgent: boolean;
}

export interface NotificationPayload {
    userId: string;
    type: NotificationType;
    channels?: NotificationChannel[];
    priority?: NotificationPriority;
    data: Record<string, any>;
    scheduledAt?: Date;
    locale?: string;
}

export interface SendResult {
    notificationId: string;
    channel: NotificationChannel;
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface NotificationStats {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    failed: number;
    byChannel: Record<NotificationChannel, {
        sent: number;
        delivered: number;
        failed: number;
    }>;
    byType: Record<NotificationType, number>;
}

export interface DeviceToken {
    userId: string;
    token: string;
    platform: "ios" | "android" | "web";
    createdAt: Date;
    lastUsedAt: Date;
}

// =============================================================================
// NOTIFICATION TEMPLATES
// =============================================================================

const DEFAULT_TEMPLATES: Omit<NotificationTemplate, "id" | "createdAt" | "updatedAt">[] = [
    // Booking Confirmed
    {
        type: "booking_confirmed",
        channel: "email",
        locale: "en",
        subject: "Your tattoo session is confirmed! 🎨",
        title: "Booking Confirmed",
        body: "Hi {{customerName}}, your session with {{artistName}} on {{date}} at {{time}} is confirmed. Deposit: €{{depositAmount}}",
        htmlBody: `
      <h1>Your Booking is Confirmed! 🎨</h1>
      <p>Hi {{customerName}},</p>
      <p>Great news! Your tattoo session is confirmed.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Artist:</strong> {{artistName}}</p>
        <p><strong>Date:</strong> {{date}}</p>
        <p><strong>Time:</strong> {{time}}</p>
        <p><strong>Location:</strong> {{location}}</p>
        <p><strong>Deposit Paid:</strong> €{{depositAmount}}</p>
      </div>
      <p>Please arrive 10 minutes early. Remember to stay hydrated and avoid alcohol 24 hours before your session.</p>
      <a href="{{bookingUrl}}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Booking</a>
    `,
        variables: ["customerName", "artistName", "date", "time", "location", "depositAmount", "bookingUrl"],
        isActive: true
    },
    {
        type: "booking_confirmed",
        channel: "sms",
        locale: "en",
        title: "Booking Confirmed",
        body: "✅ Altus Ink: Your session with {{artistName}} on {{date}} at {{time}} is confirmed. Deposit: €{{depositAmount}}. See you soon!",
        variables: ["artistName", "date", "time", "depositAmount"],
        isActive: true
    },
    {
        type: "booking_confirmed",
        channel: "push",
        locale: "en",
        title: "Booking Confirmed! 🎨",
        body: "Your session with {{artistName}} on {{date}} is confirmed",
        variables: ["artistName", "date"],
        isActive: true
    },

    // Booking Reminder 24h
    {
        type: "booking_reminder",
        channel: "email",
        locale: "en",
        subject: "Reminder: Your tattoo session is tomorrow! ⏰",
        title: "Booking Reminder",
        body: "Hi {{customerName}}, just a reminder that your tattoo session with {{artistName}} is tomorrow at {{time}}.",
        htmlBody: `
      <h1>Your Session is Tomorrow! ⏰</h1>
      <p>Hi {{customerName}},</p>
      <p>This is a friendly reminder about your upcoming tattoo session.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Artist:</strong> {{artistName}}</p>
        <p><strong>Date:</strong> {{date}}</p>
        <p><strong>Time:</strong> {{time}}</p>
        <p><strong>Location:</strong> {{location}}</p>
      </div>
      <h3>Preparation Tips:</h3>
      <ul>
        <li>Get a good night's sleep</li>
        <li>Eat a healthy meal before your session</li>
        <li>Stay hydrated</li>
        <li>Avoid alcohol 24 hours before</li>
        <li>Wear comfortable, loose-fitting clothes</li>
      </ul>
      <a href="{{bookingUrl}}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Booking</a>
    `,
        variables: ["customerName", "artistName", "date", "time", "location", "bookingUrl"],
        isActive: true
    },
    {
        type: "booking_reminder",
        channel: "sms",
        locale: "en",
        title: "Booking Reminder",
        body: "⏰ Altus Ink: Reminder! Your session with {{artistName}} is tomorrow at {{time}}. {{location}}. Stay hydrated!",
        variables: ["artistName", "time", "location"],
        isActive: true
    },
    {
        type: "booking_reminder",
        channel: "push",
        locale: "en",
        title: "Session Tomorrow! ⏰",
        body: "Your tattoo session with {{artistName}} is tomorrow at {{time}}",
        variables: ["artistName", "time"],
        isActive: true
    },

    // Booking Cancelled
    {
        type: "booking_cancelled",
        channel: "email",
        locale: "en",
        subject: "Your booking has been cancelled",
        title: "Booking Cancelled",
        body: "Hi {{customerName}}, your booking on {{date}} has been cancelled. Refund: €{{refundAmount}}",
        htmlBody: `
      <h1>Booking Cancelled</h1>
      <p>Hi {{customerName}},</p>
      <p>Your tattoo session has been cancelled.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Original Date:</strong> {{date}}</p>
        <p><strong>Artist:</strong> {{artistName}}</p>
        <p><strong>Reason:</strong> {{reason}}</p>
        {{#if refundAmount}}
        <p><strong>Refund Amount:</strong> €{{refundAmount}}</p>
        {{/if}}
      </div>
      {{#if refundAmount}}
      <p>Your refund will be processed within 5-10 business days.</p>
      {{/if}}
      <a href="{{rebookUrl}}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Again</a>
    `,
        variables: ["customerName", "date", "artistName", "reason", "refundAmount", "rebookUrl"],
        isActive: true
    },

    // Payment Received
    {
        type: "payment_received",
        channel: "email",
        locale: "en",
        subject: "Payment received - €{{amount}}",
        title: "Payment Received",
        body: "Hi {{customerName}}, we've received your payment of €{{amount}} for your booking on {{date}}.",
        htmlBody: `
      <h1>Payment Received ✅</h1>
      <p>Hi {{customerName}},</p>
      <p>Thank you for your payment!</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> €{{amount}}</p>
        <p><strong>Booking Date:</strong> {{date}}</p>
        <p><strong>Transaction ID:</strong> {{transactionId}}</p>
      </div>
      <a href="{{receiptUrl}}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Receipt</a>
    `,
        variables: ["customerName", "amount", "date", "transactionId", "receiptUrl"],
        isActive: true
    },

    // Artist: New Booking
    {
        type: "booking_confirmed",
        channel: "email",
        locale: "en",
        subject: "New booking request! 🎉",
        title: "New Booking",
        body: "Hi {{artistName}}, you have a new booking from {{customerName}} on {{date}} at {{time}}.",
        htmlBody: `
      <h1>New Booking! 🎉</h1>
      <p>Hi {{artistName}},</p>
      <p>You have a new booking request!</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Customer:</strong> {{customerName}}</p>
        <p><strong>Email:</strong> {{customerEmail}}</p>
        <p><strong>Phone:</strong> {{customerPhone}}</p>
        <p><strong>Date:</strong> {{date}}</p>
        <p><strong>Time:</strong> {{time}}</p>
        <p><strong>Duration:</strong> {{duration}} hours</p>
        <p><strong>Deposit:</strong> €{{depositAmount}}</p>
      </div>
      {{#if notes}}
      <p><strong>Notes:</strong> {{notes}}</p>
      {{/if}}
      <a href="{{dashboardUrl}}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Dashboard</a>
    `,
        variables: ["artistName", "customerName", "customerEmail", "customerPhone", "date", "time", "duration", "depositAmount", "notes", "dashboardUrl"],
        isActive: true
    },

    // Payout Sent
    {
        type: "payout_sent",
        channel: "email",
        locale: "en",
        subject: "Payout processed - €{{amount}}",
        title: "Payout Sent",
        body: "Hi {{artistName}}, your payout of €{{amount}} has been sent to your account.",
        htmlBody: `
      <h1>Payout Processed! 💰</h1>
      <p>Hi {{artistName}},</p>
      <p>Great news! Your payout has been processed.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> €{{amount}}</p>
        <p><strong>Period:</strong> {{period}}</p>
        <p><strong>Bookings:</strong> {{bookingsCount}}</p>
        <p><strong>Expected Arrival:</strong> {{arrivalDate}}</p>
      </div>
      <a href="{{earningsUrl}}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Earnings</a>
    `,
        variables: ["artistName", "amount", "period", "bookingsCount", "arrivalDate", "earningsUrl"],
        isActive: true
    },

    // Review Received
    {
        type: "review_received",
        channel: "email",
        locale: "en",
        subject: "You received a {{rating}}-star review! ⭐",
        title: "New Review",
        body: "Hi {{artistName}}, {{customerName}} left you a {{rating}}-star review!",
        htmlBody: `
      <h1>New Review! ⭐</h1>
      <p>Hi {{artistName}},</p>
      <p>You received a new review from {{customerName}}.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Rating:</strong> {{rating}}/5 ⭐</p>
        {{#if comment}}
        <p><strong>Comment:</strong> "{{comment}}"</p>
        {{/if}}
      </div>
      <a href="{{reviewsUrl}}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Reviews</a>
    `,
        variables: ["artistName", "customerName", "rating", "comment", "reviewsUrl"],
        isActive: true
    }
];

// Portuguese translations
const PT_TEMPLATES: Omit<NotificationTemplate, "id" | "createdAt" | "updatedAt">[] = [
    {
        type: "booking_confirmed",
        channel: "email",
        locale: "pt",
        subject: "A sua sessão de tatuagem está confirmada! 🎨",
        title: "Reserva Confirmada",
        body: "Olá {{customerName}}, a sua sessão com {{artistName}} em {{date}} às {{time}} está confirmada. Depósito: €{{depositAmount}}",
        htmlBody: `
      <h1>A Sua Reserva Está Confirmada! 🎨</h1>
      <p>Olá {{customerName}},</p>
      <p>Ótimas notícias! A sua sessão de tatuagem está confirmada.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Artista:</strong> {{artistName}}</p>
        <p><strong>Data:</strong> {{date}}</p>
        <p><strong>Hora:</strong> {{time}}</p>
        <p><strong>Local:</strong> {{location}}</p>
        <p><strong>Depósito Pago:</strong> €{{depositAmount}}</p>
      </div>
      <p>Por favor, chegue 10 minutos mais cedo. Lembre-se de se manter hidratado e evitar álcool 24 horas antes da sessão.</p>
      <a href="{{bookingUrl}}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Ver Reserva</a>
    `,
        variables: ["customerName", "artistName", "date", "time", "location", "depositAmount", "bookingUrl"],
        isActive: true
    },
    {
        type: "booking_reminder",
        channel: "sms",
        locale: "pt",
        title: "Lembrete de Reserva",
        body: "⏰ Altus Ink: Lembrete! A sua sessão com {{artistName}} é amanhã às {{time}}. {{location}}. Mantenha-se hidratado!",
        variables: ["artistName", "time", "location"],
        isActive: true
    }
];

// =============================================================================
// NOTIFICATION SERVICE CLASS
// =============================================================================

export class NotificationService {
    private notifications: Notification[] = [];
    private templates: NotificationTemplate[] = [];
    private preferences: Map<string, NotificationPreferences> = new Map();
    private deviceTokens: DeviceToken[] = [];
    private rateLimits: Map<string, { count: number; resetAt: Date }> = new Map();
    private stats: NotificationStats = {
        sent: 0,
        delivered: 0,
        read: 0,
        clicked: 0,
        failed: 0,
        byChannel: {} as any,
        byType: {} as any
    };

    constructor() {
        this.initializeTemplates();
        this.initializeStats();
        this.startScheduler();
        this.startCleanup();
    }

    private initializeTemplates(): void {
        [...DEFAULT_TEMPLATES, ...PT_TEMPLATES].forEach((template, index) => {
            this.templates.push({
                ...template,
                id: `tpl_${index}`,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });
    }

    private initializeStats(): void {
        const channels: NotificationChannel[] = ["email", "sms", "push", "in_app", "whatsapp", "slack"];
        channels.forEach(channel => {
            this.stats.byChannel[channel] = { sent: 0, delivered: 0, failed: 0 };
        });
    }

    // ===========================================================================
    // SEND NOTIFICATIONS
    // ===========================================================================

    async send(payload: NotificationPayload): Promise<SendResult[]> {
        const results: SendResult[] = [];

        // Get user preferences
        const prefs = this.getPreferences(payload.userId);

        // Determine channels to use
        const channels = payload.channels || this.getDefaultChannels(payload.type, prefs);

        // Check quiet hours
        if (this.isQuietHours(prefs)) {
            if (payload.priority !== "urgent" || !prefs.quietHours?.excludeUrgent) {
                // Schedule for after quiet hours
                const scheduledAt = this.getQuietHoursEnd(prefs);
                return this.schedule({ ...payload, scheduledAt });
            }
        }

        // Send to each channel
        for (const channel of channels) {
            // Check if channel is enabled for this notification type
            if (!this.isChannelEnabled(channel, payload.type, prefs)) {
                continue;
            }

            // Check rate limits
            if (!this.checkRateLimit(payload.userId, channel)) {
                results.push({
                    notificationId: "",
                    channel,
                    success: false,
                    error: "Rate limit exceeded"
                });
                continue;
            }

            // Get template
            const template = this.getTemplate(payload.type, channel, payload.locale || "en");
            if (!template) {
                results.push({
                    notificationId: "",
                    channel,
                    success: false,
                    error: "Template not found"
                });
                continue;
            }

            // Create notification
            const notification = this.createNotification(payload, channel, template);

            // Send notification
            const result = await this.sendToChannel(notification, template, payload.data);
            results.push(result);

            // Update stats
            this.updateStats(channel, payload.type, result.success);
        }

        return results;
    }

    async schedule(payload: NotificationPayload & { scheduledAt: Date }): Promise<SendResult[]> {
        const channels = payload.channels || ["email"];
        const results: SendResult[] = [];

        for (const channel of channels) {
            const template = this.getTemplate(payload.type, channel, payload.locale || "en");
            if (!template) continue;

            const notification = this.createNotification(payload, channel, template);
            notification.status = "scheduled";
            notification.scheduledAt = payload.scheduledAt;

            this.notifications.push(notification);

            results.push({
                notificationId: notification.id,
                channel,
                success: true,
                messageId: notification.id
            });
        }

        return results;
    }

    // ===========================================================================
    // CHANNEL-SPECIFIC SENDING
    // ===========================================================================

    private async sendToChannel(
        notification: Notification,
        template: NotificationTemplate,
        data: Record<string, any>
    ): Promise<SendResult> {
        try {
            notification.status = "sending";

            // Render template
            const rendered = this.renderTemplate(template, data);

            let messageId: string | undefined;

            switch (notification.channel) {
                case "email":
                    messageId = await this.sendEmail(notification, rendered);
                    break;
                case "sms":
                    messageId = await this.sendSMS(notification, rendered);
                    break;
                case "push":
                    messageId = await this.sendPush(notification, rendered);
                    break;
                case "in_app":
                    messageId = this.createInAppNotification(notification, rendered);
                    break;
                case "whatsapp":
                    messageId = await this.sendWhatsApp(notification, rendered, data);
                    break;
                case "slack":
                    messageId = await this.sendSlack(notification, rendered);
                    break;
            }

            notification.status = "sent";
            notification.sentAt = new Date();
            this.notifications.push(notification);

            return {
                notificationId: notification.id,
                channel: notification.channel,
                success: true,
                messageId
            };
        } catch (error) {
            notification.status = "failed";
            notification.errorMessage = error instanceof Error ? error.message : "Unknown error";
            notification.retryCount++;
            this.notifications.push(notification);

            return {
                notificationId: notification.id,
                channel: notification.channel,
                success: false,
                error: notification.errorMessage
            };
        }
    }

    private async sendEmail(notification: Notification, rendered: { subject?: string; body: string; htmlBody?: string }): Promise<string> {
        // Would integrate with email service (SendGrid, Resend, etc.)
        console.log(`[Email] To: ${notification.userId}, Subject: ${rendered.subject}`);
        return `email_${Date.now()}`;
    }

    private async sendSMS(notification: Notification, rendered: { body: string }): Promise<string> {
        // Would integrate with SMS provider (Twilio, etc.)
        console.log(`[SMS] To: ${notification.userId}, Body: ${rendered.body}`);
        return `sms_${Date.now()}`;
    }

    private async sendPush(notification: Notification, rendered: { title: string; body: string }): Promise<string> {
        const tokens = this.deviceTokens.filter(t => t.userId === notification.userId);

        for (const token of tokens) {
            // Would integrate with FCM, APNS, etc.
            console.log(`[Push] Token: ${token.token}, Title: ${rendered.title}`);
        }

        return `push_${Date.now()}`;
    }

    private createInAppNotification(notification: Notification, rendered: { title: string; body: string }): string {
        // Store in-app notification for later retrieval
        notification.title = rendered.title;
        notification.body = rendered.body;
        return notification.id;
    }

    private async sendWhatsApp(
        notification: Notification,
        rendered: { body: string },
        data: Record<string, any>
    ): Promise<string> {
        // Would integrate with WhatsApp Business API
        console.log(`[WhatsApp] To: ${notification.userId}, Body: ${rendered.body}`);
        return `wa_${Date.now()}`;
    }

    private async sendSlack(notification: Notification, rendered: { title: string; body: string }): Promise<string> {
        // Would integrate with Slack API
        console.log(`[Slack] Title: ${rendered.title}, Body: ${rendered.body}`);
        return `slack_${Date.now()}`;
    }

    // ===========================================================================
    // TEMPLATE MANAGEMENT
    // ===========================================================================

    private getTemplate(
        type: NotificationType,
        channel: NotificationChannel,
        locale: string
    ): NotificationTemplate | undefined {
        // Try exact match first
        let template = this.templates.find(
            t => t.type === type && t.channel === channel && t.locale === locale && t.isActive
        );

        // Fallback to English
        if (!template && locale !== "en") {
            template = this.templates.find(
                t => t.type === type && t.channel === channel && t.locale === "en" && t.isActive
            );
        }

        return template;
    }

    private renderTemplate(
        template: NotificationTemplate,
        data: Record<string, any>
    ): { subject?: string; title: string; body: string; htmlBody?: string } {
        const render = (text: string): string => {
            return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                return data[key]?.toString() || "";
            });
        };

        return {
            subject: template.subject ? render(template.subject) : undefined,
            title: render(template.title),
            body: render(template.body),
            htmlBody: template.htmlBody ? render(template.htmlBody) : undefined
        };
    }

    addTemplate(template: Omit<NotificationTemplate, "id" | "createdAt" | "updatedAt">): NotificationTemplate {
        const newTemplate: NotificationTemplate = {
            ...template,
            id: `tpl_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.templates.push(newTemplate);
        return newTemplate;
    }

    updateTemplate(id: string, updates: Partial<NotificationTemplate>): NotificationTemplate | undefined {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) return undefined;

        this.templates[index] = {
            ...this.templates[index],
            ...updates,
            updatedAt: new Date()
        };

        return this.templates[index];
    }

    getTemplates(type?: NotificationType, channel?: NotificationChannel): NotificationTemplate[] {
        return this.templates.filter(t => {
            if (type && t.type !== type) return false;
            if (channel && t.channel !== channel) return false;
            return true;
        });
    }

    // ===========================================================================
    // PREFERENCES MANAGEMENT
    // ===========================================================================

    getPreferences(userId: string): NotificationPreferences {
        let prefs = this.preferences.get(userId);

        if (!prefs) {
            prefs = this.createDefaultPreferences(userId);
            this.preferences.set(userId, prefs);
        }

        return prefs;
    }

    updatePreferences(userId: string, updates: Partial<NotificationPreferences>): NotificationPreferences {
        const current = this.getPreferences(userId);
        const updated: NotificationPreferences = {
            ...current,
            ...updates,
            userId,
            updatedAt: new Date()
        };
        this.preferences.set(userId, updated);
        return updated;
    }

    private createDefaultPreferences(userId: string): NotificationPreferences {
        const defaultChannel: ChannelPreferences = {
            enabled: true,
            types: {
                booking_confirmed: true,
                booking_reminder: true,
                booking_cancelled: true,
                booking_rescheduled: true,
                booking_completed: true,
                payment_received: true,
                payment_failed: true,
                refund_processed: true,
                payout_sent: true,
                payout_pending: true,
                review_received: true,
                review_reminder: true,
                artist_message: true,
                customer_message: true,
                new_artist_signup: true,
                artist_verified: true,
                system_alert: true,
                marketing: false,
                promotional: false
            },
            frequency: "instant"
        };

        return {
            userId,
            email: { ...defaultChannel },
            sms: { ...defaultChannel, types: { ...defaultChannel.types, marketing: false, promotional: false } },
            push: { ...defaultChannel },
            inApp: { ...defaultChannel },
            whatsapp: { ...defaultChannel, enabled: false },
            slack: { ...defaultChannel, enabled: false },
            updatedAt: new Date()
        };
    }

    private getDefaultChannels(type: NotificationType, prefs: NotificationPreferences): NotificationChannel[] {
        const channels: NotificationChannel[] = [];

        if (prefs.email.enabled && prefs.email.types[type]) channels.push("email");
        if (prefs.push.enabled && prefs.push.types[type]) channels.push("push");
        if (prefs.inApp.enabled && prefs.inApp.types[type]) channels.push("in_app");

        // SMS and WhatsApp only for critical notifications
        const criticalTypes: NotificationType[] = ["booking_confirmed", "booking_reminder", "payment_received"];
        if (criticalTypes.includes(type)) {
            if (prefs.sms.enabled && prefs.sms.types[type]) channels.push("sms");
            if (prefs.whatsapp.enabled && prefs.whatsapp.types[type]) channels.push("whatsapp");
        }

        return channels;
    }

    private isChannelEnabled(
        channel: NotificationChannel,
        type: NotificationType,
        prefs: NotificationPreferences
    ): boolean {
        const channelPrefs = prefs[channel === "in_app" ? "inApp" : channel] as ChannelPreferences;
        return channelPrefs?.enabled && channelPrefs?.types[type];
    }

    // ===========================================================================
    // DEVICE TOKEN MANAGEMENT
    // ===========================================================================

    registerDevice(userId: string, token: string, platform: "ios" | "android" | "web"): void {
        // Remove existing token if present
        this.deviceTokens = this.deviceTokens.filter(t => t.token !== token);

        this.deviceTokens.push({
            userId,
            token,
            platform,
            createdAt: new Date(),
            lastUsedAt: new Date()
        });
    }

    unregisterDevice(token: string): void {
        this.deviceTokens = this.deviceTokens.filter(t => t.token !== token);
    }

    getDeviceTokens(userId: string): DeviceToken[] {
        return this.deviceTokens.filter(t => t.userId === userId);
    }

    // ===========================================================================
    // QUIET HOURS
    // ===========================================================================

    private isQuietHours(prefs: NotificationPreferences): boolean {
        if (!prefs.quietHours?.enabled) return false;

        const now = new Date();
        const tz = prefs.quietHours.timezone;

        // Simplified timezone handling
        const currentHour = now.getHours();
        const startHour = parseInt(prefs.quietHours.startTime.split(":")[0]);
        const endHour = parseInt(prefs.quietHours.endTime.split(":")[0]);

        if (startHour > endHour) {
            // Overnight quiet hours (e.g., 22:00 - 08:00)
            return currentHour >= startHour || currentHour < endHour;
        } else {
            return currentHour >= startHour && currentHour < endHour;
        }
    }

    private getQuietHoursEnd(prefs: NotificationPreferences): Date {
        const endHour = parseInt(prefs.quietHours!.endTime.split(":")[0]);
        const endMinute = parseInt(prefs.quietHours!.endTime.split(":")[1] || "0");

        const end = new Date();
        end.setHours(endHour, endMinute, 0, 0);

        // If end time is earlier today, schedule for tomorrow
        if (end < new Date()) {
            end.setDate(end.getDate() + 1);
        }

        return end;
    }

    // ===========================================================================
    // RATE LIMITING
    // ===========================================================================

    private checkRateLimit(userId: string, channel: NotificationChannel): boolean {
        const key = `${userId}:${channel}`;
        const limit = this.rateLimits.get(key);
        const now = new Date();

        const limits: Record<NotificationChannel, { count: number; windowMs: number }> = {
            email: { count: 10, windowMs: 3600000 },      // 10 per hour
            sms: { count: 5, windowMs: 3600000 },         // 5 per hour
            push: { count: 20, windowMs: 3600000 },       // 20 per hour
            in_app: { count: 50, windowMs: 3600000 },     // 50 per hour
            whatsapp: { count: 5, windowMs: 3600000 },    // 5 per hour
            slack: { count: 10, windowMs: 3600000 }       // 10 per hour
        };

        const channelLimit = limits[channel];

        if (!limit || limit.resetAt < now) {
            this.rateLimits.set(key, {
                count: 1,
                resetAt: new Date(now.getTime() + channelLimit.windowMs)
            });
            return true;
        }

        if (limit.count >= channelLimit.count) {
            return false;
        }

        limit.count++;
        return true;
    }

    // ===========================================================================
    // IN-APP NOTIFICATIONS
    // ===========================================================================

    getInAppNotifications(
        userId: string,
        options?: { unreadOnly?: boolean; limit?: number }
    ): Notification[] {
        let notifications = this.notifications.filter(
            n => n.userId === userId && n.channel === "in_app" && n.status !== "failed"
        );

        if (options?.unreadOnly) {
            notifications = notifications.filter(n => !n.readAt);
        }

        notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (options?.limit) {
            notifications = notifications.slice(0, options.limit);
        }

        return notifications;
    }

    markAsRead(notificationId: string): void {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.readAt) {
            notification.readAt = new Date();
            notification.status = "read";
            this.stats.read++;
        }
    }

    markAsClicked(notificationId: string): void {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.clickedAt) {
            notification.clickedAt = new Date();
            notification.status = "clicked";
            this.stats.clicked++;
        }
    }

    markAllAsRead(userId: string): void {
        this.notifications
            .filter(n => n.userId === userId && n.channel === "in_app" && !n.readAt)
            .forEach(n => {
                n.readAt = new Date();
                n.status = "read";
                this.stats.read++;
            });
    }

    getUnreadCount(userId: string): number {
        return this.notifications.filter(
            n => n.userId === userId && n.channel === "in_app" && !n.readAt && n.status !== "failed"
        ).length;
    }

    // ===========================================================================
    // SCHEDULING
    // ===========================================================================

    private startScheduler(): void {
        setInterval(() => {
            this.processScheduledNotifications();
        }, 60000); // Every minute
    }

    private async processScheduledNotifications(): Promise<void> {
        const now = new Date();
        const scheduled = this.notifications.filter(
            n => n.status === "scheduled" && n.scheduledAt && n.scheduledAt <= now
        );

        for (const notification of scheduled) {
            const template = this.getTemplate(notification.type as NotificationType, notification.channel, "en");
            if (!template) continue;

            await this.sendToChannel(notification, template, notification.data || {});
        }
    }

    // ===========================================================================
    // ANALYTICS
    // ===========================================================================

    getStats(): NotificationStats {
        return { ...this.stats };
    }

    getDeliveryAnalytics(startDate: Date, endDate: Date): {
        totalSent: number;
        deliveryRate: number;
        openRate: number;
        clickRate: number;
        byChannel: Record<NotificationChannel, {
            sent: number;
            deliveryRate: number;
            openRate: number;
        }>;
    } {
        const notifications = this.notifications.filter(
            n => n.createdAt >= startDate && n.createdAt <= endDate
        );

        const sent = notifications.filter(n => n.status !== "pending" && n.status !== "scheduled").length;
        const delivered = notifications.filter(n => ["delivered", "read", "clicked"].includes(n.status)).length;
        const read = notifications.filter(n => ["read", "clicked"].includes(n.status)).length;
        const clicked = notifications.filter(n => n.status === "clicked").length;

        const byChannel: Record<NotificationChannel, { sent: number; deliveryRate: number; openRate: number }> = {} as any;

        const channels: NotificationChannel[] = ["email", "sms", "push", "in_app", "whatsapp", "slack"];
        channels.forEach(channel => {
            const channelNotifications = notifications.filter(n => n.channel === channel);
            const channelSent = channelNotifications.filter(n => n.status !== "pending").length;
            const channelDelivered = channelNotifications.filter(n => ["delivered", "read", "clicked"].includes(n.status)).length;
            const channelRead = channelNotifications.filter(n => ["read", "clicked"].includes(n.status)).length;

            byChannel[channel] = {
                sent: channelSent,
                deliveryRate: channelSent > 0 ? (channelDelivered / channelSent) * 100 : 0,
                openRate: channelSent > 0 ? (channelRead / channelSent) * 100 : 0
            };
        });

        return {
            totalSent: sent,
            deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
            openRate: sent > 0 ? (read / sent) * 100 : 0,
            clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
            byChannel
        };
    }

    private updateStats(channel: NotificationChannel, type: NotificationType, success: boolean): void {
        if (success) {
            this.stats.sent++;
            this.stats.byChannel[channel].sent++;
        } else {
            this.stats.failed++;
            this.stats.byChannel[channel].failed++;
        }

        this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;
    }

    // ===========================================================================
    // CLEANUP
    // ===========================================================================

    private startCleanup(): void {
        setInterval(() => {
            this.cleanup();
        }, 24 * 60 * 60 * 1000); // Daily
    }

    private cleanup(): void {
        // Remove notifications older than 90 days
        const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        this.notifications = this.notifications.filter(n => n.createdAt >= cutoff);

        // Remove expired rate limits
        const now = new Date();
        this.rateLimits.forEach((value, key) => {
            if (value.resetAt < now) {
                this.rateLimits.delete(key);
            }
        });

        // Remove inactive device tokens
        const tokenCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.deviceTokens = this.deviceTokens.filter(t => t.lastUsedAt >= tokenCutoff);
    }

    // ===========================================================================
    // HELPERS
    // ===========================================================================

    private createNotification(
        payload: NotificationPayload,
        channel: NotificationChannel,
        template: NotificationTemplate
    ): Notification {
        return {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: payload.userId,
            type: payload.type,
            channel,
            title: template.title,
            body: template.body,
            data: payload.data,
            status: "pending",
            priority: payload.priority || "normal",
            retryCount: 0,
            createdAt: new Date()
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const notificationService = new NotificationService();
export default notificationService;
