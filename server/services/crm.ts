/**
 * ALTUS INK - ENTERPRISE CRM SERVICE
 * Complete Customer Relationship Management System
 * 
 * Features:
 * - Customer profiles and segmentation
 * - Lead management and scoring
 * - Sales pipeline
 * - Communication history
 * - Campaign management
 * - Customer journey tracking
 * - Loyalty programs
 * - Referral system
 * - Customer health scores
 * - Churn prediction
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Customer {
    id: string;
    externalId?: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    locale: string;
    timezone: string;
    source: CustomerSource;
    status: CustomerStatus;
    segment: CustomerSegment;
    tags: string[];
    customFields: Record<string, any>;
    address?: Address;
    socialProfiles: SocialProfile[];
    preferences: CustomerPreferences;
    metrics: CustomerMetrics;
    healthScore: number;
    lifetimeValue: number;
    acquisitionCost?: number;
    firstContactAt: Date;
    lastContactAt?: Date;
    lastActivityAt?: Date;
    convertedAt?: Date;
    churnedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type CustomerSource =
    | "organic"
    | "referral"
    | "paid_ads"
    | "social_media"
    | "email_campaign"
    | "partner"
    | "event"
    | "direct"
    | "other";

export type CustomerStatus =
    | "lead"
    | "prospect"
    | "active"
    | "inactive"
    | "churned"
    | "blocked";

export type CustomerSegment =
    | "new"
    | "casual"
    | "regular"
    | "loyal"
    | "vip"
    | "at_risk"
    | "dormant"
    | "lost";

export interface Address {
    street: string;
    street2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    type: "home" | "work" | "other";
}

export interface SocialProfile {
    platform: "instagram" | "facebook" | "twitter" | "tiktok" | "linkedin" | "other";
    username: string;
    url: string;
    followers?: number;
    verified: boolean;
}

export interface CustomerPreferences {
    communicationChannels: ("email" | "sms" | "whatsapp" | "push")[];
    marketingOptIn: boolean;
    preferredLanguage: string;
    preferredArtistStyles: string[];
    preferredTimes: string[];
    specialRequirements?: string;
}

export interface CustomerMetrics {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowCount: number;
    totalSpent: number;
    averageOrderValue: number;
    bookingFrequency: number;
    daysSinceLastBooking: number;
    referralCount: number;
    reviewsGiven: number;
    averageRating: number;
    supportTickets: number;
    emailOpenRate: number;
    clickThroughRate: number;
}

export interface Lead {
    id: string;
    customerId?: string;
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    source: CustomerSource;
    campaign?: string;
    status: LeadStatus;
    score: number;
    priority: "low" | "medium" | "high" | "urgent";
    assignedTo?: string;
    interestedIn: string[];
    budget?: number;
    timeframe?: string;
    notes: string;
    activities: LeadActivity[];
    qualificationAnswers: Record<string, any>;
    nextFollowUp?: Date;
    convertedAt?: Date;
    lostReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type LeadStatus =
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "converted"
    | "lost"
    | "disqualified";

export interface LeadActivity {
    id: string;
    type: LeadActivityType;
    description: string;
    outcome?: string;
    performedBy: string;
    performedAt: Date;
    metadata?: Record<string, any>;
}

export type LeadActivityType =
    | "call"
    | "email"
    | "meeting"
    | "demo"
    | "proposal_sent"
    | "follow_up"
    | "note"
    | "status_change"
    | "assignment";

export interface Campaign {
    id: string;
    name: string;
    description: string;
    type: CampaignType;
    status: CampaignStatus;
    channel: CampaignChannel;
    targetAudience: AudienceFilter;
    content: CampaignContent;
    schedule: CampaignSchedule;
    budget?: number;
    spent: number;
    metrics: CampaignMetrics;
    abTest?: ABTest;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

export type CampaignType =
    | "email"
    | "sms"
    | "whatsapp"
    | "push"
    | "social"
    | "retargeting"
    | "referral"
    | "loyalty";

export type CampaignStatus =
    | "draft"
    | "scheduled"
    | "running"
    | "paused"
    | "completed"
    | "cancelled";

export type CampaignChannel =
    | "email"
    | "sms"
    | "whatsapp"
    | "push"
    | "facebook"
    | "instagram"
    | "google_ads";

export interface AudienceFilter {
    segments?: CustomerSegment[];
    tags?: string[];
    lastActivityDays?: number;
    minLifetimeValue?: number;
    maxLifetimeValue?: number;
    location?: string[];
    preferredStyles?: string[];
    customFilters?: Record<string, any>;
}

export interface CampaignContent {
    subject?: string;
    preheader?: string;
    body: string;
    htmlBody?: string;
    callToAction?: string;
    ctaUrl?: string;
    images?: string[];
    attachments?: string[];
    personalization: string[];
}

export interface CampaignSchedule {
    type: "immediate" | "scheduled" | "recurring";
    sendAt?: Date;
    recurrence?: {
        frequency: "daily" | "weekly" | "monthly";
        dayOfWeek?: number[];
        dayOfMonth?: number;
        time: string;
        endDate?: Date;
    };
    timezone: string;
}

export interface CampaignMetrics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
    bounced: number;
    complained: number;
    revenue: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    roi: number;
}

export interface ABTest {
    enabled: boolean;
    variants: ABVariant[];
    winningCriteria: "open_rate" | "click_rate" | "conversion_rate";
    sampleSize: number;
    duration: number;
    winnerId?: string;
    completedAt?: Date;
}

export interface ABVariant {
    id: string;
    name: string;
    content: CampaignContent;
    percentage: number;
    metrics: CampaignMetrics;
}

export interface LoyaltyProgram {
    id: string;
    name: string;
    description: string;
    type: "points" | "tiers" | "cashback" | "hybrid";
    status: "active" | "paused" | "ended";
    rules: LoyaltyRule[];
    tiers?: LoyaltyTier[];
    rewards: LoyaltyReward[];
    members: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoyaltyRule {
    id: string;
    name: string;
    type: "earn" | "bonus" | "multiplier";
    trigger: string;
    condition?: string;
    points: number;
    multiplier?: number;
    maxPerDay?: number;
    validFrom?: Date;
    validTo?: Date;
}

export interface LoyaltyTier {
    id: string;
    name: string;
    minPoints: number;
    benefits: string[];
    multiplier: number;
    icon: string;
    color: string;
}

export interface LoyaltyReward {
    id: string;
    name: string;
    description: string;
    type: "discount" | "free_service" | "gift" | "experience";
    pointsCost: number;
    value: number;
    stock?: number;
    claimed: number;
    validDays: number;
    terms: string;
    image?: string;
}

export interface CustomerMembership {
    id: string;
    customerId: string;
    programId: string;
    tierId?: string;
    points: number;
    lifetimePoints: number;
    status: "active" | "suspended" | "expired";
    joinedAt: Date;
    lastEarnedAt?: Date;
    lastRedeemedAt?: Date;
    tierAchievedAt?: Date;
    expiresAt?: Date;
}

export interface PointTransaction {
    id: string;
    membershipId: string;
    type: "earn" | "redeem" | "expire" | "adjust" | "transfer";
    points: number;
    balance: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
    expiresAt?: Date;
    createdAt: Date;
}

export interface ReferralProgram {
    id: string;
    name: string;
    status: "active" | "paused" | "ended";
    referrerReward: ReferralReward;
    refereeReward: ReferralReward;
    requirements: ReferralRequirements;
    limits: ReferralLimits;
    metrics: ReferralMetrics;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReferralReward {
    type: "discount" | "credit" | "points" | "cash";
    value: number;
    currency?: string;
    description: string;
}

export interface ReferralRequirements {
    minPurchase?: number;
    specificServices?: string[];
    newCustomerOnly: boolean;
    verificationRequired: boolean;
}

export interface ReferralLimits {
    maxReferralsPerCustomer?: number;
    maxRewardsPerMonth?: number;
    validDays: number;
}

export interface ReferralMetrics {
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalRewardsGiven: number;
    revenueGenerated: number;
    conversionRate: number;
}

export interface Referral {
    id: string;
    programId: string;
    referrerId: string;
    refereeEmail: string;
    refereeId?: string;
    code: string;
    status: "pending" | "signed_up" | "converted" | "rewarded" | "expired" | "cancelled";
    referrerRewardStatus: "pending" | "eligible" | "paid" | "cancelled";
    refereeRewardStatus: "pending" | "eligible" | "redeemed" | "expired";
    refereeSignedUpAt?: Date;
    refereeConvertedAt?: Date;
    referrerRewardedAt?: Date;
    refereeRewardedAt?: Date;
    expiresAt: Date;
    createdAt: Date;
}

export interface CustomerJourney {
    id: string;
    customerId: string;
    stages: JourneyStage[];
    currentStage: string;
    startedAt: Date;
    completedAt?: Date;
    conversionValue?: number;
}

export interface JourneyStage {
    name: string;
    enteredAt: Date;
    exitedAt?: Date;
    duration?: number;
    events: JourneyEvent[];
    score: number;
}

export interface JourneyEvent {
    id: string;
    type: string;
    timestamp: Date;
    channel: string;
    description: string;
    metadata?: Record<string, any>;
}

export interface CustomerNote {
    id: string;
    customerId: string;
    type: "general" | "call" | "meeting" | "issue" | "preference";
    content: string;
    isPinned: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerTask {
    id: string;
    customerId: string;
    title: string;
    description?: string;
    type: "follow_up" | "call" | "email" | "meeting" | "review" | "other";
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "in_progress" | "completed" | "cancelled";
    assignedTo: string;
    dueAt: Date;
    completedAt?: Date;
    reminderAt?: Date;
    createdAt: Date;
}

export interface CommunicationLog {
    id: string;
    customerId: string;
    channel: "email" | "sms" | "whatsapp" | "phone" | "in_person" | "chat";
    direction: "inbound" | "outbound";
    type: string;
    subject?: string;
    content: string;
    status: "sent" | "delivered" | "read" | "replied" | "failed";
    sentiment?: "positive" | "neutral" | "negative";
    handledBy?: string;
    duration?: number;
    attachments?: string[];
    metadata?: Record<string, any>;
    createdAt: Date;
}

// =============================================================================
// CRM SERVICE CLASS
// =============================================================================

export class CRMService {
    private customers: Map<string, Customer> = new Map();
    private leads: Map<string, Lead> = new Map();
    private campaigns: Map<string, Campaign> = new Map();
    private loyaltyPrograms: Map<string, LoyaltyProgram> = new Map();
    private memberships: Map<string, CustomerMembership> = new Map();
    private referralPrograms: Map<string, ReferralProgram> = new Map();
    private referrals: Map<string, Referral> = new Map();
    private journeys: Map<string, CustomerJourney> = new Map();
    private notes: Map<string, CustomerNote[]> = new Map();
    private tasks: Map<string, CustomerTask[]> = new Map();
    private communications: Map<string, CommunicationLog[]> = new Map();

    // ===========================================================================
    // CUSTOMER MANAGEMENT
    // ===========================================================================

    async createCustomer(data: Partial<Customer>): Promise<Customer> {
        const customer: Customer = {
            id: randomUUID(),
            email: data.email || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            locale: data.locale || "en",
            timezone: data.timezone || "UTC",
            source: data.source || "direct",
            status: "lead",
            segment: "new",
            tags: data.tags || [],
            customFields: data.customFields || {},
            socialProfiles: data.socialProfiles || [],
            preferences: data.preferences || {
                communicationChannels: ["email"],
                marketingOptIn: false,
                preferredLanguage: "en",
                preferredArtistStyles: [],
                preferredTimes: []
            },
            metrics: this.initializeMetrics(),
            healthScore: 50,
            lifetimeValue: 0,
            firstContactAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.customers.set(customer.id, customer);
        await this.initializeJourney(customer.id);
        return customer;
    }

    async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
        const customer = this.customers.get(id);
        if (!customer) return null;

        const updated: Customer = {
            ...customer,
            ...data,
            fullName: `${data.firstName || customer.firstName} ${data.lastName || customer.lastName}`.trim(),
            updatedAt: new Date()
        };

        this.customers.set(id, updated);
        return updated;
    }

    async getCustomer(id: string): Promise<Customer | null> {
        return this.customers.get(id) || null;
    }

    async getCustomerByEmail(email: string): Promise<Customer | null> {
        for (const customer of this.customers.values()) {
            if (customer.email.toLowerCase() === email.toLowerCase()) {
                return customer;
            }
        }
        return null;
    }

    async searchCustomers(query: string, filters?: Partial<AudienceFilter>): Promise<Customer[]> {
        let results = Array.from(this.customers.values());

        if (query) {
            const q = query.toLowerCase();
            results = results.filter(c =>
                c.email.toLowerCase().includes(q) ||
                c.fullName.toLowerCase().includes(q) ||
                c.phone?.includes(q) ||
                c.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        if (filters) {
            if (filters.segments?.length) {
                results = results.filter(c => filters.segments!.includes(c.segment));
            }
            if (filters.tags?.length) {
                results = results.filter(c =>
                    filters.tags!.some(t => c.tags.includes(t))
                );
            }
            if (filters.minLifetimeValue !== undefined) {
                results = results.filter(c => c.lifetimeValue >= filters.minLifetimeValue!);
            }
            if (filters.maxLifetimeValue !== undefined) {
                results = results.filter(c => c.lifetimeValue <= filters.maxLifetimeValue!);
            }
        }

        return results;
    }

    async segmentCustomers(): Promise<void> {
        const now = new Date();

        for (const customer of this.customers.values()) {
            const daysSinceLastBooking = customer.metrics.daysSinceLastBooking;
            const totalBookings = customer.metrics.totalBookings;
            const ltv = customer.lifetimeValue;

            let segment: CustomerSegment = "new";

            if (customer.status === "churned" || daysSinceLastBooking > 365) {
                segment = "lost";
            } else if (daysSinceLastBooking > 180) {
                segment = "dormant";
            } else if (daysSinceLastBooking > 90 && totalBookings > 2) {
                segment = "at_risk";
            } else if (ltv > 5000 || totalBookings > 10) {
                segment = "vip";
            } else if (totalBookings > 5 || ltv > 2000) {
                segment = "loyal";
            } else if (totalBookings > 2) {
                segment = "regular";
            } else if (totalBookings > 0) {
                segment = "casual";
            }

            customer.segment = segment;
            customer.updatedAt = now;
        }
    }

    async calculateHealthScore(customerId: string): Promise<number> {
        const customer = this.customers.get(customerId);
        if (!customer) return 0;

        let score = 50;

        // Recency (how recently they booked)
        if (customer.metrics.daysSinceLastBooking < 30) score += 20;
        else if (customer.metrics.daysSinceLastBooking < 90) score += 10;
        else if (customer.metrics.daysSinceLastBooking > 180) score -= 20;

        // Frequency (how often they book)
        if (customer.metrics.bookingFrequency > 4) score += 15;
        else if (customer.metrics.bookingFrequency > 2) score += 10;
        else if (customer.metrics.bookingFrequency < 1) score -= 10;

        // Monetary (how much they spend)
        if (customer.lifetimeValue > 5000) score += 15;
        else if (customer.lifetimeValue > 2000) score += 10;
        else if (customer.lifetimeValue > 1000) score += 5;

        // Engagement
        if (customer.metrics.emailOpenRate > 0.5) score += 5;
        if (customer.metrics.reviewsGiven > 0) score += 5;
        if (customer.metrics.referralCount > 0) score += 10;

        // Negative factors
        if (customer.metrics.noShowCount > 2) score -= 15;
        if (customer.metrics.cancelledBookings > customer.metrics.completedBookings * 0.3) score -= 10;

        customer.healthScore = Math.max(0, Math.min(100, score));
        return customer.healthScore;
    }

    async predictChurn(customerId: string): Promise<{ probability: number; factors: string[] }> {
        const customer = this.customers.get(customerId);
        if (!customer) return { probability: 0, factors: [] };

        let probability = 0;
        const factors: string[] = [];

        // Days since last activity
        if (customer.metrics.daysSinceLastBooking > 180) {
            probability += 0.3;
            factors.push("No activity in 6+ months");
        } else if (customer.metrics.daysSinceLastBooking > 90) {
            probability += 0.15;
            factors.push("No activity in 3+ months");
        }

        // Declining engagement
        if (customer.metrics.emailOpenRate < 0.1) {
            probability += 0.15;
            factors.push("Low email engagement");
        }

        // High cancellation rate
        const cancelRate = customer.metrics.cancelledBookings /
            (customer.metrics.totalBookings || 1);
        if (cancelRate > 0.3) {
            probability += 0.2;
            factors.push("High cancellation rate");
        }

        // No shows
        if (customer.metrics.noShowCount > 2) {
            probability += 0.1;
            factors.push("Multiple no-shows");
        }

        // Low LTV growth
        if (customer.metrics.totalBookings > 3 &&
            customer.metrics.averageOrderValue < 100) {
            probability += 0.1;
            factors.push("Stagnant spending");
        }

        return {
            probability: Math.min(1, probability),
            factors
        };
    }

    private initializeMetrics(): CustomerMetrics {
        return {
            totalBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            noShowCount: 0,
            totalSpent: 0,
            averageOrderValue: 0,
            bookingFrequency: 0,
            daysSinceLastBooking: 0,
            referralCount: 0,
            reviewsGiven: 0,
            averageRating: 0,
            supportTickets: 0,
            emailOpenRate: 0,
            clickThroughRate: 0
        };
    }

    // ===========================================================================
    // LEAD MANAGEMENT
    // ===========================================================================

    async createLead(data: Partial<Lead>): Promise<Lead> {
        const lead: Lead = {
            id: randomUUID(),
            email: data.email || "",
            source: data.source || "direct",
            status: "new",
            score: this.calculateLeadScore(data),
            priority: "medium",
            interestedIn: data.interestedIn || [],
            notes: data.notes || "",
            activities: [],
            qualificationAnswers: data.qualificationAnswers || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.leads.set(lead.id, lead);
        await this.addLeadActivity(lead.id, {
            type: "note",
            description: "Lead created",
            performedBy: "system"
        });

        return lead;
    }

    async updateLead(id: string, data: Partial<Lead>): Promise<Lead | null> {
        const lead = this.leads.get(id);
        if (!lead) return null;

        const oldStatus = lead.status;
        const updated: Lead = {
            ...lead,
            ...data,
            score: this.calculateLeadScore({ ...lead, ...data }),
            updatedAt: new Date()
        };

        if (data.status && data.status !== oldStatus) {
            await this.addLeadActivity(id, {
                type: "status_change",
                description: `Status changed from ${oldStatus} to ${data.status}`,
                performedBy: "system"
            });
        }

        this.leads.set(id, updated);
        return updated;
    }

    async getLead(id: string): Promise<Lead | null> {
        return this.leads.get(id) || null;
    }

    async getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
        return Array.from(this.leads.values()).filter(l => l.status === status);
    }

    async assignLead(leadId: string, userId: string): Promise<Lead | null> {
        const lead = this.leads.get(leadId);
        if (!lead) return null;

        lead.assignedTo = userId;
        lead.updatedAt = new Date();

        await this.addLeadActivity(leadId, {
            type: "assignment",
            description: `Lead assigned to ${userId}`,
            performedBy: "system"
        });

        return lead;
    }

    async addLeadActivity(leadId: string, activity: Omit<LeadActivity, "id" | "performedAt">): Promise<void> {
        const lead = this.leads.get(leadId);
        if (!lead) return;

        lead.activities.push({
            id: randomUUID(),
            performedAt: new Date(),
            ...activity
        });
        lead.updatedAt = new Date();
    }

    async convertLead(leadId: string): Promise<Customer | null> {
        const lead = this.leads.get(leadId);
        if (!lead) return null;

        const customer = await this.createCustomer({
            email: lead.email,
            phone: lead.phone,
            firstName: lead.firstName,
            lastName: lead.lastName,
            source: lead.source,
            status: "active",
            customFields: lead.qualificationAnswers
        });

        lead.status = "converted";
        lead.customerId = customer.id;
        lead.convertedAt = new Date();
        lead.updatedAt = new Date();

        await this.addLeadActivity(leadId, {
            type: "status_change",
            description: `Lead converted to customer ${customer.id}`,
            performedBy: "system"
        });

        return customer;
    }

    private calculateLeadScore(data: Partial<Lead>): number {
        let score = 0;

        // Source scoring
        const sourceScores: Record<CustomerSource, number> = {
            referral: 30,
            organic: 25,
            direct: 20,
            paid_ads: 15,
            social_media: 15,
            email_campaign: 20,
            partner: 25,
            event: 20,
            other: 10
        };
        score += sourceScores[data.source || "other"] || 10;

        // Contact info completeness
        if (data.email) score += 10;
        if (data.phone) score += 10;
        if (data.firstName && data.lastName) score += 10;

        // Interest signals
        if (data.interestedIn?.length) score += data.interestedIn.length * 5;
        if (data.budget && data.budget > 500) score += 15;
        if (data.timeframe === "immediate") score += 20;

        // Activity
        if (data.activities?.length) score += Math.min(data.activities.length * 5, 20);

        return Math.min(100, score);
    }

    // ===========================================================================
    // CAMPAIGN MANAGEMENT
    // ===========================================================================

    async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
        const campaign: Campaign = {
            id: randomUUID(),
            name: data.name || "Untitled Campaign",
            description: data.description || "",
            type: data.type || "email",
            status: "draft",
            channel: data.channel || "email",
            targetAudience: data.targetAudience || {},
            content: data.content || { body: "", personalization: [] },
            schedule: data.schedule || { type: "immediate", timezone: "UTC" },
            spent: 0,
            metrics: this.initializeCampaignMetrics(),
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

        if (campaign.status === "running" || campaign.status === "completed") {
            throw new Error("Cannot update a running or completed campaign");
        }

        const updated: Campaign = {
            ...campaign,
            ...data,
            updatedAt: new Date()
        };

        this.campaigns.set(id, updated);
        return updated;
    }

    async startCampaign(id: string): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign) return null;

        if (campaign.status !== "draft" && campaign.status !== "scheduled") {
            throw new Error("Campaign cannot be started");
        }

        campaign.status = "running";
        campaign.startedAt = new Date();
        campaign.updatedAt = new Date();

        // Get target audience
        const audience = await this.searchCustomers("", campaign.targetAudience);

        // Simulate sending (in production, would queue actual sends)
        for (const customer of audience) {
            await this.logCommunication(customer.id, {
                channel: campaign.channel as any,
                direction: "outbound",
                type: `campaign_${campaign.type}`,
                subject: campaign.content.subject,
                content: this.personalizeContent(campaign.content.body, customer),
                status: "sent"
            });

            campaign.metrics.sent++;
        }

        return campaign;
    }

    async pauseCampaign(id: string): Promise<Campaign | null> {
        const campaign = this.campaigns.get(id);
        if (!campaign || campaign.status !== "running") return null;

        campaign.status = "paused";
        campaign.updatedAt = new Date();
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

    private initializeCampaignMetrics(): CampaignMetrics {
        return {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            unsubscribed: 0,
            bounced: 0,
            complained: 0,
            revenue: 0,
            deliveryRate: 0,
            openRate: 0,
            clickRate: 0,
            conversionRate: 0,
            roi: 0
        };
    }

    private calculateCampaignROI(campaign: Campaign): void {
        const metrics = campaign.metrics;

        metrics.deliveryRate = metrics.sent > 0 ? metrics.delivered / metrics.sent : 0;
        metrics.openRate = metrics.delivered > 0 ? metrics.opened / metrics.delivered : 0;
        metrics.clickRate = metrics.opened > 0 ? metrics.clicked / metrics.opened : 0;
        metrics.conversionRate = metrics.clicked > 0 ? metrics.converted / metrics.clicked : 0;

        if (campaign.spent > 0) {
            metrics.roi = ((metrics.revenue - campaign.spent) / campaign.spent) * 100;
        }
    }

    private personalizeContent(content: string, customer: Customer): string {
        return content
            .replace(/\{\{firstName\}\}/g, customer.firstName)
            .replace(/\{\{lastName\}\}/g, customer.lastName)
            .replace(/\{\{fullName\}\}/g, customer.fullName)
            .replace(/\{\{email\}\}/g, customer.email);
    }

    // ===========================================================================
    // LOYALTY PROGRAM
    // ===========================================================================

    async createLoyaltyProgram(data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
        const program: LoyaltyProgram = {
            id: randomUUID(),
            name: data.name || "Loyalty Program",
            description: data.description || "",
            type: data.type || "points",
            status: "active",
            rules: data.rules || [],
            tiers: data.tiers,
            rewards: data.rewards || [],
            members: 0,
            totalPointsIssued: 0,
            totalPointsRedeemed: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.loyaltyPrograms.set(program.id, program);
        return program;
    }

    async enrollCustomer(customerId: string, programId: string): Promise<CustomerMembership> {
        const program = this.loyaltyPrograms.get(programId);
        if (!program) throw new Error("Program not found");

        const existing = Array.from(this.memberships.values()).find(
            m => m.customerId === customerId && m.programId === programId
        );
        if (existing) throw new Error("Customer already enrolled");

        const membership: CustomerMembership = {
            id: randomUUID(),
            customerId,
            programId,
            tierId: program.tiers?.[0]?.id,
            points: 0,
            lifetimePoints: 0,
            status: "active",
            joinedAt: new Date()
        };

        this.memberships.set(membership.id, membership);
        program.members++;

        return membership;
    }

    async earnPoints(membershipId: string, points: number, description: string, referenceType?: string, referenceId?: string): Promise<PointTransaction> {
        const membership = this.memberships.get(membershipId);
        if (!membership) throw new Error("Membership not found");

        const program = this.loyaltyPrograms.get(membership.programId);
        if (!program) throw new Error("Program not found");

        // Apply tier multiplier
        const tier = program.tiers?.find(t => t.id === membership.tierId);
        const multiplier = tier?.multiplier || 1;
        const earnedPoints = Math.floor(points * multiplier);

        membership.points += earnedPoints;
        membership.lifetimePoints += earnedPoints;
        membership.lastEarnedAt = new Date();
        program.totalPointsIssued += earnedPoints;

        // Check for tier upgrade
        await this.checkTierUpgrade(membershipId);

        const transaction: PointTransaction = {
            id: randomUUID(),
            membershipId,
            type: "earn",
            points: earnedPoints,
            balance: membership.points,
            description,
            referenceType,
            referenceId,
            createdAt: new Date()
        };

        return transaction;
    }

    async redeemPoints(membershipId: string, rewardId: string): Promise<{ success: boolean; error?: string }> {
        const membership = this.memberships.get(membershipId);
        if (!membership) return { success: false, error: "Membership not found" };

        const program = this.loyaltyPrograms.get(membership.programId);
        if (!program) return { success: false, error: "Program not found" };

        const reward = program.rewards.find(r => r.id === rewardId);
        if (!reward) return { success: false, error: "Reward not found" };

        if (membership.points < reward.pointsCost) {
            return { success: false, error: "Insufficient points" };
        }

        if (reward.stock !== undefined && reward.stock <= 0) {
            return { success: false, error: "Reward out of stock" };
        }

        membership.points -= reward.pointsCost;
        membership.lastRedeemedAt = new Date();
        program.totalPointsRedeemed += reward.pointsCost;
        reward.claimed++;

        if (reward.stock !== undefined) {
            reward.stock--;
        }

        return { success: true };
    }

    async checkTierUpgrade(membershipId: string): Promise<boolean> {
        const membership = this.memberships.get(membershipId);
        if (!membership) return false;

        const program = this.loyaltyPrograms.get(membership.programId);
        if (!program?.tiers) return false;

        const sortedTiers = [...program.tiers].sort((a, b) => b.minPoints - a.minPoints);

        for (const tier of sortedTiers) {
            if (membership.lifetimePoints >= tier.minPoints) {
                if (membership.tierId !== tier.id) {
                    membership.tierId = tier.id;
                    membership.tierAchievedAt = new Date();
                    return true;
                }
                break;
            }
        }

        return false;
    }

    async getMembership(customerId: string, programId: string): Promise<CustomerMembership | null> {
        for (const membership of this.memberships.values()) {
            if (membership.customerId === customerId && membership.programId === programId) {
                return membership;
            }
        }
        return null;
    }

    // ===========================================================================
    // REFERRAL PROGRAM
    // ===========================================================================

    async createReferralProgram(data: Partial<ReferralProgram>): Promise<ReferralProgram> {
        const program: ReferralProgram = {
            id: randomUUID(),
            name: data.name || "Referral Program",
            status: "active",
            referrerReward: data.referrerReward || { type: "credit", value: 50, description: "€50 credit" },
            refereeReward: data.refereeReward || { type: "discount", value: 20, description: "20% off first booking" },
            requirements: data.requirements || { newCustomerOnly: true, verificationRequired: false },
            limits: data.limits || { maxReferralsPerCustomer: 10, validDays: 30 },
            metrics: {
                totalReferrals: 0,
                successfulReferrals: 0,
                pendingReferrals: 0,
                totalRewardsGiven: 0,
                revenueGenerated: 0,
                conversionRate: 0
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.referralPrograms.set(program.id, program);
        return program;
    }

    async createReferral(programId: string, referrerId: string, refereeEmail: string): Promise<Referral> {
        const program = this.referralPrograms.get(programId);
        if (!program) throw new Error("Program not found");

        // Check limits
        const existingReferrals = Array.from(this.referrals.values()).filter(
            r => r.programId === programId && r.referrerId === referrerId
        );
        if (program.limits.maxReferralsPerCustomer &&
            existingReferrals.length >= program.limits.maxReferralsPerCustomer) {
            throw new Error("Maximum referrals reached");
        }

        // Check if email already referred
        const alreadyReferred = Array.from(this.referrals.values()).find(
            r => r.programId === programId && r.refereeEmail === refereeEmail
        );
        if (alreadyReferred) {
            throw new Error("Email already referred");
        }

        const referral: Referral = {
            id: randomUUID(),
            programId,
            referrerId,
            refereeEmail,
            code: this.generateReferralCode(),
            status: "pending",
            referrerRewardStatus: "pending",
            refereeRewardStatus: "pending",
            expiresAt: new Date(Date.now() + program.limits.validDays * 24 * 60 * 60 * 1000),
            createdAt: new Date()
        };

        this.referrals.set(referral.id, referral);
        program.metrics.totalReferrals++;
        program.metrics.pendingReferrals++;

        return referral;
    }

    async processReferralSignup(referralCode: string, refereeId: string): Promise<Referral | null> {
        const referral = Array.from(this.referrals.values()).find(r => r.code === referralCode);
        if (!referral || referral.status !== "pending") return null;

        if (new Date() > referral.expiresAt) {
            referral.status = "expired";
            return null;
        }

        referral.refereeId = refereeId;
        referral.status = "signed_up";
        referral.refereeSignedUpAt = new Date();
        referral.refereeRewardStatus = "eligible";

        const program = this.referralPrograms.get(referral.programId);
        if (program) {
            program.metrics.pendingReferrals--;
        }

        return referral;
    }

    async completeReferral(referralId: string, purchaseAmount: number): Promise<Referral | null> {
        const referral = this.referrals.get(referralId);
        if (!referral || referral.status !== "signed_up") return null;

        const program = this.referralPrograms.get(referral.programId);
        if (!program) return null;

        // Check minimum purchase
        if (program.requirements.minPurchase && purchaseAmount < program.requirements.minPurchase) {
            return null;
        }

        referral.status = "converted";
        referral.refereeConvertedAt = new Date();
        referral.referrerRewardStatus = "eligible";

        program.metrics.successfulReferrals++;
        program.metrics.revenueGenerated += purchaseAmount;
        program.metrics.conversionRate =
            program.metrics.successfulReferrals / program.metrics.totalReferrals;

        return referral;
    }

    private generateReferralCode(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // ===========================================================================
    // CUSTOMER JOURNEY
    // ===========================================================================

    async initializeJourney(customerId: string): Promise<CustomerJourney> {
        const journey: CustomerJourney = {
            id: randomUUID(),
            customerId,
            stages: [
                {
                    name: "awareness",
                    enteredAt: new Date(),
                    events: [],
                    score: 0
                }
            ],
            currentStage: "awareness",
            startedAt: new Date()
        };

        this.journeys.set(journey.id, journey);
        return journey;
    }

    async trackJourneyEvent(customerId: string, event: Omit<JourneyEvent, "id" | "timestamp">): Promise<void> {
        const journey = Array.from(this.journeys.values()).find(j => j.customerId === customerId);
        if (!journey) return;

        const currentStage = journey.stages.find(s => s.name === journey.currentStage);
        if (!currentStage) return;

        currentStage.events.push({
            id: randomUUID(),
            timestamp: new Date(),
            ...event
        });
        currentStage.score += this.getEventScore(event.type);

        // Check for stage progression
        await this.checkJourneyProgression(journey);
    }

    async progressJourneyStage(customerId: string, newStage: string): Promise<void> {
        const journey = Array.from(this.journeys.values()).find(j => j.customerId === customerId);
        if (!journey) return;

        const currentStage = journey.stages.find(s => s.name === journey.currentStage);
        if (currentStage) {
            currentStage.exitedAt = new Date();
            currentStage.duration = currentStage.exitedAt.getTime() - currentStage.enteredAt.getTime();
        }

        journey.stages.push({
            name: newStage,
            enteredAt: new Date(),
            events: [],
            score: 0
        });
        journey.currentStage = newStage;

        if (newStage === "converted") {
            journey.completedAt = new Date();
        }
    }

    private async checkJourneyProgression(journey: CustomerJourney): Promise<void> {
        const currentStage = journey.stages.find(s => s.name === journey.currentStage);
        if (!currentStage) return;

        const stageProgression: Record<string, { nextStage: string; threshold: number }> = {
            awareness: { nextStage: "consideration", threshold: 20 },
            consideration: { nextStage: "decision", threshold: 40 },
            decision: { nextStage: "converted", threshold: 60 }
        };

        const progression = stageProgression[journey.currentStage];
        if (progression && currentStage.score >= progression.threshold) {
            await this.progressJourneyStage(journey.customerId, progression.nextStage);
        }
    }

    private getEventScore(eventType: string): number {
        const scores: Record<string, number> = {
            page_view: 1,
            artist_view: 3,
            portfolio_view: 5,
            booking_started: 10,
            booking_completed: 25,
            payment_completed: 30,
            review_left: 5,
            referral_sent: 10
        };
        return scores[eventType] || 1;
    }

    async getJourney(customerId: string): Promise<CustomerJourney | null> {
        for (const journey of this.journeys.values()) {
            if (journey.customerId === customerId) {
                return journey;
            }
        }
        return null;
    }

    // ===========================================================================
    // NOTES & TASKS
    // ===========================================================================

    async addNote(customerId: string, note: Omit<CustomerNote, "id" | "customerId" | "createdAt" | "updatedAt">): Promise<CustomerNote> {
        const customerNote: CustomerNote = {
            id: randomUUID(),
            customerId,
            ...note,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const notes = this.notes.get(customerId) || [];
        notes.push(customerNote);
        this.notes.set(customerId, notes);

        return customerNote;
    }

    async getNotes(customerId: string): Promise<CustomerNote[]> {
        return this.notes.get(customerId) || [];
    }

    async createTask(task: Omit<CustomerTask, "id" | "status" | "createdAt">): Promise<CustomerTask> {
        const customerTask: CustomerTask = {
            id: randomUUID(),
            ...task,
            status: "pending",
            createdAt: new Date()
        };

        const tasks = this.tasks.get(task.customerId) || [];
        tasks.push(customerTask);
        this.tasks.set(task.customerId, tasks);

        return customerTask;
    }

    async completeTask(taskId: string): Promise<CustomerTask | null> {
        for (const tasks of this.tasks.values()) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = "completed";
                task.completedAt = new Date();
                return task;
            }
        }
        return null;
    }

    async getTasks(customerId: string, status?: CustomerTask["status"]): Promise<CustomerTask[]> {
        let tasks = this.tasks.get(customerId) || [];
        if (status) {
            tasks = tasks.filter(t => t.status === status);
        }
        return tasks.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    }

    async getOverdueTasks(): Promise<CustomerTask[]> {
        const now = new Date();
        const overdue: CustomerTask[] = [];

        for (const tasks of this.tasks.values()) {
            for (const task of tasks) {
                if (task.status === "pending" && task.dueAt < now) {
                    overdue.push(task);
                }
            }
        }

        return overdue.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    }

    // ===========================================================================
    // COMMUNICATION LOGGING
    // ===========================================================================

    async logCommunication(customerId: string, log: Omit<CommunicationLog, "id" | "customerId" | "createdAt">): Promise<CommunicationLog> {
        const communication: CommunicationLog = {
            id: randomUUID(),
            customerId,
            ...log,
            createdAt: new Date()
        };

        const logs = this.communications.get(customerId) || [];
        logs.push(communication);
        this.communications.set(customerId, logs);

        // Update customer metrics
        const customer = this.customers.get(customerId);
        if (customer) {
            customer.lastContactAt = new Date();
            customer.lastActivityAt = new Date();
        }

        return communication;
    }

    async getCommunications(customerId: string, limit?: number): Promise<CommunicationLog[]> {
        let logs = this.communications.get(customerId) || [];
        logs = logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (limit) {
            logs = logs.slice(0, limit);
        }
        return logs;
    }

    // ===========================================================================
    // ANALYTICS
    // ===========================================================================

    async getCustomerStats(): Promise<{
        total: number;
        byStatus: Record<CustomerStatus, number>;
        bySegment: Record<CustomerSegment, number>;
        bySource: Record<CustomerSource, number>;
        averageHealthScore: number;
        averageLTV: number;
        churnRisk: { high: number; medium: number; low: number };
    }> {
        const customers = Array.from(this.customers.values());

        const byStatus: Record<CustomerStatus, number> = {
            lead: 0, prospect: 0, active: 0, inactive: 0, churned: 0, blocked: 0
        };
        const bySegment: Record<CustomerSegment, number> = {
            new: 0, casual: 0, regular: 0, loyal: 0, vip: 0, at_risk: 0, dormant: 0, lost: 0
        };
        const bySource: Partial<Record<CustomerSource, number>> = {};

        let totalHealthScore = 0;
        let totalLTV = 0;
        const churnRisk = { high: 0, medium: 0, low: 0 };

        for (const customer of customers) {
            byStatus[customer.status]++;
            bySegment[customer.segment]++;
            bySource[customer.source] = (bySource[customer.source] || 0) + 1;
            totalHealthScore += customer.healthScore;
            totalLTV += customer.lifetimeValue;

            const churn = await this.predictChurn(customer.id);
            if (churn.probability >= 0.7) churnRisk.high++;
            else if (churn.probability >= 0.4) churnRisk.medium++;
            else churnRisk.low++;
        }

        return {
            total: customers.length,
            byStatus,
            bySegment,
            bySource: bySource as Record<CustomerSource, number>,
            averageHealthScore: customers.length > 0 ? totalHealthScore / customers.length : 0,
            averageLTV: customers.length > 0 ? totalLTV / customers.length : 0,
            churnRisk
        };
    }

    async getCampaignStats(): Promise<{
        total: number;
        byStatus: Record<CampaignStatus, number>;
        byType: Record<CampaignType, number>;
        totalSent: number;
        averageOpenRate: number;
        averageClickRate: number;
        totalRevenue: number;
        averageROI: number;
    }> {
        const campaigns = Array.from(this.campaigns.values());

        const byStatus: Record<CampaignStatus, number> = {
            draft: 0, scheduled: 0, running: 0, paused: 0, completed: 0, cancelled: 0
        };
        const byType: Partial<Record<CampaignType, number>> = {};

        let totalSent = 0;
        let totalOpenRate = 0;
        let totalClickRate = 0;
        let totalRevenue = 0;
        let totalROI = 0;
        let completedCount = 0;

        for (const campaign of campaigns) {
            byStatus[campaign.status]++;
            byType[campaign.type] = (byType[campaign.type] || 0) + 1;
            totalSent += campaign.metrics.sent;

            if (campaign.status === "completed") {
                completedCount++;
                totalOpenRate += campaign.metrics.openRate;
                totalClickRate += campaign.metrics.clickRate;
                totalRevenue += campaign.metrics.revenue;
                totalROI += campaign.metrics.roi;
            }
        }

        return {
            total: campaigns.length,
            byStatus,
            byType: byType as Record<CampaignType, number>,
            totalSent,
            averageOpenRate: completedCount > 0 ? totalOpenRate / completedCount : 0,
            averageClickRate: completedCount > 0 ? totalClickRate / completedCount : 0,
            totalRevenue,
            averageROI: completedCount > 0 ? totalROI / completedCount : 0
        };
    }

    async getLoyaltyStats(programId: string): Promise<{
        totalMembers: number;
        activeMembers: number;
        pointsIssued: number;
        pointsRedeemed: number;
        redemptionRate: number;
        byTier: Record<string, number>;
        topRewards: Array<{ id: string; name: string; claimed: number }>;
    }> {
        const program = this.loyaltyPrograms.get(programId);
        if (!program) throw new Error("Program not found");

        const memberships = Array.from(this.memberships.values()).filter(
            m => m.programId === programId
        );

        const byTier: Record<string, number> = {};
        let activeMembers = 0;

        for (const membership of memberships) {
            if (membership.status === "active") activeMembers++;
            const tierName = program.tiers?.find(t => t.id === membership.tierId)?.name || "base";
            byTier[tierName] = (byTier[tierName] || 0) + 1;
        }

        const topRewards = program.rewards
            .map(r => ({ id: r.id, name: r.name, claimed: r.claimed }))
            .sort((a, b) => b.claimed - a.claimed)
            .slice(0, 5);

        return {
            totalMembers: memberships.length,
            activeMembers,
            pointsIssued: program.totalPointsIssued,
            pointsRedeemed: program.totalPointsRedeemed,
            redemptionRate: program.totalPointsIssued > 0
                ? program.totalPointsRedeemed / program.totalPointsIssued
                : 0,
            byTier,
            topRewards
        };
    }

    async getReferralStats(programId: string): Promise<ReferralMetrics> {
        const program = this.referralPrograms.get(programId);
        if (!program) throw new Error("Program not found");
        return program.metrics;
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const crmService = new CRMService();
export default crmService;
