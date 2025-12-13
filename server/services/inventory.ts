/**
 * ALTUS INK - ENTERPRISE INVENTORY MANAGEMENT SERVICE
 * Complete inventory and supply chain management
 * 
 * Features:
 * - Product/supply catalog
 * - Stock management with alerts
 * - Supplier management
 * - Purchase orders
 * - Inventory tracking
 * - Multi-location support
 * - Batch/lot tracking
 * - Expiry management
 * - Reorder automation
 * - Cost tracking
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Product {
    id: string;
    sku: string;
    barcode?: string;
    name: string;
    description: string;
    category: ProductCategory;
    subcategory?: string;
    brand?: string;
    unit: UnitOfMeasure;
    unitPrice: number;
    costPrice: number;
    currency: string;
    taxRate: number;
    weight?: number;
    dimensions?: Dimensions;
    images: string[];
    attributes: Record<string, any>;
    variants?: ProductVariant[];
    isActive: boolean;
    isSerialTracked: boolean;
    isBatchTracked: boolean;
    hasExpiry: boolean;
    minStockLevel: number;
    reorderPoint: number;
    reorderQuantity: number;
    leadTimeDays: number;
    preferredSupplierId?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export type ProductCategory =
    | "inks"
    | "needles"
    | "machines"
    | "power_supplies"
    | "grips"
    | "tubes"
    | "stencils"
    | "aftercare"
    | "disposables"
    | "furniture"
    | "sterilization"
    | "miscellaneous";

export type UnitOfMeasure =
    | "piece"
    | "box"
    | "pack"
    | "bottle"
    | "tube"
    | "ml"
    | "oz"
    | "gram"
    | "kg"
    | "set";

export interface Dimensions {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
}

export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    name: string;
    options: Record<string, string>;
    priceModifier: number;
    costModifier: number;
    isActive: boolean;
}

export interface Supplier {
    id: string;
    code: string;
    name: string;
    legalName?: string;
    taxId?: string;
    contactName: string;
    email: string;
    phone: string;
    website?: string;
    address: SupplierAddress;
    paymentTerms: PaymentTerms;
    currency: string;
    rating: number;
    status: "active" | "inactive" | "blocked";
    categories: ProductCategory[];
    leadTimeDays: number;
    minimumOrder: number;
    notes?: string;
    documents: SupplierDocument[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SupplierAddress {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

export interface PaymentTerms {
    type: "net" | "cod" | "prepaid" | "credit";
    netDays?: number;
    creditLimit?: number;
    earlyPaymentDiscount?: number;
    earlyPaymentDays?: number;
}

export interface SupplierDocument {
    id: string;
    type: "contract" | "certificate" | "insurance" | "license" | "other";
    name: string;
    url: string;
    expiresAt?: Date;
    uploadedAt: Date;
}

export interface Location {
    id: string;
    code: string;
    name: string;
    type: "warehouse" | "studio" | "shop" | "virtual";
    address?: SupplierAddress;
    isDefault: boolean;
    isActive: boolean;
    zones: StorageZone[];
    createdAt: Date;
}

export interface StorageZone {
    id: string;
    code: string;
    name: string;
    type: "shelf" | "cabinet" | "refrigerated" | "secure";
    capacity?: number;
    currentOccupancy?: number;
}

export interface InventoryItem {
    id: string;
    productId: string;
    variantId?: string;
    locationId: string;
    zoneId?: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    batchNumber?: string;
    serialNumber?: string;
    lotNumber?: string;
    expiryDate?: Date;
    receivedDate: Date;
    costPrice: number;
    lastCountedAt?: Date;
    updatedAt: Date;
}

export interface StockMovement {
    id: string;
    type: StockMovementType;
    productId: string;
    variantId?: string;
    fromLocationId?: string;
    toLocationId?: string;
    quantity: number;
    batchNumber?: string;
    serialNumber?: string;
    referenceType?: string;
    referenceId?: string;
    reason?: string;
    notes?: string;
    costPrice?: number;
    performedBy: string;
    createdAt: Date;
}

export type StockMovementType =
    | "receive"
    | "issue"
    | "transfer"
    | "adjustment"
    | "return"
    | "write_off"
    | "production"
    | "consumption";

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    locationId: string;
    status: PurchaseOrderStatus;
    priority: "low" | "normal" | "high" | "urgent";
    items: PurchaseOrderItem[];
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    discount: number;
    total: number;
    currency: string;
    paymentTerms: PaymentTerms;
    paymentStatus: "pending" | "partial" | "paid";
    paidAmount: number;
    expectedDelivery?: Date;
    actualDelivery?: Date;
    shippingAddress: SupplierAddress;
    notes?: string;
    attachments: string[];
    approvedBy?: string;
    approvedAt?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type PurchaseOrderStatus =
    | "draft"
    | "pending_approval"
    | "approved"
    | "ordered"
    | "partially_received"
    | "received"
    | "cancelled";

export interface PurchaseOrderItem {
    id: string;
    productId: string;
    variantId?: string;
    sku: string;
    name: string;
    quantity: number;
    receivedQuantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    total: number;
}

export interface GoodsReceipt {
    id: string;
    receiptNumber: string;
    purchaseOrderId: string;
    supplierId: string;
    locationId: string;
    status: "pending" | "inspecting" | "completed" | "rejected";
    items: GoodsReceiptItem[];
    receivedBy: string;
    receivedAt: Date;
    inspectedBy?: string;
    inspectedAt?: Date;
    notes?: string;
    documents: string[];
}

export interface GoodsReceiptItem {
    id: string;
    purchaseOrderItemId: string;
    productId: string;
    variantId?: string;
    expectedQuantity: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    rejectionReason?: string;
    batchNumber?: string;
    lotNumber?: string;
    expiryDate?: Date;
    zoneId?: string;
}

export interface StockCount {
    id: string;
    countNumber: string;
    locationId: string;
    zoneId?: string;
    type: "full" | "partial" | "cycle";
    status: "planned" | "in_progress" | "completed" | "cancelled";
    items: StockCountItem[];
    scheduledAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    countedBy?: string;
    verifiedBy?: string;
    notes?: string;
    discrepancyCount: number;
    discrepancyValue: number;
}

export interface StockCountItem {
    id: string;
    productId: string;
    variantId?: string;
    expectedQuantity: number;
    countedQuantity?: number;
    variance: number;
    varianceValue: number;
    status: "pending" | "counted" | "verified" | "adjusted";
    notes?: string;
}

export interface StockAlert {
    id: string;
    type: StockAlertType;
    productId: string;
    variantId?: string;
    locationId: string;
    priority: "low" | "medium" | "high" | "critical";
    status: "active" | "acknowledged" | "resolved";
    message: string;
    threshold?: number;
    currentValue?: number;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    createdAt: Date;
}

export type StockAlertType =
    | "low_stock"
    | "out_of_stock"
    | "overstock"
    | "expiring_soon"
    | "expired"
    | "reorder_point";

export interface ReorderSuggestion {
    productId: string;
    variantId?: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    suggestedQuantity: number;
    preferredSupplierId?: string;
    supplierName?: string;
    estimatedCost: number;
    leadTimeDays: number;
    priority: "low" | "medium" | "high" | "critical";
}

// =============================================================================
// INVENTORY SERVICE CLASS
// =============================================================================

export class InventoryService {
    private products: Map<string, Product> = new Map();
    private suppliers: Map<string, Supplier> = new Map();
    private locations: Map<string, Location> = new Map();
    private inventory: Map<string, InventoryItem> = new Map();
    private movements: StockMovement[] = [];
    private purchaseOrders: Map<string, PurchaseOrder> = new Map();
    private goodsReceipts: Map<string, GoodsReceipt> = new Map();
    private stockCounts: Map<string, StockCount> = new Map();
    private alerts: Map<string, StockAlert> = new Map();

    private orderCounter = 1000;
    private receiptCounter = 1000;
    private countCounter = 1000;

    // ===========================================================================
    // PRODUCT MANAGEMENT
    // ===========================================================================

    async createProduct(data: Partial<Product>): Promise<Product> {
        const product: Product = {
            id: randomUUID(),
            sku: data.sku || this.generateSKU(data.category || "miscellaneous"),
            name: data.name || "",
            description: data.description || "",
            category: data.category || "miscellaneous",
            unit: data.unit || "piece",
            unitPrice: data.unitPrice || 0,
            costPrice: data.costPrice || 0,
            currency: data.currency || "EUR",
            taxRate: data.taxRate || 0.21,
            images: data.images || [],
            attributes: data.attributes || {},
            isActive: true,
            isSerialTracked: data.isSerialTracked || false,
            isBatchTracked: data.isBatchTracked || false,
            hasExpiry: data.hasExpiry || false,
            minStockLevel: data.minStockLevel || 5,
            reorderPoint: data.reorderPoint || 10,
            reorderQuantity: data.reorderQuantity || 20,
            leadTimeDays: data.leadTimeDays || 7,
            tags: data.tags || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.products.set(product.id, product);
        return product;
    }

    async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
        const product = this.products.get(id);
        if (!product) return null;

        const updated = { ...product, ...data, updatedAt: new Date() };
        this.products.set(id, updated);
        return updated;
    }

    async getProduct(id: string): Promise<Product | null> {
        return this.products.get(id) || null;
    }

    async getProductBySKU(sku: string): Promise<Product | null> {
        for (const product of this.products.values()) {
            if (product.sku === sku) return product;
        }
        return null;
    }

    async searchProducts(query: string, category?: ProductCategory): Promise<Product[]> {
        let results = Array.from(this.products.values());

        if (query) {
            const q = query.toLowerCase();
            results = results.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.barcode?.includes(q) ||
                p.description.toLowerCase().includes(q)
            );
        }

        if (category) {
            results = results.filter(p => p.category === category);
        }

        return results;
    }

    async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
        return Array.from(this.products.values()).filter(p => p.category === category);
    }

    private generateSKU(category: string): string {
        const prefix = category.substring(0, 3).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${random}`;
    }

    // ===========================================================================
    // SUPPLIER MANAGEMENT
    // ===========================================================================

    async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
        const supplier: Supplier = {
            id: randomUUID(),
            code: data.code || this.generateSupplierCode(),
            name: data.name || "",
            contactName: data.contactName || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || { street: "", city: "", postalCode: "", country: "" },
            paymentTerms: data.paymentTerms || { type: "net", netDays: 30 },
            currency: data.currency || "EUR",
            rating: 0,
            status: "active",
            categories: data.categories || [],
            leadTimeDays: data.leadTimeDays || 7,
            minimumOrder: data.minimumOrder || 0,
            documents: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.suppliers.set(supplier.id, supplier);
        return supplier;
    }

    async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
        const supplier = this.suppliers.get(id);
        if (!supplier) return null;

        const updated = { ...supplier, ...data, updatedAt: new Date() };
        this.suppliers.set(id, updated);
        return updated;
    }

    async getSupplier(id: string): Promise<Supplier | null> {
        return this.suppliers.get(id) || null;
    }

    async getSuppliers(status?: "active" | "inactive"): Promise<Supplier[]> {
        let suppliers = Array.from(this.suppliers.values());
        if (status) {
            suppliers = suppliers.filter(s => s.status === status);
        }
        return suppliers;
    }

    async getSuppliersByCategory(category: ProductCategory): Promise<Supplier[]> {
        return Array.from(this.suppliers.values()).filter(
            s => s.status === "active" && s.categories.includes(category)
        );
    }

    async rateSupplier(id: string, rating: number): Promise<void> {
        const supplier = this.suppliers.get(id);
        if (supplier) {
            supplier.rating = Math.max(0, Math.min(5, rating));
            supplier.updatedAt = new Date();
        }
    }

    private generateSupplierCode(): string {
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `SUP-${random}`;
    }

    // ===========================================================================
    // LOCATION MANAGEMENT
    // ===========================================================================

    async createLocation(data: Partial<Location>): Promise<Location> {
        const location: Location = {
            id: randomUUID(),
            code: data.code || this.generateLocationCode(),
            name: data.name || "",
            type: data.type || "warehouse",
            isDefault: data.isDefault || false,
            isActive: true,
            zones: data.zones || [],
            createdAt: new Date(),
            ...data
        };

        // Only one default location
        if (location.isDefault) {
            for (const loc of this.locations.values()) {
                loc.isDefault = false;
            }
        }

        this.locations.set(location.id, location);
        return location;
    }

    async getLocation(id: string): Promise<Location | null> {
        return this.locations.get(id) || null;
    }

    async getLocations(): Promise<Location[]> {
        return Array.from(this.locations.values()).filter(l => l.isActive);
    }

    async getDefaultLocation(): Promise<Location | null> {
        for (const location of this.locations.values()) {
            if (location.isDefault && location.isActive) return location;
        }
        return null;
    }

    async addZone(locationId: string, zone: Omit<StorageZone, "id">): Promise<StorageZone | null> {
        const location = this.locations.get(locationId);
        if (!location) return null;

        const newZone: StorageZone = {
            id: randomUUID(),
            ...zone
        };

        location.zones.push(newZone);
        return newZone;
    }

    private generateLocationCode(): string {
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `LOC-${random}`;
    }

    // ===========================================================================
    // INVENTORY OPERATIONS
    // ===========================================================================

    async getInventory(productId: string, locationId?: string): Promise<InventoryItem[]> {
        let items = Array.from(this.inventory.values()).filter(
            i => i.productId === productId
        );

        if (locationId) {
            items = items.filter(i => i.locationId === locationId);
        }

        return items;
    }

    async getStockLevel(productId: string, locationId?: string): Promise<{
        total: number;
        available: number;
        reserved: number;
        byLocation: Array<{ locationId: string; quantity: number }>;
    }> {
        const items = await this.getInventory(productId, locationId);

        let total = 0;
        let available = 0;
        let reserved = 0;
        const byLocation: Array<{ locationId: string; quantity: number }> = [];

        const locationTotals = new Map<string, number>();

        for (const item of items) {
            total += item.quantity;
            available += item.availableQuantity;
            reserved += item.reservedQuantity;

            const current = locationTotals.get(item.locationId) || 0;
            locationTotals.set(item.locationId, current + item.quantity);
        }

        for (const [locationId, quantity] of locationTotals) {
            byLocation.push({ locationId, quantity });
        }

        return { total, available, reserved, byLocation };
    }

    async receiveStock(params: {
        productId: string;
        variantId?: string;
        locationId: string;
        zoneId?: string;
        quantity: number;
        batchNumber?: string;
        serialNumber?: string;
        lotNumber?: string;
        expiryDate?: Date;
        costPrice: number;
        referenceType?: string;
        referenceId?: string;
        performedBy: string;
        notes?: string;
    }): Promise<InventoryItem> {
        const key = this.getInventoryKey(params.productId, params.variantId, params.locationId, params.batchNumber, params.lotNumber);

        let item = this.inventory.get(key);

        if (item) {
            item.quantity += params.quantity;
            item.availableQuantity += params.quantity;
            item.updatedAt = new Date();
        } else {
            item = {
                id: randomUUID(),
                productId: params.productId,
                variantId: params.variantId,
                locationId: params.locationId,
                zoneId: params.zoneId,
                quantity: params.quantity,
                reservedQuantity: 0,
                availableQuantity: params.quantity,
                batchNumber: params.batchNumber,
                serialNumber: params.serialNumber,
                lotNumber: params.lotNumber,
                expiryDate: params.expiryDate,
                receivedDate: new Date(),
                costPrice: params.costPrice,
                updatedAt: new Date()
            };
            this.inventory.set(key, item);
        }

        // Record movement
        await this.recordMovement({
            type: "receive",
            productId: params.productId,
            variantId: params.variantId,
            toLocationId: params.locationId,
            quantity: params.quantity,
            batchNumber: params.batchNumber,
            serialNumber: params.serialNumber,
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            costPrice: params.costPrice,
            notes: params.notes,
            performedBy: params.performedBy
        });

        // Check and clear any out-of-stock alerts
        await this.resolveAlerts(params.productId, params.locationId, ["out_of_stock", "low_stock"]);

        return item;
    }

    async issueStock(params: {
        productId: string;
        variantId?: string;
        locationId: string;
        quantity: number;
        batchNumber?: string;
        referenceType?: string;
        referenceId?: string;
        reason?: string;
        performedBy: string;
    }): Promise<{ success: boolean; error?: string }> {
        const items = await this.getInventory(params.productId, params.locationId);

        let availableToIssue = items.filter(i =>
            (!params.batchNumber || i.batchNumber === params.batchNumber) &&
            i.availableQuantity > 0
        );

        // Sort by expiry date (FEFO) or received date (FIFO)
        availableToIssue.sort((a, b) => {
            if (a.expiryDate && b.expiryDate) {
                return a.expiryDate.getTime() - b.expiryDate.getTime();
            }
            return a.receivedDate.getTime() - b.receivedDate.getTime();
        });

        let remaining = params.quantity;
        const totalAvailable = availableToIssue.reduce((sum, i) => sum + i.availableQuantity, 0);

        if (totalAvailable < params.quantity) {
            return { success: false, error: `Insufficient stock. Available: ${totalAvailable}, Requested: ${params.quantity}` };
        }

        for (const item of availableToIssue) {
            if (remaining <= 0) break;

            const toIssue = Math.min(remaining, item.availableQuantity);
            item.quantity -= toIssue;
            item.availableQuantity -= toIssue;
            item.updatedAt = new Date();
            remaining -= toIssue;
        }

        await this.recordMovement({
            type: "issue",
            productId: params.productId,
            variantId: params.variantId,
            fromLocationId: params.locationId,
            quantity: params.quantity,
            batchNumber: params.batchNumber,
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            reason: params.reason,
            performedBy: params.performedBy
        });

        // Check stock levels
        await this.checkStockLevels(params.productId, params.locationId);

        return { success: true };
    }

    async transferStock(params: {
        productId: string;
        variantId?: string;
        fromLocationId: string;
        toLocationId: string;
        quantity: number;
        batchNumber?: string;
        performedBy: string;
        notes?: string;
    }): Promise<{ success: boolean; error?: string }> {
        // Issue from source
        const issueResult = await this.issueStock({
            productId: params.productId,
            variantId: params.variantId,
            locationId: params.fromLocationId,
            quantity: params.quantity,
            batchNumber: params.batchNumber,
            referenceType: "transfer",
            performedBy: params.performedBy
        });

        if (!issueResult.success) {
            return issueResult;
        }

        // Receive at destination
        const product = await this.getProduct(params.productId);
        await this.receiveStock({
            productId: params.productId,
            variantId: params.variantId,
            locationId: params.toLocationId,
            quantity: params.quantity,
            batchNumber: params.batchNumber,
            costPrice: product?.costPrice || 0,
            referenceType: "transfer",
            performedBy: params.performedBy,
            notes: params.notes
        });

        // Record transfer movement
        await this.recordMovement({
            type: "transfer",
            productId: params.productId,
            variantId: params.variantId,
            fromLocationId: params.fromLocationId,
            toLocationId: params.toLocationId,
            quantity: params.quantity,
            batchNumber: params.batchNumber,
            notes: params.notes,
            performedBy: params.performedBy
        });

        return { success: true };
    }

    async adjustStock(params: {
        productId: string;
        variantId?: string;
        locationId: string;
        newQuantity: number;
        reason: string;
        performedBy: string;
    }): Promise<void> {
        const stock = await this.getStockLevel(params.productId, params.locationId);
        const adjustment = params.newQuantity - stock.total;

        if (adjustment === 0) return;

        const key = this.getInventoryKey(params.productId, params.variantId, params.locationId);
        let item = this.inventory.get(key);

        if (item) {
            item.quantity = params.newQuantity;
            item.availableQuantity = params.newQuantity - item.reservedQuantity;
            item.updatedAt = new Date();
        } else {
            const product = await this.getProduct(params.productId);
            item = {
                id: randomUUID(),
                productId: params.productId,
                variantId: params.variantId,
                locationId: params.locationId,
                quantity: params.newQuantity,
                reservedQuantity: 0,
                availableQuantity: params.newQuantity,
                receivedDate: new Date(),
                costPrice: product?.costPrice || 0,
                updatedAt: new Date()
            };
            this.inventory.set(key, item);
        }

        await this.recordMovement({
            type: "adjustment",
            productId: params.productId,
            variantId: params.variantId,
            toLocationId: params.locationId,
            quantity: adjustment,
            reason: params.reason,
            performedBy: params.performedBy
        });

        await this.checkStockLevels(params.productId, params.locationId);
    }

    async reserveStock(productId: string, locationId: string, quantity: number, referenceId: string): Promise<{ success: boolean; error?: string }> {
        const items = await this.getInventory(productId, locationId);

        let totalAvailable = 0;
        for (const item of items) {
            totalAvailable += item.availableQuantity;
        }

        if (totalAvailable < quantity) {
            return { success: false, error: "Insufficient available stock" };
        }

        let remaining = quantity;
        for (const item of items) {
            if (remaining <= 0) break;

            const toReserve = Math.min(remaining, item.availableQuantity);
            item.reservedQuantity += toReserve;
            item.availableQuantity -= toReserve;
            item.updatedAt = new Date();
            remaining -= toReserve;
        }

        return { success: true };
    }

    async releaseReservation(productId: string, locationId: string, quantity: number): Promise<void> {
        const items = await this.getInventory(productId, locationId);

        let remaining = quantity;
        for (const item of items) {
            if (remaining <= 0) break;

            const toRelease = Math.min(remaining, item.reservedQuantity);
            item.reservedQuantity -= toRelease;
            item.availableQuantity += toRelease;
            item.updatedAt = new Date();
            remaining -= toRelease;
        }
    }

    private async recordMovement(movement: Omit<StockMovement, "id" | "createdAt">): Promise<void> {
        this.movements.push({
            id: randomUUID(),
            createdAt: new Date(),
            ...movement
        });
    }

    async getMovements(productId: string, limit?: number): Promise<StockMovement[]> {
        let movements = this.movements.filter(m => m.productId === productId);
        movements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (limit) {
            movements = movements.slice(0, limit);
        }
        return movements;
    }

    private getInventoryKey(productId: string, variantId?: string, locationId?: string, batchNumber?: string, lotNumber?: string): string {
        return [productId, variantId || "", locationId || "", batchNumber || "", lotNumber || ""].join(":");
    }

    // ===========================================================================
    // PURCHASE ORDERS
    // ===========================================================================

    async createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
        const po: PurchaseOrder = {
            id: randomUUID(),
            orderNumber: `PO-${++this.orderCounter}`,
            supplierId: data.supplierId || "",
            locationId: data.locationId || "",
            status: "draft",
            priority: data.priority || "normal",
            items: data.items || [],
            subtotal: 0,
            taxAmount: 0,
            shippingCost: data.shippingCost || 0,
            discount: data.discount || 0,
            total: 0,
            currency: data.currency || "EUR",
            paymentTerms: data.paymentTerms || { type: "net", netDays: 30 },
            paymentStatus: "pending",
            paidAmount: 0,
            shippingAddress: data.shippingAddress || { street: "", city: "", postalCode: "", country: "" },
            attachments: [],
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.calculatePOTotals(po);
        this.purchaseOrders.set(po.id, po);
        return po;
    }

    async addPOItem(purchaseOrderId: string, item: Omit<PurchaseOrderItem, "id" | "receivedQuantity" | "total">): Promise<PurchaseOrder | null> {
        const po = this.purchaseOrders.get(purchaseOrderId);
        if (!po || po.status !== "draft") return null;

        const newItem: PurchaseOrderItem = {
            id: randomUUID(),
            receivedQuantity: 0,
            total: (item.quantity * item.unitPrice) * (1 - item.discount / 100) * (1 + item.taxRate),
            ...item
        };

        po.items.push(newItem);
        this.calculatePOTotals(po);
        po.updatedAt = new Date();

        return po;
    }

    async updatePOItem(purchaseOrderId: string, itemId: string, data: Partial<PurchaseOrderItem>): Promise<PurchaseOrder | null> {
        const po = this.purchaseOrders.get(purchaseOrderId);
        if (!po || po.status !== "draft") return null;

        const item = po.items.find(i => i.id === itemId);
        if (!item) return null;

        Object.assign(item, data);
        item.total = (item.quantity * item.unitPrice) * (1 - item.discount / 100) * (1 + item.taxRate);

        this.calculatePOTotals(po);
        po.updatedAt = new Date();

        return po;
    }

    async removePOItem(purchaseOrderId: string, itemId: string): Promise<PurchaseOrder | null> {
        const po = this.purchaseOrders.get(purchaseOrderId);
        if (!po || po.status !== "draft") return null;

        po.items = po.items.filter(i => i.id !== itemId);
        this.calculatePOTotals(po);
        po.updatedAt = new Date();

        return po;
    }

    private calculatePOTotals(po: PurchaseOrder): void {
        let subtotal = 0;
        let taxAmount = 0;

        for (const item of po.items) {
            const itemSubtotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
            subtotal += itemSubtotal;
            taxAmount += itemSubtotal * item.taxRate;
        }

        po.subtotal = subtotal;
        po.taxAmount = taxAmount;
        po.total = subtotal + taxAmount + po.shippingCost - po.discount;
    }

    async submitPOForApproval(id: string): Promise<PurchaseOrder | null> {
        const po = this.purchaseOrders.get(id);
        if (!po || po.status !== "draft") return null;

        po.status = "pending_approval";
        po.updatedAt = new Date();
        return po;
    }

    async approvePO(id: string, approverId: string): Promise<PurchaseOrder | null> {
        const po = this.purchaseOrders.get(id);
        if (!po || po.status !== "pending_approval") return null;

        po.status = "approved";
        po.approvedBy = approverId;
        po.approvedAt = new Date();
        po.updatedAt = new Date();
        return po;
    }

    async sendPO(id: string): Promise<PurchaseOrder | null> {
        const po = this.purchaseOrders.get(id);
        if (!po || po.status !== "approved") return null;

        po.status = "ordered";
        po.updatedAt = new Date();

        // In production, would send email to supplier
        return po;
    }

    async cancelPO(id: string): Promise<PurchaseOrder | null> {
        const po = this.purchaseOrders.get(id);
        if (!po || ["received", "cancelled"].includes(po.status)) return null;

        po.status = "cancelled";
        po.updatedAt = new Date();
        return po;
    }

    async getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
        return this.purchaseOrders.get(id) || null;
    }

    async getPurchaseOrders(filters?: {
        status?: PurchaseOrderStatus;
        supplierId?: string;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<PurchaseOrder[]> {
        let orders = Array.from(this.purchaseOrders.values());

        if (filters) {
            if (filters.status) {
                orders = orders.filter(o => o.status === filters.status);
            }
            if (filters.supplierId) {
                orders = orders.filter(o => o.supplierId === filters.supplierId);
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

    // ===========================================================================
    // GOODS RECEIPT
    // ===========================================================================

    async createGoodsReceipt(purchaseOrderId: string, receivedBy: string): Promise<GoodsReceipt> {
        const po = this.purchaseOrders.get(purchaseOrderId);
        if (!po) throw new Error("Purchase order not found");

        const receipt: GoodsReceipt = {
            id: randomUUID(),
            receiptNumber: `GR-${++this.receiptCounter}`,
            purchaseOrderId,
            supplierId: po.supplierId,
            locationId: po.locationId,
            status: "pending",
            items: po.items.map(item => ({
                id: randomUUID(),
                purchaseOrderItemId: item.id,
                productId: item.productId,
                variantId: item.variantId,
                expectedQuantity: item.quantity - item.receivedQuantity,
                receivedQuantity: 0,
                acceptedQuantity: 0,
                rejectedQuantity: 0
            })),
            receivedBy,
            receivedAt: new Date(),
            documents: []
        };

        this.goodsReceipts.set(receipt.id, receipt);
        return receipt;
    }

    async updateReceiptItem(receiptId: string, itemId: string, data: {
        receivedQuantity: number;
        acceptedQuantity: number;
        rejectedQuantity?: number;
        rejectionReason?: string;
        batchNumber?: string;
        lotNumber?: string;
        expiryDate?: Date;
        zoneId?: string;
    }): Promise<GoodsReceipt | null> {
        const receipt = this.goodsReceipts.get(receiptId);
        if (!receipt || receipt.status === "completed") return null;

        const item = receipt.items.find(i => i.id === itemId);
        if (!item) return null;

        Object.assign(item, data);
        item.rejectedQuantity = data.receivedQuantity - data.acceptedQuantity;

        return receipt;
    }

    async completeGoodsReceipt(id: string, inspectedBy: string): Promise<GoodsReceipt | null> {
        const receipt = this.goodsReceipts.get(id);
        if (!receipt) return null;

        const po = this.purchaseOrders.get(receipt.purchaseOrderId);
        if (!po) return null;

        // Process each item
        for (const item of receipt.items) {
            if (item.acceptedQuantity > 0) {
                const product = await this.getProduct(item.productId);
                const poItem = po.items.find(i => i.id === item.purchaseOrderItemId);

                await this.receiveStock({
                    productId: item.productId,
                    variantId: item.variantId,
                    locationId: receipt.locationId,
                    zoneId: item.zoneId,
                    quantity: item.acceptedQuantity,
                    batchNumber: item.batchNumber,
                    lotNumber: item.lotNumber,
                    expiryDate: item.expiryDate,
                    costPrice: poItem?.unitPrice || product?.costPrice || 0,
                    referenceType: "goods_receipt",
                    referenceId: receipt.id,
                    performedBy: inspectedBy
                });

                // Update PO item received quantity
                if (poItem) {
                    poItem.receivedQuantity += item.acceptedQuantity;
                }
            }
        }

        // Update PO status
        const allReceived = po.items.every(i => i.receivedQuantity >= i.quantity);
        if (allReceived) {
            po.status = "received";
            po.actualDelivery = new Date();
        } else {
            po.status = "partially_received";
        }
        po.updatedAt = new Date();

        receipt.status = "completed";
        receipt.inspectedBy = inspectedBy;
        receipt.inspectedAt = new Date();

        return receipt;
    }

    // ===========================================================================
    // STOCK COUNTING
    // ===========================================================================

    async createStockCount(data: {
        locationId: string;
        zoneId?: string;
        type: StockCount["type"];
        scheduledAt: Date;
        productIds?: string[];
    }): Promise<StockCount> {
        const items: StockCountItem[] = [];

        // Get inventory items to count
        let inventoryItems = Array.from(this.inventory.values()).filter(
            i => i.locationId === data.locationId
        );

        if (data.zoneId) {
            inventoryItems = inventoryItems.filter(i => i.zoneId === data.zoneId);
        }

        if (data.productIds?.length) {
            inventoryItems = inventoryItems.filter(i => data.productIds!.includes(i.productId));
        }

        // Group by product
        const productQuantities = new Map<string, number>();
        for (const item of inventoryItems) {
            const key = item.productId + (item.variantId || "");
            const current = productQuantities.get(key) || 0;
            productQuantities.set(key, current + item.quantity);
        }

        for (const [key, quantity] of productQuantities) {
            items.push({
                id: randomUUID(),
                productId: key,
                expectedQuantity: quantity,
                variance: 0,
                varianceValue: 0,
                status: "pending"
            });
        }

        const count: StockCount = {
            id: randomUUID(),
            countNumber: `SC-${++this.countCounter}`,
            locationId: data.locationId,
            zoneId: data.zoneId,
            type: data.type,
            status: "planned",
            items,
            scheduledAt: data.scheduledAt,
            discrepancyCount: 0,
            discrepancyValue: 0
        };

        this.stockCounts.set(count.id, count);
        return count;
    }

    async startStockCount(id: string, countedBy: string): Promise<StockCount | null> {
        const count = this.stockCounts.get(id);
        if (!count || count.status !== "planned") return null;

        count.status = "in_progress";
        count.startedAt = new Date();
        count.countedBy = countedBy;

        return count;
    }

    async recordCount(countId: string, itemId: string, countedQuantity: number, notes?: string): Promise<StockCountItem | null> {
        const count = this.stockCounts.get(countId);
        if (!count || count.status !== "in_progress") return null;

        const item = count.items.find(i => i.id === itemId);
        if (!item) return null;

        const product = await this.getProduct(item.productId);

        item.countedQuantity = countedQuantity;
        item.variance = countedQuantity - item.expectedQuantity;
        item.varianceValue = item.variance * (product?.costPrice || 0);
        item.status = "counted";
        item.notes = notes;

        // Update count totals
        count.discrepancyCount = count.items.filter(i => i.variance !== 0).length;
        count.discrepancyValue = count.items.reduce((sum, i) => sum + Math.abs(i.varianceValue), 0);

        return item;
    }

    async completeStockCount(id: string, verifiedBy: string, autoAdjust: boolean): Promise<StockCount | null> {
        const count = this.stockCounts.get(id);
        if (!count || count.status !== "in_progress") return null;

        // Verify all items are counted
        const uncounted = count.items.filter(i => i.status === "pending");
        if (uncounted.length > 0) {
            throw new Error(`${uncounted.length} items not yet counted`);
        }

        if (autoAdjust) {
            for (const item of count.items) {
                if (item.variance !== 0 && item.countedQuantity !== undefined) {
                    await this.adjustStock({
                        productId: item.productId,
                        locationId: count.locationId,
                        newQuantity: item.countedQuantity,
                        reason: `Stock count adjustment (${count.countNumber})`,
                        performedBy: verifiedBy
                    });
                    item.status = "adjusted";
                } else {
                    item.status = "verified";
                }
            }
        } else {
            for (const item of count.items) {
                item.status = "verified";
            }
        }

        count.status = "completed";
        count.completedAt = new Date();
        count.verifiedBy = verifiedBy;

        return count;
    }

    // ===========================================================================
    // ALERTS & REORDER
    // ===========================================================================

    async checkStockLevels(productId: string, locationId: string): Promise<void> {
        const product = await this.getProduct(productId);
        if (!product) return;

        const stock = await this.getStockLevel(productId, locationId);
        const now = new Date();

        // Check for out of stock
        if (stock.total === 0) {
            await this.createAlert({
                type: "out_of_stock",
                productId,
                locationId,
                priority: "critical",
                message: `${product.name} is out of stock`,
                currentValue: 0
            });
        }
        // Check for low stock
        else if (stock.total <= product.minStockLevel) {
            await this.createAlert({
                type: "low_stock",
                productId,
                locationId,
                priority: "high",
                message: `${product.name} is running low (${stock.total} remaining)`,
                threshold: product.minStockLevel,
                currentValue: stock.total
            });
        }
        // Check for reorder point
        else if (stock.total <= product.reorderPoint) {
            await this.createAlert({
                type: "reorder_point",
                productId,
                locationId,
                priority: "medium",
                message: `${product.name} has reached reorder point`,
                threshold: product.reorderPoint,
                currentValue: stock.total
            });
        }
    }

    async checkExpiringItems(): Promise<void> {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const now = new Date();

        for (const item of this.inventory.values()) {
            if (!item.expiryDate) continue;

            const product = await this.getProduct(item.productId);
            if (!product) continue;

            if (item.expiryDate < now) {
                await this.createAlert({
                    type: "expired",
                    productId: item.productId,
                    locationId: item.locationId,
                    priority: "critical",
                    message: `${product.name} has expired (${item.quantity} units)`,
                    currentValue: item.quantity
                });
            } else if (item.expiryDate < thirtyDaysFromNow) {
                await this.createAlert({
                    type: "expiring_soon",
                    productId: item.productId,
                    locationId: item.locationId,
                    priority: "high",
                    message: `${product.name} expires on ${item.expiryDate.toDateString()} (${item.quantity} units)`,
                    currentValue: item.quantity
                });
            }
        }
    }

    private async createAlert(data: Omit<StockAlert, "id" | "status" | "createdAt">): Promise<StockAlert> {
        // Check if similar alert already exists
        for (const alert of this.alerts.values()) {
            if (
                alert.type === data.type &&
                alert.productId === data.productId &&
                alert.locationId === data.locationId &&
                alert.status === "active"
            ) {
                return alert;
            }
        }

        const alert: StockAlert = {
            id: randomUUID(),
            status: "active",
            createdAt: new Date(),
            ...data
        };

        this.alerts.set(alert.id, alert);
        return alert;
    }

    private async resolveAlerts(productId: string, locationId: string, types: StockAlertType[]): Promise<void> {
        for (const alert of this.alerts.values()) {
            if (
                types.includes(alert.type) &&
                alert.productId === productId &&
                alert.locationId === locationId &&
                alert.status === "active"
            ) {
                alert.status = "resolved";
                alert.resolvedAt = new Date();
            }
        }
    }

    async getActiveAlerts(locationId?: string): Promise<StockAlert[]> {
        let alerts = Array.from(this.alerts.values()).filter(a => a.status === "active");

        if (locationId) {
            alerts = alerts.filter(a => a.locationId === locationId);
        }

        return alerts.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    async acknowledgeAlert(id: string, userId: string): Promise<void> {
        const alert = this.alerts.get(id);
        if (alert && alert.status === "active") {
            alert.status = "acknowledged";
            alert.acknowledgedBy = userId;
            alert.acknowledgedAt = new Date();
        }
    }

    async getReorderSuggestions(locationId?: string): Promise<ReorderSuggestion[]> {
        const suggestions: ReorderSuggestion[] = [];

        for (const product of this.products.values()) {
            if (!product.isActive) continue;

            const stock = await this.getStockLevel(product.id, locationId);

            if (stock.total <= product.reorderPoint) {
                const supplier = product.preferredSupplierId
                    ? await this.getSupplier(product.preferredSupplierId)
                    : null;

                let priority: ReorderSuggestion["priority"] = "low";
                if (stock.total === 0) priority = "critical";
                else if (stock.total <= product.minStockLevel) priority = "high";
                else if (stock.total <= product.reorderPoint) priority = "medium";

                suggestions.push({
                    productId: product.id,
                    productName: product.name,
                    currentStock: stock.total,
                    reorderPoint: product.reorderPoint,
                    suggestedQuantity: product.reorderQuantity,
                    preferredSupplierId: product.preferredSupplierId,
                    supplierName: supplier?.name,
                    estimatedCost: product.costPrice * product.reorderQuantity,
                    leadTimeDays: supplier?.leadTimeDays || product.leadTimeDays,
                    priority
                });
            }
        }

        return suggestions.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    async createPOFromSuggestions(suggestions: ReorderSuggestion[], createdBy: string): Promise<PurchaseOrder[]> {
        // Group by supplier
        const bySupplier = new Map<string, ReorderSuggestion[]>();

        for (const suggestion of suggestions) {
            const supplierId = suggestion.preferredSupplierId || "default";
            const group = bySupplier.get(supplierId) || [];
            group.push(suggestion);
            bySupplier.set(supplierId, group);
        }

        const orders: PurchaseOrder[] = [];
        const defaultLocation = await this.getDefaultLocation();

        for (const [supplierId, items] of bySupplier) {
            if (supplierId === "default") continue;

            const supplier = await this.getSupplier(supplierId);
            if (!supplier) continue;

            const po = await this.createPurchaseOrder({
                supplierId,
                locationId: defaultLocation?.id || "",
                priority: items.some(i => i.priority === "critical") ? "urgent" : "normal",
                currency: supplier.currency,
                paymentTerms: supplier.paymentTerms,
                createdBy
            });

            for (const item of items) {
                const product = await this.getProduct(item.productId);
                if (!product) continue;

                await this.addPOItem(po.id, {
                    productId: product.id,
                    sku: product.sku,
                    name: product.name,
                    quantity: item.suggestedQuantity,
                    unitPrice: product.costPrice,
                    discount: 0,
                    taxRate: product.taxRate
                });
            }

            orders.push(this.purchaseOrders.get(po.id)!);
        }

        return orders;
    }

    // ===========================================================================
    // REPORTING
    // ===========================================================================

    async getInventoryValuation(locationId?: string): Promise<{
        totalValue: number;
        totalCost: number;
        totalItems: number;
        byCategory: Record<string, { value: number; cost: number; items: number }>;
        byLocation: Array<{ locationId: string; locationName: string; value: number }>;
    }> {
        let items = Array.from(this.inventory.values());

        if (locationId) {
            items = items.filter(i => i.locationId === locationId);
        }

        let totalValue = 0;
        let totalCost = 0;
        let totalItems = 0;
        const byCategory: Record<string, { value: number; cost: number; items: number }> = {};
        const locationValues = new Map<string, number>();

        for (const item of items) {
            const product = await this.getProduct(item.productId);
            if (!product) continue;

            const value = item.quantity * product.unitPrice;
            const cost = item.quantity * item.costPrice;

            totalValue += value;
            totalCost += cost;
            totalItems += item.quantity;

            // By category
            if (!byCategory[product.category]) {
                byCategory[product.category] = { value: 0, cost: 0, items: 0 };
            }
            byCategory[product.category].value += value;
            byCategory[product.category].cost += cost;
            byCategory[product.category].items += item.quantity;

            // By location
            const current = locationValues.get(item.locationId) || 0;
            locationValues.set(item.locationId, current + value);
        }

        const byLocation: Array<{ locationId: string; locationName: string; value: number }> = [];
        for (const [locId, value] of locationValues) {
            const location = await this.getLocation(locId);
            byLocation.push({
                locationId: locId,
                locationName: location?.name || "Unknown",
                value
            });
        }

        return { totalValue, totalCost, totalItems, byCategory, byLocation };
    }

    async getStockTurnover(productId: string, days: number = 30): Promise<{
        issued: number;
        received: number;
        turnoverRate: number;
        daysOfStock: number;
    }> {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const movements = this.movements.filter(
            m => m.productId === productId && m.createdAt >= cutoff
        );

        let issued = 0;
        let received = 0;

        for (const m of movements) {
            if (m.type === "issue" || m.type === "consumption") {
                issued += m.quantity;
            } else if (m.type === "receive") {
                received += m.quantity;
            }
        }

        const stock = await this.getStockLevel(productId);
        const avgStock = (stock.total + stock.total + received - issued) / 2;
        const turnoverRate = avgStock > 0 ? (issued / avgStock) * (365 / days) : 0;
        const dailyUsage = issued / days;
        const daysOfStock = dailyUsage > 0 ? stock.total / dailyUsage : 999;

        return { issued, received, turnoverRate, daysOfStock };
    }

    async getSupplierPerformance(supplierId: string): Promise<{
        totalOrders: number;
        completedOrders: number;
        onTimeDelivery: number;
        qualityRating: number;
        averageLeadTime: number;
        totalSpent: number;
    }> {
        const orders = Array.from(this.purchaseOrders.values()).filter(
            o => o.supplierId === supplierId
        );

        let completedOrders = 0;
        let onTimeCount = 0;
        let totalLeadTime = 0;
        let totalSpent = 0;

        for (const order of orders) {
            if (order.status === "received") {
                completedOrders++;
                totalSpent += order.total;

                if (order.actualDelivery && order.expectedDelivery) {
                    if (order.actualDelivery <= order.expectedDelivery) {
                        onTimeCount++;
                    }
                    const leadTime = Math.floor(
                        (order.actualDelivery.getTime() - order.createdAt.getTime()) / (24 * 60 * 60 * 1000)
                    );
                    totalLeadTime += leadTime;
                }
            }
        }

        const supplier = await this.getSupplier(supplierId);

        return {
            totalOrders: orders.length,
            completedOrders,
            onTimeDelivery: completedOrders > 0 ? onTimeCount / completedOrders : 0,
            qualityRating: supplier?.rating || 0,
            averageLeadTime: completedOrders > 0 ? totalLeadTime / completedOrders : 0,
            totalSpent
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const inventoryService = new InventoryService();
export default inventoryService;
