/**
 * ARTIST SETTINGS PAGE
 * Complete profile management, availability, notifications, billing
 * 
 * Features:
 * - Profile editing with preview
 * - Working hours configuration
 * - Deposit & pricing settings
 * - Notification preferences
 * - Stripe Connect onboarding
 * - Social media links
 * - Portfolio settings
 * - Account security
 */

import { useState, useCallback, useRef } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  User,
  Camera,
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
  Bell,
  BellOff,
  Mail,
  Phone,
  Smartphone,
  MessageSquare,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Link,
  Calendar,
  Clock,
  DollarSign,
  Euro,
  CreditCard,
  Percent,
  Image as ImageIcon,
  Palette,
  Languages,
  Shield,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Star,
  TrendingUp,
  FileText,
  Bookmark,
  Tag
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface ArtistProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  specialty: string;
  styles: string[];
  city: string;
  country: string;
  timezone: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  avatarUrl: string;
  coverImageUrl: string;
  languages: string[];
  isVerified: boolean;
}

interface WorkingHours {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
  breakStart?: string;
  breakEnd?: string;
}

interface DepositSettings {
  type: "fixed" | "percentage";
  fixedAmount: number;
  percentage: number;
  minimumAmount: number;
  maximumAmount: number;
}

interface PricingSettings {
  hourlyRate: number;
  minimumRate: number;
  currency: string;
  showPrices: boolean;
  customPricing: CustomPrice[];
}

interface CustomPrice {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface NotificationSettings {
  email: {
    newBooking: boolean;
    bookingReminder: boolean;
    bookingCancelled: boolean;
    paymentReceived: boolean;
    payoutProcessed: boolean;
    weeklyReport: boolean;
    marketingUpdates: boolean;
  };
  push: {
    enabled: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
    messages: boolean;
  };
  sms: {
    enabled: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
  };
}

interface StripeConnectStatus {
  connected: boolean;
  accountId?: string;
  status: "pending" | "active" | "restricted" | "disabled";
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  requiresAction: boolean;
  lastPayout?: string;
  totalEarnings: number;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: Session[];
}

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TATTOO_STYLES = [
  "Fineline", "Blackwork", "Traditional", "Neo-Traditional", "Realism",
  "Watercolor", "Dotwork", "Geometric", "Minimalist", "Japanese",
  "Tribal", "Script/Lettering", "Portrait", "Ornamental", "Trash Polka",
  "Illustrative", "Biomechanical", "Surrealism", "Abstract", "Mandala"
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "nl", label: "Nederlands" },
  { value: "it", label: "Italiano" },
  { value: "pl", label: "Polski" }
];

const TIMEZONES = [
  { value: "Europe/Amsterdam", label: "Amsterdam (CET)" },
  { value: "Europe/Lisbon", label: "Lisbon (WET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Madrid", label: "Madrid (CET)" },
  { value: "Europe/Rome", label: "Rome (CET)" },
  { value: "America/New_York", label: "New York (EST)" }
];

const CURRENCIES = [
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" }
];

const COUNTRIES = [
  { value: "NL", label: "Netherlands" },
  { value: "PT", label: "Portugal" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "GB", label: "United Kingdom" },
  { value: "BE", label: "Belgium" },
  { value: "IT", label: "Italy" }
];

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const DEFAULT_WORKING_HOURS: WorkingHours[] = DAYS_OF_WEEK.map((day, i) => ({
  day,
  enabled: i < 5,
  start: "10:00",
  end: "19:00",
  breakStart: "13:00",
  breakEnd: "14:00"
}));

// =============================================================================
// MOCK DATA
// =============================================================================

const mockProfile: ArtistProfile = {
  id: "A001",
  username: "danilo.santos",
  email: "danilo@example.com",
  displayName: "Danilo Santos",
  bio: "Specialized in fineline and minimalist tattoos with over 10 years of experience. Creating unique, meaningful pieces that tell your story.",
  specialty: "Fineline",
  styles: ["Fineline", "Minimalist", "Geometric", "Dotwork"],
  city: "Amsterdam",
  country: "NL",
  timezone: "Europe/Amsterdam",
  phone: "+31 6 1234 5678",
  website: "https://danilo-ink.com",
  instagram: "danilo.ink",
  facebook: "daniloinkartist",
  twitter: "danilo_ink",
  avatarUrl: "",
  coverImageUrl: "",
  languages: ["en", "pt", "nl"],
  isVerified: true
};

const mockWorkingHours = DEFAULT_WORKING_HOURS;

const mockDepositSettings: DepositSettings = {
  type: "percentage",
  fixedAmount: 100,
  percentage: 30,
  minimumAmount: 50,
  maximumAmount: 500
};

const mockPricingSettings: PricingSettings = {
  hourlyRate: 150,
  minimumRate: 80,
  currency: "EUR",
  showPrices: true,
  customPricing: [
    { id: "1", name: "Tiny Tattoo", description: "Under 5cm", price: 80 },
    { id: "2", name: "Small Tattoo", description: "5-10cm", price: 150 },
    { id: "3", name: "Medium Tattoo", description: "10-20cm", price: 300 }
  ]
};

const mockNotificationSettings: NotificationSettings = {
  email: {
    newBooking: true,
    bookingReminder: true,
    bookingCancelled: true,
    paymentReceived: true,
    payoutProcessed: true,
    weeklyReport: true,
    marketingUpdates: false
  },
  push: {
    enabled: true,
    newBooking: true,
    bookingReminder: true,
    messages: true
  },
  sms: {
    enabled: false,
    newBooking: false,
    bookingReminder: false
  }
};

const mockStripeStatus: StripeConnectStatus = {
  connected: true,
  accountId: "acct_1234567890",
  status: "active",
  payoutsEnabled: true,
  chargesEnabled: true,
  requiresAction: false,
  lastPayout: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  totalEarnings: 24750
};

const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  lastPasswordChange: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  activeSessions: [
    { id: "S1", device: "Chrome on Windows", location: "Amsterdam, NL", ip: "192.168.1.1", lastActive: new Date().toISOString(), current: true },
    { id: "S2", device: "Safari on iPhone", location: "Amsterdam, NL", ip: "192.168.1.2", lastActive: new Date(Date.now() - 60 * 60 * 1000).toISOString(), current: false }
  ]
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number, currency: string = "EUR"): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const getRelativeTime = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

// =============================================================================
// SECTION COMPONENTS
// =============================================================================

function ProfileSection({ profile, onSave }: { profile: ArtistProfile; onSave: (p: ArtistProfile) => void }) {
  const [formData, setFormData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onSave(formData);
    setIsSaving(false);
  };

  const toggleStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  return (
    <Card className="card-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--brand-primary)]" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your public profile visible to customers
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cover Image */}
        <div className="relative">
          <div className="h-40 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-gold)] overflow-hidden">
            {formData.coverImageUrl && (
              <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-3 right-3"
            onClick={() => coverInputRef.current?.click()}
          >
            <Camera className="w-4 h-4 mr-2" />
            Change Cover
          </Button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" />

          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={formData.avatarUrl} />
                <AvatarFallback className="text-2xl font-bold bg-[var(--brand-primary)] text-white">
                  {formData.displayName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        {/* Verified Badge */}
        <div className="pt-10 flex items-center gap-2">
          {formData.isVerified && (
            <Badge className="badge-success">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Artist
            </Badge>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">altusink.com/</span>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              placeholder="Tell customers about yourself and your work..."
            />
            <p className="text-sm text-[var(--text-muted)]">{formData.bio.length}/500 characters</p>
          </div>
          <div className="space-y-2">
            <Label>Specialty</Label>
            <Select value={formData.specialty} onValueChange={(v) => setFormData({ ...formData, specialty: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TATTOO_STYLES.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Styles</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
              {TATTOO_STYLES.map(style => (
                <Badge
                  key={style}
                  variant={formData.styles.includes(style) ? "default" : "outline"}
                  className={`cursor-pointer ${formData.styles.includes(style) ? "bg-[var(--brand-primary)]" : ""}`}
                  onClick={() => toggleStyle(style)}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h4 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
            Location
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
        </div>

        {/* Contact & Social */}
        <div className="space-y-4">
          <h4 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Link className="w-4 h-4 text-[var(--brand-primary)]" />
            Contact & Social Media
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                Phone
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                Website
              </Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[var(--text-muted)]" />
                Instagram
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">@</span>
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-[var(--text-muted)]" />
                Facebook
              </Label>
              <Input
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-4">
          <h4 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Languages className="w-4 h-4 text-[var(--brand-primary)]" />
            Languages Spoken
          </h4>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <Badge
                key={lang.value}
                variant={formData.languages.includes(lang.value) ? "default" : "outline"}
                className={`cursor-pointer ${formData.languages.includes(lang.value) ? "bg-[var(--brand-primary)]" : ""}`}
                onClick={() => toggleLanguage(lang.value)}
              >
                {lang.label}
              </Badge>
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

function WorkingHoursSection({ hours, onSave }: { hours: WorkingHours[]; onSave: (h: WorkingHours[]) => void }) {
  const [formData, setFormData] = useState(hours);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onSave(formData);
    setIsSaving(false);
  };

  const updateDay = (index: number, updates: Partial<WorkingHours>) => {
    setFormData(prev => prev.map((h, i) => i === index ? { ...h, ...updates } : h));
  };

  const copyToAll = (index: number) => {
    const source = formData[index];
    setFormData(prev => prev.map(h => ({
      ...h,
      start: source.start,
      end: source.end,
      breakStart: source.breakStart,
      breakEnd: source.breakEnd
    })));
  };

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--brand-primary)]" />
          Working Hours
        </CardTitle>
        <CardDescription>
          Set your availability for bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.map((day, index) => (
          <div
            key={day.day}
            className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${day.enabled ? "bg-[var(--bg-surface)]" : "bg-[var(--bg-surface)]/50"
              }`}
          >
            <div className="w-28">
              <Switch
                checked={day.enabled}
                onCheckedChange={(checked) => updateDay(index, { enabled: checked })}
              />
              <span className={`ml-2 font-medium ${day.enabled ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                {day.day}
              </span>
            </div>

            {day.enabled && (
              <>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={day.start}
                    onChange={(e) => updateDay(index, { start: e.target.value })}
                    className="w-28"
                  />
                  <span className="text-[var(--text-muted)]">to</span>
                  <Input
                    type="time"
                    value={day.end}
                    onChange={(e) => updateDay(index, { end: e.target.value })}
                    className="w-28"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <span>Break:</span>
                  <Input
                    type="time"
                    value={day.breakStart || ""}
                    onChange={(e) => updateDay(index, { breakStart: e.target.value })}
                    className="w-24"
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={day.breakEnd || ""}
                    onChange={(e) => updateDay(index, { breakEnd: e.target.value })}
                    className="w-24"
                  />
                </div>

                <Button variant="ghost" size="sm" onClick={() => copyToAll(index)}>
                  Copy to all
                </Button>
              </>
            )}
          </div>
        ))}

        <div className="p-4 rounded-lg bg-[var(--signal-info)]/10 border border-[var(--signal-info)]/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--signal-info)]" />
            <div>
              <p className="font-medium text-[var(--text-primary)]">Buffer Time</p>
              <p className="text-sm text-[var(--text-secondary)]">
                30 minutes buffer is automatically added between sessions
              </p>
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

function DepositPricingSection({
  deposit,
  pricing,
  onSaveDeposit,
  onSavePricing
}: {
  deposit: DepositSettings;
  pricing: PricingSettings;
  onSaveDeposit: (d: DepositSettings) => void;
  onSavePricing: (p: PricingSettings) => void;
}) {
  const [depositData, setDepositData] = useState(deposit);
  const [pricingData, setPricingData] = useState(pricing);
  const [isSaving, setIsSaving] = useState(false);
  const [addPriceModalOpen, setAddPriceModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState({ name: "", description: "", price: 0 });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onSaveDeposit(depositData);
    onSavePricing(pricingData);
    setIsSaving(false);
  };

  const addCustomPrice = () => {
    if (newPrice.name && newPrice.price > 0) {
      setPricingData(prev => ({
        ...prev,
        customPricing: [...prev.customPricing, { ...newPrice, id: Date.now().toString() }]
      }));
      setNewPrice({ name: "", description: "", price: 0 });
      setAddPriceModalOpen(false);
    }
  };

  const removeCustomPrice = (id: string) => {
    setPricingData(prev => ({
      ...prev,
      customPricing: prev.customPricing.filter(p => p.id !== id)
    }));
  };

  const currencySymbol = CURRENCIES.find(c => c.value === pricingData.currency)?.symbol || "€";

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Euro className="w-5 h-5 text-[var(--brand-primary)]" />
          Deposit & Pricing
        </CardTitle>
        <CardDescription>
          Configure your booking deposit and pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Deposit Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-[var(--text-primary)]">Deposit Requirements</h4>

          <div className="flex gap-4">
            <button
              onClick={() => setDepositData({ ...depositData, type: "fixed" })}
              className={`flex-1 p-4 rounded-lg border transition-all ${depositData.type === "fixed"
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                  : "border-[var(--border-subtle)]"
                }`}
            >
              <DollarSign className="w-5 h-5 mb-2 mx-auto" />
              <p className="font-medium">Fixed Amount</p>
              <p className="text-sm text-[var(--text-muted)]">Same deposit for all</p>
            </button>
            <button
              onClick={() => setDepositData({ ...depositData, type: "percentage" })}
              className={`flex-1 p-4 rounded-lg border transition-all ${depositData.type === "percentage"
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                  : "border-[var(--border-subtle)]"
                }`}
            >
              <Percent className="w-5 h-5 mb-2 mx-auto" />
              <p className="font-medium">Percentage</p>
              <p className="text-sm text-[var(--text-muted)]">Based on session value</p>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {depositData.type === "fixed" ? (
              <div className="space-y-2">
                <Label>Fixed Amount ({currencySymbol})</Label>
                <Input
                  type="number"
                  value={depositData.fixedAmount}
                  onChange={(e) => setDepositData({ ...depositData, fixedAmount: parseFloat(e.target.value) })}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Percentage (%)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[depositData.percentage]}
                    onValueChange={([v]) => setDepositData({ ...depositData, percentage: v })}
                    min={10}
                    max={100}
                    step={5}
                  />
                  <span className="text-lg font-semibold text-[var(--brand-primary)]">
                    {depositData.percentage}%
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Minimum ({currencySymbol})</Label>
              <Input
                type="number"
                value={depositData.minimumAmount}
                onChange={(e) => setDepositData({ ...depositData, minimumAmount: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Pricing Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-[var(--text-primary)]">Pricing</h4>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={pricingData.currency} onValueChange={(v) => setPricingData({ ...pricingData, currency: v })}>
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
              <Label>Hourly Rate ({currencySymbol})</Label>
              <Input
                type="number"
                value={pricingData.hourlyRate}
                onChange={(e) => setPricingData({ ...pricingData, hourlyRate: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Minimum Charge ({currencySymbol})</Label>
              <Input
                type="number"
                value={pricingData.minimumRate}
                onChange={(e) => setPricingData({ ...pricingData, minimumRate: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Show Prices Publicly</p>
              <p className="text-sm text-[var(--text-muted)]">Display pricing on your profile</p>
            </div>
            <Switch
              checked={pricingData.showPrices}
              onCheckedChange={(checked) => setPricingData({ ...pricingData, showPrices: checked })}
            />
          </div>
        </div>

        {/* Custom Pricing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-[var(--text-primary)]">Custom Pricing</h4>
            <Button variant="outline" size="sm" onClick={() => setAddPriceModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Price
            </Button>
          </div>

          {pricingData.customPricing.length === 0 ? (
            <p className="text-center py-8 text-[var(--text-muted)]">
              No custom prices added yet
            </p>
          ) : (
            <div className="space-y-2">
              {pricingData.customPricing.map(price => (
                <div key={price.id} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-surface)]">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{price.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{price.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-[var(--signal-success)]">
                      {formatCurrency(price.price, pricingData.currency)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => removeCustomPrice(price.id)}>
                      <Trash2 className="w-4 h-4 text-[var(--signal-error)]" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </CardFooter>

      {/* Add Price Modal */}
      <Dialog open={addPriceModalOpen} onOpenChange={setAddPriceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newPrice.name}
                onChange={(e) => setNewPrice({ ...newPrice, name: e.target.value })}
                placeholder="e.g., Small Tattoo"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newPrice.description}
                onChange={(e) => setNewPrice({ ...newPrice, description: e.target.value })}
                placeholder="e.g., 5-10cm"
              />
            </div>
            <div className="space-y-2">
              <Label>Price ({currencySymbol})</Label>
              <Input
                type="number"
                value={newPrice.price}
                onChange={(e) => setNewPrice({ ...newPrice, price: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPriceModalOpen(false)}>Cancel</Button>
            <Button onClick={addCustomPrice} className="btn-primary">Add Price</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function NotificationsSection({ settings, onSave }: { settings: NotificationSettings; onSave: (s: NotificationSettings) => void }) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onSave(formData);
    setIsSaving(false);
  };

  const updateEmail = (key: keyof NotificationSettings["email"], value: boolean) => {
    setFormData(prev => ({ ...prev, email: { ...prev.email, [key]: value } }));
  };

  const updatePush = (key: keyof NotificationSettings["push"], value: boolean) => {
    setFormData(prev => ({ ...prev, push: { ...prev.push, [key]: value } }));
  };

  const updateSms = (key: keyof NotificationSettings["sms"], value: boolean) => {
    setFormData(prev => ({ ...prev, sms: { ...prev.sms, [key]: value } }));
  };

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-[var(--brand-primary)]" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how you receive updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--text-muted)]" />
            <h4 className="font-medium text-[var(--text-primary)]">Email Notifications</h4>
          </div>
          <div className="space-y-3 pl-6">
            {Object.entries({
              newBooking: "New booking received",
              bookingReminder: "Booking reminders",
              bookingCancelled: "Booking cancellations",
              paymentReceived: "Payment confirmations",
              payoutProcessed: "Payout notifications",
              weeklyReport: "Weekly performance report",
              marketingUpdates: "Marketing & promotions"
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                <Switch
                  checked={formData.email[key as keyof NotificationSettings["email"]]}
                  onCheckedChange={(checked) => updateEmail(key as any, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[var(--text-muted)]" />
              <h4 className="font-medium text-[var(--text-primary)]">Push Notifications</h4>
            </div>
            <Switch
              checked={formData.push.enabled}
              onCheckedChange={(checked) => updatePush("enabled", checked)}
            />
          </div>
          {formData.push.enabled && (
            <div className="space-y-3 pl-6">
              {Object.entries({
                newBooking: "New booking received",
                bookingReminder: "Booking reminders",
                messages: "New messages"
              }).filter(([key]) => key !== "enabled").map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                  <Switch
                    checked={formData.push[key as keyof NotificationSettings["push"]] as boolean}
                    onCheckedChange={(checked) => updatePush(key as any, checked)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SMS Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
              <h4 className="font-medium text-[var(--text-primary)]">SMS Notifications</h4>
            </div>
            <Switch
              checked={formData.sms.enabled}
              onCheckedChange={(checked) => updateSms("enabled", checked)}
            />
          </div>
          {formData.sms.enabled && (
            <div className="space-y-3 pl-6">
              {Object.entries({
                newBooking: "New booking received",
                bookingReminder: "Booking reminders"
              }).filter(([key]) => key !== "enabled").map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                  <Switch
                    checked={formData.sms[key as keyof NotificationSettings["sms"]] as boolean}
                    onCheckedChange={(checked) => updateSms(key as any, checked)}
                  />
                </div>
              ))}
            </div>
          )}
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

function PayoutsSection({ status }: { status: StripeConnectStatus }) {
  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[var(--brand-primary)]" />
          Payouts & Banking
        </CardTitle>
        <CardDescription>
          Manage your Stripe Connect account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stripe Connect Status */}
        <div className={`p-6 rounded-xl ${status.connected
            ? "bg-[var(--signal-success)]/10 border border-[var(--signal-success)]/20"
            : "bg-[var(--signal-warning)]/10 border border-[var(--signal-warning)]/20"
          }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.connected ? "bg-[var(--signal-success)]" : "bg-[var(--signal-warning)]"
                }`}>
                {status.connected ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-primary)]">
                  {status.connected ? "Stripe Connected" : "Connect Stripe"}
                </h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  {status.connected
                    ? "Your account is ready to receive payouts"
                    : "Set up your account to receive payments"
                  }
                </p>
                {status.connected && (
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="badge-success">
                      {status.chargesEnabled ? "Charges Enabled" : "Setup Required"}
                    </Badge>
                    <Badge className="badge-success">
                      {status.payoutsEnabled ? "Payouts Enabled" : "Setup Required"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <Button variant={status.connected ? "outline" : "default"} className={!status.connected ? "btn-primary" : ""}>
              {status.connected ? (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Stripe Dashboard
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect Now
                </>
              )}
            </Button>
          </div>
        </div>

        {status.connected && (
          <>
            {/* Earnings Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--bg-surface)]">
                <p className="text-sm text-[var(--text-muted)]">Total Earnings</p>
                <p className="text-2xl font-bold text-[var(--signal-success)]">
                  {formatCurrency(status.totalEarnings)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-surface)]">
                <p className="text-sm text-[var(--text-muted)]">Last Payout</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {status.lastPayout ? formatDate(status.lastPayout) : "No payouts yet"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-surface)]">
                <p className="text-sm text-[var(--text-muted)]">Account Status</p>
                <Badge className={
                  status.status === "active" ? "badge-success" :
                    status.status === "pending" ? "badge-warning" : "badge-error"
                }>
                  {status.status}
                </Badge>
              </div>
            </div>

            {/* Account ID */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Account ID</p>
                <p className="font-mono text-[var(--text-primary)]">{status.accountId}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(status.accountId || "")}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SecuritySection({ settings }: { settings: SecuritySettings }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <Card className="card-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
          Account Security
        </CardTitle>
        <CardDescription>
          Protect your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center gap-4">
            <Lock className="w-5 h-5 text-[var(--text-muted)]" />
            <div>
              <p className="font-medium text-[var(--text-primary)]">Password</p>
              <p className="text-sm text-[var(--text-muted)]">
                Last changed {getRelativeTime(settings.lastPasswordChange)}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </Button>
        </div>

        {/* 2FA */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center gap-4">
            <Smartphone className="w-5 h-5 text-[var(--text-muted)]" />
            <div>
              <p className="font-medium text-[var(--text-primary)]">Two-Factor Authentication</p>
              <p className="text-sm text-[var(--text-muted)]">
                {settings.twoFactorEnabled ? "Enabled" : "Add extra security to your account"}
              </p>
            </div>
          </div>
          <Button variant={settings.twoFactorEnabled ? "outline" : "default"} className={!settings.twoFactorEnabled ? "btn-primary" : ""}>
            {settings.twoFactorEnabled ? "Manage" : "Enable"}
          </Button>
        </div>

        {/* Active Sessions */}
        <div className="space-y-4">
          <h4 className="font-medium text-[var(--text-primary)]">Active Sessions</h4>
          <div className="space-y-2">
            {settings.activeSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-surface)]">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${session.current ? "bg-[var(--signal-success)]" : "bg-[var(--text-muted)]"}`} />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {session.device}
                      {session.current && <Badge className="ml-2 badge-success text-xs">Current</Badge>}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {session.location} • {session.ip} • {getRelativeTime(session.lastActive)}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm" className="text-[var(--signal-error)]">
                    Revoke
                  </Button>
                )}
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

export default function ArtistSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState(mockProfile);
  const [workingHours, setWorkingHours] = useState(mockWorkingHours);
  const [depositSettings, setDepositSettings] = useState(mockDepositSettings);
  const [pricingSettings, setPricingSettings] = useState(mockPricingSettings);
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings);

  return (
    <DashboardLayout title="Settings" subtitle="Manage your artist profile and preferences">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection profile={profile} onSave={setProfile} />
        </TabsContent>

        <TabsContent value="availability">
          <WorkingHoursSection hours={workingHours} onSave={setWorkingHours} />
        </TabsContent>

        <TabsContent value="pricing">
          <DepositPricingSection
            deposit={depositSettings}
            pricing={pricingSettings}
            onSaveDeposit={setDepositSettings}
            onSavePricing={setPricingSettings}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSection settings={notificationSettings} onSave={setNotificationSettings} />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutsSection status={mockStripeStatus} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySection settings={mockSecuritySettings} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
