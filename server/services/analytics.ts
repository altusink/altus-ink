/**
 * ALTUS INK - ENTERPRISE ANALYTICS SERVICE
 * Real-time analytics, metrics, insights, and business intelligence
 * 
 * Features:
 * - Real-time metrics collection
 * - Time series data
 * - Aggregations and rollups
 * - Funnel analysis
 * - Cohort analysis
 * - Revenue attribution
 * - Predictive analytics
 * - Custom dashboards
 * - Export capabilities
 * - Alerting system
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface MetricPoint {
    timestamp: Date;
    value: number;
    metadata?: Record<string, any>;
}

export interface TimeSeries {
    metric: string;
    points: MetricPoint[];
    aggregation: AggregationType;
    interval: TimeInterval;
}

export type AggregationType = "sum" | "avg" | "min" | "max" | "count" | "percentile";
export type TimeInterval = "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";

export interface MetricDefinition {
    name: string;
    displayName: string;
    description: string;
    type: MetricType;
    unit: string;
    aggregation: AggregationType;
    category: MetricCategory;
    formula?: string;
    dependencies?: string[];
}

export type MetricType = "counter" | "gauge" | "histogram" | "summary";
export type MetricCategory =
    | "revenue"
    | "bookings"
    | "users"
    | "artists"
    | "conversion"
    | "engagement"
    | "performance"
    | "operational";

export interface DashboardWidget {
    id: string;
    type: WidgetType;
    title: string;
    metrics: string[];
    config: WidgetConfig;
    position: { x: number; y: number; w: number; h: number };
}

export type WidgetType =
    | "line_chart"
    | "bar_chart"
    | "pie_chart"
    | "donut_chart"
    | "area_chart"
    | "stat_card"
    | "table"
    | "heatmap"
    | "funnel"
    | "gauge"
    | "map";

export interface WidgetConfig {
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    stacked?: boolean;
    comparison?: {
        enabled: boolean;
        period: "previous" | "year_ago";
    };
    threshold?: {
        value: number;
        color: string;
    };
}

export interface FunnelStage {
    name: string;
    count: number;
    conversionRate: number;
    dropoffRate: number;
    averageTime?: number;
}

export interface CohortData {
    cohort: string;
    size: number;
    periods: number[];
}

export interface SegmentDefinition {
    id: string;
    name: string;
    filters: SegmentFilter[];
    createdAt: Date;
}

export interface SegmentFilter {
    field: string;
    operator: FilterOperator;
    value: any;
}

export type FilterOperator =
    | "eq" | "neq" | "gt" | "gte" | "lt" | "lte"
    | "contains" | "not_contains"
    | "in" | "not_in"
    | "is_null" | "is_not_null";

export interface AnalyticsEvent {
    id: string;
    event: string;
    userId?: string;
    sessionId: string;
    properties: Record<string, any>;
    timestamp: Date;
    userAgent?: string;
    ip?: string;
    country?: string;
    city?: string;
}

export interface RevenueAttribution {
    source: string;
    medium: string;
    campaign?: string;
    revenue: number;
    bookings: number;
    averageOrderValue: number;
    conversionRate: number;
}

export interface PredictiveInsight {
    type: InsightType;
    metric: string;
    prediction: number;
    confidence: number;
    trend: "up" | "down" | "stable";
    factors: InsightFactor[];
    recommendation?: string;
}

export type InsightType =
    | "forecast"
    | "anomaly"
    | "trend"
    | "opportunity"
    | "risk";

export interface InsightFactor {
    factor: string;
    impact: number;
    direction: "positive" | "negative";
}

export interface AlertRule {
    id: string;
    name: string;
    metric: string;
    condition: AlertCondition;
    threshold: number;
    severity: AlertSeverity;
    channels: AlertChannel[];
    enabled: boolean;
    cooldownMinutes: number;
    lastTriggered?: Date;
}

export interface AlertCondition {
    type: "above" | "below" | "equals" | "change_percent";
    window?: number; // minutes
}

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertChannel = "email" | "sms" | "whatsapp" | "slack" | "webhook";

export interface Alert {
    id: string;
    ruleId: string;
    metric: string;
    value: number;
    threshold: number;
    severity: AlertSeverity;
    message: string;
    triggeredAt: Date;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
}

// =============================================================================
// METRIC DEFINITIONS
// =============================================================================

export const METRICS: Record<string, MetricDefinition> = {
    // Revenue Metrics
    total_revenue: {
        name: "total_revenue",
        displayName: "Total Revenue",
        description: "Total revenue from all bookings",
        type: "counter",
        unit: "EUR",
        aggregation: "sum",
        category: "revenue"
    },
    gross_merchandise_value: {
        name: "gross_merchandise_value",
        displayName: "GMV",
        description: "Gross merchandise value including deposits and final payments",
        type: "counter",
        unit: "EUR",
        aggregation: "sum",
        category: "revenue"
    },
    platform_commission: {
        name: "platform_commission",
        displayName: "Platform Commission",
        description: "Revenue earned by the platform",
        type: "counter",
        unit: "EUR",
        aggregation: "sum",
        category: "revenue"
    },
    artist_payouts: {
        name: "artist_payouts",
        displayName: "Artist Payouts",
        description: "Total amount paid out to artists",
        type: "counter",
        unit: "EUR",
        aggregation: "sum",
        category: "revenue"
    },
    average_order_value: {
        name: "average_order_value",
        displayName: "Average Order Value",
        description: "Average booking value",
        type: "gauge",
        unit: "EUR",
        aggregation: "avg",
        category: "revenue",
        formula: "total_revenue / total_bookings"
    },
    lifetime_value: {
        name: "lifetime_value",
        displayName: "Customer Lifetime Value",
        description: "Average revenue per customer over their lifetime",
        type: "gauge",
        unit: "EUR",
        aggregation: "avg",
        category: "revenue"
    },
    monthly_recurring_revenue: {
        name: "monthly_recurring_revenue",
        displayName: "MRR",
        description: "Monthly recurring revenue from platform fees",
        type: "gauge",
        unit: "EUR",
        aggregation: "sum",
        category: "revenue"
    },

    // Booking Metrics
    total_bookings: {
        name: "total_bookings",
        displayName: "Total Bookings",
        description: "Total number of bookings created",
        type: "counter",
        unit: "bookings",
        aggregation: "count",
        category: "bookings"
    },
    completed_bookings: {
        name: "completed_bookings",
        displayName: "Completed Bookings",
        description: "Number of successfully completed sessions",
        type: "counter",
        unit: "bookings",
        aggregation: "count",
        category: "bookings"
    },
    cancelled_bookings: {
        name: "cancelled_bookings",
        displayName: "Cancelled Bookings",
        description: "Number of cancelled bookings",
        type: "counter",
        unit: "bookings",
        aggregation: "count",
        category: "bookings"
    },
    no_show_bookings: {
        name: "no_show_bookings",
        displayName: "No-Shows",
        description: "Number of no-show bookings",
        type: "counter",
        unit: "bookings",
        aggregation: "count",
        category: "bookings"
    },
    booking_completion_rate: {
        name: "booking_completion_rate",
        displayName: "Completion Rate",
        description: "Percentage of bookings completed",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "bookings",
        formula: "completed_bookings / total_bookings * 100"
    },
    cancellation_rate: {
        name: "cancellation_rate",
        displayName: "Cancellation Rate",
        description: "Percentage of bookings cancelled",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "bookings",
        formula: "cancelled_bookings / total_bookings * 100"
    },
    average_session_duration: {
        name: "average_session_duration",
        displayName: "Avg Session Duration",
        description: "Average duration of tattoo sessions",
        type: "gauge",
        unit: "minutes",
        aggregation: "avg",
        category: "bookings"
    },

    // User Metrics
    total_users: {
        name: "total_users",
        displayName: "Total Users",
        description: "Total registered users",
        type: "counter",
        unit: "users",
        aggregation: "count",
        category: "users"
    },
    new_users: {
        name: "new_users",
        displayName: "New Users",
        description: "New user registrations",
        type: "counter",
        unit: "users",
        aggregation: "count",
        category: "users"
    },
    active_users: {
        name: "active_users",
        displayName: "Active Users",
        description: "Users active in the period",
        type: "gauge",
        unit: "users",
        aggregation: "count",
        category: "users"
    },
    daily_active_users: {
        name: "daily_active_users",
        displayName: "DAU",
        description: "Daily active users",
        type: "gauge",
        unit: "users",
        aggregation: "count",
        category: "users"
    },
    monthly_active_users: {
        name: "monthly_active_users",
        displayName: "MAU",
        description: "Monthly active users",
        type: "gauge",
        unit: "users",
        aggregation: "count",
        category: "users"
    },
    user_retention_rate: {
        name: "user_retention_rate",
        displayName: "Retention Rate",
        description: "Percentage of users who return",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "users"
    },
    churn_rate: {
        name: "churn_rate",
        displayName: "Churn Rate",
        description: "Percentage of users who stop using the platform",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "users"
    },

    // Artist Metrics
    total_artists: {
        name: "total_artists",
        displayName: "Total Artists",
        description: "Total registered artists",
        type: "counter",
        unit: "artists",
        aggregation: "count",
        category: "artists"
    },
    active_artists: {
        name: "active_artists",
        displayName: "Active Artists",
        description: "Artists with bookings in the period",
        type: "gauge",
        unit: "artists",
        aggregation: "count",
        category: "artists"
    },
    verified_artists: {
        name: "verified_artists",
        displayName: "Verified Artists",
        description: "Artists with verified status",
        type: "counter",
        unit: "artists",
        aggregation: "count",
        category: "artists"
    },
    artist_utilization_rate: {
        name: "artist_utilization_rate",
        displayName: "Utilization Rate",
        description: "Percentage of available hours booked",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "artists"
    },
    average_artist_rating: {
        name: "average_artist_rating",
        displayName: "Avg Artist Rating",
        description: "Average rating across all artists",
        type: "gauge",
        unit: "stars",
        aggregation: "avg",
        category: "artists"
    },
    artist_earnings_avg: {
        name: "artist_earnings_avg",
        displayName: "Avg Artist Earnings",
        description: "Average earnings per artist",
        type: "gauge",
        unit: "EUR",
        aggregation: "avg",
        category: "artists"
    },

    // Conversion Metrics
    visitor_to_signup: {
        name: "visitor_to_signup",
        displayName: "Visitor → Signup",
        description: "Conversion from visitor to signup",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "conversion"
    },
    signup_to_booking: {
        name: "signup_to_booking",
        displayName: "Signup → Booking",
        description: "Conversion from signup to first booking",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "conversion"
    },
    cart_abandonment_rate: {
        name: "cart_abandonment_rate",
        displayName: "Cart Abandonment",
        description: "Percentage of started but not completed bookings",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "conversion"
    },
    repeat_booking_rate: {
        name: "repeat_booking_rate",
        displayName: "Repeat Booking Rate",
        description: "Percentage of customers who book again",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "conversion"
    },

    // Engagement Metrics
    page_views: {
        name: "page_views",
        displayName: "Page Views",
        description: "Total page views",
        type: "counter",
        unit: "views",
        aggregation: "sum",
        category: "engagement"
    },
    unique_visitors: {
        name: "unique_visitors",
        displayName: "Unique Visitors",
        description: "Unique visitors",
        type: "counter",
        unit: "visitors",
        aggregation: "count",
        category: "engagement"
    },
    average_session_length: {
        name: "average_session_length",
        displayName: "Avg Session Length",
        description: "Average time spent on site",
        type: "gauge",
        unit: "seconds",
        aggregation: "avg",
        category: "engagement"
    },
    pages_per_session: {
        name: "pages_per_session",
        displayName: "Pages/Session",
        description: "Average pages viewed per session",
        type: "gauge",
        unit: "pages",
        aggregation: "avg",
        category: "engagement"
    },
    bounce_rate: {
        name: "bounce_rate",
        displayName: "Bounce Rate",
        description: "Single-page session rate",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "engagement"
    },

    // Performance Metrics
    api_response_time: {
        name: "api_response_time",
        displayName: "API Response Time",
        description: "Average API response time",
        type: "histogram",
        unit: "ms",
        aggregation: "avg",
        category: "performance"
    },
    error_rate: {
        name: "error_rate",
        displayName: "Error Rate",
        description: "Percentage of requests with errors",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "performance"
    },
    uptime: {
        name: "uptime",
        displayName: "Uptime",
        description: "Service uptime percentage",
        type: "gauge",
        unit: "%",
        aggregation: "avg",
        category: "performance"
    },

    // Operational Metrics
    pending_payouts: {
        name: "pending_payouts",
        displayName: "Pending Payouts",
        description: "Number of pending payout requests",
        type: "gauge",
        unit: "payouts",
        aggregation: "count",
        category: "operational"
    },
    support_tickets: {
        name: "support_tickets",
        displayName: "Support Tickets",
        description: "Open support tickets",
        type: "gauge",
        unit: "tickets",
        aggregation: "count",
        category: "operational"
    },
    average_resolution_time: {
        name: "average_resolution_time",
        displayName: "Avg Resolution Time",
        description: "Average time to resolve tickets",
        type: "gauge",
        unit: "hours",
        aggregation: "avg",
        category: "operational"
    }
};

// =============================================================================
// ANALYTICS SERVICE CLASS
// =============================================================================

export class AnalyticsService {
    private events: AnalyticsEvent[] = [];
    private metrics: Map<string, MetricPoint[]> = new Map();
    private alerts: Alert[] = [];
    private alertRules: AlertRule[] = [];
    private segments: SegmentDefinition[] = [];

    constructor() {
        // Initialize metrics storage
        Object.keys(METRICS).forEach(metric => {
            this.metrics.set(metric, []);
        });

        // Start background jobs
        this.startMetricAggregation();
        this.startAlertMonitoring();
    }

    // ===========================================================================
    // EVENT TRACKING
    // ===========================================================================

    trackEvent(
        event: string,
        properties: Record<string, any> = {},
        userId?: string,
        sessionId?: string
    ): void {
        const analyticsEvent: AnalyticsEvent = {
            id: this.generateId(),
            event,
            userId,
            sessionId: sessionId || this.generateSessionId(),
            properties,
            timestamp: new Date()
        };

        this.events.push(analyticsEvent);
        this.processEvent(analyticsEvent);

        // Keep only last 100k events in memory
        if (this.events.length > 100000) {
            this.events = this.events.slice(-100000);
        }
    }

    trackPageView(
        page: string,
        userId?: string,
        sessionId?: string,
        referrer?: string
    ): void {
        this.trackEvent("page_view", { page, referrer }, userId, sessionId);
        this.incrementMetric("page_views", 1);
    }

    trackBookingStarted(
        artistId: string,
        userId?: string
    ): void {
        this.trackEvent("booking_started", { artistId }, userId);
    }

    trackBookingCompleted(
        bookingId: string,
        artistId: string,
        amount: number,
        userId?: string
    ): void {
        this.trackEvent("booking_completed", { bookingId, artistId, amount }, userId);
        this.incrementMetric("total_bookings", 1);
        this.incrementMetric("total_revenue", amount);
    }

    trackBookingCancelled(
        bookingId: string,
        reason?: string,
        userId?: string
    ): void {
        this.trackEvent("booking_cancelled", { bookingId, reason }, userId);
        this.incrementMetric("cancelled_bookings", 1);
    }

    trackUserSignup(
        userId: string,
        source?: string,
        medium?: string,
        campaign?: string
    ): void {
        this.trackEvent("user_signup", { source, medium, campaign }, userId);
        this.incrementMetric("new_users", 1);
        this.incrementMetric("total_users", 1);
    }

    trackArtistVerified(artistId: string): void {
        this.trackEvent("artist_verified", { artistId });
        this.incrementMetric("verified_artists", 1);
    }

    trackPayoutRequested(
        artistId: string,
        amount: number
    ): void {
        this.trackEvent("payout_requested", { artistId, amount });
        this.incrementMetric("pending_payouts", 1);
    }

    trackPayoutCompleted(
        artistId: string,
        amount: number
    ): void {
        this.trackEvent("payout_completed", { artistId, amount });
        this.incrementMetric("artist_payouts", amount);
        this.decrementMetric("pending_payouts", 1);
    }

    // ===========================================================================
    // METRICS
    // ===========================================================================

    incrementMetric(metric: string, value: number = 1): void {
        this.recordMetric(metric, value);
    }

    decrementMetric(metric: string, value: number = 1): void {
        this.recordMetric(metric, -value);
    }

    setMetric(metric: string, value: number): void {
        const points = this.metrics.get(metric) || [];
        points.push({ timestamp: new Date(), value });
        this.metrics.set(metric, points);
    }

    recordMetric(metric: string, value: number, metadata?: Record<string, any>): void {
        const points = this.metrics.get(metric) || [];
        points.push({ timestamp: new Date(), value, metadata });
        this.metrics.set(metric, points);

        // Keep only last 10k points per metric
        if (points.length > 10000) {
            this.metrics.set(metric, points.slice(-10000));
        }
    }

    getMetric(
        metric: string,
        startDate: Date,
        endDate: Date,
        interval: TimeInterval = "day"
    ): TimeSeries {
        const points = this.metrics.get(metric) || [];
        const filteredPoints = points.filter(
            p => p.timestamp >= startDate && p.timestamp <= endDate
        );

        const aggregatedPoints = this.aggregateByInterval(filteredPoints, interval);
        const definition = METRICS[metric];

        return {
            metric,
            points: aggregatedPoints,
            aggregation: definition?.aggregation || "sum",
            interval
        };
    }

    getMetricValue(metric: string, period: "today" | "week" | "month" | "year" = "today"): number {
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case "today":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case "week":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }

        const points = this.metrics.get(metric) || [];
        const filteredPoints = points.filter(p => p.timestamp >= startDate);

        const definition = METRICS[metric];
        return this.aggregate(filteredPoints.map(p => p.value), definition?.aggregation || "sum");
    }

    // ===========================================================================
    // TIME SERIES AGGREGATION
    // ===========================================================================

    private aggregateByInterval(points: MetricPoint[], interval: TimeInterval): MetricPoint[] {
        const buckets = new Map<string, number[]>();

        points.forEach(point => {
            const key = this.getIntervalKey(point.timestamp, interval);
            const values = buckets.get(key) || [];
            values.push(point.value);
            buckets.set(key, values);
        });

        const result: MetricPoint[] = [];
        buckets.forEach((values, key) => {
            result.push({
                timestamp: this.parseIntervalKey(key, interval),
                value: this.aggregate(values, "sum")
            });
        });

        return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    private getIntervalKey(date: Date, interval: TimeInterval): string {
        const d = new Date(date);
        switch (interval) {
            case "minute":
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
            case "hour":
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
            case "day":
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            case "week":
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay());
                return `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
            case "month":
                return `${d.getFullYear()}-${d.getMonth()}`;
            case "quarter":
                return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
            case "year":
                return `${d.getFullYear()}`;
        }
    }

    private parseIntervalKey(key: string, interval: TimeInterval): Date {
        const parts = key.split("-").map(Number);
        switch (interval) {
            case "minute":
                return new Date(parts[0], parts[1], parts[2], parts[3], parts[4]);
            case "hour":
                return new Date(parts[0], parts[1], parts[2], parts[3]);
            case "day":
                return new Date(parts[0], parts[1], parts[2]);
            default:
                return new Date(parts[0], parts[1] || 0);
        }
    }

    private aggregate(values: number[], type: AggregationType): number {
        if (values.length === 0) return 0;

        switch (type) {
            case "sum":
                return values.reduce((a, b) => a + b, 0);
            case "avg":
                return values.reduce((a, b) => a + b, 0) / values.length;
            case "min":
                return Math.min(...values);
            case "max":
                return Math.max(...values);
            case "count":
                return values.length;
            case "percentile":
                const sorted = [...values].sort((a, b) => a - b);
                const idx = Math.floor(sorted.length * 0.95);
                return sorted[idx] || 0;
        }
    }

    // ===========================================================================
    // FUNNEL ANALYSIS
    // ===========================================================================

    analyzeFunnel(stages: string[], startDate: Date, endDate: Date): FunnelStage[] {
        const stageEvents = stages.map(stage =>
            this.events.filter(
                e => e.event === stage &&
                    e.timestamp >= startDate &&
                    e.timestamp <= endDate
            )
        );

        const results: FunnelStage[] = [];
        let previousCount = 0;

        stageEvents.forEach((events, index) => {
            const count = new Set(events.map(e => e.userId || e.sessionId)).size;
            const conversionRate = index === 0 ? 100 : (count / previousCount) * 100;
            const dropoffRate = index === 0 ? 0 : 100 - conversionRate;

            results.push({
                name: stages[index],
                count,
                conversionRate: Math.round(conversionRate * 100) / 100,
                dropoffRate: Math.round(dropoffRate * 100) / 100
            });

            previousCount = count;
        });

        return results;
    }

    getBookingFunnel(startDate: Date, endDate: Date): FunnelStage[] {
        return this.analyzeFunnel([
            "page_view",
            "artist_viewed",
            "booking_started",
            "slot_selected",
            "details_entered",
            "payment_initiated",
            "booking_completed"
        ], startDate, endDate);
    }

    // ===========================================================================
    // COHORT ANALYSIS
    // ===========================================================================

    analyzeCohort(
        cohortEvent: string,
        returnEvent: string,
        startDate: Date,
        periods: number,
        periodType: "day" | "week" | "month" = "week"
    ): CohortData[] {
        const cohorts: CohortData[] = [];
        const periodMs = this.getPeriodMs(periodType);

        for (let i = 0; i < periods; i++) {
            const cohortStart = new Date(startDate.getTime() + i * periodMs);
            const cohortEnd = new Date(cohortStart.getTime() + periodMs);

            // Get users who did cohort event in this period
            const cohortUsers = new Set(
                this.events
                    .filter(
                        e => e.event === cohortEvent &&
                            e.timestamp >= cohortStart &&
                            e.timestamp < cohortEnd &&
                            e.userId
                    )
                    .map(e => e.userId!)
            );

            const periodRetention: number[] = [];

            // Calculate retention for each subsequent period
            for (let p = 0; p <= periods - i - 1; p++) {
                const periodStart = new Date(cohortEnd.getTime() + p * periodMs);
                const periodEnd = new Date(periodStart.getTime() + periodMs);

                const returningUsers = new Set(
                    this.events
                        .filter(
                            e => e.event === returnEvent &&
                                e.timestamp >= periodStart &&
                                e.timestamp < periodEnd &&
                                e.userId &&
                                cohortUsers.has(e.userId)
                        )
                        .map(e => e.userId!)
                );

                const retentionRate = cohortUsers.size > 0
                    ? (returningUsers.size / cohortUsers.size) * 100
                    : 0;

                periodRetention.push(Math.round(retentionRate * 10) / 10);
            }

            cohorts.push({
                cohort: this.formatCohortLabel(cohortStart, periodType),
                size: cohortUsers.size,
                periods: periodRetention
            });
        }

        return cohorts;
    }

    private getPeriodMs(periodType: "day" | "week" | "month"): number {
        switch (periodType) {
            case "day": return 24 * 60 * 60 * 1000;
            case "week": return 7 * 24 * 60 * 60 * 1000;
            case "month": return 30 * 24 * 60 * 60 * 1000;
        }
    }

    private formatCohortLabel(date: Date, periodType: string): string {
        switch (periodType) {
            case "day":
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            case "week":
                return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
            case "month":
                return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
            default:
                return date.toISOString();
        }
    }

    // ===========================================================================
    // REVENUE ATTRIBUTION
    // ===========================================================================

    getRevenueAttribution(startDate: Date, endDate: Date): RevenueAttribution[] {
        const attributions = new Map<string, {
            revenue: number;
            bookings: number;
            visitors: number;
        }>();

        // Group events by source
        this.events
            .filter(e => e.timestamp >= startDate && e.timestamp <= endDate)
            .forEach(event => {
                const source = event.properties?.source || "direct";
                const medium = event.properties?.medium || "none";
                const key = `${source}|${medium}`;

                const data = attributions.get(key) || { revenue: 0, bookings: 0, visitors: 0 };

                if (event.event === "page_view") {
                    data.visitors++;
                } else if (event.event === "booking_completed") {
                    data.bookings++;
                    data.revenue += event.properties?.amount || 0;
                }

                attributions.set(key, data);
            });

        const results: RevenueAttribution[] = [];
        attributions.forEach((data, key) => {
            const [source, medium] = key.split("|");
            results.push({
                source,
                medium,
                revenue: data.revenue,
                bookings: data.bookings,
                averageOrderValue: data.bookings > 0 ? data.revenue / data.bookings : 0,
                conversionRate: data.visitors > 0 ? (data.bookings / data.visitors) * 100 : 0
            });
        });

        return results.sort((a, b) => b.revenue - a.revenue);
    }

    // ===========================================================================
    // PREDICTIVE ANALYTICS
    // ===========================================================================

    getPredictiveInsights(): PredictiveInsight[] {
        const insights: PredictiveInsight[] = [];

        // Revenue forecast
        const revenuePoints = this.metrics.get("total_revenue") || [];
        if (revenuePoints.length >= 30) {
            const trend = this.calculateTrend(revenuePoints.slice(-30));
            const prediction = this.forecastNextPeriod(revenuePoints.slice(-30));

            insights.push({
                type: "forecast",
                metric: "total_revenue",
                prediction,
                confidence: 0.75,
                trend: trend > 0.05 ? "up" : trend < -0.05 ? "down" : "stable",
                factors: [
                    { factor: "Seasonal trend", impact: 0.3, direction: "positive" },
                    { factor: "Marketing campaigns", impact: 0.2, direction: "positive" }
                ],
                recommendation: trend > 0
                    ? "Revenue is growing. Consider investing in capacity."
                    : "Revenue is declining. Review marketing strategies."
            });
        }

        // Booking anomaly detection
        const bookingPoints = this.metrics.get("total_bookings") || [];
        if (bookingPoints.length >= 7) {
            const anomaly = this.detectAnomaly(bookingPoints.slice(-7));
            if (anomaly) {
                insights.push({
                    type: "anomaly",
                    metric: "total_bookings",
                    prediction: anomaly.value,
                    confidence: 0.85,
                    trend: "down",
                    factors: [
                        { factor: "Unusual drop detected", impact: anomaly.deviation, direction: "negative" }
                    ],
                    recommendation: "Booking volume is unusually low. Investigate potential issues."
                });
            }
        }

        return insights;
    }

    private calculateTrend(points: MetricPoint[]): number {
        if (points.length < 2) return 0;

        const firstHalf = points.slice(0, Math.floor(points.length / 2));
        const secondHalf = points.slice(Math.floor(points.length / 2));

        const firstAvg = this.aggregate(firstHalf.map(p => p.value), "avg");
        const secondAvg = this.aggregate(secondHalf.map(p => p.value), "avg");

        return firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
    }

    private forecastNextPeriod(points: MetricPoint[]): number {
        const values = points.map(p => p.value);
        const avg = this.aggregate(values, "avg");
        const trend = this.calculateTrend(points);
        return avg * (1 + trend);
    }

    private detectAnomaly(points: MetricPoint[]): { value: number; deviation: number } | null {
        const values = points.map(p => p.value);
        const avg = this.aggregate(values, "avg");
        const stdDev = this.calculateStdDev(values);

        const latest = values[values.length - 1];
        const zScore = Math.abs((latest - avg) / stdDev);

        if (zScore > 2) {
            return { value: latest, deviation: zScore };
        }
        return null;
    }

    private calculateStdDev(values: number[]): number {
        const avg = this.aggregate(values, "avg");
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(this.aggregate(squareDiffs, "avg"));
    }

    // ===========================================================================
    // ALERTING
    // ===========================================================================

    addAlertRule(rule: Omit<AlertRule, "id">): AlertRule {
        const newRule: AlertRule = {
            id: this.generateId(),
            ...rule
        };
        this.alertRules.push(newRule);
        return newRule;
    }

    removeAlertRule(ruleId: string): void {
        this.alertRules = this.alertRules.filter(r => r.id !== ruleId);
    }

    getAlerts(status?: "active" | "acknowledged" | "resolved"): Alert[] {
        if (!status) return this.alerts;

        return this.alerts.filter(alert => {
            if (status === "active") return !alert.acknowledgedAt && !alert.resolvedAt;
            if (status === "acknowledged") return alert.acknowledgedAt && !alert.resolvedAt;
            if (status === "resolved") return alert.resolvedAt;
            return true;
        });
    }

    acknowledgeAlert(alertId: string): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledgedAt = new Date();
        }
    }

    resolveAlert(alertId: string): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolvedAt = new Date();
        }
    }

    private checkAlertRules(): void {
        const now = new Date();

        this.alertRules.forEach(rule => {
            if (!rule.enabled) return;

            // Check cooldown
            if (rule.lastTriggered) {
                const cooldownEnd = new Date(rule.lastTriggered.getTime() + rule.cooldownMinutes * 60 * 1000);
                if (now < cooldownEnd) return;
            }

            const value = this.getMetricValue(rule.metric, "today");
            let triggered = false;

            switch (rule.condition.type) {
                case "above":
                    triggered = value > rule.threshold;
                    break;
                case "below":
                    triggered = value < rule.threshold;
                    break;
                case "equals":
                    triggered = value === rule.threshold;
                    break;
                case "change_percent":
                    const yesterday = this.getMetricValue(rule.metric, "today"); // simplified
                    const change = yesterday > 0 ? ((value - yesterday) / yesterday) * 100 : 0;
                    triggered = Math.abs(change) > rule.threshold;
                    break;
            }

            if (triggered) {
                this.triggerAlert(rule, value);
            }
        });
    }

    private triggerAlert(rule: AlertRule, value: number): void {
        const alert: Alert = {
            id: this.generateId(),
            ruleId: rule.id,
            metric: rule.metric,
            value,
            threshold: rule.threshold,
            severity: rule.severity,
            message: `${METRICS[rule.metric]?.displayName || rule.metric} is ${value} (threshold: ${rule.threshold})`,
            triggeredAt: new Date()
        };

        this.alerts.push(alert);
        rule.lastTriggered = new Date();

        // Send notifications
        rule.channels.forEach(channel => {
            this.sendAlertNotification(alert, channel);
        });

        // Keep only last 1000 alerts
        if (this.alerts.length > 1000) {
            this.alerts = this.alerts.slice(-1000);
        }
    }

    private sendAlertNotification(alert: Alert, channel: AlertChannel): void {
        console.log(`[Alert ${channel}] ${alert.severity.toUpperCase()}: ${alert.message}`);
        // Actual implementation would send to respective channels
    }

    // ===========================================================================
    // DASHBOARD GENERATION
    // ===========================================================================

    generateDashboard(type: "overview" | "revenue" | "bookings" | "artists" | "performance"): DashboardWidget[] {
        switch (type) {
            case "overview":
                return this.getOverviewDashboard();
            case "revenue":
                return this.getRevenueDashboard();
            case "bookings":
                return this.getBookingsDashboard();
            case "artists":
                return this.getArtistsDashboard();
            case "performance":
                return this.getPerformanceDashboard();
            default:
                return this.getOverviewDashboard();
        }
    }

    private getOverviewDashboard(): DashboardWidget[] {
        return [
            {
                id: "revenue_total",
                type: "stat_card",
                title: "Total Revenue",
                metrics: ["total_revenue"],
                config: { comparison: { enabled: true, period: "previous" } },
                position: { x: 0, y: 0, w: 3, h: 1 }
            },
            {
                id: "bookings_total",
                type: "stat_card",
                title: "Total Bookings",
                metrics: ["total_bookings"],
                config: { comparison: { enabled: true, period: "previous" } },
                position: { x: 3, y: 0, w: 3, h: 1 }
            },
            {
                id: "active_artists",
                type: "stat_card",
                title: "Active Artists",
                metrics: ["active_artists"],
                config: {},
                position: { x: 6, y: 0, w: 3, h: 1 }
            },
            {
                id: "completion_rate",
                type: "stat_card",
                title: "Completion Rate",
                metrics: ["booking_completion_rate"],
                config: { threshold: { value: 90, color: "green" } },
                position: { x: 9, y: 0, w: 3, h: 1 }
            },
            {
                id: "revenue_trend",
                type: "area_chart",
                title: "Revenue Trend",
                metrics: ["total_revenue", "platform_commission"],
                config: { stacked: true, showGrid: true },
                position: { x: 0, y: 1, w: 8, h: 3 }
            },
            {
                id: "conversion_funnel",
                type: "funnel",
                title: "Booking Funnel",
                metrics: [],
                config: {},
                position: { x: 8, y: 1, w: 4, h: 3 }
            }
        ];
    }

    private getRevenueDashboard(): DashboardWidget[] {
        return [
            {
                id: "gmv",
                type: "stat_card",
                title: "GMV",
                metrics: ["gross_merchandise_value"],
                config: { comparison: { enabled: true, period: "previous" } },
                position: { x: 0, y: 0, w: 3, h: 1 }
            },
            {
                id: "aov",
                type: "stat_card",
                title: "Average Order Value",
                metrics: ["average_order_value"],
                config: {},
                position: { x: 3, y: 0, w: 3, h: 1 }
            },
            {
                id: "ltv",
                type: "stat_card",
                title: "Customer LTV",
                metrics: ["lifetime_value"],
                config: {},
                position: { x: 6, y: 0, w: 3, h: 1 }
            },
            {
                id: "mrr",
                type: "stat_card",
                title: "MRR",
                metrics: ["monthly_recurring_revenue"],
                config: { comparison: { enabled: true, period: "previous" } },
                position: { x: 9, y: 0, w: 3, h: 1 }
            },
            {
                id: "revenue_by_source",
                type: "pie_chart",
                title: "Revenue by Source",
                metrics: [],
                config: { showLegend: true },
                position: { x: 0, y: 1, w: 6, h: 3 }
            },
            {
                id: "artist_payouts",
                type: "bar_chart",
                title: "Artist Payouts",
                metrics: ["artist_payouts"],
                config: {},
                position: { x: 6, y: 1, w: 6, h: 3 }
            }
        ];
    }

    private getBookingsDashboard(): DashboardWidget[] {
        return [
            {
                id: "bookings_today",
                type: "stat_card",
                title: "Today's Bookings",
                metrics: ["total_bookings"],
                config: {},
                position: { x: 0, y: 0, w: 3, h: 1 }
            },
            {
                id: "completion_rate",
                type: "gauge",
                title: "Completion Rate",
                metrics: ["booking_completion_rate"],
                config: { threshold: { value: 90, color: "green" } },
                position: { x: 3, y: 0, w: 3, h: 1 }
            },
            {
                id: "cancellation_rate",
                type: "gauge",
                title: "Cancellation Rate",
                metrics: ["cancellation_rate"],
                config: { threshold: { value: 10, color: "red" } },
                position: { x: 6, y: 0, w: 3, h: 1 }
            },
            {
                id: "no_shows",
                type: "stat_card",
                title: "No-Shows",
                metrics: ["no_show_bookings"],
                config: {},
                position: { x: 9, y: 0, w: 3, h: 1 }
            },
            {
                id: "bookings_trend",
                type: "line_chart",
                title: "Bookings Trend",
                metrics: ["total_bookings", "completed_bookings", "cancelled_bookings"],
                config: { showGrid: true, showLegend: true },
                position: { x: 0, y: 1, w: 12, h: 3 }
            }
        ];
    }

    private getArtistsDashboard(): DashboardWidget[] {
        return [
            {
                id: "total_artists",
                type: "stat_card",
                title: "Total Artists",
                metrics: ["total_artists"],
                config: {},
                position: { x: 0, y: 0, w: 3, h: 1 }
            },
            {
                id: "active_artists",
                type: "stat_card",
                title: "Active Artists",
                metrics: ["active_artists"],
                config: {},
                position: { x: 3, y: 0, w: 3, h: 1 }
            },
            {
                id: "utilization",
                type: "gauge",
                title: "Avg Utilization",
                metrics: ["artist_utilization_rate"],
                config: {},
                position: { x: 6, y: 0, w: 3, h: 1 }
            },
            {
                id: "avg_rating",
                type: "stat_card",
                title: "Avg Rating",
                metrics: ["average_artist_rating"],
                config: {},
                position: { x: 9, y: 0, w: 3, h: 1 }
            },
            {
                id: "earnings_distribution",
                type: "bar_chart",
                title: "Earnings Distribution",
                metrics: ["artist_earnings_avg"],
                config: {},
                position: { x: 0, y: 1, w: 12, h: 3 }
            }
        ];
    }

    private getPerformanceDashboard(): DashboardWidget[] {
        return [
            {
                id: "api_latency",
                type: "stat_card",
                title: "API Latency",
                metrics: ["api_response_time"],
                config: { threshold: { value: 200, color: "green" } },
                position: { x: 0, y: 0, w: 3, h: 1 }
            },
            {
                id: "error_rate",
                type: "gauge",
                title: "Error Rate",
                metrics: ["error_rate"],
                config: { threshold: { value: 1, color: "green" } },
                position: { x: 3, y: 0, w: 3, h: 1 }
            },
            {
                id: "uptime",
                type: "stat_card",
                title: "Uptime",
                metrics: ["uptime"],
                config: {},
                position: { x: 6, y: 0, w: 3, h: 1 }
            },
            {
                id: "active_users",
                type: "stat_card",
                title: "Active Users",
                metrics: ["daily_active_users"],
                config: {},
                position: { x: 9, y: 0, w: 3, h: 1 }
            },
            {
                id: "latency_trend",
                type: "line_chart",
                title: "API Latency Trend",
                metrics: ["api_response_time"],
                config: { showGrid: true },
                position: { x: 0, y: 1, w: 12, h: 3 }
            }
        ];
    }

    // ===========================================================================
    // EXPORT
    // ===========================================================================

    exportMetrics(format: "json" | "csv", metrics: string[], startDate: Date, endDate: Date): string {
        const data: Record<string, TimeSeries> = {};
        metrics.forEach(metric => {
            data[metric] = this.getMetric(metric, startDate, endDate, "day");
        });

        if (format === "json") {
            return JSON.stringify(data, null, 2);
        } else {
            // CSV export
            const headers = ["date", ...metrics];
            const rows: string[] = [headers.join(",")];

            // Get all unique dates
            const allDates = new Set<string>();
            Object.values(data).forEach(ts => {
                ts.points.forEach(p => allDates.add(p.timestamp.toISOString().split("T")[0]));
            });

            Array.from(allDates).sort().forEach(date => {
                const row = [date];
                metrics.forEach(metric => {
                    const point = data[metric]?.points.find(
                        p => p.timestamp.toISOString().split("T")[0] === date
                    );
                    row.push(point?.value?.toString() || "0");
                });
                rows.push(row.join(","));
            });

            return rows.join("\n");
        }
    }

    // ===========================================================================
    // HELPERS
    // ===========================================================================

    private generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSessionId(): string {
        return `sess_${Math.random().toString(36).substr(2, 16)}`;
    }

    private processEvent(event: AnalyticsEvent): void {
        // Track unique visitors
        if (event.event === "page_view") {
            this.incrementMetric("page_views", 1);
        }
    }

    private startMetricAggregation(): void {
        // Aggregate metrics every hour
        setInterval(() => {
            this.aggregateMetrics();
        }, 60 * 60 * 1000);
    }

    private startAlertMonitoring(): void {
        // Check alerts every minute
        setInterval(() => {
            this.checkAlertRules();
        }, 60 * 1000);
    }

    private aggregateMetrics(): void {
        // Cleanup old data points (keep last 90 days)
        const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        this.metrics.forEach((points, metric) => {
            this.metrics.set(metric, points.filter(p => p.timestamp >= cutoff));
        });
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const analyticsService = new AnalyticsService();
export default analyticsService;
