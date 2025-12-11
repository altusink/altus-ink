import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import type { Artist, Booking } from "@shared/schema";

interface CEOStats {
  totalArtists: number;
  activeArtists: number;
  pendingApprovals: number;
  totalBookings: number;
  monthlyBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  platformFees: number;
  heldDeposits: number;
  availableDeposits: number;
}

export default function CEODashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Check if user is CEO
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== "ceo") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, isAuthenticated, authLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<CEOStats>({
    queryKey: ["/api/ceo/stats"],
    enabled: isAuthenticated && user?.role === "ceo",
  });

  const { data: pendingArtists } = useQuery<Artist[]>({
    queryKey: ["/api/ceo/artists", "pending"],
    enabled: isAuthenticated && user?.role === "ceo",
  });

  const { data: recentBookings } = useQuery<Booking[]>({
    queryKey: ["/api/ceo/bookings", "recent"],
    enabled: isAuthenticated && user?.role === "ceo",
  });

  if (authLoading || statsLoading) {
    return (
      <DashboardLayout title="CEO Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayStats: CEOStats = stats || {
    totalArtists: 0,
    activeArtists: 0,
    pendingApprovals: 0,
    totalBookings: 0,
    monthlyBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    platformFees: 0,
    heldDeposits: 0,
    availableDeposits: 0,
  };

  return (
    <DashboardLayout title="CEO Dashboard" subtitle="Altus Ink Platform Overview">
      {/* Pending Approvals Alert */}
      {pendingArtists && pendingArtists.length > 0 && (
        <Card className="mb-6 border-chart-5/50 bg-chart-5/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-chart-5" />
              <div>
                <p className="font-medium text-sm">Pending Artist Approvals</p>
                <p className="text-xs text-muted-foreground">
                  {pendingArtists.length} artist{pendingArtists.length > 1 ? "s" : ""} waiting for review
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/ceo/artists">Review</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Artists</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-total-artists">
              {displayStats.activeArtists}
            </p>
            <p className="text-xs text-muted-foreground">
              of {displayStats.totalArtists} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">This Month</span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-monthly-bookings">
              {displayStats.monthlyBookings}
            </p>
            <p className="text-xs text-muted-foreground">bookings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-4/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Platform Fees</span>
              <TrendingUp className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-2xl font-bold text-chart-4" data-testid="text-platform-fees">
              €{displayStats.platformFees}
            </p>
            <p className="text-xs text-muted-foreground">30% of deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-total-revenue">
              €{displayStats.totalRevenue}
            </p>
            <p className="text-xs text-muted-foreground">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Deposit Status</CardTitle>
            <Badge variant="secondary">90-day retention</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Held Deposits</span>
                  <span className="font-semibold">€{displayStats.heldDeposits}</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Available for Payout</span>
                  <span className="font-semibold text-chart-4">€{displayStats.availableDeposits}</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Deposits are held for 90 days before becoming available for artist payout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/ceo/artists">
                <Users className="w-5 h-5" />
                <span className="text-xs">Manage Artists</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/ceo/bookings">
                <Calendar className="w-5 h-5" />
                <span className="text-xs">All Bookings</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/ceo/financial">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">Financial</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/ceo/reports">
                <DollarSign className="w-5 h-5" />
                <span className="text-xs">Reports</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Artists */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Pending Approvals</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/ceo/artists">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingArtists && pendingArtists.length > 0 ? (
              <div className="space-y-3">
                {pendingArtists.slice(0, 5).map((artist) => (
                  <div
                    key={artist.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`pending-artist-${artist.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{artist.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        @{artist.subdomain}
                      </p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-chart-4 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All artists approved</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/ceo/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`recent-booking-${booking.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.slotDatetime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        €{booking.depositAmount}
                      </p>
                      <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent bookings</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
