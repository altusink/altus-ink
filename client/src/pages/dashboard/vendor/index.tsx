import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";
import { PayoutRequestModal } from "@/components/payout-request-modal";
import type { VendorCommission, VendorGoal } from "@shared/schema";

export default function VendorDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showPayoutModal, setShowPayoutModal] = useState(false);

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

  const { data: balance } = useQuery<{
    availableBalance: number;
    canRequestPayout: boolean;
  }>({
    queryKey: ["/api/balance"],
    enabled: isAuthenticated,
  });

  const { data: commissions } = useQuery<VendorCommission[]>({
    queryKey: ["/api/vendor/commissions"],
    enabled: isAuthenticated,
  });

  const { data: goals } = useQuery<VendorGoal[]>({
    queryKey: ["/api/vendor/goals"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
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

  const totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.commissionAmount), 0) || 0;
  const pendingCommissions = commissions?.filter(c => c.status === "pending").reduce((sum, c) => sum + Number(c.commissionAmount), 0) || 0;
  const paidCommissions = commissions?.filter(c => c.status === "paid").reduce((sum, c) => sum + Number(c.commissionAmount), 0) || 0;
  
  const currentGoal = goals?.[0];
  const goalProgress = currentGoal ? (Number(currentGoal.achievedAmount) / Number(currentGoal.goalAmount)) * 100 : 0;

  return (
    <DashboardLayout 
      title="Vendor Dashboard" 
      subtitle="Track your commissions and earnings"
    >
      <Card className="mb-6 border-primary/50 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-sm">Vendor Commission: 2%</p>
            <p className="text-xs text-muted-foreground">
              You earn 2% of every booking you refer to the platform.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Available</span>
              <Wallet className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-2xl font-bold text-chart-4" data-testid="text-available-balance">
              EUR {balance?.availableBalance?.toFixed(2) || "0.00"}
            </p>
            <p className="text-xs text-muted-foreground">ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Earned</span>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-total-earned">
              EUR {totalCommissions.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">all time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Clock className="w-4 h-4 text-chart-5" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-pending">
              EUR {pendingCommissions.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">in retention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Paid Out</span>
              <CheckCircle2 className="w-4 h-4 text-chart-4" />
            </div>
            <p className="text-2xl font-bold" data-testid="text-paid">
              EUR {paidCommissions.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">withdrawn</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-base">Withdraw Funds</CardTitle>
              <CardDescription>Request a payout to your connected account</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-semibold text-lg">EUR {balance?.availableBalance?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-muted-foreground">Available for withdrawal</p>
                </div>
                <Button 
                  onClick={() => setShowPayoutModal(true)}
                  disabled={!balance?.canRequestPayout}
                  data-testid="button-request-payout"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Payouts are processed within 1-3 business days after CEO approval.
              </p>
            </div>
          </CardContent>
        </Card>

        {currentGoal && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-base">Monthly Goal</CardTitle>
                <CardDescription>
                  {new Date(0, currentGoal.month - 1).toLocaleString("default", { month: "long" })} {currentGoal.year}
                </CardDescription>
              </div>
              <Target className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">EUR {Number(currentGoal.achievedAmount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">of EUR {Number(currentGoal.goalAmount).toFixed(2)} goal</p>
                  </div>
                  <Badge variant={goalProgress >= 100 ? "default" : "secondary"}>
                    {goalProgress.toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={Math.min(goalProgress, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {!currentGoal && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-base">Monthly Goal</CardTitle>
              <Target className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No goal set for this month. Contact your manager.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="text-base">Recent Commissions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/vendor/commissions">
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {commissions && commissions.length > 0 ? (
            <div className="space-y-3">
              {commissions.slice(0, 5).map((commission) => (
                <div 
                  key={commission.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  data-testid={`commission-item-${commission.id}`}
                >
                  <div>
                    <p className="font-medium text-sm">
                      2% of EUR {Number(commission.saleAmount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(commission.createdAt!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-chart-4">
                      +EUR {Number(commission.commissionAmount).toFixed(2)}
                    </p>
                    <Badge variant={commission.status === "paid" ? "default" : "secondary"} className="text-xs">
                      {commission.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No commissions yet. Refer bookings to start earning.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PayoutRequestModal 
        open={showPayoutModal} 
        onOpenChange={setShowPayoutModal}
      />
    </DashboardLayout>
  );
}
