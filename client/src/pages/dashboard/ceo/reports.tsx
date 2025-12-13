/**
 * CEO REPORTS & ANALYTICS DASHBOARD
 * Enterprise-grade analytics with charts, exports, and insights
 * 
 * Part 1/3 - Core components and types
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Settings,
  Share2,
  Printer,
  Mail,
  Clock,
  Users,
  Euro,
  CreditCard,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  Bookmark,
  Star,
  MapPin,
  Globe,
  Zap,
  Activity,
  Layers,
  Hash,
  Percent,
  DollarSign,
  CalendarDays,
  CalendarRange,
  Building,
  Briefcase,
  UserCheck,
  UserX,
  Search,
  X,
  Plus,
  Minus,
  Copy,
  ExternalLink,
  Info,
  HelpCircle,
  Bell,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2
} from "lucide-react";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface ReportFilter {
  dateRange: DateRange;
  artists: string[];
  cities: string[];
  statuses: string[];
  paymentMethods: string[];
  minAmount: number | null;
  maxAmount: number | null;
}

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  formattedValue: string;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  trend: number[];
  period: string;
  icon: any;
  color: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  previousValue?: number;
  color?: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
  avgOrderValue: number;
  commission: number;
}

interface ArtistPerformance {
  id: string;
  name: string;
  avatar?: string;
  city: string;
  totalRevenue: number;
  bookingsCount: number;
  completionRate: number;
  avgRating: number;
  trend: "up" | "down" | "stable";
  change: number;
}

interface BookingAnalytics {
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  pending: number;
  noShow: number;
  avgDuration: number;
  avgValue: number;
  peakHour: string;
  peakDay: string;
}

interface GeographicData {
  country: string;
  city: string;
  bookings: number;
  revenue: number;
  percentage: number;
}

interface ConversionFunnel {
  stage: string;
  value: number;
  percentage: number;
  dropoff: number;
}

interface ScheduledReport {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly";
  format: "pdf" | "excel" | "csv";
  recipients: string[];
  lastSent?: string;
  nextSend: string;
  active: boolean;
}

interface ExportConfig {
  format: "pdf" | "excel" | "csv" | "json";
  sections: string[];
  dateRange: DateRange;
  includeCharts: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "12months", label: "Last 12 Months" },
  { value: "ytd", label: "Year to Date" },
  { value: "custom", label: "Custom Range" }
];

const CHART_COLORS = [
  "var(--brand-primary)",
  "var(--signal-success)",
  "var(--brand-gold)",
  "var(--signal-info)",
  "var(--signal-warning)",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4"
];

const EXPORT_FORMATS = [
  { value: "pdf", label: "PDF Report", icon: FileText },
  { value: "excel", label: "Excel Spreadsheet", icon: FileSpreadsheet },
  { value: "csv", label: "CSV Data", icon: FileText },
  { value: "json", label: "JSON Data", icon: FileText }
];

const REPORT_SECTIONS = [
  { id: "overview", label: "Executive Summary" },
  { id: "revenue", label: "Revenue Analysis" },
  { id: "bookings", label: "Booking Statistics" },
  { id: "artists", label: "Artist Performance" },
  { id: "geographic", label: "Geographic Distribution" },
  { id: "conversion", label: "Conversion Funnel" },
  { id: "trends", label: "Trends & Forecasts" }
];

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

const generateRevenueData = (days: number): RevenueData[] => {
  const data: RevenueData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const baseRevenue = 3000 + Math.random() * 2000;
    const seasonalFactor = 1 + Math.sin((date.getMonth() * Math.PI) / 6) * 0.2;
    const dayOfWeekFactor = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1;

    const revenue = Math.round(baseRevenue * seasonalFactor * dayOfWeekFactor);
    const bookings = Math.floor(revenue / 250) + Math.floor(Math.random() * 5);

    data.push({
      date: date.toISOString().split("T")[0],
      revenue,
      bookings,
      avgOrderValue: Math.round(revenue / bookings),
      commission: Math.round(revenue * 0.15)
    });
  }

  return data;
};

const generateArtistPerformance = (): ArtistPerformance[] => {
  const names = [
    "Danilo Santos", "Ana Ink", "Carlos Art", "Sofia Tattoo",
    "Miguel Black", "Luna Design", "Pedro Style", "Maria Fineline",
    "Lucas Shadow", "Emma Color"
  ];
  const cities = ["Amsterdam", "Lisbon", "Berlin", "Paris", "Madrid", "London"];

  return names.map((name, i) => ({
    id: `A${String(i + 1).padStart(3, "0")}`,
    name,
    city: cities[i % cities.length],
    totalRevenue: Math.round(15000 + Math.random() * 25000),
    bookingsCount: Math.floor(30 + Math.random() * 50),
    completionRate: 85 + Math.random() * 14,
    avgRating: 4.2 + Math.random() * 0.8,
    trend: Math.random() > 0.3 ? "up" : Math.random() > 0.5 ? "down" : "stable",
    change: Math.round((Math.random() - 0.3) * 30)
  }));
};

const generateGeographicData = (): GeographicData[] => {
  const locations = [
    { country: "Netherlands", city: "Amsterdam" },
    { country: "Portugal", city: "Lisbon" },
    { country: "Germany", city: "Berlin" },
    { country: "France", city: "Paris" },
    { country: "Spain", city: "Madrid" },
    { country: "UK", city: "London" },
    { country: "Belgium", city: "Brussels" },
    { country: "Italy", city: "Milan" }
  ];

  let total = 0;
  const data = locations.map(loc => {
    const bookings = Math.floor(50 + Math.random() * 200);
    const revenue = bookings * (200 + Math.random() * 100);
    total += bookings;
    return { ...loc, bookings, revenue, percentage: 0 };
  });

  return data.map(d => ({ ...d, percentage: (d.bookings / total) * 100 }))
    .sort((a, b) => b.bookings - a.bookings);
};

const generateConversionFunnel = (): ConversionFunnel[] => {
  const stages = [
    { stage: "Page Views", base: 10000 },
    { stage: "Artist Profile Views", base: 4500 },
    { stage: "Booking Started", base: 2000 },
    { stage: "Date Selected", base: 1500 },
    { stage: "Details Completed", base: 1200 },
    { stage: "Payment Initiated", base: 1000 },
    { stage: "Booking Confirmed", base: 850 }
  ];

  const initial = stages[0].base;
  return stages.map((s, i) => ({
    stage: s.stage,
    value: s.base,
    percentage: (s.base / initial) * 100,
    dropoff: i > 0 ? ((stages[i - 1].base - s.base) / stages[i - 1].base) * 100 : 0
  }));
};

const generateMetricCards = (): MetricCard[] => [
  {
    id: "revenue",
    title: "Total Revenue",
    value: 287500,
    formattedValue: "€287.5k",
    change: 12.5,
    changeType: "increase",
    trend: [45, 52, 49, 63, 58, 72, 68, 75, 82, 78, 85, 91],
    period: "This Month",
    icon: Euro,
    color: "var(--signal-success)"
  },
  {
    id: "bookings",
    title: "Total Bookings",
    value: 1247,
    formattedValue: "1,247",
    change: 8.3,
    changeType: "increase",
    trend: [120, 135, 128, 142, 155, 148, 165, 172, 168, 185, 192, 188],
    period: "This Month",
    icon: CalendarDays,
    color: "var(--brand-primary)"
  },
  {
    id: "artists",
    title: "Active Artists",
    value: 24,
    formattedValue: "24",
    change: 2,
    changeType: "increase",
    trend: [18, 19, 19, 20, 21, 21, 22, 22, 23, 23, 24, 24],
    period: "Currently Active",
    icon: Users,
    color: "var(--brand-gold)"
  },
  {
    id: "conversion",
    title: "Conversion Rate",
    value: 8.5,
    formattedValue: "8.5%",
    change: 0.8,
    changeType: "increase",
    trend: [6.2, 6.5, 6.8, 7.1, 7.4, 7.2, 7.8, 8.0, 7.9, 8.2, 8.4, 8.5],
    period: "Booking Conversion",
    icon: Target,
    color: "var(--signal-info)"
  },
  {
    id: "avgOrder",
    title: "Avg Order Value",
    value: 230,
    formattedValue: "€230",
    change: -2.1,
    changeType: "decrease",
    trend: [245, 238, 242, 235, 240, 232, 228, 235, 230, 225, 232, 230],
    period: "Per Booking",
    icon: CreditCard,
    color: "var(--text-muted)"
  },
  {
    id: "satisfaction",
    title: "Customer Satisfaction",
    value: 4.7,
    formattedValue: "4.7/5",
    change: 0.1,
    changeType: "increase",
    trend: [4.4, 4.5, 4.5, 4.6, 4.5, 4.6, 4.6, 4.7, 4.6, 4.7, 4.7, 4.7],
    period: "Average Rating",
    icon: Star,
    color: "var(--brand-gold)"
  }
];

const generateBookingAnalytics = (): BookingAnalytics => ({
  total: 1247,
  confirmed: 892,
  completed: 756,
  cancelled: 98,
  pending: 157,
  noShow: 34,
  avgDuration: 165,
  avgValue: 230,
  peakHour: "14:00",
  peakDay: "Saturday"
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number, compact = false): string => {
  if (compact && amount >= 1000) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1
    }).format(amount);
  }
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("de-DE").format(num);
};

const formatPercent = (num: number): string => {
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
};

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

const formatDateFull = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const getDateRangeFromPeriod = (period: string): DateRange => {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
      now.setHours(23, 59, 59, 999);
      break;
    case "7days":
      start.setDate(start.getDate() - 7);
      break;
    case "30days":
      start.setDate(start.getDate() - 30);
      break;
    case "90days":
      start.setDate(start.getDate() - 90);
      break;
    case "12months":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "ytd":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return { start, end: now };
};

// =============================================================================
// CHART COMPONENTS
// =============================================================================

function MiniSparkline({ data, color, height = 40, width = 120 }: {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#gradient-${color.replace(/[^a-z0-9]/gi, "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarChart({ data, height = 200, showLabels = true }: {
  data: ChartDataPoint[];
  height?: number;
  showLabels?: boolean;
}) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 30);
          const prevHeight = item.previousValue ? (item.previousValue / maxValue) * (height - 30) : 0;

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex items-end justify-center gap-1" style={{ height: height - 30 }}>
                {item.previousValue !== undefined && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: prevHeight }}
                    className="w-3 rounded-t-sm bg-[var(--text-muted)]/30"
                  />
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ delay: index * 0.05 }}
                  className="w-5 rounded-t-sm"
                  style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
                />
              </div>
              {showLabels && (
                <span className="text-xs text-[var(--text-muted)] mt-2 truncate max-w-full">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineChartComponent({ data, height = 200, showGrid = true }: {
  data: RevenueData[];
  height?: number;
  showGrid?: boolean;
}) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const width = 100;

  const revenuePoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 40 - ((d.revenue / maxRevenue) * (height - 60));
    return { x, y, data: d };
  });

  const linePath = revenuePoints.map((p, i) =>
    `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`
  ).join(" ");

  const areaPath = `M 0 ${height - 40} ${revenuePoints.map(p => `L ${p.x} ${p.y}`).join(" ")} L ${width} ${height - 40} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-success)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--signal-success)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {showGrid && [0.25, 0.5, 0.75].map(ratio => (
        <line
          key={ratio}
          x1="0"
          y1={height - 40 - (height - 60) * ratio}
          x2={width}
          y2={height - 40 - (height - 60) * ratio}
          stroke="var(--border-subtle)"
          strokeDasharray="2,2"
        />
      ))}

      {/* Area */}
      <path d={areaPath} fill="url(#revenueGradient)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="var(--signal-success)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {revenuePoints.filter((_, i) => i % Math.ceil(data.length / 10) === 0).map((point, i) => (
        <g key={i}>
          <circle cx={point.x} cy={point.y} r="3" fill="var(--signal-success)" />
          <text
            x={point.x}
            y={height - 10}
            textAnchor="middle"
            className="text-[3px] fill-[var(--text-muted)]"
          >
            {formatDate(point.data.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ data, size = 180, thickness = 25 }: {
  data: ChartDataPoint[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {data.map((item, index) => {
          const percentage = item.value / total;
          const strokeDasharray = `${circumference * percentage} ${circumference}`;
          const strokeDashoffset = -circumference * accumulatedOffset;
          accumulatedOffset += percentage;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {formatNumber(total)}
        </span>
        <span className="text-sm text-[var(--text-muted)]">Total</span>
      </div>
    </div>
  );
}

function FunnelChart({ data, height = 300 }: {
  data: ConversionFunnel[];
  height?: number;
}) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-2" style={{ height }}>
      {data.map((stage, index) => {
        const width = (stage.value / maxValue) * 100;
        const isLast = index === data.length - 1;

        return (
          <motion.div
            key={stage.stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div
                  className="h-10 rounded-r-lg flex items-center px-4 transition-all hover:opacity-90"
                  style={{
                    width: `${width}%`,
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                    minWidth: "100px"
                  }}
                >
                  <span className="text-white font-medium text-sm truncate">
                    {formatNumber(stage.value)}
                  </span>
                </div>
              </div>
              <div className="w-32 text-right">
                <p className="text-sm font-medium text-[var(--text-primary)]">{stage.stage}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {stage.percentage.toFixed(1)}%
                  {stage.dropoff > 0 && (
                    <span className="text-[var(--signal-error)] ml-1">
                      (-{stage.dropoff.toFixed(1)}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
            {!isLast && (
              <div className="absolute left-0 -bottom-1 w-full h-2 flex items-center">
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function HeatmapChart({ height = 200 }: { height?: number }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm"];

  const data = days.map(() =>
    hours.map(() => Math.random() * 100)
  );

  const getColor = (value: number) => {
    if (value < 20) return "var(--bg-surface)";
    if (value < 40) return "var(--brand-primary)/20";
    if (value < 60) return "var(--brand-primary)/40";
    if (value < 80) return "var(--brand-primary)/60";
    return "var(--brand-primary)";
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 pr-2">
          <div className="h-6" />
          {days.map(day => (
            <div key={day} className="h-6 flex items-center text-xs text-[var(--text-muted)]">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div className="flex gap-1 mb-1">
            {hours.map(hour => (
              <div key={hour} className="flex-1 text-center text-xs text-[var(--text-muted)]">
                {hour}
              </div>
            ))}
          </div>
          {data.map((row, dayIndex) => (
            <div key={dayIndex} className="flex gap-1 mb-1">
              {row.map((value, hourIndex) => (
                <div
                  key={hourIndex}
                  className="flex-1 h-6 rounded cursor-pointer hover:ring-2 hover:ring-[var(--brand-primary)] transition-all"
                  style={{
                    backgroundColor: value < 20 ? "var(--bg-surface)" :
                      `rgb(124 58 237 / ${value / 100})`
                  }}
                  title={`${days[dayIndex]} ${hours[hourIndex]}: ${Math.round(value)} bookings`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CARD COMPONENTS
// =============================================================================

function MetricCardComponent({ metric, onClick }: { metric: MetricCard; onClick?: () => void }) {
  const Icon = metric.icon;
  const isPositive = metric.changeType === "increase";
  const isNegative = metric.changeType === "decrease";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="stat-card h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${metric.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: metric.color }} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-[var(--signal-success)]" :
                isNegative ? "text-[var(--signal-error)]" :
                  "text-[var(--text-muted)]"
              }`}>
              {isPositive && <ArrowUpRight className="w-4 h-4" />}
              {isNegative && <ArrowDownRight className="w-4 h-4" />}
              {formatPercent(metric.change)}
            </div>
          </div>
          <div className="mb-3">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {metric.formattedValue}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{metric.title}</p>
          </div>
          <MiniSparkline data={metric.trend} color={metric.color} />
          <p className="text-xs text-[var(--text-muted)] mt-2">{metric.period}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ArtistRankingCard({ artists }: { artists: ArtistPerformance[] }) {
  return (
    <Card className="card-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Top Artists</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {artists.slice(0, 5).map((artist, index) => (
          <div key={artist.id} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-sm font-bold text-[var(--text-muted)]">
              #{index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text-primary)] truncate">{artist.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{artist.city}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[var(--signal-success)]">
                {formatCurrency(artist.totalRevenue, true)}
              </p>
              <p className={`text-xs ${artist.trend === "up" ? "text-[var(--signal-success)]" :
                  artist.trend === "down" ? "text-[var(--signal-error)]" :
                    "text-[var(--text-muted)]"
                }`}>
                {artist.trend === "up" && "↑"}
                {artist.trend === "down" && "↓"}
                {artist.change}%
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BookingStatusCard({ analytics }: { analytics: BookingAnalytics }) {
  const statuses = [
    { label: "Confirmed", value: analytics.confirmed, color: "var(--signal-success)" },
    { label: "Completed", value: analytics.completed, color: "var(--brand-primary)" },
    { label: "Pending", value: analytics.pending, color: "var(--signal-warning)" },
    { label: "Cancelled", value: analytics.cancelled, color: "var(--signal-error)" },
    { label: "No Show", value: analytics.noShow, color: "var(--text-muted)" }
  ];

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Booking Status</CardTitle>
        <CardDescription>Distribution of {formatNumber(analytics.total)} bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          <DonutChart data={statuses.map(s => ({ label: s.label, value: s.value, color: s.color }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {statuses.map(status => (
            <div key={status.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
              <span className="text-sm text-[var(--text-secondary)]">{status.label}</span>
              <span className="text-sm font-medium text-[var(--text-primary)] ml-auto">
                {formatNumber(status.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GeographicCard({ data }: { data: GeographicData[] }) {
  return (
    <Card className="card-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Geographic Distribution</CardTitle>
          <Badge variant="secondary">{data.length} Regions</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 6).map((location, index) => (
            <div key={`${location.country}-${location.city}`} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="font-medium text-[var(--text-primary)]">{location.city}</span>
                  <span className="text-[var(--text-muted)]">{location.country}</span>
                </div>
                <span className="font-medium text-[var(--text-primary)]">
                  {formatNumber(location.bookings)} ({location.percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={location.percentage}
                className="h-2"
                style={{
                  // @ts-ignore
                  "--progress-foreground": CHART_COLORS[index % CHART_COLORS.length]
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// FILTER & EXPORT COMPONENTS
// =============================================================================

function DateRangeSelector({
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange
}: {
  period: string;
  onPeriodChange: (period: string) => void;
  customRange: DateRange;
  onCustomRangeChange: (range: DateRange) => void;
}) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Select value={period} onValueChange={(value) => {
        onPeriodChange(value);
        if (value !== "custom") {
          onCustomRangeChange(getDateRangeFromPeriod(value));
        } else {
          setShowCustomPicker(true);
        }
      }}>
        <SelectTrigger className="w-44">
          <Calendar className="w-4 h-4 mr-2 text-[var(--text-muted)]" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map(p => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {period === "custom" && customRange.start && customRange.end && (
        <Badge variant="secondary" className="text-xs">
          {formatDate(customRange.start)} - {formatDate(customRange.end)}
        </Badge>
      )}
    </div>
  );
}

function ExportDialog({
  open,
  onOpenChange,
  onExport
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (config: ExportConfig) => void;
}) {
  const [format, setFormat] = useState<ExportConfig["format"]>("pdf");
  const [sections, setSections] = useState<string[]>(REPORT_SECTIONS.map(s => s.id));
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 2000));
    onExport({
      format,
      sections,
      dateRange: { start: new Date(), end: new Date() },
      includeCharts
    });
    setIsExporting(false);
    onOpenChange(false);
  };

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Configure your report export options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_FORMATS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value as any)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${format === f.value
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                      : "border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/50"
                    }`}
                >
                  <f.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Include Sections</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {REPORT_SECTIONS.map(section => (
                <div key={section.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={sections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <span className="text-sm text-[var(--text-secondary)]">{section.label}</span>
                </div>
              ))}
            </div>
          </div>

          {format === "pdf" && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(!!checked)}
              />
              <span className="text-sm text-[var(--text-secondary)]">Include charts and visualizations</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="btn-primary">
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CEOReports() {
  const { user } = useAuth();

  // State
  const [period, setPeriod] = useState("30days");
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPeriod("30days"));
  const [activeTab, setActiveTab] = useState("overview");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data
  const metrics = useMemo(() => generateMetricCards(), []);
  const revenueData = useMemo(() => generateRevenueData(30), []);
  const artistPerformance = useMemo(() => generateArtistPerformance(), []);
  const geographicData = useMemo(() => generateGeographicData(), []);
  const conversionFunnel = useMemo(() => generateConversionFunnel(), []);
  const bookingAnalytics = useMemo(() => generateBookingAnalytics(), []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRefreshing(false);
  };

  const handleExport = (config: ExportConfig) => {
    console.log("Exporting with config:", config);
  };

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Business intelligence and insights">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <DateRangeSelector
          period={period}
          onPeriodChange={setPeriod}
          customRange={dateRange}
          onCustomRangeChange={setDateRange}
        />

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => setExportDialogOpen(true)} className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metrics.map(metric => (
          <MetricCardComponent key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="card-white lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent data={revenueData} height={250} />
              </CardContent>
            </Card>

            <BookingStatusCard analytics={bookingAnalytics} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ArtistRankingCard artists={artistPerformance} />
            <GeographicCard data={geographicData} />
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card className="card-white">
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChartComponent data={revenueData} height={350} />
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="card-white">
              <CardHeader>
                <CardTitle>Revenue by Day of Week</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
                    label: day,
                    value: Math.random() * 10000 + 5000
                  }))}
                  height={200}
                />
              </CardContent>
            </Card>

            <Card className="card-white">
              <CardHeader>
                <CardTitle>Revenue by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <HeatmapChart height={200} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="card-white lg:col-span-2">
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={revenueData.slice(-14).map(d => ({
                    label: formatDate(d.date),
                    value: d.bookings
                  }))}
                  height={250}
                />
              </CardContent>
            </Card>
            <BookingStatusCard analytics={bookingAnalytics} />
          </div>
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-6">
          <Card className="card-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Artist Performance</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Completion</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artistPerformance.map((artist, index) => (
                    <TableRow key={artist.id}>
                      <TableCell>
                        <span className="font-bold text-[var(--text-muted)]">#{index + 1}</span>
                      </TableCell>
                      <TableCell className="font-medium">{artist.name}</TableCell>
                      <TableCell className="text-[var(--text-muted)]">{artist.city}</TableCell>
                      <TableCell className="text-right font-mono text-[var(--signal-success)]">
                        {formatCurrency(artist.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">{artist.bookingsCount}</TableCell>
                      <TableCell className="text-right">{artist.completionRate.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-4 h-4 text-[var(--brand-gold)] fill-current" />
                          {artist.avgRating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          artist.trend === "up" ? "badge-success" :
                            artist.trend === "down" ? "badge-error" : ""
                        }>
                          {artist.trend === "up" && "↑"}
                          {artist.trend === "down" && "↓"}
                          {artist.change}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <GeographicCard data={geographicData} />
            <Card className="card-white">
              <CardHeader>
                <CardTitle>Revenue by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={geographicData.slice(0, 8).map(g => ({
                    label: g.city,
                    value: g.revenue
                  }))}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <Card className="card-white">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Track user journey from page view to booking</CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelChart data={conversionFunnel} height={350} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
      />
    </DashboardLayout>
  );
}
