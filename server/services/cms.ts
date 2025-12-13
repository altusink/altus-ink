/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE CONTENT MANAGEMENT SYSTEM (CMS)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The brain that controls all content, layouts, SEO, and digital experiences.
 * 
 * FEATURES:
 * - Headless CMS Architecture (API-first)
 * - Visual Page Builder (JSON-based)
 * - Block Editor (Notion/WordPress Gutenberg style)
 * - Media Library with CDN optimization
 * - Version Control & Rollback
 * - Multi-language Content (i18n)
 * - A/B Testing Engine
 * - SEO Engine (OpenGraph, Schema.org, Sitemap)
 * - Content Scheduling
 * - Content Workflows (Draft → Review → Published)
 * - Template System
 * - Reusable Content Blocks
 * - Content Analytics & Heatmaps
 * - Personalization Engine
 * - Content Migration Tools
 * 
 * @module services/cms
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";
import { cacheService } from "./core/cache";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: CONTENT MODELS
// ═══════════════════════════════════════════════════════════════════════════════

export type ContentStatus = "draft" | "pending_review" | "approved" | "published" | "scheduled" | "archived" | "trash";

export type ContentType = "page" | "post" | "landing" | "email_template" | "popup" | "banner" | "legal" | "faq";

export interface ContentModel {
    id: string;
    type: ContentType;
    slug: string;
    title: string;
    excerpt?: string;
    content: ContentBlock[];
    layout: LayoutConfig;
    seo: SEOConfig;
    author: ContentAuthor;
    workflow: WorkflowState;
    versioning: VersionInfo;
    scheduling: SchedulingConfig;
    personalization: PersonalizationRules;
    analytics: ContentAnalytics;
    localization: LocalizationInfo;
    metadata: ContentMetadata;
    permissions: ContentPermissions;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}

export interface ContentAuthor {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "admin" | "editor" | "author" | "contributor";
}

export interface WorkflowState {
    status: ContentStatus;
    assignedTo?: string;
    reviewers: string[];
    comments: WorkflowComment[];
    history: WorkflowTransition[];
    lockedBy?: string;
    lockedAt?: Date;
}

export interface WorkflowComment {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: Date;
    resolvedAt?: Date;
}

export interface WorkflowTransition {
    from: ContentStatus;
    to: ContentStatus;
    by: string;
    at: Date;
    reason?: string;
}

export interface VersionInfo {
    current: number;
    published?: number;
    history: ContentVersion[];
    autosaveEnabled: boolean;
    lastAutosave?: Date;
}

export interface ContentVersion {
    version: number;
    createdAt: Date;
    createdBy: string;
    changelog?: string;
    snapshot: string; // JSON stringified content
    isPublished: boolean;
}

export interface SchedulingConfig {
    publishAt?: Date;
    expireAt?: Date;
    timezone: string;
    recurrence?: RecurrenceRule;
}

export interface RecurrenceRule {
    type: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: Date;
    count?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: CONTENT BLOCKS (Block Editor)
// ═══════════════════════════════════════════════════════════════════════════════

export type BlockType =
    | "paragraph" | "heading" | "quote" | "code" | "divider"
    | "image" | "gallery" | "video" | "embed" | "file"
    | "list" | "table" | "toggle" | "callout" | "columns"
    | "hero" | "features" | "testimonials" | "pricing" | "cta"
    | "form" | "booking_widget" | "artist_grid" | "map"
    | "countdown" | "social_feed" | "newsletter" | "faq"
    | "html" | "markdown" | "template_block";

export interface ContentBlock {
    id: string;
    type: BlockType;
    content: BlockContent;
    style: BlockStyle;
    settings: BlockSettings;
    visibility: VisibilityRules;
    animations: AnimationConfig;
    order: number;
    parentId?: string; // For nested blocks like columns
}

export interface BlockContent {
    text?: string;
    richText?: RichTextNode[];
    html?: string;
    markdown?: string;
    mediaId?: string;
    embedUrl?: string;
    items?: BlockContent[];
    columns?: ContentBlock[][];
    formFields?: FormField[];
    data?: Record<string, any>;
}

export interface RichTextNode {
    type: "text" | "bold" | "italic" | "underline" | "strike" | "code" | "link" | "mention";
    text?: string;
    href?: string;
    mentionId?: string;
    children?: RichTextNode[];
}

export interface BlockStyle {
    className?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: SpacingConfig;
    margin?: SpacingConfig;
    borderRadius?: string;
    border?: BorderConfig;
    shadow?: string;
    width?: string;
    maxWidth?: string;
    alignment?: "left" | "center" | "right" | "justify";
}

export interface SpacingConfig {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export interface BorderConfig {
    width: number;
    style: "solid" | "dashed" | "dotted";
    color: string;
}

export interface BlockSettings {
    isLocked?: boolean;
    isReusable?: boolean;
    reusableId?: string;
    conditions?: BlockCondition[];
    responsive?: ResponsiveSettings;
    abVariant?: string;
}

export interface BlockCondition {
    field: string;
    operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "not_contains" | "in" | "not_in";
    value: any;
    logic?: "and" | "or";
}

export interface ResponsiveSettings {
    mobileHidden?: boolean;
    tabletHidden?: boolean;
    desktopHidden?: boolean;
    mobileOrder?: number;
    mobileStyle?: Partial<BlockStyle>;
}

export interface VisibilityRules {
    userRoles?: string[];
    geoCountries?: string[];
    devices?: ("mobile" | "tablet" | "desktop")[];
    dateRange?: { start?: Date; end?: Date };
    abTestVariant?: string;
    customConditions?: BlockCondition[];
}

export interface AnimationConfig {
    type?: "fade" | "slide" | "zoom" | "bounce" | "flip";
    direction?: "up" | "down" | "left" | "right";
    duration?: number;
    delay?: number;
    trigger?: "onLoad" | "onScroll" | "onHover";
    easing?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: LAYOUT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export interface LayoutConfig {
    templateId?: string;
    header: LayoutSection;
    main: LayoutSection;
    footer: LayoutSection;
    sidebar?: LayoutSection;
    modals: ModalConfig[];
    notifications: NotificationConfig[];
}

export interface LayoutSection {
    enabled: boolean;
    sticky?: boolean;
    transparent?: boolean;
    blocks: ContentBlock[];
    style: BlockStyle;
}

export interface ModalConfig {
    id: string;
    trigger: "timer" | "exit_intent" | "scroll" | "click" | "manual";
    triggerValue?: number; // seconds or scroll percentage
    content: ContentBlock[];
    style: ModalStyle;
    frequency: "always" | "once" | "session" | "daily";
}

export interface ModalStyle {
    size: "sm" | "md" | "lg" | "xl" | "fullscreen";
    position: "center" | "top" | "bottom" | "left" | "right";
    overlay: boolean;
    overlayColor: string;
    animation: AnimationConfig;
}

export interface NotificationConfig {
    id: string;
    type: "info" | "success" | "warning" | "error";
    position: "top" | "bottom" | "top-right" | "top-left" | "bottom-right" | "bottom-left";
    content: string;
    duration: number;
    dismissible: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: SEO ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface SEOConfig {
    title: string;
    titleTemplate?: string; // "%s | Altus Ink"
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    robots: RobotsDirective;
    openGraph: OpenGraphConfig;
    twitter: TwitterCardConfig;
    structuredData: StructuredDataConfig[];
    alternateLanguages: AlternateLanguage[];
    sitemap: SitemapConfig;
    performance: PerformanceHints;
}

export interface RobotsDirective {
    index: boolean;
    follow: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    maxSnippet?: number;
    maxImagePreview?: "none" | "standard" | "large";
    maxVideoPreview?: number;
}

export interface OpenGraphConfig {
    type: "website" | "article" | "profile" | "product" | "event";
    title?: string;
    description?: string;
    image?: string;
    imageWidth?: number;
    imageHeight?: number;
    imageAlt?: string;
    url?: string;
    siteName?: string;
    locale?: string;
    article?: {
        publishedTime?: string;
        modifiedTime?: string;
        author?: string;
        section?: string;
        tags?: string[];
    };
}

export interface TwitterCardConfig {
    card: "summary" | "summary_large_image" | "app" | "player";
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
}

export interface StructuredDataConfig {
    type: "Organization" | "LocalBusiness" | "Article" | "Product" | "FAQPage" | "BreadcrumbList" | "Event" | "Person";
    data: Record<string, any>;
}

export interface AlternateLanguage {
    locale: string;
    url: string;
    isDefault: boolean;
}

export interface SitemapConfig {
    include: boolean;
    priority: number; // 0.0 - 1.0
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    images?: string[];
    videos?: SitemapVideo[];
}

export interface SitemapVideo {
    thumbnailUrl: string;
    title: string;
    description: string;
    contentUrl: string;
    duration?: number;
}

export interface PerformanceHints {
    preload?: string[];
    prefetch?: string[];
    preconnect?: string[];
    criticalCss?: string;
    lazyLoadImages?: boolean;
    deferNonCritical?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: MEDIA LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

export interface MediaAsset {
    id: string;
    type: "image" | "video" | "audio" | "document" | "archive";
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    cdnUrl?: string;
    dimensions?: { width: number; height: number };
    duration?: number;
    metadata: MediaMetadata;
    folder?: string;
    tags: string[];
    alt?: string;
    caption?: string;
    credit?: string;
    uploadedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MediaMetadata {
    exif?: Record<string, any>;
    colors?: string[];
    faces?: FaceDetection[];
    labels?: string[];
    transcription?: string;
    format?: string;
    codec?: string;
    bitrate?: number;
}

export interface FaceDetection {
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
    personId?: string;
}

export interface MediaFolder {
    id: string;
    name: string;
    parentId?: string;
    path: string;
    assetCount: number;
    createdAt: Date;
}

export interface MediaTransformation {
    width?: number;
    height?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    format?: "webp" | "avif" | "jpeg" | "png" | "gif";
    quality?: number;
    blur?: number;
    sharpen?: boolean;
    grayscale?: boolean;
    rotate?: number;
    watermark?: WatermarkConfig;
}

export interface WatermarkConfig {
    imageUrl: string;
    position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
    opacity: number;
    scale: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PERSONALIZATION & A/B TESTING
// ═══════════════════════════════════════════════════════════════════════════════

export interface PersonalizationRules {
    enabled: boolean;
    segments: ContentSegment[];
    defaultContent?: ContentBlock[];
}

export interface ContentSegment {
    id: string;
    name: string;
    conditions: SegmentCondition[];
    logic: "and" | "or";
    priority: number;
    content: ContentBlock[];
}

export interface SegmentCondition {
    type: "geo" | "device" | "referrer" | "utm" | "cookie" | "user" | "behavior" | "time";
    field: string;
    operator: string;
    value: any;
}

export interface ABTest {
    id: string;
    name: string;
    description?: string;
    contentId: string;
    status: "draft" | "running" | "paused" | "completed";
    variants: ABVariant[];
    trafficAllocation: number; // 0-100, percentage of traffic in test
    goals: ABGoal[];
    startDate: Date;
    endDate?: Date;
    winner?: string;
    stats: ABTestStats;
    createdAt: Date;
}

export interface ABVariant {
    id: string;
    name: string;
    description?: string;
    weight: number; // 0-100
    content?: ContentBlock[];
    modifications?: VariantModification[];
    stats: VariantStats;
}

export interface VariantModification {
    blockId: string;
    property: string;
    value: any;
}

export interface ABGoal {
    id: string;
    name: string;
    type: "pageview" | "click" | "form_submit" | "purchase" | "custom";
    selector?: string; // CSS selector for click goals
    eventName?: string;
    value?: number;
}

export interface ABTestStats {
    totalVisitors: number;
    totalConversions: number;
    startDate: Date;
    lastUpdated: Date;
}

export interface VariantStats {
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue?: number;
    avgTimeOnPage?: number;
    bounceRate?: number;
    confidence?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: ANALYTICS & METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContentAnalytics {
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    scrollDepth: number;
    clickMap?: ClickMapData;
    heatmap?: HeatmapData;
    conversionRate?: number;
    lastViewed?: Date;
}

export interface ClickMapData {
    clicks: ClickPoint[];
    lastUpdated: Date;
}

export interface ClickPoint {
    x: number;
    y: number;
    count: number;
    element?: string;
}

export interface HeatmapData {
    points: HeatmapPoint[];
    type: "move" | "click" | "scroll";
    lastUpdated: Date;
}

export interface HeatmapPoint {
    x: number;
    y: number;
    value: number;
}

export interface ContentMetadata {
    featuredImage?: string;
    category?: string;
    categories?: string[];
    tags?: string[];
    customFields?: CustomField[];
    relatedContent?: string[];
    order?: number;
    template?: string;
    isHomepage?: boolean;
    isFeatured?: boolean;
    isProtected?: boolean;
    password?: string;
}

export interface CustomField {
    key: string;
    value: any;
    type: "text" | "number" | "boolean" | "date" | "json" | "media" | "relation";
    label?: string;
    group?: string;
}

export interface ContentPermissions {
    public: boolean;
    requireAuth: boolean;
    allowedRoles?: string[];
    allowedUsers?: string[];
    denyUsers?: string[];
    ipWhitelist?: string[];
    ipBlacklist?: string[];
}

export interface LocalizationInfo {
    defaultLocale: string;
    availableLocales: string[];
    translations: Map<string, string>; // locale -> content_id
    autoTranslate: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: FORMS
// ═══════════════════════════════════════════════════════════════════════════════

export interface FormField {
    id: string;
    type: "text" | "email" | "phone" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date" | "time" | "file" | "hidden";
    name: string;
    label: string;
    placeholder?: string;
    defaultValue?: any;
    required: boolean;
    validation?: FieldValidation;
    options?: SelectOption[];
    conditionalLogic?: FieldCondition[];
    style?: BlockStyle;
}

export interface FieldValidation {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    customMessage?: string;
}

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface FieldCondition {
    fieldId: string;
    operator: "eq" | "neq" | "contains" | "empty" | "not_empty";
    value?: any;
    action: "show" | "hide" | "enable" | "disable" | "require";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Template {
    id: string;
    name: string;
    description?: string;
    type: ContentType;
    thumbnail?: string;
    category: "landing" | "blog" | "portfolio" | "email" | "legal" | "custom";
    layout: LayoutConfig;
    defaultBlocks: ContentBlock[];
    variables: TemplateVariable[];
    isSystem: boolean;
    isActive: boolean;
    usageCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateVariable {
    key: string;
    label: string;
    type: "text" | "image" | "color" | "boolean" | "select";
    defaultValue: any;
    options?: SelectOption[];
    required: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CMS SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class CMSService extends EventEmitter {
    private contents: Map<string, ContentModel> = new Map();
    private templates: Map<string, Template> = new Map();
    private media: Map<string, MediaAsset> = new Map();
    private mediaFolders: Map<string, MediaFolder> = new Map();
    private abTests: Map<string, ABTest> = new Map();
    private reusableBlocks: Map<string, ContentBlock> = new Map();

    constructor() {
        super();
        this.seedTemplates();
        this.seedContent();
        this.startScheduler();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async getContent(slug: string, locale: string = "en", context: RequestContext = {}): Promise<ContentModel | null> {
        const cacheKey = `cms:content:${slug}:${locale}`;

        const cached = await cacheService.get<ContentModel>(cacheKey);
        if (cached) {
            telemetry.info("CMS cache hit", "CMS", { slug, locale });
            return cached;
        }

        let content = Array.from(this.contents.values()).find(
            c => c.slug === slug && c.localization.defaultLocale === locale && c.workflow.status === "published"
        );

        if (!content && locale !== "en") {
            content = Array.from(this.contents.values()).find(
                c => c.slug === slug && c.localization.defaultLocale === "en" && c.workflow.status === "published"
            );
        }

        if (!content) return null;

        // Apply personalization
        content = await this.applyPersonalization(content, context);

        // Apply A/B test
        content = await this.applyABTest(content, context);

        // Increment views
        content.analytics.views++;
        content.analytics.lastViewed = new Date();

        await cacheService.set(cacheKey, content, { ttlSeconds: 60 });

        return content;
    }

    async createContent(data: Partial<ContentModel>, authorId: string): Promise<ContentModel> {
        const content: ContentModel = {
            id: randomUUID(),
            type: data.type || "page",
            slug: data.slug || `/${randomUUID().slice(0, 8)}`,
            title: data.title || "Untitled",
            excerpt: data.excerpt,
            content: data.content || [],
            layout: data.layout || this.getDefaultLayout(),
            seo: data.seo || this.getDefaultSEO(data.title || "Untitled"),
            author: { id: authorId, name: "System", email: "system@altus.ink", role: "admin" },
            workflow: {
                status: "draft",
                reviewers: [],
                comments: [],
                history: [{ from: "draft", to: "draft", by: authorId, at: new Date() }],
            },
            versioning: {
                current: 1,
                history: [],
                autosaveEnabled: true,
            },
            scheduling: { timezone: "UTC" },
            personalization: { enabled: false, segments: [] },
            analytics: { views: 0, uniqueVisitors: 0, avgTimeOnPage: 0, bounceRate: 0, scrollDepth: 0 },
            localization: { defaultLocale: "en", availableLocales: ["en"], translations: new Map(), autoTranslate: false },
            metadata: {},
            permissions: { public: true, requireAuth: false },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.contents.set(content.id, content);

        await eventBus.publish("cms.content_created", { contentId: content.id, slug: content.slug });
        telemetry.info("Content created", "CMS", { id: content.id, slug: content.slug });

        return content;
    }

    async updateContent(id: string, data: Partial<ContentModel>, userId: string): Promise<ContentModel> {
        const content = this.contents.get(id);
        if (!content) throw new Error("Content not found");

        if (content.workflow.lockedBy && content.workflow.lockedBy !== userId) {
            throw new Error("Content is locked by another user");
        }

        // Create version snapshot
        const snapshot: ContentVersion = {
            version: content.versioning.current,
            createdAt: new Date(),
            createdBy: userId,
            snapshot: JSON.stringify(content.content),
            isPublished: content.workflow.status === "published",
        };
        content.versioning.history.push(snapshot);
        content.versioning.current++;

        // Update content
        Object.assign(content, data, { updatedAt: new Date() });

        // Invalidate cache
        await cacheService.invalidateTag(`cms:${content.slug}`);

        await eventBus.publish("cms.content_updated", { contentId: id });

        return content;
    }

    async publishContent(id: string, userId: string): Promise<ContentModel> {
        const content = this.contents.get(id);
        if (!content) throw new Error("Content not found");

        const oldStatus = content.workflow.status;
        content.workflow.status = "published";
        content.workflow.history.push({ from: oldStatus, to: "published", by: userId, at: new Date() });
        content.publishedAt = new Date();
        content.versioning.published = content.versioning.current;

        await cacheService.invalidateTag(`cms:${content.slug}`);
        await eventBus.publish("cms.content_published", { contentId: id, slug: content.slug });

        telemetry.info("Content published", "CMS", { id, slug: content.slug });

        return content;
    }

    async revertToVersion(id: string, version: number, userId: string): Promise<ContentModel> {
        const content = this.contents.get(id);
        if (!content) throw new Error("Content not found");

        const targetVersion = content.versioning.history.find(v => v.version === version);
        if (!targetVersion) throw new Error("Version not found");

        content.content = JSON.parse(targetVersion.snapshot);
        content.versioning.current++;
        content.updatedAt = new Date();

        await eventBus.publish("cms.content_reverted", { contentId: id, toVersion: version });

        return content;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BLOCK EDITOR
    // ═══════════════════════════════════════════════════════════════════════════

    createBlock(type: BlockType, content: Partial<BlockContent> = {}): ContentBlock {
        return {
            id: randomUUID(),
            type,
            content: { ...content },
            style: {},
            settings: {},
            visibility: {},
            animations: {},
            order: 0,
        };
    }

    addBlockToContent(contentId: string, block: ContentBlock, position?: number): ContentBlock {
        const content = this.contents.get(contentId);
        if (!content) throw new Error("Content not found");

        if (position !== undefined) {
            content.content.splice(position, 0, block);
        } else {
            content.content.push(block);
        }

        // Reorder
        content.content.forEach((b, i) => b.order = i);

        return block;
    }

    moveBlock(contentId: string, blockId: string, newPosition: number): void {
        const content = this.contents.get(contentId);
        if (!content) throw new Error("Content not found");

        const blockIndex = content.content.findIndex(b => b.id === blockId);
        if (blockIndex === -1) throw new Error("Block not found");

        const [block] = content.content.splice(blockIndex, 1);
        content.content.splice(newPosition, 0, block);
        content.content.forEach((b, i) => b.order = i);
    }

    duplicateBlock(contentId: string, blockId: string): ContentBlock {
        const content = this.contents.get(contentId);
        if (!content) throw new Error("Content not found");

        const block = content.content.find(b => b.id === blockId);
        if (!block) throw new Error("Block not found");

        const duplicate: ContentBlock = {
            ...JSON.parse(JSON.stringify(block)),
            id: randomUUID(),
        };

        const blockIndex = content.content.findIndex(b => b.id === blockId);
        content.content.splice(blockIndex + 1, 0, duplicate);
        content.content.forEach((b, i) => b.order = i);

        return duplicate;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MEDIA LIBRARY
    // ═══════════════════════════════════════════════════════════════════════════

    async uploadMedia(file: { filename: string; mimeType: string; size: number; buffer: Buffer }, userId: string, folderId?: string): Promise<MediaAsset> {
        const id = randomUUID();
        const type = this.getMediaType(file.mimeType);

        // In production, upload to S3/Cloudflare R2
        const url = `/uploads/${id}/${file.filename}`;

        const asset: MediaAsset = {
            id,
            type,
            filename: `${id}-${file.filename}`,
            originalFilename: file.filename,
            mimeType: file.mimeType,
            size: file.size,
            url,
            thumbnailUrl: type === "image" ? `${url}?w=200&h=200&fit=cover` : undefined,
            metadata: {},
            folder: folderId,
            tags: [],
            uploadedBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.media.set(id, asset);

        await eventBus.publish("cms.media_uploaded", { assetId: id });

        return asset;
    }

    getMediaUrl(assetId: string, transformation?: MediaTransformation): string {
        const asset = this.media.get(assetId);
        if (!asset) return "";

        let url = asset.cdnUrl || asset.url;

        if (transformation) {
            const params = new URLSearchParams();
            if (transformation.width) params.set("w", transformation.width.toString());
            if (transformation.height) params.set("h", transformation.height.toString());
            if (transformation.fit) params.set("fit", transformation.fit);
            if (transformation.format) params.set("f", transformation.format);
            if (transformation.quality) params.set("q", transformation.quality.toString());
            url += `?${params.toString()}`;
        }

        return url;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // A/B TESTING
    // ═══════════════════════════════════════════════════════════════════════════

    async createABTest(contentId: string, data: Partial<ABTest>): Promise<ABTest> {
        const test: ABTest = {
            id: randomUUID(),
            name: data.name || "New A/B Test",
            contentId,
            status: "draft",
            variants: [
                { id: "control", name: "Control", weight: 50, stats: { visitors: 0, conversions: 0, conversionRate: 0 } },
                { id: "variant_b", name: "Variant B", weight: 50, stats: { visitors: 0, conversions: 0, conversionRate: 0 } },
            ],
            trafficAllocation: 100,
            goals: [],
            startDate: new Date(),
            stats: { totalVisitors: 0, totalConversions: 0, startDate: new Date(), lastUpdated: new Date() },
            createdAt: new Date(),
            ...data,
        };

        this.abTests.set(test.id, test);

        return test;
    }

    async recordConversion(testId: string, variantId: string, goalId: string): Promise<void> {
        const test = this.abTests.get(testId);
        if (!test) return;

        const variant = test.variants.find(v => v.id === variantId);
        if (variant) {
            variant.stats.conversions++;
            variant.stats.conversionRate = (variant.stats.conversions / variant.stats.visitors) * 100;
        }

        test.stats.totalConversions++;
        test.stats.lastUpdated = new Date();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SEO ENGINE
    // ═══════════════════════════════════════════════════════════════════════════

    generateSitemap(): string {
        const baseUrl = "https://app.altus.ink";
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        for (const content of this.contents.values()) {
            if (content.workflow.status === "published" && content.seo.sitemap.include) {
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}${content.slug}</loc>\n`;
                xml += `    <lastmod>${content.updatedAt.toISOString()}</lastmod>\n`;
                xml += `    <changefreq>${content.seo.sitemap.changeFrequency}</changefreq>\n`;
                xml += `    <priority>${content.seo.sitemap.priority}</priority>\n`;
                xml += `  </url>\n`;
            }
        }

        xml += `</urlset>`;
        return xml;
    }

    generateRobotsTxt(): string {
        return `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api
Disallow: /admin

Sitemap: https://app.altus.ink/sitemap.xml`;
    }

    generateStructuredData(content: ContentModel): string {
        const data: any[] = [];

        // Organization
        data.push({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Altus Ink",
            "url": "https://altus.ink",
            "logo": "https://altus.ink/logo.png",
        });

        // Page-specific
        if (content.type === "page") {
            data.push({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": content.seo.title,
                "description": content.seo.description,
                "url": `https://altus.ink${content.slug}`,
            });
        }

        // Add custom structured data
        content.seo.structuredData.forEach(sd => {
            data.push({
                "@context": "https://schema.org",
                "@type": sd.type,
                ...sd.data,
            });
        });

        return data.map(d => `<script type="application/ld+json">${JSON.stringify(d)}</script>`).join("\n");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    private async applyPersonalization(content: ContentModel, context: RequestContext): Promise<ContentModel> {
        if (!content.personalization.enabled) return content;

        for (const segment of content.personalization.segments.sort((a, b) => b.priority - a.priority)) {
            if (this.matchesSegment(segment, context)) {
                const clone = JSON.parse(JSON.stringify(content)) as ContentModel;
                clone.content = segment.content;
                return clone;
            }
        }

        return content;
    }

    private matchesSegment(segment: ContentSegment, context: RequestContext): boolean {
        const results = segment.conditions.map(c => this.evaluateCondition(c, context));
        return segment.logic === "and" ? results.every(r => r) : results.some(r => r);
    }

    private evaluateCondition(condition: SegmentCondition, context: RequestContext): boolean {
        const value = this.getContextValue(condition.type, condition.field, context);
        switch (condition.operator) {
            case "eq": return value === condition.value;
            case "neq": return value !== condition.value;
            case "contains": return String(value).includes(condition.value);
            case "in": return Array.isArray(condition.value) && condition.value.includes(value);
            default: return false;
        }
    }

    private getContextValue(type: string, field: string, context: RequestContext): any {
        switch (type) {
            case "geo": return context.geo?.[field as keyof typeof context.geo];
            case "device": return context.device?.[field as keyof typeof context.device];
            case "user": return context.user?.[field as keyof typeof context.user];
            default: return undefined;
        }
    }

    private async applyABTest(content: ContentModel, context: RequestContext): Promise<ContentModel> {
        const test = Array.from(this.abTests.values()).find(t => t.contentId === content.id && t.status === "running");
        if (!test) return content;

        const variant = this.selectVariant(test, context.userId || context.ip || randomUUID());
        if (variant.id === "control") return content;

        // Record visit
        variant.stats.visitors++;
        test.stats.totalVisitors++;

        // Apply modifications
        if (variant.modifications) {
            const clone = JSON.parse(JSON.stringify(content)) as ContentModel;
            for (const mod of variant.modifications) {
                const block = clone.content.find(b => b.id === mod.blockId);
                if (block) {
                    (block as any)[mod.property] = mod.value;
                }
            }
            return clone;
        }

        return content;
    }

    private selectVariant(test: ABTest, userId: string): ABVariant {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const bucket = Math.abs(hash) % 100;

        let cumulative = 0;
        for (const variant of test.variants) {
            cumulative += variant.weight;
            if (bucket < cumulative) return variant;
        }

        return test.variants[0];
    }

    private getMediaType(mimeType: string): MediaAsset["type"] {
        if (mimeType.startsWith("image/")) return "image";
        if (mimeType.startsWith("video/")) return "video";
        if (mimeType.startsWith("audio/")) return "audio";
        if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar")) return "archive";
        return "document";
    }

    private getDefaultLayout(): LayoutConfig {
        return {
            header: { enabled: true, blocks: [], style: {} },
            main: { enabled: true, blocks: [], style: {} },
            footer: { enabled: true, blocks: [], style: {} },
            modals: [],
            notifications: [],
        };
    }

    private getDefaultSEO(title: string): SEOConfig {
        return {
            title,
            titleTemplate: "%s | Altus Ink",
            description: "",
            keywords: [],
            robots: { index: true, follow: true },
            openGraph: { type: "website" },
            twitter: { card: "summary_large_image" },
            structuredData: [],
            alternateLanguages: [],
            sitemap: { include: true, priority: 0.5, changeFrequency: "weekly" },
            performance: { lazyLoadImages: true, deferNonCritical: true },
        };
    }

    private startScheduler(): void {
        setInterval(async () => {
            const now = new Date();
            for (const content of this.contents.values()) {
                if (content.workflow.status === "scheduled" && content.scheduling.publishAt && content.scheduling.publishAt <= now) {
                    await this.publishContent(content.id, "scheduler");
                }
                if (content.workflow.status === "published" && content.scheduling.expireAt && content.scheduling.expireAt <= now) {
                    content.workflow.status = "archived";
                    await cacheService.invalidateTag(`cms:${content.slug}`);
                }
            }
        }, 60000);
    }

    private seedTemplates(): void {
        this.templates.set("landing-hero", {
            id: "landing-hero",
            name: "Landing Page with Hero",
            type: "landing",
            category: "landing",
            layout: this.getDefaultLayout(),
            defaultBlocks: [
                this.createBlock("hero", { text: "Welcome to Altus Ink" }),
                this.createBlock("features", { items: [] }),
                this.createBlock("cta", { text: "Get Started" }),
            ],
            variables: [],
            isSystem: true,
            isActive: true,
            usageCount: 0,
            createdBy: "system",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    private seedContent(): void {
        // Seed homepage
        this.createContent({
            type: "page",
            slug: "/",
            title: "Altus Ink - Premium Tattoo Management",
            content: [
                this.createBlock("hero", { text: "The Operating System for Modern Tattoo Studios" }),
                this.createBlock("features", {}),
            ],
        }, "system").then(content => {
            content.workflow.status = "published";
            content.publishedAt = new Date();
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: REQUEST CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

interface RequestContext {
    userId?: string;
    ip?: string;
    geo?: { country?: string; city?: string; region?: string };
    device?: { type?: string; os?: string; browser?: string };
    user?: { role?: string; segments?: string[] };
    utm?: { source?: string; medium?: string; campaign?: string };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const cmsService = new CMSService();
export default cmsService;
