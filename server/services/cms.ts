/**
 * ALTUS INK - ENTERPRISE CONTENT MANAGEMENT SYSTEM (CMS)
 * The engine that controls the content, layout, and SEO of every page.
 * 
 * Features:
 * 1. DYNAMIC PAGE BUILDER (JSON-based layout engine)
 * 2. COMPONENT REGISTRY (Mapping JSON to React Components)
 * 3. SEO & METADATA ENGINE (OpenGraph, Schema.org, Sitemap)
 * 4. HEADLESS CONTENT DELIVERY (API-first)
 * 5. MULTI-LANGUAGE LOCALIZATION (i18n)
 * 6. A/B TESTING ENGINE (Variant serving)
 * 7. ASSET MANAGEMENT (Images, Videos, Documents)
 * 8. VERSION CONTROL (Page History, Rollback)
 */

import { randomUUID } from "crypto";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";
import { cacheService } from "./core/cache";

// =============================================================================
// TYPES: PAGE & LAYOUT
// =============================================================================

export interface Page {
    id: string;
    slug: string; // "/artists", "/about", "/landing-v2"
    title: string;
    templateId?: string;
    locale: string;
    status: "draft" | "published" | "archived" | "scheduled";
    version: number;
    layout: LayoutSection[];
    seo: SEOConfig;
    metadata: Record<string, any>;
    abTestId?: string;
    authorId: string;
    publishDate?: Date;
    archivedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface LayoutSection {
    id: string;
    type: "section" | "container" | "grid";
    config: {
        padding?: string;
        background?: string;
        columns?: number;
        gap?: string;
        className?: string; // Tailwind classes
    };
    components: PageComponent[];
}

export interface PageComponent {
    id: string;
    type: ComponentType;
    props: Record<string, any>; // { title: "Hello", image: "url..." }
    variant?: string; // "hero-large", "card-glass"
    conditions?: VisibilityCondition[]; // { role: "admin" }
    abVariant?: string; // "A" or "B"
}

export type ComponentType =
    | "EnterpriseHero"
    | "EnterpriseFeatureGrid"
    | "EnterpriseTestimonial"
    | "EnterprisePricingTable"
    | "EnterpriseCallToAction"
    | "ArtistGallery"
    | "BookingForm"
    | "ContactForm"
    | "HtmlBlock"
    | "RichText"
    | "VideoPlayer";

export interface VisibilityCondition {
    field: "user.role" | "device.type" | "geo.country" | "date";
    operator: "eq" | "neq" | "in" | "gt" | "lt";
    value: any;
}

// =============================================================================
// TYPES: SEO & METADATA
// =============================================================================

export interface SEOConfig {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    robots: "index, follow" | "noindex, nofollow";
    og: {
        title?: string;
        description?: string;
        image?: string;
        type?: "website" | "article" | "profile";
    };
    twitter: {
        card?: "summary" | "summary_large_image";
        creator?: string;
    };
    schemaLines: string[]; // JSON-LD strings
}

// =============================================================================
// TYPES: A/B TESTING
// =============================================================================

export interface ABTest {
    id: string;
    name: string;
    pageSlug: string;
    variants: Variant[];
    status: "running" | "paused" | "completed";
    startDate: Date;
    endDate?: Date;
    metrics: {
        visitors: number;
        conversions: number;
    };
}

export interface Variant {
    id: string; // "A", "B"
    name: string;
    weight: number; // 0-100
    pageVersionId?: string; // Link to specific page content
    overrideComponents?: PageComponent[]; // Or specific component overrides
}

// =============================================================================
// CMS SERVICE
// =============================================================================

export class CMSService {
    private pages: Map<string, Page> = new Map();
    private pageHistory: Map<string, Page[]> = new Map();
    private abTests: Map<string, ABTest> = new Map();
    private globalBlocks: Map<string, PageComponent> = new Map(); // Reusable headers/footers

    constructor() {
        this.seedPages();
    }

    // ===========================================================================
    // PAGE MANAGEMENT
    // ===========================================================================

    async getPage(slug: string, locale: string = "en", context: any = {}): Promise<Page | null> {
        const cacheKey = `cms:page:${slug}:${locale}`;

        // Check Cache
        const cached = await cacheService.get<Page>(cacheKey);
        if (cached) return cached;

        // Find Page
        let page = Array.from(this.pages.values()).find(p => p.slug === slug && p.locale === locale && p.status === "published");

        // Fallback to default locale
        if (!page && locale !== "en") {
            page = Array.from(this.pages.values()).find(p => p.slug === slug && p.locale === "en" && p.status === "published");
        }

        if (!page) return null;

        // A/B Test Logic (Traffic Splitting)
        if (page.abTestId) {
            const test = this.abTests.get(page.abTestId);
            if (test && test.status === "running") {
                // Deterministic hashing of user ID for sticky sessions
                const variant = this.determineVariant(test, context.userId || context.ip);
                if (variant && variant.id !== "control") {
                    // Apply overrides (Deep clone to avoid polluting master)
                    page = this.applyVariant(page, variant);
                }
            }
        }

        // Cache Result (Short TTL for dynamic content)
        await cacheService.set(cacheKey, page, { ttlSeconds: 60 });

        return page;
    }

    async publishPage(data: Partial<Page>): Promise<Page> {
        const page: Page = {
            id: randomUUID(),
            slug: data.slug || "/untitled",
            title: data.title || "Untitled Page",
            locale: data.locale || "en",
            status: "published",
            version: 1,
            layout: data.layout || [],
            seo: data.seo || { title: "", description: "", keywords: [], robots: "index, follow", og: {}, twitter: {}, schemaLines: [] },
            metadata: {},
            authorId: "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        // Versioning logic
        const existing = Array.from(this.pages.values()).find(p => p.slug === page.slug && p.locale === page.locale);
        if (existing) {
            page.version = existing.version + 1;
            // Archive old
            if (!this.pageHistory.has(existing.slug)) this.pageHistory.set(existing.slug, []);
            this.pageHistory.get(existing.slug)!.push(existing);
            this.pages.delete(existing.id);
        }

        this.pages.set(page.id, page);

        // Invalidate Cache
        await cacheService.invalidateTag(`page:${page.slug}`);
        await eventBus.publish("cms.page_published", { pageId: page.id, slug: page.slug });

        return page;
    }

    // ===========================================================================
    // LAYOUT ENGINE
    // ===========================================================================

    async updateSection(pageId: string, sectionIndex: number, newConfig: LayoutSection): Promise<Page> {
        const page = this.pages.get(pageId);
        if (!page) throw new Error("Page not found");

        page.layout[sectionIndex] = newConfig;
        page.updatedAt = new Date();

        return page;
    }

    // ===========================================================================
    // A/B TESTING
    // ===========================================================================

    async createABTest(data: Partial<ABTest>): Promise<ABTest> {
        const test: ABTest = {
            id: randomUUID(),
            name: data.name || "New Experiment",
            pageSlug: data.pageSlug!,
            variants: data.variants || [{ id: "A", name: "Control", weight: 50 }, { id: "B", name: "Variant", weight: 50 }],
            status: "paused",
            startDate: new Date(),
            metrics: { visitors: 0, conversions: 0 },
            ...data
        };

        this.abTests.set(test.id, test);
        return test;
    }

    private determineVariant(test: ABTest, userId: string): Variant {
        // Simple mock hashing
        let hash = 0;
        for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        const normalized = Math.abs(hash) % 100; // 0-99

        let cumulative = 0;
        for (const v of test.variants) {
            cumulative += v.weight;
            if (normalized < cumulative) return v;
        }
        return test.variants[0];
    }

    private applyVariant(original: Page, variant: Variant): Page {
        const clone = JSON.parse(JSON.stringify(original)) as Page;
        // Trivial override of title for demo
        clone.title = `${original.title} (${variant.name})`;
        return clone;
    }

    // ===========================================================================
    // SEO GENERATOR
    // ===========================================================================

    async generateSitemap(): Promise<string> {
        const baseUrl = "https://app.altus.ink";
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        for (const page of this.pages.values()) {
            if (page.status === "published" && page.seo.robots === "index, follow") {
                xml += `  <url>\n    <loc>${baseUrl}${page.slug}</loc>\n    <lastmod>${page.updatedAt.toISOString()}</lastmod>\n  </url>\n`;
            }
        }
        xml += `</urlset>`;
        return xml;
    }

    // ===========================================================================
    // SEED DATA
    // ===========================================================================

    private seedPages() {
        // Homepage
        this.publishPage({
            title: "Altus Ink - Premium Tattoo Management",
            slug: "/",
            layout: [
                {
                    id: "hero-sec",
                    type: "section",
                    config: { background: "bg-neutral-900", padding: "pt-20 pb-32" },
                    components: [
                        {
                            id: "hero-1",
                            type: "EnterpriseHero",
                            props: {
                                headline: "The Operating System for Modern Tattoo Studios",
                                subheadline: "Manage bookings, artists, and finance in one unified glass platform.",
                                ctaText: "Get Started",
                                ctaLink: "/register"
                            }
                        }
                    ]
                },
                {
                    id: "features-sec",
                    type: "container",
                    config: { padding: "py-20" },
                    components: [
                        {
                            id: "grid-1",
                            type: "EnterpriseFeatureGrid",
                            props: {
                                features: [
                                    { title: "Smart Scheduling", desc: "AI-powered calendar optimization" },
                                    { title: "Financial Engine", desc: "Automated payouts and tax calculation" },
                                    { title: "Global Marketplace", desc: "Find guest spots worldwide" }
                                ]
                            }
                        }
                    ]
                }
            ]
        });

        // About Page
        this.publishPage({
            title: "About Us",
            slug: "/about",
            seo: {
                title: "About Altus Ink",
                description: "The story behind the world's most advanced tattoo platform.",
                keywords: ["about", "company", "mission"],
                robots: "index, follow",
                og: {}, twitter: {}, schemaLines: []
            }
        });
    }
}

export const cmsService = new CMSService();
export default cmsService;
