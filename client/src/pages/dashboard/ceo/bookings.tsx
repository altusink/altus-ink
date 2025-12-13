/**
 * ALTUS INK - CEO BOOKING MANAGEMENT DASHBOARD
 * Enterprise-grade Kanban board with real-time booking management
 * 
 * Features:
 * - Kanban board with drag-and-drop (visual)
 * - Booking status tracking
 * - Quick actions (approve, reschedule, cancel)
 * - Real-time stats and filters
 * - Mobile-responsive design
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseStatCard,
  EnterprisePageHeader,
} from "@/components/ui/enterprise-core";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Check,
  X,
  Filter,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Timer,
  RefreshCw,
  MoreVertical,
} from "lucide-react";

// Types
interface Booking {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  tattooDescription: string;
  artistName: string;
  artistId: string;
  datetime: string;
  duration: number;
  amount: number;
  currency: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
}

// Mock data for demonstration
const mockBookings: Booking[] = [
  { id: "1", code: "REQ-1001", customerName: "Alex Turner", customerEmail: "alex@email.com", tattooDescription: "Minimalist geometric arm piece", artistName: "Danilo Santos", artistId: "a1", datetime: "2024-12-14T14:00:00", duration: 3, amount: 350, currency: "EUR", status: "pending" },
  { id: "2", code: "REQ-1002", customerName: "Maria Silva", customerEmail: "maria@email.com", tattooDescription: "Traditional Japanese sleeve", artistName: "Lucas Mendes", artistId: "a2", datetime: "2024-12-15T10:00:00", duration: 8, amount: 1200, currency: "EUR", status: "pending" },
  { id: "3", code: "REQ-1003", customerName: "John Wright", customerEmail: "john@email.com", tattooDescription: "Small script tattoo", artistName: "Danilo Santos", artistId: "a1", datetime: "2024-12-14T16:00:00", duration: 1, amount: 100, currency: "EUR", status: "confirmed" },
  { id: "4", code: "REQ-1004", customerName: "Emma Brown", customerEmail: "emma@email.com", tattooDescription: "Watercolor flower", artistName: "Ana Costa", artistId: "a3", datetime: "2024-12-14T11:00:00", duration: 4, amount: 450, currency: "EUR", status: "confirmed" },
  { id: "5", code: "REQ-1005", customerName: "Pedro Alves", customerEmail: "pedro@email.com", tattooDescription: "Blackwork mandala", artistName: "Lucas Mendes", artistId: "a2", datetime: "2024-12-13T10:00:00", duration: 6, amount: 800, currency: "EUR", status: "in_progress" },
  { id: "6", code: "REQ-1006", customerName: "Sophie Martin", customerEmail: "sophie@email.com", tattooDescription: "Fine line portrait", artistName: "Ana Costa", artistId: "a3", datetime: "2024-12-13T09:00:00", duration: 2, amount: 250, currency: "EUR", status: "completed" },
  { id: "7", code: "REQ-1007", customerName: "Carlos Dias", customerEmail: "carlos@email.com", tattooDescription: "Neo-traditional tiger", artistName: "Danilo Santos", artistId: "a1", datetime: "2024-12-12T14:00:00", duration: 5, amount: 600, currency: "EUR", status: "completed" },
];

const statusConfig = {
  pending: { label: "New Requests", color: "brand-primary", icon: Timer, bgClass: "bg-brand-primary/10", borderClass: "border-l-brand-primary" },
  confirmed: { label: "Confirmed", color: "brand-success", icon: CheckCircle2, bgClass: "bg-brand-success/10", borderClass: "border-l-brand-success" },
  in_progress: { label: "In Progress", color: "brand-secondary", icon: RefreshCw, bgClass: "bg-brand-secondary/10", borderClass: "border-l-brand-secondary" },
  completed: { label: "Completed", color: "neutral-400", icon: Check, bgClass: "bg-neutral-800", borderClass: "border-l-neutral-500" },
  cancelled: { label: "Cancelled", color: "brand-error", icon: X, bgClass: "bg-brand-error/10", borderClass: "border-l-brand-error" },
};

export default function CEOBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Group bookings by status
  const groupedBookings = useMemo(() => {
    const filtered = mockBookings.filter((b) => {
      const matchesSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tattooDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArtist = !selectedArtist || b.artistId === selectedArtist;
      return matchesSearch && matchesArtist;
    });

    return {
      pending: filtered.filter((b) => b.status === "pending"),
      confirmed: filtered.filter((b) => b.status === "confirmed"),
      in_progress: filtered.filter((b) => b.status === "in_progress"),
      completed: filtered.filter((b) => b.status === "completed" || b.status === "cancelled"),
    };
  }, [searchQuery, selectedArtist]);

  // Stats
  const stats = useMemo(() => ({
    totalToday: mockBookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length,
    pendingApproval: mockBookings.filter((b) => b.status === "pending").length,
    totalRevenue: mockBookings.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + b.amount, 0),
    completionRate: Math.round((mockBookings.filter((b) => b.status === "completed").length / mockBookings.length) * 100),
  }), []);

  const artists = [
    { id: "a1", name: "Danilo Santos" },
    { id: "a2", name: "Lucas Mendes" },
    { id: "a3", name: "Ana Costa" },
  ];

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <EnterprisePageHeader
        title="Booking Control Center"
        description="Manage all booking requests and appointments across your studio network."
      />

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <EnterpriseStatCard
          label="Today's Sessions"
          value={stats.totalToday.toString()}
          icon={<Calendar className="w-5 h-5 text-brand-primary" />}
        />
        <EnterpriseStatCard
          label="Pending Approval"
          value={stats.pendingApproval.toString()}
          trend={{ value: 2, isPositive: false }}
          icon={<AlertCircle className="w-5 h-5 text-brand-primary" />}
        />
        <EnterpriseStatCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          trend={{ value: 5, isPositive: true }}
          icon={<CheckCircle2 className="w-5 h-5 text-brand-success" />}
        />
        <EnterpriseStatCard
          label="Revenue (Week)"
          value={`€${stats.totalRevenue.toLocaleString()}`}
          trend={{ value: 12, isPositive: true }}
          icon={<DollarSign className="w-5 h-5 text-brand-secondary" />}
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search bookings by name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedArtist || ""}
            onChange={(e) => setSelectedArtist(e.target.value || null)}
            className="px-4 py-2.5 bg-neutral-900/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          >
            <option value="">All Artists</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <EnterpriseButton variant="glass" size="md">
            <Filter className="w-4 h-4 mr-2" /> More Filters
          </EnterpriseButton>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[500px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {(["pending", "confirmed", "in_progress", "completed"] as const).map((status, colIndex) => {
          const config = statusConfig[status];
          const bookings = groupedBookings[status];
          const Icon = config.icon;

          return (
            <div key={status} className="flex flex-col">
              {/* Column Header */}
              <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${config.bgClass}`}>
                <Icon className={`w-4 h-4 text-${config.color}`} />
                <span className="font-semibold text-white text-sm">{config.label}</span>
                <span className={`ml-auto text-xs font-mono bg-${config.color}/20 text-${config.color} px-2 py-0.5 rounded-full`}>
                  {bookings.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                <AnimatePresence>
                  {bookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: colIndex * 0.1 + index * 0.05 }}
                    >
                      <EnterpriseCard
                        className={`p-4 cursor-pointer hover:border-brand-primary/50 transition-all border-l-4 ${config.borderClass}`}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-mono text-${config.color}`}>
                            {booking.code}
                          </span>
                          <button className="text-neutral-500 hover:text-white p-1">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Content */}
                        <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">
                          {booking.tattooDescription}
                        </h4>
                        <p className="text-xs text-neutral-400 mb-3 flex items-center gap-1">
                          <User className="w-3 h-3" /> {booking.customerName}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(booking.datetime).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                          </span>
                          <span className="font-semibold text-brand-secondary">
                            €{booking.amount}
                          </span>
                        </div>

                        {/* Artist Badge */}
                        <div className="mt-3 pt-3 border-t border-neutral-700/50">
                          <span className="text-xs text-neutral-500">Artist: </span>
                          <span className="text-xs text-white">{booking.artistName}</span>
                        </div>

                        {/* Quick Actions for Pending */}
                        {status === "pending" && (
                          <div className="mt-3 flex gap-2">
                            <EnterpriseButton variant="success" size="sm" className="flex-1">
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </EnterpriseButton>
                            <EnterpriseButton variant="ghost" size="sm" className="flex-1">
                              <X className="w-3 h-3 mr-1" /> Decline
                            </EnterpriseButton>
                          </div>
                        )}
                      </EnterpriseCard>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {bookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                    <Icon className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No bookings</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Booking Detail Modal (Simplified) */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-lg w-full"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-mono text-brand-primary">{selectedBooking.code}</span>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedBooking.tattooDescription}</h2>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-neutral-400 hover:text-white p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-neutral-500" />
                  <span className="text-white">{selectedBooking.customerName}</span>
                  <span className="text-neutral-500">{selectedBooking.customerEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span className="text-white">
                    {new Date(selectedBooking.datetime).toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span className="text-white">{selectedBooking.duration}h session</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-neutral-500" />
                  <span className="text-white font-bold">€{selectedBooking.amount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedBooking.status === "pending" && (
                  <>
                    <EnterpriseButton variant="success" className="flex-1">
                      <Check className="w-4 h-4 mr-2" /> Approve Booking
                    </EnterpriseButton>
                    <EnterpriseButton variant="danger" className="flex-1">
                      <X className="w-4 h-4 mr-2" /> Decline
                    </EnterpriseButton>
                  </>
                )}
                {selectedBooking.status === "confirmed" && (
                  <>
                    <EnterpriseButton variant="primary" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" /> Reschedule
                    </EnterpriseButton>
                    <EnterpriseButton variant="ghost" className="flex-1">
                      Contact Client
                    </EnterpriseButton>
                  </>
                )}
                {(selectedBooking.status === "completed" || selectedBooking.status === "in_progress") && (
                  <EnterpriseButton variant="glass" className="flex-1">
                    View Details <ChevronRight className="w-4 h-4 ml-2" />
                  </EnterpriseButton>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
