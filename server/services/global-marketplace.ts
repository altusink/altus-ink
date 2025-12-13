/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE GLOBAL MARKETPLACE & EXCHANGE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The central hub for global commerce, talent exchange, and digital asset trading.
 * 
 * TARGET SCALE: Global (100+ Countries)
 * ARCHITECTURE: Event-Driven, High-Concurrency, Multi-Currency
 * 
 * FEATURES:
 * - Global Talent Exchange (Guest Spots)
 * - Digital Asset Marketplace (Flash, Stencils, Brushes, 3D Models)
 * - Physical Equipment Trading (Verified Resale)
 * - Global Convention Ticketing & Aggregation
 * - NFT / Digital Collectibles (Blockchain Integration)
 * - Advertising & Sponsorship Bidding System
 * - Flash Sales & Limited Drops
 * - Subscription Bundles
 * - Affiliate & Referral System
 * - Multi-vendor Escrow
 * - Dynamic Pricing & AI Recommendations
 * - Dispute Resolution System
 * 
 * DEEP INTEGRATIONS:
 * - Financial Service (Complex Tax/VAT)
 * - Logistics Service (Global Shipping)
 * - Identity Service (Verified Sellers)
 * - AI Service (Dynamic Pricing & Recommendations)
 * 
 * @module services/global-marketplace
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";
import { cacheService } from "./core/cache";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: GUEST SPOT EXCHANGE
// ═══════════════════════════════════════════════════════════════════════════════

export interface GuestSpotListing {
    id: string;
    hostStudioId: string;
    hostName: string;
    hostRating: number;
    title: string;
    description: string;
    location: LocationInfo;
    amenities: StudioAmenity[];
    dates: DateRange;
    financials: GuestSpotFinancials;
    requirements: GuestSpotRequirements;
    portfolio: PortfolioRequirement;
    capacity: CapacityInfo;
    applications: GuestSpotApplication[];
    bookings: GuestSpotBooking[];
    stats: ListingStats;
    status: ListingStatus;
    visibility: "public" | "invited" | "private";
    tags: string[];
    images: string[];
    video?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
}

export interface LocationInfo {
    city: string;
    state?: string;
    country: string;
    countryCode: string;
    coordinates: { lat: number; lng: number };
    address: string;
    timezone: string;
    nearbyAirports: string[];
    publicTransport?: string;
}

export interface StudioAmenity {
    id: string;
    name: string;
    icon: string;
    included: boolean;
    description?: string;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
    isFlexible: boolean;
    minStay?: number;
    maxStay?: number;
    blockedDates: Date[];
}

export interface GuestSpotFinancials {
    type: "percentage_split" | "flat_rent" | "guarantee" | "hybrid";
    splitPercentage?: number;
    dailyRent?: number;
    weeklyRent?: number;
    monthlyRent?: number;
    securityDeposit?: number;
    minimumGuarantee?: number;
    currency: string;
    paymentTerms: PaymentTerms;
    cancellationPolicy: CancellationPolicy;
}

export interface PaymentTerms {
    depositRequired: boolean;
    depositPercentage: number;
    paymentSchedule: "upfront" | "weekly" | "monthly" | "per_session";
    acceptedMethods: string[];
}

export interface CancellationPolicy {
    type: "flexible" | "moderate" | "strict" | "none";
    refundPercentage: number;
    noticeDays: number;
    penaltyAmount?: number;
}

export interface GuestSpotRequirements {
    minExperienceYears: number;
    maxExperienceYears?: number;
    styles: string[];
    languages: string[];
    insuranceRequired: boolean;
    licenseRequired: boolean;
    backgroundCheckRequired: boolean;
    portfolioMinimum: number;
    verifiedOnly: boolean;
    customRequirements?: string[];
}

export interface PortfolioRequirement {
    minImages: number;
    styleMatch: number; // 0-100%
    qualityScore: number; // AI-assessed
    healedWorkRequired: boolean;
}

export interface CapacityInfo {
    stations: number;
    maxArtists: number;
    currentArtists: number;
    waitlistEnabled: boolean;
}

export interface GuestSpotApplication {
    id: string;
    listingId: string;
    artistId: string;
    artistName: string;
    artistRating: number;
    coverLetter: string;
    requestedDates: DateRange;
    proposedTerms?: GuestSpotFinancials;
    portfolioLink: string;
    portfolioImages: string[];
    references: Reference[];
    status: ApplicationStatus;
    negotiation: NegotiationHistory[];
    interview?: InterviewInfo;
    score: ApplicationScore;
    notes: ApplicationNote[];
    reviewedBy?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type ApplicationStatus = "pending" | "shortlisted" | "interview" | "offer_sent" | "accepted" | "rejected" | "withdrawn" | "expired";

export interface Reference {
    studioName: string;
    contactEmail: string;
    period: string;
    verified: boolean;
}

export interface NegotiationHistory {
    id: string;
    timestamp: Date;
    by: "host" | "artist";
    action: "offer" | "counter" | "accept" | "reject";
    terms: Partial<GuestSpotFinancials>;
    message?: string;
}

export interface InterviewInfo {
    scheduledAt: Date;
    type: "video" | "phone" | "in_person";
    meetingLink?: string;
    status: "scheduled" | "completed" | "cancelled" | "no_show";
    notes?: string;
    rating?: number;
}

export interface ApplicationScore {
    portfolioMatch: number;
    experienceMatch: number;
    styleMatch: number;
    referenceScore: number;
    overallScore: number;
    aiNotes?: string;
}

export interface ApplicationNote {
    id: string;
    authorId: string;
    content: string;
    isPrivate: boolean;
    createdAt: Date;
}

export interface GuestSpotBooking {
    id: string;
    listingId: string;
    applicationId: string;
    artistId: string;
    dates: DateRange;
    terms: GuestSpotFinancials;
    status: BookingStatus;
    contract?: ContractInfo;
    payments: PaymentInfo[];
    feedback?: BookingFeedback;
    createdAt: Date;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled" | "disputed";

export interface ContractInfo {
    id: string;
    url: string;
    signedByHost: boolean;
    signedByArtist: boolean;
    signedAt?: Date;
}

export interface PaymentInfo {
    id: string;
    type: "deposit" | "rent" | "commission" | "refund";
    amount: number;
    currency: string;
    status: "pending" | "paid" | "failed" | "refunded";
    dueDate: Date;
    paidAt?: Date;
    transactionId?: string;
}

export interface BookingFeedback {
    hostRating: number;
    hostReview: string;
    artistRating: number;
    artistReview: string;
    submittedAt: Date;
}

export interface ListingStats {
    views: number;
    saves: number;
    applications: number;
    conversionRate: number;
    avgApplicationScore: number;
    lastViewed?: Date;
}

export type ListingStatus = "active" | "paused" | "filled" | "expired" | "draft" | "archived";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: DIGITAL ASSET MARKETPLACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface DigitalProduct {
    id: string;
    sellerId: string;
    sellerName: string;
    sellerVerified: boolean;
    storeId?: string;
    title: string;
    description: string;
    shortDescription: string;
    type: DigitalProductType;
    category: string;
    subcategory?: string;
    pricing: ProductPricing;
    files: ProductFile[];
    previewImages: string[];
    previewVideo?: string;
    licensing: LicenseInfo;
    compatibility: CompatibilityInfo;
    stats: ProductStats;
    reviews: ProductReview[];
    tags: string[];
    collections: string[];
    relatedProducts: string[];
    seo: ProductSEO;
    status: ProductStatus;
    featuredUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}

export type DigitalProductType =
    | "flash_set"
    | "procreate_brushes"
    | "photoshop_brushes"
    | "3d_model"
    | "reference_pack"
    | "stencil_pack"
    | "font"
    | "tutorial"
    | "course"
    | "template"
    | "preset"
    | "action"
    | "plugin"
    | "other";

export interface ProductPricing {
    basePrice: number;
    salePrice?: number;
    saleEndsAt?: Date;
    currency: string;
    isFree: boolean;
    tiers?: PriceTier[];
    subscription?: SubscriptionOption;
    bundle?: BundleOption;
}

export interface PriceTier {
    id: string;
    name: string;
    price: number;
    features: string[];
    files: string[];
}

export interface SubscriptionOption {
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
}

export interface BundleOption {
    products: string[];
    discountPercentage: number;
    bundlePrice: number;
}

export interface ProductFile {
    id: string;
    name: string;
    size: number;
    format: string;
    version: string;
    url: string;
    tier?: string;
    downloads: number;
}

export interface LicenseInfo {
    type: "personal" | "commercial" | "extended" | "exclusive";
    allowsResale: boolean;
    allowsModification: boolean;
    attributionRequired: boolean;
    maxProjects?: number;
    maxClients?: number;
    exclusivityPeriod?: number;
    customTerms?: string;
}

export interface CompatibilityInfo {
    software: string[];
    versions: string[];
    platforms: string[];
    requirements: string[];
}

export interface ProductStats {
    views: number;
    sales: number;
    downloads: number;
    revenue: number;
    avgRating: number;
    reviewCount: number;
    wishlistCount: number;
    cartCount: number;
    refundRate: number;
}

export interface ProductReview {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    title: string;
    content: string;
    images?: string[];
    helpfulVotes: number;
    verifiedPurchase: boolean;
    sellerResponse?: SellerResponse;
    status: "published" | "pending" | "flagged" | "removed";
    createdAt: Date;
    updatedAt: Date;
}

export interface SellerResponse {
    content: string;
    respondedAt: Date;
}

export interface ProductSEO {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
}

export type ProductStatus = "active" | "pending_review" | "suspended" | "archived" | "draft";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PHYSICAL EQUIPMENT TRADING
// ═══════════════════════════════════════════════════════════════════════════════

export interface EquipmentListing {
    id: string;
    sellerId: string;
    sellerName: string;
    sellerRating: number;
    title: string;
    description: string;
    category: EquipmentCategory;
    subcategory?: string;
    brand: string;
    model: string;
    serialNumber?: string;
    condition: EquipmentCondition;
    conditionNotes?: string;
    yearManufactured?: number;
    warranty?: WarrantyInfo;
    pricing: EquipmentPricing;
    shipping: ShippingInfo;
    verification: VerificationInfo;
    images: string[];
    video?: string;
    documents?: string[];
    offers: EquipmentOffer[];
    stats: EquipmentStats;
    status: EquipmentStatus;
    createdAt: Date;
    updatedAt: Date;
    soldAt?: Date;
}

export type EquipmentCategory = "machine" | "power_supply" | "cartridges" | "furniture" | "lighting" | "sterilization" | "supplies" | "other";

export type EquipmentCondition = "new" | "like_new" | "excellent" | "good" | "fair" | "for_parts";

export interface WarrantyInfo {
    hasWarranty: boolean;
    expiresAt?: Date;
    transferable: boolean;
    coverage?: string;
}

export interface EquipmentPricing {
    askingPrice: number;
    originalPrice?: number;
    currency: string;
    acceptsOffers: boolean;
    minimumOffer?: number;
    buyNowEnabled: boolean;
    auctionEnabled: boolean;
}

export interface ShippingInfo {
    originCountry: string;
    originCity: string;
    shipsTo: string[];
    shippingClasses: ShippingClass[];
    dimensions: { length: number; width: number; height: number };
    weight: number;
    handlingTime: number;
    insured: boolean;
    trackingRequired: boolean;
    localPickup: boolean;
}

export interface ShippingClass {
    id: string;
    name: string;
    carrier: string;
    price: number;
    estimatedDays: { min: number; max: number };
    countries: string[];
}

export interface VerificationInfo {
    isVerified: boolean;
    verifiedBy?: string;
    verificationDate?: Date;
    verificationPhotos?: string[];
    serialVerified: boolean;
    authenticityScore?: number;
    reportUrl?: string;
}

export interface EquipmentOffer {
    id: string;
    listingId: string;
    buyerId: string;
    buyerName: string;
    amount: number;
    currency: string;
    message?: string;
    status: OfferStatus;
    counterAmount?: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type OfferStatus = "pending" | "accepted" | "rejected" | "countered" | "expired" | "withdrawn";

export interface EquipmentStats {
    views: number;
    saves: number;
    offers: number;
    questions: number;
    priceChanges: number;
}

export type EquipmentStatus = "active" | "sold" | "reserved" | "paused" | "expired" | "draft";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: CONVENTION TICKETING
// ═══════════════════════════════════════════════════════════════════════════════

export interface Convention {
    id: string;
    name: string;
    description: string;
    organizer: OrganizerInfo;
    location: ConventionLocation;
    dates: ConventionDates;
    tickets: TicketType[];
    vendors: VendorBooking[];
    artists: ConventionArtist[];
    schedule: ScheduleItem[];
    sponsors: Sponsor[];
    media: ConventionMedia;
    stats: ConventionStats;
    status: ConventionStatus;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizerInfo {
    id: string;
    name: string;
    logo: string;
    website: string;
    verified: boolean;
}

export interface ConventionLocation {
    venue: string;
    address: string;
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
    capacity: number;
    parkingAvailable: boolean;
    accessibilityInfo?: string;
}

export interface ConventionDates {
    startDate: Date;
    endDate: Date;
    setupDay?: Date;
    teardownDay?: Date;
    timezone: string;
}

export interface TicketType {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    quantity: number;
    sold: number;
    maxPerOrder: number;
    earlyBirdPrice?: number;
    earlyBirdEndsAt?: Date;
    benefits: string[];
    validDays: string[];
    isVIP: boolean;
    salesStart: Date;
    salesEnd: Date;
}

export interface VendorBooking {
    id: string;
    conventionId: string;
    vendorId: string;
    vendorName: string;
    boothType: string;
    boothNumber?: string;
    price: number;
    status: "applied" | "approved" | "paid" | "cancelled";
    amenities: string[];
}

export interface ConventionArtist {
    id: string;
    artistId: string;
    artistName: string;
    type: "featured" | "booth" | "seminar" | "judge";
    bio: string;
    image: string;
    schedule?: ScheduleItem[];
    bookable: boolean;
}

export interface ScheduleItem {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    location: string;
    speakers: string[];
    type: "workshop" | "seminar" | "competition" | "showcase" | "other";
    maxAttendees?: number;
    registrationRequired: boolean;
}

export interface Sponsor {
    id: string;
    name: string;
    logo: string;
    website: string;
    tier: "platinum" | "gold" | "silver" | "bronze";
}

export interface ConventionMedia {
    coverImage: string;
    gallery: string[];
    videos: string[];
    floorPlan?: string;
}

export interface ConventionStats {
    ticketsSold: number;
    revenue: number;
    attendees: number;
    artistsBooked: number;
    vendorsBooked: number;
    pageViews: number;
}

export type ConventionStatus = "upcoming" | "active" | "completed" | "cancelled" | "postponed";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: NFT & DIGITAL COLLECTIBLES
// ═══════════════════════════════════════════════════════════════════════════════

export interface NFTCollection {
    id: string;
    artistId: string;
    artistName: string;
    name: string;
    description: string;
    coverImage: string;
    bannerImage?: string;
    symbol: string;
    blockchain: "ethereum" | "polygon" | "solana" | "base";
    contractAddress?: string;
    items: NFTItem[];
    royaltyPercentage: number;
    mintPrice?: number;
    maxSupply?: number;
    minted: number;
    floor: number;
    volume: number;
    holders: number;
    status: "draft" | "minting" | "active" | "soldout";
    launchDate?: Date;
    createdAt: Date;
}

export interface NFTItem {
    id: string;
    collectionId: string;
    tokenId?: string;
    name: string;
    description: string;
    image: string;
    animation?: string;
    attributes: NFTAttribute[];
    rarity: "common" | "uncommon" | "rare" | "legendary" | "unique";
    edition: number;
    maxEdition: number;
    ownerId?: string;
    price?: number;
    currency: string;
    listingType?: "fixed" | "auction";
    auctionEndTime?: Date;
    highestBid?: number;
    bids: NFTBid[];
    history: NFTTransaction[];
    createdAt: Date;
}

export interface NFTAttribute {
    traitType: string;
    value: string | number;
    displayType?: "string" | "number" | "date" | "boost_percentage";
}

export interface NFTBid {
    id: string;
    bidderId: string;
    bidderName: string;
    amount: number;
    currency: string;
    status: "active" | "outbid" | "won" | "withdrawn";
    createdAt: Date;
}

export interface NFTTransaction {
    id: string;
    type: "mint" | "list" | "sale" | "transfer" | "burn";
    fromId?: string;
    toId?: string;
    price?: number;
    currency?: string;
    txHash?: string;
    timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: ADVERTISING & SPONSORSHIP
// ═══════════════════════════════════════════════════════════════════════════════

export interface AdCampaign {
    id: string;
    advertiserId: string;
    advertiserName: string;
    name: string;
    type: "banner" | "native" | "sponsored" | "video" | "email";
    objective: "awareness" | "traffic" | "conversions" | "app_installs";
    targeting: AdTargeting;
    creatives: AdCreative[];
    budget: AdBudget;
    schedule: AdSchedule;
    bidding: BiddingConfig;
    placement: PlacementConfig;
    performance: AdPerformance;
    status: CampaignStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdTargeting {
    locations: string[];
    languages: string[];
    interests: string[];
    demographics: DemographicTargeting;
    devices: string[];
    audiences: string[];
    exclusions: string[];
}

export interface DemographicTargeting {
    ageMin?: number;
    ageMax?: number;
    genders?: string[];
    incomes?: string[];
    professions?: string[];
}

export interface AdCreative {
    id: string;
    format: "image" | "video" | "html" | "native";
    headline: string;
    description?: string;
    assets: CreativeAsset[];
    callToAction: string;
    landingUrl: string;
    status: "active" | "paused" | "rejected";
    performance: CreativePerformance;
}

export interface CreativeAsset {
    id: string;
    type: "image" | "video" | "logo";
    url: string;
    dimensions: { width: number; height: number };
}

export interface CreativePerformance {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    spend: number;
}

export interface AdBudget {
    type: "daily" | "lifetime" | "monthly";
    amount: number;
    currency: string;
    spent: number;
    remaining: number;
}

export interface AdSchedule {
    startDate: Date;
    endDate?: Date;
    dayParting?: DayPartConfig[];
}

export interface DayPartConfig {
    days: number[];
    startHour: number;
    endHour: number;
}

export interface BiddingConfig {
    strategy: "cpm" | "cpc" | "cpa" | "auto";
    maxBid?: number;
    targetCpa?: number;
    budgetPacing: "standard" | "accelerated";
}

export interface PlacementConfig {
    pages: string[];
    positions: string[];
    excludePlacements: string[];
    contentCategories: string[];
}

export interface AdPerformance {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    conversionRate: number;
    spend: number;
    cpm: number;
    cpc: number;
    cpa: number;
    roas: number;
    reach: number;
    frequency: number;
}

export type CampaignStatus = "draft" | "pending_review" | "active" | "paused" | "completed" | "rejected";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: AUCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Auction {
    id: string;
    itemId: string;
    itemType: "equipment" | "nft" | "collectible";
    sellerId: string;
    type: "english" | "dutch" | "sealed" | "reserve";
    startTime: Date;
    endTime: Date;
    extensionMinutes: number;
    startingBid: number;
    reservePrice?: number;
    buyNowPrice?: number;
    currentBid?: number;
    bidIncrement: number;
    bids: AuctionBid[];
    watchers: string[];
    status: AuctionStatus;
    winnerId?: string;
    currency: string;
    createdAt: Date;
}

export interface AuctionBid {
    id: string;
    auctionId: string;
    bidderId: string;
    bidderName: string;
    amount: number;
    maxBid?: number;
    isAutoBid: boolean;
    isWinning: boolean;
    timestamp: Date;
}

export type AuctionStatus = "scheduled" | "active" | "extended" | "ended" | "sold" | "cancelled" | "no_sale";

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class GlobalMarketplaceService extends EventEmitter {
    private guestSpots: Map<string, GuestSpotListing> = new Map();
    private digitalProducts: Map<string, DigitalProduct> = new Map();
    private equipment: Map<string, EquipmentListing> = new Map();
    private conventions: Map<string, Convention> = new Map();
    private nftCollections: Map<string, NFTCollection> = new Map();
    private adCampaigns: Map<string, AdCampaign> = new Map();
    private auctions: Map<string, Auction> = new Map();
    private transactions: Map<string, any> = new Map();
    private escrowAccounts: Map<string, EscrowAccount> = new Map();

    constructor() {
        super();
        this.seedMarketplace();
        this.startAuctionEngine();
        this.startExpirationChecker();
        this.startAnalyticsAggregator();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GUEST SPOT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createGuestSpot(data: Partial<GuestSpotListing>): Promise<GuestSpotListing> {
        const listing: GuestSpotListing = {
            id: randomUUID(),
            hostStudioId: data.hostStudioId!,
            hostName: data.hostName || "Unknown Studio",
            hostRating: data.hostRating || 0,
            title: data.title || "Guest Spot Available",
            description: data.description || "",
            location: data.location || this.getDefaultLocation(),
            amenities: data.amenities || [],
            dates: data.dates || this.getDefaultDates(),
            financials: data.financials || this.getDefaultFinancials(),
            requirements: data.requirements || this.getDefaultRequirements(),
            portfolio: data.portfolio || { minImages: 10, styleMatch: 70, qualityScore: 7, healedWorkRequired: false },
            capacity: data.capacity || { stations: 1, maxArtists: 1, currentArtists: 0, waitlistEnabled: false },
            applications: [],
            bookings: [],
            stats: { views: 0, saves: 0, applications: 0, conversionRate: 0, avgApplicationScore: 0 },
            status: "active",
            visibility: data.visibility || "public",
            tags: data.tags || [],
            images: data.images || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.guestSpots.set(listing.id, listing);

        await eventBus.publish("marketplace.guest_spot_created", {
            listingId: listing.id,
            location: listing.location,
            style: listing.requirements.styles,
        });

        telemetry.info("Guest spot created", "Marketplace", { id: listing.id, city: listing.location.city });

        return listing;
    }

    async applyForGuestSpot(listingId: string, artistId: string, data: Partial<GuestSpotApplication>): Promise<GuestSpotApplication> {
        const listing = this.guestSpots.get(listingId);
        if (!listing) throw new Error("Listing not found");
        if (listing.status !== "active") throw new Error("Listing is no longer active");

        const existingApp = listing.applications.find(a => a.artistId === artistId && a.status !== "withdrawn");
        if (existingApp) throw new Error("Already applied to this listing");

        const application: GuestSpotApplication = {
            id: randomUUID(),
            listingId,
            artistId,
            artistName: data.artistName || "Unknown Artist",
            artistRating: data.artistRating || 0,
            coverLetter: data.coverLetter || "",
            requestedDates: data.requestedDates || listing.dates,
            proposedTerms: data.proposedTerms,
            portfolioLink: data.portfolioLink || "",
            portfolioImages: data.portfolioImages || [],
            references: data.references || [],
            status: "pending",
            negotiation: [],
            score: await this.scoreApplication(data, listing),
            notes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        listing.applications.push(application);
        listing.stats.applications++;

        await eventBus.publish("marketplace.application_received", {
            studioId: listing.hostStudioId,
            applicationId: application.id,
            artistId,
            score: application.score.overallScore,
        });

        return application;
    }

    private async scoreApplication(app: Partial<GuestSpotApplication>, listing: GuestSpotListing): Promise<ApplicationScore> {
        // AI-powered scoring simulation
        return {
            portfolioMatch: Math.floor(Math.random() * 30) + 70,
            experienceMatch: Math.floor(Math.random() * 30) + 70,
            styleMatch: Math.floor(Math.random() * 30) + 70,
            referenceScore: app.references?.length ? 80 : 50,
            overallScore: Math.floor(Math.random() * 20) + 75,
            aiNotes: "Strong portfolio with consistent style matching studio aesthetic.",
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DIGITAL PRODUCT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async publishDigitalProduct(data: Partial<DigitalProduct>): Promise<DigitalProduct> {
        const product: DigitalProduct = {
            id: randomUUID(),
            sellerId: data.sellerId!,
            sellerName: data.sellerName || "",
            sellerVerified: data.sellerVerified || false,
            title: data.title || "New Digital Asset",
            description: data.description || "",
            shortDescription: data.shortDescription || "",
            type: data.type || "flash_set",
            category: data.category || "Art",
            pricing: data.pricing || { basePrice: 10, currency: "USD", isFree: false },
            files: data.files || [],
            previewImages: data.previewImages || [],
            licensing: data.licensing || { type: "personal", allowsResale: false, allowsModification: true, attributionRequired: false },
            compatibility: data.compatibility || { software: [], versions: [], platforms: [], requirements: [] },
            stats: { views: 0, sales: 0, downloads: 0, revenue: 0, avgRating: 0, reviewCount: 0, wishlistCount: 0, cartCount: 0, refundRate: 0 },
            reviews: [],
            tags: data.tags || [],
            collections: [],
            relatedProducts: [],
            seo: data.seo || { title: data.title || "", description: "", keywords: [] },
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.digitalProducts.set(product.id, product);

        await eventBus.publish("marketplace.product_published", { productId: product.id, sellerId: product.sellerId });

        return product;
    }

    async purchaseDigitalProduct(productId: string, buyerId: string, options: PurchaseOptions = {}): Promise<PurchaseResult> {
        const product = this.digitalProducts.get(productId);
        if (!product) throw new Error("Product not found");
        if (product.status !== "active") throw new Error("Product is not available");

        const price = product.pricing.salePrice || product.pricing.basePrice;
        const transactionId = randomUUID();

        // Create escrow
        const escrow = await this.createEscrow(transactionId, product.sellerId, buyerId, price, product.pricing.currency);

        // Generate download links
        const downloadLinks = product.files.map(f => ({
            fileId: f.id,
            name: f.name,
            url: `https://cdn.altus.ink/secure/${f.id}?token=${randomUUID()}&expires=${Date.now() + 86400000}`,
            expiresAt: new Date(Date.now() + 86400000),
        }));

        // Update stats
        product.stats.sales++;
        product.stats.downloads++;
        product.stats.revenue += price;

        // Release escrow (instant for digital)
        await this.releaseEscrow(escrow.id);

        await eventBus.publish("marketplace.purchase_completed", {
            transactionId,
            productId,
            sellerId: product.sellerId,
            buyerId,
            amount: price,
            currency: product.pricing.currency,
        });

        return {
            transactionId,
            downloadLinks,
            receipt: {
                productId,
                productName: product.title,
                amount: price,
                currency: product.pricing.currency,
                purchasedAt: new Date(),
            },
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUCTION ENGINE
    // ═══════════════════════════════════════════════════════════════════════════

    async createAuction(itemId: string, itemType: Auction["itemType"], config: Partial<Auction>): Promise<Auction> {
        const auction: Auction = {
            id: randomUUID(),
            itemId,
            itemType,
            sellerId: config.sellerId || "",
            type: config.type || "english",
            startTime: config.startTime || new Date(),
            endTime: config.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            extensionMinutes: config.extensionMinutes || 5,
            startingBid: config.startingBid || 1,
            reservePrice: config.reservePrice,
            buyNowPrice: config.buyNowPrice,
            bidIncrement: config.bidIncrement || 1,
            bids: [],
            watchers: [],
            status: "scheduled",
            currency: config.currency || "USD",
            createdAt: new Date(),
            ...config,
        };

        this.auctions.set(auction.id, auction);

        await eventBus.publish("marketplace.auction_created", { auctionId: auction.id, itemId });

        return auction;
    }

    async placeBid(auctionId: string, bidderId: string, bidderName: string, amount: number, maxBid?: number): Promise<AuctionBid> {
        const auction = this.auctions.get(auctionId);
        if (!auction) throw new Error("Auction not found");
        if (auction.status !== "active" && auction.status !== "extended") throw new Error("Auction not active");
        if (new Date() > auction.endTime) throw new Error("Auction has ended");

        const currentHigh = auction.currentBid || auction.startingBid;
        const minBid = currentHigh + auction.bidIncrement;

        if (amount < minBid) throw new Error(`Minimum bid is ${minBid} ${auction.currency}`);

        // Mark previous winning bid as outbid
        const previousWinner = auction.bids.find(b => b.isWinning);
        if (previousWinner) {
            previousWinner.isWinning = false;
            await eventBus.publish("marketplace.outbid", {
                auctionId,
                previousBidderId: previousWinner.bidderId,
                newAmount: amount
            });
        }

        const bid: AuctionBid = {
            id: randomUUID(),
            auctionId,
            bidderId,
            bidderName,
            amount,
            maxBid,
            isAutoBid: !!maxBid,
            isWinning: true,
            timestamp: new Date(),
        };

        auction.bids.push(bid);
        auction.currentBid = amount;

        // Anti-sniping: extend if bid in last X minutes
        const timeRemaining = auction.endTime.getTime() - Date.now();
        if (timeRemaining < auction.extensionMinutes * 60 * 1000) {
            auction.endTime = new Date(auction.endTime.getTime() + auction.extensionMinutes * 60 * 1000);
            auction.status = "extended";
        }

        await eventBus.publish("marketplace.bid_placed", { auctionId, bidderId, amount });

        return bid;
    }

    private startAuctionEngine(): void {
        setInterval(() => {
            const now = new Date();
            for (const auction of this.auctions.values()) {
                if (auction.status === "scheduled" && now >= auction.startTime) {
                    auction.status = "active";
                    eventBus.publish("marketplace.auction_started", { auctionId: auction.id });
                } else if ((auction.status === "active" || auction.status === "extended") && now > auction.endTime) {
                    this.endAuction(auction);
                }
            }
        }, 1000);
    }

    private async endAuction(auction: Auction): Promise<void> {
        const winner = auction.bids.find(b => b.isWinning);

        if (winner) {
            if (auction.reservePrice && winner.amount < auction.reservePrice) {
                auction.status = "no_sale";
                await eventBus.publish("marketplace.auction_reserve_not_met", {
                    auctionId: auction.id,
                    highBid: winner.amount,
                    reserve: auction.reservePrice
                });
            } else {
                auction.status = "sold";
                auction.winnerId = winner.bidderId;
                await eventBus.publish("marketplace.auction_won", {
                    auctionId: auction.id,
                    winnerId: winner.bidderId,
                    amount: winner.amount
                });
            }
        } else {
            auction.status = "ended";
            await eventBus.publish("marketplace.auction_ended_no_bids", { auctionId: auction.id });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ESCROW MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    private async createEscrow(transactionId: string, sellerId: string, buyerId: string, amount: number, currency: string): Promise<EscrowAccount> {
        const escrow: EscrowAccount = {
            id: randomUUID(),
            transactionId,
            sellerId,
            buyerId,
            amount,
            currency,
            status: "held",
            createdAt: new Date(),
        };

        this.escrowAccounts.set(escrow.id, escrow);
        return escrow;
    }

    private async releaseEscrow(escrowId: string): Promise<void> {
        const escrow = this.escrowAccounts.get(escrowId);
        if (escrow) {
            escrow.status = "released";
            escrow.releasedAt = new Date();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SEARCH & DISCOVERY
    // ═══════════════════════════════════════════════════════════════════════════

    async search(query: SearchQuery): Promise<SearchResults> {
        const results: SearchResults = {
            guestSpots: [],
            digitalProducts: [],
            equipment: [],
            conventions: [],
            total: 0,
            facets: {},
        };

        const term = query.term?.toLowerCase() || "";

        if (!query.category || query.category === "guest_spot") {
            for (const item of this.guestSpots.values()) {
                if (item.status === "active" && this.matchesQuery(item, term, query)) {
                    results.guestSpots.push(item);
                }
            }
        }

        if (!query.category || query.category === "digital") {
            for (const item of this.digitalProducts.values()) {
                if (item.status === "active" && this.matchesQuery(item, term, query)) {
                    results.digitalProducts.push(item);
                }
            }
        }

        if (!query.category || query.category === "equipment") {
            for (const item of this.equipment.values()) {
                if (item.status === "active" && this.matchesQuery(item, term, query)) {
                    results.equipment.push(item);
                }
            }
        }

        results.total = results.guestSpots.length + results.digitalProducts.length + results.equipment.length + results.conventions.length;

        return results;
    }

    private matchesQuery(item: any, term: string, query: SearchQuery): boolean {
        if (term && !JSON.stringify(item).toLowerCase().includes(term)) return false;
        if (query.location && item.location?.country !== query.location) return false;
        if (query.priceMin && (item.pricing?.basePrice || item.pricing?.amount || 0) < query.priceMin) return false;
        if (query.priceMax && (item.pricing?.basePrice || item.pricing?.amount || 0) > query.priceMax) return false;
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ANALYTICS
    // ═══════════════════════════════════════════════════════════════════════════

    async getMarketplaceStats(): Promise<MarketplaceStats> {
        let totalGMV = 0;
        for (const product of this.digitalProducts.values()) {
            totalGMV += product.stats.revenue;
        }

        return {
            totalListings: this.guestSpots.size + this.digitalProducts.size + this.equipment.size,
            activeListings: Array.from(this.guestSpots.values()).filter(g => g.status === "active").length +
                Array.from(this.digitalProducts.values()).filter(d => d.status === "active").length,
            totalGMV,
            avgOrderValue: totalGMV / Math.max(1, Array.from(this.digitalProducts.values()).reduce((sum, p) => sum + p.stats.sales, 0)),
            conversionRate: 0.05,
            activeAuctions: Array.from(this.auctions.values()).filter(a => a.status === "active").length,
        };
    }

    private startExpirationChecker(): void {
        setInterval(() => {
            const now = new Date();
            for (const listing of this.guestSpots.values()) {
                if (listing.expiresAt && now > listing.expiresAt && listing.status === "active") {
                    listing.status = "expired";
                }
            }
        }, 60000);
    }

    private startAnalyticsAggregator(): void {
        setInterval(async () => {
            const stats = await this.getMarketplaceStats();
            telemetry.info("Marketplace stats", "Marketplace", stats);
        }, 300000);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    private getDefaultLocation(): LocationInfo {
        return { city: "", country: "", countryCode: "", coordinates: { lat: 0, lng: 0 }, address: "", timezone: "UTC", nearbyAirports: [] };
    }

    private getDefaultDates(): DateRange {
        return { startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isFlexible: false, blockedDates: [] };
    }

    private getDefaultFinancials(): GuestSpotFinancials {
        return {
            type: "percentage_split",
            splitPercentage: 70,
            currency: "EUR",
            paymentTerms: { depositRequired: true, depositPercentage: 20, paymentSchedule: "weekly", acceptedMethods: ["stripe", "paypal"] },
            cancellationPolicy: { type: "moderate", refundPercentage: 50, noticeDays: 7 },
        };
    }

    private getDefaultRequirements(): GuestSpotRequirements {
        return {
            minExperienceYears: 2,
            styles: [],
            languages: ["English"],
            insuranceRequired: true,
            licenseRequired: false,
            backgroundCheckRequired: false,
            portfolioMinimum: 10,
            verifiedOnly: false,
        };
    }

    private seedMarketplace(): void {
        this.createGuestSpot({
            hostName: "Ink & Dagger",
            location: { city: "London", country: "UK", countryCode: "GB", address: "Camden High St", coordinates: { lat: 51.5, lng: -0.1 }, timezone: "Europe/London", nearbyAirports: ["LHR", "LGW"] },
            title: "Guest Spot in Camden - High Footfall",
            financials: { type: "percentage_split", splitPercentage: 60, currency: "GBP", paymentTerms: { depositRequired: true, depositPercentage: 20, paymentSchedule: "weekly", acceptedMethods: ["stripe"] }, cancellationPolicy: { type: "moderate", refundPercentage: 50, noticeDays: 7 } },
            dates: { startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isFlexible: true, blockedDates: [] },
        });

        this.publishDigitalProduct({
            sellerName: "Horiyoshi III",
            title: "Traditional Japanese Dragon Reference Pack",
            type: "reference_pack",
            pricing: { basePrice: 50, currency: "USD", isFree: false },
            tags: ["japanese", "traditional", "dragon", "reference"],
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface EscrowAccount {
    id: string;
    transactionId: string;
    sellerId: string;
    buyerId: string;
    amount: number;
    currency: string;
    status: "held" | "released" | "refunded" | "disputed";
    createdAt: Date;
    releasedAt?: Date;
}

interface PurchaseOptions {
    couponCode?: string;
    giftTo?: string;
    tier?: string;
}

interface PurchaseResult {
    transactionId: string;
    downloadLinks: { fileId: string; name: string; url: string; expiresAt: Date }[];
    receipt: {
        productId: string;
        productName: string;
        amount: number;
        currency: string;
        purchasedAt: Date;
    };
}

interface SearchQuery {
    term?: string;
    category?: "guest_spot" | "digital" | "equipment" | "convention";
    location?: string;
    priceMin?: number;
    priceMax?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
}

interface SearchResults {
    guestSpots: GuestSpotListing[];
    digitalProducts: DigitalProduct[];
    equipment: EquipmentListing[];
    conventions: Convention[];
    total: number;
    facets: Record<string, any>;
}

interface MarketplaceStats {
    totalListings: number;
    activeListings: number;
    totalGMV: number;
    avgOrderValue: number;
    conversionRate: number;
    activeAuctions: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const marketplaceService = new GlobalMarketplaceService();
export default marketplaceService;
