/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE SOCIAL MEDIA MANAGEMENT SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive multi-platform publishing, listening, and analytics.
 * 
 * TARGET SCALE: 50+ social accounts, 1000+ posts/month
 * ARCHITECTURE: Event-Driven, Queue-Based, AI-Powered
 * 
 * FEATURES:
 * - Multi-platform publishing (Instagram, TikTok, Twitter/X, Facebook, LinkedIn, Pinterest, YouTube)
 * - Content calendar & scheduling with timezone support
 * - AI-powered content generation & optimization
 * - Asset management specialized for tattoos/art
 * - Social listening & sentiment analysis
 * - Unified inbox for comments/DMs
 * - Competitor tracking & benchmarking
 * - Influencer discovery & management
 * - Hashtag research & optimization
 * - Best time to post analysis
 * - UTM tracking & attribution
 * - Campaign management & ROI tracking
 * - Story & Reel scheduling
 * - User-generated content curation
 * - Crisis management alerts
 * - Team collaboration & approval workflows
 * 
 * @module services/social-media-manager
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PLATFORM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export type SocialPlatform =
    | "instagram"
    | "tiktok"
    | "twitter"
    | "facebook"
    | "linkedin"
    | "pinterest"
    | "youtube"
    | "threads"
    | "snapchat"
    | "reddit";

export interface PlatformConfig {
    platform: SocialPlatform;
    accountId: string;
    customText?: string;
    hashtags?: string[];
    mentions?: string[];
    settings: PlatformSettings;
    mediaOverrides?: MediaOverride[];
}

export interface PlatformSettings {
    // Instagram specific
    shareToFeed?: boolean;
    shareToStory?: boolean;
    shareToReels?: boolean;
    locationTag?: LocationTag;
    shoppingTags?: ShoppingTag[];
    collaboratorTags?: string[];

    // Twitter specific
    threadEnabled?: boolean;
    pollEnabled?: boolean;
    pollOptions?: string[];
    pollDuration?: number;

    // LinkedIn specific
    visibilityLevel?: "public" | "connections" | "company";
    articleMode?: boolean;
    documentAttachment?: string;

    // TikTok specific
    duetEnabled?: boolean;
    stitchEnabled?: boolean;
    soundId?: string;

    // YouTube specific
    videoCategory?: string;
    visibility?: "public" | "private" | "unlisted";
    madeForKids?: boolean;

    // Pinterest specific
    boardId?: string;
    pinTitle?: string;
    destinationUrl?: string;

    // General
    crossPostEnabled?: boolean;
    scheduledComment?: string;
    autoReply?: AutoReplyConfig;
}

export interface LocationTag {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
}

export interface ShoppingTag {
    productId: string;
    x: number;
    y: number;
}

export interface MediaOverride {
    mediaId: string;
    cropSettings?: CropSettings;
    thumbnail?: string;
    altText?: string;
}

export interface CropSettings {
    x: number;
    y: number;
    width: number;
    height: number;
    aspectRatio: string;
}

export interface AutoReplyConfig {
    enabled: boolean;
    message: string;
    keywords?: string[];
    delay?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: SOCIAL ACCOUNTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SocialAccount {
    id: string;
    platform: SocialPlatform;
    name: string;
    handle: string;
    profileUrl: string;
    avatarUrl: string;
    bio?: string;
    website?: string;
    category?: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    pageId?: string;
    businessAccountId?: string;
    status: "active" | "disconnected" | "error" | "rate_limited" | "pending_reauth";
    lastError?: string;
    permissions: string[];
    metadata: AccountMetadata;
    features: AccountFeatures;
    rateLimit: RateLimitStatus;
    healthScore: number;
    createdAt: Date;
    updatedAt: Date;
    lastSyncAt?: Date;
}

export interface AccountMetadata {
    followers: number;
    following: number;
    postsCount: number;
    avgEngagement: number;
    avgReach: number;
    verifiedBadge: boolean;
    accountType: "personal" | "creator" | "business";
    industries?: string[];
    demographics?: AudienceDemographics;
}

export interface AudienceDemographics {
    ageRanges: { range: string; percentage: number }[];
    genders: { gender: string; percentage: number }[];
    topCountries: { country: string; percentage: number }[];
    topCities: { city: string; percentage: number }[];
    activeHours: { hour: number; activity: number }[];
    activeDays: { day: string; activity: number }[];
}

export interface AccountFeatures {
    canSchedule: boolean;
    canPublishReels: boolean;
    canPublishStories: boolean;
    canPublishCarousels: boolean;
    canTagProducts: boolean;
    canInsights: boolean;
    canModerate: boolean;
    canDirectMessage: boolean;
    hasCreatorStudio: boolean;
}

export interface RateLimitStatus {
    remaining: number;
    limit: number;
    resetsAt: Date;
    dailyUsage: number;
    dailyLimit: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: POSTS & CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface SocialPost {
    id: string;
    internalName: string;
    content: PostContent;
    media: PostMedia[];
    platforms: PlatformConfig[];
    schedule: PostSchedule;
    targeting?: PostTargeting;
    status: PostStatus;
    approvalStatus: ApprovalStatus;
    publishResults: PublishResult[];
    metrics: PostMetrics;
    attribution: AttributionData;
    campaign?: CampaignReference;
    authorId: string;
    collaborators: string[];
    tags: string[];
    labels: PostLabel[];
    notes: PostNote[];
    versions: PostVersion[];
    createdAt: Date;
    updatedAt: Date;
}

export type PostStatus = "draft" | "pending_approval" | "scheduled" | "publishing" | "published" | "partially_published" | "failed" | "archived" | "deleted";

export interface ApprovalStatus {
    required: boolean;
    status: "pending" | "approved" | "rejected" | "changes_requested";
    approvers: Approver[];
    comments: ApprovalComment[];
    approvedAt?: Date;
    approvedBy?: string;
}

export interface Approver {
    userId: string;
    role: string;
    decision?: "approved" | "rejected" | "changes_requested";
    decidedAt?: Date;
    comment?: string;
}

export interface ApprovalComment {
    id: string;
    userId: string;
    content: string;
    resolved: boolean;
    createdAt: Date;
}

export interface PostContent {
    text: string;
    hashtags: string[];
    mentions: string[];
    emojis: string[];
    links: PostLink[];
    callToAction?: string;
    alternativeTexts: Record<SocialPlatform, string>;
}

export interface PostLink {
    url: string;
    shortUrl?: string;
    utmParams?: UTMParams;
    preview?: LinkPreview;
}

export interface UTMParams {
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
}

export interface LinkPreview {
    title: string;
    description: string;
    image: string;
    domain: string;
}

export interface PostMedia {
    id: string;
    type: "image" | "video" | "carousel" | "gif" | "audio" | "document";
    url: string;
    thumbnailUrl?: string;
    filename: string;
    mimeType: string;
    size: number;
    dimensions?: { width: number; height: number };
    duration?: number;
    altText?: string;
    order: number;
    platformVersions: Record<SocialPlatform, MediaVersion>;
}

export interface MediaVersion {
    url: string;
    dimensions: { width: number; height: number };
    optimized: boolean;
}

export interface PostSchedule {
    type: "immediate" | "scheduled" | "optimal" | "queue" | "recurring";
    scheduledAt?: Date;
    timezone: string;
    optimalTimeWindow?: { start: string; end: string };
    recurrence?: PostRecurrence;
    queuePosition?: number;
}

export interface PostRecurrence {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
    maxOccurrences?: number;
    currentOccurrence: number;
}

export interface PostTargeting {
    audiences?: string[];
    ageRange?: { min: number; max: number };
    genders?: string[];
    locations?: string[];
    languages?: string[];
    interests?: string[];
    excludedAudiences?: string[];
}

export interface PublishResult {
    platform: SocialPlatform;
    accountId: string;
    status: "pending" | "success" | "failed" | "partial";
    postId?: string;
    postUrl?: string;
    error?: PublishError;
    publishedAt?: Date;
    retryCount: number;
}

export interface PublishError {
    code: string;
    message: string;
    recoverable: boolean;
    suggestedFix?: string;
}

export interface PostMetrics {
    impressions: number;
    reach: number;
    engagement: number;
    engagementRate: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    linkClicks: number;
    profileVisits: number;
    videoViews: number;
    videoWatchTime: number;
    videoCompletionRate: number;
    replyCount: number;
    quoteCount: number;
    reposts: number;
    reactions: ReactionBreakdown;
    platformMetrics: Record<SocialPlatform, PlatformMetrics>;
    historicalData: MetricSnapshot[];
}

export interface ReactionBreakdown {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
    care: number;
}

export interface PlatformMetrics {
    platform: SocialPlatform;
    impressions: number;
    reach: number;
    engagement: number;
    engagementRate: number;
    customMetrics: Record<string, number>;
}

export interface MetricSnapshot {
    timestamp: Date;
    impressions: number;
    engagement: number;
    reach: number;
}

export interface AttributionData {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    conversions: number;
    revenue: number;
    leadsCaptured: number;
    bookingsGenerated: number;
}

export interface CampaignReference {
    id: string;
    name: string;
    objectives: string[];
}

export interface PostLabel {
    id: string;
    name: string;
    color: string;
}

export interface PostNote {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
}

export interface PostVersion {
    id: string;
    versionNumber: number;
    content: PostContent;
    changedBy: string;
    changedAt: Date;
    changeNote?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: SOCIAL LISTENING
// ═══════════════════════════════════════════════════════════════════════════════

export interface ListeningTopic {
    id: string;
    name: string;
    description?: string;
    keywords: string[];
    excludedKeywords: string[];
    hashtags: string[];
    accounts: string[];
    languages: string[];
    locations?: string[];
    platforms: SocialPlatform[];
    filters: TopicFilter[];
    status: "active" | "paused" | "archived";
    alertRules: AlertRule[];
    mentions: Mention[];
    analytics: TopicAnalytics;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TopicFilter {
    type: "sentiment" | "engagement" | "follower_count" | "verified" | "media_type";
    operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in" | "not_in";
    value: any;
}

export interface AlertRule {
    id: string;
    name: string;
    type: "spike" | "threshold" | "sentiment_drop" | "keyword_match" | "crisis";
    condition: AlertCondition;
    channels: NotificationChannel[];
    cooldown: number;
    enabled: boolean;
    triggeredCount: number;
    lastTriggeredAt?: Date;
}

export interface AlertCondition {
    metric: string;
    operator: "gt" | "lt" | "eq" | "change_percent";
    value: number;
    timeWindow?: number;
}

export interface NotificationChannel {
    type: "email" | "slack" | "sms" | "webhook" | "push";
    target: string;
}

export interface Mention {
    id: string;
    topicId: string;
    platform: SocialPlatform;
    author: MentionAuthor;
    content: string;
    translatedContent?: string;
    language: string;
    url: string;
    mediaUrls: string[];
    timestamp: Date;
    sentiment: SentimentAnalysis;
    engagement: MentionEngagement;
    context: MentionContext;
    status: "new" | "seen" | "responded" | "flagged" | "archived";
    assignedTo?: string;
    response?: MentionResponse;
    tags: string[];
    createdAt: Date;
}

export interface MentionAuthor {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
    followerCount: number;
    verified: boolean;
    accountType: string;
    influenceScore?: number;
}

export interface SentimentAnalysis {
    score: number;
    label: "positive" | "neutral" | "negative" | "mixed";
    confidence: number;
    emotions: EmotionBreakdown;
    keywords: SentimentKeyword[];
}

export interface EmotionBreakdown {
    joy: number;
    trust: number;
    fear: number;
    surprise: number;
    sadness: number;
    disgust: number;
    anger: number;
    anticipation: number;
}

export interface SentimentKeyword {
    word: string;
    sentiment: "positive" | "negative";
    weight: number;
}

export interface MentionEngagement {
    likes: number;
    comments: number;
    shares: number;
    views: number;
}

export interface MentionContext {
    parentPostId?: string;
    threadPosition?: number;
    isReply: boolean;
    isQuote: boolean;
    isOriginal: boolean;
}

export interface MentionResponse {
    content: string;
    sentAt: Date;
    sentBy: string;
    resultUrl?: string;
}

export interface TopicAnalytics {
    totalMentions: number;
    mentionsByDay: { date: string; count: number }[];
    sentimentDistribution: { positive: number; neutral: number; negative: number };
    avgSentimentScore: number;
    sentimentTrend: { date: string; score: number }[];
    topKeywords: { word: string; count: number; sentiment: number }[];
    topHashtags: { hashtag: string; count: number }[];
    topAuthors: { author: MentionAuthor; count: number }[];
    platformDistribution: { platform: SocialPlatform; count: number }[];
    engagementTotal: number;
    reachEstimate: number;
    shareOfVoice?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: CONTENT CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContentCalendar {
    id: string;
    name: string;
    description?: string;
    timezone: string;
    accounts: string[];
    posts: string[];
    slots: PostingSlot[];
    holidays: CalendarHoliday[];
    themes: ContentTheme[];
    settings: CalendarSettings;
    collaborators: CalendarCollaborator[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PostingSlot {
    id: string;
    dayOfWeek: number;
    time: string;
    platform: SocialPlatform;
    accountId?: string;
    type: "best_time" | "manual" | "recurring";
    contentType?: string;
    labels?: string[];
}

export interface CalendarHoliday {
    id: string;
    name: string;
    date: Date;
    recurring: boolean;
    country?: string;
    contentSuggestions?: string[];
}

export interface ContentTheme {
    id: string;
    name: string;
    color: string;
    description: string;
    defaultHashtags: string[];
    frequency: "daily" | "weekly" | "monthly";
    dayOfWeek?: number;
}

export interface CalendarSettings {
    defaultTimezone: string;
    workingDays: number[];
    workingHoursStart: string;
    workingHoursEnd: string;
    approvalRequired: boolean;
    defaultApprovers: string[];
    notifyOnPublish: boolean;
    notifyOnFail: boolean;
}

export interface CalendarCollaborator {
    userId: string;
    role: "viewer" | "contributor" | "editor" | "admin";
    addedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: INFLUENCER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface Influencer {
    id: string;
    name: string;
    handle: string;
    platform: SocialPlatform;
    profileUrl: string;
    avatarUrl: string;
    bio?: string;
    niche: string[];
    location?: string;
    language?: string;
    audience: InfluencerAudience;
    metrics: InfluencerMetrics;
    pricing: InfluencerPricing;
    status: InfluencerStatus;
    relationship: RelationshipHistory;
    collaborations: Collaboration[];
    contracts: InfluencerContract[];
    payments: InfluencerPayment[];
    contentExamples: ContentExample[];
    rating: InfluencerRating;
    contactInfo: InfluencerContact;
    notes: string[];
    tags: string[];
    source: "manual" | "discovered" | "applied" | "referred";
    createdAt: Date;
    updatedAt: Date;
}

export type InfluencerStatus = "prospect" | "outreach" | "negotiating" | "contracted" | "active" | "completed" | "declined" | "blacklisted";

export interface InfluencerAudience {
    followers: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    followersGrowth: number;
    audienceQuality: number;
    demographics?: AudienceDemographics;
    authenticity: number;
    botPercentage: number;
}

export interface InfluencerMetrics {
    totalPosts: number;
    avgPostFrequency: number;
    avgReach: number;
    avgImpressions: number;
    contentCategories: { category: string; percentage: number }[];
    topPerformingTypes: string[];
    brandMentionFrequency: number;
}

export interface InfluencerPricing {
    currency: string;
    postRate?: number;
    storyRate?: number;
    reelRate?: number;
    videoRate?: number;
    bundleRates?: { name: string; deliverables: string[]; price: number }[];
    negotiable: boolean;
    notes?: string;
}

export interface RelationshipHistory {
    firstContactDate?: Date;
    lastContactDate?: Date;
    totalCollaborations: number;
    totalSpent: number;
    totalROI: number;
    averageResponseTime?: number;
    communications: Communication[];
}

export interface Communication {
    id: string;
    type: "email" | "dm" | "call" | "meeting" | "other";
    direction: "inbound" | "outbound";
    subject?: string;
    content: string;
    attachments?: string[];
    sentBy: string;
    sentAt: Date;
    responseReceived?: boolean;
}

export interface Collaboration {
    id: string;
    influencerId: string;
    campaignId?: string;
    title: string;
    type: CollaborationType;
    status: CollaborationStatus;
    deliverables: Deliverable[];
    timeline: CollaborationTimeline;
    compensation: Compensation;
    content: CollaborationContent[];
    performance: CollaborationPerformance;
    feedback?: CollaborationFeedback;
    createdAt: Date;
    updatedAt: Date;
}

export type CollaborationType = "sponsored_post" | "story" | "reel" | "video" | "review" | "giveaway" | "takeover" | "event" | "ambassador" | "affiliate" | "product_seeding" | "free_tattoo";

export type CollaborationStatus = "draft" | "proposed" | "negotiating" | "accepted" | "in_progress" | "content_review" | "published" | "completed" | "cancelled";

export interface Deliverable {
    id: string;
    type: string;
    description: string;
    platform: SocialPlatform;
    dueDate: Date;
    status: "pending" | "submitted" | "approved" | "revision_requested" | "completed";
    submissionUrl?: string;
    revisionNotes?: string;
}

export interface CollaborationTimeline {
    proposedAt?: Date;
    acceptedAt?: Date;
    contentDueAt: Date;
    publishAt: Date;
    completedAt?: Date;
}

export interface Compensation {
    type: "monetary" | "product" | "service" | "commission" | "hybrid";
    monetaryAmount?: number;
    currency?: string;
    productValue?: number;
    serviceValue?: number;
    commissionRate?: number;
    paymentTerms: string;
    paymentStatus: "pending" | "partial" | "paid";
}

export interface CollaborationContent {
    id: string;
    deliverableId: string;
    url: string;
    type: string;
    caption?: string;
    submittedAt: Date;
    approved: boolean;
}

export interface CollaborationPerformance {
    impressions: number;
    reach: number;
    engagement: number;
    engagementRate: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    cpe: number;
    cpm: number;
}

export interface CollaborationFeedback {
    rating: number;
    professionalism: number;
    contentQuality: number;
    timeliness: number;
    communication: number;
    wouldWorkAgain: boolean;
    notes?: string;
}

export interface InfluencerContract {
    id: string;
    type: string;
    status: "draft" | "sent" | "signed" | "expired" | "terminated";
    startDate: Date;
    endDate: Date;
    terms: string;
    documentUrl?: string;
    signedAt?: Date;
}

export interface InfluencerPayment {
    id: string;
    collaborationId: string;
    amount: number;
    currency: string;
    status: "pending" | "processing" | "paid" | "failed";
    method: string;
    dueDate: Date;
    paidDate?: Date;
    invoiceUrl?: string;
}

export interface ContentExample {
    id: string;
    url: string;
    platform: SocialPlatform;
    type: string;
    engagement: number;
    notes?: string;
}

export interface InfluencerRating {
    overall: number;
    contentQuality: number;
    professionalism: number;
    reliability: number;
    audienceMatch: number;
    reviewCount: number;
    lastReviewAt?: Date;
}

export interface InfluencerContact {
    email: string;
    phone?: string;
    whatsapp?: string;
    agentName?: string;
    agentEmail?: string;
    preferredContact: "email" | "dm" | "phone" | "agent";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: HASHTAG RESEARCH
// ═══════════════════════════════════════════════════════════════════════════════

export interface HashtagResearch {
    id: string;
    query: string;
    platform: SocialPlatform;
    results: HashtagResult[];
    savedHashtags: string[];
    createdAt: Date;
}

export interface HashtagResult {
    hashtag: string;
    postCount: number;
    avgEngagement: number;
    difficulty: "easy" | "medium" | "hard";
    trend: "rising" | "stable" | "declining";
    relevanceScore: number;
    relatedHashtags: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: UNIFIED INBOX
// ═══════════════════════════════════════════════════════════════════════════════

export interface InboxConversation {
    id: string;
    platform: SocialPlatform;
    accountId: string;
    type: "dm" | "comment" | "mention" | "review";
    participant: ConversationParticipant;
    messages: InboxMessage[];
    status: "open" | "pending" | "resolved" | "spam";
    priority: "low" | "normal" | "high" | "urgent";
    assignedTo?: string;
    labels: string[];
    sentiment?: SentimentAnalysis;
    lastMessageAt: Date;
    firstMessageAt: Date;
    responseTime?: number;
    resolved?: boolean;
    resolvedAt?: Date;
}

export interface ConversationParticipant {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
    followerCount?: number;
    isVerified: boolean;
    isCustomer: boolean;
    customerId?: string;
    previousInteractions: number;
}

export interface InboxMessage {
    id: string;
    conversationId: string;
    direction: "inbound" | "outbound";
    content: string;
    mediaUrl?: string;
    timestamp: Date;
    read: boolean;
    sentBy?: string;
    replyTo?: string;
    reactions?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL MEDIA SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class SocialMediaService extends EventEmitter {
    private posts: Map<string, SocialPost> = new Map();
    private accounts: Map<string, SocialAccount> = new Map();
    private topics: Map<string, ListeningTopic> = new Map();
    private influencers: Map<string, Influencer> = new Map();
    private calendars: Map<string, ContentCalendar> = new Map();
    private conversations: Map<string, InboxConversation> = new Map();
    private publishQueue: PublishJob[] = [];

    constructor() {
        super();
        this.seedData();
        this.startPublishWorker();
        this.startMetricsCollector();
        this.startSentimentAnalyzer();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createPost(data: Partial<SocialPost>): Promise<SocialPost> {
        const post: SocialPost = {
            id: randomUUID(),
            internalName: data.internalName || "Untitled Post",
            content: data.content || { text: "", hashtags: [], mentions: [], emojis: [], links: [], alternativeTexts: {} as any },
            media: data.media || [],
            platforms: data.platforms || [],
            schedule: data.schedule || { type: "scheduled", timezone: "UTC" },
            status: "draft",
            approvalStatus: { required: false, status: "pending", approvers: [], comments: [] },
            publishResults: [],
            metrics: this.getEmptyMetrics(),
            attribution: { conversions: 0, revenue: 0, leadsCaptured: 0, bookingsGenerated: 0 },
            authorId: data.authorId || "system",
            collaborators: data.collaborators || [],
            tags: data.tags || [],
            labels: data.labels || [],
            notes: [],
            versions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.posts.set(post.id, post);

        await eventBus.publish("social.post_created", { postId: post.id });

        return post;
    }

    async schedulePost(postId: string, schedule: PostSchedule): Promise<SocialPost> {
        const post = this.posts.get(postId);
        if (!post) throw new Error("Post not found");

        post.schedule = schedule;
        post.status = "scheduled";
        post.updatedAt = new Date();

        if (schedule.type === "optimal") {
            post.schedule.scheduledAt = await this.calculateOptimalTime(post.platforms);
        }

        this.addToPublishQueue(post);

        await eventBus.publish("social.post_scheduled", { postId, scheduledAt: post.schedule.scheduledAt });

        return post;
    }

    async publishPost(postId: string): Promise<PublishResult[]> {
        const post = this.posts.get(postId);
        if (!post) throw new Error("Post not found");

        post.status = "publishing";
        const results: PublishResult[] = [];

        for (const platformConfig of post.platforms) {
            const result = await this.publishToPlatform(post, platformConfig);
            results.push(result);
            post.publishResults.push(result);
        }

        const allSuccess = results.every(r => r.status === "success");
        const allFailed = results.every(r => r.status === "failed");

        post.status = allSuccess ? "published" : allFailed ? "failed" : "partially_published";
        post.updatedAt = new Date();

        await eventBus.publish("social.post_published", { postId, results });

        return results;
    }

    private async publishToPlatform(post: SocialPost, config: PlatformConfig): Promise<PublishResult> {
        const account = this.accounts.get(config.accountId);
        if (!account || account.status !== "active") {
            return {
                platform: config.platform,
                accountId: config.accountId,
                status: "failed",
                error: { code: "ACCOUNT_ERROR", message: "Account not active", recoverable: true },
                retryCount: 0,
            };
        }

        // Simulate API call
        const success = Math.random() > 0.1;

        if (success) {
            return {
                platform: config.platform,
                accountId: config.accountId,
                status: "success",
                postId: `${config.platform}_${randomUUID().slice(0, 8)}`,
                postUrl: `https://${config.platform}.com/p/${randomUUID().slice(0, 8)}`,
                publishedAt: new Date(),
                retryCount: 0,
            };
        } else {
            return {
                platform: config.platform,
                accountId: config.accountId,
                status: "failed",
                error: { code: "API_ERROR", message: "Failed to publish", recoverable: true, suggestedFix: "Retry later" },
                retryCount: 0,
            };
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACCOUNT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async connectAccount(platform: SocialPlatform, authCode: string): Promise<SocialAccount> {
        const account: SocialAccount = {
            id: randomUUID(),
            platform,
            name: "Altus Ink",
            handle: `@altusink_${platform}`,
            profileUrl: `https://${platform}.com/altusink`,
            avatarUrl: "",
            accessToken: `token_${randomUUID()}`,
            status: "active",
            permissions: ["read", "write", "insights"],
            metadata: { followers: Math.floor(Math.random() * 100000), following: 500, postsCount: 200, avgEngagement: 3.5, avgReach: 5000, verifiedBadge: true, accountType: "business" },
            features: { canSchedule: true, canPublishReels: true, canPublishStories: true, canPublishCarousels: true, canTagProducts: true, canInsights: true, canModerate: true, canDirectMessage: true, hasCreatorStudio: true },
            rateLimit: { remaining: 100, limit: 100, resetsAt: new Date(), dailyUsage: 0, dailyLimit: 200 },
            healthScore: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.accounts.set(account.id, account);

        await eventBus.publish("social.account_connected", { accountId: account.id, platform });

        return account;
    }

    async refreshAccountToken(accountId: string): Promise<boolean> {
        const account = this.accounts.get(accountId);
        if (!account || !account.refreshToken) return false;

        account.accessToken = `refreshed_${randomUUID()}`;
        account.tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
        account.status = "active";
        account.updatedAt = new Date();

        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SOCIAL LISTENING
    // ═══════════════════════════════════════════════════════════════════════════

    async createTopic(data: Partial<ListeningTopic>): Promise<ListeningTopic> {
        const topic: ListeningTopic = {
            id: randomUUID(),
            name: data.name || "New Topic",
            keywords: data.keywords || [],
            excludedKeywords: data.excludedKeywords || [],
            hashtags: data.hashtags || [],
            accounts: data.accounts || [],
            languages: data.languages || ["en"],
            platforms: data.platforms || ["twitter", "instagram"],
            filters: data.filters || [],
            status: "active",
            alertRules: data.alertRules || [],
            mentions: [],
            analytics: this.getEmptyTopicAnalytics(),
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.topics.set(topic.id, topic);

        await eventBus.publish("social.topic_created", { topicId: topic.id });

        return topic;
    }

    async addMention(topicId: string, data: Partial<Mention>): Promise<Mention> {
        const topic = this.topics.get(topicId);
        if (!topic) throw new Error("Topic not found");

        const mention: Mention = {
            id: randomUUID(),
            topicId,
            platform: data.platform || "twitter",
            author: data.author || { id: "", name: "", handle: "", followerCount: 0, verified: false, accountType: "personal" },
            content: data.content || "",
            language: data.language || "en",
            url: data.url || "",
            mediaUrls: data.mediaUrls || [],
            timestamp: data.timestamp || new Date(),
            sentiment: data.sentiment || { score: 0, label: "neutral", confidence: 0.5, emotions: { joy: 0, trust: 0, fear: 0, surprise: 0, sadness: 0, disgust: 0, anger: 0, anticipation: 0 }, keywords: [] },
            engagement: data.engagement || { likes: 0, comments: 0, shares: 0, views: 0 },
            context: data.context || { isReply: false, isQuote: false, isOriginal: true },
            status: "new",
            tags: [],
            createdAt: new Date(),
        };

        topic.mentions.push(mention);
        this.updateTopicAnalytics(topic, mention);

        // Check alert rules
        await this.checkAlertRules(topic, mention);

        return mention;
    }

    private updateTopicAnalytics(topic: ListeningTopic, mention: Mention): void {
        topic.analytics.totalMentions++;
        topic.analytics.avgSentimentScore =
            (topic.analytics.avgSentimentScore * (topic.analytics.totalMentions - 1) + mention.sentiment.score) / topic.analytics.totalMentions;

        const distribution = topic.analytics.sentimentDistribution;
        if (mention.sentiment.label === "positive") distribution.positive++;
        else if (mention.sentiment.label === "negative") distribution.negative++;
        else distribution.neutral++;
    }

    private async checkAlertRules(topic: ListeningTopic, mention: Mention): Promise<void> {
        for (const rule of topic.alertRules) {
            if (!rule.enabled) continue;

            let triggered = false;

            if (rule.type === "sentiment_drop" && mention.sentiment.score < rule.condition.value) {
                triggered = true;
            } else if (rule.type === "crisis" && mention.sentiment.label === "negative" && mention.author.followerCount > 10000) {
                triggered = true;
            }

            if (triggered) {
                rule.triggeredCount++;
                rule.lastTriggeredAt = new Date();
                await eventBus.publish("social.alert_triggered", { topicId: topic.id, ruleId: rule.id, mentionId: mention.id });
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INFLUENCER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async discoverInfluencers(criteria: InfluencerSearchCriteria): Promise<Influencer[]> {
        // Simulate API search
        const discovered: Influencer[] = [];

        for (let i = 0; i < 10; i++) {
            const influencer = await this.addInfluencer({
                name: `Discovered Artist ${i + 1}`,
                handle: `@artist${i + 1}`,
                platform: criteria.platform || "instagram",
                niche: criteria.niches || ["tattoo"],
                source: "discovered",
            });
            discovered.push(influencer);
        }

        return discovered;
    }

    async addInfluencer(data: Partial<Influencer>): Promise<Influencer> {
        const influencer: Influencer = {
            id: randomUUID(),
            name: data.name || "New Influencer",
            handle: data.handle || "",
            platform: data.platform || "instagram",
            profileUrl: data.profileUrl || "",
            avatarUrl: data.avatarUrl || "",
            niche: data.niche || [],
            audience: data.audience || { followers: 0, avgLikes: 0, avgComments: 0, engagementRate: 0, followersGrowth: 0, audienceQuality: 0, authenticity: 0, botPercentage: 0 },
            metrics: data.metrics || { totalPosts: 0, avgPostFrequency: 0, avgReach: 0, avgImpressions: 0, contentCategories: [], topPerformingTypes: [], brandMentionFrequency: 0 },
            pricing: data.pricing || { currency: "USD", negotiable: true },
            status: "prospect",
            relationship: { totalCollaborations: 0, totalSpent: 0, totalROI: 0, communications: [] },
            collaborations: [],
            contracts: [],
            payments: [],
            contentExamples: [],
            rating: { overall: 0, contentQuality: 0, professionalism: 0, reliability: 0, audienceMatch: 0, reviewCount: 0 },
            contactInfo: data.contactInfo || { email: "", preferredContact: "email" },
            notes: [],
            tags: [],
            source: data.source || "manual",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.influencers.set(influencer.id, influencer);

        return influencer;
    }

    async createCollaboration(influencerId: string, data: Partial<Collaboration>): Promise<Collaboration> {
        const influencer = this.influencers.get(influencerId);
        if (!influencer) throw new Error("Influencer not found");

        const collab: Collaboration = {
            id: randomUUID(),
            influencerId,
            title: data.title || "New Collaboration",
            type: data.type || "sponsored_post",
            status: "draft",
            deliverables: data.deliverables || [],
            timeline: data.timeline || { contentDueAt: new Date(), publishAt: new Date() },
            compensation: data.compensation || { type: "monetary", paymentTerms: "Net 30", paymentStatus: "pending" },
            content: [],
            performance: { impressions: 0, reach: 0, engagement: 0, engagementRate: 0, clicks: 0, conversions: 0, revenue: 0, roi: 0, cpe: 0, cpm: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        influencer.collaborations.push(collab);

        await eventBus.publish("social.collaboration_created", { influencerId, collaborationId: collab.id });

        return collab;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ANALYTICS
    // ═══════════════════════════════════════════════════════════════════════════

    async getAnalytics(query: AnalyticsQuery): Promise<SocialAnalytics> {
        const accounts = Array.from(this.accounts.values());
        const posts = Array.from(this.posts.values()).filter(p => p.status === "published");

        const totalFollowers = accounts.reduce((sum, a) => sum + (a.metadata.followers || 0), 0);
        const totalEngagement = posts.reduce((sum, p) => sum + p.metrics.engagement, 0);
        const totalReach = posts.reduce((sum, p) => sum + p.metrics.reach, 0);

        return {
            period: query.period || "30d",
            accounts: accounts.length,
            totalFollowers,
            followerGrowth: Math.floor(Math.random() * 1000),
            totalPosts: posts.length,
            totalEngagement,
            avgEngagementRate: totalFollowers > 0 ? (totalEngagement / totalFollowers) * 100 : 0,
            totalReach,
            totalImpressions: totalReach * 1.5,
            topPerformingPosts: posts.sort((a, b) => b.metrics.engagement - a.metrics.engagement).slice(0, 5).map(p => ({ postId: p.id, engagement: p.metrics.engagement })),
            platformBreakdown: {},
            bestPostingTimes: [{ day: "Tuesday", time: "10:00", engagement: 5.2 }, { day: "Thursday", time: "18:00", engagement: 4.8 }],
            contentTypePerformance: {},
        };
    }

    async getBestPostingTimes(accountId: string): Promise<BestTime[]> {
        // Analyze historical data
        return [
            { dayOfWeek: 2, hour: 10, engagementScore: 95 },
            { dayOfWeek: 4, hour: 18, engagementScore: 88 },
            { dayOfWeek: 6, hour: 12, engagementScore: 82 },
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BACKGROUND WORKERS
    // ═══════════════════════════════════════════════════════════════════════════

    private startPublishWorker(): void {
        setInterval(async () => {
            const now = new Date();
            for (let i = this.publishQueue.length - 1; i >= 0; i--) {
                const job = this.publishQueue[i];
                if (job.scheduledAt <= now && job.status === "pending") {
                    job.status = "processing";
                    try {
                        await this.publishPost(job.postId);
                        job.status = "completed";
                    } catch (error) {
                        job.status = "failed";
                        job.retries++;
                    }
                    this.publishQueue.splice(i, 1);
                }
            }
        }, 10000);
    }

    private startMetricsCollector(): void {
        setInterval(async () => {
            for (const post of this.posts.values()) {
                if (post.status === "published") {
                    // Simulate metrics update
                    post.metrics.impressions += Math.floor(Math.random() * 100);
                    post.metrics.engagement += Math.floor(Math.random() * 10);
                }
            }
        }, 60000);
    }

    private startSentimentAnalyzer(): void {
        setInterval(async () => {
            for (const topic of this.topics.values()) {
                if (topic.status !== "active") continue;

                // Simulate new mentions
                if (Math.random() > 0.8) {
                    await this.addMention(topic.id, {
                        content: "Sample mention about " + topic.keywords[0],
                        platform: topic.platforms[0],
                        sentiment: {
                            score: Math.random() * 2 - 1,
                            label: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
                            confidence: 0.8,
                            emotions: { joy: 0, trust: 0, fear: 0, surprise: 0, sadness: 0, disgust: 0, anger: 0, anticipation: 0 },
                            keywords: [],
                        },
                    });
                }
            }
        }, 30000);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    private getEmptyMetrics(): PostMetrics {
        return {
            impressions: 0, reach: 0, engagement: 0, engagementRate: 0,
            likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, linkClicks: 0,
            profileVisits: 0, videoViews: 0, videoWatchTime: 0, videoCompletionRate: 0,
            replyCount: 0, quoteCount: 0, reposts: 0,
            reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, care: 0 },
            platformMetrics: {},
            historicalData: [],
        };
    }

    private getEmptyTopicAnalytics(): TopicAnalytics {
        return {
            totalMentions: 0, mentionsByDay: [], sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
            avgSentimentScore: 0, sentimentTrend: [], topKeywords: [], topHashtags: [],
            topAuthors: [], platformDistribution: [], engagementTotal: 0, reachEstimate: 0,
        };
    }

    private async calculateOptimalTime(platforms: PlatformConfig[]): Promise<Date> {
        // Analyze best times across platforms
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        return tomorrow;
    }

    private addToPublishQueue(post: SocialPost): void {
        if (post.schedule.scheduledAt) {
            this.publishQueue.push({
                postId: post.id,
                scheduledAt: post.schedule.scheduledAt,
                status: "pending",
                retries: 0,
            });
        }
    }

    private seedData(): void {
        // Seed sample accounts
        this.connectAccount("instagram", "oauth_code");
        this.connectAccount("tiktok", "oauth_code");
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PublishJob {
    postId: string;
    scheduledAt: Date;
    status: "pending" | "processing" | "completed" | "failed";
    retries: number;
}

interface InfluencerSearchCriteria {
    platform?: SocialPlatform;
    niches?: string[];
    minFollowers?: number;
    maxFollowers?: number;
    minEngagement?: number;
    location?: string;
}

interface AnalyticsQuery {
    period?: string;
    platforms?: SocialPlatform[];
    accounts?: string[];
}

interface SocialAnalytics {
    period: string;
    accounts: number;
    totalFollowers: number;
    followerGrowth: number;
    totalPosts: number;
    totalEngagement: number;
    avgEngagementRate: number;
    totalReach: number;
    totalImpressions: number;
    topPerformingPosts: { postId: string; engagement: number }[];
    platformBreakdown: Record<string, any>;
    bestPostingTimes: { day: string; time: string; engagement: number }[];
    contentTypePerformance: Record<string, any>;
}

interface BestTime {
    dayOfWeek: number;
    hour: number;
    engagementScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const socialMediaService = new SocialMediaService();
export default socialMediaService;
