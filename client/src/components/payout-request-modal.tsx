import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PayoutRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ConnectedAccount {
  id: string;
  provider: string;
  accountName: string | null;
  accountEmail: string | null;
  iban: string | null;
  isDefault: boolean;
}

interface BalanceResponse {
  availableBalance: number;
  canRequestPayout: boolean;
  reason?: string;
}

export function PayoutRequestModal({ open, onOpenChange }: PayoutRequestModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  const { data: balanceData, isLoading: balanceLoading } = useQuery<BalanceResponse>({
    queryKey: ["/api/balance"],
    enabled: open,
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/accounts"],
    enabled: open,
  });

  const createPayoutMutation = useMutation({
    mutationFn: async (data: { amount: number; connectedAccountId: string }) => {
      const response = await apiRequest("POST", "/api/payouts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted for approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      onOpenChange(false);
      setAmount("");
      setSelectedAccount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit payout request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAccount) {
      toast({
        title: "Select Account",
        description: "Please select a payout account",
        variant: "destructive",
      });
      return;
    }

    if (balanceData && numAmount > balanceData.availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Amount exceeds your available balance",
        variant: "destructive",
      });
      return;
    }

    createPayoutMutation.mutate({
      amount: numAmount,
      connectedAccountId: selectedAccount,
    });
  };

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      wise: "Wise",
      revolut: "Revolut",
      paypal: "PayPal",
      iban: "Bank Transfer (IBAN)",
    };
    return labels[provider] || provider;
  };

  const isLoading = balanceLoading || accountsLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Withdraw your available earnings to your connected account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !balanceData?.canRequestPayout ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {balanceData?.reason || "No available balance to withdraw"}
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-md bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available Balance</span>
                  <span className="text-lg font-bold text-primary">
                    {"\u20AC"}{balanceData.availableBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Withdraw</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {"\u20AC"}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    max={balanceData.availableBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                    data-testid="input-payout-amount"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(balanceData.availableBalance.toString())}
                  data-testid="button-withdraw-all"
                >
                  Withdraw All
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Payout Account</Label>
                {accounts && accounts.length > 0 ? (
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger data-testid="select-payout-account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span>{getProviderLabel(account.provider)}</span>
                            {account.accountEmail && (
                              <span className="text-muted-foreground text-xs">
                                ({account.accountEmail})
                              </span>
                            )}
                            {account.isDefault && (
                              <Badge variant="secondary" className="text-xs ml-1">
                                Default
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-md border border-dashed text-center">
                    <p className="text-sm text-muted-foreground">
                      No payment accounts connected.
                    </p>
                    <Button variant="ghost" size="sm" className="mt-1 text-primary">
                      Add Account
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !balanceData?.canRequestPayout ||
              !amount ||
              !selectedAccount ||
              createPayoutMutation.isPending
            }
            data-testid="button-submit-payout"
          >
            {createPayoutMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Request Payout
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
