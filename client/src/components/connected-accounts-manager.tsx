import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Plus, Star, Trash2, Building2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SiRevolut, SiPaypal } from "react-icons/si";

interface ConnectedAccount {
  id: string;
  userId: string;
  provider: string;
  accountName: string | null;
  accountEmail: string | null;
  accountId: string | null;
  iban: string | null;
  bic: string | null;
  currency: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export function ConnectedAccountsManager() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    provider: "",
    accountName: "",
    accountEmail: "",
    accountId: "",
    iban: "",
    bic: "",
    currency: "EUR",
  });

  const { data: accounts, isLoading } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: typeof newAccount) => {
      const response = await apiRequest("POST", "/api/accounts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Account Added", description: "Payment account has been connected." });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsAddDialogOpen(false);
      setNewAccount({
        provider: "",
        accountName: "",
        accountEmail: "",
        accountId: "",
        iban: "",
        bic: "",
        currency: "EUR",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Account Removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/accounts/${id}/default`);
    },
    onSuccess: () => {
      toast({ title: "Default Account Updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    },
  });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "wise":
        return <Building2 className="h-5 w-5 text-green-500" />;
      case "revolut":
        return <SiRevolut className="h-5 w-5 text-blue-500" />;
      case "paypal":
        return <SiPaypal className="h-5 w-5 text-blue-600" />;
      case "iban":
        return <CreditCard className="h-5 w-5 text-muted-foreground" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      wise: "Wise",
      revolut: "Revolut",
      paypal: "PayPal",
      iban: "Bank Transfer (IBAN)",
    };
    return names[provider] || provider;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg">Payment Accounts</CardTitle>
          <CardDescription>Manage your payout accounts</CardDescription>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-account">
          <Plus className="h-4 w-4 mr-1" />
          Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-md border bg-card hover-elevate"
                data-testid={`account-item-${account.id}`}
              >
                <div className="flex items-center gap-3">
                  {getProviderIcon(account.provider)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getProviderName(account.provider)}</span>
                      {account.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {account.isVerified && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.accountEmail || account.iban || account.accountId || "No details"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!account.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultMutation.mutate(account.id)}
                      disabled={setDefaultMutation.isPending}
                      data-testid={`button-set-default-${account.id}`}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAccountMutation.mutate(account.id)}
                    disabled={deleteAccountMutation.isPending}
                    data-testid={`button-delete-account-${account.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No payment accounts connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add an account to receive payouts
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Account</DialogTitle>
            <DialogDescription>
              Connect a payment method to receive your earnings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={newAccount.provider}
                onValueChange={(v) => setNewAccount({ ...newAccount, provider: v })}
              >
                <SelectTrigger data-testid="select-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="revolut">Revolut</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="iban">Bank Transfer (IBAN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                value={newAccount.accountName}
                onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                placeholder="John Doe"
                data-testid="input-account-name"
              />
            </div>

            {newAccount.provider === "iban" ? (
              <>
                <div className="space-y-2">
                  <Label>IBAN</Label>
                  <Input
                    value={newAccount.iban}
                    onChange={(e) => setNewAccount({ ...newAccount, iban: e.target.value })}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    data-testid="input-iban"
                  />
                </div>
                <div className="space-y-2">
                  <Label>BIC/SWIFT</Label>
                  <Input
                    value={newAccount.bic}
                    onChange={(e) => setNewAccount({ ...newAccount, bic: e.target.value })}
                    placeholder="COBADEFFXXX"
                    data-testid="input-bic"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newAccount.accountEmail}
                  onChange={(e) => setNewAccount({ ...newAccount, accountEmail: e.target.value })}
                  placeholder="your@email.com"
                  data-testid="input-account-email"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={newAccount.currency}
                onValueChange={(v) => setNewAccount({ ...newAccount, currency: v })}
              >
                <SelectTrigger data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR ({"\u20AC"})</SelectItem>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createAccountMutation.mutate(newAccount)}
              disabled={!newAccount.provider || createAccountMutation.isPending}
              data-testid="button-save-account"
            >
              {createAccountMutation.isPending ? "Adding..." : "Add Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
