/**
 * ALTUS INK - ADVANCED PAYMENT PROCESSING SERVICE
 * Enterprise-grade payment processing with Stripe
 * 
 * Features:
 * - Stripe Checkout
 * - Payment Intents
 * - Stripe Connect (Artist Payouts)
 * - Subscription Management
 * - Invoicing
 * - Refunds
 * - Disputes
 * - Currency Conversion
 * - Tax Calculation
 * - Payment Analytics
 * - Webhook Processing
 */

import Stripe from "stripe";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface PaymentConfig {
    secretKey: string;
    webhookSecret: string;
    publishableKey: string;
    connectWebhookSecret?: string;
    platformFeePercent: number;
    minPayoutAmount: number;
    supportedCurrencies: Currency[];
    defaultCurrency: Currency;
}

export type Currency = "EUR" | "USD" | "GBP" | "BRL" | "CAD" | "AUD" | "CHF" | "SEK" | "NOK" | "DKK";

export interface PaymentIntent {
    id: string;
    stripeId: string;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    customerId?: string;
    bookingId?: string;
    artistId?: string;
    artistShare: number;
    platformFee: number;
    metadata: Record<string, any>;
    createdAt: Date;
    confirmedAt?: Date;
    failedAt?: Date;
    refundedAt?: Date;
    refundAmount?: number;
}

export type PaymentStatus =
    | "pending"
    | "processing"
    | "requires_action"
    | "requires_capture"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded"
    | "disputed";

export interface CheckoutSession {
    id: string;
    stripeId: string;
    url: string;
    bookingId: string;
    customerId?: string;
    amount: number;
    currency: Currency;
    status: "open" | "complete" | "expired";
    expiresAt: Date;
    createdAt: Date;
}

export interface ConnectedAccount {
    id: string;
    stripeAccountId: string;
    artistId: string;
    type: "express" | "standard" | "custom";
    country: string;
    currency: Currency;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    requirements?: AccountRequirements;
    createdAt: Date;
    onboardedAt?: Date;
}

export interface AccountRequirements {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    disabledReason?: string;
}

export interface Payout {
    id: string;
    stripePayoutId?: string;
    artistId: string;
    accountId: string;
    amount: number;
    currency: Currency;
    status: PayoutStatus;
    method: "bank_account" | "card" | "manual";
    estimatedArrival?: Date;
    arrivedAt?: Date;
    failureReason?: string;
    bookingIds: string[];
    periodStart: Date;
    periodEnd: Date;
    createdAt: Date;
    processedAt?: Date;
    approvedBy?: string;
}

export type PayoutStatus =
    | "pending_approval"
    | "approved"
    | "in_transit"
    | "paid"
    | "failed"
    | "cancelled";

export interface Invoice {
    id: string;
    stripeInvoiceId?: string;
    customerId: string;
    artistId?: string;
    bookingId?: string;
    number: string;
    status: InvoiceStatus;
    amount: number;
    tax: number;
    total: number;
    currency: Currency;
    dueDate: Date;
    paidAt?: Date;
    lineItems: InvoiceLineItem[];
    pdfUrl?: string;
    createdAt: Date;
}

export type InvoiceStatus =
    | "draft"
    | "open"
    | "paid"
    | "void"
    | "uncollectible"
    | "overdue";

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitAmount: number;
    amount: number;
    taxable: boolean;
}

export interface Subscription {
    id: string;
    stripeSubscriptionId: string;
    artistId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAt?: Date;
    cancelledAt?: Date;
    trialEnd?: Date;
    createdAt: Date;
}

export type SubscriptionStatus =
    | "active"
    | "past_due"
    | "unpaid"
    | "cancelled"
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "paused";

export interface SubscriptionPlan {
    id: string;
    stripePriceId: string;
    name: string;
    description: string;
    amount: number;
    currency: Currency;
    interval: "month" | "year";
    features: string[];
    isActive: boolean;
    trialDays?: number;
}

export interface Dispute {
    id: string;
    stripeDisputeId: string;
    paymentIntentId: string;
    bookingId?: string;
    amount: number;
    currency: Currency;
    reason: DisputeReason;
    status: DisputeStatus;
    evidence?: DisputeEvidence;
    dueBy?: Date;
    createdAt: Date;
    resolvedAt?: Date;
}

export type DisputeReason =
    | "duplicate"
    | "fraudulent"
    | "subscription_canceled"
    | "product_unacceptable"
    | "product_not_received"
    | "unrecognized"
    | "credit_not_processed"
    | "general";

export type DisputeStatus =
    | "warning_needs_response"
    | "warning_under_review"
    | "warning_closed"
    | "needs_response"
    | "under_review"
    | "won"
    | "lost";

export interface DisputeEvidence {
    customerName?: string;
    customerEmailAddress?: string;
    billingAddress?: string;
    productDescription?: string;
    serviceDate?: string;
    serviceDocumentation?: string;
    customerCommunication?: string;
    cancellationPolicy?: string;
    refundPolicy?: string;
    accessActivityLog?: string;
}

export interface PaymentAnalytics {
    totalVolume: number;
    transactionCount: number;
    averageTransactionSize: number;
    successRate: number;
    refundRate: number;
    disputeRate: number;
    byPaymentMethod: Record<string, { volume: number; count: number }>;
    byCurrency: Record<Currency, { volume: number; count: number }>;
    byDay: Array<{ date: string; volume: number; count: number }>;
    topArtists: Array<{ artistId: string; volume: number; count: number }>;
}

export interface TaxCalculation {
    taxableAmount: number;
    taxAmount: number;
    taxRate: number;
    taxType: string;
    jurisdiction: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SUPPORTED_CURRENCIES: Currency[] = ["EUR", "USD", "GBP", "BRL", "CAD", "AUD", "CHF", "SEK", "NOK", "DKK"];

const CURRENCY_CONFIG: Record<Currency, { symbol: string; decimals: number; minAmount: number }> = {
    EUR: { symbol: "€", decimals: 2, minAmount: 50 },
    USD: { symbol: "$", decimals: 2, minAmount: 50 },
    GBP: { symbol: "£", decimals: 2, minAmount: 50 },
    BRL: { symbol: "R$", decimals: 2, minAmount: 100 },
    CAD: { symbol: "C$", decimals: 2, minAmount: 50 },
    AUD: { symbol: "A$", decimals: 2, minAmount: 50 },
    CHF: { symbol: "CHF", decimals: 2, minAmount: 100 },
    SEK: { symbol: "kr", decimals: 2, minAmount: 300 },
    NOK: { symbol: "kr", decimals: 2, minAmount: 300 },
    DKK: { symbol: "kr", decimals: 2, minAmount: 250 }
};

const TAX_RATES: Record<string, number> = {
    "NL": 0.21, // Netherlands
    "DE": 0.19, // Germany
    "FR": 0.20, // France
    "ES": 0.21, // Spain
    "IT": 0.22, // Italy
    "BE": 0.21, // Belgium
    "PT": 0.23, // Portugal
    "AT": 0.20, // Austria
    "UK": 0.20, // United Kingdom
    "US": 0,    // Varies by state
    "BR": 0,    // Varies
    "CA": 0     // Varies by province
};

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: "plan_basic",
        stripePriceId: "price_basic",
        name: "Basic",
        description: "Perfect for individual artists",
        amount: 1999, // €19.99
        currency: "EUR",
        interval: "month",
        features: [
            "Unlimited bookings",
            "Basic analytics",
            "Email support",
            "Standard payout schedule"
        ],
        isActive: true,
        trialDays: 14
    },
    {
        id: "plan_pro",
        stripePriceId: "price_pro",
        name: "Professional",
        description: "For growing artists",
        amount: 4999, // €49.99
        currency: "EUR",
        interval: "month",
        features: [
            "Everything in Basic",
            "Advanced analytics",
            "Priority support",
            "Weekly payouts",
            "Custom booking page",
            "WhatsApp integration"
        ],
        isActive: true,
        trialDays: 14
    },
    {
        id: "plan_studio",
        stripePriceId: "price_studio",
        name: "Studio",
        description: "For tattoo studios",
        amount: 14999, // €149.99
        currency: "EUR",
        interval: "month",
        features: [
            "Everything in Professional",
            "Multiple artist accounts",
            "Team management",
            "API access",
            "Daily payouts",
            "Dedicated account manager",
            "Custom integrations"
        ],
        isActive: true,
        trialDays: 14
    },
    {
        id: "plan_enterprise",
        stripePriceId: "price_enterprise",
        name: "Enterprise",
        description: "Custom solutions",
        amount: 0, // Contact sales
        currency: "EUR",
        interval: "month",
        features: [
            "Everything in Studio",
            "Unlimited artists",
            "White-label option",
            "SLA guarantee",
            "Custom development",
            "On-premise option"
        ],
        isActive: true
    }
];

// =============================================================================
// PAYMENT SERVICE CLASS
// =============================================================================

export class PaymentService {
    private stripe: Stripe | null = null;
    private config: PaymentConfig;
    private paymentIntents: Map<string, PaymentIntent> = new Map();
    private checkoutSessions: Map<string, CheckoutSession> = new Map();
    private connectedAccounts: Map<string, ConnectedAccount> = new Map();
    private payouts: Map<string, Payout> = new Map();
    private invoices: Map<string, Invoice> = new Map();
    private subscriptions: Map<string, Subscription> = new Map();
    private disputes: Map<string, Dispute> = new Map();

    constructor() {
        this.config = {
            secretKey: process.env.STRIPE_SECRET_KEY || "",
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
            connectWebhookSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
            platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || "15"),
            minPayoutAmount: parseInt(process.env.MIN_PAYOUT_AMOUNT || "5000"), // €50
            supportedCurrencies: SUPPORTED_CURRENCIES,
            defaultCurrency: "EUR"
        };

        // Only initialize Stripe if secret key is configured
        if (this.config.secretKey) {
            this.stripe = new Stripe(this.config.secretKey, {
                apiVersion: "2023-10-16"
            });
        }
    }

    /**
     * Get Stripe client with lazy initialization
     * Throws if Stripe is not configured
     */
    private getStripe(): Stripe {
        if (!this.stripe) {
            if (!this.config.secretKey) {
                throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
            }
            this.stripe = new Stripe(this.config.secretKey, {
                apiVersion: "2023-10-16"
            });
        }
        return this.stripe;
    }

    // ===========================================================================
    // CONFIGURATION
    // ===========================================================================

    isConfigured(): boolean {
        return !!(this.config.secretKey && this.config.webhookSecret);
    }

    getPublishableKey(): string {
        return this.config.publishableKey;
    }

    getSupportedCurrencies(): Currency[] {
        return this.config.supportedCurrencies;
    }

    getCurrencyConfig(currency: Currency) {
        return CURRENCY_CONFIG[currency];
    }

    getSubscriptionPlans(): SubscriptionPlan[] {
        return SUBSCRIPTION_PLANS.filter(p => p.isActive);
    }

    // ===========================================================================
    // CHECKOUT SESSIONS
    // ===========================================================================

    async createCheckoutSession(params: {
        bookingId: string;
        amount: number;
        currency: Currency;
        customerEmail: string;
        customerName: string;
        artistName: string;
        artistId: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    }): Promise<CheckoutSession> {
        const artistShare = this.calculateArtistShare(params.amount);
        const platformFee = params.amount - artistShare;

        // Get connected account
        const connectedAccount = this.getConnectedAccountByArtist(params.artistId);

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: "payment",
            payment_method_types: ["card", "ideal", "bancontact", "sepa_debit"],
            line_items: [{
                price_data: {
                    currency: params.currency.toLowerCase(),
                    unit_amount: params.amount,
                    product_data: {
                        name: `Tattoo Session with ${params.artistName}`,
                        description: `Booking ${params.bookingId} - Deposit payment`,
                        images: ["https://altusink.com/images/booking-thumbnail.png"]
                    }
                },
                quantity: 1
            }],
            customer_email: params.customerEmail,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
            metadata: {
                booking_id: params.bookingId,
                artist_id: params.artistId,
                platform_fee: platformFee.toString(),
                ...params.metadata
            }
        };

        // Add transfer to connected account if available
        if (connectedAccount?.chargesEnabled) {
            sessionParams.payment_intent_data = {
                application_fee_amount: platformFee,
                transfer_data: {
                    destination: connectedAccount.stripeAccountId
                }
            };
        }

        const stripeSession = await this.getStripe().checkout.sessions.create(sessionParams);

        const session: CheckoutSession = {
            id: this.generateId("cs"),
            stripeId: stripeSession.id,
            url: stripeSession.url!,
            bookingId: params.bookingId,
            amount: params.amount,
            currency: params.currency,
            status: "open",
            expiresAt: new Date((stripeSession.expires_at || 0) * 1000),
            createdAt: new Date()
        };

        this.checkoutSessions.set(session.id, session);
        return session;
    }

    async getCheckoutSession(sessionId: string): Promise<CheckoutSession | undefined> {
        const local = this.checkoutSessions.get(sessionId);
        if (local) return local;

        // Try to find by Stripe ID
        for (const session of this.checkoutSessions.values()) {
            if (session.stripeId === sessionId) return session;
        }

        return undefined;
    }

    // ===========================================================================
    // PAYMENT INTENTS
    // ===========================================================================

    async createPaymentIntent(params: {
        amount: number;
        currency: Currency;
        customerId?: string;
        bookingId: string;
        artistId: string;
        description?: string;
        metadata?: Record<string, string>;
    }): Promise<PaymentIntent> {
        const artistShare = this.calculateArtistShare(params.amount);
        const platformFee = params.amount - artistShare;

        const connectedAccount = this.getConnectedAccountByArtist(params.artistId);

        const intentParams: Stripe.PaymentIntentCreateParams = {
            amount: params.amount,
            currency: params.currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            description: params.description || `Booking ${params.bookingId}`,
            metadata: {
                booking_id: params.bookingId,
                artist_id: params.artistId,
                platform_fee: platformFee.toString(),
                ...params.metadata
            }
        };

        if (connectedAccount?.chargesEnabled) {
            intentParams.application_fee_amount = platformFee;
            intentParams.transfer_data = {
                destination: connectedAccount.stripeAccountId
            };
        }

        const stripeIntent = await this.getStripe().paymentIntents.create(intentParams);

        const intent: PaymentIntent = {
            id: this.generateId("pi"),
            stripeId: stripeIntent.id,
            amount: params.amount,
            currency: params.currency,
            status: this.mapPaymentIntentStatus(stripeIntent.status),
            customerId: params.customerId,
            bookingId: params.bookingId,
            artistId: params.artistId,
            artistShare,
            platformFee,
            metadata: params.metadata || {},
            createdAt: new Date()
        };

        this.paymentIntents.set(intent.id, intent);
        return intent;
    }

    async confirmPaymentIntent(intentId: string): Promise<PaymentIntent> {
        const intent = this.paymentIntents.get(intentId);
        if (!intent) throw new Error("Payment intent not found");

        const stripeIntent = await this.getStripe().paymentIntents.confirm(intent.stripeId);

        intent.status = this.mapPaymentIntentStatus(stripeIntent.status);
        if (stripeIntent.status === "succeeded") {
            intent.confirmedAt = new Date();
        }

        return intent;
    }

    async cancelPaymentIntent(intentId: string): Promise<PaymentIntent> {
        const intent = this.paymentIntents.get(intentId);
        if (!intent) throw new Error("Payment intent not found");

        await this.getStripe().paymentIntents.cancel(intent.stripeId);
        intent.status = "cancelled";

        return intent;
    }

    getPaymentIntent(intentId: string): PaymentIntent | undefined {
        return this.paymentIntents.get(intentId);
    }

    // ===========================================================================
    // REFUNDS
    // ===========================================================================

    async createRefund(params: {
        paymentIntentId: string;
        amount?: number;
        reason?: "duplicate" | "fraudulent" | "requested_by_customer";
        metadata?: Record<string, string>;
    }): Promise<{ refundId: string; amount: number; status: string }> {
        const intent = this.paymentIntents.get(params.paymentIntentId);
        if (!intent) throw new Error("Payment intent not found");

        const refundAmount = params.amount || intent.amount;

        const refund = await this.getStripe().refunds.create({
            payment_intent: intent.stripeId,
            amount: refundAmount,
            reason: params.reason,
            metadata: params.metadata
        });

        intent.refundedAt = new Date();
        intent.refundAmount = (intent.refundAmount || 0) + refundAmount;
        intent.status = refundAmount >= intent.amount ? "refunded" : "partially_refunded";

        return {
            refundId: refund.id,
            amount: refundAmount,
            status: refund.status || "pending"
        };
    }

    calculateRefundAmount(
        originalAmount: number,
        cancellationPolicy: "flexible" | "moderate" | "strict",
        hoursUntilSession: number
    ): number {
        let refundPercent = 0;

        switch (cancellationPolicy) {
            case "flexible":
                if (hoursUntilSession >= 24) refundPercent = 100;
                else if (hoursUntilSession >= 6) refundPercent = 50;
                else refundPercent = 0;
                break;
            case "moderate":
                if (hoursUntilSession >= 48) refundPercent = 100;
                else if (hoursUntilSession >= 24) refundPercent = 75;
                else if (hoursUntilSession >= 12) refundPercent = 50;
                else refundPercent = 25;
                break;
            case "strict":
                if (hoursUntilSession >= 72) refundPercent = 100;
                else if (hoursUntilSession >= 48) refundPercent = 50;
                else refundPercent = 0;
                break;
        }

        return Math.round((originalAmount * refundPercent) / 100);
    }

    // ===========================================================================
    // STRIPE CONNECT (ARTIST PAYOUTS)
    // ===========================================================================

    async createConnectedAccount(params: {
        artistId: string;
        email: string;
        country: string;
        type?: "express" | "standard";
    }): Promise<{ accountId: string; onboardingUrl: string }> {
        const account = await this.getStripe().accounts.create({
            type: params.type || "express",
            country: params.country,
            email: params.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }
            },
            business_type: "individual",
            metadata: {
                artist_id: params.artistId
            }
        });

        const accountLink = await this.getStripe().accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.APP_URL}/dashboard/artist/settings?stripe=refresh`,
            return_url: `${process.env.APP_URL}/dashboard/artist/settings?stripe=complete`,
            type: "account_onboarding"
        });

        const connectedAccount: ConnectedAccount = {
            id: this.generateId("acc"),
            stripeAccountId: account.id,
            artistId: params.artistId,
            type: params.type || "express",
            country: params.country,
            currency: this.getCountryCurrency(params.country),
            chargesEnabled: false,
            payoutsEnabled: false,
            detailsSubmitted: false,
            createdAt: new Date()
        };

        this.connectedAccounts.set(connectedAccount.id, connectedAccount);

        return {
            accountId: connectedAccount.id,
            onboardingUrl: accountLink.url
        };
    }

    async getConnectedAccountStatus(accountId: string): Promise<ConnectedAccount | undefined> {
        const account = this.connectedAccounts.get(accountId);
        if (!account) return undefined;

        // Fetch latest status from Stripe
        const stripeAccount = await this.getStripe().accounts.retrieve(account.stripeAccountId);

        account.chargesEnabled = stripeAccount.charges_enabled || false;
        account.payoutsEnabled = stripeAccount.payouts_enabled || false;
        account.detailsSubmitted = stripeAccount.details_submitted || false;

        if (stripeAccount.requirements) {
            account.requirements = {
                currentlyDue: stripeAccount.requirements.currently_due || [],
                eventuallyDue: stripeAccount.requirements.eventually_due || [],
                pastDue: stripeAccount.requirements.past_due || [],
                pendingVerification: stripeAccount.requirements.pending_verification || [],
                disabledReason: stripeAccount.requirements.disabled_reason || undefined
            };
        }

        if (account.chargesEnabled && account.payoutsEnabled && !account.onboardedAt) {
            account.onboardedAt = new Date();
        }

        return account;
    }

    getConnectedAccountByArtist(artistId: string): ConnectedAccount | undefined {
        for (const account of this.connectedAccounts.values()) {
            if (account.artistId === artistId) return account;
        }
        return undefined;
    }

    async createLoginLink(accountId: string): Promise<string> {
        const account = this.connectedAccounts.get(accountId);
        if (!account) throw new Error("Account not found");

        const loginLink = await this.getStripe().accounts.createLoginLink(account.stripeAccountId);
        return loginLink.url;
    }

    async createDashboardLink(accountId: string): Promise<string> {
        const account = this.connectedAccounts.get(accountId);
        if (!account) throw new Error("Account not found");

        // Use account link for Express accounts
        if (account.type === "express") {
            const link = await this.getStripe().accountLinks.create({
                account: account.stripeAccountId,
                refresh_url: `${process.env.APP_URL}/dashboard/artist/settings`,
                return_url: `${process.env.APP_URL}/dashboard/artist/settings`,
                type: "account_onboarding"
            });
            return link.url;
        }

        // Standard accounts can use login links
        return this.createLoginLink(accountId);
    }

    // ===========================================================================
    // PAYOUTS
    // ===========================================================================

    async requestPayout(params: {
        artistId: string;
        amount: number;
        bookingIds: string[];
        periodStart: Date;
        periodEnd: Date;
    }): Promise<Payout> {
        const account = this.getConnectedAccountByArtist(params.artistId);
        if (!account) throw new Error("No connected account found");
        if (!account.payoutsEnabled) throw new Error("Payouts not enabled for this account");

        if (params.amount < this.config.minPayoutAmount) {
            throw new Error(`Minimum payout amount is ${this.formatAmount(this.config.minPayoutAmount, account.currency)}`);
        }

        const payout: Payout = {
            id: this.generateId("po"),
            artistId: params.artistId,
            accountId: account.id,
            amount: params.amount,
            currency: account.currency,
            status: "pending_approval",
            method: "bank_account",
            bookingIds: params.bookingIds,
            periodStart: params.periodStart,
            periodEnd: params.periodEnd,
            createdAt: new Date()
        };

        this.payouts.set(payout.id, payout);
        return payout;
    }

    async approvePayout(payoutId: string, approvedBy: string): Promise<Payout> {
        const payout = this.payouts.get(payoutId);
        if (!payout) throw new Error("Payout not found");
        if (payout.status !== "pending_approval") throw new Error("Payout already processed");

        payout.status = "approved";
        payout.approvedBy = approvedBy;

        // Process the payout via Stripe
        try {
            const account = this.connectedAccounts.get(payout.accountId);
            if (!account) throw new Error("Account not found");

            const transfer = await this.getStripe().transfers.create({
                amount: payout.amount,
                currency: payout.currency.toLowerCase(),
                destination: account.stripeAccountId,
                metadata: {
                    payout_id: payout.id,
                    artist_id: payout.artistId
                }
            });

            payout.stripePayoutId = transfer.id;
            payout.status = "in_transit";
            payout.processedAt = new Date();

            // Estimate arrival (typically 2-3 business days)
            const arrival = new Date();
            arrival.setDate(arrival.getDate() + 3);
            payout.estimatedArrival = arrival;

        } catch (error) {
            payout.status = "failed";
            payout.failureReason = error instanceof Error ? error.message : "Unknown error";
        }

        return payout;
    }

    async rejectPayout(payoutId: string, reason: string): Promise<Payout> {
        const payout = this.payouts.get(payoutId);
        if (!payout) throw new Error("Payout not found");

        payout.status = "cancelled";
        payout.failureReason = reason;

        return payout;
    }

    getPayouts(filters: {
        artistId?: string;
        status?: PayoutStatus;
        startDate?: Date;
        endDate?: Date;
    }): Payout[] {
        let payouts = Array.from(this.payouts.values());

        if (filters.artistId) {
            payouts = payouts.filter(p => p.artistId === filters.artistId);
        }
        if (filters.status) {
            payouts = payouts.filter(p => p.status === filters.status);
        }
        if (filters.startDate) {
            payouts = payouts.filter(p => p.createdAt >= filters.startDate!);
        }
        if (filters.endDate) {
            payouts = payouts.filter(p => p.createdAt <= filters.endDate!);
        }

        return payouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // ===========================================================================
    // INVOICES
    // ===========================================================================

    async createInvoice(params: {
        customerId: string;
        artistId?: string;
        bookingId?: string;
        lineItems: InvoiceLineItem[];
        dueDate?: Date;
        taxRate?: number;
    }): Promise<Invoice> {
        const subtotal = params.lineItems.reduce((sum, item) => sum + item.amount, 0);
        const taxableAmount = params.lineItems
            .filter(item => item.taxable)
            .reduce((sum, item) => sum + item.amount, 0);
        const taxRate = params.taxRate || 0.21; // Default 21% VAT
        const tax = Math.round(taxableAmount * taxRate);
        const total = subtotal + tax;

        const invoice: Invoice = {
            id: this.generateId("inv"),
            customerId: params.customerId,
            artistId: params.artistId,
            bookingId: params.bookingId,
            number: this.generateInvoiceNumber(),
            status: "draft",
            amount: subtotal,
            tax,
            total,
            currency: "EUR",
            dueDate: params.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lineItems: params.lineItems,
            createdAt: new Date()
        };

        this.invoices.set(invoice.id, invoice);
        return invoice;
    }

    async finalizeInvoice(invoiceId: string): Promise<Invoice> {
        const invoice = this.invoices.get(invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        invoice.status = "open";

        // In production, would create Stripe invoice and generate PDF

        return invoice;
    }

    async markInvoicePaid(invoiceId: string): Promise<Invoice> {
        const invoice = this.invoices.get(invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        invoice.status = "paid";
        invoice.paidAt = new Date();

        return invoice;
    }

    getInvoices(customerId?: string): Invoice[] {
        let invoices = Array.from(this.invoices.values());
        if (customerId) {
            invoices = invoices.filter(i => i.customerId === customerId);
        }
        return invoices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // ===========================================================================
    // SUBSCRIPTIONS
    // ===========================================================================

    async createSubscription(params: {
        artistId: string;
        planId: string;
        paymentMethodId: string;
        trialDays?: number;
    }): Promise<Subscription> {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === params.planId);
        if (!plan) throw new Error("Plan not found");

        // In production, would create Stripe subscription
        const subscription: Subscription = {
            id: this.generateId("sub"),
            stripeSubscriptionId: `sub_${Date.now()}`,
            artistId: params.artistId,
            planId: params.planId,
            status: params.trialDays ? "trialing" : "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            trialEnd: params.trialDays
                ? new Date(Date.now() + params.trialDays * 24 * 60 * 60 * 1000)
                : undefined,
            createdAt: new Date()
        };

        this.subscriptions.set(subscription.id, subscription);
        return subscription;
    }

    async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) throw new Error("Subscription not found");

        if (cancelAtPeriodEnd) {
            subscription.cancelAt = subscription.currentPeriodEnd;
        } else {
            subscription.status = "cancelled";
            subscription.cancelledAt = new Date();
        }

        return subscription;
    }

    getSubscription(artistId: string): Subscription | undefined {
        for (const subscription of this.subscriptions.values()) {
            if (subscription.artistId === artistId && subscription.status !== "cancelled") {
                return subscription;
            }
        }
        return undefined;
    }

    // ===========================================================================
    // DISPUTES
    // ===========================================================================

    async handleDispute(stripeDispute: Stripe.Dispute): Promise<Dispute> {
        const dispute: Dispute = {
            id: this.generateId("dsp"),
            stripeDisputeId: stripeDispute.id,
            paymentIntentId: stripeDispute.payment_intent as string,
            amount: stripeDispute.amount,
            currency: stripeDispute.currency.toUpperCase() as Currency,
            reason: stripeDispute.reason as DisputeReason,
            status: stripeDispute.status as DisputeStatus,
            dueBy: stripeDispute.evidence_details?.due_by
                ? new Date(stripeDispute.evidence_details.due_by * 1000)
                : undefined,
            createdAt: new Date()
        };

        this.disputes.set(dispute.id, dispute);
        return dispute;
    }

    async submitDisputeEvidence(disputeId: string, evidence: DisputeEvidence): Promise<Dispute> {
        const dispute = this.disputes.get(disputeId);
        if (!dispute) throw new Error("Dispute not found");

        await this.getStripe().disputes.update(dispute.stripeDisputeId, {
            evidence: {
                customer_name: evidence.customerName,
                customer_email_address: evidence.customerEmailAddress,
                billing_address: evidence.billingAddress,
                product_description: evidence.productDescription,
                service_date: evidence.serviceDate,
                service_documentation: evidence.serviceDocumentation,
                customer_communication: evidence.customerCommunication,
                cancellation_policy: evidence.cancellationPolicy,
                refund_policy: evidence.refundPolicy,
                access_activity_log: evidence.accessActivityLog
            }
        });

        dispute.evidence = evidence;
        dispute.status = "under_review";

        return dispute;
    }

    getDisputes(): Dispute[] {
        return Array.from(this.disputes.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // ===========================================================================
    // WEBHOOKS
    // ===========================================================================

    async handleWebhook(body: string, signature: string): Promise<void> {
        const event = this.getStripe().webhooks.constructEvent(
            body,
            signature,
            this.config.webhookSecret
        );

        switch (event.type) {
            case "checkout.session.completed":
                await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case "payment_intent.succeeded":
                await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;
            case "payment_intent.payment_failed":
                await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                break;
            case "charge.dispute.created":
                await this.handleDispute(event.data.object as Stripe.Dispute);
                break;
            case "account.updated":
                await this.handleAccountUpdated(event.data.object as Stripe.Account);
                break;
            case "payout.paid":
                await this.handlePayoutPaid(event.data.object as Stripe.Payout);
                break;
        }
    }

    private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
        for (const cs of this.checkoutSessions.values()) {
            if (cs.stripeId === session.id) {
                cs.status = "complete";
                cs.customerId = session.customer as string;
                break;
            }
        }
    }

    private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        for (const pi of this.paymentIntents.values()) {
            if (pi.stripeId === paymentIntent.id) {
                pi.status = "succeeded";
                pi.confirmedAt = new Date();
                break;
            }
        }
    }

    private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        for (const pi of this.paymentIntents.values()) {
            if (pi.stripeId === paymentIntent.id) {
                pi.status = "failed";
                pi.failedAt = new Date();
                break;
            }
        }
    }

    private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
        for (const ca of this.connectedAccounts.values()) {
            if (ca.stripeAccountId === account.id) {
                ca.chargesEnabled = account.charges_enabled || false;
                ca.payoutsEnabled = account.payouts_enabled || false;
                ca.detailsSubmitted = account.details_submitted || false;
                break;
            }
        }
    }

    private async handlePayoutPaid(stripePayout: Stripe.Payout): Promise<void> {
        for (const payout of this.payouts.values()) {
            if (payout.stripePayoutId === stripePayout.id) {
                payout.status = "paid";
                payout.arrivedAt = new Date();
                break;
            }
        }
    }

    // ===========================================================================
    // ANALYTICS
    // ===========================================================================

    getPaymentAnalytics(startDate: Date, endDate: Date): PaymentAnalytics {
        const payments = Array.from(this.paymentIntents.values())
            .filter(p => p.createdAt >= startDate && p.createdAt <= endDate);

        const succeededPayments = payments.filter(p => p.status === "succeeded");
        const refundedPayments = payments.filter(p => ["refunded", "partially_refunded"].includes(p.status));
        const disputedPayments = payments.filter(p => p.status === "disputed");

        const totalVolume = succeededPayments.reduce((sum, p) => sum + p.amount, 0);
        const transactionCount = succeededPayments.length;

        // Group by day
        const byDay = new Map<string, { volume: number; count: number }>();
        succeededPayments.forEach(p => {
            const dateKey = p.confirmedAt?.toISOString().split("T")[0] || "";
            const existing = byDay.get(dateKey) || { volume: 0, count: 0 };
            byDay.set(dateKey, {
                volume: existing.volume + p.amount,
                count: existing.count + 1
            });
        });

        // Group by currency
        const byCurrency: Record<Currency, { volume: number; count: number }> = {} as any;
        succeededPayments.forEach(p => {
            if (!byCurrency[p.currency]) {
                byCurrency[p.currency] = { volume: 0, count: 0 };
            }
            byCurrency[p.currency].volume += p.amount;
            byCurrency[p.currency].count++;
        });

        // Top artists
        const artistVolumes = new Map<string, { volume: number; count: number }>();
        succeededPayments.forEach(p => {
            if (p.artistId) {
                const existing = artistVolumes.get(p.artistId) || { volume: 0, count: 0 };
                artistVolumes.set(p.artistId, {
                    volume: existing.volume + p.amount,
                    count: existing.count + 1
                });
            }
        });

        const topArtists = Array.from(artistVolumes.entries())
            .map(([artistId, data]) => ({ artistId, ...data }))
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 10);

        return {
            totalVolume,
            transactionCount,
            averageTransactionSize: transactionCount > 0 ? totalVolume / transactionCount : 0,
            successRate: payments.length > 0 ? (succeededPayments.length / payments.length) * 100 : 0,
            refundRate: succeededPayments.length > 0 ? (refundedPayments.length / succeededPayments.length) * 100 : 0,
            disputeRate: succeededPayments.length > 0 ? (disputedPayments.length / succeededPayments.length) * 100 : 0,
            byPaymentMethod: {}, // Would need to track payment methods
            byCurrency,
            byDay: Array.from(byDay.entries()).map(([date, data]) => ({ date, ...data })),
            topArtists
        };
    }

    // ===========================================================================
    // TAX CALCULATION
    // ===========================================================================

    calculateTax(amount: number, countryCode: string): TaxCalculation {
        const taxRate = TAX_RATES[countryCode] || 0;
        const taxAmount = Math.round(amount * taxRate);

        return {
            taxableAmount: amount,
            taxAmount,
            taxRate: taxRate * 100,
            taxType: taxRate > 0 ? "VAT" : "None",
            jurisdiction: countryCode
        };
    }

    // ===========================================================================
    // HELPERS
    // ===========================================================================

    private generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateInvoiceNumber(): string {
        const year = new Date().getFullYear();
        const count = this.invoices.size + 1;
        return `INV-${year}-${count.toString().padStart(5, "0")}`;
    }

    private calculateArtistShare(amount: number): number {
        const feePercent = this.config.platformFeePercent / 100;
        return Math.round(amount * (1 - feePercent));
    }

    private mapPaymentIntentStatus(status: string): PaymentStatus {
        const statusMap: Record<string, PaymentStatus> = {
            "requires_payment_method": "pending",
            "requires_confirmation": "pending",
            "requires_action": "requires_action",
            "processing": "processing",
            "requires_capture": "requires_capture",
            "succeeded": "succeeded",
            "canceled": "cancelled"
        };
        return statusMap[status] || "pending";
    }

    private getCountryCurrency(countryCode: string): Currency {
        const currencyMap: Record<string, Currency> = {
            "US": "USD",
            "GB": "GBP",
            "UK": "GBP",
            "BR": "BRL",
            "CA": "CAD",
            "AU": "AUD",
            "CH": "CHF",
            "SE": "SEK",
            "NO": "NOK",
            "DK": "DKK"
        };
        return currencyMap[countryCode] || "EUR";
    }

    formatAmount(amount: number, currency: Currency): string {
        const config = CURRENCY_CONFIG[currency];
        const value = amount / Math.pow(10, config.decimals);
        return `${config.symbol}${value.toFixed(config.decimals)}`;
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const paymentService = new PaymentService();
export default paymentService;
