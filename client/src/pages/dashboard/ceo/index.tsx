/**
 * CEO DASHBOARD - Main Overview
 * Executive dashboard with platform-wide metrics, revenue tracking, and management overview
 * 
 * Features:
 * - Platform KPIs (revenue, bookings, artists, customers)
 * - Revenue trends chart
 * - Artist performance rankings
 * - Recent bookings overview
 * - Alerts and action items
 * - Quick stats comparison
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Euro,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Activity,
  Globe,
  Star,
  Wallet,
  CreditCard,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

// =============================================================================
// TYPES
// =============================================================================

interface PlatformStats {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  bookings: {
    total: number;
    thisMonth: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  artists: {
    total: number;
    active: number;
    onTour: number;
    topPerformer: {
      name: string;
      revenue: number;
    };
  };
  customers: {
    total: number;
    newThisMonth: number;
    returning: number;
  };
  platform: {
    commission: number;
    pendingPayouts: number;
    lastPayoutDate: string;
  };
}

interface RecentBooking {
  id: string;
  customerName: string;
  artistName: string;
  slotDatetime: string;
  depositAmount: string;
  status: string;
  createdAt: string;
}

interface Alert {
  id: string;
  type: "warning" | "error" | "info" | "success";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

interface TopArtist {
  id: string;
  name: string;
  revenue: number;
  bookings: number;
  rating: number;
  trend: "up" | "down" | "stable";
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockStats: PlatformStats = {
  revenue: {
    total: 287500,
    thisMonth: 42350,
    lastMonth: 38920,
    growth: 8.8
  },
  bookings: {
    total: 1847,
    thisMonth: 156,
    pending: 23,
    confirmed: 89,
    completed: 1650,
    cancelled: 85
  },
  artists: {
    total: 24,
    active: 18,
    onTour: 5,
    topPerformer: {
      name: "Danilo Santos",
      revenue: 18750
    }
  },
  customers: {
    total: 1245,
    newThisMonth: 87,
    returning: 456
  },
  platform: {
    commission: 43125,
    pendingPayouts: 8450,
    lastPayoutDate: "2024-12-01"
  }
};

const mockRecentBookings: RecentBooking[] = [
  {
    id: "BK001",
    customerName: "Maria Silva",
    artistName: "Danilo Santos",
    slotDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    depositAmount: "150",
    status: "confirmed",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "BK002",
    customerName: "João Costa",
    artistName: "Ana Ink",
    slotDatetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    depositAmount: "200",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "BK003",
    customerName: "Pedro Almeida",
    artistName: "Carlos Art",
    slotDatetime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    depositAmount: "175",
    status: "confirmed",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Pending Payouts",
    description: "€8,450.00 in artist payouts are ready to be processed.",
    action: { label: "Process Now", href: "/dashboard/ceo/financial" }
  },
  {
    id: "2",
    type: "info",
    title: "New Artist Application",
    description: "2 new artists are waiting for approval.",
    action: { label: "Review", href: "/dashboard/ceo/artists?tab=pending" }
  },
  {
    id: "3",
    type: "error",
    title: "Failed Payment",
    description: "1 payment failed for booking BK789. Customer needs to retry.",
    action: { label: "View Details", href: "/dashboard/ceo/bookings/BK789" }
  }
];

const mockTopArtists: TopArtist[] = [
  { id: "1", name: "Danilo Santos", revenue: 18750, bookings: 48, rating: 4.9, trend: "up" },
  { id: "2", name: "Ana Ink", revenue: 15320, bookings: 42, rating: 4.8, trend: "up" },
  { id: "3", name: "Carlos Art", revenue: 12890, bookings: 35, rating: 4.7, trend: "stable" },
  { id: "4", name: "Sofia Tattoo", revenue: 11200, bookings: 32, rating: 4.9, trend: "up" },
  { id: "5", name: "Miguel Black", revenue: 9870, bookings: 28, rating: 4.6, trend: "down" }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

const getRelativeTime = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

// =============================================================================
// COMPONENTS
// =============================================================================

function KPICard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  color = "primary",
  href
}: {
  title: string;
  value: string;
  icon: any;
  change?: number;
  changeLabel?: string;
  color?: "primary" | "success" | "gold" | "warning";
  href?: string;
}) {
  const colors = {
    primary: { bg: "bg-[var(--brand-primary)]/10", text: "text-[var(--brand-primary)]" },
    success: { bg: "bg-[var(--signal-success)]/10", text: "text-[var(--signal-success)]" },
    gold: { bg: "bg-[var(--brand-gold)]/10", text: "text-[var(--brand-gold)]" },
    warning: { bg: "bg-[var(--signal-warning)]/10", text: "text-[var(--signal-warning)]" }
  };

  const content = (
    <Card className="stat-card hover:border-[var(--brand-primary)]/30 transition-colors cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl ${colors[color].bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colors[color].text}`} />
          </div>
          {change !== undefined && (
            <Badge className={change >= 0 ? "badge-success" : "badge-error"}>
              {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {change >= 0 ? "+" : ""}{change.toFixed(1)}%
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{title}</p>
          {changeLabel && (
            <p className="text-xs text-[var(--text-muted)] mt-2">{changeLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function AlertCard({ alert }: { alert: Alert }) {
  const colors = {
    warning: { bg: "bg-[var(--signal-warning)]/10", border: "border-[var(--signal-warning)]/30", icon: AlertCircle, iconColor: "text-[var(--signal-warning)]" },
    error: { bg: "bg-[var(--signal-error)]/10", border: "border-[var(--signal-error)]/30", icon: XCircle, iconColor: "text-[var(--signal-error)]" },
    info: { bg: "bg-[var(--brand-primary)]/10", border: "border-[var(--brand-primary)]/30", icon: Activity, iconColor: "text-[var(--brand-primary)]" },
    success: { bg: "bg-[var(--signal-success)]/10", border: "border-[var(--signal-success)]/30", icon: CheckCircle, iconColor: "text-[var(--signal-success)]" }
  };

  const style = colors[alert.type];
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-lg ${style.bg} border ${style.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--text-primary)]">{alert.title}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{alert.description}</p>
          {alert.action && (
            <Link href={alert.action.href}>
              <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-[var(--brand-primary)]">
                {alert.action.label}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function TopArtistRow({ artist, rank }: { artist: TopArtist; rank: number }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-surface)] transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rank === 1 ? "bg-[var(--brand-gold)]/20 text-[var(--brand-gold)]" :
          rank === 2 ? "bg-gray-200 text-gray-600" :
            rank === 3 ? "bg-orange-100 text-orange-600" :
              "bg-[var(--bg-surface)] text-[var(--text-muted)]"
        }`}>
        {rank}
      </div>
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-sm font-semibold">
          {getInitials(artist.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)] truncate">{artist.name}</p>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{artist.bookings} bookings</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-[var(--brand-gold)]" />
            {artist.rating}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[var(--signal-success)]">{formatCurrency(artist.revenue)}</p>
        <div className="flex items-center justify-end gap-1 text-xs">
          {artist.trend === "up" && <TrendingUp className="w-3 h-3 text-[var(--signal-success)]" />}
          {artist.trend === "down" && <TrendingDown className="w-3 h-3 text-[var(--signal-error)]" />}
          <span className={
            artist.trend === "up" ? "text-[var(--signal-success)]" :
              artist.trend === "down" ? "text-[var(--signal-error)]" :
                "text-[var(--text-muted)]"
          }>
            {artist.trend === "up" ? "Growing" : artist.trend === "down" ? "Declining" : "Stable"}
          </span>
        </div>
      </div>
    </div>
  );
}

function RecentBookingRow({ booking }: { booking: RecentBooking }) {
  const statusColors = {
    confirmed: "badge-success",
    pending: "badge-warning",
    completed: "badge-primary",
    cancelled: "badge-error"
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-surface)] transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-semibold">
            {getInitials(booking.customerName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{booking.customerName}</p>
          <p className="text-xs text-[var(--text-muted)]">
            with {booking.artistName} • {formatDate(booking.slotDatetime)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-[var(--signal-success)]">
          €{booking.depositAmount}
        </span>
        <Badge className={statusColors[booking.status as keyof typeof statusColors] || ""}>
          {booking.status}
        </Badge>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CEODashboard() {
  const { user } = useAuth();
  const [stats] = useState<PlatformStats>(mockStats);
  const [recentBookings] = useState<RecentBooking[]>(mockRecentBookings);
  const [alerts] = useState<Alert[]>(mockAlerts);
  const [topArtists] = useState<TopArtist[]>(mockTopArtists);

  const displayName = (user as any)?.displayName || "CEO";

  // Calculate metrics
  const completionRate = stats.bookings.total > 0
    ? ((stats.bookings.completed / stats.bookings.total) * 100).toFixed(1)
    : "0";

  return (
    <DashboardLayout title="Platform Overview" subtitle={`Welcome back, ${displayName}`}>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(stats.revenue.total)}
          icon={Euro}
          color="gold"
          change={stats.revenue.growth}
          changeLabel={`vs last month: ${formatCurrency(stats.revenue.lastMonth)}`}
          href="/dashboard/ceo/financial"
        />
        <KPICard
          title="This Month Revenue"
          value={formatCurrency(stats.revenue.thisMonth)}
          icon={TrendingUp}
          color="success"
          href="/dashboard/ceo/financial"
        />
        <KPICard
          title="Total Bookings"
          value={stats.bookings.total.toLocaleString()}
          icon={Calendar}
          color="primary"
          changeLabel={`${stats.bookings.thisMonth} this month`}
          href="/dashboard/ceo/bookings"
        />
        <KPICard
          title="Active Artists"
          value={`${stats.artists.active}/${stats.artists.total}`}
          icon={Users}
          color="primary"
          changeLabel={`${stats.artists.onTour} on tour`}
          href="/dashboard/ceo/artists"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--signal-success)]">{stats.bookings.confirmed}</p>
            <p className="text-xs text-[var(--text-muted)]">Confirmed</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--signal-warning)]">{stats.bookings.pending}</p>
            <p className="text-xs text-[var(--text-muted)]">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--brand-primary)]">{completionRate}%</p>
            <p className="text-xs text-[var(--text-muted)]">Completion Rate</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--brand-gold)]">{formatCurrency(stats.platform.commission)}</p>
            <p className="text-xs text-[var(--text-muted)]">Platform Commission</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Alerts */}
          {alerts.length > 0 && (
            <Card className="card-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[var(--signal-warning)]" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Bookings */}
          <Card className="card-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Recent Bookings
              </CardTitle>
              <Link href="/dashboard/ceo/bookings">
                <Button variant="ghost" size="sm" className="text-[var(--brand-primary)]">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentBookings.map((booking) => (
                <RecentBookingRow key={booking.id} booking={booking} />
              ))}
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[var(--signal-success)]/10 border border-[var(--signal-success)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-[var(--signal-success)]" />
                    <span className="font-medium text-[var(--text-primary)]">Payments</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">All systems operational</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--signal-success)]/10 border border-[var(--signal-success)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-[var(--signal-success)]" />
                    <span className="font-medium text-[var(--text-primary)]">Email</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">Delivery rate: 99.2%</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--signal-warning)]/10 border border-[var(--signal-warning)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-[var(--signal-warning)]" />
                    <span className="font-medium text-[var(--text-primary)]">Payouts</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{formatCurrency(stats.platform.pendingPayouts)} pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Top Artists */}
          <Card className="card-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Top Performers
              </CardTitle>
              <Link href="/dashboard/ceo/artists">
                <Button variant="ghost" size="sm" className="text-[var(--brand-primary)]">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {topArtists.map((artist, index) => (
                <TopArtistRow key={artist.id} artist={artist} rank={index + 1} />
              ))}
            </CardContent>
          </Card>

          {/* Customer Stats */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Customer Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Total Customers</span>
                <span className="font-semibold text-[var(--text-primary)]">{stats.customers.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">New This Month</span>
                <span className="font-semibold text-[var(--signal-success)]">+{stats.customers.newThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Returning Customers</span>
                <span className="font-semibold text-[var(--brand-primary)]">{stats.customers.returning}</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-muted)]">Retention Rate</span>
                  <span className="font-medium">{((stats.customers.returning / stats.customers.total) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.customers.returning / stats.customers.total) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/ceo/financial">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CreditCard className="w-4 h-4" />
                  Process Payouts
                </Button>
              </Link>
              <Link href="/dashboard/ceo/artists?tab=pending">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4" />
                  Review Applications
                </Button>
              </Link>
              <Link href="/dashboard/ceo/reports">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Generate Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
