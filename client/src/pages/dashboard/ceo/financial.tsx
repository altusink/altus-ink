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
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Download,
  Calendar,
} from "lucide-react";
import type { Deposit, FinancialLedger } from "@shared/schema";

interface FinancialStats {
  totalRevenue: number;
  platformFees: number;
  artistPayouts: number;
  heldDeposits: number;
  availableDeposits: number;
  monthlyRevenue: number;
  currency: string;
}

export default function CEOFinancial() {
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

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== "ceo") {
      window.location.href = "/";
    }
  }, [user, isAuthenticated, authLoading]);

  const { data: stats, isLoading: statsLoading } = useQuery<FinancialStats>({
    queryKey: ["/api/ceo/financial/stats"],
    enabled: isAuthenticated && user?.role === "ceo",
  });

  const { data: recentTransactions } = useQuery<FinancialLedger[]>({
    queryKey: ["/api/ceo/financial/transactions"],
    enabled: isAuthenticated && user?.role === "ceo",
  });

  const { data: deposits } = useQuery<Deposit[]>({
    queryKey: ["/api/ceo/deposits"],
    enabled: isAuthenticated && user?.role === "ceo",
  });

  if (authLoading || statsLoading) {
    return (
      <DashboardLayout title="Financial">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayStats: FinancialStats = stats || {
    totalRevenue: 0,
    platformFees: 0,
    artistPayouts: 0,
    heldDeposits: 0,
    availableDeposits: 0,
    monthlyRevenue: 0,
    currency: "EUR",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: displayStats.currency,
    }).format(amount);
  };

  const getRetentionProgress = (deposit: Deposit) => {
    if (!deposit.retentionUntil) return 100;
    const created = new Date(deposit.createdAt!);
    const retention = new Date(deposit.retentionUntil);
    const now = new Date();
    const total = retention.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <DashboardLayout title="Financial Overview" subtitle="Platform revenue and deposit tracking">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-chart-4/10 to-transparent border-chart-4/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-chart-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Platform Fees (30%)</p>
            <p className="text-3xl font-bold text-chart-4" data-testid="text-platform-fees">
              {formatCurrency(displayStats.platformFees)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Deposits</p>
            <p className="text-3xl font-bold" data-testid="text-total-revenue">
              {formatCurrency(displayStats.totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-chart-5/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-chart-5" />
              </div>
              <Badge variant="secondary">90 days</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">In Retention</p>
            <p className="text-3xl font-bold" data-testid="text-held-deposits">
              {formatCurrency(displayStats.heldDeposits)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-chart-2" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Artist Payouts</p>
            <p className="text-3xl font-bold" data-testid="text-artist-payouts">
              {formatCurrency(displayStats.artistPayouts)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Revenue Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Platform Fee (Altus Ink)</span>
                  <span className="font-semibold text-chart-4">30%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-chart-4" style={{ width: "30%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Artist Share</span>
                  <span className="font-semibold">70%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "70%" }} />
                </div>
              </div>
              <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Your 30%</p>
                  <p className="font-semibold text-chart-4">
                    {formatCurrency(displayStats.platformFees)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Artists 70%</p>
                  <p className="font-semibold">
                    {formatCurrency(displayStats.totalRevenue - displayStats.platformFees)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Retention Status</CardTitle>
            <Badge variant="outline">90-day hold</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-chart-5/10 border border-chart-5/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Held Deposits</span>
                  <Clock className="w-4 h-4 text-chart-5" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(displayStats.heldDeposits)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Waiting for 90-day retention period
                </p>
              </div>
              <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Available for Payout</span>
                  <CheckCircle2 className="w-4 h-4 text-chart-4" />
                </div>
                <p className="text-2xl font-bold text-chart-4">
                  {formatCurrency(displayStats.availableDeposits)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Ready to release to artists</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deposits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="text-base">Recent Deposits</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {deposits && deposits.length > 0 ? (
            <div className="space-y-4">
              {deposits.slice(0, 10).map((deposit) => {
                const progress = getRetentionProgress(deposit);
                const isAvailable = deposit.status === "available" || progress >= 100;

                return (
                  <div
                    key={deposit.id}
                    className="p-4 rounded-lg border"
                    data-testid={`deposit-${deposit.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{formatCurrency(Number(deposit.amount))}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(deposit.createdAt!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isAvailable ? "default" : "secondary"}>
                          {deposit.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="text-chart-4">
                            +{formatCurrency(Number(deposit.platformFee))}
                          </span>
                          {" "}platform
                        </div>
                      </div>
                    </div>
                    {!isAvailable && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Retention Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No deposits yet. Deposits will appear here once artists receive bookings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
