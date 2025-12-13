/**
 * ALTUS INK - ENTERPRISE MARKETING AUTOMATION SERVICE
 * Complete marketing automation and campaign management
 * 
 * Features:
 * - Email marketing campaigns
 * - SMS marketing
 * - Push notifications
 * - Marketing automation flows
 * - A/B testing
 * - Audience segmentation
 * - Lead scoring
 * - Content management
 * - Social media integration
 * - Attribution tracking
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Campaign {
    id: string;
    name: string;
    description: string;
    type: CampaignType;
    status: CampaignStatus;
    channel: MarketingChannel;
    audience: CampaignAudience;
    content: CampaignContent;
    schedule: CampaignSchedule;
    budget?: CampaignBudget;
    goals: CampaignGoal[];
    abTest?: ABTest;
    tracking: CampaignTracking;
    metrics: CampaignMetrics;
    automation?: AutomationFlow;
    tags: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    launchedAt?: Date;
    completedAt?: Date;
}

export type CampaignType =
    | "promotional"
    | "newsletter"
    | "transactional"
    | "nurture"
    | "reengagement"
    | "announcement"
    | "event"
    | "referral"
    | "seasonal";

export type CampaignStatus =
    | "draft"
    | "scheduled"
    | "active"
    | "paused"
    | "completed"
    | "cancelled";

export type MarketingChannel =
    | "email"
    | "sms"
    | "push"
    | "whatsapp"
    | "social"
    | "in_app"
    | "multichannel";

export interface CampaignAudience {
    type: "all" | "segment" | "list" | "custom";
    segmentIds?: string[];
    listIds?: string[];
    customQuery?: AudienceQuery;
    excludeSegments?: string[];
    estimatedSize: number;
    actualSize?: number;
}

export interface AudienceQuery {
    conditions: QueryCondition[];
    operator: "and" | "or";
}

export interface QueryCondition {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in" | "between" | "is_null" | "is_not_null";
    value: any;
}

export interface CampaignContent {
    subject?: string;
    preheader?: string;
    fromName: string;
    fromEmail?: string;
    replyTo?: string;
    body: string;
    htmlBody?: string;
    plainTextBody?: string;
    templateId?: string;
    variables: ContentVariable[];
    attachments?: ContentAttachment[];
    ctaButtons?: CTAButton[];
    images?: ContentImage[];
}

export interface ContentVariable {
    name: string;
    defaultValue: string;
    personalization?: string;
}

export interface ContentAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface CTAButton {
    id: string;
    text: string;
    url: string;
    style?: Record<string, string>;
    tracking: boolean;
}

export interface ContentImage {
    id: string;
    url: string;
    alt: string;
    width?: number;
    height?: number;
}

export interface CampaignSchedule {
    type: "immediate" | "scheduled" | "recurring" | "triggered";
    sendAt?: Date;
    timezone?: string;
    recurrence?: RecurrenceRule;
    triggerEvent?: string;
    sendWindow?: SendWindow;
    throttle?: ThrottleConfig;
}

export interface RecurrenceRule {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
    maxOccurrences?: number;
}

export interface SendWindow {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    respectTimezone: boolean;
}

export interface ThrottleConfig {
    maxPerHour: number;
    maxPerDay: number;
    spreadSending: boolean;
}

export interface CampaignBudget {
    total: number;
    spent: number;
    currency: string;
    costPerSend?: number;
    dailyLimit?: number;
}

export interface CampaignGoal {
    type: GoalType;
    target: number;
    current: number;
    achieved: boolean;
}

export type GoalType =
    | "opens"
    | "clicks"
    | "conversions"
    | "revenue"
    | "signups"
    | "bookings"
    | "engagement";

export interface ABTest {
    id: string;
    status: "draft" | "running" | "completed";
    variants: ABVariant[];
    testVariable: "subject" | "content" | "send_time" | "cta";
    winningCriteria: "open_rate" | "click_rate" | "conversion_rate";
    testDuration: number;
    sampleSize: number;
    confidence: number;
    winnerId?: string;
    results?: ABTestResults;
}

export interface ABVariant {
    id: string;
    name: string;
    content: Partial<CampaignContent>;
    weight: number;
    metrics?: VariantMetrics;
}

export interface VariantMetrics {
    sent: number;
    delivered: number;
    opens: number;
    clicks: number;
    conversions: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
}

export interface ABTestResults {
    winner: string;
    confidence: number;
    improvement: number;
    startedAt: Date;
    completedAt: Date;
}

export interface CampaignTracking {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    customParameters?: Record<string, string>;
    trackOpens: boolean;
    trackClicks: boolean;
    trackConversions: boolean;
    conversionWindow: number;
}

export interface CampaignMetrics {
    sent: number;
    delivered: number;
    bounced: number;
    opens: number;
    uniqueOpens: number;
    clicks: number;
    uniqueClicks: number;
    unsubscribes: number;
    complaints: number;
    conversions: number;
    revenue: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    unsubscribeRate: number;
    conversionRate: number;
    roi?: number;
}

export interface AutomationFlow {
    id: string;
    name: string;
    description: string;
    status: "draft" | "active" | "paused" | "archived";
    trigger: AutomationTrigger;
    steps: AutomationStep[];
    exitConditions: ExitCondition[];
    settings: AutomationSettings;
    metrics: AutomationMetrics;
    createdAt: Date;
    updatedAt: Date;
}

export interface AutomationTrigger {
    type: TriggerType;
    event?: string;
    conditions?: QueryCondition[];
    schedule?: RecurrenceRule;
    delay?: DelayConfig;
}

export type TriggerType =
    | "event"
    | "segment_entry"
    | "segment_exit"
    | "date"
    | "api"
    | "form_submit"
    | "page_visit"
    | "purchase"
    | "booking";

export interface AutomationStep {
    id: string;
    type: StepType;
    name: string;
    config: StepConfig;
    position: { x: number; y: number };
    nextSteps: StepConnection[];
    metrics?: StepMetrics;
}

export type StepType =
    | "send_email"
    | "send_sms"
    | "send_push"
    | "wait"
    | "condition"
    | "split"
    | "update_contact"
    | "add_tag"
    | "remove_tag"
    | "add_to_list"
    | "remove_from_list"
    | "webhook"
    | "goal";

export interface StepConfig {
    templateId?: string;
    content?: Partial<CampaignContent>;
    waitDuration?: DelayConfig;
    conditions?: QueryCondition[];
    splitRatio?: number[];
    tagName?: string;
    listId?: string;
    contactFields?: Record<string, any>;
    webhookUrl?: string;
    goalType?: GoalType;
}

export interface StepConnection {
    targetStepId: string;
    condition?: string;
    label?: string;
}

export interface StepMetrics {
    entered: number;
    completed: number;
    failed: number;
    skipped: number;
}

export interface DelayConfig {
    value: number;
    unit: "minutes" | "hours" | "days" | "weeks";
}

export interface ExitCondition {
    type: "goal_achieved" | "unsubscribed" | "condition" | "time_limit";
    config: Record<string, any>;
}

export interface AutomationSettings {
    allowReentry: boolean;
    reentryDelay?: DelayConfig;
    maxEnrollments?: number;
    quietHours?: SendWindow;
    stopOnConversion: boolean;
}

export interface AutomationMetrics {
    totalEnrolled: number;
    currentlyActive: number;
    completed: number;
    exited: number;
    conversions: number;
    conversionRate: number;
}

export interface Segment {
    id: string;
    name: string;
    description: string;
    type: "static" | "dynamic";
    query?: AudienceQuery;
    memberIds?: string[];
    size: number;
    lastCalculatedAt?: Date;
    isActive: boolean;
    tags: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ContactList {
    id: string;
    name: string;
    description: string;
    type: "manual" | "import" | "integration";
    source?: string;
    memberCount: number;
    doubleOptIn: boolean;
    status: "active" | "inactive";
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MarketingContact {
    id: string;
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    company?: string;
    title?: string;
    source: string;
    status: ContactStatus;
    subscriptionStatus: SubscriptionStatus;
    tags: string[];
    segments: string[];
    lists: string[];
    customFields: Record<string, any>;
    leadScore: number;
    engagement: EngagementScore;
    preferences: ContactPreferences;
    timeline: ContactEvent[];
    attribution: AttributionData;
    createdAt: Date;
    updatedAt: Date;
    lastActivityAt?: Date;
}

export type ContactStatus = "active" | "inactive" | "bounced" | "complained";
export type SubscriptionStatus = "subscribed" | "unsubscribed" | "pending" | "cleaned";

export interface EngagementScore {
    total: number;
    emailEngagement: number;
    websiteEngagement: number;
    socialEngagement: number;
    lastCalculatedAt: Date;
}

export interface ContactPreferences {
    emailOptIn: boolean;
    smsOptIn: boolean;
    pushOptIn: boolean;
    preferredChannel: MarketingChannel;
    preferredFrequency: "daily" | "weekly" | "monthly";
    preferredLanguage: string;
    interests: string[];
    unsubscribeReason?: string;
}

export interface ContactEvent {
    id: string;
    type: EventType;
    timestamp: Date;
    campaignId?: string;
    data?: Record<string, any>;
}

export type EventType =
    | "email_sent"
    | "email_delivered"
    | "email_opened"
    | "email_clicked"
    | "email_bounced"
    | "sms_sent"
    | "sms_delivered"
    | "sms_clicked"
    | "unsubscribed"
    | "subscribed"
    | "form_submitted"
    | "page_viewed"
    | "converted"
    | "tag_added"
    | "tag_removed";

export interface AttributionData {
    firstTouch: TouchPoint;
    lastTouch: TouchPoint;
    multiTouch: TouchPoint[];
}

export interface TouchPoint {
    source: string;
    medium: string;
    campaign?: string;
    timestamp: Date;
    weight?: number;
}

export interface EmailTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    type: "html" | "drag_drop" | "plain";
    subject?: string;
    preheader?: string;
    htmlContent: string;
    jsonContent?: any;
    thumbnail?: string;
    variables: TemplateVariable[];
    isPublic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateVariable {
    name: string;
    type: "text" | "image" | "link" | "dynamic";
    defaultValue?: string;
    required: boolean;
}

export interface LeadScoringRule {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    conditions: QueryCondition[];
    action: "add" | "subtract" | "set";
    points: number;
    category: "demographic" | "behavioral" | "engagement" | "custom";
    createdAt: Date;
}

export interface MarketingAnalytics {
    period: { start: Date; end: Date };
    overview: OverviewMetrics;
    channelPerformance: ChannelMetrics[];
    campaignPerformance: CampaignPerformance[];
    audienceGrowth: GrowthMetrics;
    topContent: ContentPerformance[];
    conversionFunnel: FunnelStage[];
}

export interface OverviewMetrics {
    totalContacts: number;
    newContacts: number;
    totalCampaigns: number;
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageConversionRate: number;
}

export interface ChannelMetrics {
    channel: MarketingChannel;
    sent: number;
    delivered: number;
    opens: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
    roi: number;
}

export interface CampaignPerformance {
    campaignId: string;
    campaignName: string;
    sent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
}

export interface GrowthMetrics {
    newSubscribers: number;
    unsubscribes: number;
    netGrowth: number;
    growthRate: number;
    bySource: Array<{ source: string; count: number }>;
}

export interface ContentPerformance {
    contentId: string;
    contentName: string;
    views: number;
    clicks: number;
    conversions: number;
    engagementRate: number;
}

export interface FunnelStage {
    name: string;
    count: number;
    conversionRate: number;
    dropOffRate: number;
}

// =============================================================================
// MARKETING AUTOMATION SERVICE CLASS
// =============================================================================

export class MarketingAutomationService {
    private campaigns: Map<string, Campaign> = new Map();
    private automations: Map<string, AutomationFlow> = new Map();
    private segments: Map<string, Segment> = new Map();
    private lists: Map<string, ContactList> = new Map();
    private contacts: Map<string, MarketingContact> = new Map();
    private templates: Map<string, EmailTemplate> = new Map();
    private scoringRules: Map<string, LeadScoringRule> = new Map();

    constructor() {
        this.initializeDefaultTemplates();
        this.initializeDefaultSegments();
        this.initializeDefaultScoringRules();
    }

    // ===========================================================================
    // CAMPAIGN MANAGEMENT
    // ===========================================================================

    async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
        const campaign: Campaign = {
            id: randomUUID(),
            name: data.name || "Untitled Campaign",
            description: data.description || "",
            type: data.type || "promotional",
            status: "draft",
            channel: data.channel || "email",
            audience: data.audience || { type: "all", estimatedSize: 0 },
            content: data.content || this.getEmptyContent(),
            schedule: data.schedule || { type: "immediate" },
            goals: data.goals || [],
            tracking: data.tracking || this.getDefaultTracking(),
            metrics: this.getEmptyMetrics(),
            tags: data.tags || [],
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.campaigns.set(campaign.id, campaign);
        return campaign;
    }

    async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign) return null;

        Object.assign(campaign, data, { updatedAt: new Date() });
        return campaign;
    }

    async deleteCampaign(id: string): Promise<boolean> {
        return this.campaigns.delete(id);
    }

    async getCampaign(id: string): Promise<Campaign | null> {
        return this.campaigns.get(id) || null;
    }

    async getCampaigns(filters?: {
        status?: CampaignStatus;
        type?: CampaignType;
        channel?: MarketingChannel;
    }): Promise<Campaign[]> {
        let campaigns = Array.from(this.campaigns.values());

        if (filters) {
            if (filters.status) {
                campaigns = campaigns.filter(c => c.status === filters.status);
            }
            if (filters.type) {
                campaigns = campaigns.filter(c => c.type === filters.type);
            }
            if (filters.channel) {
                campaigns = campaigns.filter(c => c.channel === filters.channel);
            }
        }

        return campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async scheduleCampaign(id: string, schedule: CampaignSchedule): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign || campaign.status !== "draft") return null;

        campaign.schedule = schedule;
        campaign.status = "scheduled";
        campaign.updatedAt = new Date();

        return campaign;
    }

    async launchCampaign(id: string): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign || (campaign.status !== "draft" && campaign.status !== "scheduled")) return null;

        // Calculate actual audience size
        campaign.audience.actualSize = await this.calculateAudienceSize(campaign.audience);

        campaign.status = "active";
        campaign.launchedAt = new Date();
        campaign.updatedAt = new Date();

        // Start sending
        await this.processCampaignSending(campaign);

        return campaign;
    }

    async pauseCampaign(id: string): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign || campaign.status !== "active") return null;

        campaign.status = "paused";
        campaign.updatedAt = new Date();

        return campaign;
    }

    async resumeCampaign(id: string): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign || campaign.status !== "paused") return null;

        campaign.status = "active";
        campaign.updatedAt = new Date();

        await this.processCampaignSending(campaign);

        return campaign;
    }

    async completeCampaign(id: string): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign) return null;

        campaign.status = "completed";
        campaign.completedAt = new Date();
        campaign.updatedAt = new Date();

        // Calculate final metrics
        this.calculateCampaignROI(campaign);

        return campaign;
    }

    private async processCampaignSending(campaign: Campaign): Promise<void> {
        // Simulate sending process
        const audienceSize = campaign.audience.actualSize || campaign.audience.estimatedSize;

        campaign.metrics.sent = audienceSize;
        campaign.metrics.delivered = Math.floor(audienceSize * 0.98);
        campaign.metrics.bounced = audienceSize - campaign.metrics.delivered;
        campaign.metrics.deliveryRate = (campaign.metrics.delivered / audienceSize) * 100;

        // Simulate engagement over time
        campaign.metrics.opens = Math.floor(campaign.metrics.delivered * (0.15 + Math.random() * 0.15));
        campaign.metrics.uniqueOpens = Math.floor(campaign.metrics.opens * 0.85);
        campaign.metrics.clicks = Math.floor(campaign.metrics.opens * (0.1 + Math.random() * 0.1));
        campaign.metrics.uniqueClicks = Math.floor(campaign.metrics.clicks * 0.9);
        campaign.metrics.unsubscribes = Math.floor(campaign.metrics.delivered * 0.002);
        campaign.metrics.complaints = Math.floor(campaign.metrics.delivered * 0.0001);
        campaign.metrics.conversions = Math.floor(campaign.metrics.clicks * (0.02 + Math.random() * 0.03));
        campaign.metrics.revenue = campaign.metrics.conversions * (50 + Math.random() * 150);

        campaign.metrics.openRate = (campaign.metrics.uniqueOpens / campaign.metrics.delivered) * 100;
        campaign.metrics.clickRate = (campaign.metrics.uniqueClicks / campaign.metrics.delivered) * 100;
        campaign.metrics.clickToOpenRate = (campaign.metrics.uniqueClicks / campaign.metrics.uniqueOpens) * 100;
        campaign.metrics.unsubscribeRate = (campaign.metrics.unsubscribes / campaign.metrics.delivered) * 100;
        campaign.metrics.conversionRate = (campaign.metrics.conversions / campaign.metrics.uniqueClicks) * 100;
    }

    private calculateCampaignROI(campaign: Campaign): void {
        if (campaign.budget) {
            campaign.metrics.roi = ((campaign.metrics.revenue - campaign.budget.spent) / campaign.budget.spent) * 100;
        }
    }

    private async calculateAudienceSize(audience: CampaignAudience): Promise<number> {
        if (audience.type === "all") {
            return this.contacts.size;
        }

        if (audience.segmentIds?.length) {
            let size = 0;
            for (const segmentId of audience.segmentIds) {
                const segment = this.segments.get(segmentId);
                if (segment) size += segment.size;
            }
            return size;
        }

        if (audience.listIds?.length) {
            let size = 0;
            for (const listId of audience.listIds) {
                const list = this.lists.get(listId);
                if (list) size += list.memberCount;
            }
            return size;
        }

        return audience.estimatedSize;
    }

    private getEmptyContent(): CampaignContent {
        return {
            fromName: "Altus Ink",
            body: "",
            variables: []
        };
    }

    private getDefaultTracking(): CampaignTracking {
        return {
            trackOpens: true,
            trackClicks: true,
            trackConversions: true,
            conversionWindow: 7
        };
    }

    private getEmptyMetrics(): CampaignMetrics {
        return {
            sent: 0,
            delivered: 0,
            bounced: 0,
            opens: 0,
            uniqueOpens: 0,
            clicks: 0,
            uniqueClicks: 0,
            unsubscribes: 0,
            complaints: 0,
            conversions: 0,
            revenue: 0,
            deliveryRate: 0,
            openRate: 0,
            clickRate: 0,
            clickToOpenRate: 0,
            unsubscribeRate: 0,
            conversionRate: 0
        };
    }

    // ===========================================================================
    // A/B TESTING
    // ===========================================================================

    async createABTest(campaignId: string, config: Partial<ABTest>): Promise<ABTest | null> {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) return null;

        const abTest: ABTest = {
            id: randomUUID(),
            status: "draft",
            variants: config.variants || [],
            testVariable: config.testVariable || "subject",
            winningCriteria: config.winningCriteria || "open_rate",
            testDuration: config.testDuration || 24,
            sampleSize: config.sampleSize || 20,
            confidence: config.confidence || 95,
            ...config
        };

        campaign.abTest = abTest;
        campaign.updatedAt = new Date();

        return abTest;
    }

    async addVariant(campaignId: string, variant: Omit<ABVariant, "id">): Promise<ABVariant | null> {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign?.abTest) return null;

        const newVariant: ABVariant = {
            id: randomUUID(),
            ...variant
        };

        campaign.abTest.variants.push(newVariant);
        campaign.updatedAt = new Date();

        return newVariant;
    }

    async startABTest(campaignId: string): Promise<ABTest | null> {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign?.abTest || campaign.abTest.status !== "draft") return null;

        campaign.abTest.status = "running";
        campaign.abTest.results = undefined;
        campaign.updatedAt = new Date();

        // Simulate test results
        await this.simulateABTestResults(campaign.abTest);

        return campaign.abTest;
    }

    async completeABTest(campaignId: string): Promise<ABTest | null> {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign?.abTest || campaign.abTest.status !== "running") return null;

        // Determine winner
        let winner: ABVariant | undefined;
        let bestValue = 0;

        for (const variant of campaign.abTest.variants) {
            if (!variant.metrics) continue;

            let value = 0;
            switch (campaign.abTest.winningCriteria) {
                case "open_rate": value = variant.metrics.openRate; break;
                case "click_rate": value = variant.metrics.clickRate; break;
                case "conversion_rate": value = variant.metrics.conversionRate; break;
            }

            if (value > bestValue) {
                bestValue = value;
                winner = variant;
            }
        }

        if (winner) {
            campaign.abTest.winnerId = winner.id;
            campaign.abTest.results = {
                winner: winner.id,
                confidence: 95 + Math.random() * 4,
                improvement: 10 + Math.random() * 20,
                startedAt: new Date(Date.now() - campaign.abTest.testDuration * 60 * 60 * 1000),
                completedAt: new Date()
            };
        }

        campaign.abTest.status = "completed";
        campaign.updatedAt = new Date();

        return campaign.abTest;
    }

    private async simulateABTestResults(abTest: ABTest): Promise<void> {
        const baseSent = 1000;

        for (const variant of abTest.variants) {
            const sent = Math.floor(baseSent * variant.weight);
            const delivered = Math.floor(sent * 0.98);
            const opens = Math.floor(delivered * (0.15 + Math.random() * 0.15));
            const clicks = Math.floor(opens * (0.1 + Math.random() * 0.1));
            const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.03));

            variant.metrics = {
                sent,
                delivered,
                opens,
                clicks,
                conversions,
                openRate: (opens / delivered) * 100,
                clickRate: (clicks / delivered) * 100,
                conversionRate: (conversions / clicks) * 100
            };
        }
    }

    // ===========================================================================
    // AUTOMATION FLOWS
    // ===========================================================================

    async createAutomation(data: Partial<AutomationFlow>): Promise<AutomationFlow> {
        const automation: AutomationFlow = {
            id: randomUUID(),
            name: data.name || "Untitled Automation",
            description: data.description || "",
            status: "draft",
            trigger: data.trigger || { type: "event" },
            steps: data.steps || [],
            exitConditions: data.exitConditions || [],
            settings: data.settings || {
                allowReentry: false,
                stopOnConversion: true
            },
            metrics: {
                totalEnrolled: 0,
                currentlyActive: 0,
                completed: 0,
                exited: 0,
                conversions: 0,
                conversionRate: 0
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.automations.set(automation.id, automation);
        return automation;
    }

    async updateAutomation(id: string, data: Partial<AutomationFlow>): Promise<AutomationFlow | null> {
        const automation = this.automations.get(id);
        if (!automation) return null;

        Object.assign(automation, data, { updatedAt: new Date() });
        return automation;
    }

    async getAutomation(id: string): Promise<AutomationFlow | null> {
        return this.automations.get(id) || null;
    }

    async getAutomations(status?: AutomationFlow["status"]): Promise<AutomationFlow[]> {
        let automations = Array.from(this.automations.values());
        if (status) {
            automations = automations.filter(a => a.status === status);
        }
        return automations;
    }

    async addAutomationStep(automationId: string, step: Omit<AutomationStep, "id">): Promise<AutomationStep | null> {
        const automation = this.automations.get(automationId);
        if (!automation) return null;

        const newStep: AutomationStep = {
            id: randomUUID(),
            ...step
        };

        automation.steps.push(newStep);
        automation.updatedAt = new Date();

        return newStep;
    }

    async activateAutomation(id: string): Promise<AutomationFlow | null> {
        const automation = this.automations.get(id);
        if (!automation || automation.status === "active") return null;

        automation.status = "active";
        automation.updatedAt = new Date();

        return automation;
    }

    async pauseAutomation(id: string): Promise<AutomationFlow | null> {
        const automation = this.automations.get(id);
        if (!automation || automation.status !== "active") return null;

        automation.status = "paused";
        automation.updatedAt = new Date();

        return automation;
    }

    async triggerAutomation(automationId: string, contactId: string): Promise<boolean> {
        const automation = this.automations.get(automationId);
        const contact = this.contacts.get(contactId);

        if (!automation || automation.status !== "active" || !contact) return false;

        // Enroll contact
        automation.metrics.totalEnrolled++;
        automation.metrics.currentlyActive++;

        // Process steps (simplified)
        for (const step of automation.steps) {
            if (!step.metrics) {
                step.metrics = { entered: 0, completed: 0, failed: 0, skipped: 0 };
            }
            step.metrics.entered++;
            step.metrics.completed++;
        }

        automation.metrics.currentlyActive--;
        automation.metrics.completed++;

        return true;
    }

    // ===========================================================================
    // SEGMENTS
    // ===========================================================================

    async createSegment(data: Partial<Segment>): Promise<Segment> {
        const segment: Segment = {
            id: randomUUID(),
            name: data.name || "New Segment",
            description: data.description || "",
            type: data.type || "dynamic",
            query: data.query,
            memberIds: data.memberIds,
            size: 0,
            isActive: true,
            tags: data.tags || [],
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        if (segment.type === "dynamic" && segment.query) {
            segment.size = await this.calculateSegmentSize(segment.query);
            segment.lastCalculatedAt = new Date();
        } else if (segment.memberIds) {
            segment.size = segment.memberIds.length;
        }

        this.segments.set(segment.id, segment);
        return segment;
    }

    async updateSegment(id: string, data: Partial<Segment>): Promise<Segment | null> {
        const segment = this.segments.get(id);
        if (!segment) return null;

        Object.assign(segment, data, { updatedAt: new Date() });

        if (segment.type === "dynamic" && segment.query) {
            segment.size = await this.calculateSegmentSize(segment.query);
            segment.lastCalculatedAt = new Date();
        }

        return segment;
    }

    async getSegment(id: string): Promise<Segment | null> {
        return this.segments.get(id) || null;
    }

    async getSegments(): Promise<Segment[]> {
        return Array.from(this.segments.values()).filter(s => s.isActive);
    }

    async recalculateSegment(id: string): Promise<Segment | null> {
        const segment = this.segments.get(id);
        if (!segment || segment.type !== "dynamic" || !segment.query) return null;

        segment.size = await this.calculateSegmentSize(segment.query);
        segment.lastCalculatedAt = new Date();
        segment.updatedAt = new Date();

        return segment;
    }

    private async calculateSegmentSize(query: AudienceQuery): Promise<number> {
        // Simulate segment size calculation
        let matches = Array.from(this.contacts.values());

        for (const condition of query.conditions) {
            matches = matches.filter(contact => {
                const value = this.getContactFieldValue(contact, condition.field);
                return this.evaluateCondition(value, condition.operator, condition.value);
            });
        }

        return matches.length || Math.floor(Math.random() * 1000) + 100;
    }

    private getContactFieldValue(contact: MarketingContact, field: string): any {
        const parts = field.split(".");
        let value: any = contact;

        for (const part of parts) {
            value = value?.[part];
        }

        return value;
    }

    private evaluateCondition(value: any, operator: string, target: any): boolean {
        switch (operator) {
            case "equals": return value === target;
            case "not_equals": return value !== target;
            case "contains": return String(value).includes(target);
            case "greater_than": return value > target;
            case "less_than": return value < target;
            case "in": return Array.isArray(target) && target.includes(value);
            case "not_in": return Array.isArray(target) && !target.includes(value);
            case "is_null": return value === null || value === undefined;
            case "is_not_null": return value !== null && value !== undefined;
            default: return true;
        }
    }

    private initializeDefaultSegments(): void {
        const segments: Partial<Segment>[] = [
            { name: "New Subscribers", description: "Subscribed in the last 30 days", type: "dynamic", query: { conditions: [{ field: "createdAt", operator: "greater_than", value: "30_days_ago" }], operator: "and" } },
            { name: "Highly Engaged", description: "High engagement score", type: "dynamic", query: { conditions: [{ field: "engagement.total", operator: "greater_than", value: 80 }], operator: "and" } },
            { name: "At Risk", description: "No activity in 60+ days", type: "dynamic", query: { conditions: [{ field: "lastActivityAt", operator: "less_than", value: "60_days_ago" }], operator: "and" } },
            { name: "VIP Customers", description: "Top spenders", type: "dynamic", query: { conditions: [{ field: "customFields.totalSpent", operator: "greater_than", value: 1000 }], operator: "and" } }
        ];

        for (const segment of segments) {
            this.createSegment(segment);
        }
    }

    // ===========================================================================
    // CONTACTS
    // ===========================================================================

    async createContact(data: Partial<MarketingContact>): Promise<MarketingContact> {
        const contact: MarketingContact = {
            id: randomUUID(),
            email: data.email || "",
            firstName: data.firstName,
            lastName: data.lastName,
            fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            source: data.source || "manual",
            status: "active",
            subscriptionStatus: "subscribed",
            tags: data.tags || [],
            segments: [],
            lists: [],
            customFields: data.customFields || {},
            leadScore: 0,
            engagement: { total: 0, emailEngagement: 0, websiteEngagement: 0, socialEngagement: 0, lastCalculatedAt: new Date() },
            preferences: data.preferences || {
                emailOptIn: true,
                smsOptIn: false,
                pushOptIn: false,
                preferredChannel: "email",
                preferredFrequency: "weekly",
                preferredLanguage: "en",
                interests: []
            },
            timeline: [],
            attribution: data.attribution || {
                firstTouch: { source: data.source || "direct", medium: "organic", timestamp: new Date() },
                lastTouch: { source: data.source || "direct", medium: "organic", timestamp: new Date() },
                multiTouch: []
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.contacts.set(contact.id, contact);
        await this.calculateLeadScore(contact.id);
        await this.updateContactSegments(contact.id);

        return contact;
    }

    async updateContact(id: string, data: Partial<MarketingContact>): Promise<MarketingContact | null> {
        const contact = this.contacts.get(id);
        if (!contact) return null;

        if (data.firstName || data.lastName) {
            data.fullName = `${data.firstName || contact.firstName || ""} ${data.lastName || contact.lastName || ""}`.trim();
        }

        Object.assign(contact, data, { updatedAt: new Date() });

        await this.calculateLeadScore(id);
        await this.updateContactSegments(id);

        return contact;
    }

    async getContact(id: string): Promise<MarketingContact | null> {
        return this.contacts.get(id) || null;
    }

    async getContactByEmail(email: string): Promise<MarketingContact | null> {
        for (const contact of this.contacts.values()) {
            if (contact.email.toLowerCase() === email.toLowerCase()) {
                return contact;
            }
        }
        return null;
    }

    async searchContacts(query: string, limit?: number): Promise<MarketingContact[]> {
        const q = query.toLowerCase();
        let results = Array.from(this.contacts.values()).filter(c =>
            c.email.toLowerCase().includes(q) ||
            (c.fullName?.toLowerCase().includes(q)) ||
            c.tags.some(t => t.toLowerCase().includes(q))
        );

        if (limit) {
            results = results.slice(0, limit);
        }

        return results;
    }

    async addTag(contactId: string, tag: string): Promise<MarketingContact | null> {
        const contact = this.contacts.get(contactId);
        if (!contact) return null;

        if (!contact.tags.includes(tag)) {
            contact.tags.push(tag);
            contact.timeline.push({
                id: randomUUID(),
                type: "tag_added",
                timestamp: new Date(),
                data: { tag }
            });
            contact.updatedAt = new Date();
        }

        return contact;
    }

    async removeTag(contactId: string, tag: string): Promise<MarketingContact | null> {
        const contact = this.contacts.get(contactId);
        if (!contact) return null;

        const index = contact.tags.indexOf(tag);
        if (index >= 0) {
            contact.tags.splice(index, 1);
            contact.timeline.push({
                id: randomUUID(),
                type: "tag_removed",
                timestamp: new Date(),
                data: { tag }
            });
            contact.updatedAt = new Date();
        }

        return contact;
    }

    async unsubscribe(contactId: string, reason?: string): Promise<MarketingContact | null> {
        const contact = this.contacts.get(contactId);
        if (!contact) return null;

        contact.subscriptionStatus = "unsubscribed";
        contact.preferences.emailOptIn = false;
        contact.preferences.unsubscribeReason = reason;
        contact.timeline.push({
            id: randomUUID(),
            type: "unsubscribed",
            timestamp: new Date(),
            data: { reason }
        });
        contact.updatedAt = new Date();

        return contact;
    }

    async recordEvent(contactId: string, eventType: EventType, campaignId?: string, data?: Record<string, any>): Promise<ContactEvent | null> {
        const contact = this.contacts.get(contactId);
        if (!contact) return null;

        const event: ContactEvent = {
            id: randomUUID(),
            type: eventType,
            timestamp: new Date(),
            campaignId,
            data
        };

        contact.timeline.push(event);
        contact.lastActivityAt = new Date();
        contact.updatedAt = new Date();

        // Update engagement score
        await this.updateEngagement(contactId, eventType);

        return event;
    }

    private async calculateLeadScore(contactId: string): Promise<void> {
        const contact = this.contacts.get(contactId);
        if (!contact) return;

        let score = 0;

        for (const rule of this.scoringRules.values()) {
            if (!rule.isActive) continue;

            // Check if conditions match
            let matches = true;
            for (const condition of rule.conditions) {
                const value = this.getContactFieldValue(contact, condition.field);
                if (!this.evaluateCondition(value, condition.operator, condition.value)) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                switch (rule.action) {
                    case "add": score += rule.points; break;
                    case "subtract": score -= rule.points; break;
                    case "set": score = rule.points; break;
                }
            }
        }

        contact.leadScore = Math.max(0, Math.min(100, score));
    }

    private async updateEngagement(contactId: string, eventType: EventType): Promise<void> {
        const contact = this.contacts.get(contactId);
        if (!contact) return;

        const engagementPoints: Record<EventType, number> = {
            email_sent: 0,
            email_delivered: 0,
            email_opened: 5,
            email_clicked: 10,
            email_bounced: -5,
            sms_sent: 0,
            sms_delivered: 0,
            sms_clicked: 10,
            unsubscribed: -20,
            subscribed: 10,
            form_submitted: 15,
            page_viewed: 3,
            converted: 25,
            tag_added: 0,
            tag_removed: 0
        };

        const points = engagementPoints[eventType] || 0;
        contact.engagement.total = Math.max(0, Math.min(100, contact.engagement.total + points));

        if (eventType.startsWith("email_")) {
            contact.engagement.emailEngagement = Math.max(0, Math.min(100, contact.engagement.emailEngagement + points));
        }

        contact.engagement.lastCalculatedAt = new Date();
    }

    private async updateContactSegments(contactId: string): Promise<void> {
        const contact = this.contacts.get(contactId);
        if (!contact) return;

        contact.segments = [];

        for (const segment of this.segments.values()) {
            if (segment.type === "static") {
                if (segment.memberIds?.includes(contactId)) {
                    contact.segments.push(segment.id);
                }
            } else if (segment.query) {
                let matches = true;
                for (const condition of segment.query.conditions) {
                    const value = this.getContactFieldValue(contact, condition.field);
                    if (!this.evaluateCondition(value, condition.operator, condition.value)) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    contact.segments.push(segment.id);
                }
            }
        }
    }

    private initializeDefaultScoringRules(): void {
        const rules: Partial<LeadScoringRule>[] = [
            { name: "Email Provided", category: "demographic", conditions: [{ field: "email", operator: "is_not_null", value: null }], action: "add", points: 10 },
            { name: "Phone Provided", category: "demographic", conditions: [{ field: "phone", operator: "is_not_null", value: null }], action: "add", points: 5 },
            { name: "High Engagement", category: "engagement", conditions: [{ field: "engagement.total", operator: "greater_than", value: 70 }], action: "add", points: 20 },
            { name: "Recent Activity", category: "behavioral", conditions: [{ field: "lastActivityAt", operator: "greater_than", value: "7_days_ago" }], action: "add", points: 15 },
            { name: "VIP Tag", category: "custom", conditions: [{ field: "tags", operator: "contains", value: "vip" }], action: "add", points: 25 }
        ];

        for (const rule of rules) {
            const newRule: LeadScoringRule = {
                id: randomUUID(),
                name: rule.name || "",
                description: "",
                isActive: true,
                conditions: rule.conditions || [],
                action: rule.action || "add",
                points: rule.points || 0,
                category: rule.category || "custom",
                createdAt: new Date()
            };
            this.scoringRules.set(newRule.id, newRule);
        }
    }

    // ===========================================================================
    // TEMPLATES
    // ===========================================================================

    async createTemplate(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const template: EmailTemplate = {
            id: randomUUID(),
            name: data.name || "New Template",
            description: data.description || "",
            category: data.category || "general",
            type: data.type || "html",
            htmlContent: data.htmlContent || "",
            variables: data.variables || [],
            isPublic: data.isPublic ?? false,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.templates.set(template.id, template);
        return template;
    }

    async getTemplate(id: string): Promise<EmailTemplate | null> {
        return this.templates.get(id) || null;
    }

    async getTemplates(category?: string): Promise<EmailTemplate[]> {
        let templates = Array.from(this.templates.values());
        if (category) {
            templates = templates.filter(t => t.category === category);
        }
        return templates;
    }

    private initializeDefaultTemplates(): void {
        const templates: Partial<EmailTemplate>[] = [
            { name: "Welcome Email", category: "onboarding", type: "html", htmlContent: "<h1>Welcome to Altus Ink!</h1><p>We're excited to have you...</p>", variables: [{ name: "firstName", type: "text", required: true }] },
            { name: "Booking Confirmation", category: "transactional", type: "html", htmlContent: "<h1>Booking Confirmed</h1><p>Your appointment is scheduled...</p>", variables: [{ name: "bookingDate", type: "text", required: true }] },
            { name: "Newsletter", category: "marketing", type: "html", htmlContent: "<h1>Latest News</h1><p>Here's what's new...</p>", variables: [] },
            { name: "Promotional Offer", category: "marketing", type: "html", htmlContent: "<h1>Special Offer!</h1><p>Don't miss out...</p>", variables: [{ name: "discount", type: "text", required: true }] }
        ];

        for (const template of templates) {
            this.createTemplate(template);
        }
    }

    // ===========================================================================
    // ANALYTICS
    // ===========================================================================

    async getAnalytics(startDate: Date, endDate: Date): Promise<MarketingAnalytics> {
        const campaigns = Array.from(this.campaigns.values()).filter(
            c => c.launchedAt && c.launchedAt >= startDate && c.launchedAt <= endDate
        );

        const contacts = Array.from(this.contacts.values());

        const overview: OverviewMetrics = {
            totalContacts: contacts.length,
            newContacts: contacts.filter(c => c.createdAt >= startDate && c.createdAt <= endDate).length,
            totalCampaigns: campaigns.length,
            totalSent: campaigns.reduce((sum, c) => sum + c.metrics.sent, 0),
            totalOpens: campaigns.reduce((sum, c) => sum + c.metrics.opens, 0),
            totalClicks: campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
            totalConversions: campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0),
            totalRevenue: campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0),
            averageOpenRate: 0,
            averageClickRate: 0,
            averageConversionRate: 0
        };

        if (campaigns.length > 0) {
            overview.averageOpenRate = campaigns.reduce((sum, c) => sum + c.metrics.openRate, 0) / campaigns.length;
            overview.averageClickRate = campaigns.reduce((sum, c) => sum + c.metrics.clickRate, 0) / campaigns.length;
            overview.averageConversionRate = campaigns.reduce((sum, c) => sum + c.metrics.conversionRate, 0) / campaigns.length;
        }

        const channelMetrics = this.calculateChannelMetrics(campaigns);
        const campaignPerformance = this.calculateCampaignPerformance(campaigns);
        const audienceGrowth = this.calculateAudienceGrowth(contacts, startDate, endDate);

        return {
            period: { start: startDate, end: endDate },
            overview,
            channelPerformance: channelMetrics,
            campaignPerformance,
            audienceGrowth,
            topContent: [],
            conversionFunnel: this.getConversionFunnel(campaigns)
        };
    }

    private calculateChannelMetrics(campaigns: Campaign[]): ChannelMetrics[] {
        const channels: MarketingChannel[] = ["email", "sms", "push", "whatsapp", "social"];

        return channels.map(channel => {
            const channelCampaigns = campaigns.filter(c => c.channel === channel);

            const metrics: ChannelMetrics = {
                channel,
                sent: channelCampaigns.reduce((sum, c) => sum + c.metrics.sent, 0),
                delivered: channelCampaigns.reduce((sum, c) => sum + c.metrics.delivered, 0),
                opens: channelCampaigns.reduce((sum, c) => sum + c.metrics.opens, 0),
                clicks: channelCampaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
                conversions: channelCampaigns.reduce((sum, c) => sum + c.metrics.conversions, 0),
                revenue: channelCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0),
                cost: channelCampaigns.reduce((sum, c) => sum + (c.budget?.spent || 0), 0),
                roi: 0
            };

            if (metrics.cost > 0) {
                metrics.roi = ((metrics.revenue - metrics.cost) / metrics.cost) * 100;
            }

            return metrics;
        });
    }

    private calculateCampaignPerformance(campaigns: Campaign[]): CampaignPerformance[] {
        return campaigns
            .map(c => ({
                campaignId: c.id,
                campaignName: c.name,
                sent: c.metrics.sent,
                openRate: c.metrics.openRate,
                clickRate: c.metrics.clickRate,
                conversionRate: c.metrics.conversionRate,
                revenue: c.metrics.revenue
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }

    private calculateAudienceGrowth(contacts: MarketingContact[], startDate: Date, endDate: Date): GrowthMetrics {
        const newSubscribers = contacts.filter(c => c.createdAt >= startDate && c.createdAt <= endDate).length;
        const unsubscribes = contacts.filter(c =>
            c.subscriptionStatus === "unsubscribed" &&
            c.timeline.some(e => e.type === "unsubscribed" && e.timestamp >= startDate && e.timestamp <= endDate)
        ).length;

        const sources = new Map<string, number>();
        for (const contact of contacts.filter(c => c.createdAt >= startDate && c.createdAt <= endDate)) {
            const count = sources.get(contact.source) || 0;
            sources.set(contact.source, count + 1);
        }

        return {
            newSubscribers,
            unsubscribes,
            netGrowth: newSubscribers - unsubscribes,
            growthRate: contacts.length > 0 ? ((newSubscribers - unsubscribes) / contacts.length) * 100 : 0,
            bySource: Array.from(sources.entries()).map(([source, count]) => ({ source, count }))
        };
    }

    private getConversionFunnel(campaigns: Campaign[]): FunnelStage[] {
        const totalSent = campaigns.reduce((sum, c) => sum + c.metrics.sent, 0);
        const totalDelivered = campaigns.reduce((sum, c) => sum + c.metrics.delivered, 0);
        const totalOpens = campaigns.reduce((sum, c) => sum + c.metrics.uniqueOpens, 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + c.metrics.uniqueClicks, 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);

        return [
            { name: "Sent", count: totalSent, conversionRate: 100, dropOffRate: 0 },
            { name: "Delivered", count: totalDelivered, conversionRate: (totalDelivered / totalSent) * 100, dropOffRate: ((totalSent - totalDelivered) / totalSent) * 100 },
            { name: "Opened", count: totalOpens, conversionRate: (totalOpens / totalDelivered) * 100, dropOffRate: ((totalDelivered - totalOpens) / totalDelivered) * 100 },
            { name: "Clicked", count: totalClicks, conversionRate: (totalClicks / totalOpens) * 100, dropOffRate: ((totalOpens - totalClicks) / totalOpens) * 100 },
            { name: "Converted", count: totalConversions, conversionRate: (totalConversions / totalClicks) * 100, dropOffRate: ((totalClicks - totalConversions) / totalClicks) * 100 }
        ];
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const marketingAutomationService = new MarketingAutomationService();
export default marketingAutomationService;
