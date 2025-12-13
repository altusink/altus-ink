/**
 * CEO Artists Management Dashboard
 * Full CRUD operations, filtering, bulk actions, and detailed artist management
 * 
 * Features:
 * - Artist listing with advanced filtering
 * - Create/Edit artist modal
 * - Bulk status updates
 * - Performance metrics per artist
 * - Tour management
 * - Commission configuration
 * - Onboarding status tracking
 */

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe,
  Mail,
  Phone,
  Instagram,
  MapPin,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpDown,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Star,
  Palette,
  Euro
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Artist } from "@shared/schema";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface ArtistWithMetrics extends Artist {
  metrics?: {
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
  };
  onboarding?: {
    profileComplete: boolean;
    portfolioAdded: boolean;
    stripeConnected: boolean;
    calendarConfigured: boolean;
  };
}

interface ArtistFormData {
  username: string;
  email: string;
  displayName: string;
  bio: string;
  specialty: string;
  city: string;
  country: string;
  instagram: string;
  phone: string;
  commissionRate: number;
  isActive: boolean;
  tourModeEnabled: boolean;
}

type SortField = "displayName" | "createdAt" | "revenue" | "bookings" | "rating";
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "active" | "inactive" | "onTour" | "incomplete";

// =============================================================================
// CONSTANTS
// =============================================================================

const SPECIALTIES = [
  "Fineline",
  "Blackwork",
  "Realism",
  "Traditional",
  "Neo-Traditional",
  "Japanese",
  "Watercolor",
  "Geometric",
  "Dotwork",
  "Cover-up",
  "Lettering",
  "Minimalist",
];

const COUNTRIES = [
  { code: "NL", name: "Netherlands" },
  { code: "PT", name: "Portugal" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "GB", name: "United Kingdom" },
  { code: "BE", name: "Belgium" },
  { code: "LU", name: "Luxembourg" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
];

const DEFAULT_FORM_DATA: ArtistFormData = {
  username: "",
  email: "",
  displayName: "",
  bio: "",
  specialty: "",
  city: "",
  country: "",
  instagram: "",
  phone: "",
  commissionRate: 85,
  isActive: true,
  tourModeEnabled: false,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatDate = (date: Date | string | null): string => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const calculateOnboardingProgress = (onboarding?: ArtistWithMetrics["onboarding"]): number => {
  if (!onboarding) return 0;
  const steps = [
    onboarding.profileComplete,
    onboarding.portfolioAdded,
    onboarding.stripeConnected,
    onboarding.calendarConfigured,
  ];
  return (steps.filter(Boolean).length / steps.length) * 100;
};

// =============================================================================
// COMPONENT: ArtistStatusBadge
// =============================================================================

function ArtistStatusBadge({ artist }: { artist: ArtistWithMetrics }) {
  if (!artist.isActive) {
    return <Badge className="badge-error">Inactive</Badge>;
  }
  if (artist.tourModeEnabled) {
    return (
      <Badge className="badge-success">
        <Globe className="w-3 h-3 mr-1" />
        On Tour
      </Badge>
    );
  }
  return <Badge className="badge-primary">Active</Badge>;
}

// =============================================================================
// COMPONENT: OnboardingProgress
// =============================================================================

function OnboardingProgress({ onboarding }: { onboarding?: ArtistWithMetrics["onboarding"] }) {
  if (!onboarding) return null;

  const progress = calculateOnboardingProgress(onboarding);
  const steps = [
    { key: "profile", label: "Profile", done: onboarding.profileComplete },
    { key: "portfolio", label: "Portfolio", done: onboarding.portfolioAdded },
    { key: "stripe", label: "Payments", done: onboarding.stripeConnected },
    { key: "calendar", label: "Calendar", done: onboarding.calendarConfigured },
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)]">Onboarding</span>
        <span className="font-medium text-[var(--text-primary)]">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
      <div className="flex gap-1 mt-1">
        {steps.map((step) => (
          <div
            key={step.key}
            className={`flex-1 h-1 rounded-full ${step.done ? "bg-[var(--signal-success)]" : "bg-[var(--border-subtle)]"
              }`}
            title={step.label}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT: ArtistMetricsCard
// =============================================================================

function ArtistMetricsCard({ metrics }: { metrics?: ArtistWithMetrics["metrics"] }) {
  if (!metrics) {
    return (
      <div className="text-sm text-[var(--text-muted)] italic">
        No performance data yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <span className="text-[var(--text-muted)]">Bookings</span>
        <p className="font-semibold text-[var(--text-primary)]">{metrics.totalBookings}</p>
      </div>
      <div>
        <span className="text-[var(--text-muted)]">Revenue</span>
        <p className="font-semibold text-[var(--signal-success)]">{formatCurrency(metrics.totalRevenue)}</p>
      </div>
      <div>
        <span className="text-[var(--text-muted)]">Completion</span>
        <p className="font-semibold text-[var(--text-primary)]">{metrics.completionRate}%</p>
      </div>
      <div>
        <span className="text-[var(--text-muted)]">Rating</span>
        <p className="font-semibold text-[var(--brand-gold)] flex items-center gap-1">
          <Star className="w-3 h-3" />
          {metrics.averageRating.toFixed(1)}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT: ArtistFormModal
// =============================================================================

interface ArtistFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist?: ArtistWithMetrics | null;
  onSubmit: (data: ArtistFormData) => void;
  isLoading: boolean;
}

function ArtistFormModal({ open, onOpenChange, artist, onSubmit, isLoading }: ArtistFormModalProps) {
  const [formData, setFormData] = useState<ArtistFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof ArtistFormData, string>>>({});

  // Reset form when modal opens
  useMemo(() => {
    if (open) {
      if (artist) {
        setFormData({
          username: artist.username || "",
          email: artist.email || "",
          displayName: artist.displayName || "",
          bio: artist.bio || "",
          specialty: artist.specialty || "",
          city: artist.city || "",
          country: artist.country || "",
          instagram: artist.instagram || "",
          phone: artist.preferredCurrency || "", // Using as phone placeholder
          commissionRate: 85,
          isActive: artist.isActive ?? true,
          tourModeEnabled: artist.tourModeEnabled ?? false,
        });
      } else {
        setFormData(DEFAULT_FORM_DATA);
      }
      setErrors({});
    }
  }, [open, artist]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ArtistFormData, string>> = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.displayName.trim()) newErrors.displayName = "Display name is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.commissionRate < 0 || formData.commissionRate > 100) {
      newErrors.commissionRate = "Commission must be 0-100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateField = <K extends keyof ArtistFormData>(field: K, value: ArtistFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">
            {artist ? "Edit Artist" : "Add New Artist"}
          </DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            {artist
              ? "Update artist information and settings"
              : "Create a new artist account on the platform"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="unique_username"
                  className={errors.username ? "border-[var(--signal-error)]" : ""}
                  disabled={!!artist}
                />
                {errors.username && (
                  <p className="text-xs text-[var(--signal-error)]">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="artist@example.com"
                  className={errors.email ? "border-[var(--signal-error)]" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-[var(--signal-error)]">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                placeholder="Full artist name"
                className={errors.displayName ? "border-[var(--signal-error)]" : ""}
              />
              {errors.displayName && (
                <p className="text-xs text-[var(--signal-error)]">{errors.displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Short biography about the artist..."
                rows={3}
              />
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              Professional Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => updateField("specialty", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    @
                  </span>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => updateField("instagram", e.target.value)}
                    placeholder="username"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Amsterdam"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateField("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial & Status */}
          <div className="space-y-4">
            <h3 className="font-medium text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              Financial & Status
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Artist Commission (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => updateField("commissionRate", parseInt(e.target.value) || 0)}
                  className={errors.commissionRate ? "border-[var(--signal-error)]" : ""}
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Platform takes {100 - formData.commissionRate}%
                </p>
                {errors.commissionRate && (
                  <p className="text-xs text-[var(--signal-error)]">{errors.commissionRate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+31 6 1234 5678"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => updateField("isActive", !!checked)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active account
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="tourModeEnabled"
                  checked={formData.tourModeEnabled}
                  onCheckedChange={(checked) => updateField("tourModeEnabled", !!checked)}
                />
                <Label htmlFor="tourModeEnabled" className="cursor-pointer">
                  Tour mode enabled
                </Label>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : artist ? (
              "Update Artist"
            ) : (
              "Create Artist"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// COMPONENT: DeleteConfirmDialog
// =============================================================================

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: ArtistWithMetrics | null;
  onConfirm: () => void;
  isLoading: boolean;
}

function DeleteConfirmDialog({ open, onOpenChange, artist, onConfirm, isLoading }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--signal-error)]">
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to delete <strong>{artist?.displayName}</strong>?
            This action cannot be undone. All associated bookings, earnings, and portfolio data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-lg bg-[var(--signal-error)]/10 border border-[var(--signal-error)]/20 mt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--signal-error)] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--text-primary)]">
              <p className="font-medium">This will delete:</p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] mt-1 space-y-1">
                <li>Artist profile and settings</li>
                <li>All booking history</li>
                <li>Portfolio images</li>
                <li>Earnings records</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[var(--signal-error)] hover:bg-[var(--signal-error)]/90 text-white"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Artist
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// MAIN COMPONENT: CEOArtists
// =============================================================================

export default function CEOArtists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("displayName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistWithMetrics | null>(null);

  // Data fetching
  const { data: artists = [], isLoading, refetch } = useQuery<ArtistWithMetrics[]>({
    queryKey: ["/api/ceo/artists"],
    enabled: user?.role === "ceo",
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ArtistFormData) => {
      const res = await apiRequest("POST", "/api/ceo/artists", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Artist Created", description: "New artist has been added to the platform." });
      queryClient.invalidateQueries({ queryKey: ["/api/ceo/artists"] });
      setFormModalOpen(false);
      setSelectedArtist(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create artist", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ArtistFormData }) => {
      const res = await apiRequest("PATCH", `/api/ceo/artists/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Artist Updated", description: "Artist information has been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/ceo/artists"] });
      setFormModalOpen(false);
      setSelectedArtist(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update artist", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/ceo/artists/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Artist Deleted", description: "Artist has been removed from the platform." });
      queryClient.invalidateQueries({ queryKey: ["/api/ceo/artists"] });
      setDeleteModalOpen(false);
      setSelectedArtist(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete artist", variant: "destructive" });
    },
  });

  // Filtering and sorting
  const filteredArtists = useMemo(() => {
    let result = [...artists];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.displayName?.toLowerCase().includes(query) ||
          a.email?.toLowerCase().includes(query) ||
          a.city?.toLowerCase().includes(query) ||
          a.specialty?.toLowerCase().includes(query)
      );
    }

    // Status filter
    switch (statusFilter) {
      case "active":
        result = result.filter((a) => a.isActive);
        break;
      case "inactive":
        result = result.filter((a) => !a.isActive);
        break;
      case "onTour":
        result = result.filter((a) => a.tourModeEnabled);
        break;
      case "incomplete":
        result = result.filter((a) => calculateOnboardingProgress(a.onboarding) < 100);
        break;
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "displayName":
          comparison = (a.displayName || "").localeCompare(b.displayName || "");
          break;
        case "createdAt":
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case "revenue":
          comparison = (a.metrics?.totalRevenue || 0) - (b.metrics?.totalRevenue || 0);
          break;
        case "bookings":
          comparison = (a.metrics?.totalBookings || 0) - (b.metrics?.totalBookings || 0);
          break;
        case "rating":
          comparison = (a.metrics?.averageRating || 0) - (b.metrics?.averageRating || 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [artists, searchQuery, statusFilter, sortField, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: artists.length,
      active: artists.filter((a) => a.isActive).length,
      onTour: artists.filter((a) => a.tourModeEnabled).length,
      totalRevenue: artists.reduce((sum, a) => sum + (a.metrics?.totalRevenue || 0), 0),
    };
  }, [artists]);

  // Handlers
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedArtists(new Set(filteredArtists.map((a) => a.id)));
    } else {
      setSelectedArtists(new Set());
    }
  }, [filteredArtists]);

  const handleSelectArtist = useCallback((id: string, checked: boolean) => {
    setSelectedArtists((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleEditArtist = useCallback((artist: ArtistWithMetrics) => {
    setSelectedArtist(artist);
    setFormModalOpen(true);
  }, []);

  const handleDeleteArtist = useCallback((artist: ArtistWithMetrics) => {
    setSelectedArtist(artist);
    setDeleteModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback((data: ArtistFormData) => {
    if (selectedArtist) {
      updateMutation.mutate({ id: selectedArtist.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [selectedArtist, updateMutation, createMutation]);

  const handleConfirmDelete = useCallback(() => {
    if (selectedArtist) {
      deleteMutation.mutate(selectedArtist.id);
    }
  }, [selectedArtist, deleteMutation]);

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Artist Management">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  // Render
  return (
    <DashboardLayout title="Artist Management" subtitle="Platform artist roster and performance">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
              <div>
                <p className="stat-label">Total Artists</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--signal-success)]/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[var(--signal-success)]" />
              </div>
              <div>
                <p className="stat-label">Active</p>
                <p className="text-2xl font-bold text-[var(--signal-success)]">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
              <div>
                <p className="stat-label">On Tour</p>
                <p className="text-2xl font-bold text-[var(--brand-primary)]">{stats.onTour}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-gold)]/10 flex items-center justify-center">
                <Euro className="w-6 h-6 text-[var(--brand-gold)]" />
              </div>
              <div>
                <p className="stat-label">Total Revenue</p>
                <p className="text-2xl font-bold text-[var(--brand-gold)]">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="card-white mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="onTour">On Tour</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                <SelectTrigger className="w-36">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="displayName">Name</SelectItem>
                  <SelectItem value="createdAt">Join Date</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh */}
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>

              {/* Add Artist */}
              <Button className="btn-primary" onClick={() => { setSelectedArtist(null); setFormModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Artist
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedArtists.size > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-4">
              <span className="text-sm text-[var(--text-secondary)]">
                {selectedArtists.size} selected
              </span>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-[var(--signal-error)]">
                <XCircle className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Artists Table */}
      <Card className="card-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-header">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedArtists.size === filteredArtists.length && filteredArtists.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArtists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="w-12 h-12 text-[var(--text-muted)]" />
                    <p className="text-[var(--text-secondary)]">No artists found</p>
                    <Button variant="outline" onClick={() => { setSelectedArtist(null); setFormModalOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Artist
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredArtists.map((artist) => (
                <TableRow key={artist.id} className="table-row">
                  <TableCell>
                    <Checkbox
                      checked={selectedArtists.has(artist.id)}
                      onCheckedChange={(checked) => handleSelectArtist(artist.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={artist.coverImageUrl || undefined} />
                        <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold">
                          {getInitials(artist.displayName || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{artist.displayName}</p>
                        <p className="text-sm text-[var(--text-muted)]">{artist.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <MapPin className="w-3 h-3" />
                      {artist.city || "N/A"}{artist.country && `, ${artist.country}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    {artist.specialty ? (
                      <Badge variant="outline">{artist.specialty}</Badge>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ArtistStatusBadge artist={artist} />
                  </TableCell>
                  <TableCell>
                    <ArtistMetricsCard metrics={artist.metrics} />
                  </TableCell>
                  <TableCell className="text-[var(--text-secondary)] text-sm">
                    {formatDate(artist.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditArtist(artist)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteArtist(artist)}
                          className="text-[var(--signal-error)]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modals */}
      <ArtistFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        artist={selectedArtist}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        artist={selectedArtist}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
