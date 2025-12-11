import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import type { Artist, Booking } from "@shared/schema";

export default function ArtistDashboard() {
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

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ["/api/artist/me"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery<{
    upcomingBookings: number;
    thisWeekBookings: number;
    totalEarnings: number;
    totalClients: number;
    heldDeposits: number;
    availableDeposits: number;
  }>({
    queryKey: ["/api/artist/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentBookings } = useQuery<Booking[]>({
    queryKey: ["/api/artist/bookings", "recent"],
    enabled: isAuthenticated,
  });

  if (authLoading || artistLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading...">
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

  const displayStats = stats || {
    upcomingBookings: 0,
    thisWeekBookings: 0,
    totalEarnings: 0,
    totalClients: 0,
    heldDeposits: 0,
    availableDeposits: 0,
  };

  return (
    <DashboardLayout 
      title="Artist Dashboard" 
      subtitle={artist?.displayName || "Manage your bookings and profile"}
    >
      {/* Approval Status Banner */}
      {artist && !artist.isApproved && (
        <Card className="mb-6 border-chart-5/50 bg-chart-5/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-chart-5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Pending Approval</p>
              <p className="text-xs text-muted-foreground">
                Your profile is under review. You'll be notified once approved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {artist?.isApproved && (
        <Card className="mb-6 border-chart-4/50 bg-chart-4/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-chart-4" />
            <div className="flex-1">
              <p className="font-medium text-sm">Profile Active</p>
              <p className="text-xs text-muted-foreground">
                Your booking page is live at{" "}
                <span className="font-mono">{artist.subdomain}.altusink.io</span>
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/book/${artist.subdomain}`}>
                <ExternalLink className="w-4 h-4 mr-1" />
                View
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Upcoming</span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-upcoming-count">
              {displayStats.upcomingBookings}
            </p>
            <p className="text-xs text-muted-foreground">bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">This Week</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-week-count">
              {displayStats.thisWeekBookings}
            </p>
            <p className="text-xs text-muted-foreground">appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Available</span>
              <TrendingUp className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-2xl font-bold text-chart-4" data-testid="text-available-earnings">
              €{displayStats.availableDeposits}
            </p>
            <p className="text-xs text-muted-foreground">ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Held</span>
              <Clock className="w-4 h-4 text-chart-5" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-held-earnings">
              €{displayStats.heldDeposits}
            </p>
            <p className="text-xs text-muted-foreground">90-day retention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/artist/calendar">
                <Calendar className="w-5 h-5" />
                <span className="text-xs">Calendar</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/artist/tour">
                <Clock className="w-5 h-5" />
                <span className="text-xs">Tour Mode</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/artist/earnings">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">Earnings</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/artist/personalize">
                <Users className="w-5 h-5" />
                <span className="text-xs">Personalize</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Earnings Summary</CardTitle>
            <Badge variant="secondary" className="text-xs">70% of deposits</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Earned</span>
                <span className="font-semibold">€{displayStats.totalEarnings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Now</span>
                <span className="font-semibold text-chart-4">€{displayStats.availableDeposits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Retention</span>
                <span className="font-semibold">€{displayStats.heldDeposits}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Deposits are held for 90 days before becoming available for payout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="text-base">Recent Bookings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/artist/calendar">
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings && recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  data-testid={`booking-item-${booking.id}`}
                >
                  <div>
                    <p className="font-medium text-sm">{booking.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.slotDatetime).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No bookings yet. Share your booking page to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
