import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  CreditCard,
  Globe,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { Artist } from "@shared/schema";

const CURRENCIES = [
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "CHF", label: "Swiss Franc (CHF)", symbol: "CHF" },
  { value: "BRL", label: "Brazilian Real (R$)", symbol: "R$" },
];

const TIMEZONES = [
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Lisbon", label: "Lisbon (WET)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];

const settingsSchema = z.object({
  depositAmount: z.string().min(1, "Deposit amount is required"),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
  isActive: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function ArtistSettings() {
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

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      depositAmount: "100",
      currency: "EUR",
      timezone: "Europe/Berlin",
      isActive: true,
    },
  });

  useEffect(() => {
    if (artist) {
      form.reset({
        depositAmount: artist.depositAmount?.toString() || "100",
        currency: artist.currency || "EUR",
        timezone: artist.timezone || "Europe/Berlin",
        isActive: artist.isActive ?? true,
      });
    }
  }, [artist, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return apiRequest("PATCH", "/api/artist/me", {
        depositAmount: data.depositAmount,
        currency: data.currency,
        timezone: data.timezone,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/me"] });
      toast({ title: "Settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  if (authLoading || artistLoading) {
    return (
      <DashboardLayout title="Settings">
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  const selectedCurrency = CURRENCIES.find((c) => c.value === form.watch("currency"));

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and booking preferences">
      <div className="max-w-2xl space-y-6">
        {/* Account Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">Account Status</CardTitle>
            <Badge variant={artist?.isApproved ? "default" : "secondary"}>
              {artist?.isApproved ? "Approved" : "Pending"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              {artist?.isApproved ? (
                <CheckCircle2 className="w-5 h-5 text-chart-4 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-chart-5 mt-0.5" />
              )}
              <div>
                <p className="text-sm">
                  {artist?.isApproved
                    ? "Your profile is approved and live. Clients can book appointments."
                    : "Your profile is pending approval from the Altus Ink team."
                  }
                </p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Signed in as {user.email}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Booking Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {selectedCurrency?.symbol}
                          </span>
                          <Input
                            type="number"
                            min="10"
                            step="0.01"
                            {...field}
                            data-testid="input-deposit-amount"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Non-refundable deposit clients pay to secure an appointment.
                        You receive 70% after the 90-day retention period.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-timezone">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your booking calendar will display times in this timezone.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Accept Bookings</FormLabel>
                        <FormDescription>
                          When disabled, clients cannot book new appointments.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Stripe Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            {artist?.stripeAccountId ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-chart-4 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Stripe Connected</p>
                  <p className="text-xs text-muted-foreground">
                    Your Stripe account is connected and ready to receive payouts.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-chart-5 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Stripe Not Connected</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Connect your Stripe account to receive payouts for your bookings.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Connect Stripe (Coming Soon)
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These actions are permanent and cannot be undone.
            </p>
            <Button variant="destructive" disabled>
              Deactivate Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
