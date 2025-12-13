/**
 * ALTUS INK - ENTERPRISE NOTIFICATIONS & COMMUNICATION SERVICE
 * Complete notification management and multi-channel communication
 * 
 * Features:
 * - Multi-channel notifications (email, SMS, push, in-app)
 * - Notification preferences
 * - Template management
 * - Delivery tracking
 * - Priority queuing
 * - Batch notifications
 * - Scheduled notifications
 * - Real-time updates
 * - Notification center
 * - Analytics and reporting
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Notification {
    id: string;
    type: NotificationType;
    category: NotificationCategory;
    priority: NotificationPriority;
    channels: DeliveryChannel[];
    recipients: NotificationRecipient[];
    content: NotificationContent;
    metadata: NotificationMetadata;
    schedule?: NotificationSchedule;
    status: NotificationStatus;
    delivery: DeliveryStatus[];
    actions?: NotificationAction[];
    expiresAt?: Date;
    createdBy: string;
    createdAt: Date;
    processedAt?: Date;
}

export type NotificationType =
    | "system"
    | "marketing"
    | "transactional"
    | "alert"
    | "reminder"
    | "update"
    | "announcement"
    | "social";

export type NotificationCategory =
    | "booking"
    | "payment"
    | "account"
    | "promotion"
    | "review"
    | "message"
    | "security"
    | "system"
    | "custom";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type DeliveryChannel = "email" | "sms" | "push" | "in_app" | "whatsapp" | "slack" | "webhook";

export type NotificationStatus =
    | "draft"
    | "queued"
    | "processing"
    | "sent"
    | "partially_sent"
    | "failed"
    | "cancelled"
    | "scheduled";

export interface NotificationRecipient {
    id: string;
    type: "user" | "group" | "segment" | "all";
    email?: string;
    phone?: string;
    deviceTokens?: string[];
    userId?: string;
    name?: string;
    preferences?: RecipientPreferences;
}

export interface RecipientPreferences {
    channels: DeliveryChannel[];
    frequency: "immediate" | "hourly" | "daily" | "weekly";
    quietHours?: { start: string; end: string };
    timezone?: string;
    language?: string;
}

export interface NotificationContent {
    title: string;
    body: string;
    summary?: string;
    richContent?: RichContent;
    templateId?: string;
    variables?: Record<string, any>;
    localized?: LocalizedContent[];
}

export interface RichContent {
    html?: string;
    markdown?: string;
    image?: string;
    video?: string;
    buttons?: ContentButton[];
    attachments?: ContentAttachment[];
}

export interface ContentButton {
    id: string;
    text: string;
    action: "link" | "deep_link" | "dismiss" | "action";
    target?: string;
    style?: "primary" | "secondary" | "danger";
}

export interface ContentAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface LocalizedContent {
    language: string;
    title: string;
    body: string;
    richContent?: RichContent;
}

export interface NotificationMetadata {
    source: string;
    referenceType?: string;
    referenceId?: string;
    tags?: string[];
    customData?: Record<string, any>;
    tracking?: TrackingConfig;
}

export interface TrackingConfig {
    trackOpens: boolean;
    trackClicks: boolean;
    trackConversions: boolean;
    utmParams?: Record<string, string>;
}

export interface NotificationSchedule {
    type: "immediate" | "scheduled" | "recurring";
    sendAt?: Date;
    timezone?: string;
    recurrence?: RecurrenceConfig;
    retryPolicy?: RetryPolicy;
}

export interface RecurrenceConfig {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: Date;
    maxOccurrences?: number;
    daysOfWeek?: number[];
}

export interface RetryPolicy {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
}

export interface DeliveryStatus {
    channel: DeliveryChannel;
    recipientId: string;
    status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "failed" | "bounced" | "unsubscribed";
    sentAt?: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
    failedAt?: Date;
    error?: string;
    attempts: number;
    provider?: string;
    externalId?: string;
}

export interface NotificationAction {
    id: string;
    type: "button" | "link" | "deep_link";
    label: string;
    action: string;
    data?: Record<string, any>;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    description: string;
    category: NotificationCategory;
    channels: DeliveryChannel[];
    content: TemplateContent;
    variables: TemplateVariable[];
    conditions?: TemplateCondition[];
    isActive: boolean;
    version: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateContent {
    email?: EmailTemplateContent;
    sms?: SMSTemplateContent;
    push?: PushTemplateContent;
    in_app?: InAppTemplateContent;
}

export interface EmailTemplateContent {
    subject: string;
    preheader?: string;
    htmlBody: string;
    textBody: string;
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
}

export interface SMSTemplateContent {
    body: string;
    senderId?: string;
}

export interface PushTemplateContent {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: number;
    sound?: string;
    data?: Record<string, any>;
}

export interface InAppTemplateContent {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    actions?: NotificationAction[];
    displayType: "toast" | "modal" | "banner" | "card";
    position?: "top" | "bottom" | "center";
    duration?: number;
}

export interface TemplateVariable {
    name: string;
    type: "string" | "number" | "date" | "boolean" | "array" | "object";
    required: boolean;
    defaultValue?: any;
    description?: string;
}

export interface TemplateCondition {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
    value: any;
    action: "include" | "exclude" | "modify";
}

export interface UserPreferences {
    userId: string;
    globalSettings: GlobalPreferences;
    categorySettings: Record<NotificationCategory, CategoryPreferences>;
    channelSettings: Record<DeliveryChannel, ChannelPreferences>;
    blockedSenders: string[];
    mutedUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface GlobalPreferences {
    enabled: boolean;
    defaultChannels: DeliveryChannel[];
    frequency: "immediate" | "hourly" | "daily" | "weekly";
    quietHours: { enabled: boolean; start: string; end: string };
    timezone: string;
    language: string;
    emailDigest: boolean;
    digestFrequency?: "daily" | "weekly";
}

export interface CategoryPreferences {
    enabled: boolean;
    channels: DeliveryChannel[];
    frequency: "immediate" | "batch" | "digest" | "off";
}

export interface ChannelPreferences {
    enabled: boolean;
    verified: boolean;
    contactInfo?: string;
    deviceTokens?: string[];
}

export interface InboxItem {
    id: string;
    notificationId: string;
    userId: string;
    category: NotificationCategory;
    content: NotificationContent;
    status: "unread" | "read" | "archived" | "deleted";
    starred: boolean;
    actions?: NotificationAction[];
    metadata: NotificationMetadata;
    receivedAt: Date;
    readAt?: Date;
    archivedAt?: Date;
}

export interface NotificationCenter {
    userId: string;
    unreadCount: number;
    totalCount: number;
    items: InboxItem[];
    filters: InboxFilter[];
    lastReadAt?: Date;
}

export interface InboxFilter {
    category?: NotificationCategory;
    status?: InboxItem["status"];
    starred?: boolean;
    fromDate?: Date;
    toDate?: Date;
}

export interface Campaign {
    id: string;
    name: string;
    description: string;
    type: NotificationType;
    category: NotificationCategory;
    status: CampaignStatus;
    audience: CampaignAudience;
    content: NotificationContent;
    channels: DeliveryChannel[];
    schedule: NotificationSchedule;
    abTest?: ABTestConfig;
    metrics: CampaignMetrics;
    budget?: CampaignBudget;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    launchedAt?: Date;
    completedAt?: Date;
}

export type CampaignStatus =
    | "draft"
    | "scheduled"
    | "active"
    | "paused"
    | "completed"
    | "cancelled";

export interface CampaignAudience {
    type: "all" | "segment" | "custom";
    segmentIds?: string[];
    filters?: AudienceFilter[];
    excludeIds?: string[];
    estimatedSize: number;
    actualSize?: number;
}

export interface AudienceFilter {
    field: string;
    operator: string;
    value: any;
}

export interface ABTestConfig {
    enabled: boolean;
    variants: ABVariant[];
    testVariable: "subject" | "content" | "channel" | "send_time";
    winningCriteria: "open_rate" | "click_rate" | "conversion_rate";
    sampleSize: number;
    testDuration: number;
    confidence: number;
}

export interface ABVariant {
    id: string;
    name: string;
    weight: number;
    content: Partial<NotificationContent>;
    metrics: VariantMetrics;
}

export interface VariantMetrics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
}

export interface CampaignMetrics {
    totalRecipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
    bounced: number;
    complaints: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    unsubscribeRate: number;
    byChannel: Record<DeliveryChannel, ChannelMetrics>;
}

export interface ChannelMetrics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    cost?: number;
}

export interface CampaignBudget {
    total: number;
    spent: number;
    currency: string;
    costPerSend: Record<DeliveryChannel, number>;
}

export interface WebhookSubscription {
    id: string;
    name: string;
    url: string;
    events: WebhookEvent[];
    secret: string;
    isActive: boolean;
    headers?: Record<string, string>;
    retryPolicy: RetryPolicy;
    lastTriggeredAt?: Date;
    failureCount: number;
    createdAt: Date;
}

export type WebhookEvent =
    | "notification.sent"
    | "notification.delivered"
    | "notification.opened"
    | "notification.clicked"
    | "notification.failed"
    | "notification.bounced"
    | "notification.unsubscribed";

export interface WebhookDelivery {
    id: string;
    subscriptionId: string;
    event: WebhookEvent;
    payload: any;
    status: "pending" | "success" | "failed";
    attempts: number;
    lastAttemptAt?: Date;
    response?: { status: number; body?: string };
    error?: string;
    createdAt: Date;
}

export interface NotificationAnalytics {
    period: { start: Date; end: Date };
    overview: OverviewMetrics;
    byChannel: Record<DeliveryChannel, ChannelAnalytics>;
    byCategory: Record<NotificationCategory, CategoryAnalytics>;
    byHour: HourlyDistribution[];
    engagement: EngagementMetrics;
    deliverability: DeliverabilityMetrics;
}

export interface OverviewMetrics {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    averageDeliveryTime: number;
}

export interface ChannelAnalytics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    bounced: number;
    cost: number;
    avgDeliveryTime: number;
}

export interface CategoryAnalytics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
}

export interface HourlyDistribution {
    hour: number;
    sent: number;
    opened: number;
    clicked: number;
    engagement: number;
}

export interface EngagementMetrics {
    averageOpenTime: number;
    averageClickTime: number;
    peakEngagementHour: number;
    topPerformingContent: Array<{ id: string; title: string; openRate: number }>;
    deviceBreakdown: { desktop: number; mobile: number; tablet: number };
}

export interface DeliverabilityMetrics {
    overallScore: number;
    bounceRate: number;
    complaintRate: number;
    unsubscribeRate: number;
    spamScore: number;
    reputationScore: number;
    issues: DeliverabilityIssue[];
}

export interface DeliverabilityIssue {
    type: "bounce" | "complaint" | "spam" | "blacklist";
    severity: "low" | "medium" | "high";
    description: string;
    affectedCount: number;
    recommendation: string;
}

// =============================================================================
// NOTIFICATION SERVICE CLASS
// =============================================================================

export class NotificationService {
    private notifications: Map<string, Notification> = new Map();
    private templates: Map<string, NotificationTemplate> = new Map();
    private userPreferences: Map<string, UserPreferences> = new Map();
    private inbox: Map<string, InboxItem[]> = new Map();
    private campaigns: Map<string, Campaign> = new Map();
    private webhooks: Map<string, WebhookSubscription> = new Map();
    private webhookDeliveries: WebhookDelivery[] = [];

    private queue: Notification[] = [];
    private processing = false;

    constructor() {
        this.initializeDefaultTemplates();
    }

    // ===========================================================================
    // NOTIFICATION MANAGEMENT
    // ===========================================================================

    async send(data: Partial<Notification>): Promise<Notification> {
        const notification: Notification = {
            id: randomUUID(),
            type: data.type || "system",
            category: data.category || "system",
            priority: data.priority || "normal",
            channels: data.channels || ["in_app"],
            recipients: data.recipients || [],
            content: data.content || { title: "", body: "" },
            metadata: data.metadata || { source: "system" },
            status: "queued",
            delivery: [],
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            ...data
        };

        this.notifications.set(notification.id, notification);

        // Check schedule
        if (notification.schedule?.type === "scheduled" && notification.schedule.sendAt) {
            notification.status = "scheduled";
        } else {
            await this.processNotification(notification);
        }

        return notification;
    }

    async sendBatch(notifications: Partial<Notification>[]): Promise<Notification[]> {
        const results: Notification[] = [];

        for (const data of notifications) {
            const notification = await this.send(data);
            results.push(notification);
        }

        return results;
    }

    async sendFromTemplate(templateId: string, recipientData: {
        recipients: NotificationRecipient[];
        variables: Record<string, any>;
        channels?: DeliveryChannel[];
        schedule?: NotificationSchedule;
    }): Promise<Notification> {
        const template = this.templates.get(templateId);
        if (!template) throw new Error("Template not found");

        // Build content from template
        const content = this.buildContentFromTemplate(template, recipientData.variables);

        return this.send({
            type: "transactional",
            category: template.category,
            channels: recipientData.channels || template.channels,
            recipients: recipientData.recipients,
            content,
            schedule: recipientData.schedule,
            metadata: {
                source: "template",
                referenceId: templateId
            }
        });
    }

    private buildContentFromTemplate(template: NotificationTemplate, variables: Record<string, any>): NotificationContent {
        let title = "";
        let body = "";
        let richContent: RichContent | undefined;

        // Get content for primary channel
        if (template.content.email) {
            title = this.replaceVariables(template.content.email.subject, variables);
            body = this.replaceVariables(template.content.email.textBody, variables);
            richContent = {
                html: this.replaceVariables(template.content.email.htmlBody, variables)
            };
        } else if (template.content.push) {
            title = this.replaceVariables(template.content.push.title, variables);
            body = this.replaceVariables(template.content.push.body, variables);
        } else if (template.content.sms) {
            title = "SMS Notification";
            body = this.replaceVariables(template.content.sms.body, variables);
        } else if (template.content.in_app) {
            title = this.replaceVariables(template.content.in_app.title, variables);
            body = this.replaceVariables(template.content.in_app.body, variables);
        }

        return {
            title,
            body,
            richContent,
            templateId: template.id,
            variables
        };
    }

    private replaceVariables(text: string, variables: Record<string, any>): string {
        let result = text;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
        }
        return result;
    }

    private async processNotification(notification: Notification): Promise<void> {
        notification.status = "processing";
        notification.processedAt = new Date();

        for (const recipient of notification.recipients) {
            // Check preferences
            const preferences = await this.getUserPreferences(recipient.userId || recipient.id);

            for (const channel of notification.channels) {
                // Check if channel is enabled for this recipient
                const channelEnabled = this.isChannelEnabled(preferences, channel, notification.category);

                if (!channelEnabled) {
                    notification.delivery.push({
                        channel,
                        recipientId: recipient.id,
                        status: "failed",
                        error: "Channel disabled by user preferences",
                        attempts: 0
                    });
                    continue;
                }

                // Simulate sending
                const deliveryStatus = await this.simulateSend(channel, recipient, notification);
                notification.delivery.push(deliveryStatus);

                // Add to inbox for in_app
                if (channel === "in_app" && deliveryStatus.status === "delivered") {
                    await this.addToInbox(recipient.userId || recipient.id, notification);
                }
            }
        }

        // Update status
        const allSent = notification.delivery.every(d =>
            d.status === "sent" || d.status === "delivered"
        );
        const allFailed = notification.delivery.every(d => d.status === "failed");

        if (allSent) notification.status = "sent";
        else if (allFailed) notification.status = "failed";
        else notification.status = "partially_sent";

        // Trigger webhooks
        await this.triggerWebhooks("notification.sent", notification);
    }

    private async simulateSend(channel: DeliveryChannel, recipient: NotificationRecipient, notification: Notification): Promise<DeliveryStatus> {
        // Simulate delivery with some randomness
        const success = Math.random() > 0.05; // 95% success rate

        const status: DeliveryStatus = {
            channel,
            recipientId: recipient.id,
            status: success ? "sent" : "failed",
            sentAt: success ? new Date() : undefined,
            failedAt: success ? undefined : new Date(),
            error: success ? undefined : "Simulated delivery failure",
            attempts: 1,
            provider: this.getProviderForChannel(channel)
        };

        if (success) {
            // Simulate delivery confirmation
            setTimeout(() => {
                status.status = "delivered";
                status.deliveredAt = new Date();
                this.triggerWebhooks("notification.delivered", { notification, delivery: status });
            }, 100);
        }

        return status;
    }

    private getProviderForChannel(channel: DeliveryChannel): string {
        const providers: Record<DeliveryChannel, string> = {
            email: "resend",
            sms: "twilio",
            push: "firebase",
            in_app: "internal",
            whatsapp: "twilio",
            slack: "slack",
            webhook: "internal"
        };
        return providers[channel];
    }

    private isChannelEnabled(preferences: UserPreferences | null, channel: DeliveryChannel, category: NotificationCategory): boolean {
        if (!preferences) return true;
        if (!preferences.globalSettings.enabled) return false;
        if (preferences.mutedUntil && preferences.mutedUntil > new Date()) return false;

        const categoryPrefs = preferences.categorySettings[category];
        if (categoryPrefs && !categoryPrefs.enabled) return false;
        if (categoryPrefs && categoryPrefs.channels.length > 0 && !categoryPrefs.channels.includes(channel)) return false;

        const channelPrefs = preferences.channelSettings[channel];
        if (channelPrefs && !channelPrefs.enabled) return false;

        return true;
    }

    async cancel(id: string): Promise<Notification | null> {
        const notification = this.notifications.get(id);
        if (!notification || notification.status === "sent") return null;

        notification.status = "cancelled";
        return notification;
    }

    async getNotification(id: string): Promise<Notification | null> {
        return this.notifications.get(id) || null;
    }

    async getNotifications(filters?: {
        type?: NotificationType;
        category?: NotificationCategory;
        status?: NotificationStatus;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Notification[]> {
        let notifications = Array.from(this.notifications.values());

        if (filters) {
            if (filters.type) {
                notifications = notifications.filter(n => n.type === filters.type);
            }
            if (filters.category) {
                notifications = notifications.filter(n => n.category === filters.category);
            }
            if (filters.status) {
                notifications = notifications.filter(n => n.status === filters.status);
            }
            if (filters.fromDate) {
                notifications = notifications.filter(n => n.createdAt >= filters.fromDate!);
            }
            if (filters.toDate) {
                notifications = notifications.filter(n => n.createdAt <= filters.toDate!);
            }
        }

        return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // ===========================================================================
    // INBOX MANAGEMENT
    // ===========================================================================

    private async addToInbox(userId: string, notification: Notification): Promise<void> {
        const item: InboxItem = {
            id: randomUUID(),
            notificationId: notification.id,
            userId,
            category: notification.category,
            content: notification.content,
            status: "unread",
            starred: false,
            actions: notification.actions,
            metadata: notification.metadata,
            receivedAt: new Date()
        };

        const userInbox = this.inbox.get(userId) || [];
        userInbox.unshift(item);
        this.inbox.set(userId, userInbox);
    }

    async getInbox(userId: string, filters?: InboxFilter): Promise<NotificationCenter> {
        let items = this.inbox.get(userId) || [];

        if (filters) {
            if (filters.category) {
                items = items.filter(i => i.category === filters.category);
            }
            if (filters.status) {
                items = items.filter(i => i.status === filters.status);
            }
            if (filters.starred !== undefined) {
                items = items.filter(i => i.starred === filters.starred);
            }
            if (filters.fromDate) {
                items = items.filter(i => i.receivedAt >= filters.fromDate!);
            }
            if (filters.toDate) {
                items = items.filter(i => i.receivedAt <= filters.toDate!);
            }
        }

        const unreadCount = items.filter(i => i.status === "unread").length;

        return {
            userId,
            unreadCount,
            totalCount: items.length,
            items: items.slice(0, 50),
            filters: filters ? [filters] : []
        };
    }

    async markAsRead(userId: string, itemId: string): Promise<InboxItem | null> {
        const userInbox = this.inbox.get(userId);
        if (!userInbox) return null;

        const item = userInbox.find(i => i.id === itemId);
        if (!item) return null;

        item.status = "read";
        item.readAt = new Date();

        return item;
    }

    async markAllAsRead(userId: string): Promise<number> {
        const userInbox = this.inbox.get(userId);
        if (!userInbox) return 0;

        let count = 0;
        for (const item of userInbox) {
            if (item.status === "unread") {
                item.status = "read";
                item.readAt = new Date();
                count++;
            }
        }

        return count;
    }

    async archiveItem(userId: string, itemId: string): Promise<InboxItem | null> {
        const userInbox = this.inbox.get(userId);
        if (!userInbox) return null;

        const item = userInbox.find(i => i.id === itemId);
        if (!item) return null;

        item.status = "archived";
        item.archivedAt = new Date();

        return item;
    }

    async toggleStar(userId: string, itemId: string): Promise<InboxItem | null> {
        const userInbox = this.inbox.get(userId);
        if (!userInbox) return null;

        const item = userInbox.find(i => i.id === itemId);
        if (!item) return null;

        item.starred = !item.starred;

        return item;
    }

    async deleteItem(userId: string, itemId: string): Promise<boolean> {
        const userInbox = this.inbox.get(userId);
        if (!userInbox) return false;

        const index = userInbox.findIndex(i => i.id === itemId);
        if (index < 0) return false;

        userInbox.splice(index, 1);
        return true;
    }

    // ===========================================================================
    // PREFERENCES MANAGEMENT
    // ===========================================================================

    async getUserPreferences(userId: string): Promise<UserPreferences | null> {
        return this.userPreferences.get(userId) || null;
    }

    async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
        let userPrefs = this.userPreferences.get(userId);

        if (!userPrefs) {
            userPrefs = {
                userId,
                globalSettings: {
                    enabled: true,
                    defaultChannels: ["email", "in_app"],
                    frequency: "immediate",
                    quietHours: { enabled: false, start: "22:00", end: "08:00" },
                    timezone: "Europe/Amsterdam",
                    language: "en",
                    emailDigest: false
                },
                categorySettings: {} as Record<NotificationCategory, CategoryPreferences>,
                channelSettings: {} as Record<DeliveryChannel, ChannelPreferences>,
                blockedSenders: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }

        Object.assign(userPrefs, preferences, { updatedAt: new Date() });
        this.userPreferences.set(userId, userPrefs);

        return userPrefs;
    }

    async updateCategoryPreference(userId: string, category: NotificationCategory, preferences: CategoryPreferences): Promise<UserPreferences> {
        let userPrefs = await this.getUserPreferences(userId);
        if (!userPrefs) {
            userPrefs = await this.updateUserPreferences(userId, {});
        }

        userPrefs.categorySettings[category] = preferences;
        userPrefs.updatedAt = new Date();

        return userPrefs;
    }

    async updateChannelPreference(userId: string, channel: DeliveryChannel, preferences: ChannelPreferences): Promise<UserPreferences> {
        let userPrefs = await this.getUserPreferences(userId);
        if (!userPrefs) {
            userPrefs = await this.updateUserPreferences(userId, {});
        }

        userPrefs.channelSettings[channel] = preferences;
        userPrefs.updatedAt = new Date();

        return userPrefs;
    }

    async muteNotifications(userId: string, until: Date): Promise<UserPreferences> {
        return this.updateUserPreferences(userId, { mutedUntil: until });
    }

    async unmuteNotifications(userId: string): Promise<UserPreferences> {
        return this.updateUserPreferences(userId, { mutedUntil: undefined });
    }

    // ===========================================================================
    // TEMPLATE MANAGEMENT
    // ===========================================================================

    async createTemplate(data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
        const template: NotificationTemplate = {
            id: randomUUID(),
            name: data.name || "New Template",
            description: data.description || "",
            category: data.category || "system",
            channels: data.channels || ["email"],
            content: data.content || {},
            variables: data.variables || [],
            conditions: data.conditions,
            isActive: true,
            version: 1,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.templates.set(template.id, template);
        return template;
    }

    async updateTemplate(id: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
        const template = this.templates.get(id);
        if (!template) return null;

        template.version++;
        Object.assign(template, data, { updatedAt: new Date() });

        return template;
    }

    async getTemplate(id: string): Promise<NotificationTemplate | null> {
        return this.templates.get(id) || null;
    }

    async getTemplates(category?: NotificationCategory): Promise<NotificationTemplate[]> {
        let templates = Array.from(this.templates.values()).filter(t => t.isActive);

        if (category) {
            templates = templates.filter(t => t.category === category);
        }

        return templates;
    }

    async previewTemplate(templateId: string, variables: Record<string, any>): Promise<NotificationContent> {
        const template = this.templates.get(templateId);
        if (!template) throw new Error("Template not found");

        return this.buildContentFromTemplate(template, variables);
    }

    private initializeDefaultTemplates(): void {
        const templates: Partial<NotificationTemplate>[] = [
            {
                name: "Booking Confirmation",
                category: "booking",
                channels: ["email", "in_app", "push"],
                content: {
                    email: {
                        subject: "Booking Confirmed - {{serviceName}}",
                        preheader: "Your appointment is scheduled",
                        htmlBody: "<h1>Booking Confirmed</h1><p>Hello {{customerName}},</p><p>Your booking for {{serviceName}} on {{bookingDate}} has been confirmed.</p>",
                        textBody: "Hello {{customerName}}, Your booking for {{serviceName}} on {{bookingDate}} has been confirmed."
                    },
                    push: {
                        title: "Booking Confirmed!",
                        body: "Your appointment for {{serviceName}} is scheduled"
                    },
                    in_app: {
                        title: "Booking Confirmed",
                        body: "Your appointment for {{serviceName}} on {{bookingDate}} has been confirmed.",
                        displayType: "toast",
                        duration: 5000
                    }
                },
                variables: [
                    { name: "customerName", type: "string", required: true },
                    { name: "serviceName", type: "string", required: true },
                    { name: "bookingDate", type: "date", required: true }
                ]
            },
            {
                name: "Payment Received",
                category: "payment",
                channels: ["email", "in_app"],
                content: {
                    email: {
                        subject: "Payment Received - {{amount}}",
                        preheader: "Thank you for your payment",
                        htmlBody: "<h1>Payment Received</h1><p>We've received your payment of {{amount}}. Thank you!</p>",
                        textBody: "We've received your payment of {{amount}}. Thank you!"
                    },
                    in_app: {
                        title: "Payment Received",
                        body: "We've received your payment of {{amount}}",
                        displayType: "toast",
                        duration: 3000
                    }
                },
                variables: [
                    { name: "amount", type: "string", required: true }
                ]
            },
            {
                name: "Reminder",
                category: "booking",
                channels: ["email", "sms", "push"],
                content: {
                    email: {
                        subject: "Reminder: Your appointment is tomorrow",
                        preheader: "Don't forget your appointment",
                        htmlBody: "<h1>Appointment Reminder</h1><p>Hi {{customerName}}, this is a reminder that you have an appointment scheduled for {{bookingDate}}.</p>",
                        textBody: "Hi {{customerName}}, this is a reminder that you have an appointment scheduled for {{bookingDate}}."
                    },
                    sms: {
                        body: "Reminder: Your appointment at Altus Ink is scheduled for {{bookingDate}}. Reply CANCEL to cancel."
                    },
                    push: {
                        title: "Appointment Tomorrow",
                        body: "Don't forget your appointment at {{bookingTime}}"
                    }
                },
                variables: [
                    { name: "customerName", type: "string", required: true },
                    { name: "bookingDate", type: "date", required: true },
                    { name: "bookingTime", type: "string", required: true }
                ]
            }
        ];

        for (const template of templates) {
            this.createTemplate({ ...template, createdBy: "system" });
        }
    }

    // ===========================================================================
    // CAMPAIGNS
    // ===========================================================================

    async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
        const campaign: Campaign = {
            id: randomUUID(),
            name: data.name || "New Campaign",
            description: data.description || "",
            type: data.type || "marketing",
            category: data.category || "promotion",
            status: "draft",
            audience: data.audience || { type: "all", estimatedSize: 0 },
            content: data.content || { title: "", body: "" },
            channels: data.channels || ["email"],
            schedule: data.schedule || { type: "immediate" },
            metrics: this.getEmptyCampaignMetrics(),
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.campaigns.set(campaign.id, campaign);
        return campaign;
    }

    async launchCampaign(id: string): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign || campaign.status !== "draft") return null;

        campaign.status = "active";
        campaign.launchedAt = new Date();

        // Process campaign sending
        await this.processCampaign(campaign);

        return campaign;
    }

    private async processCampaign(campaign: Campaign): Promise<void> {
        // Simulate campaign sending
        const audienceSize = campaign.audience.estimatedSize || 1000;
        campaign.audience.actualSize = audienceSize;

        campaign.metrics.totalRecipients = audienceSize;
        campaign.metrics.sent = Math.floor(audienceSize * 0.98);
        campaign.metrics.delivered = Math.floor(campaign.metrics.sent * 0.95);
        campaign.metrics.opened = Math.floor(campaign.metrics.delivered * 0.25);
        campaign.metrics.clicked = Math.floor(campaign.metrics.opened * 0.15);
        campaign.metrics.converted = Math.floor(campaign.metrics.clicked * 0.05);
        campaign.metrics.unsubscribed = Math.floor(audienceSize * 0.002);
        campaign.metrics.bounced = audienceSize - campaign.metrics.sent;

        campaign.metrics.deliveryRate = (campaign.metrics.delivered / campaign.metrics.sent) * 100;
        campaign.metrics.openRate = (campaign.metrics.opened / campaign.metrics.delivered) * 100;
        campaign.metrics.clickRate = (campaign.metrics.clicked / campaign.metrics.delivered) * 100;
        campaign.metrics.conversionRate = (campaign.metrics.converted / campaign.metrics.clicked) * 100;
        campaign.metrics.unsubscribeRate = (campaign.metrics.unsubscribed / campaign.metrics.delivered) * 100;

        campaign.status = "completed";
        campaign.completedAt = new Date();
    }

    async getCampaign(id: string): Promise<Campaign | null> {
        return this.campaigns.get(id) || null;
    }

    async getCampaigns(status?: CampaignStatus): Promise<Campaign[]> {
        let campaigns = Array.from(this.campaigns.values());

        if (status) {
            campaigns = campaigns.filter(c => c.status === status);
        }

        return campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    private getEmptyCampaignMetrics(): CampaignMetrics {
        return {
            totalRecipients: 0,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            unsubscribed: 0,
            bounced: 0,
            complaints: 0,
            deliveryRate: 0,
            openRate: 0,
            clickRate: 0,
            conversionRate: 0,
            unsubscribeRate: 0,
            byChannel: {} as Record<DeliveryChannel, ChannelMetrics>
        };
    }

    // ===========================================================================
    // WEBHOOKS
    // ===========================================================================

    async createWebhook(data: Partial<WebhookSubscription>): Promise<WebhookSubscription> {
        const webhook: WebhookSubscription = {
            id: randomUUID(),
            name: data.name || "New Webhook",
            url: data.url || "",
            events: data.events || [],
            secret: randomUUID(),
            isActive: true,
            retryPolicy: data.retryPolicy || { maxRetries: 3, retryDelay: 60, backoffMultiplier: 2 },
            failureCount: 0,
            createdAt: new Date(),
            ...data
        };

        this.webhooks.set(webhook.id, webhook);
        return webhook;
    }

    async getWebhooks(): Promise<WebhookSubscription[]> {
        return Array.from(this.webhooks.values());
    }

    private async triggerWebhooks(event: WebhookEvent, payload: any): Promise<void> {
        for (const webhook of this.webhooks.values()) {
            if (!webhook.isActive || !webhook.events.includes(event)) continue;

            const delivery: WebhookDelivery = {
                id: randomUUID(),
                subscriptionId: webhook.id,
                event,
                payload,
                status: "pending",
                attempts: 0,
                createdAt: new Date()
            };

            this.webhookDeliveries.push(delivery);

            // Simulate webhook delivery
            setTimeout(() => {
                delivery.attempts++;
                delivery.lastAttemptAt = new Date();
                delivery.status = Math.random() > 0.1 ? "success" : "failed";
                delivery.response = delivery.status === "success"
                    ? { status: 200 }
                    : { status: 500, body: "Internal Server Error" };

                if (delivery.status === "success") {
                    webhook.lastTriggeredAt = new Date();
                    webhook.failureCount = 0;
                } else {
                    webhook.failureCount++;
                }
            }, 100);
        }
    }

    // ===========================================================================
    // ANALYTICS
    // ===========================================================================

    async getAnalytics(startDate: Date, endDate: Date): Promise<NotificationAnalytics> {
        const notifications = Array.from(this.notifications.values()).filter(
            n => n.createdAt >= startDate && n.createdAt <= endDate
        );

        let totalSent = 0;
        let totalDelivered = 0;
        let totalOpened = 0;
        let totalClicked = 0;

        for (const notification of notifications) {
            for (const delivery of notification.delivery) {
                if (["sent", "delivered", "opened", "clicked"].includes(delivery.status)) totalSent++;
                if (["delivered", "opened", "clicked"].includes(delivery.status)) totalDelivered++;
                if (["opened", "clicked"].includes(delivery.status)) totalOpened++;
                if (delivery.status === "clicked") totalClicked++;
            }
        }

        return {
            period: { start: startDate, end: endDate },
            overview: {
                totalSent,
                totalDelivered,
                totalOpened,
                totalClicked,
                deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
                openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
                clickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
                averageDeliveryTime: 1.5
            },
            byChannel: {} as Record<DeliveryChannel, ChannelAnalytics>,
            byCategory: {} as Record<NotificationCategory, CategoryAnalytics>,
            byHour: [],
            engagement: {
                averageOpenTime: 45,
                averageClickTime: 120,
                peakEngagementHour: 14,
                topPerformingContent: [],
                deviceBreakdown: { desktop: 45, mobile: 50, tablet: 5 }
            },
            deliverability: {
                overallScore: 92,
                bounceRate: 2,
                complaintRate: 0.1,
                unsubscribeRate: 0.5,
                spamScore: 0.5,
                reputationScore: 95,
                issues: []
            }
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const notificationService = new NotificationService();
export default notificationService;
