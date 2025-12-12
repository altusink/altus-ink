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
  Users,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Ban,
} from "lucide-react";
import { Link } from "wouter";
import type { Artist, Booking } from "@shared/schema";

export default function CoordinatorDashboard() {
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
      title="Coordinator Dashboard" 
      subtitle="Manage bookings and schedule"
    >
      <Card className="mb-6 border-chart-5/50 bg-chart-5/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Ban className="w-5 h-5 text-chart-5" />
          <div className="flex-1">
            <p className="font-medium text-sm">Coordinator Role</p>
            <p className="text-xs text-muted-foreground">
              You have access to manage bookings but cannot request payouts. Contact your artist for withdrawal requests.
            </p>
          </div>
        </CardContent>
      </Card>

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
              <span className="text-sm text-muted-foreground">Total Clients</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-clients-count">
              {displayStats.totalClients}
            </p>
            <p className="text-xs text-muted-foreground">served</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <CheckCircle2 className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-revenue">
              EUR {displayStats.totalEarnings}
            </p>
            <p className="text-xs text-muted-foreground">generated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/coordinator/calendar">
                <Calendar className="w-5 h-5" />
                <span className="text-xs">Calendar</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
              <Link href="/dashboard/coordinator/bookings">
                <Clock className="w-5 h-5" />
                <span className="text-xs">Bookings</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Role Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-chart-4" />
                <span className="text-sm">View and manage calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-chart-4" />
                <span className="text-sm">Manage bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-chart-4" />
                <span className="text-sm">View client information</span>
              </div>
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-chart-5" />
                <span className="text-sm text-muted-foreground">Cannot request payouts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="text-base">Recent Bookings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/coordinator/bookings">
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
                No bookings yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
