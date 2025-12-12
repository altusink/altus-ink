import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Info,
  Plus,
  Wallet,
  Building2,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { SiPaypal, SiRevolut, SiWise } from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Deposit } from "@shared/schema";

interface EarningsStats {
  totalEarnings: number;
  availableEarnings: number;
  heldEarnings: number;
  platformFees: number;
  totalBookings: number;
  currency: string;
}

export default function ArtistEarnings() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  const { data: stats, isLoading: statsLoading } = useQuery<EarningsStats>({
    queryKey: ["/api/artist/earnings/stats"],
    enabled: isAuthenticated,
  });

  const { data: deposits, isLoading: depositsLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/artist/deposits"],
    enabled: isAuthenticated,
  });

  if (authLoading || statsLoading) {
    return (
      <DashboardLayout title="Earnings">
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

  const displayStats: EarningsStats = stats || {
    totalEarnings: 0,
    availableEarnings: 0,
    heldEarnings: 0,
    platformFees: 0,
    totalBookings: 0,
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

  const getDaysRemaining = (deposit: Deposit) => {
    if (!deposit.retentionUntil) return 0;
    const retention = new Date(deposit.retentionUntil);
    const now = new Date();
    const diff = retention.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <DashboardLayout title="Earnings" subtitle="Track your deposits and payouts">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-chart-4/10 to-transparent border-chart-4/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-chart-4" />
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ready for withdrawal after 90-day retention</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Available Now</p>
            <p className="text-3xl font-bold text-chart-4" data-testid="text-available-amount">
              {formatCurrency(displayStats.availableEarnings)}
            </p>
            <Button className="w-full mt-4" disabled={displayStats.availableEarnings <= 0}>
              Request Payout
            </Button>
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
            <p className="text-3xl font-bold" data-testid="text-held-amount">
              {formatCurrency(displayStats.heldEarnings)}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Deposits are held for 90 days before release
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
            <p className="text-3xl font-bold" data-testid="text-total-amount">
              {formatCurrency(displayStats.totalEarnings)}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              From {displayStats.totalBookings} bookings (70% of deposits)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="text-base">Fee Structure</CardTitle>
          <Badge variant="outline">Platform: 30%</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Your Share</span>
                  <span className="font-semibold text-chart-4">70%</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-semibold">30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">How it works:</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-chart-4" />
                  Client pays non-refundable deposit
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-chart-4" />
                  70% goes to your earnings
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-chart-5" />
                  90-day retention period
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-primary" />
                  Available for payout after retention
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts for Withdrawal */}
      <Card className="mb-8 border-neon-animated">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Payout Accounts
            </CardTitle>
            <CardDescription>Select where you want to receive your earnings</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IBAN Card */}
            <div className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer (IBAN)</p>
                    <p className="text-xs text-muted-foreground">SEPA EUR transfers</p>
                  </div>
                </div>
                <Badge variant="secondary">Not connected</Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                Connect Bank Account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* PayPal Card */}
            <div className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#003087]/20 flex items-center justify-center">
                    <SiPaypal className="w-5 h-5 text-[#003087]" />
                  </div>
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-xs text-muted-foreground">Instant transfers</p>
                  </div>
                </div>
                <Badge variant="secondary">Not connected</Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                Connect PayPal <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Wise Card */}
            <div className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#9FE870]/20 flex items-center justify-center">
                    <SiWise className="w-5 h-5 text-[#9FE870]" />
                  </div>
                  <div>
                    <p className="font-medium">Wise</p>
                    <p className="text-xs text-muted-foreground">Multi-currency, low fees</p>
                  </div>
                </div>
                <Badge variant="secondary">Not connected</Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                Connect Wise <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Revolut Card */}
            <div className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0075EB]/20 flex items-center justify-center">
                    <SiRevolut className="w-5 h-5 text-[#0075EB]" />
                  </div>
                  <div>
                    <p className="font-medium">Revolut</p>
                    <p className="text-xs text-muted-foreground">Fast digital banking</p>
                  </div>
                </div>
                <Badge variant="secondary">Not connected</Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                Connect Revolut <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center gap-3">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Connect at least one account to request payouts. We support IBAN transfers in EUR, and instant transfers via PayPal, Wise, or Revolut.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deposits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="text-base">Recent Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          {deposits && deposits.length > 0 ? (
            <div className="space-y-4">
              {deposits.map((deposit) => {
                const progress = getRetentionProgress(deposit);
                const daysRemaining = getDaysRemaining(deposit);
                const isAvailable = deposit.status === "available" || progress >= 100;

                return (
                  <div
                    key={deposit.id}
                    className="p-4 rounded-lg border"
                    data-testid={`deposit-item-${deposit.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">
                          {formatCurrency(Number(deposit.artistAmount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(deposit.createdAt!).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge variant={isAvailable ? "default" : "secondary"}>
                        {isAvailable ? "Available" : `${daysRemaining} days left`}
                      </Badge>
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
                No deposits yet. Complete bookings to start earning.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
