/**
 * ARTIST DASHBOARD - Main Overview
 * Comprehensive artist dashboard with stats, upcoming bookings, earnings, and quick actions
 * 
 * Features:
 * - Real-time statistics (bookings, earnings, views)
 * - Upcoming sessions list
 * - Recent activity feed
 * - Quick action buttons
 * - Earnings chart
 * - Calendar preview
 * - Notification center
 * - Tour mode status
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
  Calendar,
  Euro,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Globe,
  Palette,
  Settings,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarPlus,
  AlertCircle,
  Star,
  MapPin,
  CreditCard,
  Zap,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

// =============================================================================
// TYPES
// =============================================================================

interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  completedThisMonth: number;
  cancelledThisMonth: number;
  totalEarnings: number;
  earningsThisMonth: number;
  earningsLastMonth: number;
  profileViews: number;
  portfolioViews: number;
  averageRating: number;
  totalReviews: number;
}

interface UpcomingBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  slotDatetime: string;
  durationMinutes: number;
  depositAmount: string;
  status: string;
  notes?: string;
}

interface ActivityItem {
  id: string;
  type: "booking" | "payment" | "review" | "profile";
  message: string;
  timestamp: string;
  icon: "calendar" | "euro" | "star" | "user";
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
}

// =============================================================================
// MOCK DATA (will be replaced with API calls)
// =============================================================================

const mockStats: DashboardStats = {
  totalBookings: 156,
  confirmedBookings: 12,
  pendingBookings: 3,
  completedThisMonth: 8,
  cancelledThisMonth: 1,
  totalEarnings: 18750,
  earningsThisMonth: 3250,
  earningsLastMonth: 2890,
  profileViews: 1234,
  portfolioViews: 5678,
  averageRating: 4.9,
  totalReviews: 87
};

const mockUpcomingBookings: UpcomingBooking[] = [
  {
    id: "BK001",
    customerName: "Maria Silva",
    customerEmail: "maria@email.com",
    slotDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 180,
    depositAmount: "150",
    status: "confirmed",
    notes: "Fineline butterfly on shoulder"
  },
  {
    id: "BK002",
    customerName: "João Costa",
    customerEmail: "joao@email.com",
    slotDatetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 240,
    depositAmount: "200",
    status: "confirmed",
    notes: "Cover-up on forearm"
  },
  {
    id: "BK003",
    customerName: "Ana Santos",
    customerEmail: "ana@email.com",
    slotDatetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 120,
    depositAmount: "100",
    status: "pending"
  }
];

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "booking",
    message: "New booking from Maria Silva",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    icon: "calendar"
  },
  {
    id: "2",
    type: "payment",
    message: "Payment received: €150.00",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    icon: "euro"
  },
  {
    id: "3",
    type: "review",
    message: "New 5-star review from Pedro",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    icon: "star"
  }
];

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Booking Reminder",
    message: "You have a session with Maria tomorrow at 10:00",
    type: "info",
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Payout Processed",
    message: "Your monthly payout of €2,340 has been sent",
    type: "success",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
};

const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
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
  return `${days} days ago`;
};

const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "primary",
  suffix
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "success" | "warning" | "gold";
  suffix?: string;
}) {
  const colorClasses = {
    primary: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]",
    success: "bg-[var(--signal-success)]/10 text-[var(--signal-success)]",
    warning: "bg-[var(--signal-warning)]/10 text-[var(--signal-warning)]",
    gold: "bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]"
  };

  const valueColors = {
    primary: "text-[var(--brand-primary)]",
    success: "text-[var(--signal-success)]",
    warning: "text-[var(--signal-warning)]",
    gold: "text-[var(--brand-gold)]"
  };

  return (
    <Card className="stat-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && trendValue && (
            <Badge className={trend === "up" ? "badge-success" : trend === "down" ? "badge-error" : ""}>
              {trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : trend === "down" ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
              {trendValue}
            </Badge>
          )}
        </div>
        <p className="stat-label">{title}</p>
        <p className={`text-2xl font-bold ${valueColors[color]}`}>
          {value}{suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

function UpcomingBookingCard({ booking }: { booking: UpcomingBooking }) {
  const isPending = booking.status === "pending";
  const daysUntil = Math.ceil((new Date(booking.slotDatetime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-sm font-semibold">
              {getInitials(booking.customerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-[var(--text-primary)]">{booking.customerName}</p>
            <p className="text-sm text-[var(--text-muted)]">{booking.customerEmail}</p>
          </div>
        </div>
        <Badge className={isPending ? "badge-warning" : "badge-success"}>
          {isPending ? "Pending" : "Confirmed"}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-[var(--text-muted)]">Date</p>
          <p className="font-medium text-[var(--text-primary)]">{formatDate(booking.slotDatetime)}</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)]">Time</p>
          <p className="font-medium text-[var(--text-primary)]">{formatTime(booking.slotDatetime)}</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)]">Duration</p>
          <p className="font-medium text-[var(--text-primary)]">{booking.durationMinutes / 60}h</p>
        </div>
      </div>

      {booking.notes && (
        <p className="mt-3 text-sm text-[var(--text-secondary)] italic border-t border-[var(--border-subtle)] pt-3">
          "{booking.notes}"
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-muted)]">
            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
          </span>
          <span className="text-sm font-medium text-[var(--signal-success)]">
            {formatCurrency(parseFloat(booking.depositAmount))}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="text-[var(--brand-primary)]">
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const iconMap = {
    calendar: Calendar,
    euro: Euro,
    star: Star,
    user: Users
  };

  const colorMap = {
    booking: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]",
    payment: "bg-[var(--signal-success)]/10 text-[var(--signal-success)]",
    review: "bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]",
    profile: "bg-[var(--signal-info)]/10 text-[var(--signal-info)]"
  };

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = iconMap[activity.icon];
        return (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-surface)] transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[activity.type]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--text-primary)]">{activity.message}</p>
              <p className="text-xs text-[var(--text-muted)]">{getRelativeTime(activity.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: "Add Blocked Time", icon: CalendarPlus, href: "/dashboard/artist/calendar", color: "primary" },
    { label: "View Portfolio", icon: Palette, href: "/dashboard/artist/portfolio", color: "gold" },
    { label: "Tour Mode", icon: Globe, href: "/dashboard/artist/tour", color: "success" },
    { label: "Settings", icon: Settings, href: "/dashboard/artist/settings", color: "primary" }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link key={action.label} href={action.href}>
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
            <action.icon className="w-5 h-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        </Link>
      ))}
    </div>
  );
}

function NotificationList({ notifications }: { notifications: Notification[] }) {
  const unread = notifications.filter(n => !n.read);

  return (
    <div className="space-y-2">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg border ${notification.read ? "border-[var(--border-subtle)]" : "border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5"
            }`}
        >
          <div className="flex items-start gap-2">
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] mt-1.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">{notification.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{notification.message}</p>
            </div>
          </div>
        </div>
      ))}
      {notifications.length > 3 && (
        <Button variant="ghost" size="sm" className="w-full text-[var(--brand-primary)]">
          View all {notifications.length} notifications
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [stats] = useState<DashboardStats>(mockStats);
  const [upcomingBookings] = useState<UpcomingBooking[]>(mockUpcomingBookings);
  const [activities] = useState<ActivityItem[]>(mockActivity);
  const [notifications] = useState<Notification[]>(mockNotifications);

  const displayName = (user as any)?.displayName || "Artist";
  const monthlyGrowth = stats.earningsLastMonth > 0
    ? ((stats.earningsThisMonth - stats.earningsLastMonth) / stats.earningsLastMonth * 100).toFixed(1)
    : "0";
  const monthlyGrowthPositive = parseFloat(monthlyGrowth) >= 0;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardLayout title="Dashboard" subtitle={`${getGreeting()}, ${displayName}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          icon={Euro}
          color="gold"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats.earningsThisMonth)}
          icon={TrendingUp}
          trend={monthlyGrowthPositive ? "up" : "down"}
          trendValue={`${monthlyGrowthPositive ? "+" : ""}${monthlyGrowth}%`}
          color="success"
        />
        <StatCard
          title="Upcoming Sessions"
          value={stats.confirmedBookings}
          icon={Calendar}
          color="primary"
          suffix="confirmed"
        />
        <StatCard
          title="Profile Views"
          value={stats.profileViews.toLocaleString()}
          icon={Eye}
          color="primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Bookings */}
          <Card className="card-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                  Upcoming Sessions
                </CardTitle>
                <CardDescription>
                  Your next {upcomingBookings.length} bookings
                </CardDescription>
              </div>
              <Link href="/dashboard/artist/calendar">
                <Button variant="ghost" size="sm" className="text-[var(--brand-primary)]">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
                  <p className="text-[var(--text-secondary)]">No upcoming bookings</p>
                  <p className="text-sm text-[var(--text-muted)]">New bookings will appear here</p>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <UpcomingBookingCard key={booking.id} booking={booking} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] text-center">
                  <p className="text-2xl font-bold text-[var(--signal-success)]">{stats.completedThisMonth}</p>
                  <p className="text-sm text-[var(--text-muted)]">Completed</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] text-center">
                  <p className="text-2xl font-bold text-[var(--brand-primary)]">{stats.confirmedBookings}</p>
                  <p className="text-sm text-[var(--text-muted)]">Confirmed</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] text-center">
                  <p className="text-2xl font-bold text-[var(--signal-warning)]">{stats.pendingBookings}</p>
                  <p className="text-sm text-[var(--text-muted)]">Pending</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] text-center">
                  <p className="text-2xl font-bold text-[var(--signal-error)]">{stats.cancelledThisMonth}</p>
                  <p className="text-sm text-[var(--text-muted)]">Cancelled</p>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="mt-6 p-4 rounded-lg bg-[var(--bg-surface)]">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Completion Rate</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {Math.round((stats.completedThisMonth / (stats.completedThisMonth + stats.cancelledThisMonth)) * 100) || 0}%
                  </span>
                </div>
                <Progress value={(stats.completedThisMonth / (stats.completedThisMonth + stats.cancelledThisMonth)) * 100} className="h-2" />
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center justify-between p-4 rounded-lg bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/20">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-[var(--brand-gold)]" />
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{stats.averageRating} / 5.0</p>
                    <p className="text-sm text-[var(--text-muted)]">{stats.totalReviews} reviews</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View Reviews</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="card-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Notifications
              </CardTitle>
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="badge-primary">
                  {notifications.filter(n => !n.read).length} new
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <NotificationList notifications={notifications} />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} />
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">75% Complete</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-[var(--signal-success)]">
                    <CheckCircle className="w-4 h-4" />
                    Profile information
                  </li>
                  <li className="flex items-center gap-2 text-[var(--signal-success)]">
                    <CheckCircle className="w-4 h-4" />
                    Portfolio images
                  </li>
                  <li className="flex items-center gap-2 text-[var(--signal-success)]">
                    <CheckCircle className="w-4 h-4" />
                    Calendar configured
                  </li>
                  <li className="flex items-center gap-2 text-[var(--signal-warning)]">
                    <AlertCircle className="w-4 h-4" />
                    Connect Stripe for payouts
                  </li>
                </ul>

                <Link href="/dashboard/artist/settings">
                  <Button className="w-full btn-outline-dark">
                    Complete Setup
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
