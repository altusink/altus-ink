import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  Mail,
  CreditCard,
  MessageCircle,
  Globe,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Server,
} from "lucide-react";
import { SiStripe, SiRevolut, SiWise, SiWhatsapp } from "react-icons/si";
import { queryClient, apiRequest } from "@/lib/queryClient";

const smtpSchema = z.object({
  smtpHost: z.string().min(1, "SMTP Host is required"),
  smtpPort: z.string().min(1, "Port is required"),
  smtpUser: z.string().email("Valid email required"),
  smtpPassword: z.string().min(1, "Password is required"),
  smtpFrom: z.string().min(1, "From address is required"),
  smtpSecure: z.boolean(),
});

const stripeSchema = z.object({
  stripePublicKey: z.string().min(1, "Public key is required"),
  stripeSecretKey: z.string().min(1, "Secret key is required"),
  stripeWebhookSecret: z.string().optional(),
});

const whatsappSchema = z.object({
  zapiInstanceId: z.string().min(1, "Instance ID is required"),
  zapiToken: z.string().min(1, "Token is required"),
  zapiWebhookUrl: z.string().optional(),
});

const paymentMethodsSchema = z.object({
  revolutEnabled: z.boolean(),
  revolutEmail: z.string().optional(),
  wiseEnabled: z.boolean(),
  wiseEmail: z.string().optional(),
});

interface IntegrationStatus {
  smtp: boolean;
  stripe: boolean;
  whatsapp: boolean;
  revolut: boolean;
  wise: boolean;
}

export default function CEOSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const { data: integrationStatus } = useQuery<IntegrationStatus>({
    queryKey: ["/api/ceo/integration-status"],
    enabled: user?.role === "ceo",
  });

  const smtpForm = useForm({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      smtpHost: "smtp.hostinger.com",
      smtpPort: "587",
      smtpUser: "",
      smtpPassword: "",
      smtpFrom: "ALTUSINK.IO <noreply@altusink.io>",
      smtpSecure: false,
    },
  });

  const stripeForm = useForm({
    resolver: zodResolver(stripeSchema),
    defaultValues: {
      stripePublicKey: "",
      stripeSecretKey: "",
      stripeWebhookSecret: "",
    },
  });

  const whatsappForm = useForm({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      zapiInstanceId: "",
      zapiToken: "",
      zapiWebhookUrl: "",
    },
  });

  const paymentMethodsForm = useForm({
    resolver: zodResolver(paymentMethodsSchema),
    defaultValues: {
      revolutEnabled: false,
      revolutEmail: "",
      wiseEnabled: false,
      wiseEmail: "",
    },
  });

  const saveSMTPMutation = useMutation({
    mutationFn: async (data: z.infer<typeof smtpSchema>) => {
      const res = await apiRequest("POST", "/api/ceo/settings/smtp", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "SMTP settings saved", description: "Email configuration updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/ceo/integration-status"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save SMTP settings.", variant: "destructive" });
    },
  });

  const testSMTPMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ceo/settings/smtp/test");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Test email sent", description: "Check your inbox for the test email." });
    },
    onError: () => {
      toast({ title: "Test failed", description: "Could not send test email. Check your settings.", variant: "destructive" });
    },
  });

  const togglePassword = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const IntegrationCard = ({
    title,
    description,
    icon: Icon,
    iconColor,
    isConnected,
    children,
  }: {
    title: string;
    description: string;
    icon: any;
    iconColor: string;
    isConnected?: boolean;
    children: React.ReactNode;
  }) => (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                Not configured
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Settings" subtitle="Platform configuration and integrations">
      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="domain" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Domain</span>
          </TabsTrigger>
        </TabsList>

        {/* Email / SMTP Settings */}
        <TabsContent value="email" className="space-y-6">
          <IntegrationCard
            title="Hostinger SMTP"
            description="Configure email delivery for booking confirmations"
            icon={Mail}
            iconColor="#5C2D91"
            isConnected={integrationStatus?.smtp}
          >
            <Form {...smtpForm}>
              <form onSubmit={smtpForm.handleSubmit((data) => saveSMTPMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={smtpForm.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.hostinger.com" {...field} data-testid="input-smtp-host" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={smtpForm.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input placeholder="587" {...field} data-testid="input-smtp-port" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={smtpForm.control}
                  name="smtpUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username (Email)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="noreply@altusink.io" {...field} data-testid="input-smtp-user" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={smtpForm.control}
                  name="smtpPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswords.smtp ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            data-testid="input-smtp-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => togglePassword("smtp")}
                          >
                            {showPasswords.smtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={smtpForm.control}
                  name="smtpFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Address</FormLabel>
                      <FormControl>
                        <Input placeholder="ALTUSINK.IO <noreply@altusink.io>" {...field} data-testid="input-smtp-from" />
                      </FormControl>
                      <FormDescription>Display name and email for sent emails</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={smtpForm.control}
                  name="smtpSecure"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Use SSL/TLS</FormLabel>
                        <FormDescription>Enable for port 465</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button type="submit" disabled={saveSMTPMutation.isPending} data-testid="button-save-smtp">
                    {saveSMTPMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => testSMTPMutation.mutate()}
                    disabled={testSMTPMutation.isPending}
                    data-testid="button-test-smtp"
                  >
                    {testSMTPMutation.isPending ? "Sending..." : "Send Test Email"}
                  </Button>
                </div>
              </form>
            </Form>
          </IntegrationCard>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <IntegrationCard
            title="Stripe"
            description="Primary payment processor for deposits"
            icon={SiStripe}
            iconColor="#635BFF"
            isConnected={integrationStatus?.stripe}
          >
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Stripe is configured via Replit integration</p>
                  <p className="text-xs text-muted-foreground">
                    API keys are managed securely through Replit's secret management.
                  </p>
                </div>
                <Badge variant="default" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Secure
                </Badge>
              </div>
              <Button variant="outline" asChild>
                <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Stripe Dashboard
                </a>
              </Button>
            </div>
          </IntegrationCard>

          <IntegrationCard
            title="Alternative Payment Methods"
            description="Additional payment options for customers"
            icon={CreditCard}
            iconColor="#D4AF37"
            isConnected={integrationStatus?.revolut || integrationStatus?.wise}
          >
            <Form {...paymentMethodsForm}>
              <form className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <SiRevolut className="w-6 h-6" style={{ color: "#0075EB" }} />
                      <div>
                        <p className="font-medium text-sm">Revolut</p>
                        <p className="text-xs text-muted-foreground">Accept Revolut payments</p>
                      </div>
                    </div>
                    <FormField
                      control={paymentMethodsForm.control}
                      name="revolutEnabled"
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>

                  {paymentMethodsForm.watch("revolutEnabled") && (
                    <FormField
                      control={paymentMethodsForm.control}
                      name="revolutEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Revolut Tag / Email</FormLabel>
                          <FormControl>
                            <Input placeholder="@altusink or email" {...field} data-testid="input-revolut-email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <SiWise className="w-6 h-6" style={{ color: "#9FE870" }} />
                      <div>
                        <p className="font-medium text-sm">Wise</p>
                        <p className="text-xs text-muted-foreground">Accept Wise transfers</p>
                      </div>
                    </div>
                    <FormField
                      control={paymentMethodsForm.control}
                      name="wiseEnabled"
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>

                  {paymentMethodsForm.watch("wiseEnabled") && (
                    <FormField
                      control={paymentMethodsForm.control}
                      name="wiseEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wise Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="payments@altusink.io" {...field} data-testid="input-wise-email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Button type="submit" data-testid="button-save-payment-methods">
                  Save Payment Methods
                </Button>
              </form>
            </Form>
          </IntegrationCard>
        </TabsContent>

        {/* WhatsApp / Z-API Settings */}
        <TabsContent value="whatsapp" className="space-y-6">
          <IntegrationCard
            title="Z-API WhatsApp"
            description="Send booking notifications via WhatsApp"
            icon={SiWhatsapp}
            iconColor="#25D366"
            isConnected={integrationStatus?.whatsapp}
          >
            <Form {...whatsappForm}>
              <form className="space-y-4">
                <FormField
                  control={whatsappForm.control}
                  name="zapiInstanceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instance ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Z-API Instance ID" {...field} data-testid="input-zapi-instance" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={whatsappForm.control}
                  name="zapiToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswords.zapi ? "text" : "password"}
                            placeholder="Your Z-API Token"
                            {...field}
                            data-testid="input-zapi-token"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => togglePassword("zapi")}
                          >
                            {showPasswords.zapi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Webhook URL (Auto-generated)</FormLabel>
                  <FormControl>
                    <Input readOnly value={`${window.location.origin}/api/webhooks/zapi`} />
                  </FormControl>
                  <FormDescription>Configure this URL in your Z-API dashboard</FormDescription>
                </FormItem>

                <div className="flex gap-3">
                  <Button type="submit" data-testid="button-save-whatsapp">
                    Save Settings
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <a href="https://z-api.io" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Z-API Dashboard
                    </a>
                  </Button>
                </div>
              </form>
            </Form>
          </IntegrationCard>
        </TabsContent>

        {/* Domain Settings */}
        <TabsContent value="domain" className="space-y-6">
          <IntegrationCard
            title="Custom Domain"
            description="Configure your custom domain for the platform"
            icon={Globe}
            iconColor="#D4AF37"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm mb-3">DNS Configuration for Hostinger</h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="font-semibold">Type</div>
                    <div className="font-semibold">Name</div>
                    <div className="font-semibold">Value</div>
                    
                    <div>A</div>
                    <div>@</div>
                    <div className="text-muted-foreground">[Replit IP]</div>
                    
                    <div>CNAME</div>
                    <div>www</div>
                    <div className="text-muted-foreground">altusink.io</div>
                    
                    <div>CNAME</div>
                    <div>*</div>
                    <div className="text-muted-foreground">altusink.io</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm mb-3">Email Records (SPF/DKIM/DMARC)</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 rounded bg-background">
                    <p className="text-muted-foreground mb-1">TXT (SPF)</p>
                    <p>v=spf1 include:_spf.hostinger.com ~all</p>
                  </div>
                  <div className="p-2 rounded bg-background">
                    <p className="text-muted-foreground mb-1">TXT (DMARC)</p>
                    <p>v=DMARC1; p=none; rua=mailto:dmarc@altusink.io</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" asChild>
                <a href="https://hpanel.hostinger.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Hostinger Panel
                </a>
              </Button>
            </div>
          </IntegrationCard>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Subdomain Routing</CardTitle>
                  <CardDescription className="text-xs">Artist booking pages configuration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Artists will have personalized booking pages at:
                </p>
                <div className="p-3 rounded-lg bg-muted font-mono text-sm">
                  https://<span className="text-gold">[artist-subdomain]</span>.altusink.io
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently using path-based routing: /book/[subdomain]
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
