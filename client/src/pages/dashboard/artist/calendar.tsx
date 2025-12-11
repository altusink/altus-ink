import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import type { Availability, Booking } from "@shared/schema";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

export default function ArtistCalendar() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

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

  const { data: availability, isLoading: availabilityLoading } = useQuery<Availability[]>({
    queryKey: ["/api/artist/availability"],
    enabled: isAuthenticated,
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/artist/bookings", currentMonth.getMonth(), currentMonth.getFullYear()],
    enabled: isAuthenticated,
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }) => {
      return apiRequest("POST", "/api/artist/availability", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/availability"] });
      toast({ title: "Availability updated" });
    },
    onError: () => {
      toast({ title: "Failed to update availability", variant: "destructive" });
    },
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getBookingsForDate = (date: Date) => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      const bookingDate = new Date(b.slotDatetime);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);
  const selectedBookings = getBookingsForDate(selectedDate);

  if (authLoading) {
    return (
      <DashboardLayout title="Calendar">
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Calendar" subtitle="Manage your availability and view bookings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
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
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, i) => {
                if (!date) {
                  return <div key={i} className="aspect-square" />;
                }

                const dayBookings = getBookingsForDate(date);
                const hasBookings = dayBookings.length > 0;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center
                      text-sm font-medium transition-colors touch-target
                      ${isToday(date) ? "ring-2 ring-primary" : ""}
                      ${isSelected(date) ? "bg-primary text-primary-foreground" : "hover-elevate"}
                    `}
                    data-testid={`calendar-day-${date.getDate()}`}
                  >
                    <span>{date.getDate()}</span>
                    {hasBookings && (
                      <div className="flex gap-0.5 mt-1">
                        {dayBookings.slice(0, 3).map((_, j) => (
                          <div
                            key={j}
                            className={`w-1 h-1 rounded-full ${
                              isSelected(date) ? "bg-primary-foreground" : "bg-primary"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-base">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </CardTitle>
              <Badge variant="secondary">{selectedBookings.length} bookings</Badge>
            </CardHeader>
            <CardContent>
              {selectedBookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 rounded-lg bg-muted/50"
                      data-testid={`booking-detail-${booking.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{booking.customerName}</span>
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(booking.slotDatetime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>({booking.durationMinutes} min)</span>
                      </div>
                      {booking.customerEmail && (
                        <p className="text-xs text-muted-foreground mt-1">{booking.customerEmail}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No bookings for this day</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Availability */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-base">Weekly Availability</CardTitle>
              <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-edit-availability">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Availability</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {DAYS.map((day, index) => {
                      const dayAvail = availability?.find((a) => a.dayOfWeek === index);
                      return (
                        <div key={day} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <Switch
                              id={`day-${index}`}
                              checked={dayAvail?.isActive ?? false}
                              onCheckedChange={(checked) => {
                                updateAvailabilityMutation.mutate({
                                  dayOfWeek: index,
                                  startTime: dayAvail?.startTime || "09:00",
                                  endTime: dayAvail?.endTime || "18:00",
                                  isActive: checked,
                                });
                              }}
                            />
                            <Label htmlFor={`day-${index}`} className="text-sm min-w-[80px]">
                              {day}
                            </Label>
                          </div>
                          {dayAvail?.isActive && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{dayAvail.startTime}</span>
                              <span>-</span>
                              <span>{dayAvail.endTime}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availability && availability.length > 0 ? (
                  availability
                    .filter((a) => a.isActive)
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{DAYS[a.dayOfWeek]}</span>
                        <span className="text-muted-foreground">
                          {a.startTime} - {a.endTime}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No availability set. Click + to add your schedule.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
