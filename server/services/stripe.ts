/**
 * ALTUS INK - STRIPE PAYMENT SERVICE
 * Full payment processing, checkout, webhooks, refunds, and payout management
 * 
 * Features:
 * - Checkout session creation with deposits
 * - Webhook event handling
 * - Refund processing with partial support
 * - Connect payouts for artists
 * - Payment intent management
 * - Subscription handling (future)
 * - Invoice generation
 * - Currency conversion
 * - Fraud detection helpers
 */

import Stripe from "stripe";
import { config, stripeConfig, features } from "../config";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface CreateCheckoutParams {
    bookingId: string;
    artistId: string;
    customerId?: string;
    customerEmail: string;
    customerName: string;
    amount: number;
    currency?: string;
    description: string;
    metadata?: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
    expiresAt?: number;
}

export interface CheckoutSessionResult {
    sessionId: string;
    url: string;
    expiresAt: number;
}

export interface RefundParams {
    paymentIntentId: string;
    amount?: number; // Partial refund if specified
    reason?: "duplicate" | "fraudulent" | "requested_by_customer";
    metadata?: Record<string, string>;
}

export interface RefundResult {
    refundId: string;
    amount: number;
    status: string;
    created: Date;
}

export interface PayoutParams {
    artistStripeAccountId: string;
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
}

export interface PayoutResult {
    transferId: string;
    amount: number;
    status: string;
    arrivalDate: Date;
}

export interface WebhookEvent {
    type: string;
    data: {
        object: any;
    };
}

export interface PaymentDetails {
    id: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail: string;
    customerName: string;
    bookingId: string;
    artistId: string;
    created: Date;
    receiptUrl?: string;
}

export interface BalanceInfo {
    available: number;
    pending: number;
    currency: string;
}

export interface ConnectAccountParams {
    email: string;
    artistId: string;
    country: string;
    businessType?: "individual" | "company";
    metadata?: Record<string, string>;
}

export interface ConnectAccountResult {
    accountId: string;
    onboardingUrl: string;
}

// =============================================================================
// STRIPE CLIENT INITIALIZATION
// =============================================================================

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
    if (!features.stripe) {
        throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.");
    }

    if (!stripeClient) {
        stripeClient = new Stripe(stripeConfig.secretKey!, {
            apiVersion: "2023-10-16",
            typescript: true,
            appInfo: {
                name: "Altus Ink",
                version: "1.0.0",
                url: "https://altusink.com"
            }
        });
    }

    return stripeClient;
}

// =============================================================================
// CHECKOUT SESSION MANAGEMENT
// =============================================================================

/**
 * Create a new checkout session for booking deposit
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    const stripe = getStripeClient();

    const {
        bookingId,
        artistId,
        customerEmail,
        customerName,
        amount,
        currency = "eur",
        description,
        metadata = {},
        successUrl,
        cancelUrl,
        expiresAt
    } = params;

    // Calculate platform fee
    const platformFeePercent = stripeConfig.platformFeePercent || 15;
    const platformFeeAmount = Math.round(amount * (platformFeePercent / 100));

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
            price_data: {
                currency,
                unit_amount: amount, // Amount in cents
                product_data: {
                    name: "Tattoo Session Deposit",
                    description,
                    images: ["https://altusink.com/deposit-image.png"],
                    metadata: {
                        bookingId,
                        artistId
                    }
                }
            },
            quantity: 1
        }
    ];

    // Session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        payment_method_types: ["card", "ideal", "bancontact", "sepa_debit"],
        line_items: lineItems,
        customer_email: customerEmail,
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
            bookingId,
            artistId,
            customerName,
            source: "altusink",
            ...metadata
        },
        payment_intent_data: {
            metadata: {
                bookingId,
                artistId,
                customerName,
                ...metadata
            },
            description: `Deposit for booking ${bookingId}`,
            statement_descriptor: "ALTUSINK DEPOSIT",
            statement_descriptor_suffix: bookingId.slice(0, 8).toUpperCase()
        },
        // Enable billing address collection
        billing_address_collection: "required",
        // Phone number collection
        phone_number_collection: {
            enabled: true
        },
        // Consent collection for marketing
        consent_collection: {
            terms_of_service: "required"
        },
        // Custom text
        custom_text: {
            submit: {
                message: `By completing this payment, you agree to our cancellation policy. Your deposit of ${formatAmount(amount, currency)} will be held until your session.`
            }
        },
        // Expiration
        ...(expiresAt && { expires_at: expiresAt }),
        // Locale
        locale: "auto",
        // Allow promotion codes
        allow_promotion_codes: true
    };

    // Create session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
        sessionId: session.id,
        url: session.url!,
        expiresAt: session.expires_at
    };
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    const stripe = getStripeClient();
    return await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent", "customer", "line_items"]
    });
}

/**
 * Expire a checkout session before completion
 */
export async function expireCheckoutSession(sessionId: string): Promise<void> {
    const stripe = getStripeClient();
    await stripe.checkout.sessions.expire(sessionId);
}

// =============================================================================
// PAYMENT INTENT MANAGEMENT
// =============================================================================

/**
 * Create a payment intent directly (for custom flows)
 */
export async function createPaymentIntent(params: {
    amount: number;
    currency?: string;
    customerEmail: string;
    bookingId: string;
    artistId: string;
    metadata?: Record<string, string>;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const stripe = getStripeClient();

    const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || "eur",
        automatic_payment_methods: {
            enabled: true
        },
        receipt_email: params.customerEmail,
        metadata: {
            bookingId: params.bookingId,
            artistId: params.artistId,
            source: "altusink",
            ...params.metadata
        },
        description: `Deposit for booking ${params.bookingId}`
    });

    return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id
    };
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    const stripe = getStripeClient();
    return await stripe.paymentIntents.confirm(paymentIntentId);
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string, reason?: string): Promise<void> {
    const stripe = getStripeClient();
    await stripe.paymentIntents.cancel(paymentIntentId, {
        cancellation_reason: reason as any || "requested_by_customer"
    });
}

/**
 * Retrieve payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<PaymentDetails> {
    const stripe = getStripeClient();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        customerEmail: pi.receipt_email || "",
        customerName: pi.metadata?.customerName || "",
        bookingId: pi.metadata?.bookingId || "",
        artistId: pi.metadata?.artistId || "",
        created: new Date(pi.created * 1000),
        receiptUrl: pi.charges?.data[0]?.receipt_url || undefined
    };
}

// =============================================================================
// REFUND MANAGEMENT
// =============================================================================

/**
 * Process a refund (full or partial)
 */
export async function processRefund(params: RefundParams): Promise<RefundResult> {
    const stripe = getStripeClient();

    const refundParams: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
        reason: params.reason,
        metadata: params.metadata
    };

    // Partial refund if amount specified
    if (params.amount) {
        refundParams.amount = params.amount;
    }

    const refund = await stripe.refunds.create(refundParams);

    return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        created: new Date(refund.created * 1000)
    };
}

/**
 * Get refund status
 */
export async function getRefundStatus(refundId: string): Promise<RefundResult> {
    const stripe = getStripeClient();
    const refund = await stripe.refunds.retrieve(refundId);

    return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        created: new Date(refund.created * 1000)
    };
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefundAmount(
    originalAmount: number,
    hoursUntilSession: number,
    policy: "strict" | "moderate" | "flexible" = "moderate"
): { refundAmount: number; refundPercent: number; reason: string } {
    let refundPercent = 0;
    let reason = "";

    switch (policy) {
        case "flexible":
            if (hoursUntilSession >= 24) {
                refundPercent = 100;
                reason = "Full refund - cancelled 24+ hours before session";
            } else if (hoursUntilSession >= 6) {
                refundPercent = 50;
                reason = "Partial refund - cancelled 6-24 hours before session";
            } else {
                refundPercent = 0;
                reason = "No refund - cancelled less than 6 hours before session";
            }
            break;

        case "moderate":
            if (hoursUntilSession >= 48) {
                refundPercent = 100;
                reason = "Full refund - cancelled 48+ hours before session";
            } else if (hoursUntilSession >= 24) {
                refundPercent = 75;
                reason = "75% refund - cancelled 24-48 hours before session";
            } else if (hoursUntilSession >= 12) {
                refundPercent = 50;
                reason = "50% refund - cancelled 12-24 hours before session";
            } else {
                refundPercent = 25;
                reason = "25% refund - cancelled less than 12 hours before session";
            }
            break;

        case "strict":
            if (hoursUntilSession >= 72) {
                refundPercent = 100;
                reason = "Full refund - cancelled 72+ hours before session";
            } else if (hoursUntilSession >= 48) {
                refundPercent = 50;
                reason = "50% refund - cancelled 48-72 hours before session";
            } else {
                refundPercent = 0;
                reason = "No refund - cancelled less than 48 hours before session";
            }
            break;
    }

    const refundAmount = Math.round(originalAmount * (refundPercent / 100));

    return { refundAmount, refundPercent, reason };
}

// =============================================================================
// STRIPE CONNECT (ARTIST PAYOUTS)
// =============================================================================

/**
 * Create a Connect account for an artist
 */
export async function createConnectAccount(params: ConnectAccountParams): Promise<ConnectAccountResult> {
    const stripe = getStripeClient();

    // Create Express account
    const account = await stripe.accounts.create({
        type: "express",
        email: params.email,
        country: params.country,
        business_type: params.businessType || "individual",
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true }
        },
        metadata: {
            artistId: params.artistId,
            source: "altusink",
            ...params.metadata
        }
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${config.APP_URL}/dashboard/artist/settings?stripe=refresh`,
        return_url: `${config.APP_URL}/dashboard/artist/settings?stripe=success`,
        type: "account_onboarding"
    });

    return {
        accountId: account.id,
        onboardingUrl: accountLink.url
    };
}

/**
 * Get Connect account status
 */
export async function getConnectAccountStatus(accountId: string): Promise<{
    isComplete: boolean;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requirements: string[];
}> {
    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve(accountId);

    return {
        isComplete: account.details_submitted && account.charges_enabled && account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements?.currently_due || []
    };
}

/**
 * Create onboarding link for existing account
 */
export async function createOnboardingLink(accountId: string): Promise<string> {
    const stripe = getStripeClient();

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${config.APP_URL}/dashboard/artist/settings?stripe=refresh`,
        return_url: `${config.APP_URL}/dashboard/artist/settings?stripe=success`,
        type: "account_onboarding"
    });

    return accountLink.url;
}

/**
 * Create login link for Connect dashboard
 */
export async function createDashboardLink(accountId: string): Promise<string> {
    const stripe = getStripeClient();
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
}

/**
 * Transfer funds to artist account
 */
export async function transferToArtist(params: PayoutParams): Promise<PayoutResult> {
    const stripe = getStripeClient();

    const transfer = await stripe.transfers.create({
        amount: params.amount,
        currency: params.currency || "eur",
        destination: params.artistStripeAccountId,
        description: params.description || "Artist payout from Altus Ink",
        metadata: params.metadata
    });

    return {
        transferId: transfer.id,
        amount: transfer.amount,
        status: "pending",
        arrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Estimate 2 days
    };
}

/**
 * Get artist balance from Connect account
 */
export async function getArtistBalance(accountId: string): Promise<BalanceInfo> {
    const stripe = getStripeClient();
    const balance = await stripe.balance.retrieve({
        stripeAccount: accountId
    });

    const available = balance.available.find(b => b.currency === "eur")?.amount || 0;
    const pending = balance.pending.find(b => b.currency === "eur")?.amount || 0;

    return {
        available,
        pending,
        currency: "eur"
    };
}

// =============================================================================
// WEBHOOK HANDLING
// =============================================================================

/**
 * Verify and construct webhook event
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const stripe = getStripeClient();

    if (!stripeConfig.webhookSecret) {
        throw new Error("Stripe webhook secret not configured");
    }

    return stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeConfig.webhookSecret
    );
}

/**
 * Handle webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<{
    handled: boolean;
    action?: string;
    bookingId?: string;
    error?: string;
}> {
    const eventType = event.type;
    const eventData = event.data.object as any;

    try {
        switch (eventType) {
            // Checkout completed
            case "checkout.session.completed": {
                const session = eventData as Stripe.Checkout.Session;
                const bookingId = session.metadata?.bookingId;

                if (bookingId) {
                    return {
                        handled: true,
                        action: "payment_completed",
                        bookingId
                    };
                }
                break;
            }

            // Payment succeeded
            case "payment_intent.succeeded": {
                const paymentIntent = eventData as Stripe.PaymentIntent;
                const bookingId = paymentIntent.metadata?.bookingId;

                if (bookingId) {
                    return {
                        handled: true,
                        action: "payment_succeeded",
                        bookingId
                    };
                }
                break;
            }

            // Payment failed
            case "payment_intent.payment_failed": {
                const paymentIntent = eventData as Stripe.PaymentIntent;
                const bookingId = paymentIntent.metadata?.bookingId;

                if (bookingId) {
                    return {
                        handled: true,
                        action: "payment_failed",
                        bookingId,
                        error: paymentIntent.last_payment_error?.message
                    };
                }
                break;
            }

            // Refund created
            case "charge.refunded": {
                const charge = eventData as Stripe.Charge;
                const bookingId = charge.metadata?.bookingId;

                if (bookingId) {
                    return {
                        handled: true,
                        action: "refund_processed",
                        bookingId
                    };
                }
                break;
            }

            // Connect account updated
            case "account.updated": {
                const account = eventData as Stripe.Account;
                return {
                    handled: true,
                    action: "account_updated"
                };
            }

            // Payout events
            case "payout.paid": {
                return {
                    handled: true,
                    action: "payout_completed"
                };
            }

            case "payout.failed": {
                return {
                    handled: true,
                    action: "payout_failed",
                    error: (eventData as Stripe.Payout).failure_message || undefined
                };
            }

            default:
                return { handled: false };
        }
    } catch (error: any) {
        console.error(`Error handling webhook ${eventType}:`, error);
        return {
            handled: false,
            error: error.message
        };
    }

    return { handled: false };
}

// =============================================================================
// CUSTOMER MANAGEMENT
// =============================================================================

/**
 * Create or retrieve customer
 */
export async function getOrCreateCustomer(params: {
    email: string;
    name: string;
    phone?: string;
    metadata?: Record<string, string>;
}): Promise<string> {
    const stripe = getStripeClient();

    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
        email: params.email,
        limit: 1
    });

    if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: {
            source: "altusink",
            ...params.metadata
        }
    });

    return customer.id;
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(customerId: string): Promise<Array<{
    id: string;
    type: string;
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
}>> {
    const stripe = getStripeClient();

    const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card"
    });

    return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year
    }));
}

// =============================================================================
// INVOICE MANAGEMENT
// =============================================================================

/**
 * Create an invoice for a booking
 */
export async function createInvoice(params: {
    customerId: string;
    bookingId: string;
    items: Array<{ description: string; amount: number }>;
    dueDate?: Date;
}): Promise<{ invoiceId: string; invoiceUrl: string }> {
    const stripe = getStripeClient();

    // Create invoice
    const invoice = await stripe.invoices.create({
        customer: params.customerId,
        collection_method: "send_invoice",
        days_until_due: params.dueDate ? Math.ceil((params.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 7,
        metadata: {
            bookingId: params.bookingId,
            source: "altusink"
        }
    });

    // Add invoice items
    for (const item of params.items) {
        await stripe.invoiceItems.create({
            customer: params.customerId,
            invoice: invoice.id,
            amount: item.amount,
            currency: "eur",
            description: item.description
        });
    }

    // Finalize and send
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);

    return {
        invoiceId: finalizedInvoice.id,
        invoiceUrl: finalizedInvoice.hosted_invoice_url || ""
    };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format amount for display
 */
export function formatAmount(amountInCents: number, currency: string = "eur"): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: currency.toUpperCase()
    }).format(amountInCents / 100);
}

/**
 * Convert amount to cents
 */
export function toCents(amount: number): number {
    return Math.round(amount * 100);
}

/**
 * Convert cents to amount
 */
export function fromCents(cents: number): number {
    return cents / 100;
}

/**
 * Validate card number (basic Luhn check)
 */
export function isValidCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Get card brand from number prefix
 */
export function getCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\D/g, "");

    if (/^4/.test(number)) return "visa";
    if (/^5[1-5]/.test(number)) return "mastercard";
    if (/^3[47]/.test(number)) return "amex";
    if (/^6(?:011|5)/.test(number)) return "discover";
    if (/^(?:2131|1800|35)/.test(number)) return "jcb";

    return "unknown";
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
    return features.stripe;
}

/**
 * Get platform fee for amount
 */
export function getPlatformFee(amount: number): number {
    return Math.round(amount * ((stripeConfig.platformFeePercent || 15) / 100));
}

/**
 * Get artist share after platform fee
 */
export function getArtistShare(amount: number): number {
    return amount - getPlatformFee(amount);
}

// =============================================================================
// REPORTING
// =============================================================================

/**
 * Get payment statistics for a date range
 */
export async function getPaymentStats(params: {
    startDate: Date;
    endDate: Date;
    artistId?: string;
}): Promise<{
    totalAmount: number;
    totalCount: number;
    successfulCount: number;
    failedCount: number;
    refundedAmount: number;
    averageAmount: number;
}> {
    const stripe = getStripeClient();

    const charges = await stripe.charges.list({
        created: {
            gte: Math.floor(params.startDate.getTime() / 1000),
            lte: Math.floor(params.endDate.getTime() / 1000)
        },
        limit: 100
    });

    let filtered = charges.data;
    if (params.artistId) {
        filtered = filtered.filter(c => c.metadata?.artistId === params.artistId);
    }

    const successful = filtered.filter(c => c.status === "succeeded");
    const failed = filtered.filter(c => c.status === "failed");
    const refunded = filtered.filter(c => c.refunded);

    const totalAmount = successful.reduce((sum, c) => sum + c.amount, 0);
    const refundedAmount = refunded.reduce((sum, c) => sum + (c.amount_refunded || 0), 0);

    return {
        totalAmount,
        totalCount: filtered.length,
        successfulCount: successful.length,
        failedCount: failed.length,
        refundedAmount,
        averageAmount: successful.length > 0 ? Math.round(totalAmount / successful.length) : 0
    };
}

export default {
    createCheckoutSession,
    getCheckoutSession,
    expireCheckoutSession,
    createPaymentIntent,
    confirmPaymentIntent,
    cancelPaymentIntent,
    getPaymentIntent,
    processRefund,
    getRefundStatus,
    calculateRefundAmount,
    createConnectAccount,
    getConnectAccountStatus,
    createOnboardingLink,
    createDashboardLink,
    transferToArtist,
    getArtistBalance,
    constructWebhookEvent,
    handleWebhookEvent,
    getOrCreateCustomer,
    getCustomerPaymentMethods,
    createInvoice,
    formatAmount,
    toCents,
    fromCents,
    isValidCardNumber,
    getCardBrand,
    isStripeConfigured,
    getPlatformFee,
    getArtistShare,
    getPaymentStats
};
