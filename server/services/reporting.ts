/**
 * ALTUS INK - ENTERPRISE REPORTING & BUSINESS INTELLIGENCE SERVICE
 * Complete reporting, dashboards, and data visualization
 * 
 * Features:
 * - Report builder and templates
 * - Scheduled reports
 * - Dashboard management
 * - Widget system
 * - Data exports
 * - KPI tracking
 * - Trend analysis
 * - Benchmarking
 * - Drill-down capabilities
 * - Real-time metrics
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Report {
    id: string;
    name: string;
    description: string;
    type: ReportType;
    category: ReportCategory;
    status: ReportStatus;
    template?: ReportTemplate;
    parameters: ReportParameter[];
    filters: ReportFilter[];
    columns: ReportColumn[];
    sorting: ReportSorting[];
    grouping: ReportGrouping[];
    aggregations: ReportAggregation[];
    visualization?: Visualization;
    scheduling?: ReportSchedule;
    permissions: ReportPermission[];
    lastRunAt?: Date;
    lastRunDuration?: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ReportType =
    | "tabular"
    | "summary"
    | "matrix"
    | "chart"
    | "dashboard"
    | "pivot";

export type ReportCategory =
    | "sales"
    | "bookings"
    | "financial"
    | "customers"
    | "artists"
    | "inventory"
    | "workforce"
    | "marketing"
    | "operations"
    | "custom";

export type ReportStatus = "draft" | "published" | "archived";

export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    category: ReportCategory;
    isSystem: boolean;
    baseQuery: string;
    defaultColumns: ReportColumn[];
    defaultFilters: ReportFilter[];
    parameters: ReportParameter[];
    createdAt: Date;
}

export interface ReportParameter {
    name: string;
    label: string;
    type: "string" | "number" | "date" | "daterange" | "select" | "multiselect" | "boolean";
    required: boolean;
    defaultValue?: any;
    options?: Array<{ value: string; label: string }>;
    validation?: string;
}

export interface ReportFilter {
    field: string;
    operator: FilterOperator;
    value: any;
    isParameter?: boolean;
    parameterName?: string;
}

export type FilterOperator =
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "less_than"
    | "greater_or_equal"
    | "less_or_equal"
    | "between"
    | "in"
    | "not_in"
    | "is_null"
    | "is_not_null";

export interface ReportColumn {
    field: string;
    label: string;
    type: "string" | "number" | "currency" | "percentage" | "date" | "datetime" | "boolean";
    width?: number;
    align?: "left" | "center" | "right";
    format?: string;
    isVisible: boolean;
    isSortable: boolean;
    isFilterable: boolean;
    aggregation?: AggregationType;
    formula?: string;
    conditionalFormatting?: ConditionalFormat[];
}

export type AggregationType = "sum" | "avg" | "min" | "max" | "count" | "count_distinct";

export interface ConditionalFormat {
    condition: string;
    style: {
        backgroundColor?: string;
        textColor?: string;
        fontWeight?: string;
        icon?: string;
    };
}

export interface ReportSorting {
    field: string;
    direction: "asc" | "desc";
    nullsFirst?: boolean;
}

export interface ReportGrouping {
    field: string;
    label: string;
    sortDirection?: "asc" | "desc";
    showSubtotals: boolean;
    collapsed?: boolean;
}

export interface ReportAggregation {
    field: string;
    type: AggregationType;
    label?: string;
}

export interface Visualization {
    type: VisualizationType;
    config: VisualizationConfig;
}

export type VisualizationType =
    | "bar"
    | "line"
    | "area"
    | "pie"
    | "donut"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "treemap"
    | "funnel"
    | "gauge"
    | "kpi"
    | "table";

export interface VisualizationConfig {
    title?: string;
    subtitle?: string;
    xAxis?: AxisConfig;
    yAxis?: AxisConfig;
    series: SeriesConfig[];
    legend?: LegendConfig;
    colors?: string[];
    stacked?: boolean;
    showDataLabels?: boolean;
    showGrid?: boolean;
    animation?: boolean;
}

export interface AxisConfig {
    title?: string;
    type?: "category" | "value" | "time";
    min?: number;
    max?: number;
    format?: string;
}

export interface SeriesConfig {
    name: string;
    field: string;
    type?: VisualizationType;
    color?: string;
    showTrend?: boolean;
}

export interface LegendConfig {
    show: boolean;
    position: "top" | "bottom" | "left" | "right";
}

export interface ReportSchedule {
    isEnabled: boolean;
    frequency: ScheduleFrequency;
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    timezone: string;
    recipients: ScheduleRecipient[];
    format: ExportFormat;
    nextRunAt?: Date;
    lastSentAt?: Date;
}

export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "quarterly";

export interface ScheduleRecipient {
    type: "email" | "user" | "group";
    value: string;
}

export type ExportFormat = "pdf" | "excel" | "csv" | "json";

export interface ReportPermission {
    type: "user" | "role" | "group";
    id: string;
    level: "view" | "edit" | "admin";
}

export interface ReportExecution {
    id: string;
    reportId: string;
    status: "pending" | "running" | "completed" | "failed";
    parameters: Record<string, any>;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    rowCount?: number;
    error?: string;
    resultUrl?: string;
    executedBy: string;
}

export interface Dashboard {
    id: string;
    name: string;
    description: string;
    category: ReportCategory;
    status: ReportStatus;
    layout: DashboardLayout;
    widgets: DashboardWidget[];
    filters: DashboardFilter[];
    refreshInterval?: number;
    theme: DashboardTheme;
    permissions: ReportPermission[];
    isDefault: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DashboardLayout {
    type: "grid" | "flex" | "fixed";
    columns: number;
    rowHeight: number;
    gap: number;
}

export interface DashboardWidget {
    id: string;
    type: WidgetType;
    title: string;
    subtitle?: string;
    position: WidgetPosition;
    config: WidgetConfig;
    reportId?: string;
    dataSource?: WidgetDataSource;
    refreshInterval?: number;
    isLoading?: boolean;
    error?: string;
}

export type WidgetType =
    | "kpi"
    | "chart"
    | "table"
    | "list"
    | "calendar"
    | "map"
    | "gauge"
    | "progress"
    | "text"
    | "image"
    | "iframe"
    | "filter";

export interface WidgetPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WidgetConfig {
    visualization?: Visualization;
    kpi?: KPIConfig;
    table?: TableConfig;
    text?: TextConfig;
    colors?: string[];
    showBorder?: boolean;
    showShadow?: boolean;
    padding?: number;
}

export interface KPIConfig {
    value: string | number;
    previousValue?: number;
    target?: number;
    format: "number" | "currency" | "percentage";
    trend?: "up" | "down" | "neutral";
    trendIsPositive?: boolean;
    sparkline?: number[];
    icon?: string;
    color?: string;
}

export interface TableConfig {
    columns: ReportColumn[];
    pageSize: number;
    showPagination: boolean;
    showSearch: boolean;
    showExport: boolean;
    rowClick?: string;
}

export interface TextConfig {
    content: string;
    format: "plain" | "markdown" | "html";
    fontSize?: number;
    textAlign?: "left" | "center" | "right";
}

export interface WidgetDataSource {
    type: "report" | "api" | "static" | "realtime";
    reportId?: string;
    endpoint?: string;
    query?: string;
    refreshInterval?: number;
}

export interface DashboardFilter {
    id: string;
    type: "date" | "daterange" | "select" | "multiselect" | "search";
    label: string;
    field: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: any;
    affectedWidgets: string[];
}

export interface DashboardTheme {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        border: string;
    };
    fontFamily: string;
    darkMode: boolean;
}

export interface KPI {
    id: string;
    name: string;
    description: string;
    category: ReportCategory;
    formula: string;
    unit: "number" | "currency" | "percentage" | "time";
    format: string;
    target?: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    trendDirection: "higher_better" | "lower_better" | "neutral";
    frequency: "realtime" | "hourly" | "daily" | "weekly" | "monthly";
    dataSource: string;
    history: KPIHistory[];
    alerts: KPIAlert[];
    createdAt: Date;
}

export interface KPIHistory {
    timestamp: Date;
    value: number;
    target?: number;
}

export interface KPIAlert {
    id: string;
    type: "above_target" | "below_target" | "above_threshold" | "below_threshold";
    threshold: number;
    recipients: string[];
    isEnabled: boolean;
    lastTriggeredAt?: Date;
}

export interface Metric {
    id: string;
    name: string;
    value: number;
    previousValue?: number;
    change?: number;
    changePercent?: number;
    trend: "up" | "down" | "stable";
    unit: string;
    timestamp: Date;
}

export interface DataExport {
    id: string;
    name: string;
    type: "report" | "dashboard" | "data";
    sourceId: string;
    format: ExportFormat;
    status: "pending" | "processing" | "completed" | "failed";
    parameters?: Record<string, any>;
    filters?: ReportFilter[];
    rowCount?: number;
    fileSize?: number;
    fileUrl?: string;
    expiresAt?: Date;
    error?: string;
    requestedBy: string;
    requestedAt: Date;
    completedAt?: Date;
}

export interface Benchmark {
    id: string;
    name: string;
    metric: string;
    category: ReportCategory;
    value: number;
    source: "industry" | "historical" | "target" | "peer";
    period: string;
    updatedAt: Date;
}

// =============================================================================
// REPORTING SERVICE CLASS
// =============================================================================

export class ReportingService {
    private reports: Map<string, Report> = new Map();
    private templates: Map<string, ReportTemplate> = new Map();
    private executions: Map<string, ReportExecution> = new Map();
    private dashboards: Map<string, Dashboard> = new Map();
    private kpis: Map<string, KPI> = new Map();
    private exports: Map<string, DataExport> = new Map();
    private benchmarks: Map<string, Benchmark> = new Map();
    private metrics: Map<string, Metric[]> = new Map();

    constructor() {
        this.initializeTemplates();
        this.initializeKPIs();
        this.initializeBenchmarks();
    }

    // ===========================================================================
    // REPORT MANAGEMENT
    // ===========================================================================

    async createReport(data: Partial<Report>): Promise<Report> {
        const report: Report = {
            id: randomUUID(),
            name: data.name || "Untitled Report",
            description: data.description || "",
            type: data.type || "tabular",
            category: data.category || "custom",
            status: "draft",
            parameters: data.parameters || [],
            filters: data.filters || [],
            columns: data.columns || [],
            sorting: data.sorting || [],
            grouping: data.grouping || [],
            aggregations: data.aggregations || [],
            permissions: data.permissions || [],
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.reports.set(report.id, report);
        return report;
    }

    async updateReport(id: string, data: Partial<Report>): Promise<Report | null> {
        const report = this.reports.get(id);
        if (!report) return null;

        Object.assign(report, data, { updatedAt: new Date() });
        return report;
    }

    async deleteReport(id: string): Promise<boolean> {
        return this.reports.delete(id);
    }

    async getReport(id: string): Promise<Report | null> {
        return this.reports.get(id) || null;
    }

    async getReports(filters?: {
        category?: ReportCategory;
        status?: ReportStatus;
        createdBy?: string;
    }): Promise<Report[]> {
        let reports = Array.from(this.reports.values());

        if (filters) {
            if (filters.category) {
                reports = reports.filter(r => r.category === filters.category);
            }
            if (filters.status) {
                reports = reports.filter(r => r.status === filters.status);
            }
            if (filters.createdBy) {
                reports = reports.filter(r => r.createdBy === filters.createdBy);
            }
        }

        return reports.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    async publishReport(id: string): Promise<Report | null> {
        const report = this.reports.get(id);
        if (!report) return null;

        report.status = "published";
        report.updatedAt = new Date();
        return report;
    }

    async cloneReport(id: string, name: string): Promise<Report | null> {
        const source = this.reports.get(id);
        if (!source) return null;

        const clone: Report = {
            ...JSON.parse(JSON.stringify(source)),
            id: randomUUID(),
            name,
            status: "draft",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.reports.set(clone.id, clone);
        return clone;
    }

    async createReportFromTemplate(templateId: string, name: string, createdBy: string): Promise<Report | null> {
        const template = this.templates.get(templateId);
        if (!template) return null;

        return this.createReport({
            name,
            description: template.description,
            type: "tabular",
            category: template.category,
            template,
            parameters: template.parameters,
            filters: template.defaultFilters,
            columns: template.defaultColumns,
            createdBy
        });
    }

    // ===========================================================================
    // REPORT EXECUTION
    // ===========================================================================

    async executeReport(reportId: string, parameters: Record<string, any>, executedBy: string): Promise<ReportExecution> {
        const report = this.reports.get(reportId);
        if (!report) throw new Error("Report not found");

        const execution: ReportExecution = {
            id: randomUUID(),
            reportId,
            status: "pending",
            parameters,
            startedAt: new Date(),
            executedBy
        };

        this.executions.set(execution.id, execution);

        // Simulate execution
        execution.status = "running";

        try {
            // In production, would execute actual query
            await this.simulateReportExecution(report, parameters);

            execution.status = "completed";
            execution.completedAt = new Date();
            execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
            execution.rowCount = Math.floor(Math.random() * 1000) + 100;

            report.lastRunAt = execution.completedAt;
            report.lastRunDuration = execution.duration;
        } catch (error: any) {
            execution.status = "failed";
            execution.error = error.message;
            execution.completedAt = new Date();
        }

        return execution;
    }

    async getExecution(id: string): Promise<ReportExecution | null> {
        return this.executions.get(id) || null;
    }

    async getReportExecutions(reportId: string, limit?: number): Promise<ReportExecution[]> {
        let executions = Array.from(this.executions.values())
            .filter(e => e.reportId === reportId)
            .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

        if (limit) {
            executions = executions.slice(0, limit);
        }

        return executions;
    }

    private async simulateReportExecution(report: Report, parameters: Record<string, any>): Promise<void> {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    }

    // ===========================================================================
    // TEMPLATES
    // ===========================================================================

    async getTemplates(category?: ReportCategory): Promise<ReportTemplate[]> {
        let templates = Array.from(this.templates.values());

        if (category) {
            templates = templates.filter(t => t.category === category);
        }

        return templates;
    }

    async getTemplate(id: string): Promise<ReportTemplate | null> {
        return this.templates.get(id) || null;
    }

    private initializeTemplates(): void {
        const templates: ReportTemplate[] = [
            {
                id: "tpl-bookings-summary",
                name: "Bookings Summary",
                description: "Overview of bookings by status, artist, and time period",
                category: "bookings",
                isSystem: true,
                baseQuery: "SELECT * FROM bookings",
                defaultColumns: [
                    { field: "date", label: "Date", type: "date", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "customer", label: "Customer", type: "string", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "artist", label: "Artist", type: "string", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "status", label: "Status", type: "string", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "amount", label: "Amount", type: "currency", isVisible: true, isSortable: true, isFilterable: true, aggregation: "sum" }
                ],
                defaultFilters: [],
                parameters: [
                    { name: "dateRange", label: "Date Range", type: "daterange", required: true },
                    {
                        name: "status", label: "Status", type: "multiselect", required: false, options: [
                            { value: "pending", label: "Pending" },
                            { value: "confirmed", label: "Confirmed" },
                            { value: "completed", label: "Completed" },
                            { value: "cancelled", label: "Cancelled" }
                        ]
                    }
                ],
                createdAt: new Date()
            },
            {
                id: "tpl-revenue-analysis",
                name: "Revenue Analysis",
                description: "Detailed revenue breakdown by source and time",
                category: "financial",
                isSystem: true,
                baseQuery: "SELECT * FROM payments",
                defaultColumns: [
                    { field: "date", label: "Date", type: "date", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "type", label: "Type", type: "string", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "amount", label: "Amount", type: "currency", isVisible: true, isSortable: true, isFilterable: true, aggregation: "sum" },
                    { field: "fees", label: "Fees", type: "currency", isVisible: true, isSortable: true, isFilterable: true, aggregation: "sum" },
                    { field: "net", label: "Net", type: "currency", isVisible: true, isSortable: true, isFilterable: true, aggregation: "sum" }
                ],
                defaultFilters: [],
                parameters: [
                    { name: "dateRange", label: "Date Range", type: "daterange", required: true },
                    {
                        name: "groupBy", label: "Group By", type: "select", required: false, options: [
                            { value: "day", label: "Day" },
                            { value: "week", label: "Week" },
                            { value: "month", label: "Month" }
                        ]
                    }
                ],
                createdAt: new Date()
            },
            {
                id: "tpl-artist-performance",
                name: "Artist Performance",
                description: "Performance metrics for each artist",
                category: "artists",
                isSystem: true,
                baseQuery: "SELECT * FROM artists",
                defaultColumns: [
                    { field: "name", label: "Artist", type: "string", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "bookings", label: "Bookings", type: "number", isVisible: true, isSortable: true, isFilterable: true, aggregation: "sum" },
                    { field: "revenue", label: "Revenue", type: "currency", isVisible: true, isSortable: true, isFilterable: true, aggregation: "sum" },
                    { field: "rating", label: "Rating", type: "number", isVisible: true, isSortable: true, isFilterable: true, aggregation: "avg" },
                    { field: "completionRate", label: "Completion Rate", type: "percentage", isVisible: true, isSortable: true, isFilterable: true }
                ],
                defaultFilters: [],
                parameters: [
                    { name: "dateRange", label: "Date Range", type: "daterange", required: true }
                ],
                createdAt: new Date()
            },
            {
                id: "tpl-customer-analysis",
                name: "Customer Analysis",
                description: "Customer behavior and value analysis",
                category: "customers",
                isSystem: true,
                baseQuery: "SELECT * FROM customers",
                defaultColumns: [
                    { field: "name", label: "Customer", type: "string", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "email", label: "Email", type: "string", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "totalBookings", label: "Bookings", type: "number", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "ltv", label: "Lifetime Value", type: "currency", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "segment", label: "Segment", type: "string", isVisible: true, isSortable: true, isFilterable: true },
                    { field: "lastBooking", label: "Last Booking", type: "date", isVisible: true, isSortable: true, isFilterable: true }
                ],
                defaultFilters: [],
                parameters: [
                    {
                        name: "segment", label: "Segment", type: "multiselect", required: false, options: [
                            { value: "new", label: "New" },
                            { value: "regular", label: "Regular" },
                            { value: "vip", label: "VIP" },
                            { value: "at_risk", label: "At Risk" }
                        ]
                    }
                ],
                createdAt: new Date()
            }
        ];

        for (const template of templates) {
            this.templates.set(template.id, template);
        }
    }

    // ===========================================================================
    // DASHBOARD MANAGEMENT
    // ===========================================================================

    async createDashboard(data: Partial<Dashboard>): Promise<Dashboard> {
        const dashboard: Dashboard = {
            id: randomUUID(),
            name: data.name || "Untitled Dashboard",
            description: data.description || "",
            category: data.category || "custom",
            status: "draft",
            layout: data.layout || { type: "grid", columns: 12, rowHeight: 50, gap: 16 },
            widgets: data.widgets || [],
            filters: data.filters || [],
            theme: data.theme || this.getDefaultTheme(),
            permissions: data.permissions || [],
            isDefault: false,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.dashboards.set(dashboard.id, dashboard);
        return dashboard;
    }

    async updateDashboard(id: string, data: Partial<Dashboard>): Promise<Dashboard | null> {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) return null;

        Object.assign(dashboard, data, { updatedAt: new Date() });
        return dashboard;
    }

    async deleteDashboard(id: string): Promise<boolean> {
        return this.dashboards.delete(id);
    }

    async getDashboard(id: string): Promise<Dashboard | null> {
        return this.dashboards.get(id) || null;
    }

    async getDashboards(category?: ReportCategory): Promise<Dashboard[]> {
        let dashboards = Array.from(this.dashboards.values());

        if (category) {
            dashboards = dashboards.filter(d => d.category === category);
        }

        return dashboards.sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
    }

    async setDefaultDashboard(id: string): Promise<void> {
        for (const dashboard of this.dashboards.values()) {
            dashboard.isDefault = dashboard.id === id;
        }
    }

    async addWidget(dashboardId: string, widget: Omit<DashboardWidget, "id">): Promise<DashboardWidget | null> {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return null;

        const newWidget: DashboardWidget = {
            id: randomUUID(),
            ...widget
        };

        dashboard.widgets.push(newWidget);
        dashboard.updatedAt = new Date();

        return newWidget;
    }

    async updateWidget(dashboardId: string, widgetId: string, data: Partial<DashboardWidget>): Promise<DashboardWidget | null> {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return null;

        const widget = dashboard.widgets.find(w => w.id === widgetId);
        if (!widget) return null;

        Object.assign(widget, data);
        dashboard.updatedAt = new Date();

        return widget;
    }

    async removeWidget(dashboardId: string, widgetId: string): Promise<boolean> {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return false;

        const index = dashboard.widgets.findIndex(w => w.id === widgetId);
        if (index === -1) return false;

        dashboard.widgets.splice(index, 1);
        dashboard.updatedAt = new Date();

        return true;
    }

    async updateWidgetLayout(dashboardId: string, layouts: Array<{ id: string; position: WidgetPosition }>): Promise<Dashboard | null> {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) return null;

        for (const layout of layouts) {
            const widget = dashboard.widgets.find(w => w.id === layout.id);
            if (widget) {
                widget.position = layout.position;
            }
        }

        dashboard.updatedAt = new Date();
        return dashboard;
    }

    private getDefaultTheme(): DashboardTheme {
        return {
            name: "Default",
            colors: {
                primary: "#6366F1",
                secondary: "#EC4899",
                background: "#0F172A",
                surface: "#1E293B",
                text: "#F8FAFC",
                border: "#334155"
            },
            fontFamily: "Inter, sans-serif",
            darkMode: true
        };
    }

    // ===========================================================================
    // KPI MANAGEMENT
    // ===========================================================================

    async getKPI(id: string): Promise<KPI | null> {
        return this.kpis.get(id) || null;
    }

    async getKPIs(category?: ReportCategory): Promise<KPI[]> {
        let kpis = Array.from(this.kpis.values());

        if (category) {
            kpis = kpis.filter(k => k.category === category);
        }

        return kpis;
    }

    async calculateKPI(id: string): Promise<Metric | null> {
        const kpi = this.kpis.get(id);
        if (!kpi) return null;

        // Simulate KPI calculation
        const currentValue = Math.random() * 10000 + 1000;
        const previousValue = kpi.history.length > 0
            ? kpi.history[kpi.history.length - 1].value
            : currentValue * 0.9;

        const metric: Metric = {
            id: randomUUID(),
            name: kpi.name,
            value: currentValue,
            previousValue,
            change: currentValue - previousValue,
            changePercent: ((currentValue - previousValue) / previousValue) * 100,
            trend: currentValue > previousValue ? "up" : currentValue < previousValue ? "down" : "stable",
            unit: kpi.unit,
            timestamp: new Date()
        };

        // Add to history
        kpi.history.push({
            timestamp: new Date(),
            value: currentValue,
            target: kpi.target
        });

        // Keep only last 365 days
        if (kpi.history.length > 365) {
            kpi.history = kpi.history.slice(-365);
        }

        // Check alerts
        await this.checkKPIAlerts(kpi, currentValue);

        return metric;
    }

    async getKPIHistory(id: string, days: number = 30): Promise<KPIHistory[]> {
        const kpi = this.kpis.get(id);
        if (!kpi) return [];

        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return kpi.history.filter(h => h.timestamp >= cutoff);
    }

    private async checkKPIAlerts(kpi: KPI, currentValue: number): Promise<void> {
        for (const alert of kpi.alerts) {
            if (!alert.isEnabled) continue;

            let triggered = false;

            switch (alert.type) {
                case "above_target":
                    triggered = kpi.target !== undefined && currentValue > kpi.target;
                    break;
                case "below_target":
                    triggered = kpi.target !== undefined && currentValue < kpi.target;
                    break;
                case "above_threshold":
                    triggered = currentValue > alert.threshold;
                    break;
                case "below_threshold":
                    triggered = currentValue < alert.threshold;
                    break;
            }

            if (triggered) {
                alert.lastTriggeredAt = new Date();
                // In production, would send notifications to recipients
            }
        }
    }

    private initializeKPIs(): void {
        const kpis: KPI[] = [
            {
                id: "kpi-total-revenue",
                name: "Total Revenue",
                description: "Total revenue from all bookings",
                category: "financial",
                formula: "SUM(payments.amount)",
                unit: "currency",
                format: "€#,##0",
                target: 100000,
                warningThreshold: 80000,
                trendDirection: "higher_better",
                frequency: "daily",
                dataSource: "payments",
                history: [],
                alerts: [],
                createdAt: new Date()
            },
            {
                id: "kpi-booking-count",
                name: "Total Bookings",
                description: "Number of completed bookings",
                category: "bookings",
                formula: "COUNT(bookings WHERE status = 'completed')",
                unit: "number",
                format: "#,##0",
                target: 500,
                trendDirection: "higher_better",
                frequency: "daily",
                dataSource: "bookings",
                history: [],
                alerts: [],
                createdAt: new Date()
            },
            {
                id: "kpi-conversion-rate",
                name: "Conversion Rate",
                description: "Percentage of leads that become customers",
                category: "marketing",
                formula: "(customers / leads) * 100",
                unit: "percentage",
                format: "#0.0%",
                target: 25,
                warningThreshold: 15,
                trendDirection: "higher_better",
                frequency: "daily",
                dataSource: "customers",
                history: [],
                alerts: [],
                createdAt: new Date()
            },
            {
                id: "kpi-avg-booking-value",
                name: "Average Booking Value",
                description: "Average revenue per booking",
                category: "financial",
                formula: "AVG(bookings.amount)",
                unit: "currency",
                format: "€#,##0",
                target: 200,
                trendDirection: "higher_better",
                frequency: "daily",
                dataSource: "bookings",
                history: [],
                alerts: [],
                createdAt: new Date()
            },
            {
                id: "kpi-customer-satisfaction",
                name: "Customer Satisfaction",
                description: "Average customer rating",
                category: "customers",
                formula: "AVG(reviews.rating)",
                unit: "number",
                format: "#0.0",
                target: 4.5,
                warningThreshold: 4.0,
                criticalThreshold: 3.5,
                trendDirection: "higher_better",
                frequency: "daily",
                dataSource: "reviews",
                history: [],
                alerts: [],
                createdAt: new Date()
            },
            {
                id: "kpi-artist-utilization",
                name: "Artist Utilization",
                description: "Percentage of available time booked",
                category: "artists",
                formula: "(booked_hours / available_hours) * 100",
                unit: "percentage",
                format: "#0.0%",
                target: 75,
                warningThreshold: 50,
                trendDirection: "higher_better",
                frequency: "daily",
                dataSource: "schedules",
                history: [],
                alerts: [],
                createdAt: new Date()
            }
        ];

        for (const kpi of kpis) {
            this.kpis.set(kpi.id, kpi);
        }
    }

    // ===========================================================================
    // DATA EXPORT
    // ===========================================================================

    async requestExport(data: {
        type: DataExport["type"];
        sourceId: string;
        format: ExportFormat;
        parameters?: Record<string, any>;
        filters?: ReportFilter[];
        requestedBy: string;
    }): Promise<DataExport> {
        const dataExport: DataExport = {
            id: randomUUID(),
            name: `Export_${Date.now()}`,
            type: data.type,
            sourceId: data.sourceId,
            format: data.format,
            status: "pending",
            parameters: data.parameters,
            filters: data.filters,
            requestedBy: data.requestedBy,
            requestedAt: new Date()
        };

        this.exports.set(dataExport.id, dataExport);

        // Process export
        await this.processExport(dataExport);

        return dataExport;
    }

    async getExport(id: string): Promise<DataExport | null> {
        return this.exports.get(id) || null;
    }

    async getExports(requestedBy: string): Promise<DataExport[]> {
        return Array.from(this.exports.values())
            .filter(e => e.requestedBy === requestedBy)
            .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
    }

    private async processExport(dataExport: DataExport): Promise<void> {
        dataExport.status = "processing";

        try {
            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

            dataExport.status = "completed";
            dataExport.completedAt = new Date();
            dataExport.rowCount = Math.floor(Math.random() * 5000) + 100;
            dataExport.fileSize = dataExport.rowCount * 100;
            dataExport.fileUrl = `/exports/${dataExport.id}.${dataExport.format}`;
            dataExport.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        } catch (error: any) {
            dataExport.status = "failed";
            dataExport.error = error.message;
            dataExport.completedAt = new Date();
        }
    }

    // ===========================================================================
    // BENCHMARKING
    // ===========================================================================

    async getBenchmarks(category?: ReportCategory): Promise<Benchmark[]> {
        let benchmarks = Array.from(this.benchmarks.values());

        if (category) {
            benchmarks = benchmarks.filter(b => b.category === category);
        }

        return benchmarks;
    }

    async compareToBenchmark(metric: string, currentValue: number): Promise<{
        benchmark: Benchmark | null;
        difference: number;
        percentDifference: number;
        status: "above" | "below" | "at";
    }> {
        const benchmark = Array.from(this.benchmarks.values()).find(b => b.metric === metric);

        if (!benchmark) {
            return { benchmark: null, difference: 0, percentDifference: 0, status: "at" };
        }

        const difference = currentValue - benchmark.value;
        const percentDifference = (difference / benchmark.value) * 100;
        const status = difference > 0.05 * benchmark.value ? "above"
            : difference < -0.05 * benchmark.value ? "below"
                : "at";

        return { benchmark, difference, percentDifference, status };
    }

    private initializeBenchmarks(): void {
        const benchmarks: Benchmark[] = [
            { id: "bench-conversion", name: "Industry Conversion Rate", metric: "conversion_rate", category: "marketing", value: 20, source: "industry", period: "2024", updatedAt: new Date() },
            { id: "bench-satisfaction", name: "Industry Satisfaction", metric: "customer_satisfaction", category: "customers", value: 4.2, source: "industry", period: "2024", updatedAt: new Date() },
            { id: "bench-aov", name: "Industry AOV", metric: "average_order_value", category: "financial", value: 180, source: "industry", period: "2024", updatedAt: new Date() },
            { id: "bench-utilization", name: "Target Utilization", metric: "artist_utilization", category: "artists", value: 70, source: "target", period: "2024", updatedAt: new Date() }
        ];

        for (const benchmark of benchmarks) {
            this.benchmarks.set(benchmark.id, benchmark);
        }
    }

    // ===========================================================================
    // ANALYTICS QUERIES
    // ===========================================================================

    async getTrendAnalysis(metric: string, period: number, granularity: "day" | "week" | "month"): Promise<Array<{ date: Date; value: number; trend: number }>> {
        const results: Array<{ date: Date; value: number; trend: number }> = [];
        const now = new Date();

        let intervals = period;
        if (granularity === "week") intervals = Math.ceil(period / 7);
        if (granularity === "month") intervals = Math.ceil(period / 30);

        for (let i = intervals - 1; i >= 0; i--) {
            const date = new Date(now);
            if (granularity === "day") date.setDate(date.getDate() - i);
            if (granularity === "week") date.setDate(date.getDate() - i * 7);
            if (granularity === "month") date.setMonth(date.getMonth() - i);

            const value = Math.random() * 10000 + 5000;
            const previousValue = results.length > 0 ? results[results.length - 1].value : value;
            const trend = ((value - previousValue) / previousValue) * 100;

            results.push({ date, value, trend });
        }

        return results;
    }

    async getDistributionAnalysis(dimension: string): Promise<Array<{ label: string; value: number; percentage: number }>> {
        const categories = ["Category A", "Category B", "Category C", "Category D", "Other"];
        const values = categories.map(() => Math.random() * 1000 + 100);
        const total = values.reduce((a, b) => a + b, 0);

        return categories.map((label, i) => ({
            label,
            value: values[i],
            percentage: (values[i] / total) * 100
        }));
    }

    async getComparisonAnalysis(metrics: string[], periods: Array<{ start: Date; end: Date }>): Promise<Array<{ metric: string; values: number[] }>> {
        return metrics.map(metric => ({
            metric,
            values: periods.map(() => Math.random() * 10000 + 1000)
        }));
    }

    async getCohortAnalysis(startDate: Date, periods: number): Promise<{
        cohorts: Array<{ period: string; size: number; retention: number[] }>;
    }> {
        const cohorts: Array<{ period: string; size: number; retention: number[] }> = [];
        const date = new Date(startDate);

        for (let i = 0; i < periods; i++) {
            const retention: number[] = [];
            let rate = 100;

            for (let j = 0; j < periods - i; j++) {
                retention.push(rate);
                rate *= 0.7 + Math.random() * 0.2;
            }

            cohorts.push({
                period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
                size: Math.floor(Math.random() * 500) + 100,
                retention
            });

            date.setMonth(date.getMonth() + 1);
        }

        return { cohorts };
    }

    async getFunnelAnalysis(stages: string[]): Promise<Array<{ stage: string; count: number; conversion: number }>> {
        const results: Array<{ stage: string; count: number; conversion: number }> = [];
        let previousCount = Math.floor(Math.random() * 10000) + 5000;

        for (const stage of stages) {
            const dropRate = 0.3 + Math.random() * 0.4;
            const count = Math.floor(previousCount * (1 - dropRate));
            const conversion = previousCount > 0 ? (count / previousCount) * 100 : 0;

            results.push({ stage, count, conversion });
            previousCount = count;
        }

        return results;
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const reportingService = new ReportingService();
export default reportingService;
