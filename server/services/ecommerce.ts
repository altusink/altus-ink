/**
 * ALTUS INK - ENTERPRISE E-COMMERCE & PRODUCT CATALOG SERVICE
 * Complete product catalog and e-commerce functionality
 * 
 * Features:
 * - Product management
 * - Category hierarchy
 * - Variant management
 * - Inventory sync
 * - Pricing rules
 * - Shopping cart
 * - Order management
 * - Shipping
 * - Returns and refunds
 * - Product reviews
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Product {
    id: string;
    sku: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    type: ProductType;
    status: ProductStatus;
    visibility: ProductVisibility;
    categories: string[];
    tags: string[];
    brand?: string;
    vendor?: string;
    pricing: ProductPricing;
    inventory: ProductInventory;
    variants: ProductVariant[];
    attributes: ProductAttribute[];
    options: ProductOption[];
    images: ProductImage[];
    seo: ProductSEO;
    shipping: ShippingInfo;
    metadata: ProductMetadata;
    related: RelatedProducts;
    reviews: ReviewSummary;
    analytics: ProductAnalytics;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}

export type ProductType = "physical" | "digital" | "service" | "subscription" | "bundle";
export type ProductStatus = "draft" | "active" | "archived" | "discontinued";
export type ProductVisibility = "visible" | "hidden" | "search_only" | "catalog_only";

export interface ProductPricing {
    currency: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    margin?: number;
    taxable: boolean;
    taxClass?: string;
    priceRules: PriceRule[];
    tiers?: PriceTier[];
}

export interface PriceRule {
    id: string;
    name: string;
    type: "percentage" | "fixed" | "bulk" | "customer_group";
    value: number;
    conditions: PriceCondition[];
    priority: number;
    startDate?: Date;
    endDate?: Date;
}

export interface PriceCondition {
    field: string;
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "in";
    value: any;
}

export interface PriceTier {
    minQuantity: number;
    maxQuantity?: number;
    price: number;
    discountPercent?: number;
}

export interface ProductInventory {
    trackInventory: boolean;
    allowBackorder: boolean;
    backorderLimit?: number;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    lowStockThreshold: number;
    outOfStockBehavior: "hide" | "show_unavailable" | "allow_backorder";
    locations: InventoryLocation[];
}

export interface InventoryLocation {
    locationId: string;
    locationName: string;
    quantity: number;
    reserved: number;
    available: number;
    incoming: number;
    incomingDate?: Date;
}

export interface ProductVariant {
    id: string;
    sku: string;
    name: string;
    options: VariantOption[];
    pricing: VariantPricing;
    inventory: VariantInventory;
    images: string[];
    weight?: number;
    dimensions?: Dimensions;
    barcode?: string;
    isDefault: boolean;
    position: number;
}

export interface VariantOption {
    name: string;
    value: string;
}

export interface VariantPricing {
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    priceAdjustment?: number;
    priceAdjustmentType?: "fixed" | "percentage";
}

export interface VariantInventory {
    quantity: number;
    reserved: number;
    available: number;
    trackInventory: boolean;
}

export interface Dimensions {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
}

export interface ProductAttribute {
    id: string;
    name: string;
    value: string | string[];
    visible: boolean;
    filterable: boolean;
    searchable: boolean;
}

export interface ProductOption {
    id: string;
    name: string;
    type: "dropdown" | "color" | "size" | "text" | "radio" | "checkbox";
    required: boolean;
    values: OptionValue[];
}

export interface OptionValue {
    id: string;
    value: string;
    label: string;
    priceAdjustment?: number;
    colorCode?: string;
    imageUrl?: string;
}

export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    position: number;
    isDefault: boolean;
    variants: string[];
    width?: number;
    height?: number;
}

export interface ProductSEO {
    title?: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
    noIndex?: boolean;
    structuredData?: Record<string, any>;
}

export interface ShippingInfo {
    requiresShipping: boolean;
    weight: number;
    weightUnit: "kg" | "lb";
    dimensions?: Dimensions;
    shippingClass?: string;
    freeShipping: boolean;
    shippingRestrictions?: ShippingRestriction[];
}

export interface ShippingRestriction {
    type: "country" | "region" | "carrier";
    values: string[];
    action: "allow" | "deny";
}

export interface ProductMetadata {
    googleProductCategory?: string;
    customFields: Record<string, any>;
    warranty?: string;
    returnPolicy?: string;
    mpn?: string;
    gtin?: string;
    origin?: string;
}

export interface RelatedProducts {
    upsells: string[];
    crossSells: string[];
    related: string[];
    frequently_bought_together: string[];
}

export interface ReviewSummary {
    count: number;
    average: number;
    distribution: Record<number, number>;
    featured: string[];
}

export interface ProductAnalytics {
    views: number;
    uniqueViews: number;
    addToCart: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
    returnRate: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    path: string;
    level: number;
    position: number;
    image?: string;
    icon?: string;
    seo: ProductSEO;
    filters: CategoryFilter[];
    productCount: number;
    isActive: boolean;
    showInNav: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryFilter {
    attributeId: string;
    attributeName: string;
    type: "checkbox" | "range" | "color" | "rating";
    values?: FilterValue[];
    range?: { min: number; max: number };
}

export interface FilterValue {
    value: string;
    label: string;
    count: number;
}

export interface Cart {
    id: string;
    customerId?: string;
    sessionId: string;
    items: CartItem[];
    subtotal: number;
    discounts: CartDiscount[];
    discountTotal: number;
    shipping: CartShipping;
    tax: CartTax;
    total: number;
    currency: string;
    couponCodes: string[];
    notes?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    originalPrice: number;
    total: number;
    image?: string;
    options: SelectedOption[];
    customizations?: CartCustomization[];
    giftWrap?: boolean;
    giftMessage?: string;
}

export interface SelectedOption {
    name: string;
    value: string;
    priceAdjustment: number;
}

export interface CartCustomization {
    name: string;
    value: string;
    price?: number;
}

export interface CartDiscount {
    id: string;
    code: string;
    type: "percentage" | "fixed" | "free_shipping" | "bogo";
    value: number;
    amount: number;
    itemIds?: string[];
}

export interface CartShipping {
    method?: ShippingMethod;
    address?: ShippingAddress;
    estimatedDelivery?: Date;
    cost: number;
}

export interface ShippingMethod {
    id: string;
    name: string;
    carrier: string;
    estimatedDays: number;
    price: number;
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
}

export interface CartTax {
    rate: number;
    amount: number;
    included: boolean;
    breakdown: TaxBreakdown[];
}

export interface TaxBreakdown {
    name: string;
    rate: number;
    amount: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId?: string;
    email: string;
    phone?: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    fulfillmentStatus: FulfillmentStatus;
    items: OrderItem[];
    subtotal: number;
    discounts: OrderDiscount[];
    discountTotal: number;
    shipping: OrderShipping;
    tax: OrderTax;
    total: number;
    currency: string;
    payment: OrderPayment;
    billingAddress: BillingAddress;
    shippingAddress: ShippingAddress;
    fulfillments: Fulfillment[];
    refunds: Refund[];
    notes: OrderNote[];
    tags: string[];
    metadata: OrderMetadata;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    cancelledAt?: Date;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "authorized" | "paid" | "partially_paid" | "refunded" | "failed";
export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "returned";

export interface OrderItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
    options: SelectedOption[];
    fulfilledQuantity: number;
    refundedQuantity: number;
    requiresShipping: boolean;
}

export interface OrderDiscount {
    code: string;
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    amount: number;
}

export interface OrderShipping {
    method: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    cost: number;
}

export interface OrderTax {
    rate: number;
    amount: number;
    taxId?: string;
}

export interface OrderPayment {
    method: string;
    transactionId?: string;
    gateway: string;
    amount: number;
    currency: string;
    paidAt?: Date;
    details?: Record<string, any>;
}

export interface BillingAddress {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    taxId?: string;
}

export interface Fulfillment {
    id: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "failed";
    items: FulfillmentItem[];
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
    notes?: string;
    createdAt: Date;
}

export interface FulfillmentItem {
    orderItemId: string;
    quantity: number;
}

export interface Refund {
    id: string;
    status: "pending" | "approved" | "completed" | "rejected";
    reason: RefundReason;
    items: RefundItem[];
    amount: number;
    shipping: number;
    tax: number;
    total: number;
    restockItems: boolean;
    notes?: string;
    processedBy?: string;
    createdAt: Date;
    processedAt?: Date;
}

export type RefundReason = "defective" | "not_as_described" | "wrong_item" | "changed_mind" | "other";

export interface RefundItem {
    orderItemId: string;
    quantity: number;
    amount: number;
}

export interface OrderNote {
    id: string;
    content: string;
    isInternal: boolean;
    author: string;
    createdAt: Date;
}

export interface OrderMetadata {
    source: string;
    ip?: string;
    userAgent?: string;
    referrer?: string;
    affiliate?: string;
    customFields: Record<string, any>;
}

export interface Review {
    id: string;
    productId: string;
    orderId?: string;
    customerId?: string;
    customerName: string;
    customerEmail: string;
    rating: number;
    title?: string;
    content: string;
    pros?: string[];
    cons?: string[];
    images: ReviewImage[];
    verified: boolean;
    status: ReviewStatus;
    helpful: { yes: number; no: number };
    response?: ReviewResponse;
    createdAt: Date;
    publishedAt?: Date;
}

export type ReviewStatus = "pending" | "approved" | "rejected" | "spam";

export interface ReviewImage {
    id: string;
    url: string;
    caption?: string;
}

export interface ReviewResponse {
    content: string;
    author: string;
    createdAt: Date;
}

export interface Wishlist {
    id: string;
    customerId: string;
    name: string;
    isPublic: boolean;
    items: WishlistItem[];
    sharedWith: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface WishlistItem {
    id: string;
    productId: string;
    variantId?: string;
    addedAt: Date;
    notes?: string;
    priority: number;
}

export interface Promotion {
    id: string;
    name: string;
    description: string;
    type: PromotionType;
    status: "draft" | "active" | "scheduled" | "expired";
    rules: PromotionRule[];
    discounts: PromotionDiscount[];
    usageLimit?: number;
    usageCount: number;
    perCustomerLimit?: number;
    startDate: Date;
    endDate?: Date;
    priority: number;
    stackable: boolean;
    createdAt: Date;
}

export type PromotionType = "automatic" | "coupon" | "sale" | "bundle" | "bogo";

export interface PromotionRule {
    type: "cart_total" | "product" | "category" | "customer" | "quantity";
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "in";
    value: any;
}

export interface PromotionDiscount {
    type: "percentage" | "fixed" | "free_shipping" | "free_product";
    value: number;
    appliesTo: "order" | "product" | "shipping";
    productIds?: string[];
    categoryIds?: string[];
    maxDiscount?: number;
}

export interface ShippingZone {
    id: string;
    name: string;
    regions: ZoneRegion[];
    methods: ZoneShippingMethod[];
    isActive: boolean;
}

export interface ZoneRegion {
    country: string;
    states?: string[];
    postalCodes?: string[];
}

export interface ZoneShippingMethod {
    id: string;
    name: string;
    type: "flat" | "weight" | "price" | "item" | "free";
    carrier?: string;
    price: number;
    minOrder?: number;
    maxOrder?: number;
    estimatedDays: number;
    conditions?: ShippingCondition[];
}

export interface ShippingCondition {
    type: "weight" | "price" | "quantity";
    min?: number;
    max?: number;
    price: number;
}

export interface ProductSearchResult {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    facets: SearchFacet[];
}

export interface SearchFacet {
    name: string;
    values: FacetValue[];
}

export interface FacetValue {
    value: string;
    count: number;
    selected: boolean;
}

export interface EcommerceAnalytics {
    period: { start: Date; end: Date };
    sales: SalesMetrics;
    products: ProductMetrics;
    customers: CustomerMetrics;
    cart: CartMetrics;
    funnel: FunnelMetrics;
}

export interface SalesMetrics {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    itemsPerOrder: number;
    returnRate: number;
    byStatus: Record<OrderStatus, number>;
    byPaymentMethod: Record<string, number>;
}

export interface ProductMetrics {
    topSellers: Array<{ productId: string; name: string; quantity: number; revenue: number }>;
    lowStock: number;
    outOfStock: number;
    viewToCart: number;
    cartToOrder: number;
}

export interface CustomerMetrics {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    repeatPurchaseRate: number;
    averageLifetimeValue: number;
}

export interface CartMetrics {
    totalCarts: number;
    abandonedCarts: number;
    abandonmentRate: number;
    recoveredRevenue: number;
    averageCartValue: number;
}

export interface FunnelMetrics {
    views: number;
    addToCart: number;
    checkout: number;
    purchase: number;
    viewToCartRate: number;
    cartToCheckoutRate: number;
    checkoutToPurchaseRate: number;
}

// =============================================================================
// E-COMMERCE SERVICE CLASS
// =============================================================================

export class EcommerceService {
    private products: Map<string, Product> = new Map();
    private categories: Map<string, Category> = new Map();
    private carts: Map<string, Cart> = new Map();
    private orders: Map<string, Order> = new Map();
    private reviews: Map<string, Review> = new Map();
    private wishlists: Map<string, Wishlist> = new Map();
    private promotions: Map<string, Promotion> = new Map();
    private shippingZones: Map<string, ShippingZone> = new Map();

    private orderCounter = 10000;

    constructor() {
        this.initializeDefaultCategories();
        this.initializeDefaultProducts();
        this.initializeDefaultShippingZones();
    }

    // ===========================================================================
    // PRODUCT MANAGEMENT
    // ===========================================================================

    async createProduct(data: Partial<Product>): Promise<Product> {
        const product: Product = {
            id: randomUUID(),
            sku: data.sku || `SKU-${Date.now()}`,
            name: data.name || "New Product",
            slug: data.slug || this.generateSlug(data.name || "new-product"),
            description: data.description || "",
            type: data.type || "physical",
            status: "draft",
            visibility: "visible",
            categories: data.categories || [],
            tags: data.tags || [],
            pricing: data.pricing || {
                currency: "EUR",
                price: 0,
                taxable: true,
                priceRules: []
            },
            inventory: data.inventory || {
                trackInventory: true,
                allowBackorder: false,
                quantity: 0,
                reservedQuantity: 0,
                availableQuantity: 0,
                lowStockThreshold: 10,
                outOfStockBehavior: "show_unavailable",
                locations: []
            },
            variants: data.variants || [],
            attributes: data.attributes || [],
            options: data.options || [],
            images: data.images || [],
            seo: data.seo || {},
            shipping: data.shipping || {
                requiresShipping: true,
                weight: 0,
                weightUnit: "kg",
                freeShipping: false
            },
            metadata: data.metadata || { customFields: {} },
            related: data.related || { upsells: [], crossSells: [], related: [], frequently_bought_together: [] },
            reviews: { count: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, featured: [] },
            analytics: { views: 0, uniqueViews: 0, addToCart: 0, purchases: 0, conversionRate: 0, revenue: 0, returnRate: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        // Calculate margin
        if (product.pricing.costPrice && product.pricing.price) {
            product.pricing.margin = ((product.pricing.price - product.pricing.costPrice) / product.pricing.price) * 100;
        }

        // Calculate available quantity
        product.inventory.availableQuantity = product.inventory.quantity - product.inventory.reservedQuantity;

        this.products.set(product.id, product);

        // Update category product counts
        for (const categoryId of product.categories) {
            const category = this.categories.get(categoryId);
            if (category) {
                category.productCount++;
            }
        }

        return product;
    }

    async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
        const product = this.products.get(id);
        if (!product) return null;

        Object.assign(product, data, { updatedAt: new Date() });

        // Recalculate margin if prices changed
        if (product.pricing.costPrice && product.pricing.price) {
            product.pricing.margin = ((product.pricing.price - product.pricing.costPrice) / product.pricing.price) * 100;
        }

        return product;
    }

    async getProduct(id: string): Promise<Product | null> {
        const product = this.products.get(id);
        if (product) {
            product.analytics.views++;
        }
        return product || null;
    }

    async getProductBySku(sku: string): Promise<Product | null> {
        for (const product of this.products.values()) {
            if (product.sku === sku) return product;
            for (const variant of product.variants) {
                if (variant.sku === sku) return product;
            }
        }
        return null;
    }

    async getProducts(filters?: {
        status?: ProductStatus;
        category?: string;
        tag?: string;
        priceMin?: number;
        priceMax?: number;
        search?: string;
    }, page: number = 1, pageSize: number = 20): Promise<ProductSearchResult> {
        let products = Array.from(this.products.values());

        if (filters) {
            if (filters.status) {
                products = products.filter(p => p.status === filters.status);
            }
            if (filters.category) {
                products = products.filter(p => p.categories.includes(filters.category!));
            }
            if (filters.tag) {
                products = products.filter(p => p.tags.includes(filters.tag!));
            }
            if (filters.priceMin !== undefined) {
                products = products.filter(p => p.pricing.price >= filters.priceMin!);
            }
            if (filters.priceMax !== undefined) {
                products = products.filter(p => p.pricing.price <= filters.priceMax!);
            }
            if (filters.search) {
                const search = filters.search.toLowerCase();
                products = products.filter(p =>
                    p.name.toLowerCase().includes(search) ||
                    p.description.toLowerCase().includes(search) ||
                    p.sku.toLowerCase().includes(search)
                );
            }
        }

        const total = products.length;
        const start = (page - 1) * pageSize;
        products = products.slice(start, start + pageSize);

        return {
            products,
            total,
            page,
            pageSize,
            facets: []
        };
    }

    async publishProduct(id: string): Promise<Product | null> {
        const product = this.products.get(id);
        if (!product) return null;

        product.status = "active";
        product.publishedAt = new Date();
        product.updatedAt = new Date();

        return product;
    }

    async archiveProduct(id: string): Promise<Product | null> {
        const product = this.products.get(id);
        if (!product) return null;

        product.status = "archived";
        product.updatedAt = new Date();

        return product;
    }

    async addVariant(productId: string, variant: Omit<ProductVariant, "id" | "position">): Promise<ProductVariant | null> {
        const product = this.products.get(productId);
        if (!product) return null;

        const newVariant: ProductVariant = {
            id: randomUUID(),
            position: product.variants.length,
            ...variant
        };

        product.variants.push(newVariant);
        product.updatedAt = new Date();

        return newVariant;
    }

    async updateInventory(productId: string, variantId: string | undefined, quantity: number, operation: "set" | "adjust"): Promise<Product | null> {
        const product = this.products.get(productId);
        if (!product) return null;

        if (variantId) {
            const variant = product.variants.find(v => v.id === variantId);
            if (variant) {
                if (operation === "set") {
                    variant.inventory.quantity = quantity;
                } else {
                    variant.inventory.quantity += quantity;
                }
                variant.inventory.available = variant.inventory.quantity - variant.inventory.reserved;
            }
        } else {
            if (operation === "set") {
                product.inventory.quantity = quantity;
            } else {
                product.inventory.quantity += quantity;
            }
            product.inventory.availableQuantity = product.inventory.quantity - product.inventory.reservedQuantity;
        }

        product.updatedAt = new Date();
        return product;
    }

    private generateSlug(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    private initializeDefaultProducts(): void {
        const products: Partial<Product>[] = [
            {
                sku: "AFTERCARE-001",
                name: "Premium Tattoo Aftercare Kit",
                type: "physical",
                status: "active",
                pricing: { currency: "EUR", price: 29.99, costPrice: 12, taxable: true, priceRules: [] },
                inventory: { trackInventory: true, allowBackorder: false, quantity: 100, reservedQuantity: 0, availableQuantity: 100, lowStockThreshold: 20, outOfStockBehavior: "show_unavailable", locations: [] }
            },
            {
                sku: "BALM-001",
                name: "Healing Balm - Natural Formula",
                type: "physical",
                status: "active",
                pricing: { currency: "EUR", price: 15.99, costPrice: 5, taxable: true, priceRules: [] },
                inventory: { trackInventory: true, allowBackorder: false, quantity: 200, reservedQuantity: 0, availableQuantity: 200, lowStockThreshold: 30, outOfStockBehavior: "show_unavailable", locations: [] }
            },
            {
                sku: "GIFTCARD-50",
                name: "Gift Card - €50",
                type: "digital",
                status: "active",
                pricing: { currency: "EUR", price: 50, taxable: false, priceRules: [] },
                shipping: { requiresShipping: false, weight: 0, weightUnit: "kg", freeShipping: true }
            },
            {
                sku: "GIFTCARD-100",
                name: "Gift Card - €100",
                type: "digital",
                status: "active",
                pricing: { currency: "EUR", price: 100, taxable: false, priceRules: [] },
                shipping: { requiresShipping: false, weight: 0, weightUnit: "kg", freeShipping: true }
            }
        ];

        for (const product of products) {
            this.createProduct(product);
        }
    }

    // ===========================================================================
    // CATEGORY MANAGEMENT
    // ===========================================================================

    async createCategory(data: Partial<Category>): Promise<Category> {
        const category: Category = {
            id: randomUUID(),
            name: data.name || "New Category",
            slug: data.slug || this.generateSlug(data.name || "new-category"),
            parentId: data.parentId,
            path: "",
            level: 0,
            position: data.position || 0,
            seo: data.seo || {},
            filters: data.filters || [],
            productCount: 0,
            isActive: true,
            showInNav: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        // Calculate path and level
        if (category.parentId) {
            const parent = this.categories.get(category.parentId);
            if (parent) {
                category.path = `${parent.path}/${category.slug}`;
                category.level = parent.level + 1;
            }
        } else {
            category.path = `/${category.slug}`;
            category.level = 0;
        }

        this.categories.set(category.id, category);
        return category;
    }

    async getCategory(id: string): Promise<Category | null> {
        return this.categories.get(id) || null;
    }

    async getCategories(parentId?: string): Promise<Category[]> {
        let categories = Array.from(this.categories.values());

        if (parentId !== undefined) {
            categories = categories.filter(c => c.parentId === parentId);
        }

        return categories.sort((a, b) => a.position - b.position);
    }

    async getCategoryTree(): Promise<Category[]> {
        const rootCategories = await this.getCategories(undefined);
        return this.buildCategoryTree(rootCategories);
    }

    private async buildCategoryTree(categories: Category[]): Promise<Category[]> {
        for (const category of categories) {
            const children = await this.getCategories(category.id);
            if (children.length > 0) {
                (category as any).children = await this.buildCategoryTree(children);
            }
        }
        return categories;
    }

    private initializeDefaultCategories(): void {
        const categories: Partial<Category>[] = [
            { name: "Aftercare Products", slug: "aftercare" },
            { name: "Gift Cards", slug: "gift-cards" },
            { name: "Merchandise", slug: "merchandise" },
            { name: "Accessories", slug: "accessories" }
        ];

        for (const category of categories) {
            this.createCategory(category);
        }
    }

    // ===========================================================================
    // CART MANAGEMENT
    // ===========================================================================

    async createCart(sessionId: string, customerId?: string): Promise<Cart> {
        const cart: Cart = {
            id: randomUUID(),
            customerId,
            sessionId,
            items: [],
            subtotal: 0,
            discounts: [],
            discountTotal: 0,
            shipping: { cost: 0 },
            tax: { rate: 0, amount: 0, included: false, breakdown: [] },
            total: 0,
            currency: "EUR",
            couponCodes: [],
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        this.carts.set(cart.id, cart);
        return cart;
    }

    async getCart(id: string): Promise<Cart | null> {
        return this.carts.get(id) || null;
    }

    async getCartBySession(sessionId: string): Promise<Cart | null> {
        for (const cart of this.carts.values()) {
            if (cart.sessionId === sessionId) return cart;
        }
        return null;
    }

    async addToCart(cartId: string, item: Omit<CartItem, "id" | "total">): Promise<Cart | null> {
        const cart = this.carts.get(cartId);
        if (!cart) return null;

        const product = this.products.get(item.productId);
        if (product) {
            product.analytics.addToCart++;
        }

        const existingItem = cart.items.find(i =>
            i.productId === item.productId &&
            i.variantId === item.variantId &&
            JSON.stringify(i.options) === JSON.stringify(item.options)
        );

        if (existingItem) {
            existingItem.quantity += item.quantity;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            const newItem: CartItem = {
                id: randomUUID(),
                total: item.quantity * item.price,
                ...item
            };
            cart.items.push(newItem);
        }

        await this.recalculateCart(cart);
        return cart;
    }

    async updateCartItem(cartId: string, itemId: string, quantity: number): Promise<Cart | null> {
        const cart = this.carts.get(cartId);
        if (!cart) return null;

        if (quantity <= 0) {
            return this.removeFromCart(cartId, itemId);
        }

        const item = cart.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = quantity;
            item.total = item.quantity * item.price;
        }

        await this.recalculateCart(cart);
        return cart;
    }

    async removeFromCart(cartId: string, itemId: string): Promise<Cart | null> {
        const cart = this.carts.get(cartId);
        if (!cart) return null;

        cart.items = cart.items.filter(i => i.id !== itemId);
        await this.recalculateCart(cart);

        return cart;
    }

    async applyCoupon(cartId: string, code: string): Promise<Cart | null> {
        const cart = this.carts.get(cartId);
        if (!cart) return null;

        // Find promotion by code
        for (const promotion of this.promotions.values()) {
            if (promotion.type === "coupon" && promotion.name === code && promotion.status === "active") {
                const discount: CartDiscount = {
                    id: randomUUID(),
                    code,
                    type: promotion.discounts[0]?.type === "percentage" ? "percentage" : "fixed",
                    value: promotion.discounts[0]?.value || 0,
                    amount: 0
                };

                if (discount.type === "percentage") {
                    discount.amount = cart.subtotal * (discount.value / 100);
                } else {
                    discount.amount = discount.value;
                }

                cart.discounts.push(discount);
                cart.couponCodes.push(code);
                await this.recalculateCart(cart);
                break;
            }
        }

        return cart;
    }

    async removeCoupon(cartId: string, code: string): Promise<Cart | null> {
        const cart = this.carts.get(cartId);
        if (!cart) return null;

        cart.discounts = cart.discounts.filter(d => d.code !== code);
        cart.couponCodes = cart.couponCodes.filter(c => c !== code);
        await this.recalculateCart(cart);

        return cart;
    }

    async setShippingAddress(cartId: string, address: ShippingAddress): Promise<Cart | null> {
        const cart = this.carts.get(cartId);
        if (!cart) return null;

        cart.shipping.address = address;
        await this.recalculateCart(cart);

        return cart;
    }

    async setShippingMethod(cartId: string, method: ShippingMethod): Promise<Cart | null> {
        const cart = this.carts.get(cartId);
        if (!cart) return null;

        cart.shipping.method = method;
        cart.shipping.cost = method.price;
        cart.shipping.estimatedDelivery = new Date(Date.now() + method.estimatedDays * 24 * 60 * 60 * 1000);
        await this.recalculateCart(cart);

        return cart;
    }

    private async recalculateCart(cart: Cart): Promise<void> {
        // Calculate subtotal
        cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);

        // Calculate discount total
        cart.discountTotal = cart.discounts.reduce((sum, d) => sum + d.amount, 0);

        // Calculate tax (simplified - 21% VAT)
        const taxableAmount = cart.subtotal - cart.discountTotal;
        cart.tax.rate = 21;
        cart.tax.amount = taxableAmount * 0.21;

        // Calculate total
        cart.total = cart.subtotal - cart.discountTotal + cart.tax.amount + cart.shipping.cost;

        cart.updatedAt = new Date();
    }

    // ===========================================================================
    // ORDER MANAGEMENT
    // ===========================================================================

    async createOrder(cart: Cart, billing: BillingAddress, payment: OrderPayment): Promise<Order> {
        const order: Order = {
            id: randomUUID(),
            orderNumber: `ORD-${++this.orderCounter}`,
            customerId: cart.customerId,
            email: billing.company || "",
            status: "pending",
            paymentStatus: payment.paidAt ? "paid" : "pending",
            fulfillmentStatus: "unfulfilled",
            items: cart.items.map(item => ({
                id: randomUUID(),
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                image: item.image,
                options: item.options,
                fulfilledQuantity: 0,
                refundedQuantity: 0,
                requiresShipping: true
            })),
            subtotal: cart.subtotal,
            discounts: cart.discounts.map(d => ({
                code: d.code,
                type: d.type === "bogo" ? "percentage" : d.type,
                value: d.value,
                amount: d.amount
            })),
            discountTotal: cart.discountTotal,
            shipping: {
                method: cart.shipping.method?.name || "Standard",
                carrier: cart.shipping.method?.carrier,
                estimatedDelivery: cart.shipping.estimatedDelivery,
                cost: cart.shipping.cost
            },
            tax: {
                rate: cart.tax.rate,
                amount: cart.tax.amount
            },
            total: cart.total,
            currency: cart.currency,
            payment,
            billingAddress: billing,
            shippingAddress: cart.shipping.address!,
            fulfillments: [],
            refunds: [],
            notes: [],
            tags: [],
            metadata: { source: "web", customFields: cart.metadata },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.orders.set(order.id, order);

        // Update product analytics
        for (const item of order.items) {
            const product = this.products.get(item.productId);
            if (product) {
                product.analytics.purchases++;
                product.analytics.revenue += item.total;
                product.analytics.conversionRate = (product.analytics.purchases / product.analytics.views) * 100;
            }
        }

        // Reserve inventory
        for (const item of order.items) {
            await this.updateInventory(item.productId, item.variantId, -item.quantity, "adjust");
        }

        return order;
    }

    async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
        const order = this.orders.get(id);
        if (!order) return null;

        order.status = status;
        order.updatedAt = new Date();

        if (status === "completed") {
            order.completedAt = new Date();
        } else if (status === "cancelled") {
            order.cancelledAt = new Date();
            // Restore inventory
            for (const item of order.items) {
                await this.updateInventory(item.productId, item.variantId, item.quantity, "adjust");
            }
        }

        return order;
    }

    async getOrder(id: string): Promise<Order | null> {
        return this.orders.get(id) || null;
    }

    async getOrders(filters?: {
        customerId?: string;
        status?: OrderStatus;
        paymentStatus?: PaymentStatus;
        fulfillmentStatus?: FulfillmentStatus;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Order[]> {
        let orders = Array.from(this.orders.values());

        if (filters) {
            if (filters.customerId) {
                orders = orders.filter(o => o.customerId === filters.customerId);
            }
            if (filters.status) {
                orders = orders.filter(o => o.status === filters.status);
            }
            if (filters.paymentStatus) {
                orders = orders.filter(o => o.paymentStatus === filters.paymentStatus);
            }
            if (filters.fulfillmentStatus) {
                orders = orders.filter(o => o.fulfillmentStatus === filters.fulfillmentStatus);
            }
            if (filters.fromDate) {
                orders = orders.filter(o => o.createdAt >= filters.fromDate!);
            }
            if (filters.toDate) {
                orders = orders.filter(o => o.createdAt <= filters.toDate!);
            }
        }

        return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async createFulfillment(orderId: string, items: FulfillmentItem[], tracking?: { carrier?: string; trackingNumber?: string }): Promise<Fulfillment | null> {
        const order = this.orders.get(orderId);
        if (!order) return null;

        const fulfillment: Fulfillment = {
            id: randomUUID(),
            status: "pending",
            items,
            carrier: tracking?.carrier,
            trackingNumber: tracking?.trackingNumber,
            trackingUrl: tracking?.trackingNumber ? `https://tracking.example.com/${tracking.trackingNumber}` : undefined,
            createdAt: new Date()
        };

        order.fulfillments.push(fulfillment);

        // Update fulfilled quantities
        for (const fItem of items) {
            const orderItem = order.items.find(i => i.id === fItem.orderItemId);
            if (orderItem) {
                orderItem.fulfilledQuantity += fItem.quantity;
            }
        }

        // Update fulfillment status
        const allFulfilled = order.items.every(i => i.fulfilledQuantity >= i.quantity);
        const partiallyFulfilled = order.items.some(i => i.fulfilledQuantity > 0);

        if (allFulfilled) {
            order.fulfillmentStatus = "fulfilled";
        } else if (partiallyFulfilled) {
            order.fulfillmentStatus = "partial";
        }

        order.updatedAt = new Date();

        return fulfillment;
    }

    async shipFulfillment(orderId: string, fulfillmentId: string): Promise<Fulfillment | null> {
        const order = this.orders.get(orderId);
        if (!order) return null;

        const fulfillment = order.fulfillments.find(f => f.id === fulfillmentId);
        if (!fulfillment) return null;

        fulfillment.status = "shipped";
        fulfillment.shippedAt = new Date();
        order.updatedAt = new Date();

        return fulfillment;
    }

    async createRefund(orderId: string, refund: Omit<Refund, "id" | "status" | "createdAt">): Promise<Refund | null> {
        const order = this.orders.get(orderId);
        if (!order) return null;

        const newRefund: Refund = {
            id: randomUUID(),
            status: "pending",
            createdAt: new Date(),
            ...refund
        };

        order.refunds.push(newRefund);
        order.updatedAt = new Date();

        return newRefund;
    }

    async processRefund(orderId: string, refundId: string, approved: boolean, processedBy: string): Promise<Refund | null> {
        const order = this.orders.get(orderId);
        if (!order) return null;

        const refund = order.refunds.find(r => r.id === refundId);
        if (!refund) return null;

        refund.status = approved ? "completed" : "rejected";
        refund.processedBy = processedBy;
        refund.processedAt = new Date();

        if (approved) {
            // Update order payment status
            order.paymentStatus = "refunded";

            // Restock items if requested
            if (refund.restockItems) {
                for (const item of refund.items) {
                    const orderItem = order.items.find(i => i.id === item.orderItemId);
                    if (orderItem) {
                        await this.updateInventory(orderItem.productId, orderItem.variantId, item.quantity, "adjust");
                    }
                }
            }
        }

        order.updatedAt = new Date();

        return refund;
    }

    // ===========================================================================
    // REVIEWS
    // ===========================================================================

    async createReview(data: Partial<Review>): Promise<Review> {
        const review: Review = {
            id: randomUUID(),
            productId: data.productId || "",
            customerName: data.customerName || "Anonymous",
            customerEmail: data.customerEmail || "",
            rating: data.rating || 5,
            content: data.content || "",
            images: data.images || [],
            verified: data.orderId ? true : false,
            status: "pending",
            helpful: { yes: 0, no: 0 },
            createdAt: new Date(),
            ...data
        };

        this.reviews.set(review.id, review);
        return review;
    }

    async approveReview(id: string): Promise<Review | null> {
        const review = this.reviews.get(id);
        if (!review) return null;

        review.status = "approved";
        review.publishedAt = new Date();

        // Update product review summary
        const product = this.products.get(review.productId);
        if (product) {
            const productReviews = Array.from(this.reviews.values())
                .filter(r => r.productId === review.productId && r.status === "approved");

            product.reviews.count = productReviews.length;
            product.reviews.average = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

            for (let i = 1; i <= 5; i++) {
                product.reviews.distribution[i] = productReviews.filter(r => r.rating === i).length;
            }
        }

        return review;
    }

    async getReviews(productId: string, status?: ReviewStatus): Promise<Review[]> {
        let reviews = Array.from(this.reviews.values()).filter(r => r.productId === productId);

        if (status) {
            reviews = reviews.filter(r => r.status === status);
        }

        return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // ===========================================================================
    // WISHLIST
    // ===========================================================================

    async createWishlist(customerId: string, name: string = "My Wishlist"): Promise<Wishlist> {
        const wishlist: Wishlist = {
            id: randomUUID(),
            customerId,
            name,
            isPublic: false,
            items: [],
            sharedWith: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.wishlists.set(wishlist.id, wishlist);
        return wishlist;
    }

    async addToWishlist(wishlistId: string, productId: string, variantId?: string): Promise<Wishlist | null> {
        const wishlist = this.wishlists.get(wishlistId);
        if (!wishlist) return null;

        const exists = wishlist.items.some(i => i.productId === productId && i.variantId === variantId);
        if (!exists) {
            wishlist.items.push({
                id: randomUUID(),
                productId,
                variantId,
                addedAt: new Date(),
                priority: 0
            });
            wishlist.updatedAt = new Date();
        }

        return wishlist;
    }

    async removeFromWishlist(wishlistId: string, itemId: string): Promise<Wishlist | null> {
        const wishlist = this.wishlists.get(wishlistId);
        if (!wishlist) return null;

        wishlist.items = wishlist.items.filter(i => i.id !== itemId);
        wishlist.updatedAt = new Date();

        return wishlist;
    }

    async getWishlists(customerId: string): Promise<Wishlist[]> {
        return Array.from(this.wishlists.values()).filter(w => w.customerId === customerId);
    }

    // ===========================================================================
    // SHIPPING
    // ===========================================================================

    async getShippingMethods(address: ShippingAddress, cartTotal: number): Promise<ShippingMethod[]> {
        const methods: ShippingMethod[] = [];

        for (const zone of this.shippingZones.values()) {
            if (!zone.isActive) continue;

            // Check if address is in zone
            const inZone = zone.regions.some(r =>
                r.country === address.country &&
                (!r.states?.length || r.states.includes(address.state || ""))
            );

            if (inZone) {
                for (const method of zone.methods) {
                    if (method.minOrder && cartTotal < method.minOrder) continue;
                    if (method.maxOrder && cartTotal > method.maxOrder) continue;

                    methods.push({
                        id: method.id,
                        name: method.name,
                        carrier: method.carrier || "",
                        estimatedDays: method.estimatedDays,
                        price: method.type === "free" ? 0 : method.price
                    });
                }
            }
        }

        return methods.sort((a, b) => a.price - b.price);
    }

    private initializeDefaultShippingZones(): void {
        const zones: Partial<ShippingZone>[] = [
            {
                name: "Netherlands",
                regions: [{ country: "NL" }],
                methods: [
                    { id: "nl-standard", name: "Standard Shipping", type: "flat", price: 5.99, estimatedDays: 3 },
                    { id: "nl-express", name: "Express Shipping", type: "flat", price: 12.99, estimatedDays: 1 },
                    { id: "nl-free", name: "Free Shipping", type: "free", price: 0, minOrder: 50, estimatedDays: 5 }
                ],
                isActive: true
            },
            {
                name: "Europe",
                regions: [
                    { country: "DE" }, { country: "BE" }, { country: "FR" },
                    { country: "ES" }, { country: "IT" }, { country: "PT" }
                ],
                methods: [
                    { id: "eu-standard", name: "Standard Shipping", type: "flat", price: 9.99, estimatedDays: 5 },
                    { id: "eu-express", name: "Express Shipping", type: "flat", price: 19.99, estimatedDays: 2 }
                ],
                isActive: true
            }
        ];

        for (const zone of zones) {
            const shippingZone: ShippingZone = {
                id: randomUUID(),
                name: zone.name || "",
                regions: zone.regions || [],
                methods: zone.methods || [],
                isActive: zone.isActive ?? true
            };
            this.shippingZones.set(shippingZone.id, shippingZone);
        }
    }

    // ===========================================================================
    // ANALYTICS
    // ===========================================================================

    async getAnalytics(startDate: Date, endDate: Date): Promise<EcommerceAnalytics> {
        const orders = Array.from(this.orders.values()).filter(
            o => o.createdAt >= startDate && o.createdAt <= endDate
        );

        const paidOrders = orders.filter(o => o.paymentStatus === "paid");
        const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
        const totalItems = paidOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

        const carts = Array.from(this.carts.values());
        const abandonedCarts = carts.filter(c => c.items.length > 0 && c.expiresAt < new Date()).length;

        return {
            period: { start: startDate, end: endDate },
            sales: {
                totalOrders: orders.length,
                totalRevenue,
                averageOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
                itemsPerOrder: paidOrders.length > 0 ? totalItems / paidOrders.length : 0,
                returnRate: 2.5,
                byStatus: {
                    pending: orders.filter(o => o.status === "pending").length,
                    confirmed: orders.filter(o => o.status === "confirmed").length,
                    processing: orders.filter(o => o.status === "processing").length,
                    completed: orders.filter(o => o.status === "completed").length,
                    cancelled: orders.filter(o => o.status === "cancelled").length,
                    refunded: orders.filter(o => o.status === "refunded").length
                },
                byPaymentMethod: {}
            },
            products: {
                topSellers: [],
                lowStock: Array.from(this.products.values()).filter(p => p.inventory.availableQuantity <= p.inventory.lowStockThreshold).length,
                outOfStock: Array.from(this.products.values()).filter(p => p.inventory.availableQuantity === 0).length,
                viewToCart: 15,
                cartToOrder: 25
            },
            customers: {
                totalCustomers: 100,
                newCustomers: 25,
                returningCustomers: 75,
                repeatPurchaseRate: 35,
                averageLifetimeValue: 150
            },
            cart: {
                totalCarts: carts.length,
                abandonedCarts,
                abandonmentRate: carts.length > 0 ? (abandonedCarts / carts.length) * 100 : 0,
                recoveredRevenue: 500,
                averageCartValue: carts.length > 0 ? carts.reduce((sum, c) => sum + c.total, 0) / carts.length : 0
            },
            funnel: {
                views: 10000,
                addToCart: 1500,
                checkout: 500,
                purchase: paidOrders.length,
                viewToCartRate: 15,
                cartToCheckoutRate: 33,
                checkoutToPurchaseRate: paidOrders.length / 500 * 100
            }
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const ecommerceService = new EcommerceService();
export default ecommerceService;
