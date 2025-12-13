/**
 * ARTIST CALENDAR - Session & Availability Management
 * Full calendar interface for managing bookings and blocked time
 * 
 * Features:
 * - Monthly/Weekly/Day views
 * - Booking details modal
 * - Block time functionality
 * - Working hours configuration
 * - Drag to reschedule (future)
 * - Color-coded status indicators
 * - Today's schedule sidebar
 */

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Euro,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CalendarDays,
  CalendarRange,
  LayoutList,
  Settings,
  Ban
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface CalendarBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  slotDatetime: string;
  durationMinutes: number;
  depositAmount: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

interface BlockedSlot {
  id: string;
  startDatetime: string;
  endDatetime: string;
  reason?: string;
  isRecurring: boolean;
}

interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: CalendarBooking[];
  blockedSlots: BlockedSlot[];
}

type ViewMode = "month" | "week" | "day";

// =============================================================================
// MOCK DATA
// =============================================================================

const mockBookings: CalendarBooking[] = [
  {
    id: "BK001",
    customerName: "Maria Silva",
    customerEmail: "maria@email.com",
    customerPhone: "+31 6 1234 5678",
    slotDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 180,
    depositAmount: "150",
    status: "confirmed",
    notes: "Fineline butterfly on shoulder"
  },
  {
    id: "BK002",
    customerName: "João Costa",
    customerEmail: "joao@email.com",
    slotDatetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 240,
    depositAmount: "200",
    status: "confirmed",
    notes: "Cover-up on forearm"
  },
  {
    id: "BK003",
    customerName: "Ana Santos",
    customerEmail: "ana@email.com",
    slotDatetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 120,
    depositAmount: "100",
    status: "pending"
  },
  {
    id: "BK004",
    customerName: "Pedro Almeida",
    customerEmail: "pedro@email.com",
    slotDatetime: new Date().toISOString(),
    durationMinutes: 180,
    depositAmount: "175",
    status: "confirmed",
    notes: "Geometric design on arm"
  }
];

const mockBlockedSlots: BlockedSlot[] = [
  {
    id: "BS001",
    startDatetime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDatetime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    reason: "Personal time off",
    isRecurring: false
  }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(num);
};

const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
};

const getMonthDays = (year: number, month: number): DayData[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const days: DayData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Previous month padding
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      bookings: [],
      blockedSlots: []
    });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      bookings: [],
      blockedSlots: []
    });
  }

  // Next month padding
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      bookings: [],
      blockedSlots: []
    });
  }

  return days;
};

const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "confirmed": return "bg-[var(--signal-success)]";
    case "pending": return "bg-[var(--signal-warning)]";
    case "completed": return "bg-[var(--brand-primary)]";
    case "cancelled": return "bg-[var(--signal-error)]";
    default: return "bg-gray-400";
  }
};

// =============================================================================
// COMPONENTS
// =============================================================================

function CalendarDay({ day, onDateClick, onBookingClick }: {
  day: DayData;
  onDateClick: (date: Date) => void;
  onBookingClick: (booking: CalendarBooking) => void;
}) {
  const hasBookings = day.bookings.length > 0;
  const hasBlocked = day.blockedSlots.length > 0;

  return (
    <div
      className={`min-h-[100px] p-2 border border-[var(--border-subtle)] cursor-pointer transition-colors ${day.isCurrentMonth ? "bg-white" : "bg-[var(--bg-surface)]"
        } ${day.isToday ? "ring-2 ring-[var(--brand-primary)] ring-inset" : ""} hover:bg-[var(--bg-surface)]`}
      onClick={() => onDateClick(day.date)}
    >
      <div className={`text-sm font-medium mb-1 ${day.isToday ? "text-[var(--brand-primary)]" :
          day.isCurrentMonth ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
        }`}>
        {day.date.getDate()}
      </div>

      {hasBlocked && (
        <div className="mb-1 px-1.5 py-0.5 rounded text-xs bg-[var(--signal-error)]/10 text-[var(--signal-error)] flex items-center gap-1">
          <Ban className="w-3 h-3" />
          Blocked
        </div>
      )}

      <div className="space-y-1">
        {day.bookings.slice(0, 2).map((booking) => (
          <div
            key={booking.id}
            className={`px-1.5 py-0.5 rounded text-xs text-white truncate ${getStatusColor(booking.status)}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookingClick(booking);
            }}
          >
            {formatTime(booking.slotDatetime)} - {booking.customerName.split(" ")[0]}
          </div>
        ))}
        {day.bookings.length > 2 && (
          <div className="text-xs text-[var(--text-muted)] px-1.5">
            +{day.bookings.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
}

function TodaySchedule({ bookings, onBookingClick }: {
  bookings: CalendarBooking[];
  onBookingClick: (booking: CalendarBooking) => void;
}) {
  const todayBookings = bookings.filter(b => {
    const bookingDate = new Date(b.slotDatetime);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  }).sort((a, b) => new Date(a.slotDatetime).getTime() - new Date(b.slotDatetime).getTime());

  return (
    <Card className="card-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[var(--brand-primary)]" />
          Today's Schedule
        </CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {todayBookings.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-[var(--signal-success)]" />
            <p className="text-[var(--text-secondary)]">No sessions scheduled for today</p>
            <p className="text-sm text-[var(--text-muted)]">Enjoy your free time!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/30 cursor-pointer transition-colors"
                onClick={() => onBookingClick(booking)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-sm font-semibold">
                        {getInitials(booking.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{booking.customerName}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {formatTime(booking.slotDatetime)} • {booking.durationMinutes / 60}h
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    booking.status === "confirmed" ? "badge-success" :
                      booking.status === "pending" ? "badge-warning" : ""
                  }>
                    {booking.status}
                  </Badge>
                </div>
                {booking.notes && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)] italic pl-13">
                    "{booking.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingDetailModal({ booking, open, onOpenChange, onConfirm, onCancel }: {
  booking: CalendarBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (!booking) return null;

  const bookingDate = new Date(booking.slotDatetime);
  const endTime = new Date(bookingDate.getTime() + booking.durationMinutes * 60 * 1000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">
            Booking Details
          </DialogTitle>
          <DialogDescription>
            Booking #{booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xl font-semibold">
                {getInitials(booking.customerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{booking.customerName}</h3>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Mail className="w-4 h-4" />
                {booking.customerEmail}
              </div>
              {booking.customerPhone && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Phone className="w-4 h-4" />
                  {booking.customerPhone}
                </div>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--bg-surface)]">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Date</p>
              <p className="font-medium text-[var(--text-primary)]">{formatDate(bookingDate)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Time</p>
              <p className="font-medium text-[var(--text-primary)]">
                {formatTime(bookingDate)} - {formatTime(endTime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Duration</p>
              <p className="font-medium text-[var(--text-primary)]">{booking.durationMinutes / 60} hours</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Deposit</p>
              <p className="font-semibold text-[var(--signal-success)]">{formatCurrency(booking.depositAmount)}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)]">Status</span>
            <Badge className={
              booking.status === "confirmed" ? "badge-success" :
                booking.status === "pending" ? "badge-warning" :
                  booking.status === "cancelled" ? "badge-error" : ""
            }>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Notes</p>
              <p className="p-3 rounded-lg bg-[var(--bg-surface)] text-[var(--text-primary)] italic">
                "{booking.notes}"
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {booking.status === "pending" && (
            <Button onClick={() => onConfirm(booking.id)} className="btn-success">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          )}
          {(booking.status === "pending" || booking.status === "confirmed") && (
            <Button onClick={() => onCancel(booking.id)} variant="outline" className="text-[var(--signal-error)]">
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BlockTimeModal({ open, onOpenChange, selectedDate, onSubmit }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onSubmit: (data: { start: Date; end: Date; reason: string }) => void;
}) {
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");
  const [reason, setReason] = useState("");
  const [blockType, setBlockType] = useState<"day" | "custom">("day");

  const handleSubmit = () => {
    if (!selectedDate) return;

    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (blockType === "day") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      start.setHours(sh, sm, 0, 0);
      end.setHours(eh, em, 0, 0);
    }

    onSubmit({ start, end, reason });
    onOpenChange(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">
            Block Time
          </DialogTitle>
          <DialogDescription>
            Block this time slot from bookings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-[var(--bg-surface)] text-center">
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Block Type</Label>
            <Select value={blockType} onValueChange={(v) => setBlockType(v as "day" | "custom")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Full Day</SelectItem>
                <SelectItem value="custom">Custom Time Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {blockType === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time</Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Time</Label>
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Personal time off, Convention, etc."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="btn-primary">
            <Ban className="w-4 h-4 mr-2" />
            Block Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ArtistCalendar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Data (would be from API)
  const [bookings] = useState<CalendarBooking[]>(mockBookings);
  const [blockedSlots] = useState<BlockedSlot[]>(mockBlockedSlots);

  // Calendar data
  const calendarDays = useMemo(() => {
    const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());

    // Assign bookings to days
    days.forEach(day => {
      day.bookings = bookings.filter(b => {
        const bookingDate = new Date(b.slotDatetime);
        return bookingDate.toDateString() === day.date.toDateString();
      });

      day.blockedSlots = blockedSlots.filter(bs => {
        const start = new Date(bs.startDatetime);
        const end = new Date(bs.endDatetime);
        return day.date >= start && day.date <= end;
      });
    });

    return days;
  }, [currentDate, bookings, blockedSlots]);

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Handlers
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setBlockModalOpen(true);
  };

  const handleBookingClick = (booking: CalendarBooking) => {
    setSelectedBooking(booking);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = (id: string) => {
    console.log("Confirm booking:", id);
    // Would call API
    setBookingModalOpen(false);
  };

  const handleCancelBooking = (id: string) => {
    console.log("Cancel booking:", id);
    // Would call API
    setBookingModalOpen(false);
  };

  const handleBlockTime = (data: { start: Date; end: Date; reason: string }) => {
    console.log("Block time:", data);
    // Would call API
  };

  return (
    <DashboardLayout title="Calendar" subtitle="Manage your sessions and availability">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar - 3 columns */}
        <div className="lg:col-span-3">
          <Card className="card-white">
            {/* Header */}
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] min-w-[180px] text-center">
                      {monthName}
                    </h2>
                    <Button variant="outline" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" onClick={goToToday}>
                    Today
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                  >
                    <CalendarRange className="w-4 h-4 mr-1" />
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                  >
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                  >
                    <LayoutList className="w-4 h-4 mr-1" />
                    Day
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--signal-success)]"></div>
                  <span className="text-[var(--text-muted)]">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--signal-warning)]"></div>
                  <span className="text-[var(--text-muted)]">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--brand-primary)]"></div>
                  <span className="text-[var(--text-muted)]">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[var(--signal-error)]/20 border border-[var(--signal-error)]"></div>
                  <span className="text-[var(--text-muted)]">Blocked</span>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-[var(--text-muted)]">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 border-t border-l border-[var(--border-subtle)]">
                {calendarDays.map((day, index) => (
                  <CalendarDay
                    key={index}
                    day={day}
                    onDateClick={handleDateClick}
                    onBookingClick={handleBookingClick}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TodaySchedule bookings={bookings} onBookingClick={handleBookingClick} />

          {/* Quick Actions */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setBlockModalOpen(true)}>
                <Ban className="w-4 h-4" />
                Block Time
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="w-4 h-4" />
                Working Hours
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <RefreshCw className="w-4 h-4" />
                Sync Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="card-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Total Sessions</span>
                <span className="font-semibold text-[var(--text-primary)]">{bookings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Confirmed</span>
                <span className="font-semibold text-[var(--signal-success)]">
                  {bookings.filter(b => b.status === "confirmed").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Pending</span>
                <span className="font-semibold text-[var(--signal-warning)]">
                  {bookings.filter(b => b.status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Hours Booked</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {bookings.reduce((sum, b) => sum + b.durationMinutes, 0) / 60}h
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <BookingDetailModal
        booking={selectedBooking}
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
      />

      <BlockTimeModal
        open={blockModalOpen}
        onOpenChange={setBlockModalOpen}
        selectedDate={selectedDate}
        onSubmit={handleBlockTime}
      />
    </DashboardLayout>
  );
}
