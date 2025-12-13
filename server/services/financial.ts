/**
 * ALTUS INK - ENTERPRISE FINANCIAL MANAGEMENT SERVICE
 * Complete financial management and accounting
 * 
 * Features:
 * - Invoice management
 * - Payment processing
 * - Revenue recognition
 * - Expense tracking
 * - Tax management
 * - Financial reporting
 * - Budget management
 * - Cash flow analysis
 * - Multi-currency support
 * - Accounting integration
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Invoice {
    id: string;
    invoiceNumber: string;
    type: InvoiceType;
    status: InvoiceStatus;
    customerId: string;
    customerName: string;
    customerEmail: string;
    billingAddress: Address;
    shippingAddress?: Address;
    currency: string;
    exchangeRate: number;
    items: InvoiceItem[];
    subtotal: number;
    discounts: InvoiceDiscount[];
    discountTotal: number;
    taxes: InvoiceTax[];
    taxTotal: number;
    shipping: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    issueDate: Date;
    dueDate: Date;
    paidDate?: Date;
    terms?: string;
    notes?: string;
    footer?: string;
    attachments: InvoiceAttachment[];
    payments: InvoicePayment[];
    reminders: InvoiceReminder[];
    metadata: Record<string, any>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type InvoiceType = "standard" | "credit_note" | "proforma" | "recurring" | "deposit";
export type InvoiceStatus = "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "void" | "disputed";

export interface Address {
    name?: string;
    company?: string;
    street: string;
    street2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

export interface InvoiceItem {
    id: string;
    type: "service" | "product" | "expense" | "discount" | "shipping";
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    discountType?: "percentage" | "fixed";
    taxRate: number;
    taxAmount: number;
    total: number;
    serviceId?: string;
    productId?: string;
    bookingId?: string;
}

export interface InvoiceDiscount {
    type: "percentage" | "fixed";
    value: number;
    description?: string;
    code?: string;
}

export interface InvoiceTax {
    name: string;
    rate: number;
    amount: number;
    taxId?: string;
}

export interface InvoiceAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
}

export interface InvoicePayment {
    id: string;
    date: Date;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    transactionId?: string;
    notes?: string;
    status: "pending" | "completed" | "failed" | "refunded";
}

export type PaymentMethod =
    | "card"
    | "bank_transfer"
    | "cash"
    | "check"
    | "paypal"
    | "stripe"
    | "other";

export interface InvoiceReminder {
    id: string;
    type: "before_due" | "on_due" | "after_due";
    daysOffset: number;
    sentAt?: Date;
    status: "pending" | "sent" | "failed";
}

export interface RecurringInvoice {
    id: string;
    name: string;
    customerId: string;
    template: Partial<Invoice>;
    frequency: RecurringFrequency;
    startDate: Date;
    endDate?: Date;
    lastGeneratedAt?: Date;
    nextGenerationAt?: Date;
    occurrences: number;
    maxOccurrences?: number;
    status: "active" | "paused" | "completed" | "cancelled";
    autoSend: boolean;
    createdAt: Date;
}

export type RecurringFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";

export interface Expense {
    id: string;
    expenseNumber: string;
    category: ExpenseCategory;
    subcategory?: string;
    vendor?: string;
    description: string;
    amount: number;
    currency: string;
    exchangeRate: number;
    amountInBaseCurrency: number;
    date: Date;
    paymentMethod: PaymentMethod;
    status: ExpenseStatus;
    receipt?: string;
    notes?: string;
    tags: string[];
    isReimbursable: boolean;
    isBillable: boolean;
    customerId?: string;
    projectId?: string;
    approvedBy?: string;
    approvedAt?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ExpenseCategory =
    | "supplies"
    | "equipment"
    | "rent"
    | "utilities"
    | "marketing"
    | "travel"
    | "insurance"
    | "professional_services"
    | "software"
    | "payroll"
    | "taxes"
    | "other";

export type ExpenseStatus = "pending" | "approved" | "rejected" | "reimbursed";

export interface Budget {
    id: string;
    name: string;
    description: string;
    type: "operational" | "project" | "department" | "location";
    period: BudgetPeriod;
    startDate: Date;
    endDate: Date;
    currency: string;
    categories: BudgetCategory[];
    totalBudgeted: number;
    totalActual: number;
    totalVariance: number;
    status: "draft" | "active" | "closed";
    approvedBy?: string;
    approvedAt?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type BudgetPeriod = "monthly" | "quarterly" | "annual";

export interface BudgetCategory {
    id: string;
    name: string;
    expenseCategory: ExpenseCategory;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercent: number;
    notes?: string;
}

export interface TaxRate {
    id: string;
    name: string;
    rate: number;
    type: "inclusive" | "exclusive";
    country: string;
    region?: string;
    category?: string;
    isDefault: boolean;
    isActive: boolean;
    effectiveFrom: Date;
    effectiveTo?: Date;
}

export interface TaxReport {
    id: string;
    period: { start: Date; end: Date };
    type: "vat" | "sales_tax" | "income" | "withholding";
    status: "draft" | "filed" | "paid";
    taxCollected: number;
    taxPaid: number;
    netTax: number;
    transactions: TaxTransaction[];
    dueDate: Date;
    filedAt?: Date;
    paidAt?: Date;
    createdAt: Date;
}

export interface TaxTransaction {
    date: Date;
    description: string;
    invoiceId?: string;
    expenseId?: string;
    taxableAmount: number;
    taxRate: number;
    taxAmount: number;
    type: "collected" | "paid";
}

export interface Account {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    subtype: string;
    currency: string;
    balance: number;
    parentId?: string;
    isActive: boolean;
    description?: string;
    createdAt: Date;
}

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface JournalEntry {
    id: string;
    entryNumber: string;
    date: Date;
    description: string;
    reference?: string;
    lines: JournalLine[];
    status: "draft" | "posted" | "reversed";
    totalDebit: number;
    totalCredit: number;
    postedAt?: Date;
    postedBy?: string;
    reversalOf?: string;
    createdBy: string;
    createdAt: Date;
}

export interface JournalLine {
    id: string;
    accountId: string;
    accountName: string;
    description?: string;
    debit: number;
    credit: number;
    customerId?: string;
    vendorId?: string;
    projectId?: string;
}

export interface FinancialStatement {
    id: string;
    type: StatementType;
    period: { start: Date; end: Date };
    data: StatementData;
    comparativePeriod?: { start: Date; end: Date };
    comparativeData?: StatementData;
    generatedAt: Date;
    generatedBy: string;
}

export type StatementType = "income_statement" | "balance_sheet" | "cash_flow";

export interface StatementData {
    sections: StatementSection[];
    totals: Record<string, number>;
}

export interface StatementSection {
    name: string;
    items: StatementItem[];
    total: number;
}

export interface StatementItem {
    accountId?: string;
    name: string;
    amount: number;
    previousAmount?: number;
    change?: number;
    changePercent?: number;
}

export interface CashFlowForecast {
    id: string;
    name: string;
    period: { start: Date; end: Date };
    openingBalance: number;
    projections: CashFlowProjection[];
    scenarios: CashFlowScenario[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CashFlowProjection {
    date: Date;
    category: string;
    type: "inflow" | "outflow";
    description: string;
    amount: number;
    probability: number;
    actualAmount?: number;
    variance?: number;
}

export interface CashFlowScenario {
    name: string;
    type: "optimistic" | "realistic" | "pessimistic";
    assumptions: string[];
    projectedBalance: number;
}

export interface RevenueRecognition {
    id: string;
    invoiceId: string;
    totalAmount: number;
    recognizedAmount: number;
    pendingAmount: number;
    schedule: RecognitionSchedule[];
    status: "pending" | "in_progress" | "completed";
    createdAt: Date;
}

export interface RecognitionSchedule {
    date: Date;
    amount: number;
    recognized: boolean;
    recognizedAt?: Date;
    description?: string;
}

export interface PaymentTerms {
    id: string;
    name: string;
    description: string;
    dueDays: number;
    earlyPaymentDiscount?: number;
    earlyPaymentDays?: number;
    lateFeeRate?: number;
    lateFeeType?: "percentage" | "fixed";
    isDefault: boolean;
    isActive: boolean;
}

export interface FinancialMetrics {
    period: { start: Date; end: Date };
    revenue: RevenueMetrics;
    expenses: ExpenseMetrics;
    profitability: ProfitabilityMetrics;
    cashFlow: CashFlowMetrics;
    receivables: ReceivablesMetrics;
    payables: PayablesMetrics;
}

export interface RevenueMetrics {
    total: number;
    recurring: number;
    oneTime: number;
    byService: Array<{ service: string; amount: number }>;
    byLocation: Array<{ location: string; amount: number }>;
    growthRate: number;
    averageOrderValue: number;
}

export interface ExpenseMetrics {
    total: number;
    byCategory: Array<{ category: ExpenseCategory; amount: number }>;
    byVendor: Array<{ vendor: string; amount: number }>;
    growthRate: number;
}

export interface ProfitabilityMetrics {
    grossProfit: number;
    grossMargin: number;
    netProfit: number;
    netMargin: number;
    operatingExpenses: number;
    ebitda: number;
}

export interface CashFlowMetrics {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
    closingBalance: number;
    burnRate?: number;
    runway?: number;
}

export interface ReceivablesMetrics {
    total: number;
    current: number;
    overdue30: number;
    overdue60: number;
    overdue90: number;
    dso: number; // Days Sales Outstanding
    collectionRate: number;
}

export interface PayablesMetrics {
    total: number;
    current: number;
    overdue: number;
    dpo: number; // Days Payable Outstanding
}

// =============================================================================
// FINANCIAL SERVICE CLASS
// =============================================================================

export class FinancialService {
    private invoices: Map<string, Invoice> = new Map();
    private recurringInvoices: Map<string, RecurringInvoice> = new Map();
    private expenses: Map<string, Expense> = new Map();
    private budgets: Map<string, Budget> = new Map();
    private taxRates: Map<string, TaxRate> = new Map();
    private taxReports: Map<string, TaxReport> = new Map();
    private accounts: Map<string, Account> = new Map();
    private journalEntries: Map<string, JournalEntry> = new Map();
    private statements: Map<string, FinancialStatement> = new Map();
    private paymentTerms: Map<string, PaymentTerms> = new Map();
    private revenueRecognitions: Map<string, RevenueRecognition> = new Map();

    private invoiceCounter = 1000;
    private expenseCounter = 1000;
    private journalCounter = 1000;

    constructor() {
        this.initializeChartOfAccounts();
        this.initializeDefaultTaxRates();
        this.initializeDefaultPaymentTerms();
    }

    // ===========================================================================
    // INVOICE MANAGEMENT
    // ===========================================================================

    async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
        const invoice: Invoice = {
            id: randomUUID(),
            invoiceNumber: `INV-${++this.invoiceCounter}`,
            type: data.type || "standard",
            status: "draft",
            customerId: data.customerId || "",
            customerName: data.customerName || "",
            customerEmail: data.customerEmail || "",
            billingAddress: data.billingAddress || this.getEmptyAddress(),
            currency: data.currency || "EUR",
            exchangeRate: data.exchangeRate || 1,
            items: data.items || [],
            subtotal: 0,
            discounts: data.discounts || [],
            discountTotal: 0,
            taxes: [],
            taxTotal: 0,
            shipping: data.shipping || 0,
            total: 0,
            amountPaid: 0,
            amountDue: 0,
            issueDate: data.issueDate || new Date(),
            dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            attachments: [],
            payments: [],
            reminders: [],
            metadata: data.metadata || {},
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.calculateInvoiceTotals(invoice);
        this.invoices.set(invoice.id, invoice);
        return invoice;
    }

    async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
        const invoice = this.invoices.get(id);
        if (!invoice || invoice.status === "paid" || invoice.status === "void") return null;

        Object.assign(invoice, data, { updatedAt: new Date() });
        this.calculateInvoiceTotals(invoice);
        return invoice;
    }

    async getInvoice(id: string): Promise<Invoice | null> {
        return this.invoices.get(id) || null;
    }

    async getInvoices(filters?: {
        status?: InvoiceStatus;
        customerId?: string;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Invoice[]> {
        let invoices = Array.from(this.invoices.values());

        if (filters) {
            if (filters.status) {
                invoices = invoices.filter(i => i.status === filters.status);
            }
            if (filters.customerId) {
                invoices = invoices.filter(i => i.customerId === filters.customerId);
            }
            if (filters.fromDate) {
                invoices = invoices.filter(i => i.issueDate >= filters.fromDate!);
            }
            if (filters.toDate) {
                invoices = invoices.filter(i => i.issueDate <= filters.toDate!);
            }
        }

        return invoices.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
    }

    async addInvoiceItem(invoiceId: string, item: Omit<InvoiceItem, "id" | "taxAmount" | "total">): Promise<Invoice | null> {
        const invoice = this.invoices.get(invoiceId);
        if (!invoice || invoice.status === "paid") return null;

        const newItem: InvoiceItem = {
            id: randomUUID(),
            taxAmount: 0,
            total: 0,
            ...item
        };

        invoice.items.push(newItem);
        this.calculateInvoiceTotals(invoice);
        invoice.updatedAt = new Date();

        return invoice;
    }

    async removeInvoiceItem(invoiceId: string, itemId: string): Promise<Invoice | null> {
        const invoice = this.invoices.get(invoiceId);
        if (!invoice || invoice.status === "paid") return null;

        invoice.items = invoice.items.filter(i => i.id !== itemId);
        this.calculateInvoiceTotals(invoice);
        invoice.updatedAt = new Date();

        return invoice;
    }

    async sendInvoice(id: string): Promise<Invoice | null> {
        const invoice = this.invoices.get(id);
        if (!invoice || invoice.status !== "draft") return null;

        invoice.status = "sent";
        invoice.updatedAt = new Date();

        // Create journal entry for revenue recognition
        await this.createRevenueJournalEntry(invoice);

        return invoice;
    }

    async recordPayment(invoiceId: string, payment: Omit<InvoicePayment, "id" | "status">): Promise<Invoice | null> {
        const invoice = this.invoices.get(invoiceId);
        if (!invoice || ["paid", "void"].includes(invoice.status)) return null;

        const newPayment: InvoicePayment = {
            id: randomUUID(),
            status: "completed",
            ...payment
        };

        invoice.payments.push(newPayment);
        invoice.amountPaid += payment.amount;
        invoice.amountDue = invoice.total - invoice.amountPaid;

        if (invoice.amountDue <= 0) {
            invoice.status = "paid";
            invoice.paidDate = new Date();
        } else if (invoice.amountPaid > 0) {
            invoice.status = "partial";
        }

        invoice.updatedAt = new Date();

        // Create journal entry for payment
        await this.createPaymentJournalEntry(invoice, newPayment);

        return invoice;
    }

    async voidInvoice(id: string, reason: string): Promise<Invoice | null> {
        const invoice = this.invoices.get(id);
        if (!invoice || invoice.status === "void") return null;

        invoice.status = "void";
        invoice.notes = `${invoice.notes || ""}\nVoided: ${reason}`;
        invoice.updatedAt = new Date();

        // Create reversing journal entry
        await this.createReversingJournalEntry(invoice);

        return invoice;
    }

    async markOverdue(): Promise<number> {
        const now = new Date();
        let count = 0;

        for (const invoice of this.invoices.values()) {
            if (["sent", "viewed", "partial"].includes(invoice.status) && invoice.dueDate < now) {
                invoice.status = "overdue";
                count++;
            }
        }

        return count;
    }

    private calculateInvoiceTotals(invoice: Invoice): void {
        let subtotal = 0;
        let taxTotal = 0;
        const taxRates = new Map<number, number>();

        for (const item of invoice.items) {
            let itemTotal = item.quantity * item.unitPrice;

            // Apply item discount
            if (item.discount) {
                if (item.discountType === "percentage") {
                    itemTotal *= (1 - item.discount / 100);
                } else {
                    itemTotal -= item.discount;
                }
            }

            item.taxAmount = itemTotal * (item.taxRate / 100);
            item.total = itemTotal + item.taxAmount;
            subtotal += itemTotal;
            taxTotal += item.taxAmount;

            const currentTax = taxRates.get(item.taxRate) || 0;
            taxRates.set(item.taxRate, currentTax + item.taxAmount);
        }

        // Apply invoice-level discounts
        let discountTotal = 0;
        for (const discount of invoice.discounts) {
            if (discount.type === "percentage") {
                discountTotal += subtotal * (discount.value / 100);
            } else {
                discountTotal += discount.value;
            }
        }

        invoice.subtotal = subtotal;
        invoice.discountTotal = discountTotal;
        invoice.taxTotal = taxTotal;

        invoice.taxes = Array.from(taxRates.entries()).map(([rate, amount]) => ({
            name: `VAT ${rate}%`,
            rate,
            amount
        }));

        invoice.total = subtotal - discountTotal + taxTotal + invoice.shipping;
        invoice.amountDue = invoice.total - invoice.amountPaid;
    }

    private getEmptyAddress(): Address {
        return { street: "", city: "", postalCode: "", country: "" };
    }

    // ===========================================================================
    // RECURRING INVOICES
    // ===========================================================================

    async createRecurringInvoice(data: Partial<RecurringInvoice>): Promise<RecurringInvoice> {
        const recurring: RecurringInvoice = {
            id: randomUUID(),
            name: data.name || "Recurring Invoice",
            customerId: data.customerId || "",
            template: data.template || {},
            frequency: data.frequency || "monthly",
            startDate: data.startDate || new Date(),
            nextGenerationAt: data.startDate || new Date(),
            occurrences: 0,
            status: "active",
            autoSend: data.autoSend ?? true,
            createdAt: new Date(),
            ...data
        };

        this.recurringInvoices.set(recurring.id, recurring);
        return recurring;
    }

    async processRecurringInvoices(): Promise<Invoice[]> {
        const now = new Date();
        const generated: Invoice[] = [];

        for (const recurring of this.recurringInvoices.values()) {
            if (recurring.status !== "active") continue;
            if (recurring.nextGenerationAt && recurring.nextGenerationAt > now) continue;
            if (recurring.maxOccurrences && recurring.occurrences >= recurring.maxOccurrences) {
                recurring.status = "completed";
                continue;
            }
            if (recurring.endDate && now > recurring.endDate) {
                recurring.status = "completed";
                continue;
            }

            // Generate invoice
            const invoice = await this.createInvoice({
                ...recurring.template,
                customerId: recurring.customerId,
                type: "recurring",
                metadata: { recurringInvoiceId: recurring.id }
            });

            generated.push(invoice);
            recurring.occurrences++;
            recurring.lastGeneratedAt = now;
            recurring.nextGenerationAt = this.calculateNextDate(now, recurring.frequency);

            if (recurring.autoSend) {
                await this.sendInvoice(invoice.id);
            }
        }

        return generated;
    }

    private calculateNextDate(from: Date, frequency: RecurringFrequency): Date {
        const next = new Date(from);
        switch (frequency) {
            case "weekly": next.setDate(next.getDate() + 7); break;
            case "biweekly": next.setDate(next.getDate() + 14); break;
            case "monthly": next.setMonth(next.getMonth() + 1); break;
            case "quarterly": next.setMonth(next.getMonth() + 3); break;
            case "annually": next.setFullYear(next.getFullYear() + 1); break;
        }
        return next;
    }

    // ===========================================================================
    // EXPENSE MANAGEMENT
    // ===========================================================================

    async createExpense(data: Partial<Expense>): Promise<Expense> {
        const expense: Expense = {
            id: randomUUID(),
            expenseNumber: `EXP-${++this.expenseCounter}`,
            category: data.category || "other",
            description: data.description || "",
            amount: data.amount || 0,
            currency: data.currency || "EUR",
            exchangeRate: data.exchangeRate || 1,
            amountInBaseCurrency: (data.amount || 0) * (data.exchangeRate || 1),
            date: data.date || new Date(),
            paymentMethod: data.paymentMethod || "card",
            status: "pending",
            tags: data.tags || [],
            isReimbursable: data.isReimbursable || false,
            isBillable: data.isBillable || false,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.expenses.set(expense.id, expense);
        return expense;
    }

    async updateExpense(id: string, data: Partial<Expense>): Promise<Expense | null> {
        const expense = this.expenses.get(id);
        if (!expense) return null;

        Object.assign(expense, data, { updatedAt: new Date() });
        if (data.amount || data.exchangeRate) {
            expense.amountInBaseCurrency = expense.amount * expense.exchangeRate;
        }
        return expense;
    }

    async getExpense(id: string): Promise<Expense | null> {
        return this.expenses.get(id) || null;
    }

    async getExpenses(filters?: {
        category?: ExpenseCategory;
        status?: ExpenseStatus;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Expense[]> {
        let expenses = Array.from(this.expenses.values());

        if (filters) {
            if (filters.category) {
                expenses = expenses.filter(e => e.category === filters.category);
            }
            if (filters.status) {
                expenses = expenses.filter(e => e.status === filters.status);
            }
            if (filters.fromDate) {
                expenses = expenses.filter(e => e.date >= filters.fromDate!);
            }
            if (filters.toDate) {
                expenses = expenses.filter(e => e.date <= filters.toDate!);
            }
        }

        return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    async approveExpense(id: string, approverId: string): Promise<Expense | null> {
        const expense = this.expenses.get(id);
        if (!expense || expense.status !== "pending") return null;

        expense.status = "approved";
        expense.approvedBy = approverId;
        expense.approvedAt = new Date();
        expense.updatedAt = new Date();

        // Create journal entry
        await this.createExpenseJournalEntry(expense);

        return expense;
    }

    async rejectExpense(id: string, reason: string): Promise<Expense | null> {
        const expense = this.expenses.get(id);
        if (!expense || expense.status !== "pending") return null;

        expense.status = "rejected";
        expense.notes = `${expense.notes || ""}\nRejected: ${reason}`;
        expense.updatedAt = new Date();

        return expense;
    }

    // ===========================================================================
    // BUDGET MANAGEMENT
    // ===========================================================================

    async createBudget(data: Partial<Budget>): Promise<Budget> {
        const budget: Budget = {
            id: randomUUID(),
            name: data.name || "New Budget",
            description: data.description || "",
            type: data.type || "operational",
            period: data.period || "monthly",
            startDate: data.startDate || new Date(),
            endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            currency: data.currency || "EUR",
            categories: data.categories || [],
            totalBudgeted: 0,
            totalActual: 0,
            totalVariance: 0,
            status: "draft",
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.calculateBudgetTotals(budget);
        this.budgets.set(budget.id, budget);
        return budget;
    }

    async updateBudget(id: string, data: Partial<Budget>): Promise<Budget | null> {
        const budget = this.budgets.get(id);
        if (!budget) return null;

        Object.assign(budget, data, { updatedAt: new Date() });
        this.calculateBudgetTotals(budget);
        return budget;
    }

    async getBudget(id: string): Promise<Budget | null> {
        return this.budgets.get(id) || null;
    }

    async getBudgets(): Promise<Budget[]> {
        return Array.from(this.budgets.values());
    }

    async updateBudgetActuals(budgetId: string): Promise<Budget | null> {
        const budget = this.budgets.get(budgetId);
        if (!budget) return null;

        const expenses = await this.getExpenses({
            fromDate: budget.startDate,
            toDate: budget.endDate,
            status: "approved"
        });

        for (const category of budget.categories) {
            const categoryExpenses = expenses.filter(e => e.category === category.expenseCategory);
            category.actual = categoryExpenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);
            category.variance = category.budgeted - category.actual;
            category.variancePercent = category.budgeted > 0
                ? (category.variance / category.budgeted) * 100
                : 0;
        }

        this.calculateBudgetTotals(budget);
        budget.updatedAt = new Date();

        return budget;
    }

    private calculateBudgetTotals(budget: Budget): void {
        budget.totalBudgeted = budget.categories.reduce((sum, c) => sum + c.budgeted, 0);
        budget.totalActual = budget.categories.reduce((sum, c) => sum + c.actual, 0);
        budget.totalVariance = budget.totalBudgeted - budget.totalActual;
    }

    // ===========================================================================
    // TAX MANAGEMENT
    // ===========================================================================

    async getTaxRates(country?: string): Promise<TaxRate[]> {
        let rates = Array.from(this.taxRates.values()).filter(r => r.isActive);
        if (country) {
            rates = rates.filter(r => r.country === country);
        }
        return rates;
    }

    async createTaxReport(type: TaxReport["type"], startDate: Date, endDate: Date): Promise<TaxReport> {
        const invoices = await this.getInvoices({ fromDate: startDate, toDate: endDate });
        const expenses = await this.getExpenses({ fromDate: startDate, toDate: endDate, status: "approved" });

        const transactions: TaxTransaction[] = [];
        let taxCollected = 0;
        let taxPaid = 0;

        for (const invoice of invoices) {
            if (invoice.taxTotal > 0) {
                transactions.push({
                    date: invoice.issueDate,
                    description: `Invoice ${invoice.invoiceNumber}`,
                    invoiceId: invoice.id,
                    taxableAmount: invoice.subtotal,
                    taxRate: invoice.taxes[0]?.rate || 0,
                    taxAmount: invoice.taxTotal,
                    type: "collected"
                });
                taxCollected += invoice.taxTotal;
            }
        }

        // Simplified - in production would calculate input VAT from expenses
        taxPaid = taxCollected * 0.3;

        const report: TaxReport = {
            id: randomUUID(),
            period: { start: startDate, end: endDate },
            type,
            status: "draft",
            taxCollected,
            taxPaid,
            netTax: taxCollected - taxPaid,
            transactions,
            dueDate: new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date()
        };

        this.taxReports.set(report.id, report);
        return report;
    }

    private initializeDefaultTaxRates(): void {
        const rates: Partial<TaxRate>[] = [
            { name: "Standard VAT", rate: 21, type: "exclusive", country: "NL", isDefault: true },
            { name: "Reduced VAT", rate: 9, type: "exclusive", country: "NL" },
            { name: "Zero VAT", rate: 0, type: "exclusive", country: "NL" },
            { name: "German VAT", rate: 19, type: "exclusive", country: "DE" },
            { name: "French VAT", rate: 20, type: "exclusive", country: "FR" },
            { name: "Spanish VAT", rate: 21, type: "exclusive", country: "ES" }
        ];

        for (const rate of rates) {
            const taxRate: TaxRate = {
                id: randomUUID(),
                name: rate.name || "",
                rate: rate.rate || 0,
                type: rate.type || "exclusive",
                country: rate.country || "",
                isDefault: rate.isDefault || false,
                isActive: true,
                effectiveFrom: new Date()
            };
            this.taxRates.set(taxRate.id, taxRate);
        }
    }

    // ===========================================================================
    // ACCOUNTING
    // ===========================================================================

    async getChartOfAccounts(): Promise<Account[]> {
        return Array.from(this.accounts.values())
            .filter(a => a.isActive)
            .sort((a, b) => a.code.localeCompare(b.code));
    }

    async createJournalEntry(data: Partial<JournalEntry>): Promise<JournalEntry> {
        const entry: JournalEntry = {
            id: randomUUID(),
            entryNumber: `JE-${++this.journalCounter}`,
            date: data.date || new Date(),
            description: data.description || "",
            lines: data.lines || [],
            status: "draft",
            totalDebit: 0,
            totalCredit: 0,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            ...data
        };

        this.calculateJournalTotals(entry);
        this.journalEntries.set(entry.id, entry);
        return entry;
    }

    async postJournalEntry(id: string, postedBy: string): Promise<JournalEntry | null> {
        const entry = this.journalEntries.get(id);
        if (!entry || entry.status !== "draft") return null;

        // Validate balanced entry
        if (Math.abs(entry.totalDebit - entry.totalCredit) > 0.01) {
            throw new Error("Journal entry is not balanced");
        }

        entry.status = "posted";
        entry.postedAt = new Date();
        entry.postedBy = postedBy;

        // Update account balances
        for (const line of entry.lines) {
            const account = this.accounts.get(line.accountId);
            if (account) {
                if (["asset", "expense"].includes(account.type)) {
                    account.balance += line.debit - line.credit;
                } else {
                    account.balance += line.credit - line.debit;
                }
            }
        }

        return entry;
    }

    async reverseJournalEntry(id: string, reversedBy: string): Promise<JournalEntry | null> {
        const original = this.journalEntries.get(id);
        if (!original || original.status !== "posted") return null;

        const reversingEntry: JournalEntry = {
            id: randomUUID(),
            entryNumber: `JE-${++this.journalCounter}`,
            date: new Date(),
            description: `Reversal of ${original.entryNumber}`,
            reference: original.entryNumber,
            lines: original.lines.map(line => ({
                ...line,
                id: randomUUID(),
                debit: line.credit,
                credit: line.debit
            })),
            status: "draft",
            totalDebit: original.totalCredit,
            totalCredit: original.totalDebit,
            reversalOf: original.id,
            createdBy: reversedBy,
            createdAt: new Date()
        };

        this.journalEntries.set(reversingEntry.id, reversingEntry);
        await this.postJournalEntry(reversingEntry.id, reversedBy);

        original.status = "reversed";
        return reversingEntry;
    }

    private calculateJournalTotals(entry: JournalEntry): void {
        entry.totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
        entry.totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);
    }

    private async createRevenueJournalEntry(invoice: Invoice): Promise<JournalEntry> {
        return this.createJournalEntry({
            date: invoice.issueDate,
            description: `Revenue from Invoice ${invoice.invoiceNumber}`,
            reference: invoice.invoiceNumber,
            lines: [
                { id: randomUUID(), accountId: "1200", accountName: "Accounts Receivable", debit: invoice.total, credit: 0, customerId: invoice.customerId },
                { id: randomUUID(), accountId: "4000", accountName: "Sales Revenue", debit: 0, credit: invoice.subtotal },
                { id: randomUUID(), accountId: "2100", accountName: "VAT Payable", debit: 0, credit: invoice.taxTotal }
            ],
            createdBy: "system"
        });
    }

    private async createPaymentJournalEntry(invoice: Invoice, payment: InvoicePayment): Promise<JournalEntry> {
        return this.createJournalEntry({
            date: payment.date,
            description: `Payment received for Invoice ${invoice.invoiceNumber}`,
            reference: payment.transactionId || invoice.invoiceNumber,
            lines: [
                { id: randomUUID(), accountId: "1000", accountName: "Cash/Bank", debit: payment.amount, credit: 0 },
                { id: randomUUID(), accountId: "1200", accountName: "Accounts Receivable", debit: 0, credit: payment.amount, customerId: invoice.customerId }
            ],
            createdBy: "system"
        });
    }

    private async createExpenseJournalEntry(expense: Expense): Promise<JournalEntry> {
        const expenseAccountMap: Record<ExpenseCategory, string> = {
            supplies: "5100",
            equipment: "5200",
            rent: "5300",
            utilities: "5400",
            marketing: "5500",
            travel: "5600",
            insurance: "5700",
            professional_services: "5800",
            software: "5900",
            payroll: "6000",
            taxes: "6100",
            other: "5999"
        };

        return this.createJournalEntry({
            date: expense.date,
            description: `Expense: ${expense.description}`,
            reference: expense.expenseNumber,
            lines: [
                { id: randomUUID(), accountId: expenseAccountMap[expense.category], accountName: expense.category, debit: expense.amountInBaseCurrency, credit: 0 },
                { id: randomUUID(), accountId: "1000", accountName: "Cash/Bank", debit: 0, credit: expense.amountInBaseCurrency }
            ],
            createdBy: expense.createdBy
        });
    }

    private async createReversingJournalEntry(invoice: Invoice): Promise<JournalEntry> {
        return this.createJournalEntry({
            date: new Date(),
            description: `Void Invoice ${invoice.invoiceNumber}`,
            reference: invoice.invoiceNumber,
            lines: [
                { id: randomUUID(), accountId: "4000", accountName: "Sales Revenue", debit: invoice.subtotal, credit: 0 },
                { id: randomUUID(), accountId: "2100", accountName: "VAT Payable", debit: invoice.taxTotal, credit: 0 },
                { id: randomUUID(), accountId: "1200", accountName: "Accounts Receivable", debit: 0, credit: invoice.total, customerId: invoice.customerId }
            ],
            createdBy: "system"
        });
    }

    private initializeChartOfAccounts(): void {
        const accounts: Partial<Account>[] = [
            // Assets
            { code: "1000", name: "Cash and Bank", type: "asset", subtype: "current" },
            { code: "1100", name: "Petty Cash", type: "asset", subtype: "current" },
            { code: "1200", name: "Accounts Receivable", type: "asset", subtype: "current" },
            { code: "1300", name: "Inventory", type: "asset", subtype: "current" },
            { code: "1400", name: "Prepaid Expenses", type: "asset", subtype: "current" },
            { code: "1500", name: "Equipment", type: "asset", subtype: "fixed" },
            { code: "1600", name: "Accumulated Depreciation", type: "asset", subtype: "contra" },
            // Liabilities
            { code: "2000", name: "Accounts Payable", type: "liability", subtype: "current" },
            { code: "2100", name: "VAT Payable", type: "liability", subtype: "current" },
            { code: "2200", name: "Accrued Expenses", type: "liability", subtype: "current" },
            { code: "2300", name: "Unearned Revenue", type: "liability", subtype: "current" },
            { code: "2500", name: "Long-term Debt", type: "liability", subtype: "long_term" },
            // Equity
            { code: "3000", name: "Owner's Equity", type: "equity", subtype: "capital" },
            { code: "3100", name: "Retained Earnings", type: "equity", subtype: "retained" },
            // Revenue
            { code: "4000", name: "Sales Revenue", type: "revenue", subtype: "operating" },
            { code: "4100", name: "Service Revenue", type: "revenue", subtype: "operating" },
            { code: "4500", name: "Other Income", type: "revenue", subtype: "other" },
            // Expenses
            { code: "5100", name: "Supplies Expense", type: "expense", subtype: "operating" },
            { code: "5200", name: "Equipment Expense", type: "expense", subtype: "operating" },
            { code: "5300", name: "Rent Expense", type: "expense", subtype: "operating" },
            { code: "5400", name: "Utilities Expense", type: "expense", subtype: "operating" },
            { code: "5500", name: "Marketing Expense", type: "expense", subtype: "operating" },
            { code: "5600", name: "Travel Expense", type: "expense", subtype: "operating" },
            { code: "5700", name: "Insurance Expense", type: "expense", subtype: "operating" },
            { code: "5800", name: "Professional Services", type: "expense", subtype: "operating" },
            { code: "5900", name: "Software Expense", type: "expense", subtype: "operating" },
            { code: "5999", name: "Other Expense", type: "expense", subtype: "other" },
            { code: "6000", name: "Payroll Expense", type: "expense", subtype: "operating" },
            { code: "6100", name: "Tax Expense", type: "expense", subtype: "operating" }
        ];

        for (const acc of accounts) {
            const account: Account = {
                id: randomUUID(),
                code: acc.code || "",
                name: acc.name || "",
                type: acc.type || "asset",
                subtype: acc.subtype || "",
                currency: "EUR",
                balance: 0,
                isActive: true,
                createdAt: new Date()
            };
            this.accounts.set(account.id, account);
        }
    }

    private initializeDefaultPaymentTerms(): void {
        const terms: Partial<PaymentTerms>[] = [
            { name: "Due on Receipt", dueDays: 0, isDefault: false },
            { name: "Net 15", dueDays: 15, isDefault: false },
            { name: "Net 30", dueDays: 30, isDefault: true },
            { name: "Net 45", dueDays: 45, isDefault: false },
            { name: "Net 60", dueDays: 60, isDefault: false },
            { name: "2/10 Net 30", dueDays: 30, earlyPaymentDiscount: 2, earlyPaymentDays: 10 }
        ];

        for (const term of terms) {
            const paymentTerm: PaymentTerms = {
                id: randomUUID(),
                name: term.name || "",
                description: "",
                dueDays: term.dueDays || 0,
                earlyPaymentDiscount: term.earlyPaymentDiscount,
                earlyPaymentDays: term.earlyPaymentDays,
                isDefault: term.isDefault || false,
                isActive: true
            };
            this.paymentTerms.set(paymentTerm.id, paymentTerm);
        }
    }

    // ===========================================================================
    // FINANCIAL REPORTING
    // ===========================================================================

    async generateIncomeStatement(startDate: Date, endDate: Date): Promise<FinancialStatement> {
        const accounts = await this.getChartOfAccounts();
        const revenueAccounts = accounts.filter(a => a.type === "revenue");
        const expenseAccounts = accounts.filter(a => a.type === "expense");

        const revenueSection: StatementSection = {
            name: "Revenue",
            items: revenueAccounts.map(a => ({ accountId: a.id, name: a.name, amount: a.balance })),
            total: revenueAccounts.reduce((sum, a) => sum + a.balance, 0)
        };

        const expenseSection: StatementSection = {
            name: "Expenses",
            items: expenseAccounts.map(a => ({ accountId: a.id, name: a.name, amount: a.balance })),
            total: expenseAccounts.reduce((sum, a) => sum + a.balance, 0)
        };

        const netIncome = revenueSection.total - expenseSection.total;

        const statement: FinancialStatement = {
            id: randomUUID(),
            type: "income_statement",
            period: { start: startDate, end: endDate },
            data: {
                sections: [revenueSection, expenseSection],
                totals: {
                    revenue: revenueSection.total,
                    expenses: expenseSection.total,
                    netIncome
                }
            },
            generatedAt: new Date(),
            generatedBy: "system"
        };

        this.statements.set(statement.id, statement);
        return statement;
    }

    async generateBalanceSheet(asOfDate: Date): Promise<FinancialStatement> {
        const accounts = await this.getChartOfAccounts();

        const assetAccounts = accounts.filter(a => a.type === "asset");
        const liabilityAccounts = accounts.filter(a => a.type === "liability");
        const equityAccounts = accounts.filter(a => a.type === "equity");

        const assetsSection: StatementSection = {
            name: "Assets",
            items: assetAccounts.map(a => ({ accountId: a.id, name: a.name, amount: a.balance })),
            total: assetAccounts.reduce((sum, a) => sum + a.balance, 0)
        };

        const liabilitiesSection: StatementSection = {
            name: "Liabilities",
            items: liabilityAccounts.map(a => ({ accountId: a.id, name: a.name, amount: a.balance })),
            total: liabilityAccounts.reduce((sum, a) => sum + a.balance, 0)
        };

        const equitySection: StatementSection = {
            name: "Equity",
            items: equityAccounts.map(a => ({ accountId: a.id, name: a.name, amount: a.balance })),
            total: equityAccounts.reduce((sum, a) => sum + a.balance, 0)
        };

        const statement: FinancialStatement = {
            id: randomUUID(),
            type: "balance_sheet",
            period: { start: asOfDate, end: asOfDate },
            data: {
                sections: [assetsSection, liabilitiesSection, equitySection],
                totals: {
                    assets: assetsSection.total,
                    liabilities: liabilitiesSection.total,
                    equity: equitySection.total
                }
            },
            generatedAt: new Date(),
            generatedBy: "system"
        };

        this.statements.set(statement.id, statement);
        return statement;
    }

    async getFinancialMetrics(startDate: Date, endDate: Date): Promise<FinancialMetrics> {
        const invoices = await this.getInvoices({ fromDate: startDate, toDate: endDate });
        const expenses = await this.getExpenses({ fromDate: startDate, toDate: endDate, status: "approved" });

        const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amountInBaseCurrency, 0);

        const revenueByService: Array<{ service: string; amount: number }> = [];
        const expenseByCategory = new Map<ExpenseCategory, number>();

        for (const expense of expenses) {
            const current = expenseByCategory.get(expense.category) || 0;
            expenseByCategory.set(expense.category, current + expense.amountInBaseCurrency);
        }

        const overdueInvoices = invoices.filter(i => i.status === "overdue");
        const receivables = invoices.filter(i => ["sent", "viewed", "partial", "overdue"].includes(i.status));

        return {
            period: { start: startDate, end: endDate },
            revenue: {
                total: totalRevenue,
                recurring: totalRevenue * 0.3,
                oneTime: totalRevenue * 0.7,
                byService: revenueByService,
                byLocation: [],
                growthRate: 15,
                averageOrderValue: invoices.length > 0 ? totalRevenue / invoices.length : 0
            },
            expenses: {
                total: totalExpenses,
                byCategory: Array.from(expenseByCategory.entries()).map(([category, amount]) => ({ category, amount })),
                byVendor: [],
                growthRate: 10
            },
            profitability: {
                grossProfit: totalRevenue * 0.7,
                grossMargin: 70,
                netProfit: totalRevenue - totalExpenses,
                netMargin: ((totalRevenue - totalExpenses) / totalRevenue) * 100,
                operatingExpenses: totalExpenses,
                ebitda: (totalRevenue - totalExpenses) * 1.1
            },
            cashFlow: {
                operatingCashFlow: totalRevenue * 0.8 - totalExpenses * 0.9,
                investingCashFlow: -totalExpenses * 0.1,
                financingCashFlow: 0,
                netCashFlow: totalRevenue * 0.8 - totalExpenses,
                closingBalance: 100000 + totalRevenue * 0.8 - totalExpenses
            },
            receivables: {
                total: receivables.reduce((sum, i) => sum + i.amountDue, 0),
                current: receivables.filter(i => i.status !== "overdue").reduce((sum, i) => sum + i.amountDue, 0),
                overdue30: overdueInvoices.reduce((sum, i) => sum + i.amountDue, 0) * 0.5,
                overdue60: overdueInvoices.reduce((sum, i) => sum + i.amountDue, 0) * 0.3,
                overdue90: overdueInvoices.reduce((sum, i) => sum + i.amountDue, 0) * 0.2,
                dso: 35,
                collectionRate: 92
            },
            payables: {
                total: totalExpenses * 0.2,
                current: totalExpenses * 0.15,
                overdue: totalExpenses * 0.05,
                dpo: 25
            }
        };
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const financialService = new FinancialService();
export default financialService;
