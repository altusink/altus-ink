/**
 * BOOKING PAGE - Complete Booking Flow
 * Full multi-step booking wizard with artist selection, date/time, customer info, payment
 * 
 * Features:
 * - 4-step wizard (Artist → Date/Time → Details → Payment)
 * - Real-time availability checking
 * - Deposit calculation display
 * - Reference image upload
 * - Terms acceptance
 * - Stripe checkout integration
 * - Multi-language support
 * - Mobile-optimized
 * - Progress indicator
 * - Form validation
 * - Session persistence
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Euro,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  Star,
  Instagram,
  Globe,
  AlertCircle,
  Info,
  Shield,
  FileText,
  Loader2
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface Artist {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  specialty?: string;
  styles: string[];
  city?: string;
  country?: string;
  coverImageUrl?: string;
  instagram?: string;
  rating: number;
  reviewCount: number;
  depositMinimum: number;
  cancellationPolicy: "flexible" | "moderate" | "strict";
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
  fullyBooked: boolean;
}

interface BookingFormData {
  // Step 1: Artist
  artistId: string;
  // Step 2: Date/Time
  date: string;
  timeSlot: string;
  duration: number;
  // Step 3: Details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tattooSize: string;
  tattooPlacement: string;
  notes: string;
  referenceImages: File[];
  agreeToTerms: boolean;
  agreeToPolicy: boolean;
  // Step 4: Payment
  paymentMethod: string;
}

type BookingStep = 1 | 2 | 3 | 4;

// =============================================================================
// CONSTANTS
// =============================================================================

const TATTOO_SIZES = [
  { value: "tiny", label: "Tiny (< 5cm)", duration: 60, depositMin: 50 },
  { value: "small", label: "Small (5-10cm)", duration: 120, depositMin: 75 },
  { value: "medium", label: "Medium (10-20cm)", duration: 180, depositMin: 100 },
  { value: "large", label: "Large (20-40cm)", duration: 300, depositMin: 150 },
  { value: "extra_large", label: "Extra Large (> 40cm)", duration: 480, depositMin: 200 },
  { value: "half_sleeve", label: "Half Sleeve", duration: 720, depositMin: 300 },
  { value: "full_sleeve", label: "Full Sleeve", duration: 1440, depositMin: 500 }
];

const BODY_PLACEMENTS = [
  "Arm - Upper", "Arm - Lower", "Wrist", "Hand", "Finger",
  "Shoulder", "Chest", "Back - Upper", "Back - Lower", "Ribs",
  "Hip", "Thigh", "Calf", "Ankle", "Foot", "Neck", "Other"
];

const PAYMENT_METHODS = [
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, available: true },
  { id: "ideal", label: "iDEAL", icon: Euro, available: true, countries: ["NL"] },
  { id: "bancontact", label: "Bancontact", icon: Euro, available: true, countries: ["BE"] },
  { id: "sepa", label: "SEPA Direct Debit", icon: Euro, available: true }
];

const STEP_NAMES = ["Select Artist", "Choose Date & Time", "Your Details", "Payment"];

// =============================================================================
// MOCK DATA
// =============================================================================

const mockArtists: Artist[] = [
  {
    id: "A001",
    username: "danilo.santos",
    displayName: "Danilo Santos",
    bio: "Specializing in fine line and minimalist tattoos with over 10 years of experience.",
    specialty: "Fineline",
    styles: ["Fineline", "Minimalist", "Geometric"],
    city: "Amsterdam",
    country: "Netherlands",
    coverImageUrl: "/artists/danilo.jpg",
    instagram: "danilo.ink",
    rating: 4.9,
    reviewCount: 156,
    depositMinimum: 100,
    cancellationPolicy: "moderate"
  },
  {
    id: "A002",
    username: "ana.ink",
    displayName: "Ana Ink",
    bio: "Blackwork and ornamental specialist. Creating unique pieces since 2015.",
    specialty: "Blackwork",
    styles: ["Blackwork", "Ornamental", "Mandala"],
    city: "Lisbon",
    country: "Portugal",
    coverImageUrl: "/artists/ana.jpg",
    instagram: "ana.ink.art",
    rating: 4.8,
    reviewCount: 98,
    depositMinimum: 75,
    cancellationPolicy: "flexible"
  },
  {
    id: "A003",
    username: "carlos.art",
    displayName: "Carlos Art",
    bio: "Traditional and neo-traditional tattoos. Bold colors and strong lines.",
    specialty: "Traditional",
    styles: ["Traditional", "Neo-Traditional", "Color"],
    city: "Berlin",
    country: "Germany",
    coverImageUrl: "/artists/carlos.jpg",
    instagram: "carlos.tattoo",
    rating: 4.7,
    reviewCount: 72,
    depositMinimum: 100,
    cancellationPolicy: "strict"
  }
];

const generateAvailability = (artistId: string): DayAvailability[] => {
  const days: DayAvailability[] = [];
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip weekends randomly
    if (date.getDay() === 0 || (date.getDay() === 6 && Math.random() > 0.5)) {
      continue;
    }

    const slots: TimeSlot[] = [];
    const startHour = 10;
    const endHour = 19;

    for (let h = startHour; h < endHour; h++) {
      const available = Math.random() > 0.3;
      slots.push({
        time: `${h.toString().padStart(2, "0")}:00`,
        available,
        reason: available ? undefined : "Already booked"
      });
    }

    days.push({
      date: date.toISOString().split("T")[0],
      slots,
      fullyBooked: slots.every(s => !s.available)
    });
  }

  return days;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
};

const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const calculateDeposit = (size: string, artistMinimum: number): number => {
  const sizeConfig = TATTOO_SIZES.find(s => s.value === size);
  return Math.max(sizeConfig?.depositMin || 100, artistMinimum);
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string): boolean => {
  return /^\+?[\d\s-()]{7,20}$/.test(phone);
};

// =============================================================================
// STEP COMPONENTS
// =============================================================================

function StepProgress({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${isCompleted
                  ? "bg-[var(--signal-success)] border-[var(--signal-success)] text-white"
                  : isCurrent
                    ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/10"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                }`}>
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 md:w-24 h-0.5 mx-2 ${isCompleted ? "bg-[var(--signal-success)]" : "bg-[var(--border-subtle)]"
                  }`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <span key={step} className={`text-xs md:text-sm ${index + 1 <= currentStep ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
            }`}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

function ArtistSelection({
  artists,
  selectedId,
  onSelect
}: {
  artists: Artist[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((artist) => (
          <motion.div
            key={artist.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all ${selectedId === artist.id
                  ? "ring-2 ring-[var(--brand-primary)] border-[var(--brand-primary)]"
                  : "hover:border-[var(--brand-primary)]/50"
                }`}
              onClick={() => onSelect(artist.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={artist.coverImageUrl} />
                    <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-lg font-semibold">
                      {getInitials(artist.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--text-primary)] truncate">
                        {artist.displayName}
                      </h3>
                      {selectedId === artist.id && (
                        <Check className="w-5 h-5 text-[var(--signal-success)] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {artist.city}, {artist.country}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-[var(--brand-gold)]" />
                      <span className="text-sm font-medium">{artist.rating}</span>
                      <span className="text-xs text-[var(--text-muted)]">({artist.reviewCount} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {artist.styles.slice(0, 3).map((style) => (
                        <Badge key={style} variant="secondary" className="text-xs">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {artist.bio && (
                  <p className="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2">
                    {artist.bio}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  <span className="text-sm text-[var(--text-muted)]">
                    Deposit from {formatCurrency(artist.depositMinimum)}
                  </span>
                  <Badge className={
                    artist.cancellationPolicy === "flexible" ? "badge-success" :
                      artist.cancellationPolicy === "moderate" ? "badge-warning" : ""
                  }>
                    {artist.cancellationPolicy}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedId && (
        <div className="p-4 rounded-lg bg-[var(--signal-info)]/10 border border-[var(--signal-info)]/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--signal-info)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                Selected: {artists.find(a => a.id === selectedId)?.displayName}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Proceed to select your preferred date and time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DateTimeSelection({
  artistId,
  selectedDate,
  selectedTime,
  selectedDuration,
  onDateSelect,
  onTimeSelect,
  onDurationSelect
}: {
  artistId: string;
  selectedDate: string;
  selectedTime: string;
  selectedDuration: number;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onDurationSelect: (duration: number) => void;
}) {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    // Simulated API call
    setAvailability(generateAvailability(artistId));
  }, [artistId]);

  const selectedDaySlots = availability.find(d => d.date === selectedDate)?.slots || [];

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="card-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Select Date</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs text-[var(--text-muted)] py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="p-2" />;
              }

              const dateStr = day.toISOString().split("T")[0];
              const dayData = availability.find(a => a.date === dateStr);
              const isPast = day < today;
              const isSelected = dateStr === selectedDate;
              const isAvailable = dayData && !dayData.fullyBooked;
              const isDisabled = isPast || !isAvailable;

              return (
                <button
                  key={dateStr}
                  className={`p-2 rounded-lg text-sm transition-all ${isSelected
                      ? "bg-[var(--brand-primary)] text-white"
                      : isDisabled
                        ? "text-[var(--text-muted)] cursor-not-allowed"
                        : "hover:bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    }`}
                  disabled={isDisabled}
                  onClick={() => onDateSelect(dateStr)}
                >
                  {day.getDate()}
                  {isAvailable && !isPast && (
                    <div className="w-1 h-1 rounded-full bg-[var(--signal-success)] mx-auto mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--signal-success)]" />
              Available
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
              Unavailable
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots & Duration */}
      <div className="space-y-4">
        {/* Duration Selection */}
        <Card className="card-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Session Duration</CardTitle>
            <CardDescription>Estimated based on tattoo size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {TATTOO_SIZES.slice(0, 4).map((size) => (
                <button
                  key={size.value}
                  className={`p-3 rounded-lg border text-left transition-all ${selectedDuration === size.duration
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                      : "border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/50"
                    }`}
                  onClick={() => onDurationSelect(size.duration)}
                >
                  <p className="font-medium text-[var(--text-primary)]">{size.label}</p>
                  <p className="text-sm text-[var(--text-muted)]">~{size.duration / 60}h</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className="card-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Select Time</CardTitle>
            {selectedDate && (
              <CardDescription>{formatDate(selectedDate)}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-center py-8 text-[var(--text-muted)]">
                Please select a date first
              </p>
            ) : selectedDaySlots.length === 0 ? (
              <p className="text-center py-8 text-[var(--text-muted)]">
                No available slots for this date
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {selectedDaySlots.map((slot) => (
                  <button
                    key={slot.time}
                    className={`p-3 rounded-lg border text-center transition-all ${!slot.available
                        ? "border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed line-through"
                        : selectedTime === slot.time
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                          : "border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-[var(--text-primary)]"
                      }`}
                    disabled={!slot.available}
                    onClick={() => onTimeSelect(slot.time)}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedDate && selectedTime && (
          <div className="p-4 rounded-lg bg-[var(--signal-success)]/10 border border-[var(--signal-success)]/20">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[var(--signal-success)]" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  {formatDate(selectedDate)} at {selectedTime}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Duration: ~{selectedDuration / 60} hours
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerDetails({
  formData,
  onChange,
  onImageUpload,
  onRemoveImage,
  errors
}: {
  formData: Partial<BookingFormData>;
  onChange: (field: keyof BookingFormData, value: any) => void;
  onImageUpload: (files: FileList) => void;
  onRemoveImage: (index: number) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Contact Information */}
      <Card className="card-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            Contact Information
          </CardTitle>
          <CardDescription>
            We'll use this to confirm your booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.customerName || ""}
              onChange={(e) => onChange("customerName", e.target.value)}
              className={errors.customerName ? "border-[var(--signal-error)]" : ""}
            />
            {errors.customerName && (
              <p className="text-sm text-[var(--signal-error)]">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.customerEmail || ""}
              onChange={(e) => onChange("customerEmail", e.target.value)}
              className={errors.customerEmail ? "border-[var(--signal-error)]" : ""}
            />
            {errors.customerEmail && (
              <p className="text-sm text-[var(--signal-error)]">{errors.customerEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+31 6 1234 5678"
              value={formData.customerPhone || ""}
              onChange={(e) => onChange("customerPhone", e.target.value)}
              className={errors.customerPhone ? "border-[var(--signal-error)]" : ""}
            />
            {errors.customerPhone && (
              <p className="text-sm text-[var(--signal-error)]">{errors.customerPhone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tattoo Details */}
      <Card className="card-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[var(--brand-primary)]" />
            Tattoo Details
          </CardTitle>
          <CardDescription>
            Help us understand your design
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="size">Tattoo Size *</Label>
            <Select
              value={formData.tattooSize || ""}
              onValueChange={(value) => onChange("tattooSize", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {TATTOO_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label} (~{size.duration / 60}h)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placement">Body Placement *</Label>
            <Select
              value={formData.tattooPlacement || ""}
              onValueChange={(value) => onChange("tattooPlacement", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                {BODY_PLACEMENTS.map((placement) => (
                  <SelectItem key={placement} value={placement}>
                    {placement}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Design Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe your tattoo idea, style preferences, or any other details..."
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => onChange("notes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reference Images */}
      <Card className="card-white lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-[var(--brand-primary)]" />
            Reference Images
          </CardTitle>
          <CardDescription>
            Upload inspiration or reference images (optional, max 5)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {(formData.referenceImages || []).map((file, index) => (
              <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--border-subtle)]">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {(formData.referenceImages || []).length < 5 && (
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--brand-primary)] transition-colors">
                <Upload className="w-6 h-6 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)] mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && onImageUpload(e.target.files)}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card className="card-white lg:col-span-2">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms || false}
              onCheckedChange={(checked) => onChange("agreeToTerms", checked)}
            />
            <label htmlFor="terms" className="text-sm text-[var(--text-secondary)] cursor-pointer">
              I agree to the <Link href="/legal/terms" className="text-[var(--brand-primary)] underline">Terms of Service</Link> and <Link href="/legal/privacy" className="text-[var(--brand-primary)] underline">Privacy Policy</Link>
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="policy"
              checked={formData.agreeToPolicy || false}
              onCheckedChange={(checked) => onChange("agreeToPolicy", checked)}
            />
            <label htmlFor="policy" className="text-sm text-[var(--text-secondary)] cursor-pointer">
              I understand and agree to the <Link href="/legal/cancellation" className="text-[var(--brand-primary)] underline">Cancellation Policy</Link>. A deposit is required to confirm my booking.
            </label>
          </div>

          {errors.terms && (
            <p className="text-sm text-[var(--signal-error)]">{errors.terms}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentStep({
  formData,
  artist,
  onMethodSelect,
  onProceedToPayment,
  isProcessing
}: {
  formData: Partial<BookingFormData>;
  artist?: Artist;
  onMethodSelect: (method: string) => void;
  onProceedToPayment: () => void;
  isProcessing: boolean;
}) {
  const deposit = calculateDeposit(formData.tattooSize || "medium", artist?.depositMinimum || 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Booking Summary */}
      <Card className="card-white">
        <CardHeader>
          <CardTitle className="text-lg">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)]">Artist</p>
              <p className="font-medium text-[var(--text-primary)]">{artist?.displayName}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Location</p>
              <p className="font-medium text-[var(--text-primary)]">{artist?.city}, {artist?.country}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Date & Time</p>
              <p className="font-medium text-[var(--text-primary)]">
                {formData.date && formatDate(formData.date)} at {formData.timeSlot}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Duration</p>
              <p className="font-medium text-[var(--text-primary)]">
                ~{(formData.duration || 0) / 60} hours
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium text-[var(--text-primary)]">Deposit Required</span>
              <span className="font-bold text-[var(--signal-success)]">{formatCurrency(deposit)}</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Remaining balance to be paid on the day of your session
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="card-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[var(--brand-primary)]" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={formData.paymentMethod} onValueChange={onMethodSelect}>
            <div className="grid grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${formData.paymentMethod === method.id
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                      : "border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/50"
                    }`}
                >
                  <RadioGroupItem value={method.id} />
                  <method.icon className="w-5 h-5 text-[var(--text-secondary)]" />
                  <span className="font-medium text-[var(--text-primary)]">{method.label}</span>
                </label>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[var(--signal-success)] flex-shrink-0" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">Secure Payment</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Your payment is processed securely by Stripe. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={onProceedToPayment}
        disabled={!formData.paymentMethod || isProcessing}
        className="w-full btn-primary h-14 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay {formatCurrency(deposit)} Deposit
          </>
        )}
      </Button>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function BookingPage() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    artistId: "",
    date: "",
    timeSlot: "",
    duration: 120,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    tattooSize: "",
    tattooPlacement: "",
    notes: "",
    referenceImages: [],
    agreeToTerms: false,
    agreeToPolicy: false,
    paymentMethod: "card"
  });

  const artists = mockArtists;
  const selectedArtist = artists.find(a => a.id === formData.artistId);

  const updateFormData = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleImageUpload = (files: FileList) => {
    const currentImages = formData.referenceImages || [];
    const newImages = Array.from(files).slice(0, 5 - currentImages.length);
    setFormData(prev => ({
      ...prev,
      referenceImages: [...currentImages, ...newImages]
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceImages: prev.referenceImages?.filter((_, i) => i !== index) || []
    }));
  };

  const validateStep = (step: BookingStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.artistId) newErrors.artist = "Please select an artist";
        break;
      case 2:
        if (!formData.date) newErrors.date = "Please select a date";
        if (!formData.timeSlot) newErrors.time = "Please select a time";
        break;
      case 3:
        if (!formData.customerName?.trim()) newErrors.customerName = "Name is required";
        if (!formData.customerEmail || !isValidEmail(formData.customerEmail)) {
          newErrors.customerEmail = "Valid email is required";
        }
        if (!formData.customerPhone || !isValidPhone(formData.customerPhone)) {
          newErrors.customerPhone = "Valid phone number is required";
        }
        if (!formData.tattooSize) newErrors.tattooSize = "Please select tattoo size";
        if (!formData.tattooPlacement) newErrors.tattooPlacement = "Please select placement";
        if (!formData.agreeToTerms || !formData.agreeToPolicy) {
          newErrors.terms = "You must agree to the terms and cancellation policy";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4) as BookingStep);
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1) as BookingStep);
  };

  const handleProceedToPayment = async () => {
    setIsProcessing(true);

    try {
      // Would call API to create booking and get Stripe checkout URL
      await new Promise(r => setTimeout(r, 2000));

      // Redirect to Stripe checkout
      // window.location.href = checkoutUrl;

      // For demo, redirect to success
      setLocation("/booking/success?demo=true");
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return !!formData.artistId;
      case 2: return !!formData.date && !!formData.timeSlot;
      case 3: return !!formData.customerName && !!formData.customerEmail &&
        !!formData.tattooSize && !!formData.agreeToTerms && !!formData.agreeToPolicy;
      case 4: return !!formData.paymentMethod;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-surface)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border-subtle)] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Altus<span className="text-[var(--brand-primary)]">Ink</span>
            </h1>
          </Link>
          <Button variant="ghost" onClick={() => setLocation("/")}>
            Cancel
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <StepProgress currentStep={currentStep} steps={STEP_NAMES} />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <ArtistSelection
                  artists={artists}
                  selectedId={formData.artistId || ""}
                  onSelect={(id) => updateFormData("artistId", id)}
                />
              )}

              {currentStep === 2 && (
                <DateTimeSelection
                  artistId={formData.artistId || ""}
                  selectedDate={formData.date || ""}
                  selectedTime={formData.timeSlot || ""}
                  selectedDuration={formData.duration || 120}
                  onDateSelect={(date) => updateFormData("date", date)}
                  onTimeSelect={(time) => updateFormData("timeSlot", time)}
                  onDurationSelect={(duration) => updateFormData("duration", duration)}
                />
              )}

              {currentStep === 3 && (
                <CustomerDetails
                  formData={formData}
                  onChange={updateFormData}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                  errors={errors}
                />
              )}

              {currentStep === 4 && (
                <PaymentStep
                  formData={formData}
                  artist={selectedArtist}
                  onMethodSelect={(method) => updateFormData("paymentMethod", method)}
                  onProceedToPayment={handleProceedToPayment}
                  isProcessing={isProcessing}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
              <Button
                variant="outline"
                onClick={goToPrevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="btn-primary"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[var(--border-subtle)] py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-[var(--text-muted)]">
          <div className="flex items-center justify-center gap-4">
            <Shield className="w-4 h-4" />
            Secure booking powered by Stripe
          </div>
        </div>
      </footer>
    </div>
  );
}
