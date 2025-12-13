/**
 * ALTUS INK - CEO FINANCIAL DASHBOARD
 * Enterprise-grade financial management with ledger, payouts, and analytics
 * 
 * Features:
 * - Real-time ledger transactions
 * - Payout queue management
 * - Revenue breakdown by period
 * - Tax reserve tracking
 * - Multi-currency support
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
  Calendar,
  CreditCard,
  Building2,
  Users,
  Wallet,
  PiggyBank,
  Receipt,
} from "lucide-react";

// Types
interface Transaction {
  id: string;
  type: "deposit" | "payout" | "refund" | "fee";
  description: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  artistName?: string;
  paymentMethod: string;
}

interface PayoutRequest {
  id: string;
  artistName: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "processing" | "paid";
  requestedAt: string;
  payoutMethod: string;
}

// Mock data
const mockTransactions: Transaction[] = [
  { id: "1", type: "deposit", description: "Booking Deposit #TX-8821", amount: 150, currency: "EUR", status: "completed", timestamp: "2024-12-13T10:30:00", artistName: "Danilo Santos", paymentMethod: "Stripe" },
  { id: "2", type: "deposit", description: "Booking Deposit #TX-8822", amount: 350, currency: "EUR", status: "completed", timestamp: "2024-12-13T10:15:00", artistName: "Lucas Mendes", paymentMethod: "Stripe" },
  { id: "3", type: "payout", description: "Artist Payout - Danilo S.", amount: -1200, currency: "EUR", status: "completed", timestamp: "2024-12-13T09:00:00", paymentMethod: "Wise" },
  { id: "4", type: "deposit", description: "Booking Deposit #TX-8820", amount: 280, currency: "EUR", status: "pending", timestamp: "2024-12-13T08:45:00", artistName: "Ana Costa", paymentMethod: "Stripe" },
  { id: "5", type: "refund", description: "Refund #REF-442", amount: -100, currency: "EUR", status: "completed", timestamp: "2024-12-12T16:30:00", paymentMethod: "Stripe" },
  { id: "6", type: "fee", description: "Platform Fee - December", amount: -450, currency: "EUR", status: "completed", timestamp: "2024-12-12T12:00:00", paymentMethod: "Internal" },
];

const mockPayoutRequests: PayoutRequest[] = [
  { id: "1", artistName: "Danilo Santos", amount: 2450, currency: "EUR", status: "pending", requestedAt: "2024-12-13T08:00:00", payoutMethod: "Wise" },
  { id: "2", artistName: "Lucas Mendes", amount: 1800, currency: "EUR", status: "approved", requestedAt: "2024-12-12T14:00:00", payoutMethod: "PayPal" },
  { id: "3", artistName: "Ana Costa", amount: 980, currency: "EUR", status: "processing", requestedAt: "2024-12-11T10:00:00", payoutMethod: "IBAN" },
];

const typeConfig = {
  deposit: { icon: ArrowDownLeft, color: "text-brand-success", bg: "bg-brand-success/10" },
  payout: { icon: ArrowUpRight, color: "text-brand-primary", bg: "bg-brand-primary/10" },
  refund: { icon: TrendingDown, color: "text-brand-error", bg: "bg-brand-error/10" },
  fee: { icon: Receipt, color: "text-neutral-400", bg: "bg-neutral-800" },
};

const statusConfig = {
  completed: { label: "Completed", color: "text-brand-success", icon: CheckCircle },
  pending: { label: "Pending", color: "text-brand-primary", icon: Clock },
  failed: { label: "Failed", color: "text-brand-error", icon: AlertCircle },
  approved: { label: "Approved", color: "text-brand-secondary", icon: CheckCircle },
  processing: { label: "Processing", color: "text-brand-primary", icon: Clock },
  paid: { label: "Paid", color: "text-brand-success", icon: CheckCircle },
};

export default function CEOFinancialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "year">("month");
  const [activeTab, setActiveTab] = useState<"ledger" | "payouts">("ledger");

  // Stats
  const stats = useMemo(() => ({
    totalBalance: 284500,
    pendingPayouts: mockPayoutRequests.filter(p => p.status === "pending" || p.status === "approved").reduce((sum, p) => sum + p.amount, 0),
    taxReserve: 4200,
    monthlyRevenue: 48500,
    revenueChange: 12.5,
    transactionsToday: mockTransactions.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString()).length,
  }), []);

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <EnterprisePageHeader
        title="Financial Engine"
        description="Real-time ledger, tax management, and payout controls for your studio network."
      />

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <EnterpriseStatCard
          label="Total Balance"
          value={`€${stats.totalBalance.toLocaleString()}`}
          trend={{ value: stats.revenueChange, isPositive: true }}
          icon={<Wallet className="w-5 h-5 text-brand-primary" />}
        />
        <EnterpriseStatCard
          label="Pending Payouts"
          value={`€${stats.pendingPayouts.toLocaleString()}`}
          icon={<Clock className="w-5 h-5 text-brand-secondary" />}
        />
        <EnterpriseStatCard
          label="Tax Reserve"
          value={`€${stats.taxReserve.toLocaleString()}`}
          icon={<PiggyBank className="w-5 h-5 text-brand-accent" />}
        />
        <EnterpriseStatCard
          label="Monthly Revenue"
          value={`€${stats.monthlyRevenue.toLocaleString()}`}
          trend={{ value: stats.revenueChange, isPositive: true }}
          icon={<TrendingUp className="w-5 h-5 text-brand-success" />}
        />
      </motion.div>

      {/* Period Selector */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex gap-2">
          {(["day", "week", "month", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPeriod === period
                  ? "bg-brand-primary text-black"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <EnterpriseButton variant="glass" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </EnterpriseButton>
          <EnterpriseButton variant="glass" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </EnterpriseButton>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transaction Ledger */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EnterpriseCard className="p-6">
            {/* Tab Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("ledger")}
                  className={`text-lg font-bold pb-2 border-b-2 transition-colors ${activeTab === "ledger" ? "text-white border-brand-primary" : "text-neutral-500 border-transparent"
                    }`}
                >
                  Live Ledger
                </button>
                <button
                  onClick={() => setActiveTab("payouts")}
                  className={`text-lg font-bold pb-2 border-b-2 transition-colors ${activeTab === "payouts" ? "text-white border-brand-primary" : "text-neutral-500 border-transparent"
                    }`}
                >
                  Payout Queue
                </button>
              </div>
              <span className="text-xs text-neutral-500">
                {stats.transactionsToday} transactions today
              </span>
            </div>

            {/* Ledger Tab */}
            <AnimatePresence mode="wait">
              {activeTab === "ledger" && (
                <motion.div
                  key="ledger"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {mockTransactions.map((tx, index) => {
                    const TypeIcon = typeConfig[tx.type].icon;
                    const StatusIcon = statusConfig[tx.status].icon;

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${typeConfig[tx.type].bg} flex items-center justify-center`}>
                            <TypeIcon className={`w-5 h-5 ${typeConfig[tx.type].color}`} />
                          </div>
                          <div>
                            <div className="font-medium text-white">{tx.description}</div>
                            <div className="text-xs text-neutral-500 flex items-center gap-2">
                              <span>{tx.paymentMethod}</span>
                              <span>•</span>
                              <span>{new Date(tx.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                              {tx.artistName && (
                                <>
                                  <span>•</span>
                                  <span>{tx.artistName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <div className={`font-mono font-semibold ${tx.amount > 0 ? "text-brand-success" : "text-neutral-400"}`}>
                              {tx.amount > 0 ? "+" : ""}€{Math.abs(tx.amount).toLocaleString()}
                            </div>
                            <div className={`text-xs flex items-center gap-1 justify-end ${statusConfig[tx.status].color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig[tx.status].label}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Payout Queue Tab */}
              {activeTab === "payouts" && (
                <motion.div
                  key="payouts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {mockPayoutRequests.map((payout, index) => {
                    const StatusIcon = statusConfig[payout.status].icon;

                    return (
                      <motion.div
                        key={payout.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center text-white font-bold">
                            {payout.artistName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{payout.artistName}</div>
                            <div className="text-xs text-neutral-500">
                              {payout.payoutMethod} • Requested {new Date(payout.requestedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-mono font-semibold text-brand-secondary">
                              €{payout.amount.toLocaleString()}
                            </div>
                            <div className={`text-xs flex items-center gap-1 justify-end ${statusConfig[payout.status].color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig[payout.status].label}
                            </div>
                          </div>
                          {payout.status === "pending" && (
                            <div className="flex gap-2">
                              <EnterpriseButton variant="success" size="sm">Approve</EnterpriseButton>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </EnterpriseCard>
        </motion.div>

        {/* Payout Controls Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EnterpriseCard className="p-6 sticky top-4">
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>

            {/* Available Balance */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 mb-6">
              <div className="text-sm text-neutral-400 mb-1">Available for Payout</div>
              <div className="text-4xl font-mono font-bold text-white mb-4">
                €{stats.pendingPayouts.toLocaleString()}
              </div>
              <EnterpriseButton variant="neon" size="lg" className="w-full">
                <DollarSign className="w-4 h-4 mr-2" />
                Process All Payouts
              </EnterpriseButton>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-400 text-sm">Artists Paid (MTD)</span>
                <span className="font-mono text-white">12</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-400 text-sm">Avg. Processing Time</span>
                <span className="font-mono text-white">1.5h</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-400 text-sm">Platform Fee (30%)</span>
                <span className="font-mono text-brand-secondary">€14,550</span>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="mt-6 p-4 rounded-lg bg-neutral-800/30 border border-neutral-700">
              <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                <Calendar className="w-4 h-4" />
                Auto-payout Schedule
              </div>
              <div className="text-white font-medium">Every Friday at 12:00 AM</div>
              <div className="text-xs text-neutral-500 mt-1">Next: December 15, 2024</div>
            </div>
          </EnterpriseCard>
        </motion.div>
      </div>
    </div>
  );
}
