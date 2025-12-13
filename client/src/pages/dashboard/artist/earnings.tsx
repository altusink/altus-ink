import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Euro,
  TrendingUp,
  Calendar,
  Clock,
  CreditCard,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Wallet
} from "lucide-react";

interface EarningsData {
  totalEarnings: number;
  pendingPayouts: number;
  thisMonth: number;
  lastMonth: number;
  completedSessions: number;
  upcomingSessions: number;
}

export default function ArtistEarnings() {
  const { user } = useAuth();

  const { data: earnings, isLoading } = useQuery<EarningsData>({
    queryKey: ["/api/artist/earnings"],
    enabled: !!user,
  });

  const displayEarnings = earnings || {
    totalEarnings: 12450,
    pendingPayouts: 2340,
    thisMonth: 3250,
    lastMonth: 2890,
    completedSessions: 48,
    upcomingSessions: 6,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const monthlyGrowth = displayEarnings.lastMonth > 0
    ? ((displayEarnings.thisMonth - displayEarnings.lastMonth) / displayEarnings.lastMonth * 100).toFixed(1)
    : "0";

  if (isLoading) {
    return (
      <DashboardLayout title="Earnings">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Earnings" subtitle="Track your income and payouts">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Total Earnings */}
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-gold)]/10 flex items-center justify-center">
                <Euro className="w-6 h-6 text-[var(--brand-gold)]" />
              </div>
              <Badge className="badge-success">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{monthlyGrowth}%
              </Badge>
            </div>
            <p className="stat-label">Total Earnings</p>
            <p className="stat-value stat-value-gold">{formatCurrency(displayEarnings.totalEarnings)}</p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
            </div>
            <p className="stat-label">This Month</p>
            <p className="stat-value stat-value-primary">{formatCurrency(displayEarnings.thisMonth)}</p>
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--signal-warning)]/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[var(--signal-warning)]" />
              </div>
              <Badge className="badge-warning">Pending</Badge>
            </div>
            <p className="stat-label">Pending Payouts</p>
            <p className="stat-value" style={{ color: 'var(--signal-warning)' }}>{formatCurrency(displayEarnings.pendingPayouts)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Sessions Overview */}
        <Card className="card-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
              Sessions Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--signal-success)]/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[var(--signal-success)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Completed Sessions</p>
                  <p className="text-sm text-[var(--text-secondary)]">All time</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-[var(--signal-success)]">{displayEarnings.completedSessions}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Upcoming Sessions</p>
                  <p className="text-sm text-[var(--text-secondary)]">Next 30 days</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-[var(--brand-primary)]">{displayEarnings.upcomingSessions}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payout Schedule */}
        <Card className="card-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
              Payout Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--signal-success)]/5 border border-[var(--signal-success)]/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--signal-success)]/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[var(--signal-success)]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">Next Payout</p>
                  <p className="text-2xl font-bold text-[var(--signal-success)] mt-1">
                    {formatCurrency(displayEarnings.pendingPayouts)}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    Scheduled for the end of this month
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Monthly Progress</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Goal: €5,000</span>
                  <span className="font-medium text-[var(--text-primary)]">{Math.round((displayEarnings.thisMonth / 5000) * 100)}%</span>
                </div>
                <Progress
                  value={(displayEarnings.thisMonth / 5000) * 100}
                  className="h-2"
                />
              </div>
            </div>

            <Button className="w-full btn-outline-dark" disabled>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Request Early Payout
            </Button>
            <p className="text-xs text-center text-[var(--text-muted)]">
              Early payouts available after €500 in pending balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="card-white mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-[var(--border-subtle)]">
            {[
              { type: "deposit", customer: "Maria Silva", amount: 150, date: "Today" },
              { type: "deposit", customer: "João Costa", amount: 200, date: "Yesterday" },
              { type: "payout", customer: "Monthly Payout", amount: -2890, date: "Dec 1" },
              { type: "deposit", customer: "Ana Santos", amount: 175, date: "Nov 28" },
            ].map((transaction, index) => (
              <div key={index} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "deposit"
                      ? "bg-[var(--signal-success)]/10"
                      : "bg-[var(--brand-primary)]/10"
                    }`}>
                    {transaction.type === "deposit" ? (
                      <TrendingUp className="w-5 h-5 text-[var(--signal-success)]" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-[var(--brand-primary)]" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{transaction.customer}</p>
                    <p className="text-sm text-[var(--text-muted)]">{transaction.date}</p>
                  </div>
                </div>
                <span className={`font-mono font-medium ${transaction.amount > 0
                    ? "text-[var(--signal-success)]"
                    : "text-[var(--text-secondary)]"
                  }`}>
                  {transaction.amount > 0 ? "+" : ""}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
