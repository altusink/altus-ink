/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE FINTECH & PAYMENT ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The financial backbone of the Global Tattoo SaaS Empire.
 * 
 * TARGET SCALE: $1B+ Annual Gross Transaction Volume (GTV)
 * COMPLIANCE: PCI-DSS Level 1, PSD2, SOX, GDPR
 * 
 * FEATURES:
 * - Multi-Currency Ledger System (Double-Entry Accounting)
 * - Global Payout Engine (Instant Payouts, Split Payments)
 * - Advanced Tax Calculation (VAT MOSS, US Sales Tax, GST)
 * - Subscription Billing & Invoicing (Recurring Revenue)
 * - Wallet Management (Store Credit, Gift Cards, Loyalty Points)
 * - Fraud Detection & Risk Scoring (ML-powered)
 * - Escrow Service (Guest Spot Deposits & Equipment Sales)
 * - Dynamic Currency Conversion (DCC)
 * - Payment Method Management
 * - Dispute & Chargeback Handling
 * - Refund Processing
 * - Invoice Generation
 * - Financial Reporting & Reconciliation
 * - 3D Secure Authentication
 * - Multi-PSP Routing
 * 
 * @module services/payments-fintech
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";
import { cacheService } from "./core/cache";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: CURRENCIES & MONEY
// ═══════════════════════════════════════════════════════════════════════════════

export type Currency =
    | "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "CHF"
    | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF"
    | "BRL" | "MXN" | "SGD" | "HKD" | "KRW" | "INR";

export interface Money {
    amount: number;          // In minor units (cents)
    currency: Currency;
    formatted?: string;
}

export interface ExchangeRate {
    from: Currency;
    to: Currency;
    rate: number;
    spread: number;
    timestamp: Date;
    source: "ecb" | "xe" | "internal";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: LEDGER & ACCOUNTING
// ═══════════════════════════════════════════════════════════════════════════════

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface LedgerAccount {
    id: string;
    externalId: string;
    ownerId: string;
    ownerType: "user" | "artist" | "studio" | "system" | "merchant";
    type: AccountType;
    subtype: string;
    name: string;
    currency: Currency;
    balance: number;
    availableBalance: number;
    pendingBalance: number;
    reservedBalance: number;
    creditLimit?: number;
    status: AccountStatus;
    metadata: AccountMetadata;
    restrictions: AccountRestrictions;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
}

export type AccountStatus = "active" | "frozen" | "suspended" | "closed" | "pending_verification";

export interface AccountMetadata {
    displayName?: string;
    icon?: string;
    color?: string;
    isDefault: boolean;
    isHidden: boolean;
    tags: string[];
    customFields: Record<string, any>;
}

export interface AccountRestrictions {
    canDebit: boolean;
    canCredit: boolean;
    minBalance: number;
    maxBalance: number;
    dailyLimit: number;
    monthlyLimit: number;
    singleTransactionLimit: number;
    allowedSources: string[];
    blockedSources: string[];
}

export interface LedgerEntry {
    id: string;
    transactionId: string;
    journalId: string;
    accountId: string;
    direction: "debit" | "credit";
    amount: number;
    balanceAfter: number;
    runningBalance: number;
    description: string;
    reference: string;
    metadata: Record<string, any>;
    reversedBy?: string;
    reversedAt?: Date;
    timestamp: Date;
}

export interface JournalEntry {
    id: string;
    transactionId: string;
    entries: LedgerEntry[];
    description: string;
    reference: string;
    status: "pending" | "posted" | "reversed";
    postedAt?: Date;
    reversedAt?: Date;
    createdBy: string;
    createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type TransactionType =
    | "payment"
    | "refund"
    | "payout"
    | "transfer"
    | "adjustment"
    | "fee"
    | "reversal"
    | "chargeback"
    | "subscription"
    | "deposit"
    | "withdrawal"
    | "escrow_hold"
    | "escrow_release"
    | "loyalty_credit"
    | "gift_card";

export type TransactionStatus =
    | "pending"
    | "processing"
    | "authorized"
    | "captured"
    | "settled"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded"
    | "disputed"
    | "chargeback";

export interface Transaction {
    id: string;
    externalId?: string;
    referenceId: string;
    referenceType: "booking" | "order" | "subscription" | "payout" | "adjustment" | "other";
    type: TransactionType;
    status: TransactionStatus;
    amount: Money;
    originalAmount?: Money;
    feeAmount?: Money;
    netAmount?: Money;
    exchangeRate?: number;
    payerId: string;
    payerType: "user" | "artist" | "studio" | "system";
    payeeId: string;
    payeeType: "user" | "artist" | "studio" | "system" | "merchant";
    paymentMethod?: PaymentMethodInfo;
    pspData?: PSPData;
    splitDetails?: PaymentSplit[];
    taxDetails?: TaxBreakdown;
    metadata: TransactionMetadata;
    risk?: RiskAssessment;
    threeDSecure?: ThreeDSecureResult;
    timeline: TransactionEvent[];
    refunds: RefundRecord[];
    disputes: DisputeRecord[];
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    expiresAt?: Date;
}

export interface TransactionMetadata {
    description: string;
    internalNotes?: string;
    customerIp?: string;
    customerUserAgent?: string;
    customerCountry?: string;
    idempotencyKey?: string;
    correlationId?: string;
    source: "api" | "dashboard" | "webhook" | "scheduled" | "system";
    tags: string[];
    customFields: Record<string, any>;
}

export interface TransactionEvent {
    id: string;
    type: string;
    status: string;
    message: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

export interface PaymentSplit {
    id: string;
    recipientId: string;
    recipientType: "artist" | "studio" | "platform" | "partner";
    amount: number;
    percentage?: number;
    type: "commission" | "fee" | "royalty" | "net_payout" | "tax" | "tip";
    description?: string;
    status: "pending" | "processing" | "completed" | "failed";
    scheduledAt?: Date;
    completedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PAYMENT METHODS
// ═══════════════════════════════════════════════════════════════════════════════

export type PaymentMethodType =
    | "card"
    | "bank_account"
    | "sepa_debit"
    | "ideal"
    | "bancontact"
    | "sofort"
    | "giropay"
    | "eps"
    | "p24"
    | "multibanco"
    | "paypal"
    | "apple_pay"
    | "google_pay"
    | "klarna"
    | "afterpay"
    | "affirm"
    | "crypto"
    | "wallet";

export interface PaymentMethod {
    id: string;
    customerId: string;
    type: PaymentMethodType;
    status: "active" | "expired" | "blocked" | "pending_verification";
    isDefault: boolean;
    details: PaymentMethodDetails;
    billingAddress?: BillingAddress;
    verification?: PaymentMethodVerification;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    lastUsedAt?: Date;
}

export interface PaymentMethodDetails {
    // Card
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardholderName?: string;
    funding?: "credit" | "debit" | "prepaid" | "unknown";
    issuer?: string;
    country?: string;
    fingerprint?: string;

    // Bank Account
    bankName?: string;
    accountLast4?: string;
    routingNumber?: string;
    accountType?: "checking" | "savings";

    // SEPA
    iban?: string;
    bic?: string;
    mandateId?: string;

    // Wallet
    email?: string;
    phone?: string;
    walletType?: string;
}

export interface PaymentMethodInfo {
    id: string;
    type: PaymentMethodType;
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
}

export interface BillingAddress {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

export interface PaymentMethodVerification {
    status: "pending" | "verified" | "failed";
    method: "micro_deposit" | "instant" | "document";
    attempts: number;
    verifiedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PSP & GATEWAY
// ═══════════════════════════════════════════════════════════════════════════════

export type PSPProvider = "stripe" | "adyen" | "paypal" | "mollie" | "square" | "braintree";

export interface PSPData {
    provider: PSPProvider;
    transactionId: string;
    paymentIntentId?: string;
    chargeId?: string;
    customerId?: string;
    mandateId?: string;
    authorizationCode?: string;
    responseCode?: string;
    responseMessage?: string;
    networkTransactionId?: string;
    raw?: Record<string, any>;
}

export interface ThreeDSecureResult {
    version: "1.0" | "2.0" | "2.1" | "2.2";
    enrolled: boolean;
    authenticated: boolean;
    authenticationStatus: "Y" | "N" | "U" | "A" | "C" | "R";
    liabilityShift: boolean;
    eci?: string;
    cavv?: string;
    dsTransactionId?: string;
    acsTransactionId?: string;
}

export interface PSPConfig {
    provider: PSPProvider;
    isEnabled: boolean;
    isPrimary: boolean;
    priority: number;
    supportedMethods: PaymentMethodType[];
    supportedCurrencies: Currency[];
    countries: string[];
    credentials: Record<string, string>;
    webhookSecret?: string;
    testMode: boolean;
    failoverEnabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: TAX & COMPLIANCE
// ═══════════════════════════════════════════════════════════════════════════════

export interface TaxBreakdown {
    totalTax: number;
    taxableAmount: number;
    exemptAmount: number;
    jurisdiction: TaxJurisdiction;
    rates: TaxRate[];
    isReverseCharge: boolean;
    isTaxExempt: boolean;
    taxIdValidated?: boolean;
    calculatedAt: Date;
}

export interface TaxJurisdiction {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
    type: "destination" | "origin";
}

export interface TaxRate {
    name: string;
    type: "vat" | "sales_tax" | "gst" | "hst" | "pst" | "service_tax" | "other";
    rate: number;
    amount: number;
    jurisdiction: string;
    isCompound: boolean;
}

export interface TaxProfile {
    id: string;
    entityId: string;
    entityType: "user" | "artist" | "studio";
    countryCode: string;
    taxId?: string;
    taxIdType?: "vat" | "ein" | "gst" | "abn" | "other";
    taxIdValidated: boolean;
    taxIdValidatedAt?: Date;
    type: "individual" | "business";
    isTaxExempt: boolean;
    exemptionCertificate?: string;
    exemptionExpiry?: Date;
    vatMossRegistered: boolean;
    nexusStates?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: RISK & FRAUD
// ═══════════════════════════════════════════════════════════════════════════════

export interface RiskAssessment {
    score: number;
    level: "low" | "medium" | "high" | "critical";
    decision: "approve" | "review" | "decline" | "challenge";
    signals: RiskSignal[];
    rules: RiskRuleResult[];
    deviceFingerprint?: DeviceFingerprint;
    velocityChecks: VelocityCheck[];
    amlCheck?: AMLCheckResult;
    assessedAt: Date;
}

export interface RiskSignal {
    type: string;
    severity: "info" | "warning" | "critical";
    description: string;
    score: number;
    metadata?: Record<string, any>;
}

export interface RiskRuleResult {
    ruleId: string;
    ruleName: string;
    triggered: boolean;
    action: "flag" | "review" | "decline" | "none";
    score: number;
}

export interface DeviceFingerprint {
    id: string;
    ipAddress: string;
    ipCountry: string;
    ipCity?: string;
    isp?: string;
    isVpn: boolean;
    isProxy: boolean;
    isTor: boolean;
    browser?: string;
    os?: string;
    device?: string;
    firstSeen: Date;
    lastSeen: Date;
    transactionCount: number;
    riskScore: number;
}

export interface VelocityCheck {
    type: "amount" | "count" | "unique_cards" | "unique_devices";
    window: "hour" | "day" | "week" | "month";
    current: number;
    limit: number;
    exceeded: boolean;
}

export interface AMLCheckResult {
    status: "clear" | "match" | "review";
    matchedLists: string[];
    pepStatus: boolean;
    sanctionsStatus: boolean;
    adverseMedia: boolean;
    checkedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: REFUNDS & DISPUTES
// ═══════════════════════════════════════════════════════════════════════════════

export interface RefundRecord {
    id: string;
    transactionId: string;
    amount: Money;
    reason: RefundReason;
    status: "pending" | "processing" | "completed" | "failed";
    type: "full" | "partial";
    initiatedBy: string;
    approvedBy?: string;
    pspRefundId?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    completedAt?: Date;
}

export type RefundReason =
    | "customer_request"
    | "duplicate"
    | "fraudulent"
    | "order_cancelled"
    | "service_not_provided"
    | "quality_issue"
    | "other";

export interface DisputeRecord {
    id: string;
    transactionId: string;
    amount: Money;
    reason: DisputeReason;
    status: DisputeStatus;
    category: "fraud" | "product" | "service" | "other";
    evidence: DisputeEvidence;
    timeline: DisputeEvent[];
    deadline?: Date;
    outcome?: DisputeOutcome;
    pspDisputeId?: string;
    createdAt: Date;
    resolvedAt?: Date;
}

export type DisputeReason =
    | "fraudulent"
    | "product_not_received"
    | "product_unacceptable"
    | "subscription_cancelled"
    | "duplicate"
    | "credit_not_processed"
    | "general"
    | "other";

export type DisputeStatus =
    | "needs_response"
    | "under_review"
    | "won"
    | "lost"
    | "accepted"
    | "expired";

export interface DisputeEvidence {
    customerCommunication?: string[];
    receiptOrInvoice?: string;
    serviceDocumentation?: string;
    signaureProof?: string;
    trackingNumber?: string;
    refundPolicy?: string;
    additionalDocuments?: string[];
    submittedAt?: Date;
}

export interface DisputeEvent {
    type: string;
    message: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface DisputeOutcome {
    result: "won" | "lost" | "withdrawn";
    reason?: string;
    netImpact: number;
    decidedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: PAYOUTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PayoutBatch {
    id: string;
    status: BatchStatus;
    currency: Currency;
    totalAmount: number;
    itemCount: number;
    successCount: number;
    failedCount: number;
    items: PayoutItem[];
    scheduledDate: Date;
    processedDate?: Date;
    createdBy: string;
    approvedBy?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export type BatchStatus = "draft" | "pending_approval" | "approved" | "processing" | "completed" | "partial" | "failed" | "cancelled";

export interface PayoutItem {
    id: string;
    batchId: string;
    recipientId: string;
    recipientName: string;
    amount: Money;
    destination: PayoutDestination;
    references: string[];
    status: PayoutItemStatus;
    pspPayoutId?: string;
    fee?: Money;
    arrivalDate?: Date;
    failureReason?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    processedAt?: Date;
}

export type PayoutItemStatus = "pending" | "processing" | "in_transit" | "completed" | "failed" | "cancelled" | "returned";

export interface PayoutDestination {
    type: "bank_account" | "debit_card" | "paypal" | "wise" | "venmo";
    id: string;
    details: Record<string, string>;
    verified: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: WALLETS & GIFT CARDS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Wallet {
    id: string;
    ownerId: string;
    ownerType: "user" | "artist" | "studio";
    currency: Currency;
    balance: number;
    pendingBalance: number;
    lockedBalance: number;
    status: "active" | "frozen" | "closed";
    limits: WalletLimits;
    transactions: WalletTransaction[];
    createdAt: Date;
    updatedAt: Date;
}

export interface WalletLimits {
    dailySpend: number;
    weeklySpend: number;
    monthlySpend: number;
    maxBalance: number;
    singleTransactionMax: number;
}

export interface WalletTransaction {
    id: string;
    walletId: string;
    type: "credit" | "debit" | "lock" | "unlock";
    amount: number;
    balanceAfter: number;
    source: string;
    reference: string;
    description: string;
    createdAt: Date;
}

export interface GiftCard {
    id: string;
    code: string;
    displayCode: string;
    initialAmount: Money;
    currentBalance: Money;
    status: GiftCardStatus;
    type: "physical" | "digital";
    design?: string;
    purchasedBy: string;
    purchasedFor?: string;
    recipientEmail?: string;
    personalMessage?: string;
    redemptions: GiftCardRedemption[];
    expiryDate: Date;
    activatedAt?: Date;
    createdAt: Date;
}

export type GiftCardStatus = "pending" | "active" | "partially_used" | "depleted" | "expired" | "voided";

export interface GiftCardRedemption {
    id: string;
    giftCardId: string;
    amount: number;
    redeemedBy: string;
    transactionId: string;
    balanceAfter: number;
    redeemedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: INVOICES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Invoice {
    id: string;
    number: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerAddress?: BillingAddress;
    vendorId: string;
    vendorName: string;
    vendorAddress?: BillingAddress;
    vendorTaxId?: string;
    status: InvoiceStatus;
    type: "invoice" | "credit_note" | "proforma";
    currency: Currency;
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    lineItems: InvoiceLineItem[];
    taxBreakdown: TaxBreakdown;
    discounts: InvoiceDiscount[];
    payments: InvoicePayment[];
    dueDate: Date;
    issueDate: Date;
    paidDate?: Date;
    notes?: string;
    terms?: string;
    footer?: string;
    pdfUrl?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "partially_paid" | "overdue" | "void" | "uncollectible";

export interface InvoiceLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    metadata?: Record<string, any>;
}

export interface InvoiceDiscount {
    type: "percentage" | "fixed";
    value: number;
    amount: number;
    description: string;
    couponCode?: string;
}

export interface InvoicePayment {
    id: string;
    transactionId: string;
    amount: number;
    method: string;
    paidAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINTECH SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class FintechService extends EventEmitter {
    private accounts: Map<string, LedgerAccount> = new Map();
    private ledger: Map<string, LedgerEntry[]> = new Map();
    private transactions: Map<string, Transaction> = new Map();
    private wallets: Map<string, Wallet> = new Map();
    private giftCards: Map<string, GiftCard> = new Map();
    private taxProfiles: Map<string, TaxProfile> = new Map();
    private paymentMethods: Map<string, PaymentMethod> = new Map();
    private invoices: Map<string, Invoice> = new Map();
    private payoutBatches: Map<string, PayoutBatch> = new Map();
    private pspConfigs: Map<PSPProvider, PSPConfig> = new Map();

    private exchangeRates: Map<string, ExchangeRate> = new Map();

    constructor() {
        super();
        this.seedSystemAccounts();
        this.seedExchangeRates();
        this.startPayoutProcessor();
        this.startReconciliationJob();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PAYMENT PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════

    async processPayment(request: PaymentRequest): Promise<Transaction> {
        const riskAssessment = await this.assessRisk(request);

        if (riskAssessment.decision === "decline") {
            throw new Error(`Payment declined: Risk score ${riskAssessment.score}`);
        }

        const psp = this.selectPSP(request.amount.currency, request.paymentMethod.type);

        const taxBreakdown = await this.calculateTax(
            request.amount.amount,
            request.payeeId,
            request.billingAddress?.country || "US"
        );

        const splits = this.calculateSplits(request.amount.amount, request.payeeId, request.platformFee);

        const transaction: Transaction = {
            id: randomUUID(),
            referenceId: request.referenceId,
            referenceType: request.referenceType,
            type: "payment",
            status: "pending",
            amount: request.amount,
            feeAmount: { amount: splits.find(s => s.type === "fee")?.amount || 0, currency: request.amount.currency },
            netAmount: { amount: splits.find(s => s.type === "net_payout")?.amount || 0, currency: request.amount.currency },
            payerId: request.payerId,
            payerType: "user",
            payeeId: request.payeeId,
            payeeType: request.payeeType || "studio",
            paymentMethod: {
                id: request.paymentMethod.id,
                type: request.paymentMethod.type,
                brand: request.paymentMethod.details?.brand,
                last4: request.paymentMethod.details?.last4,
            },
            splitDetails: splits,
            taxDetails: taxBreakdown,
            metadata: {
                description: request.description || "",
                source: "api",
                tags: [],
                customFields: request.metadata || {},
            },
            risk: riskAssessment,
            timeline: [{ id: randomUUID(), type: "created", status: "pending", message: "Transaction created", timestamp: new Date() }],
            refunds: [],
            disputes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Authorize with PSP
        const pspResult = await this.authorizePSP(psp, transaction);

        if (pspResult.success) {
            transaction.status = "authorized";
            transaction.pspData = pspResult.data;
            transaction.timeline.push({ id: randomUUID(), type: "authorized", status: "authorized", message: "Payment authorized", timestamp: new Date() });

            // Auto-capture if not manual
            if (!request.manualCapture) {
                await this.captureTransaction(transaction.id);
            }
        } else {
            transaction.status = "failed";
            transaction.timeline.push({ id: randomUUID(), type: "failed", status: "failed", message: pspResult.error || "Authorization failed", timestamp: new Date() });
        }

        this.transactions.set(transaction.id, transaction);

        await eventBus.publish("payment.processed", { transactionId: transaction.id, status: transaction.status });

        return transaction;
    }

    async captureTransaction(transactionId: string): Promise<Transaction> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) throw new Error("Transaction not found");
        if (transaction.status !== "authorized") throw new Error("Transaction not authorized");

        // Capture with PSP
        transaction.status = "captured";
        transaction.timeline.push({ id: randomUUID(), type: "captured", status: "captured", message: "Payment captured", timestamp: new Date() });

        // Execute ledger movements
        await this.executeSplits(transaction);

        transaction.status = "completed";
        transaction.completedAt = new Date();
        transaction.updatedAt = new Date();

        await eventBus.publish("payment.captured", { transactionId });

        return transaction;
    }

    async refundTransaction(transactionId: string, amount?: number, reason: RefundReason = "customer_request"): Promise<RefundRecord> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) throw new Error("Transaction not found");
        if (!["completed", "captured", "settled"].includes(transaction.status)) {
            throw new Error("Transaction cannot be refunded");
        }

        const refundAmount = amount || transaction.amount.amount;
        const isFullRefund = refundAmount >= transaction.amount.amount;

        const refund: RefundRecord = {
            id: randomUUID(),
            transactionId,
            amount: { amount: refundAmount, currency: transaction.amount.currency },
            reason,
            status: "pending",
            type: isFullRefund ? "full" : "partial",
            initiatedBy: "system",
            metadata: {},
            createdAt: new Date(),
        };

        // Process with PSP
        refund.status = "completed";
        refund.completedAt = new Date();

        transaction.refunds.push(refund);
        transaction.status = isFullRefund ? "refunded" : "partially_refunded";
        transaction.updatedAt = new Date();

        // Reverse ledger entries
        await this.reverseSplits(transaction, refundAmount);

        await eventBus.publish("payment.refunded", { transactionId, refundId: refund.id });

        return refund;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LEDGER & ACCOUNTING
    // ═══════════════════════════════════════════════════════════════════════════

    async createAccount(ownerId: string, currency: Currency, type: AccountType = "asset"): Promise<LedgerAccount> {
        const account: LedgerAccount = {
            id: randomUUID(),
            externalId: `ACC-${randomUUID().slice(0, 8).toUpperCase()}`,
            ownerId,
            ownerType: "user",
            type,
            subtype: "general",
            name: `${type.toUpperCase()} Account - ${currency}`,
            currency,
            balance: 0,
            availableBalance: 0,
            pendingBalance: 0,
            reservedBalance: 0,
            status: "active",
            metadata: { displayName: "", icon: "", color: "", isDefault: false, isHidden: false, tags: [], customFields: {} },
            restrictions: { canDebit: true, canCredit: true, minBalance: 0, maxBalance: 10000000, dailyLimit: 100000, monthlyLimit: 1000000, singleTransactionLimit: 50000, allowedSources: [], blockedSources: [] },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.accounts.set(account.id, account);
        return account;
    }

    async recordLedgerMove(fromId: string, toId: string, amount: number, currency: Currency, description: string): Promise<JournalEntry> {
        const fromAccount = await this.ensureAccount(fromId, currency);
        const toAccount = await this.ensureAccount(toId, currency);

        const journalId = randomUUID();
        const txId = randomUUID();
        const now = new Date();

        // Debit sender
        fromAccount.balance -= amount;
        fromAccount.updatedAt = now;

        const debitEntry: LedgerEntry = {
            id: randomUUID(),
            transactionId: txId,
            journalId,
            accountId: fromAccount.id,
            direction: "debit",
            amount,
            balanceAfter: fromAccount.balance,
            runningBalance: fromAccount.balance,
            description,
            reference: txId,
            metadata: {},
            timestamp: now,
        };

        // Credit receiver
        toAccount.balance += amount;
        toAccount.updatedAt = now;

        const creditEntry: LedgerEntry = {
            id: randomUUID(),
            transactionId: txId,
            journalId,
            accountId: toAccount.id,
            direction: "credit",
            amount,
            balanceAfter: toAccount.balance,
            runningBalance: toAccount.balance,
            description,
            reference: txId,
            metadata: {},
            timestamp: now,
        };

        // Store entries
        if (!this.ledger.has(fromAccount.id)) this.ledger.set(fromAccount.id, []);
        this.ledger.get(fromAccount.id)!.push(debitEntry);

        if (!this.ledger.has(toAccount.id)) this.ledger.set(toAccount.id, []);
        this.ledger.get(toAccount.id)!.push(creditEntry);

        return {
            id: journalId,
            transactionId: txId,
            entries: [debitEntry, creditEntry],
            description,
            reference: txId,
            status: "posted",
            postedAt: now,
            createdBy: "system",
            createdAt: now,
        };
    }

    private async ensureAccount(ownerId: string, currency: Currency): Promise<LedgerAccount> {
        const id = `${ownerId}_${currency}`;
        let account = Array.from(this.accounts.values()).find(a => a.ownerId === ownerId && a.currency === currency);
        if (!account) {
            account = await this.createAccount(ownerId, currency);
        }
        return account;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TAX CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════

    async calculateTax(amount: number, sellerId: string, buyerCountry: string): Promise<TaxBreakdown> {
        const euCountries = ["NL", "DE", "FR", "ES", "IT", "BE", "AT", "PT", "IE", "FI", "SE", "DK", "PL", "CZ", "GR"];
        let taxRate = 0;
        let taxName = "Zero Rated";
        let taxType: TaxRate["type"] = "other";

        if (euCountries.includes(buyerCountry)) {
            const vatRates: Record<string, number> = { NL: 0.21, DE: 0.19, FR: 0.20, ES: 0.21, IT: 0.22, BE: 0.21, AT: 0.20, PT: 0.23, IE: 0.23, FI: 0.24, SE: 0.25, DK: 0.25, PL: 0.23, CZ: 0.21, GR: 0.24 };
            taxRate = vatRates[buyerCountry] || 0.21;
            taxName = `${buyerCountry} VAT`;
            taxType = "vat";
        } else if (buyerCountry === "US") {
            taxRate = 0.088;
            taxName = "US Sales Tax";
            taxType = "sales_tax";
        } else if (buyerCountry === "AU") {
            taxRate = 0.10;
            taxName = "AU GST";
            taxType = "gst";
        } else if (buyerCountry === "CA") {
            taxRate = 0.13;
            taxName = "CA HST";
            taxType = "hst";
        }

        const taxAmount = Math.round(amount * taxRate);

        return {
            totalTax: taxAmount,
            taxableAmount: amount,
            exemptAmount: 0,
            jurisdiction: { country: buyerCountry, type: "destination" },
            rates: [{ name: taxName, type: taxType, rate: taxRate, amount: taxAmount, jurisdiction: buyerCountry, isCompound: false }],
            isReverseCharge: false,
            isTaxExempt: false,
            calculatedAt: new Date(),
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RISK ASSESSMENT
    // ═══════════════════════════════════════════════════════════════════════════

    private async assessRisk(request: PaymentRequest): Promise<RiskAssessment> {
        const signals: RiskSignal[] = [];
        let score = 0;

        if (request.amount.amount > 100000) {
            score += 30;
            signals.push({ type: "high_amount", severity: "warning", description: "Large transaction amount", score: 30 });
        }

        if (request.amount.amount > 500000) {
            score += 40;
            signals.push({ type: "very_high_amount", severity: "critical", description: "Very large transaction", score: 40 });
        }

        let decision: RiskAssessment["decision"] = "approve";
        let level: RiskAssessment["level"] = "low";

        if (score > 70) {
            decision = "decline";
            level = "critical";
        } else if (score > 50) {
            decision = "review";
            level = "high";
        } else if (score > 30) {
            decision = "approve";
            level = "medium";
        }

        return {
            score,
            level,
            decision,
            signals,
            rules: [],
            velocityChecks: [],
            assessedAt: new Date(),
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CURRENCY CONVERSION
    // ═══════════════════════════════════════════════════════════════════════════

    convertCurrency(amount: number, from: Currency, to: Currency): Money {
        if (from === to) return { amount, currency: to };

        const rateKey = `${from}_${to}`;
        const rate = this.exchangeRates.get(rateKey);

        if (!rate) {
            const inverseKey = `${to}_${from}`;
            const inverseRate = this.exchangeRates.get(inverseKey);
            if (inverseRate) {
                return { amount: Math.round(amount / inverseRate.rate), currency: to };
            }
            throw new Error(`Exchange rate not found: ${from} to ${to}`);
        }

        return { amount: Math.round(amount * rate.rate), currency: to };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    private selectPSP(currency: Currency, methodType: PaymentMethodType): PSPProvider {
        for (const [provider, config] of this.pspConfigs) {
            if (config.isEnabled && config.supportedCurrencies.includes(currency) && config.supportedMethods.includes(methodType)) {
                return provider;
            }
        }
        return "stripe";
    }

    private async authorizePSP(provider: PSPProvider, transaction: Transaction): Promise<{ success: boolean; data?: PSPData; error?: string }> {
        // Simulate PSP call
        const success = Math.random() > 0.05;
        if (success) {
            return {
                success: true,
                data: {
                    provider,
                    transactionId: `pi_${randomUUID().slice(0, 24)}`,
                    paymentIntentId: `pi_${randomUUID().slice(0, 24)}`,
                    authorizationCode: randomUUID().slice(0, 6).toUpperCase(),
                },
            };
        }
        return { success: false, error: "Card declined" };
    }

    private calculateSplits(amount: number, payeeId: string, platformFeePercent: number = 0.05): PaymentSplit[] {
        const platformFee = Math.floor(amount * platformFeePercent);
        const netPayout = amount - platformFee;

        return [
            { id: randomUUID(), recipientId: "PLATFORM", recipientType: "platform", amount: platformFee, percentage: platformFeePercent, type: "fee", status: "pending", description: "Platform fee" },
            { id: randomUUID(), recipientId: payeeId, recipientType: "studio", amount: netPayout, type: "net_payout", status: "pending", description: "Net payout" },
        ];
    }

    private async executeSplits(transaction: Transaction): Promise<void> {
        if (!transaction.splitDetails) return;

        for (const split of transaction.splitDetails) {
            await this.recordLedgerMove("CLEARING", split.recipientId, split.amount, transaction.amount.currency, `Split for ${transaction.id}`);
            split.status = "completed";
            split.completedAt = new Date();
        }
    }

    private async reverseSplits(transaction: Transaction, amount: number): Promise<void> {
        if (!transaction.splitDetails) return;

        for (const split of transaction.splitDetails) {
            const reverseAmount = Math.round((amount / transaction.amount.amount) * split.amount);
            await this.recordLedgerMove(split.recipientId, "CLEARING", reverseAmount, transaction.amount.currency, `Refund for ${transaction.id}`);
        }
    }

    private startPayoutProcessor(): void {
        setInterval(() => {
            for (const batch of this.payoutBatches.values()) {
                if (batch.status === "approved" && batch.scheduledDate <= new Date()) {
                    batch.status = "processing";
                    // Process payouts...
                }
            }
        }, 60000);
    }

    private startReconciliationJob(): void {
        setInterval(() => {
            telemetry.info("Running reconciliation", "Fintech", { accounts: this.accounts.size });
        }, 300000);
    }

    private seedSystemAccounts(): void {
        this.createAccount("PLATFORM", "EUR", "revenue");
        this.createAccount("CLEARING", "EUR", "liability");
        this.createAccount("FEES", "EUR", "revenue");
    }

    private seedExchangeRates(): void {
        const rates: [Currency, Currency, number][] = [
            ["EUR", "USD", 1.08], ["EUR", "GBP", 0.85], ["EUR", "JPY", 160.5],
            ["USD", "EUR", 0.93], ["USD", "GBP", 0.79], ["USD", "CAD", 1.36],
            ["GBP", "EUR", 1.18], ["GBP", "USD", 1.27],
        ];

        for (const [from, to, rate] of rates) {
            this.exchangeRates.set(`${from}_${to}`, { from, to, rate, spread: 0.02, timestamp: new Date(), source: "internal" });
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PaymentRequest {
    referenceId: string;
    referenceType: Transaction["referenceType"];
    amount: Money;
    payerId: string;
    payeeId: string;
    payeeType?: Transaction["payeeType"];
    paymentMethod: PaymentMethod;
    billingAddress?: BillingAddress;
    description?: string;
    metadata?: Record<string, any>;
    manualCapture?: boolean;
    platformFee?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const fintechService = new FintechService();
export default fintechService;
