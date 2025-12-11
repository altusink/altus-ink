import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface ReportStats {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  averageDeposit: number;
  depositChange: number;
  activeArtists: number;
  artistsChange: number;
  monthlyBreakdown: {
    month: string;
    revenue: number;
    bookings: number;
    platformFees: number;
  }[];
  topArtists: {
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }[];
}

export default function CEOReports() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>("30");

  const { data: stats, isLoading } = useQuery<ReportStats>({
    queryKey: ["/api/ceo/reports", period],
    enabled: user?.role === "ceo",
  });

  const displayStats: ReportStats = stats || {
    totalRevenue: 0,
    revenueChange: 0,
    totalBookings: 0,
    bookingsChange: 0,
    averageDeposit: 0,
    depositChange: 0,
    activeArtists: 0,
    artistsChange: 0,
    monthlyBreakdown: [],
    topArtists: [],
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    prefix = "",
    suffix = "",
  }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    prefix?: string;
    suffix?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">
          {prefix}{value.toLocaleString()}{suffix}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {change >= 0 ? (
            <>
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+{change}%</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-3 h-3 text-destructive" />
              <span className="text-xs text-destructive">{change}%</span>
            </>
          )}
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Reports & Analytics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Platform performance insights">
      {/* Period Filter */}
      <div className="flex items-center justify-between mb-6">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40" data-testid="select-period">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" data-testid="button-export">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={displayStats.totalRevenue}
          change={displayStats.revenueChange}
          icon={DollarSign}
          prefix="€"
        />
        <StatCard
          title="Total Bookings"
          value={displayStats.totalBookings}
          change={displayStats.bookingsChange}
          icon={Calendar}
        />
        <StatCard
          title="Avg. Deposit"
          value={displayStats.averageDeposit}
          change={displayStats.depositChange}
          icon={TrendingUp}
          prefix="€"
        />
        <StatCard
          title="Active Artists"
          value={displayStats.activeArtists}
          change={displayStats.artistsChange}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Breakdown</CardTitle>
            <CardDescription>Revenue and bookings over time</CardDescription>
          </CardHeader>
          <CardContent>
            {displayStats.monthlyBreakdown.length > 0 ? (
              <div className="space-y-4">
                {displayStats.monthlyBreakdown.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-xs text-muted-foreground">
                        {month.bookings} bookings
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{month.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        €{month.platformFees.toLocaleString()} fees
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Artists */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Artists</CardTitle>
            <CardDescription>By revenue this period</CardDescription>
          </CardHeader>
          <CardContent>
            {displayStats.topArtists.length > 0 ? (
              <div className="space-y-4">
                {displayStats.topArtists.map((artist, index) => (
                  <div key={artist.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{artist.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {artist.bookings} bookings
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{artist.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No artist data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm">Conversion Rate</span>
              </div>
              <span className="font-semibold">--</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Avg. Booking Lead Time</span>
              </div>
              <span className="font-semibold">-- days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Artist Utilization</span>
              </div>
              <span className="font-semibold">--%</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="bg-gradient-to-br from-gold/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Deposits Collected</span>
              <span className="font-semibold">€{displayStats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platform Fees (30%)</span>
              <span className="font-semibold text-gold">
                €{Math.round(displayStats.totalRevenue * 0.3).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Artist Payouts (70%)</span>
              <span className="font-semibold">
                €{Math.round(displayStats.totalRevenue * 0.7).toLocaleString()}
              </span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Held Deposits (90 days)</span>
                <Badge variant="secondary">€0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
