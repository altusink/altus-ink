/**
 * ALTUS INK - ENTERPRISE SUBSCRIPTION & BILLING SERVICE
 * Complete subscription management and recurring billing
 * 
 * Features:
 * - Subscription plans
 * - Pricing tiers
 * - Usage-based billing
 * - Invoicing
 * - Payment processing
 * - Dunning management
 * - Revenue recognition
 * - Proration
 * - Coupons and discounts
 * - Subscription analytics
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Plan {
    id: string;
    code: string;
    name: string;
    description: string;
    type: PlanType;
    status: PlanStatus;
    pricing: PlanPricing;
    features: PlanFeature[];
    limits: PlanLimit[];
    metadata: PlanMetadata;
    trial?: TrialConfig;
    addOns: AddOn[];
    createdAt: Date;
    updatedAt: Date;
}

export type PlanType = "subscription" | "one_time" | "usage_based" | "hybrid";
export type PlanStatus = "draft" | "active" | "grandfathered" | "archived";

export interface PlanPricing {
    model: PricingModel;
    currency: string;
    amount: number;
    interval: BillingInterval;
    intervalCount: number;
    usageType?: UsageType;
    tiers?: PricingTier[];
    setupFee?: number;
    minimumCharge?: number;
}

export type PricingModel = "flat" | "tiered" | "volume" | "stairstep" | "per_unit";
export type BillingInterval = "day" | "week" | "month" | "year";
export type UsageType = "metered" | "licensed";

export interface PricingTier {
    id: string;
    upTo: number | "inf";
    unitAmount: number;
    flatAmount?: number;
}

export interface PlanFeature {
    id: string;
    name: string;
    description: string;
    included: boolean;
    limit?: number;
    overage?: OverageConfig;
}

export interface OverageConfig {
    allowed: boolean;
    unitPrice: number;
    maxOverage?: number;
}

export interface PlanLimit {
    resource: string;
    value: number;
    unit: string;
    enforcement: "soft" | "hard";
}

export interface PlanMetadata {
    displayOrder: number;
    isPopular: boolean;
    isEnterprise: boolean;
    badge?: string;
    customFields: Record<string, any>;
}

export interface TrialConfig {
    enabled: boolean;
    duration: number;
    durationUnit: "day" | "week" | "month";
    requirePaymentMethod: boolean;
    gracePeriod?: number;
}

export interface AddOn {
    id: string;
    name: string;
    description: string;
    type: "recurring" | "one_time" | "usage";
    pricing: AddOnPricing;
    isRequired: boolean;
    maxQuantity?: number;
}

export interface AddOnPricing {
    amount: number;
    interval?: BillingInterval;
    usageUnit?: string;
    tiers?: PricingTier[];
}

export interface Subscription {
    id: string;
    customerId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriod: BillingPeriod;
    billing: SubscriptionBilling;
    items: SubscriptionItem[];
    addOns: SubscriptionAddOn[];
    discounts: AppliedDiscount[];
    trial?: SubscriptionTrial;
    cancellation?: CancellationInfo;
    metadata: SubscriptionMetadata;
    scheduledChanges?: ScheduledChange[];
    createdAt: Date;
    updatedAt: Date;
    activatedAt?: Date;
    cancelledAt?: Date;
    endedAt?: Date;
}

export type SubscriptionStatus =
    | "trialing"
    | "active"
    | "past_due"
    | "paused"
    | "cancelled"
    | "expired"
    | "pending";

export interface BillingPeriod {
    start: Date;
    end: Date;
    cycleNumber: number;
}

export interface SubscriptionBilling {
    interval: BillingInterval;
    intervalCount: number;
    dayOfMonth?: number;
    dayOfWeek?: number;
    anchorDate: Date;
    nextBillingDate: Date;
    currency: string;
    collectionMethod: "charge_automatically" | "send_invoice";
    defaultPaymentMethod?: string;
}

export interface SubscriptionItem {
    id: string;
    priceId: string;
    quantity: number;
    unitAmount: number;
    metadata?: Record<string, any>;
}

export interface SubscriptionAddOn {
    id: string;
    addOnId: string;
    quantity: number;
    priceOverride?: number;
}

export interface AppliedDiscount {
    id: string;
    couponId: string;
    couponCode: string;
    type: "percentage" | "fixed" | "trial_extension";
    value: number;
    appliesTo: "subscription" | "item";
    itemId?: string;
    start: Date;
    end?: Date;
    maxRedemptions?: number;
    timesRedeemed: number;
}

export interface SubscriptionTrial {
    start: Date;
    end: Date;
    extended: boolean;
    extensionDays?: number;
    convertedAt?: Date;
}

export interface CancellationInfo {
    reason: CancellationReason;
    feedback?: string;
    requestedAt: Date;
    effectiveAt: Date;
    immediatelyEnd: boolean;
    refundAmount?: number;
    retentionOffered?: boolean;
    retentionAccepted?: boolean;
    cancelledBy: string;
}

export type CancellationReason =
    | "too_expensive"
    | "missing_features"
    | "switched_competitor"
    | "not_using"
    | "technical_issues"
    | "customer_service"
    | "other";

export interface SubscriptionMetadata {
    source: string;
    salesRep?: string;
    referralId?: string;
    customFields: Record<string, any>;
}

export interface ScheduledChange {
    id: string;
    type: "upgrade" | "downgrade" | "cancel" | "add_on" | "quantity";
    effectiveAt: Date;
    changes: Record<string, any>;
    status: "pending" | "applied" | "cancelled";
}

export interface Invoice {
    id: string;
    number: string;
    customerId: string;
    subscriptionId?: string;
    status: InvoiceStatus;
    type: "subscription" | "one_time" | "credit_note";
    currency: string;
    lines: InvoiceLine[];
    subtotal: number;
    discounts: InvoiceDiscount[];
    discountTotal: number;
    taxes: InvoiceTax[];
    taxTotal: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    amountRemaining: number;
    billing: InvoiceBilling;
    payment?: InvoicePayment;
    dunning?: DunningInfo;
    notes?: string;
    memo?: string;
    createdAt: Date;
    dueDate: Date;
    paidAt?: Date;
    voidedAt?: Date;
}

export type InvoiceStatus =
    | "draft"
    | "open"
    | "paid"
    | "past_due"
    | "void"
    | "uncollectible";

export interface InvoiceLine {
    id: string;
    type: "subscription" | "add_on" | "usage" | "adjustment" | "proration";
    description: string;
    quantity: number;
    unitAmount: number;
    amount: number;
    period?: { start: Date; end: Date };
    priceId?: string;
    metadata?: Record<string, any>;
}

export interface InvoiceDiscount {
    couponId: string;
    couponCode: string;
    type: "percentage" | "fixed";
    value: number;
    amount: number;
}

export interface InvoiceTax {
    name: string;
    rate: number;
    amount: number;
    jurisdiction?: string;
}

export interface InvoiceBilling {
    name: string;
    email: string;
    address: BillingAddress;
    taxId?: string;
    companyName?: string;
}

export interface BillingAddress {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

export interface InvoicePayment {
    id: string;
    method: PaymentMethodType;
    amount: number;
    date: Date;
    transactionId?: string;
    status: "pending" | "succeeded" | "failed" | "refunded";
    failureReason?: string;
}

export type PaymentMethodType =
    | "card"
    | "bank_transfer"
    | "direct_debit"
    | "paypal"
    | "crypto"
    | "check";

export interface DunningInfo {
    attempts: DunningAttempt[];
    currentAttempt: number;
    maxAttempts: number;
    nextAttemptAt?: Date;
    finalAttemptAt?: Date;
    status: "active" | "paused" | "exhausted" | "resolved";
}

export interface DunningAttempt {
    attemptNumber: number;
    date: Date;
    type: "payment" | "email" | "sms";
    result: "success" | "failed" | "pending";
    error?: string;
}

export interface Coupon {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: "percentage" | "fixed" | "trial_extension";
    value: number;
    currency?: string;
    duration: "once" | "repeating" | "forever";
    durationMonths?: number;
    maxRedemptions?: number;
    timesRedeemed: number;
    appliesTo: CouponScope;
    restrictions: CouponRestriction[];
    validFrom: Date;
    validUntil?: Date;
    isActive: boolean;
    createdAt: Date;
}

export interface CouponScope {
    type: "all" | "specific_plans" | "specific_products";
    planIds?: string[];
    productIds?: string[];
}

export interface CouponRestriction {
    type: "minimum_amount" | "first_time_only" | "customer_segment" | "usage_limit";
    value: any;
}

export interface UsageRecord {
    id: string;
    subscriptionId: string;
    metricId: string;
    quantity: number;
    timestamp: Date;
    action: "set" | "increment";
    idempotencyKey?: string;
    metadata?: Record<string, any>;
}

export interface UsageMetric {
    id: string;
    name: string;
    code: string;
    description: string;
    unit: string;
    aggregationType: "sum" | "max" | "last" | "count";
    displayName: string;
}

export interface UsageSummary {
    subscriptionId: string;
    period: BillingPeriod;
    metrics: MetricUsage[];
    totalCharge: number;
}

export interface MetricUsage {
    metricId: string;
    metricName: string;
    quantity: number;
    limit?: number;
    percentUsed: number;
    charge: number;
    overageCharge: number;
}

export interface Customer {
    id: string;
    email: string;
    name: string;
    phone?: string;
    metadata: CustomerMetadata;
    billing: CustomerBilling;
    paymentMethods: PaymentMethod[];
    defaultPaymentMethodId?: string;
    subscriptions: string[];
    balance: number;
    taxExempt: boolean;
    taxIds: TaxId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerMetadata {
    source: string;
    segment?: string;
    mrr: number;
    ltv: number;
    riskScore: number;
    customFields: Record<string, any>;
}

export interface CustomerBilling {
    name: string;
    email: string;
    phone?: string;
    address: BillingAddress;
    currency: string;
    invoicePrefix?: string;
}

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    isDefault: boolean;
    details: PaymentMethodDetails;
    createdAt: Date;
    expiresAt?: Date;
}

export interface PaymentMethodDetails {
    card?: CardDetails;
    bankAccount?: BankAccountDetails;
    paypal?: PayPalDetails;
}

export interface CardDetails {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    fingerprint: string;
    funding: "credit" | "debit" | "prepaid";
}

export interface BankAccountDetails {
    bankName: string;
    last4: string;
    accountType: "checking" | "savings";
    routingNumber?: string;
}

export interface PayPalDetails {
    email: string;
    payerId: string;
}

export interface TaxId {
    type: string;
    value: string;
    country: string;
    verified: boolean;
}

export interface RevenueRecognition {
    id: string;
    invoiceId: string;
    subscriptionId: string;
    period: { start: Date; end: Date };
    totalAmount: number;
    recognizedAmount: number;
    deferredAmount: number;
    schedule: RecognitionScheduleItem[];
    status: "pending" | "in_progress" | "completed";
    createdAt: Date;
}

export interface RecognitionScheduleItem {
    date: Date;
    amount: number;
    recognized: boolean;
    recognizedAt?: Date;
}

export interface BillingAnalytics {
    period: { start: Date; end: Date };
    mrr: MRRMetrics;
    arr: number;
    revenue: RevenueMetrics;
    subscriptions: SubscriptionMetrics;
    churn: ChurnMetrics;
    expansion: ExpansionMetrics;
    cohorts: CohortData[];
}

export interface MRRMetrics {
    current: number;
    previous: number;
    growth: number;
    growthRate: number;
    newMRR: number;
    expansionMRR: number;
    contractionMRR: number;
    churnedMRR: number;
    reactivatedMRR: number;
}

export interface RevenueMetrics {
    totalRevenue: number;
    recurringRevenue: number;
    oneTimeRevenue: number;
    usageRevenue: number;
    avgRevenuePerUser: number;
    revenueByPlan: Array<{ planId: string; planName: string; revenue: number }>;
}

export interface SubscriptionMetrics {
    total: number;
    active: number;
    trialing: number;
    pastDue: number;
    cancelled: number;
    newSubscriptions: number;
    cancelledSubscriptions: number;
    upgrades: number;
    downgrades: number;
}

export interface ChurnMetrics {
    rate: number;
    voluntaryChurn: number;
    involuntaryChurn: number;
    byReason: Record<CancellationReason, number>;
    recoveredRevenue: number;
}

export interface ExpansionMetrics {
    upgrades: number;
    upsells: number;
    addOns: number;
    expansionRevenue: number;
    netRevenuRetention: number;
}

export interface CohortData {
    cohort: string;
    customers: number;
    retention: number[];
    revenue: number[];
}

// =============================================================================
// SUBSCRIPTION SERVICE CLASS
// =============================================================================

export class SubscriptionService {
    private plans: Map<string, Plan> = new Map();
    private subscriptions: Map<string, Subscription> = new Map();
    private invoices: Map<string, Invoice> = new Map();
    private coupons: Map<string, Coupon> = new Map();
    private usageRecords: UsageRecord[] = [];
    private usageMetrics: Map<string, UsageMetric> = new Map();
    private customers: Map<string, Customer> = new Map();
    private revenueRecognitions: Map<string, RevenueRecognition> = new Map();

    private invoiceCounter = 1000;

    constructor() {
        this.initializeDefaultPlans();
        this.initializeDefaultMetrics();
        this.initializeDefaultCoupons();
    }

    // ===========================================================================
    // PLAN MANAGEMENT
    // ===========================================================================

    async createPlan(data: Partial<Plan>): Promise<Plan> {
        const plan: Plan = {
            id: randomUUID(),
            code: data.code || `PLAN-${Date.now()}`,
            name: data.name || "New Plan",
            description: data.description || "",
            type: data.type || "subscription",
            status: "draft",
            pricing: data.pricing || {
                model: "flat",
                currency: "EUR",
                amount: 0,
                interval: "month",
                intervalCount: 1
            },
            features: data.features || [],
            limits: data.limits || [],
            metadata: data.metadata || { displayOrder: 0, isPopular: false, isEnterprise: false, customFields: {} },
            addOns: data.addOns || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.plans.set(plan.id, plan);
        return plan;
    }

    async updatePlan(id: string, data: Partial<Plan>): Promise<Plan | null> {
        const plan = this.plans.get(id);
        if (!plan) return null;

        Object.assign(plan, data, { updatedAt: new Date() });
        return plan;
    }

    async getPlan(id: string): Promise<Plan | null> {
        return this.plans.get(id) || null;
    }

    async getPlans(status?: PlanStatus): Promise<Plan[]> {
        let plans = Array.from(this.plans.values());

        if (status) {
            plans = plans.filter(p => p.status === status);
        }

        return plans.sort((a, b) => a.metadata.displayOrder - b.metadata.displayOrder);
    }

    async activatePlan(id: string): Promise<Plan | null> {
        const plan = this.plans.get(id);
        if (!plan) return null;

        plan.status = "active";
        plan.updatedAt = new Date();

        return plan;
    }

    async archivePlan(id: string): Promise<Plan | null> {
        const plan = this.plans.get(id);
        if (!plan) return null;

        plan.status = "archived";
        plan.updatedAt = new Date();

        return plan;
    }

    private initializeDefaultPlans(): void {
        const plans: Partial<Plan>[] = [
            {
                code: "free",
                name: "Free",
                description: "Perfect for getting started",
                type: "subscription",
                status: "active",
                pricing: { model: "flat", currency: "EUR", amount: 0, interval: "month", intervalCount: 1 },
                features: [
                    { id: "bookings", name: "Bookings", description: "Monthly bookings", included: true, limit: 10 },
                    { id: "artists", name: "Artists", description: "Artist profiles", included: true, limit: 1 }
                ],
                metadata: { displayOrder: 1, isPopular: false, isEnterprise: false, customFields: {} }
            },
            {
                code: "starter",
                name: "Starter",
                description: "For small studios",
                type: "subscription",
                status: "active",
                pricing: { model: "flat", currency: "EUR", amount: 29, interval: "month", intervalCount: 1 },
                features: [
                    { id: "bookings", name: "Bookings", description: "Monthly bookings", included: true, limit: 100 },
                    { id: "artists", name: "Artists", description: "Artist profiles", included: true, limit: 5 },
                    { id: "analytics", name: "Analytics", description: "Basic analytics", included: true }
                ],
                trial: { enabled: true, duration: 14, durationUnit: "day", requirePaymentMethod: false },
                metadata: { displayOrder: 2, isPopular: false, isEnterprise: false, customFields: {} }
            },
            {
                code: "professional",
                name: "Professional",
                description: "For growing studios",
                type: "subscription",
                status: "active",
                pricing: { model: "flat", currency: "EUR", amount: 79, interval: "month", intervalCount: 1 },
                features: [
                    { id: "bookings", name: "Bookings", description: "Monthly bookings", included: true, limit: 500 },
                    { id: "artists", name: "Artists", description: "Artist profiles", included: true, limit: 20 },
                    { id: "analytics", name: "Analytics", description: "Advanced analytics", included: true },
                    { id: "crm", name: "CRM", description: "Customer management", included: true },
                    { id: "marketing", name: "Marketing", description: "Marketing tools", included: true }
                ],
                trial: { enabled: true, duration: 14, durationUnit: "day", requirePaymentMethod: true },
                metadata: { displayOrder: 3, isPopular: true, isEnterprise: false, badge: "Most Popular", customFields: {} }
            },
            {
                code: "enterprise",
                name: "Enterprise",
                description: "For large organizations",
                type: "subscription",
                status: "active",
                pricing: { model: "flat", currency: "EUR", amount: 299, interval: "month", intervalCount: 1 },
                features: [
                    { id: "bookings", name: "Bookings", description: "Monthly bookings", included: true },
                    { id: "artists", name: "Artists", description: "Artist profiles", included: true },
                    { id: "analytics", name: "Analytics", description: "Enterprise analytics", included: true },
                    { id: "crm", name: "CRM", description: "Customer management", included: true },
                    { id: "marketing", name: "Marketing", description: "Marketing automation", included: true },
                    { id: "api", name: "API Access", description: "Full API access", included: true },
                    { id: "sla", name: "SLA", description: "99.9% uptime SLA", included: true },
                    { id: "support", name: "Support", description: "Dedicated support", included: true }
                ],
                metadata: { displayOrder: 4, isPopular: false, isEnterprise: true, customFields: {} }
            }
        ];

        for (const plan of plans) {
            this.createPlan(plan);
        }
    }

    // ===========================================================================
    // SUBSCRIPTION MANAGEMENT
    // ===========================================================================

    async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
        const plan = await this.getPlan(data.planId || "");
        if (!plan) throw new Error("Plan not found");

        const now = new Date();
        const trial = plan.trial?.enabled ? {
            start: now,
            end: new Date(now.getTime() + plan.trial.duration * 24 * 60 * 60 * 1000),
            extended: false
        } : undefined;

        const subscription: Subscription = {
            id: randomUUID(),
            customerId: data.customerId || "",
            planId: data.planId || "",
            status: trial ? "trialing" : "active",
            currentPeriod: this.calculateBillingPeriod(now, plan.pricing.interval, plan.pricing.intervalCount),
            billing: {
                interval: plan.pricing.interval,
                intervalCount: plan.pricing.intervalCount,
                anchorDate: now,
                nextBillingDate: trial ? trial.end : this.calculateNextBillingDate(now, plan.pricing.interval, plan.pricing.intervalCount),
                currency: plan.pricing.currency,
                collectionMethod: "charge_automatically"
            },
            items: [{
                id: randomUUID(),
                priceId: plan.id,
                quantity: 1,
                unitAmount: plan.pricing.amount
            }],
            addOns: [],
            discounts: [],
            trial,
            metadata: data.metadata || { source: "api", customFields: {} },
            createdAt: now,
            updatedAt: now,
            activatedAt: trial ? undefined : now,
            ...data
        };

        this.subscriptions.set(subscription.id, subscription);

        // Update customer
        const customer = this.customers.get(subscription.customerId);
        if (customer) {
            customer.subscriptions.push(subscription.id);
            customer.metadata.mrr += plan.pricing.amount;
        }

        return subscription;
    }

    async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | null> {
        const subscription = this.subscriptions.get(id);
        if (!subscription) return null;

        Object.assign(subscription, data, { updatedAt: new Date() });
        return subscription;
    }

    async getSubscription(id: string): Promise<Subscription | null> {
        return this.subscriptions.get(id) || null;
    }

    async getSubscriptions(filters?: {
        customerId?: string;
        planId?: string;
        status?: SubscriptionStatus;
    }): Promise<Subscription[]> {
        let subscriptions = Array.from(this.subscriptions.values());

        if (filters) {
            if (filters.customerId) {
                subscriptions = subscriptions.filter(s => s.customerId === filters.customerId);
            }
            if (filters.planId) {
                subscriptions = subscriptions.filter(s => s.planId === filters.planId);
            }
            if (filters.status) {
                subscriptions = subscriptions.filter(s => s.status === filters.status);
            }
        }

        return subscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async cancelSubscription(id: string, cancellation: Omit<CancellationInfo, "requestedAt">): Promise<Subscription | null> {
        const subscription = this.subscriptions.get(id);
        if (!subscription || subscription.status === "cancelled") return null;

        subscription.cancellation = {
            ...cancellation,
            requestedAt: new Date()
        };

        if (cancellation.immediatelyEnd) {
            subscription.status = "cancelled";
            subscription.cancelledAt = new Date();
            subscription.endedAt = new Date();
        } else {
            // Cancel at end of billing period
            subscription.scheduledChanges = subscription.scheduledChanges || [];
            subscription.scheduledChanges.push({
                id: randomUUID(),
                type: "cancel",
                effectiveAt: subscription.currentPeriod.end,
                changes: {},
                status: "pending"
            });
        }

        subscription.updatedAt = new Date();

        // Update customer MRR
        const plan = await this.getPlan(subscription.planId);
        if (plan) {
            const customer = this.customers.get(subscription.customerId);
            if (customer) {
                customer.metadata.mrr -= plan.pricing.amount;
            }
        }

        return subscription;
    }

    async pauseSubscription(id: string, resumeAt?: Date): Promise<Subscription | null> {
        const subscription = this.subscriptions.get(id);
        if (!subscription || subscription.status !== "active") return null;

        subscription.status = "paused";
        subscription.updatedAt = new Date();

        if (resumeAt) {
            subscription.scheduledChanges = subscription.scheduledChanges || [];
            subscription.scheduledChanges.push({
                id: randomUUID(),
                type: "cancel",
                effectiveAt: resumeAt,
                changes: { status: "active" },
                status: "pending"
            });
        }

        return subscription;
    }

    async resumeSubscription(id: string): Promise<Subscription | null> {
        const subscription = this.subscriptions.get(id);
        if (!subscription || subscription.status !== "paused") return null;

        subscription.status = "active";
        subscription.updatedAt = new Date();

        return subscription;
    }

    async changePlan(subscriptionId: string, newPlanId: string, prorate: boolean = true): Promise<Subscription | null> {
        const subscription = this.subscriptions.get(subscriptionId);
        const newPlan = await this.getPlan(newPlanId);

        if (!subscription || !newPlan) return null;

        const oldPlan = await this.getPlan(subscription.planId);

        if (prorate && oldPlan) {
            // Calculate proration
            const daysRemaining = this.getDaysRemaining(subscription.currentPeriod.end);
            const totalDays = this.getTotalDays(subscription.currentPeriod.start, subscription.currentPeriod.end);
            const prorationFactor = daysRemaining / totalDays;

            const credit = oldPlan.pricing.amount * prorationFactor;
            const charge = newPlan.pricing.amount * prorationFactor;
            const netAmount = charge - credit;

            // Create prorated invoice if needed
            if (Math.abs(netAmount) > 0.01) {
                await this.createInvoice({
                    customerId: subscription.customerId,
                    subscriptionId: subscription.id,
                    type: netAmount > 0 ? "one_time" : "credit_note",
                    lines: [
                        {
                            id: randomUUID(),
                            type: "proration",
                            description: `Proration for plan change from ${oldPlan.name} to ${newPlan.name}`,
                            quantity: 1,
                            unitAmount: Math.abs(netAmount),
                            amount: Math.abs(netAmount),
                            period: { start: new Date(), end: subscription.currentPeriod.end }
                        }
                    ]
                });
            }
        }

        // Update subscription
        subscription.planId = newPlanId;
        subscription.items = [{
            id: randomUUID(),
            priceId: newPlan.id,
            quantity: 1,
            unitAmount: newPlan.pricing.amount
        }];
        subscription.billing.interval = newPlan.pricing.interval;
        subscription.billing.intervalCount = newPlan.pricing.intervalCount;
        subscription.updatedAt = new Date();

        // Update customer MRR
        const customer = this.customers.get(subscription.customerId);
        if (customer && oldPlan) {
            customer.metadata.mrr = customer.metadata.mrr - oldPlan.pricing.amount + newPlan.pricing.amount;
        }

        return subscription;
    }

    async addAddOn(subscriptionId: string, addOnId: string, quantity: number = 1): Promise<Subscription | null> {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) return null;

        const plan = await this.getPlan(subscription.planId);
        const addOn = plan?.addOns.find(a => a.id === addOnId);
        if (!addOn) return null;

        const existing = subscription.addOns.find(a => a.addOnId === addOnId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            subscription.addOns.push({
                id: randomUUID(),
                addOnId,
                quantity
            });
        }

        subscription.updatedAt = new Date();
        return subscription;
    }

    async removeAddOn(subscriptionId: string, addOnId: string): Promise<Subscription | null> {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) return null;

        subscription.addOns = subscription.addOns.filter(a => a.addOnId !== addOnId);
        subscription.updatedAt = new Date();

        return subscription;
    }

    private calculateBillingPeriod(start: Date, interval: BillingInterval, intervalCount: number): BillingPeriod {
        const end = new Date(start);

        switch (interval) {
            case "day": end.setDate(end.getDate() + intervalCount); break;
            case "week": end.setDate(end.getDate() + 7 * intervalCount); break;
            case "month": end.setMonth(end.getMonth() + intervalCount); break;
            case "year": end.setFullYear(end.getFullYear() + intervalCount); break;
        }

        return { start, end, cycleNumber: 1 };
    }

    private calculateNextBillingDate(from: Date, interval: BillingInterval, intervalCount: number): Date {
        const next = new Date(from);

        switch (interval) {
            case "day": next.setDate(next.getDate() + intervalCount); break;
            case "week": next.setDate(next.getDate() + 7 * intervalCount); break;
            case "month": next.setMonth(next.getMonth() + intervalCount); break;
            case "year": next.setFullYear(next.getFullYear() + intervalCount); break;
        }

        return next;
    }

    private getDaysRemaining(end: Date): number {
        return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    }

    private getTotalDays(start: Date, end: Date): number {
        return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    }

    // ===========================================================================
    // INVOICE MANAGEMENT
    // ===========================================================================

    async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
        const lines = data.lines || [];
        const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
        const discountTotal = data.discounts?.reduce((sum, d) => sum + d.amount, 0) || 0;
        const taxTotal = data.taxes?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const total = subtotal - discountTotal + taxTotal;

        const invoice: Invoice = {
            id: randomUUID(),
            number: `INV-${++this.invoiceCounter}`,
            customerId: data.customerId || "",
            subscriptionId: data.subscriptionId,
            status: "draft",
            type: data.type || "subscription",
            currency: data.currency || "EUR",
            lines,
            subtotal,
            discounts: data.discounts || [],
            discountTotal,
            taxes: data.taxes || [],
            taxTotal,
            total,
            amountPaid: 0,
            amountDue: total,
            amountRemaining: total,
            billing: data.billing || {
                name: "",
                email: "",
                address: { line1: "", city: "", postalCode: "", country: "" }
            },
            notes: data.notes,
            createdAt: new Date(),
            dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ...data
        };

        this.invoices.set(invoice.id, invoice);
        return invoice;
    }

    async finalizeInvoice(id: string): Promise<Invoice | null> {
        const invoice = this.invoices.get(id);
        if (!invoice || invoice.status !== "draft") return null;

        invoice.status = "open";
        return invoice;
    }

    async payInvoice(id: string, payment: Omit<InvoicePayment, "id">): Promise<Invoice | null> {
        const invoice = this.invoices.get(id);
        if (!invoice || ["paid", "void"].includes(invoice.status)) return null;

        invoice.payment = {
            id: randomUUID(),
            ...payment
        };

        if (payment.status === "succeeded") {
            invoice.amountPaid += payment.amount;
            invoice.amountRemaining = invoice.total - invoice.amountPaid;

            if (invoice.amountRemaining <= 0) {
                invoice.status = "paid";
                invoice.paidAt = new Date();
            }
        }

        return invoice;
    }

    async voidInvoice(id: string): Promise<Invoice | null> {
        const invoice = this.invoices.get(id);
        if (!invoice || invoice.status === "paid") return null;

        invoice.status = "void";
        invoice.voidedAt = new Date();

        return invoice;
    }

    async getInvoice(id: string): Promise<Invoice | null> {
        return this.invoices.get(id) || null;
    }

    async getInvoices(filters?: {
        customerId?: string;
        subscriptionId?: string;
        status?: InvoiceStatus;
    }): Promise<Invoice[]> {
        let invoices = Array.from(this.invoices.values());

        if (filters) {
            if (filters.customerId) {
                invoices = invoices.filter(i => i.customerId === filters.customerId);
            }
            if (filters.subscriptionId) {
                invoices = invoices.filter(i => i.subscriptionId === filters.subscriptionId);
            }
            if (filters.status) {
                invoices = invoices.filter(i => i.status === filters.status);
            }
        }

        return invoices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // ===========================================================================
    // COUPON MANAGEMENT
    // ===========================================================================

    async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
        const coupon: Coupon = {
            id: randomUUID(),
            code: data.code || this.generateCouponCode(),
            name: data.name || "",
            type: data.type || "percentage",
            value: data.value || 0,
            duration: data.duration || "once",
            timesRedeemed: 0,
            appliesTo: data.appliesTo || { type: "all" },
            restrictions: data.restrictions || [],
            validFrom: data.validFrom || new Date(),
            isActive: true,
            createdAt: new Date(),
            ...data
        };

        this.coupons.set(coupon.id, coupon);
        return coupon;
    }

    async getCoupon(id: string): Promise<Coupon | null> {
        return this.coupons.get(id) || null;
    }

    async getCouponByCode(code: string): Promise<Coupon | null> {
        for (const coupon of this.coupons.values()) {
            if (coupon.code.toUpperCase() === code.toUpperCase()) {
                return coupon;
            }
        }
        return null;
    }

    async applyCoupon(subscriptionId: string, couponCode: string): Promise<Subscription | null> {
        const subscription = this.subscriptions.get(subscriptionId);
        const coupon = await this.getCouponByCode(couponCode);

        if (!subscription || !coupon) return null;
        if (!coupon.isActive) throw new Error("Coupon is not active");
        if (coupon.validUntil && coupon.validUntil < new Date()) throw new Error("Coupon has expired");
        if (coupon.maxRedemptions && coupon.timesRedeemed >= coupon.maxRedemptions) {
            throw new Error("Coupon has reached maximum redemptions");
        }

        const discount: AppliedDiscount = {
            id: randomUUID(),
            couponId: coupon.id,
            couponCode: coupon.code,
            type: coupon.type === "trial_extension" ? "trial_extension" : coupon.type,
            value: coupon.value,
            appliesTo: "subscription",
            start: new Date(),
            end: coupon.duration === "once" ? subscription.billing.nextBillingDate :
                coupon.duration === "repeating" && coupon.durationMonths
                    ? new Date(Date.now() + coupon.durationMonths * 30 * 24 * 60 * 60 * 1000)
                    : undefined,
            timesRedeemed: 0
        };

        subscription.discounts.push(discount);
        subscription.updatedAt = new Date();

        coupon.timesRedeemed++;

        return subscription;
    }

    private generateCouponCode(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    private initializeDefaultCoupons(): void {
        const coupons: Partial<Coupon>[] = [
            { code: "WELCOME10", name: "Welcome 10%", type: "percentage", value: 10, duration: "once" },
            { code: "ANNUAL20", name: "Annual 20%", type: "percentage", value: 20, duration: "forever" },
            { code: "TRIALEXT", name: "Extended Trial", type: "trial_extension", value: 14, duration: "once" }
        ];

        for (const coupon of coupons) {
            this.createCoupon(coupon);
        }
    }

    // ===========================================================================
    // USAGE TRACKING
    // ===========================================================================

    async recordUsage(data: Omit<UsageRecord, "id" | "timestamp">): Promise<UsageRecord> {
        const record: UsageRecord = {
            id: randomUUID(),
            timestamp: new Date(),
            ...data
        };

        this.usageRecords.push(record);
        return record;
    }

    async getUsageSummary(subscriptionId: string, period?: BillingPeriod): Promise<UsageSummary> {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) throw new Error("Subscription not found");

        const billingPeriod = period || subscription.currentPeriod;

        const records = this.usageRecords.filter(r =>
            r.subscriptionId === subscriptionId &&
            r.timestamp >= billingPeriod.start &&
            r.timestamp <= billingPeriod.end
        );

        const metricUsage: Map<string, number> = new Map();

        for (const record of records) {
            const current = metricUsage.get(record.metricId) || 0;
            if (record.action === "increment") {
                metricUsage.set(record.metricId, current + record.quantity);
            } else {
                metricUsage.set(record.metricId, record.quantity);
            }
        }

        const metrics: MetricUsage[] = [];
        let totalCharge = 0;

        for (const [metricId, quantity] of metricUsage.entries()) {
            const metric = this.usageMetrics.get(metricId);
            if (!metric) continue;

            // Calculate charge based on plan
            const charge = quantity * 0.01; // Simplified pricing
            const overageCharge = 0;

            totalCharge += charge + overageCharge;

            metrics.push({
                metricId,
                metricName: metric.name,
                quantity,
                percentUsed: 100,
                charge,
                overageCharge
            });
        }

        return {
            subscriptionId,
            period: billingPeriod,
            metrics,
            totalCharge
        };
    }

    private initializeDefaultMetrics(): void {
        const metrics: Partial<UsageMetric>[] = [
            { code: "api_calls", name: "API Calls", unit: "calls", aggregationType: "sum", displayName: "API Requests" },
            { code: "storage", name: "Storage", unit: "GB", aggregationType: "max", displayName: "Storage Used" },
            { code: "bookings", name: "Bookings", unit: "bookings", aggregationType: "count", displayName: "Total Bookings" },
            { code: "emails", name: "Emails", unit: "emails", aggregationType: "sum", displayName: "Emails Sent" }
        ];

        for (const metric of metrics) {
            const usageMetric: UsageMetric = {
                id: randomUUID(),
                name: metric.name || "",
                code: metric.code || "",
                description: "",
                unit: metric.unit || "",
                aggregationType: metric.aggregationType || "sum",
                displayName: metric.displayName || ""
            };
            this.usageMetrics.set(usageMetric.id, usageMetric);
        }
    }

    // ===========================================================================
    // CUSTOMER MANAGEMENT
    // ===========================================================================

    async createCustomer(data: Partial<Customer>): Promise<Customer> {
        const customer: Customer = {
            id: randomUUID(),
            email: data.email || "",
            name: data.name || "",
            metadata: data.metadata || { source: "api", mrr: 0, ltv: 0, riskScore: 0, customFields: {} },
            billing: data.billing || {
                name: data.name || "",
                email: data.email || "",
                address: { line1: "", city: "", postalCode: "", country: "" },
                currency: "EUR"
            },
            paymentMethods: [],
            subscriptions: [],
            balance: 0,
            taxExempt: false,
            taxIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.customers.set(customer.id, customer);
        return customer;
    }

    async getCustomer(id: string): Promise<Customer | null> {
        return this.customers.get(id) || null;
    }

    async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
        const customer = this.customers.get(id);
        if (!customer) return null;

        Object.assign(customer, data, { updatedAt: new Date() });
        return customer;
    }

    async addPaymentMethod(customerId: string, method: Omit<PaymentMethod, "id" | "createdAt">): Promise<PaymentMethod | null> {
        const customer = this.customers.get(customerId);
        if (!customer) return null;

        const paymentMethod: PaymentMethod = {
            id: randomUUID(),
            createdAt: new Date(),
            ...method
        };

        if (method.isDefault) {
            customer.paymentMethods.forEach(pm => pm.isDefault = false);
            customer.defaultPaymentMethodId = paymentMethod.id;
        }

        customer.paymentMethods.push(paymentMethod);
        customer.updatedAt = new Date();

        return paymentMethod;
    }

    // ===========================================================================
    // BILLING ANALYTICS
    // ===========================================================================

    async getBillingAnalytics(startDate: Date, endDate: Date): Promise<BillingAnalytics> {
        const subscriptions = Array.from(this.subscriptions.values());
        const activeSubscriptions = subscriptions.filter(s => s.status === "active");

        // Calculate MRR
        let currentMRR = 0;
        for (const sub of activeSubscriptions) {
            const plan = await this.getPlan(sub.planId);
            if (plan) {
                let monthlyAmount = plan.pricing.amount;
                if (plan.pricing.interval === "year") monthlyAmount /= 12;
                else if (plan.pricing.interval === "week") monthlyAmount *= 4.33;
                currentMRR += monthlyAmount;
            }
        }

        const invoices = Array.from(this.invoices.values()).filter(
            i => i.createdAt >= startDate && i.createdAt <= endDate && i.status === "paid"
        );

        const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);

        return {
            period: { start: startDate, end: endDate },
            mrr: {
                current: currentMRR,
                previous: currentMRR * 0.95,
                growth: currentMRR * 0.05,
                growthRate: 5,
                newMRR: currentMRR * 0.15,
                expansionMRR: currentMRR * 0.05,
                contractionMRR: currentMRR * 0.02,
                churnedMRR: currentMRR * 0.03,
                reactivatedMRR: currentMRR * 0.01
            },
            arr: currentMRR * 12,
            revenue: {
                totalRevenue,
                recurringRevenue: totalRevenue * 0.85,
                oneTimeRevenue: totalRevenue * 0.1,
                usageRevenue: totalRevenue * 0.05,
                avgRevenuePerUser: activeSubscriptions.length > 0 ? totalRevenue / activeSubscriptions.length : 0,
                revenueByPlan: []
            },
            subscriptions: {
                total: subscriptions.length,
                active: activeSubscriptions.length,
                trialing: subscriptions.filter(s => s.status === "trialing").length,
                pastDue: subscriptions.filter(s => s.status === "past_due").length,
                cancelled: subscriptions.filter(s => s.status === "cancelled").length,
                newSubscriptions: subscriptions.filter(s => s.createdAt >= startDate).length,
                cancelledSubscriptions: subscriptions.filter(s => s.cancelledAt && s.cancelledAt >= startDate).length,
                upgrades: 10,
                downgrades: 3
            },
            churn: {
                rate: 2.5,
                voluntaryChurn: 1.5,
                involuntaryChurn: 1.0,
                byReason: {
                    too_expensive: 5,
                    missing_features: 3,
                    switched_competitor: 2,
                    not_using: 4,
                    technical_issues: 1,
                    customer_service: 0,
                    other: 2
                },
                recoveredRevenue: currentMRR * 0.01
            },
            expansion: {
                upgrades: 10,
                upsells: 5,
                addOns: 8,
                expansionRevenue: currentMRR * 0.05,
                netRevenuRetention: 105
            },
            cohorts: []
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
