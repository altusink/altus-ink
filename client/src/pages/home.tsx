import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  TrendingUp,
  Users,
  LogOut,
  Settings,
  Sparkles,
  ArrowRight,
  Plus,
  MapPin,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  
  const isCeo = user?.role === "ceo";
  const isArtist = user?.role === "artist";

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 glass bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                ALTUSINK<span className="text-primary">.IO</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user?.firstName || user?.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user?.firstName || user?.email?.split("@")[0]}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-logout"
                onClick={() => window.location.href = "/api/logout"}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || "there"}
          </h1>
          <p className="text-muted-foreground">
            {isCeo 
              ? "Manage your artist collective and track platform performance."
              : "Manage your bookings, availability, and earnings."
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">
                    {isCeo ? "Total Bookings" : "Upcoming"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">
                    {isCeo ? "Pending Approval" : "This Week"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">€0</p>
                  <p className="text-xs text-muted-foreground">
                    {isCeo ? "Platform Revenue" : "Earnings"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">
                    {isCeo ? "Active Artists" : "Clients"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCeo ? (
            <>
              <Link href="/dashboard/ceo">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">CEO Dashboard</CardTitle>
                    <Badge variant="secondary">Admin</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      View all artists, manage approvals, and track platform financials.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      Open Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/ceo/artists">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">Manage Artists</CardTitle>
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Review applications, approve artists, and manage the collective.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      View Artists <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/ceo/financial">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">Financial Ledger</CardTitle>
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track deposits, platform fees, and artist payouts with 90-day retention.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      View Finances <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/artist">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">My Dashboard</CardTitle>
                    <Badge variant="secondary">Artist</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      View your bookings, manage availability, and track earnings.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      Open Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/artist/calendar">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">Calendar</CardTitle>
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your availability and view upcoming appointments.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      View Calendar <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/artist/tour">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">Tour Mode</CardTitle>
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set up city schedules for traveling and guest spots.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      Manage Tour <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/artist/earnings">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">Earnings</CardTitle>
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track your deposits, fees, and available payouts.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      View Earnings <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/artist/personalize">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">Personalize</CardTitle>
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Customize your booking page, colors, and profile.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      Customize <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/artist/settings">
                <Card className="hover-elevate cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage deposit amount, timezone, and account settings.
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      Open Settings <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-8">
          <h2 className="font-semibold text-xl mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No recent activity yet. Your bookings will appear here.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
