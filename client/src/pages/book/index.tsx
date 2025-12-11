import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoCompact } from "@/components/logo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { bookingFormSchema, type BookingFormData, type Artist, type Availability, type CitySchedule } from "@shared/schema";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingPage() {
  const [, params] = useRoute("/book/:subdomain");
  const subdomain = params?.subdomain;
  const { toast } = useToast();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"calendar" | "time" | "details" | "payment" | "success">("calendar");
  const [lockId, setLockId] = useState<string | null>(null);
  const [lockExpiresAt, setLockExpiresAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds

  const { data: artist, isLoading: artistLoading, error: artistError } = useQuery<Artist>({
    queryKey: ["/api/public/artist", subdomain],
    enabled: !!subdomain,
  });

  const { data: availability } = useQuery<Availability[]>({
    queryKey: ["/api/public/artist", subdomain, "availability"],
    enabled: !!subdomain && !!artist,
  });

  const { data: citySchedules } = useQuery<CitySchedule[]>({
    queryKey: ["/api/public/artist", subdomain, "city-schedules"],
    enabled: !!subdomain && !!artist?.tourModeEnabled,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerInstagram: "",
      slotDatetime: "",
      notes: "",
    },
  });

  // Countdown timer for lock
  useEffect(() => {
    if (!lockExpiresAt) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((lockExpiresAt.getTime() - Date.now()) / 1000));
      setCountdown(remaining);
      
      if (remaining <= 0) {
        setLockId(null);
        setLockExpiresAt(null);
        setStep("calendar");
        toast({
          title: "Time Expired",
          description: "Your slot reservation has expired. Please select a new time.",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt, toast]);

  const createLockMutation = useMutation({
    mutationFn: async (data: { slotDatetime: string; customerEmail: string; customerName: string }) => {
      const response = await apiRequest("POST", `/api/public/artist/${subdomain}/lock`, data);
      return response.json();
    },
    onSuccess: (data) => {
      setLockId(data.lockId);
      setLockExpiresAt(new Date(data.expiresAt));
      setStep("details");
    },
    onError: () => {
      toast({
        title: "Slot Unavailable",
        description: "This time slot is no longer available. Please choose another.",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest("POST", `/api/public/artist/${subdomain}/book`, {
        ...data,
        lockId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setStep("success");
      }
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to complete your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateAvailable = (date: Date) => {
    if (!availability) return false;
    const dayOfWeek = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;
    
    return availability.some((a) => a.dayOfWeek === dayOfWeek && a.isActive);
  };

  const getTimeSlots = (date: Date) => {
    if (!availability) return [];
    const dayOfWeek = date.getDay();
    const dayAvail = availability.find((a) => a.dayOfWeek === dayOfWeek && a.isActive);
    
    if (!dayAvail) return [];

    const slots: string[] = [];
    const [startHour, startMin] = (dayAvail.startTime || "09:00").split(":").map(Number);
    const [endHour, endMin] = (dayAvail.endTime || "18:00").split(":").map(Number);
    const duration = dayAvail.slotDurationMinutes || 60;

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current + duration <= end) {
      const hours = Math.floor(current / 60);
      const mins = current % 60;
      slots.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
      current += duration;
    }

    return slots;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    const datetime = new Date(selectedDate!);
    const [hours, mins] = time.split(":").map(Number);
    datetime.setHours(hours, mins, 0, 0);
    form.setValue("slotDatetime", datetime.toISOString());
  };

  const handleProceedToDetails = () => {
    if (!selectedDate || !selectedTime) return;
    
    const datetime = new Date(selectedDate);
    const [hours, mins] = selectedTime.split(":").map(Number);
    datetime.setHours(hours, mins, 0, 0);

    // For now, skip lock creation and go directly to details
    // In production, this would create a lock first
    setStep("details");
  };

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  if (artistLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
          <Skeleton className="w-48 h-6 mx-auto mb-2" />
          <Skeleton className="w-32 h-4 mx-auto" />
        </div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Artist Not Found</h1>
            <p className="text-muted-foreground">
              This booking page doesn't exist or is not available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const themeColor = artist.themeColor || "#F59E0B";
  const days = getDaysInMonth(currentMonth);
  const timeSlots = selectedDate ? getTimeSlots(selectedDate) : [];

  // Get active city schedule for tour mode
  const activeCitySchedule = citySchedules?.find((cs) => {
    const now = new Date();
    return new Date(cs.startDate) <= now && new Date(cs.endDate) >= now && cs.isActive;
  });

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 glass bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2" style={{ borderColor: themeColor }}>
                <AvatarImage src={artist.coverImageUrl || undefined} />
                <AvatarFallback style={{ backgroundColor: themeColor + "20", color: themeColor }}>
                  {getInitials(artist.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{artist.displayName}</p>
                <p className="text-xs text-muted-foreground">@{artist.subdomain}</p>
              </div>
            </div>
            {artist.instagram && (
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={`https://instagram.com/${artist.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Lock Timer */}
      {lockExpiresAt && step !== "success" && (
        <div className="bg-chart-5/10 border-b border-chart-5/30 py-2">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-chart-5 animate-pulse-glow" />
            <span>Slot reserved for</span>
            <span className="font-mono font-semibold text-chart-5">
              {formatCountdown(countdown)}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 safe-bottom">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["calendar", "time", "details", "payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s || (step === "success" && i < 4)
                    ? "text-white"
                    : "bg-muted text-muted-foreground"
                }`}
                style={{
                  backgroundColor: step === s || (step === "success" && i < 4) ? themeColor : undefined,
                }}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div className={`w-8 h-0.5 ${i < ["calendar", "time", "details", "payment"].indexOf(step) ? "bg-foreground" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Calendar Step */}
        {step === "calendar" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-lg">Select a Date</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, i) => {
                  if (!date) {
                    return <div key={i} className="aspect-square" />;
                  }

                  const available = isDateAvailable(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();

                  return (
                    <button
                      key={i}
                      onClick={() => available && setSelectedDate(date)}
                      disabled={!available}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center
                        text-sm font-medium transition-all touch-target
                        ${isToday ? "ring-2 ring-offset-2" : ""}
                        ${isSelected ? "text-white" : ""}
                        ${available ? "hover-elevate cursor-pointer" : "opacity-30 cursor-not-allowed"}
                      `}
                      style={{
                        backgroundColor: isSelected ? themeColor : undefined,
                        ringColor: isToday ? themeColor : undefined,
                      }}
                      data-testid={`calendar-day-${date.getDate()}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    className="w-full"
                    style={{ backgroundColor: themeColor }}
                    onClick={() => setStep("time")}
                    data-testid="button-continue-to-time"
                  >
                    Continue to Time Selection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Time Step */}
        {step === "time" && selectedDate && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <div>
                <Button variant="ghost" size="sm" onClick={() => setStep("calendar")} className="mb-2 -ml-2">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`
                        p-3 rounded-lg text-sm font-medium transition-all touch-target
                        ${selectedTime === time ? "text-white" : "bg-muted hover-elevate"}
                      `}
                      style={{
                        backgroundColor: selectedTime === time ? themeColor : undefined,
                      }}
                      data-testid={`time-slot-${time}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No available times on this date</p>
                </div>
              )}

              {selectedTime && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    className="w-full"
                    style={{ backgroundColor: themeColor }}
                    onClick={handleProceedToDetails}
                    data-testid="button-continue-to-details"
                  >
                    Continue to Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Details Step */}
        {step === "details" && (
          <Card>
            <CardHeader className="pb-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("time")} className="mb-2 -ml-2 w-fit">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <CardTitle className="text-lg">Your Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 234 567 8900" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerInstagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-muted-foreground" />
                            <Input placeholder="yourusername" {...field} data-testid="input-instagram" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any details about your tattoo idea, references, etc."
                            rows={3}
                            {...field}
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Booking Summary */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <h3 className="font-semibold text-sm">Booking Summary</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedTime}</span>
                    </div>
                    {artist.tourModeEnabled && activeCitySchedule && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{activeCitySchedule.city}, {activeCitySchedule.country}</span>
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Address after payment
                        </Badge>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Non-refundable Deposit</span>
                        <span className="font-semibold">
                          {artist.currency} {artist.depositAmount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Secure Payment
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Non-refundable
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    style={{ backgroundColor: themeColor }}
                    disabled={createBookingMutation.isPending}
                    data-testid="button-proceed-to-payment"
                  >
                    {createBookingMutation.isPending ? "Processing..." : `Pay ${artist.currency} ${artist.depositAmount} Deposit`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === "success" && (
          <Card>
            <CardContent className="p-8 text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: themeColor + "20" }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: themeColor }} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-6">
                Your appointment with {artist.displayName} has been confirmed.
                You'll receive a confirmation email shortly.
              </p>
              
              <div className="p-4 rounded-lg bg-muted/50 text-left space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {selectedDate?.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedTime}</span>
                </div>
                {activeCitySchedule && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{activeCitySchedule.fullAddress}</span>
                  </div>
                )}
              </div>

              <Button variant="outline" onClick={() => window.location.reload()}>
                Book Another Appointment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Artist Bio */}
        {step === "calendar" && artist.bio && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">About {artist.displayName}</h3>
              <p className="text-sm text-muted-foreground">{artist.bio}</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>Powered by</span>
            <LogoCompact />
          </div>
        </div>
      </footer>
    </div>
  );
}
