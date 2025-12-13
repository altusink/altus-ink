import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MoreHorizontal
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Booking, Artist } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface BookingWithArtist extends Booking {
  artist?: Artist;
}

export default function CEOBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithArtist | null>(null);

  const { data: bookings, isLoading } = useQuery<BookingWithArtist[]>({
    queryKey: ["/api/ceo/bookings"],
    enabled: user?.role === "ceo",
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/ceo/bookings/${bookingId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Status Updated", description: "Booking status has been successfully modified." });
      queryClient.invalidateQueries({ queryKey: ["/api/ceo/bookings"] });
      setSelectedBooking(null);
    },
    onError: () => {
      toast({ title: "Operation Failed", description: "Could not update booking status.", variant: "destructive" });
    },
  });

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return <Badge className="badge-success">Confirmed</Badge>;
      case "pending":
        return <Badge className="badge-warning">Pending Review</Badge>;
      case "completed":
        return <Badge className="badge-primary">Completed</Badge>;
      case "cancelled":
        return <Badge className="badge-error">Cancelled</Badge>;
      case "no_show":
        return <Badge variant="outline" className="text-[var(--text-muted)]">No Show</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const stats = {
    total: bookings?.length || 0,
    confirmed: bookings?.filter((b) => b.status === "confirmed").length || 0,
    pending: bookings?.filter((b) => b.status === "pending").length || 0,
    volume: bookings?.reduce((acc, curr) => acc + Number(curr.depositAmount), 0) || 0,
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Booking Management">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Booking Management" subtitle="Platform-wide reservation ledger">

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="stat-card">
          <CardContent className="p-6">
            <p className="stat-label">Total Bookings</p>
            <p className="stat-value">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <p className="stat-label">Confirmed</p>
            <p className="stat-value stat-value-success">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <p className="stat-label">Pending Review</p>
            <p className="stat-value" style={{ color: 'var(--signal-warning)' }}>{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <p className="stat-label">Total Volume</p>
            <p className="stat-value stat-value-gold">{formatCurrency(stats.volume)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-light"
              data-testid="input-search-bookings"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                <Filter className="w-4 h-4 mr-2 text-[var(--text-muted)]" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings Table */}
        <Card className="card-white overflow-hidden">
          <div className="min-w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer / ID</th>
                  <th className="px-6 py-4 font-medium">Artist</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Deposit</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredBookings && filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="table-row cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--text-primary)]">{booking.customerName}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">#{(booking.id ?? "N/A").slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--brand-primary)]">
                            {(booking.artist?.displayName ?? "U").slice(0, 1)}
                          </div>
                          <span className="text-[var(--text-secondary)]">{booking.artist?.displayName ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[var(--text-primary)]">
                          {new Date(booking.slotDatetime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {new Date(booking.slotDatetime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[var(--text-primary)]">
                        {formatCurrency(Number(booking.depositAmount))}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 rounded-full bg-[var(--bg-surface)]">
                          <Search className="w-6 h-6" />
                        </div>
                        <p>No bookings matching your criteria found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{selectedBooking.customerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                    <a href={`mailto:${selectedBooking.customerEmail}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">
                      {selectedBooking.customerEmail}
                    </a>
                  </div>
                  {selectedBooking.customerPhone && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-[var(--text-muted)]" />
                      <a href={`tel:${selectedBooking.customerPhone}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">
                        {selectedBooking.customerPhone}
                      </a>
                    </div>
                  )}
                </div>
                {getStatusBadge(selectedBooking.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Schedule</p>
                  <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                    <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
                    {new Date(selectedBooking.slotDatetime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-secondary)]">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedBooking.slotDatetime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Financials</p>
                  <p className="font-mono text-lg font-medium text-[var(--text-primary)]">{formatCurrency(Number(selectedBooking.depositAmount))}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Deposit Paid</p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="p-4 rounded-lg bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide font-semibold">Customer Notes</p>
                  <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">"{selectedBooking.notes}"</p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-subtle)]">
                {selectedBooking.status === "pending" && selectedBooking.id && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          bookingId: selectedBooking.id as string,
                          status: "confirmed",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      className="btn-success"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Booking
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          bookingId: selectedBooking.id as string,
                          status: "cancelled",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      className="border-[var(--signal-error)]/30 text-[var(--signal-error)] hover:bg-[var(--signal-error)]/10"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}
                {selectedBooking.status === "confirmed" && selectedBooking.id && (
                  <Button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        bookingId: selectedBooking.id as string,
                        status: "completed",
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                    className="w-full btn-primary"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Session Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
