/**
 * ALTUS INK - ENTERPRISE KNOWLEDGE BASE & HELP DESK SERVICE
 * Complete knowledge management and customer support
 * 
 * Features:
 * - Knowledge base articles
 * - Help desk ticketing
 * - Live chat integration
 * - FAQ management
 * - SLA tracking
 * - Agent management
 * - Canned responses
 * - Customer satisfaction
 * - Self-service portal
 * - Support analytics
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Article {
    id: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    categoryId: string;
    tags: string[];
    status: ArticleStatus;
    visibility: ArticleVisibility;
    author: string;
    contributors: string[];
    version: number;
    revisions: ArticleRevision[];
    seo: ArticleSEO;
    metrics: ArticleMetrics;
    relatedArticles: string[];
    attachments: ArticleAttachment[];
    translations: ArticleTranslation[];
    publishedAt?: Date;
    lastReviewedAt?: Date;
    reviewDueAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type ArticleStatus = "draft" | "under_review" | "published" | "archived" | "outdated";
export type ArticleVisibility = "public" | "internal" | "customers_only" | "agents_only";

export interface ArticleRevision {
    id: string;
    version: number;
    title: string;
    content: string;
    author: string;
    changes: string;
    createdAt: Date;
}

export interface ArticleSEO {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    keywords: string[];
}

export interface ArticleMetrics {
    views: number;
    uniqueViews: number;
    helpfulVotes: number;
    notHelpfulVotes: number;
    helpfulnessScore: number;
    averageTimeOnPage: number;
    searchAppearances: number;
    clickThroughRate: number;
}

export interface ArticleAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface ArticleTranslation {
    language: string;
    title: string;
    summary: string;
    content: string;
    translatedBy: string;
    translatedAt: Date;
    isComplete: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    parentId?: string;
    icon?: string;
    color?: string;
    order: number;
    articleCount: number;
    isPublic: boolean;
    createdAt: Date;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    categoryId?: string;
    order: number;
    isExpanded: boolean;
    views: number;
    helpfulVotes: number;
    notHelpfulVotes: number;
    relatedFAQs: string[];
    tags: string[];
    status: "draft" | "published" | "archived";
    createdAt: Date;
    updatedAt: Date;
}

export interface Ticket {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    type: TicketType;
    channel: TicketChannel;
    customerId: string;
    customerName: string;
    customerEmail: string;
    assignedTo?: string;
    assignedTeam?: string;
    categoryId?: string;
    tags: string[];
    sla: TicketSLA;
    messages: TicketMessage[];
    timeline: TicketEvent[];
    satisfaction?: SatisfactionRating;
    resolution?: TicketResolution;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    firstResponseAt?: Date;
    resolvedAt?: Date;
    closedAt?: Date;
}

export type TicketStatus =
    | "new"
    | "open"
    | "pending"
    | "on_hold"
    | "escalated"
    | "resolved"
    | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketType =
    | "question"
    | "problem"
    | "feature_request"
    | "feedback"
    | "complaint"
    | "refund"
    | "other";

export type TicketChannel =
    | "email"
    | "web"
    | "chat"
    | "phone"
    | "social"
    | "api";

export interface TicketSLA {
    policyId: string;
    policyName: string;
    firstResponseDue: Date;
    resolutionDue: Date;
    firstResponseMet?: boolean;
    resolutionMet?: boolean;
    isBreached: boolean;
    breachType?: "first_response" | "resolution" | "both";
}

export interface TicketMessage {
    id: string;
    type: "reply" | "note" | "system";
    content: string;
    htmlContent?: string;
    author: MessageAuthor;
    attachments: MessageAttachment[];
    isInternal: boolean;
    createdAt: Date;
}

export interface MessageAuthor {
    type: "customer" | "agent" | "system";
    id: string;
    name: string;
    email?: string;
    avatar?: string;
}

export interface MessageAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface TicketEvent {
    id: string;
    type: EventType;
    description: string;
    oldValue?: string;
    newValue?: string;
    actor: MessageAuthor;
    createdAt: Date;
}

export type EventType =
    | "created"
    | "assigned"
    | "status_changed"
    | "priority_changed"
    | "escalated"
    | "merged"
    | "replied"
    | "resolved"
    | "closed"
    | "reopened"
    | "sla_breach";

export interface SatisfactionRating {
    score: number;
    maxScore: number;
    feedback?: string;
    reasons?: string[];
    ratedAt: Date;
}

export interface TicketResolution {
    summary: string;
    category: string;
    rootCause?: string;
    articleIds?: string[];
    preventiveMeasures?: string;
}

export interface SLAPolicy {
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
    conditions: SLACondition[];
    targets: SLATarget[];
    businessHours: BusinessHours;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SLACondition {
    field: "priority" | "type" | "channel" | "customer_type" | "tag";
    operator: "is" | "is_not" | "contains";
    value: string;
}

export interface SLATarget {
    metric: "first_response" | "resolution" | "next_response";
    priority: TicketPriority;
    durationMinutes: number;
    escalationRules?: EscalationRule[];
}

export interface EscalationRule {
    percentageElapsed: number;
    action: "notify" | "assign" | "escalate";
    targetId?: string;
    targetType?: "agent" | "team" | "manager";
}

export interface BusinessHours {
    timezone: string;
    schedule: DaySchedule[];
    holidays: Holiday[];
}

export interface DaySchedule {
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
}

export interface Holiday {
    date: Date;
    name: string;
    isRecurring: boolean;
}

export interface Agent {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: AgentRole;
    teams: string[];
    skills: AgentSkill[];
    status: AgentStatus;
    capacity: AgentCapacity;
    metrics: AgentMetrics;
    preferences: AgentPreferences;
    createdAt: Date;
}

export type AgentRole = "agent" | "senior_agent" | "supervisor" | "admin";
export type AgentStatus = "online" | "away" | "busy" | "offline";

export interface AgentSkill {
    name: string;
    level: "beginner" | "intermediate" | "expert";
    categories: string[];
}

export interface AgentCapacity {
    maxTickets: number;
    currentTickets: number;
    maxChats: number;
    currentChats: number;
    isAvailable: boolean;
}

export interface AgentMetrics {
    ticketsResolved: number;
    averageResolutionTime: number;
    averageFirstResponseTime: number;
    satisfactionScore: number;
    slaComplianceRate: number;
    ticketsEscalated: number;
}

export interface AgentPreferences {
    autoAssign: boolean;
    notifyOnAssignment: boolean;
    notifyOnMention: boolean;
    defaultSignature?: string;
    language: string;
}

export interface Team {
    id: string;
    name: string;
    description: string;
    leaderId: string;
    memberIds: string[];
    categories: string[];
    schedule: TeamSchedule;
    metrics: TeamMetrics;
    createdAt: Date;
}

export interface TeamSchedule {
    timezone: string;
    shifts: TeamShift[];
}

export interface TeamShift {
    name: string;
    agentIds: string[];
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
}

export interface TeamMetrics {
    totalTickets: number;
    openTickets: number;
    averageResolutionTime: number;
    satisfactionScore: number;
    slaComplianceRate: number;
}

export interface CannedResponse {
    id: string;
    title: string;
    content: string;
    htmlContent?: string;
    categoryId?: string;
    tags: string[];
    shortcut?: string;
    visibility: "personal" | "team" | "global";
    ownerId: string;
    teamId?: string;
    variables: ResponseVariable[];
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ResponseVariable {
    name: string;
    type: "text" | "select" | "dynamic";
    defaultValue?: string;
    options?: string[];
    dynamicSource?: string;
}

export interface ChatSession {
    id: string;
    visitorId: string;
    visitorName?: string;
    visitorEmail?: string;
    agentId?: string;
    status: ChatStatus;
    channel: "widget" | "facebook" | "whatsapp" | "instagram";
    department?: string;
    messages: ChatMessage[];
    typing: TypingIndicator[];
    metadata: ChatMetadata;
    satisfaction?: SatisfactionRating;
    ticketId?: string;
    startedAt: Date;
    endedAt?: Date;
}

export type ChatStatus =
    | "waiting"
    | "active"
    | "transferred"
    | "ended"
    | "missed";

export interface ChatMessage {
    id: string;
    type: "text" | "image" | "file" | "system" | "bot";
    content: string;
    sender: "visitor" | "agent" | "bot" | "system";
    senderId?: string;
    senderName?: string;
    attachments?: MessageAttachment[];
    isRead: boolean;
    createdAt: Date;
}

export interface TypingIndicator {
    participantId: string;
    participantType: "visitor" | "agent";
    isTyping: boolean;
    lastUpdated: Date;
}

export interface ChatMetadata {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    currentPage?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    location?: {
        country?: string;
        city?: string;
    };
    previousVisits: number;
    customFields: Record<string, any>;
}

export interface SupportAnalytics {
    period: { start: Date; end: Date };
    tickets: TicketAnalytics;
    agents: AgentAnalyticsOverview;
    sla: SLAAnalytics;
    satisfaction: SatisfactionAnalytics;
    channels: ChannelAnalytics[];
    trending: TrendingIssue[];
}

export interface TicketAnalytics {
    total: number;
    new: number;
    open: number;
    pending: number;
    resolved: number;
    closed: number;
    byPriority: Record<TicketPriority, number>;
    byType: Record<TicketType, number>;
    byCategory: Array<{ category: string; count: number }>;
    averageResolutionTime: number;
    averageFirstResponseTime: number;
    backlogTrend: Array<{ date: Date; count: number }>;
}

export interface AgentAnalyticsOverview {
    totalAgents: number;
    onlineAgents: number;
    topPerformers: Array<{ agentId: string; name: string; score: number }>;
    utilizationRate: number;
}

export interface SLAAnalytics {
    complianceRate: number;
    firstResponseCompliance: number;
    resolutionCompliance: number;
    breachesByPriority: Record<TicketPriority, number>;
    averageTimeToFirstResponse: number;
    averageResolutionTime: number;
}

export interface SatisfactionAnalytics {
    averageScore: number;
    responseRate: number;
    distribution: Array<{ score: number; count: number }>;
    byAgent: Array<{ agentId: string; name: string; score: number; responses: number }>;
    feedback: Array<{ reason: string; count: number }>;
    trend: Array<{ date: Date; score: number }>;
}

export interface ChannelAnalytics {
    channel: TicketChannel;
    tickets: number;
    percentage: number;
    averageResolutionTime: number;
    satisfactionScore: number;
}

export interface TrendingIssue {
    topic: string;
    count: number;
    change: number;
    sentiment: "positive" | "neutral" | "negative";
    relatedArticles: string[];
}

// =============================================================================
// KNOWLEDGE BASE & HELP DESK SERVICE CLASS
// =============================================================================

export class KnowledgeBaseService {
    private articles: Map<string, Article> = new Map();
    private categories: Map<string, Category> = new Map();
    private faqs: Map<string, FAQ> = new Map();
    private tickets: Map<string, Ticket> = new Map();
    private slaPolicies: Map<string, SLAPolicy> = new Map();
    private agents: Map<string, Agent> = new Map();
    private teams: Map<string, Team> = new Map();
    private cannedResponses: Map<string, CannedResponse> = new Map();
    private chatSessions: Map<string, ChatSession> = new Map();

    private ticketCounter = 1000;

    constructor() {
        this.initializeDefaultCategories();
        this.initializeDefaultSLAPolicies();
        this.initializeDefaultResponses();
    }

    // ===========================================================================
    // ARTICLE MANAGEMENT
    // ===========================================================================

    async createArticle(data: Partial<Article>): Promise<Article> {
        const article: Article = {
            id: randomUUID(),
            slug: data.slug || this.generateSlug(data.title || "untitled"),
            title: data.title || "Untitled Article",
            summary: data.summary || "",
            content: data.content || "",
            categoryId: data.categoryId || "",
            tags: data.tags || [],
            status: "draft",
            visibility: data.visibility || "public",
            author: data.author || "",
            contributors: [],
            version: 1,
            revisions: [],
            seo: data.seo || { keywords: [] },
            metrics: this.getEmptyArticleMetrics(),
            relatedArticles: [],
            attachments: [],
            translations: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.articles.set(article.id, article);
        await this.updateCategoryCount(article.categoryId);

        return article;
    }

    async updateArticle(id: string, data: Partial<Article>, author: string): Promise<Article | null> {
        const article = this.articles.get(id);
        if (!article) return null;

        // Create revision
        if (data.content && data.content !== article.content) {
            article.revisions.push({
                id: randomUUID(),
                version: article.version,
                title: article.title,
                content: article.content,
                author: article.author,
                changes: "Content updated",
                createdAt: new Date()
            });
            article.version++;
        }

        if (!article.contributors.includes(author)) {
            article.contributors.push(author);
        }

        Object.assign(article, data, { updatedAt: new Date() });
        return article;
    }

    async getArticle(id: string): Promise<Article | null> {
        return this.articles.get(id) || null;
    }

    async getArticleBySlug(slug: string): Promise<Article | null> {
        for (const article of this.articles.values()) {
            if (article.slug === slug) return article;
        }
        return null;
    }

    async getArticles(filters?: {
        categoryId?: string;
        status?: ArticleStatus;
        visibility?: ArticleVisibility;
        tags?: string[];
    }): Promise<Article[]> {
        let articles = Array.from(this.articles.values());

        if (filters) {
            if (filters.categoryId) {
                articles = articles.filter(a => a.categoryId === filters.categoryId);
            }
            if (filters.status) {
                articles = articles.filter(a => a.status === filters.status);
            }
            if (filters.visibility) {
                articles = articles.filter(a => a.visibility === filters.visibility);
            }
            if (filters.tags?.length) {
                articles = articles.filter(a => filters.tags!.some(t => a.tags.includes(t)));
            }
        }

        return articles.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    async searchArticles(query: string, limit?: number): Promise<Article[]> {
        const q = query.toLowerCase();
        let results = Array.from(this.articles.values())
            .filter(a => a.status === "published")
            .filter(a =>
                a.title.toLowerCase().includes(q) ||
                a.summary.toLowerCase().includes(q) ||
                a.content.toLowerCase().includes(q) ||
                a.tags.some(t => t.toLowerCase().includes(q))
            )
            .sort((a, b) => {
                // Prioritize title matches
                const aTitle = a.title.toLowerCase().includes(q) ? 1 : 0;
                const bTitle = b.title.toLowerCase().includes(q) ? 1 : 0;
                return bTitle - aTitle || b.metrics.views - a.metrics.views;
            });

        if (limit) {
            results = results.slice(0, limit);
        }

        return results;
    }

    async publishArticle(id: string): Promise<Article | null> {
        const article = this.articles.get(id);
        if (!article) return null;

        article.status = "published";
        article.publishedAt = new Date();
        article.updatedAt = new Date();

        return article;
    }

    async recordArticleView(id: string, unique: boolean = true): Promise<void> {
        const article = this.articles.get(id);
        if (!article) return;

        article.metrics.views++;
        if (unique) article.metrics.uniqueViews++;
    }

    async voteArticle(id: string, helpful: boolean): Promise<Article | null> {
        const article = this.articles.get(id);
        if (!article) return null;

        if (helpful) {
            article.metrics.helpfulVotes++;
        } else {
            article.metrics.notHelpfulVotes++;
        }

        const total = article.metrics.helpfulVotes + article.metrics.notHelpfulVotes;
        article.metrics.helpfulnessScore = total > 0
            ? (article.metrics.helpfulVotes / total) * 100
            : 0;

        return article;
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    private getEmptyArticleMetrics(): ArticleMetrics {
        return {
            views: 0,
            uniqueViews: 0,
            helpfulVotes: 0,
            notHelpfulVotes: 0,
            helpfulnessScore: 0,
            averageTimeOnPage: 0,
            searchAppearances: 0,
            clickThroughRate: 0
        };
    }

    private async updateCategoryCount(categoryId: string): Promise<void> {
        const category = this.categories.get(categoryId);
        if (!category) return;

        const articles = await this.getArticles({ categoryId, status: "published" });
        category.articleCount = articles.length;
    }

    // ===========================================================================
    // CATEGORY MANAGEMENT
    // ===========================================================================

    async createCategory(data: Partial<Category>): Promise<Category> {
        const category: Category = {
            id: randomUUID(),
            name: data.name || "New Category",
            slug: data.slug || this.generateSlug(data.name || "new-category"),
            description: data.description || "",
            order: data.order || 0,
            articleCount: 0,
            isPublic: data.isPublic ?? true,
            createdAt: new Date(),
            ...data
        };

        this.categories.set(category.id, category);
        return category;
    }

    async getCategories(parentId?: string): Promise<Category[]> {
        let categories = Array.from(this.categories.values());

        if (parentId !== undefined) {
            categories = categories.filter(c => c.parentId === parentId);
        }

        return categories.sort((a, b) => a.order - b.order);
    }

    private initializeDefaultCategories(): void {
        const categories: Partial<Category>[] = [
            { name: "Getting Started", slug: "getting-started", description: "Learn the basics", icon: "rocket" },
            { name: "Booking & Appointments", slug: "booking-appointments", description: "How to book and manage appointments", icon: "calendar" },
            { name: "Payments & Pricing", slug: "payments-pricing", description: "Payment methods and pricing information", icon: "credit-card" },
            { name: "Account & Profile", slug: "account-profile", description: "Manage your account settings", icon: "user" },
            { name: "Troubleshooting", slug: "troubleshooting", description: "Common issues and solutions", icon: "wrench" }
        ];

        categories.forEach((cat, i) => {
            this.createCategory({ ...cat, order: i });
        });
    }

    // ===========================================================================
    // FAQ MANAGEMENT
    // ===========================================================================

    async createFAQ(data: Partial<FAQ>): Promise<FAQ> {
        const faq: FAQ = {
            id: randomUUID(),
            question: data.question || "",
            answer: data.answer || "",
            order: data.order || 0,
            isExpanded: false,
            views: 0,
            helpfulVotes: 0,
            notHelpfulVotes: 0,
            relatedFAQs: [],
            tags: data.tags || [],
            status: "draft",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.faqs.set(faq.id, faq);
        return faq;
    }

    async getFAQs(categoryId?: string): Promise<FAQ[]> {
        let faqs = Array.from(this.faqs.values()).filter(f => f.status === "published");

        if (categoryId) {
            faqs = faqs.filter(f => f.categoryId === categoryId);
        }

        return faqs.sort((a, b) => a.order - b.order);
    }

    // ===========================================================================
    // TICKET MANAGEMENT
    // ===========================================================================

    async createTicket(data: Partial<Ticket>): Promise<Ticket> {
        const slaPolicy = await this.getApplicableSLA(data);

        const ticket: Ticket = {
            id: randomUUID(),
            ticketNumber: `TKT-${++this.ticketCounter}`,
            subject: data.subject || "",
            description: data.description || "",
            status: "new",
            priority: data.priority || "medium",
            type: data.type || "question",
            channel: data.channel || "web",
            customerId: data.customerId || "",
            customerName: data.customerName || "",
            customerEmail: data.customerEmail || "",
            tags: data.tags || [],
            sla: this.calculateSLADeadlines(slaPolicy),
            messages: [],
            timeline: [{
                id: randomUUID(),
                type: "created",
                description: "Ticket created",
                actor: {
                    type: "customer",
                    id: data.customerId || "",
                    name: data.customerName || ""
                },
                createdAt: new Date()
            }],
            metadata: data.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        // Add initial message if description provided
        if (data.description) {
            ticket.messages.push({
                id: randomUUID(),
                type: "reply",
                content: data.description,
                author: {
                    type: "customer",
                    id: data.customerId || "",
                    name: data.customerName || ""
                },
                attachments: [],
                isInternal: false,
                createdAt: new Date()
            });
        }

        this.tickets.set(ticket.id, ticket);

        // Auto-assign if enabled
        await this.autoAssignTicket(ticket);

        return ticket;
    }

    async updateTicket(id: string, data: Partial<Ticket>, actor: MessageAuthor): Promise<Ticket | null> {
        const ticket = this.tickets.get(id);
        if (!ticket) return null;

        const oldStatus = ticket.status;
        const oldPriority = ticket.priority;
        const oldAssignee = ticket.assignedTo;

        Object.assign(ticket, data, { updatedAt: new Date() });

        // Log changes
        if (data.status && data.status !== oldStatus) {
            ticket.timeline.push({
                id: randomUUID(),
                type: "status_changed",
                description: `Status changed`,
                oldValue: oldStatus,
                newValue: data.status,
                actor,
                createdAt: new Date()
            });

            if (data.status === "resolved") {
                ticket.resolvedAt = new Date();
                ticket.sla.resolutionMet = new Date() <= ticket.sla.resolutionDue;
            }
            if (data.status === "closed") {
                ticket.closedAt = new Date();
            }
        }

        if (data.priority && data.priority !== oldPriority) {
            ticket.timeline.push({
                id: randomUUID(),
                type: "priority_changed",
                description: `Priority changed`,
                oldValue: oldPriority,
                newValue: data.priority,
                actor,
                createdAt: new Date()
            });
        }

        if (data.assignedTo && data.assignedTo !== oldAssignee) {
            ticket.timeline.push({
                id: randomUUID(),
                type: "assigned",
                description: `Assigned to agent`,
                oldValue: oldAssignee,
                newValue: data.assignedTo,
                actor,
                createdAt: new Date()
            });
        }

        return ticket;
    }

    async getTicket(id: string): Promise<Ticket | null> {
        return this.tickets.get(id) || null;
    }

    async getTicketByNumber(ticketNumber: string): Promise<Ticket | null> {
        for (const ticket of this.tickets.values()) {
            if (ticket.ticketNumber === ticketNumber) return ticket;
        }
        return null;
    }

    async getTickets(filters?: {
        status?: TicketStatus;
        priority?: TicketPriority;
        assignedTo?: string;
        customerId?: string;
        channel?: TicketChannel;
    }): Promise<Ticket[]> {
        let tickets = Array.from(this.tickets.values());

        if (filters) {
            if (filters.status) {
                tickets = tickets.filter(t => t.status === filters.status);
            }
            if (filters.priority) {
                tickets = tickets.filter(t => t.priority === filters.priority);
            }
            if (filters.assignedTo) {
                tickets = tickets.filter(t => t.assignedTo === filters.assignedTo);
            }
            if (filters.customerId) {
                tickets = tickets.filter(t => t.customerId === filters.customerId);
            }
            if (filters.channel) {
                tickets = tickets.filter(t => t.channel === filters.channel);
            }
        }

        return tickets.sort((a, b) => {
            // Sort by priority then by date
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];
            if (aPriority !== bPriority) return aPriority - bPriority;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    }

    async addTicketMessage(ticketId: string, message: Omit<TicketMessage, "id" | "createdAt">): Promise<Ticket | null> {
        const ticket = this.tickets.get(ticketId);
        if (!ticket) return null;

        const newMessage: TicketMessage = {
            id: randomUUID(),
            createdAt: new Date(),
            ...message
        };

        ticket.messages.push(newMessage);
        ticket.updatedAt = new Date();

        // Record first response time
        if (!ticket.firstResponseAt && message.author.type === "agent" && !message.isInternal) {
            ticket.firstResponseAt = new Date();
            ticket.sla.firstResponseMet = ticket.firstResponseAt <= ticket.sla.firstResponseDue;
        }

        // Update status
        if (message.author.type === "agent" && !message.isInternal && ticket.status === "new") {
            ticket.status = "open";
        }
        if (message.author.type === "customer" && ticket.status === "pending") {
            ticket.status = "open";
        }

        ticket.timeline.push({
            id: randomUUID(),
            type: "replied",
            description: message.isInternal ? "Internal note added" : `Reply from ${message.author.type}`,
            actor: message.author,
            createdAt: new Date()
        });

        return ticket;
    }

    async assignTicket(ticketId: string, agentId: string, actor: MessageAuthor): Promise<Ticket | null> {
        const agent = this.agents.get(agentId);
        if (!agent) return null;

        return this.updateTicket(ticketId, {
            assignedTo: agentId,
            status: "open"
        }, actor);
    }

    async escalateTicket(ticketId: string, reason: string, actor: MessageAuthor): Promise<Ticket | null> {
        const ticket = this.tickets.get(ticketId);
        if (!ticket) return null;

        ticket.status = "escalated";
        ticket.priority = "high";
        ticket.timeline.push({
            id: randomUUID(),
            type: "escalated",
            description: `Escalated: ${reason}`,
            actor,
            createdAt: new Date()
        });
        ticket.updatedAt = new Date();

        return ticket;
    }

    async resolveTicket(ticketId: string, resolution: TicketResolution, actor: MessageAuthor): Promise<Ticket | null> {
        const ticket = this.tickets.get(ticketId);
        if (!ticket) return null;

        ticket.status = "resolved";
        ticket.resolution = resolution;
        ticket.resolvedAt = new Date();
        ticket.sla.resolutionMet = ticket.resolvedAt <= ticket.sla.resolutionDue;

        ticket.timeline.push({
            id: randomUUID(),
            type: "resolved",
            description: "Ticket resolved",
            actor,
            createdAt: new Date()
        });
        ticket.updatedAt = new Date();

        return ticket;
    }

    async rateTicket(ticketId: string, rating: SatisfactionRating): Promise<Ticket | null> {
        const ticket = this.tickets.get(ticketId);
        if (!ticket) return null;

        ticket.satisfaction = rating;
        ticket.updatedAt = new Date();

        // Update agent metrics
        if (ticket.assignedTo) {
            await this.updateAgentSatisfaction(ticket.assignedTo, rating.score, rating.maxScore);
        }

        return ticket;
    }

    private async autoAssignTicket(ticket: Ticket): Promise<void> {
        // Find available agent with lowest workload
        const availableAgents = Array.from(this.agents.values())
            .filter(a => a.status === "online" && a.capacity.isAvailable)
            .filter(a => a.capacity.currentTickets < a.capacity.maxTickets)
            .sort((a, b) => a.capacity.currentTickets - b.capacity.currentTickets);

        if (availableAgents.length > 0) {
            ticket.assignedTo = availableAgents[0].id;
            ticket.status = "open";

            availableAgents[0].capacity.currentTickets++;

            ticket.timeline.push({
                id: randomUUID(),
                type: "assigned",
                description: "Auto-assigned to agent",
                newValue: availableAgents[0].id,
                actor: { type: "system", id: "system", name: "System" },
                createdAt: new Date()
            });
        }
    }

    private async getApplicableSLA(ticket: Partial<Ticket>): Promise<SLAPolicy> {
        // Find matching SLA or return default
        let policy = Array.from(this.slaPolicies.values()).find(p => p.isDefault && p.isActive);

        if (!policy) {
            policy = Array.from(this.slaPolicies.values())[0];
        }

        return policy;
    }

    private calculateSLADeadlines(policy: SLAPolicy): TicketSLA {
        const now = new Date();
        const priority: TicketPriority = "medium";

        const firstResponseTarget = policy.targets.find(t => t.metric === "first_response" && t.priority === priority);
        const resolutionTarget = policy.targets.find(t => t.metric === "resolution" && t.priority === priority);

        return {
            policyId: policy.id,
            policyName: policy.name,
            firstResponseDue: new Date(now.getTime() + (firstResponseTarget?.durationMinutes || 60) * 60 * 1000),
            resolutionDue: new Date(now.getTime() + (resolutionTarget?.durationMinutes || 480) * 60 * 1000),
            isBreached: false
        };
    }

    private initializeDefaultSLAPolicies(): void {
        const policy: SLAPolicy = {
            id: randomUUID(),
            name: "Standard SLA",
            description: "Default SLA policy",
            isDefault: true,
            conditions: [],
            targets: [
                { metric: "first_response", priority: "urgent", durationMinutes: 15 },
                { metric: "first_response", priority: "high", durationMinutes: 30 },
                { metric: "first_response", priority: "medium", durationMinutes: 60 },
                { metric: "first_response", priority: "low", durationMinutes: 120 },
                { metric: "resolution", priority: "urgent", durationMinutes: 120 },
                { metric: "resolution", priority: "high", durationMinutes: 240 },
                { metric: "resolution", priority: "medium", durationMinutes: 480 },
                { metric: "resolution", priority: "low", durationMinutes: 1440 }
            ],
            businessHours: {
                timezone: "Europe/Amsterdam",
                schedule: [
                    { dayOfWeek: 0, isOpen: false },
                    { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "18:00" },
                    { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "18:00" },
                    { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "18:00" },
                    { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "18:00" },
                    { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "18:00" },
                    { dayOfWeek: 6, isOpen: false }
                ],
                holidays: []
            },
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.slaPolicies.set(policy.id, policy);
    }

    // ===========================================================================
    // AGENT MANAGEMENT
    // ===========================================================================

    async createAgent(data: Partial<Agent>): Promise<Agent> {
        const agent: Agent = {
            id: randomUUID(),
            userId: data.userId || "",
            name: data.name || "",
            email: data.email || "",
            role: data.role || "agent",
            teams: data.teams || [],
            skills: data.skills || [],
            status: "offline",
            capacity: {
                maxTickets: 10,
                currentTickets: 0,
                maxChats: 3,
                currentChats: 0,
                isAvailable: true
            },
            metrics: {
                ticketsResolved: 0,
                averageResolutionTime: 0,
                averageFirstResponseTime: 0,
                satisfactionScore: 0,
                slaComplianceRate: 100,
                ticketsEscalated: 0
            },
            preferences: data.preferences || {
                autoAssign: true,
                notifyOnAssignment: true,
                notifyOnMention: true,
                language: "en"
            },
            createdAt: new Date(),
            ...data
        };

        this.agents.set(agent.id, agent);
        return agent;
    }

    async updateAgentStatus(agentId: string, status: AgentStatus): Promise<Agent | null> {
        const agent = this.agents.get(agentId);
        if (!agent) return null;

        agent.status = status;
        agent.capacity.isAvailable = status === "online";

        return agent;
    }

    async getAgents(status?: AgentStatus): Promise<Agent[]> {
        let agents = Array.from(this.agents.values());
        if (status) {
            agents = agents.filter(a => a.status === status);
        }
        return agents;
    }

    private async updateAgentSatisfaction(agentId: string, score: number, maxScore: number): Promise<void> {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        const normalizedScore = (score / maxScore) * 100;
        // Simple moving average
        agent.metrics.satisfactionScore =
            (agent.metrics.satisfactionScore * agent.metrics.ticketsResolved + normalizedScore) /
            (agent.metrics.ticketsResolved + 1);
    }

    // ===========================================================================
    // CANNED RESPONSES
    // ===========================================================================

    async createCannedResponse(data: Partial<CannedResponse>): Promise<CannedResponse> {
        const response: CannedResponse = {
            id: randomUUID(),
            title: data.title || "",
            content: data.content || "",
            tags: data.tags || [],
            visibility: data.visibility || "personal",
            ownerId: data.ownerId || "",
            variables: data.variables || [],
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.cannedResponses.set(response.id, response);
        return response;
    }

    async getCannedResponses(filters?: {
        visibility?: CannedResponse["visibility"];
        ownerId?: string;
        category?: string;
    }): Promise<CannedResponse[]> {
        let responses = Array.from(this.cannedResponses.values());

        if (filters) {
            if (filters.visibility) {
                responses = responses.filter(r => r.visibility === filters.visibility);
            }
            if (filters.ownerId) {
                responses = responses.filter(r =>
                    r.visibility === "global" ||
                    r.ownerId === filters.ownerId ||
                    (r.visibility === "team" && r.teamId)
                );
            }
            if (filters.category) {
                responses = responses.filter(r => r.categoryId === filters.category);
            }
        }

        return responses.sort((a, b) => b.usageCount - a.usageCount);
    }

    async useCannedResponse(id: string): Promise<CannedResponse | null> {
        const response = this.cannedResponses.get(id);
        if (!response) return null;

        response.usageCount++;
        return response;
    }

    private initializeDefaultResponses(): void {
        const responses: Partial<CannedResponse>[] = [
            { title: "Welcome", content: "Thank you for contacting us! How can I assist you today?", visibility: "global" },
            { title: "Follow Up", content: "Just checking in to see if you need any further assistance with your inquiry.", visibility: "global" },
            { title: "Resolution", content: "I'm glad we could resolve your issue. Is there anything else I can help you with?", visibility: "global" },
            { title: "Escalation Notice", content: "I'm escalating your ticket to our specialist team who will be better equipped to assist you.", visibility: "global" },
            { title: "Business Hours", content: "Our support team is available Monday-Friday, 9 AM to 6 PM CET.", visibility: "global" }
        ];

        for (const response of responses) {
            this.createCannedResponse({ ...response, ownerId: "system" });
        }
    }

    // ===========================================================================
    // CHAT SESSIONS
    // ===========================================================================

    async createChatSession(data: Partial<ChatSession>): Promise<ChatSession> {
        const session: ChatSession = {
            id: randomUUID(),
            visitorId: data.visitorId || randomUUID(),
            status: "waiting",
            channel: data.channel || "widget",
            messages: [],
            typing: [],
            metadata: data.metadata || { customFields: {}, previousVisits: 0 },
            startedAt: new Date(),
            ...data
        };

        // Add system message
        session.messages.push({
            id: randomUUID(),
            type: "system",
            content: "Chat session started",
            sender: "system",
            isRead: false,
            createdAt: new Date()
        });

        this.chatSessions.set(session.id, session);

        // Auto-assign to available agent
        await this.autoAssignChat(session);

        return session;
    }

    async sendChatMessage(sessionId: string, message: Omit<ChatMessage, "id" | "createdAt" | "isRead">): Promise<ChatSession | null> {
        const session = this.chatSessions.get(sessionId);
        if (!session || session.status === "ended") return null;

        session.messages.push({
            id: randomUUID(),
            isRead: false,
            createdAt: new Date(),
            ...message
        });

        // Update typing state
        session.typing = session.typing.filter(t =>
            t.participantId !== (message.senderId || session.visitorId)
        );

        return session;
    }

    async endChatSession(sessionId: string, agentId?: string): Promise<ChatSession | null> {
        const session = this.chatSessions.get(sessionId);
        if (!session) return null;

        session.status = "ended";
        session.endedAt = new Date();

        session.messages.push({
            id: randomUUID(),
            type: "system",
            content: "Chat session ended",
            sender: "system",
            isRead: false,
            createdAt: new Date()
        });

        // Update agent capacity
        if (session.agentId) {
            const agent = this.agents.get(session.agentId);
            if (agent) {
                agent.capacity.currentChats = Math.max(0, agent.capacity.currentChats - 1);
            }
        }

        return session;
    }

    async updateTyping(sessionId: string, participantId: string, participantType: "visitor" | "agent", isTyping: boolean): Promise<void> {
        const session = this.chatSessions.get(sessionId);
        if (!session) return;

        const existingIndex = session.typing.findIndex(t => t.participantId === participantId);

        if (existingIndex >= 0) {
            session.typing[existingIndex].isTyping = isTyping;
            session.typing[existingIndex].lastUpdated = new Date();
        } else if (isTyping) {
            session.typing.push({
                participantId,
                participantType,
                isTyping,
                lastUpdated: new Date()
            });
        }
    }

    private async autoAssignChat(session: ChatSession): Promise<void> {
        const availableAgents = Array.from(this.agents.values())
            .filter(a => a.status === "online" && a.capacity.isAvailable)
            .filter(a => a.capacity.currentChats < a.capacity.maxChats)
            .sort((a, b) => a.capacity.currentChats - b.capacity.currentChats);

        if (availableAgents.length > 0) {
            session.agentId = availableAgents[0].id;
            session.status = "active";
            availableAgents[0].capacity.currentChats++;

            session.messages.push({
                id: randomUUID(),
                type: "system",
                content: `${availableAgents[0].name} joined the chat`,
                sender: "system",
                isRead: false,
                createdAt: new Date()
            });
        }
    }

    // ===========================================================================
    // ANALYTICS
    // ===========================================================================

    async getSupportAnalytics(startDate: Date, endDate: Date): Promise<SupportAnalytics> {
        const tickets = Array.from(this.tickets.values())
            .filter(t => t.createdAt >= startDate && t.createdAt <= endDate);

        const agents = Array.from(this.agents.values());

        const byPriority: Record<TicketPriority, number> = {
            low: 0, medium: 0, high: 0, urgent: 0
        };
        const byType: Record<TicketType, number> = {
            question: 0, problem: 0, feature_request: 0, feedback: 0,
            complaint: 0, refund: 0, other: 0
        };

        for (const ticket of tickets) {
            byPriority[ticket.priority]++;
            byType[ticket.type]++;
        }

        const resolvedTickets = tickets.filter(t => t.resolvedAt);
        const avgResolutionTime = resolvedTickets.length > 0
            ? resolvedTickets.reduce((sum, t) =>
                sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0
            ) / resolvedTickets.length / (1000 * 60 * 60)
            : 0;

        const respondedTickets = tickets.filter(t => t.firstResponseAt);
        const avgFirstResponse = respondedTickets.length > 0
            ? respondedTickets.reduce((sum, t) =>
                sum + (t.firstResponseAt!.getTime() - t.createdAt.getTime()), 0
            ) / respondedTickets.length / (1000 * 60)
            : 0;

        const slaCompliant = tickets.filter(t => t.sla.firstResponseMet && t.sla.resolutionMet);
        const satisfactionRatings = tickets.filter(t => t.satisfaction);
        const avgSatisfaction = satisfactionRatings.length > 0
            ? satisfactionRatings.reduce((sum, t) =>
                sum + (t.satisfaction!.score / t.satisfaction!.maxScore) * 100, 0
            ) / satisfactionRatings.length
            : 0;

        return {
            period: { start: startDate, end: endDate },
            tickets: {
                total: tickets.length,
                new: tickets.filter(t => t.status === "new").length,
                open: tickets.filter(t => t.status === "open").length,
                pending: tickets.filter(t => t.status === "pending").length,
                resolved: tickets.filter(t => t.status === "resolved").length,
                closed: tickets.filter(t => t.status === "closed").length,
                byPriority,
                byType,
                byCategory: [],
                averageResolutionTime: avgResolutionTime,
                averageFirstResponseTime: avgFirstResponse,
                backlogTrend: []
            },
            agents: {
                totalAgents: agents.length,
                onlineAgents: agents.filter(a => a.status === "online").length,
                topPerformers: agents
                    .sort((a, b) => b.metrics.satisfactionScore - a.metrics.satisfactionScore)
                    .slice(0, 5)
                    .map(a => ({ agentId: a.id, name: a.name, score: a.metrics.satisfactionScore })),
                utilizationRate: agents.length > 0
                    ? agents.reduce((sum, a) => sum + a.capacity.currentTickets / a.capacity.maxTickets, 0) / agents.length * 100
                    : 0
            },
            sla: {
                complianceRate: tickets.length > 0 ? (slaCompliant.length / tickets.length) * 100 : 100,
                firstResponseCompliance: respondedTickets.length > 0
                    ? (respondedTickets.filter(t => t.sla.firstResponseMet).length / respondedTickets.length) * 100
                    : 100,
                resolutionCompliance: resolvedTickets.length > 0
                    ? (resolvedTickets.filter(t => t.sla.resolutionMet).length / resolvedTickets.length) * 100
                    : 100,
                breachesByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
                averageTimeToFirstResponse: avgFirstResponse,
                averageResolutionTime: avgResolutionTime
            },
            satisfaction: {
                averageScore: avgSatisfaction,
                responseRate: tickets.length > 0 ? (satisfactionRatings.length / tickets.length) * 100 : 0,
                distribution: [],
                byAgent: [],
                feedback: [],
                trend: []
            },
            channels: [
                { channel: "email", tickets: tickets.filter(t => t.channel === "email").length, percentage: 0, averageResolutionTime: 0, satisfactionScore: 0 },
                { channel: "web", tickets: tickets.filter(t => t.channel === "web").length, percentage: 0, averageResolutionTime: 0, satisfactionScore: 0 },
                { channel: "chat", tickets: tickets.filter(t => t.channel === "chat").length, percentage: 0, averageResolutionTime: 0, satisfactionScore: 0 }
            ],
            trending: []
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const knowledgeBaseService = new KnowledgeBaseService();
export default knowledgeBaseService;
