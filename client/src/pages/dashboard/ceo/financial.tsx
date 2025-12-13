/**
 * CEO FINANCIAL DASHBOARD
 * Revenue tracking, payout management, and financial analytics
 * 
 * Features:
 * - Revenue overview and trends
 * - Pending payouts management
 * - Artist earnings breakdown
 * - Transaction history
 * - Commission tracking
 * - Export reports
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Euro,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Filter,
  Search,
  Users,
  BarChart3,
  PieChart,
  FileText,
  Send
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface RevenueStats {
  totalRevenue: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  platformCommission: number;
  artistPayouts: number;
  pendingPayouts: number;
  processingFees: number;
}

interface PendingPayout {
  id: string;
  artistId: string;
  artistName: string;
  artistEmail: string;
  amount: number;
  bookingsCount: number;
  periodStart: string;
  periodEnd: string;
  status: "pending" | "processing" | "completed" | "failed";
  stripeAccountId?: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: "payment" | "payout" | "refund" | "fee";
  description: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
  artistName?: string;
  customerName?: string;
  bookingId?: string;
  createdAt: string;
}

interface ArtistEarning {
  artistId: string;
  artistName: string;
  totalRevenue: number;
  commission: number;
  netEarnings: number;
  bookingsCount: number;
  pendingPayout: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  commission: number;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockStats: RevenueStats = {
  totalRevenue: 287500,
  thisMonth: 42350,
  lastMonth: 38920,
  growth: 8.8,
  platformCommission: 43125,
  artistPayouts: 244375,
  pendingPayouts: 12450,
  processingFees: 8325
};

const mockPendingPayouts: PendingPayout[] = [
  {
    id: "PO001",
    artistId: "A001",
    artistName: "Danilo Santos",
    artistEmail: "danilo@altusink.com",
    amount: 4250,
    bookingsCount: 12,
    periodStart: "2024-12-01",
    periodEnd: "2024-12-15",
    status: "pending",
    stripeAccountId: "acct_1234",
    createdAt: "2024-12-15T10:00:00Z"
  },
  {
    id: "PO002",
    artistId: "A002",
    artistName: "Ana Ink",
    artistEmail: "ana@altusink.com",
    amount: 3200,
    bookingsCount: 9,
    periodStart: "2024-12-01",
    periodEnd: "2024-12-15",
    status: "pending",
    stripeAccountId: "acct_5678",
    createdAt: "2024-12-15T10:00:00Z"
  },
  {
    id: "PO003",
    artistId: "A003",
    artistName: "Carlos Art",
    artistEmail: "carlos@altusink.com",
    amount: 2800,
    bookingsCount: 8,
    periodStart: "2024-12-01",
    periodEnd: "2024-12-15",
    status: "pending",
    createdAt: "2024-12-15T10:00:00Z"
  },
  {
    id: "PO004",
    artistId: "A004",
    artistName: "Sofia Tattoo",
    artistEmail: "sofia@altusink.com",
    amount: 2200,
    bookingsCount: 6,
    periodStart: "2024-12-01",
    periodEnd: "2024-12-15",
    status: "pending",
    stripeAccountId: "acct_9012",
    createdAt: "2024-12-15T10:00:00Z"
  }
];

const mockTransactions: Transaction[] = [
  {
    id: "TXN001",
    type: "payment",
    description: "Booking deposit",
    amount: 150,
    status: "succeeded",
    customerName: "Maria Silva",
    artistName: "Danilo Santos",
    bookingId: "BK001",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "TXN002",
    type: "payout",
    description: "Artist payout",
    amount: -3200,
    status: "succeeded",
    artistName: "Ana Ink",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "TXN003",
    type: "refund",
    description: "Booking cancellation refund",
    amount: -100,
    status: "succeeded",
    customerName: "João Costa",
    bookingId: "BK089",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "TXN004",
    type: "payment",
    description: "Booking deposit",
    amount: 200,
    status: "succeeded",
    customerName: "Pedro Almeida",
    artistName: "Carlos Art",
    bookingId: "BK002",
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "TXN005",
    type: "fee",
    description: "Stripe processing fee",
    amount: -5.65,
    status: "succeeded",
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  }
];

const mockArtistEarnings: ArtistEarning[] = [
  { artistId: "A001", artistName: "Danilo Santos", totalRevenue: 18750, commission: 2812, netEarnings: 15938, bookingsCount: 48, pendingPayout: 4250 },
  { artistId: "A002", artistName: "Ana Ink", totalRevenue: 15320, commission: 2298, netEarnings: 13022, bookingsCount: 42, pendingPayout: 3200 },
  { artistId: "A003", artistName: "Carlos Art", totalRevenue: 12890, commission: 1934, netEarnings: 10956, bookingsCount: 35, pendingPayout: 2800 },
  { artistId: "A004", artistName: "Sofia Tattoo", totalRevenue: 11200, commission: 1680, netEarnings: 9520, bookingsCount: 32, pendingPayout: 2200 },
  { artistId: "A005", artistName: "Miguel Black", totalRevenue: 9870, commission: 1481, netEarnings: 8389, bookingsCount: 28, pendingPayout: 0 }
];

const mockMonthlyRevenue: MonthlyRevenue[] = [
  { month: "Jul", revenue: 32500, commission: 4875 },
  { month: "Aug", revenue: 35200, commission: 5280 },
  { month: "Sep", revenue: 38900, commission: 5835 },
  { month: "Oct", revenue: 41200, commission: 6180 },
  { month: "Nov", revenue: 38920, commission: 5838 },
  { month: "Dec", revenue: 42350, commission: 6353 }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(amount);
};

const formatCurrencyDetailed = (amount: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
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
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  color = "primary"
}: {
  title: string;
  value: string;
  subValue?: string;
  icon: any;
  trend?: "up" | "down";
  trendValue?: string;
  color?: "primary" | "success" | "warning" | "gold";
}) {
  const colors = {
    primary: { bg: "bg-[var(--brand-primary)]/10", text: "text-[var(--brand-primary)]" },
    success: { bg: "bg-[var(--signal-success)]/10", text: "text-[var(--signal-success)]" },
    warning: { bg: "bg-[var(--signal-warning)]/10", text: "text-[var(--signal-warning)]" },
    gold: { bg: "bg-[var(--brand-gold)]/10", text: "text-[var(--brand-gold)]" }
  };

  return (
    <Card className="stat-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl ${colors[color].bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colors[color].text}`} />
          </div>
          {trend && trendValue && (
            <Badge className={trend === "up" ? "badge-success" : "badge-error"}>
              {trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trendValue}
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{title}</p>
          {subValue && (
            <p className="text-xs text-[var(--text-muted)] mt-2">{subValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.month} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">{item.month}</span>
            <span className="font-medium text-[var(--text-primary)]">{formatCurrency(item.revenue)}</span>
          </div>
          <div className="relative h-8 bg-[var(--bg-surface)] rounded-lg overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)]/70 rounded-lg transition-all"
              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
            ></div>
            <div
              className="absolute inset-y-0 left-0 bg-[var(--brand-gold)] rounded-lg"
              style={{ width: `${(item.commission / maxRevenue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
      <div className="flex gap-4 text-xs mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--brand-primary)]"></div>
          <span className="text-[var(--text-muted)]">Total Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--brand-gold)]"></div>
          <span className="text-[var(--text-muted)]">Platform Commission</span>
        </div>
      </div>
    </div>
  );
}

function PayoutRow({ payout, selected, onSelect, onProcess }: {
  payout: PendingPayout;
  selected: boolean;
  onSelect: (id: string) => void;
  onProcess: (payout: PendingPayout) => void;
}) {
  const hasStripe = !!payout.stripeAccountId;

  return (
    <TableRow className="table-row">
      <TableCell>
        <Checkbox checked={selected} onCheckedChange={() => onSelect(payout.id)} disabled={!hasStripe} />
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-[var(--text-primary)]">{payout.artistName}</p>
          <p className="text-sm text-[var(--text-muted)]">{payout.artistEmail}</p>
        </div>
      </TableCell>
      <TableCell className="font-mono font-semibold text-[var(--signal-success)]">
        {formatCurrencyDetailed(payout.amount)}
      </TableCell>
      <TableCell className="text-[var(--text-secondary)]">
        {payout.bookingsCount} bookings
      </TableCell>
      <TableCell className="text-[var(--text-secondary)] text-sm">
        {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
      </TableCell>
      <TableCell>
        {hasStripe ? (
          <Badge className="badge-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Stripe Connected
          </Badge>
        ) : (
          <Badge className="badge-warning">
            <AlertCircle className="w-3 h-3 mr-1" />
            No Stripe
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onProcess(payout)}
          disabled={!hasStripe}
        >
          <Send className="w-4 h-4 mr-1" />
          Process
        </Button>
      </TableCell>
    </TableRow>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const typeIcons = {
    payment: { icon: ArrowDownRight, color: "text-[var(--signal-success)]", bg: "bg-[var(--signal-success)]/10" },
    payout: { icon: ArrowUpRight, color: "text-[var(--brand-primary)]", bg: "bg-[var(--brand-primary)]/10" },
    refund: { icon: ArrowUpRight, color: "text-[var(--signal-warning)]", bg: "bg-[var(--signal-warning)]/10" },
    fee: { icon: CreditCard, color: "text-[var(--text-muted)]", bg: "bg-[var(--bg-surface)]" }
  };

  const style = typeIcons[transaction.type];
  const Icon = style.icon;

  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${style.color}`} />
        </div>
        <div>
          <p className="font-medium text-[var(--text-primary)]">{transaction.description}</p>
          <p className="text-sm text-[var(--text-muted)]">
            {transaction.customerName && `${transaction.customerName} → `}
            {transaction.artistName || "Platform"}
            {transaction.bookingId && ` • ${transaction.bookingId}`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-mono font-semibold ${transaction.amount >= 0 ? "text-[var(--signal-success)]" : "text-[var(--text-primary)]"
          }`}>
          {transaction.amount >= 0 ? "+" : ""}{formatCurrencyDetailed(transaction.amount)}
        </p>
        <p className="text-xs text-[var(--text-muted)]">{getRelativeTime(transaction.createdAt)}</p>
      </div>
    </div>
  );
}

function ProcessPayoutModal({ payouts, open, onOpenChange, onConfirm }: {
  payouts: PendingPayout[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulate API call
    setProcessing(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">
            Process Payouts
          </DialogTitle>
          <DialogDescription>
            Review and confirm the following payouts
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 rounded-lg bg-[var(--bg-surface)] text-center">
            <p className="text-sm text-[var(--text-muted)]">Total Amount</p>
            <p className="text-3xl font-bold text-[var(--signal-success)]">{formatCurrencyDetailed(totalAmount)}</p>
            <p className="text-sm text-[var(--text-muted)]">{payouts.length} artist{payouts.length > 1 ? "s" : ""}</p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex justify-between p-3 rounded-lg border border-[var(--border-subtle)]">
                <span className="text-[var(--text-primary)]">{payout.artistName}</span>
                <span className="font-mono font-medium text-[var(--signal-success)]">
                  {formatCurrencyDetailed(payout.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[var(--signal-warning)]/10 border border-[var(--signal-warning)]/20">
            <p className="text-sm text-[var(--signal-warning)]">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Payouts will be processed immediately via Stripe Connect
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="btn-success" disabled={processing}>
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Confirm Payouts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CEOFinancial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [stats] = useState<RevenueStats>(mockStats);
  const [pendingPayouts] = useState<PendingPayout[]>(mockPendingPayouts);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [artistEarnings] = useState<ArtistEarning[]>(mockArtistEarnings);
  const [monthlyRevenue] = useState<MonthlyRevenue[]>(mockMonthlyRevenue);

  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(new Set());
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("month");

  // Handlers
  const handleSelectPayout = (id: string) => {
    setSelectedPayouts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const validPayouts = pendingPayouts.filter(p => p.stripeAccountId);
      setSelectedPayouts(new Set(validPayouts.map(p => p.id)));
    } else {
      setSelectedPayouts(new Set());
    }
  };

  const handleProcessSelected = () => {
    if (selectedPayouts.size > 0) {
      setProcessModalOpen(true);
    }
  };

  const handleConfirmProcess = () => {
    console.log("Processing payouts:", Array.from(selectedPayouts));
    setProcessModalOpen(false);
    setSelectedPayouts(new Set());
    // Would call API
  };

  const selectedPayoutsList = pendingPayouts.filter(p => selectedPayouts.has(p.id));
  const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout title="Financial Overview" subtitle="Revenue, payouts, and analytics">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={Euro}
          color="gold"
          trend="up"
          trendValue={`+${stats.growth}%`}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats.thisMonth)}
          subValue={`Last month: ${formatCurrency(stats.lastMonth)}`}
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Platform Commission"
          value={formatCurrency(stats.platformCommission)}
          subValue="15% average"
          icon={Wallet}
          color="primary"
        />
        <StatCard
          title="Pending Payouts"
          value={formatCurrency(stats.pendingPayouts)}
          subValue={`${pendingPayouts.length} artists`}
          icon={Clock}
          color="warning"
        />
      </div>

      <Tabs defaultValue="payouts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="artists">Artist Earnings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card className="card-white">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                    Pending Payouts
                  </CardTitle>
                  <CardDescription>
                    Total pending: {formatCurrencyDetailed(totalPendingAmount)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedPayouts.size > 0 && (
                    <Button onClick={handleProcessSelected} className="btn-success">
                      <Send className="w-4 h-4 mr-2" />
                      Process Selected ({selectedPayouts.size})
                    </Button>
                  )}
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPayouts.size === pendingPayouts.filter(p => p.stripeAccountId).length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayouts.map((payout) => (
                    <PayoutRow
                      key={payout.id}
                      payout={payout}
                      selected={selectedPayouts.has(payout.id)}
                      onSelect={handleSelectPayout}
                      onProcess={(p) => {
                        setSelectedPayouts(new Set([p.id]));
                        setProcessModalOpen(true);
                      }}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="card-white">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                  Recent Transactions
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artist Earnings Tab */}
        <TabsContent value="artists">
          <Card className="card-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Artist Earnings Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>Artist</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Commission (15%)</TableHead>
                    <TableHead className="text-right">Net Earnings</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artistEarnings.map((artist) => (
                    <TableRow key={artist.artistId} className="table-row">
                      <TableCell className="font-medium text-[var(--text-primary)]">
                        {artist.artistName}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(artist.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[var(--brand-gold)]">
                        {formatCurrency(artist.commission)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[var(--signal-success)]">
                        {formatCurrency(artist.netEarnings)}
                      </TableCell>
                      <TableCell className="text-right text-[var(--text-secondary)]">
                        {artist.bookingsCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {artist.pendingPayout > 0 ? (
                          <Badge className="badge-warning">{formatCurrency(artist.pendingPayout)}</Badge>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="card-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={monthlyRevenue} />
              </CardContent>
            </Card>

            <Card className="card-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Artist Payouts</span>
                  <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(stats.artistPayouts)}</span>
                </div>
                <Progress value={(stats.artistPayouts / stats.totalRevenue) * 100} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Platform Commission</span>
                  <span className="font-semibold text-[var(--brand-gold)]">{formatCurrency(stats.platformCommission)}</span>
                </div>
                <Progress value={(stats.platformCommission / stats.totalRevenue) * 100} className="h-2 [&>div]:bg-[var(--brand-gold)]" />

                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Processing Fees</span>
                  <span className="font-semibold text-[var(--text-muted)]">{formatCurrency(stats.processingFees)}</span>
                </div>
                <Progress value={(stats.processingFees / stats.totalRevenue) * 100} className="h-2 [&>div]:bg-[var(--text-muted)]" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Process Modal */}
      <ProcessPayoutModal
        payouts={selectedPayoutsList}
        open={processModalOpen}
        onOpenChange={setProcessModalOpen}
        onConfirm={handleConfirmProcess}
      />
    </DashboardLayout>
  );
}
