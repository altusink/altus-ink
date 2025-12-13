/**
 * CEO SETTINGS PAGE
 * Platform configuration, integrations, and admin settings
 * 
 * Features:
 * - Platform branding
 * - Payment configuration
 * - Email settings
 * - Integration management
 * - Team management
 * - Security settings
 * - Notification preferences
 * - Billing & subscription
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Palette,
  CreditCard,
  Mail,
  Link,
  Users,
  Shield,
  Bell,
  Receipt,
  Building,
  Globe,
  Image as ImageIcon,
  Upload,
  Save,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Trash2,
  Plus,
  Edit,
  Key,
  Lock,
  Unlock,
  Crown,
  UserPlus,
  UserMinus,
  MoreVertical,
  Loader2,
  CheckCircle,
  XCircle,
  Zap,
  MessageSquare,
  Phone,
  Smartphone,
  Database,
  Cloud,
  Server,
  Activity,
  FileText,
  DollarSign,
  Percent,
  Calendar,
  Clock
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface PlatformSettings {
  brandName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
}

interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeConnectEnabled: boolean;
  platformCommission: number;
  payoutSchedule: "daily" | "weekly" | "biweekly" | "monthly";
  payoutMinimum: number;
  refundPolicy: "flexible" | "moderate" | "strict";
  paymentMethods: string[];
}

interface EmailSettings {
  provider: "sendgrid" | "resend" | "smtp";
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  apiKey: string;
  templates: EmailTemplate[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  enabled: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  config?: Record<string, any>;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "viewer";
  avatar?: string;
  lastActive: string;
  status: "active" | "invited" | "suspended";
}

interface SecurityLog {
  id: string;
  action: string;
  user: string;
  ip: string;
  timestamp: string;
  status: "success" | "failed";
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIMEZONES = [
  { value: "Europe/Amsterdam", label: "Amsterdam (CET)" },
  { value: "Europe/Lisbon", label: "Lisbon (WET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" }
];

const CURRENCIES = [
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "CHF", label: "Swiss Franc (CHF)", symbol: "CHF" }
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "nl", label: "Nederlands" }
];

const PAYMENT_METHODS = [
  { id: "card", label: "Credit/Debit Cards" },
  { id: "ideal", label: "iDEAL (Netherlands)" },
  { id: "bancontact", label: "Bancontact (Belgium)" },
  { id: "sepa", label: "SEPA Direct Debit" },
  { id: "multibanco", label: "Multibanco (Portugal)" },
  { id: "mbway", label: "MB Way (Portugal)" },
  { id: "bizum", label: "Bizum (Spain)" },
  { id: "paypal", label: "PayPal" }
];

const EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: "booking_confirmation", name: "Booking Confirmation", subject: "Your booking is confirmed!", enabled: true },
  { id: "booking_reminder_24h", name: "24h Reminder", subject: "Reminder: Your session tomorrow", enabled: true },
  { id: "booking_reminder_1h", name: "1h Reminder", subject: "Your session starts in 1 hour", enabled: true },
  { id: "booking_cancelled", name: "Booking Cancelled", subject: "Your booking has been cancelled", enabled: true },
  { id: "payment_received", name: "Payment Received", subject: "Payment confirmed", enabled: true },
  { id: "refund_processed", name: "Refund Processed", subject: "Your refund has been processed", enabled: true },
  { id: "artist_payout", name: "Artist Payout", subject: "Your earnings have been transferred", enabled: true },
  { id: "welcome_artist", name: "Welcome Artist", subject: "Welcome to Altus Ink!", enabled: true }
];

const ROLES = [
  { value: "owner", label: "Owner", description: "Full access to all settings" },
  { value: "admin", label: "Admin", description: "Manage artists, bookings, and reports" },
  { value: "manager", label: "Manager", description: "View and manage bookings" },
  { value: "viewer", label: "Viewer", description: "View-only access" }
];

// =============================================================================
// MOCK DATA
// =============================================================================

const mockPlatformSettings: PlatformSettings = {
  brandName: "Altus Ink",
  tagline: "Premium Tattoo Booking Platform",
  logoUrl: "/logo-white.png",
  faviconUrl: "/favicon.ico",
  primaryColor: "#7C3AED",
  accentColor: "#D4AF37",
  supportEmail: "support@altusink.com",
  supportPhone: "+31 20 123 4567",
  timezone: "Europe/Amsterdam",
  currency: "EUR",
  language: "en",
  maintenanceMode: false
};

const mockPaymentSettings: PaymentSettings = {
  stripeEnabled: true,
  stripePublishableKey: "pk_test_****************************",
  stripeSecretKey: "sk_test_****************************",
  stripeWebhookSecret: "whsec_****************************",
  stripeConnectEnabled: true,
  platformCommission: 15,
  payoutSchedule: "weekly",
  payoutMinimum: 50,
  refundPolicy: "moderate",
  paymentMethods: ["card", "ideal", "bancontact", "sepa"]
};

const mockEmailSettings: EmailSettings = {
  provider: "sendgrid",
  fromEmail: "booking@altusink.com",
  fromName: "Altus Ink",
  replyToEmail: "support@altusink.com",
  apiKey: "SG.****************************",
  templates: EMAIL_TEMPLATES
};

const mockIntegrations: Integration[] = [
  { id: "stripe", name: "Stripe", description: "Payment processing", icon: CreditCard, status: "connected", lastSync: new Date().toISOString() },
  { id: "sendgrid", name: "SendGrid", description: "Email delivery", icon: Mail, status: "connected", lastSync: new Date().toISOString() },
  { id: "chatwoot", name: "Chatwoot", description: "Live chat support", icon: MessageSquare, status: "connected" },
  { id: "cloudinary", name: "Cloudinary", description: "Image storage", icon: Cloud, status: "connected" },
  { id: "google_analytics", name: "Google Analytics", description: "Website analytics", icon: Activity, status: "disconnected" },
  { id: "whatsapp", name: "WhatsApp Business", description: "WhatsApp notifications", icon: Phone, status: "disconnected" },
  { id: "instagram", name: "Instagram", description: "Social media integration", icon: ImageIcon, status: "disconnected" }
];

const mockTeamMembers: TeamMember[] = [
  { id: "U001", name: "João Silva", email: "joao@altusink.com", role: "owner", lastActive: new Date().toISOString(), status: "active" },
  { id: "U002", name: "Ana Costa", email: "ana@altusink.com", role: "admin", lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: "active" },
  { id: "U003", name: "Pedro Santos", email: "pedro@altusink.com", role: "manager", lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: "active" },
  { id: "U004", name: "Maria Oliveira", email: "maria@example.com", role: "viewer", lastActive: "", status: "invited" }
];

const mockSecurityLogs: SecurityLog[] = [
  { id: "L001", action: "Login", user: "joao@altusink.com", ip: "192.168.1.1", timestamp: new Date().toISOString(), status: "success" },
  { id: "L002", action: "Settings Changed", user: "ana@altusink.com", ip: "192.168.1.2", timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), status: "success" },
  { id: "L003", action: "Login Attempt", user: "unknown@test.com", ip: "10.0.0.1", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: "failed" }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatDate = (date: string): string => {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getRelativeTime = (date: string): string => {
  if (!date) return "Never";
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const maskSecret = (secret: string): string => {
  if (!secret) return "";
  if (secret.length <= 8) return "****";
  return secret.slice(0, 4) + "****" + secret.slice(-4);
};

// =============================================================================
// SECTION COMPONENTS
// =============================================================================

function BrandingSection({ settings, onSave }: { settings: PlatformSettings; onSave: (s: PlatformSettings) => void }) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onSave(formData);
    setIsSaving(false);
  };

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-[var(--brand-primary)]" />
          Branding & Appearance
        </CardTitle>
        <CardDescription>
          Customize your platform's look and feel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Platform Name</Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-[var(--bg-app)] rounded-lg flex items-center justify-center p-2">
                  <img src={formData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-lg flex items-center justify-center">
                  <img src={formData.faviconUrl} alt="Favicon" className="w-8 h-8" />
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function GeneralSection({ settings, onSave }: { settings: PlatformSettings; onSave: (s: PlatformSettings) => void }) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onSave(formData);
    setIsSaving(false);
  };

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-[var(--brand-primary)]" />
          General Settings
        </CardTitle>
        <CardDescription>
          Configure regional and contact preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={formData.timezone} onValueChange={(v) => setFormData({ ...formData, timezone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                type="tel"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
              <div>
                <p className="font-medium text-[var(--text-primary)]">Maintenance Mode</p>
                <p className="text-sm text-[var(--text-muted)]">Disable public access temporarily</p>
              </div>
              <Switch
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function PaymentSection({ settings, onSave }: { settings: PaymentSettings; onSave: (s: PaymentSettings) => void }) {
  const [formData, setFormData] = useState(settings);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onSave(formData);
    setIsSaving(false);
  };

  const togglePaymentMethod = (id: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(id)
        ? prev.paymentMethods.filter(m => m !== id)
        : [...prev.paymentMethods, id]
    }));
  };

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[var(--brand-primary)]" />
          Payment Settings
        </CardTitle>
        <CardDescription>
          Configure Stripe and payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stripe Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-surface)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#635BFF] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Stripe</p>
                <p className="text-sm text-[var(--text-muted)]">Payment processing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={formData.stripeEnabled ? "badge-success" : ""}>
                {formData.stripeEnabled ? "Connected" : "Disconnected"}
              </Badge>
              <Switch
                checked={formData.stripeEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, stripeEnabled: checked })}
              />
            </div>
          </div>

          {formData.stripeEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-[var(--brand-primary)]/20">
              <div className="space-y-2">
                <Label>Publishable Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={showSecrets ? formData.stripePublishableKey : maskSecret(formData.stripePublishableKey)}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowSecrets(!showSecrets)}>
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={showSecrets ? formData.stripeSecretKey : maskSecret(formData.stripeSecretKey)}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(formData.stripeSecretKey)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Stripe Connect</p>
                  <p className="text-sm text-[var(--text-muted)]">Enable artist payouts</p>
                </div>
                <Switch
                  checked={formData.stripeConnectEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, stripeConnectEnabled: checked })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Commission & Payouts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Platform Commission (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="50"
                value={formData.platformCommission}
                onChange={(e) => setFormData({ ...formData, platformCommission: parseFloat(e.target.value) })}
              />
              <span className="text-[var(--text-muted)]">%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payout Schedule</Label>
            <Select value={formData.payoutSchedule} onValueChange={(v) => setFormData({ ...formData, payoutSchedule: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Minimum Payout (€)</Label>
            <Input
              type="number"
              min="0"
              value={formData.payoutMinimum}
              onChange={(e) => setFormData({ ...formData, payoutMinimum: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Refund Policy</Label>
            <Select value={formData.refundPolicy} onValueChange={(v) => setFormData({ ...formData, refundPolicy: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible">Flexible</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <Label>Enabled Payment Methods</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => togglePaymentMethod(method.id)}
                className={`p-3 rounded-lg border text-left transition-all ${formData.paymentMethods.includes(method.id)
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                    : "border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {formData.paymentMethods.includes(method.id) && (
                    <Check className="w-4 h-4 text-[var(--brand-primary)]" />
                  )}
                  <span className="text-sm font-medium">{method.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function IntegrationsSection({ integrations }: { integrations: Integration[] }) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Link className="w-5 h-5 text-[var(--brand-primary)]" />
          Integrations
        </CardTitle>
        <CardDescription>
          Connect third-party services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {integrations.map(integration => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{integration.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{integration.description}</p>
                    {integration.lastSync && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Last sync: {getRelativeTime(integration.lastSync)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    integration.status === "connected" ? "badge-success" :
                      integration.status === "error" ? "badge-error" : ""
                  }>
                    {integration.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(integration)}
                  >
                    {integration.status === "connected" ? "Configure" : "Connect"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamSection({ members }: { members: TeamMember[] }) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <Card className="card-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--brand-primary)]" />
              Team Members
            </CardTitle>
            <CardDescription>Manage platform administrators</CardDescription>
          </div>
          <Button onClick={() => setInviteModalOpen(true)} className="btn-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(member => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{member.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {member.role === "owner" && <Crown className="w-3 h-3 mr-1" />}
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={
                    member.status === "active" ? "badge-success" :
                      member.status === "invited" ? "badge-warning" : "badge-error"
                  }>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[var(--text-muted)]">
                  {getRelativeTime(member.lastActive)}
                </TableCell>
                <TableCell>
                  {member.role !== "owner" && (
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SecuritySection({ logs }: { logs: SecurityLog[] }) {
  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
          Security
        </CardTitle>
        <CardDescription>Security settings and activity logs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Options */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Two-Factor Authentication</p>
              <p className="text-sm text-[var(--text-muted)]">Require 2FA for all team members</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Session Timeout</p>
              <p className="text-sm text-[var(--text-muted)]">Auto-logout after inactivity</p>
            </div>
            <Select defaultValue="30">
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-3">
          <h4 className="font-medium text-[var(--text-primary)]">Recent Activity</h4>
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface)]">
                <div className="flex items-center gap-3">
                  {log.status === "success" ? (
                    <CheckCircle className="w-5 h-5 text-[var(--signal-success)]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[var(--signal-error)]" />
                  )}
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{log.action}</p>
                    <p className="text-sm text-[var(--text-muted)]">{log.user} • {log.ip}</p>
                  </div>
                </div>
                <span className="text-sm text-[var(--text-muted)]">{getRelativeTime(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CEOSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");

  const [platformSettings, setPlatformSettings] = useState(mockPlatformSettings);
  const [paymentSettings, setPaymentSettings] = useState(mockPaymentSettings);
  const [emailSettings, setEmailSettings] = useState(mockEmailSettings);

  return (
    <DashboardLayout title="Platform Settings" subtitle="Configure your SaaS platform">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSection settings={platformSettings} onSave={setPlatformSettings} />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingSection settings={platformSettings} onSave={setPlatformSettings} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentSection settings={paymentSettings} onSave={setPaymentSettings} />
        </TabsContent>

        <TabsContent value="email">
          <Card className="card-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-[var(--brand-primary)]" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Email Provider</Label>
                  <Select value={emailSettings.provider} onValueChange={(v) => setEmailSettings({ ...emailSettings, provider: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="resend">Resend</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input value={emailSettings.fromEmail} onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input value={emailSettings.fromName} onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Reply-To Email</Label>
                  <Input value={emailSettings.replyToEmail} onChange={(e) => setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Email Templates</Label>
                <div className="space-y-2">
                  {emailSettings.templates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-subtle)]">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{template.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">{template.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={template.enabled} />
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsSection integrations={mockIntegrations} />
        </TabsContent>

        <TabsContent value="team">
          <TeamSection members={mockTeamMembers} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySection logs={mockSecurityLogs} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
