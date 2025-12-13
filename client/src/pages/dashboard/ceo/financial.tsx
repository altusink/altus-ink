/**
 * ALTUS INK - FINANCIAL ENGINE (ENTERPRISE)
 * Real-time Ledger, Payouts, Multi-currency Support
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseStat
} from "@/components/ui/enterprise-core";
import { DesignSystem } from "@/lib/enterprise-design";

export default function CEOFinancialPage() {
  return (
    <div className="space-y-8 pb-32">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-display font-bold text-white mb-2">Financial Engine</h1>
        <p className="text-neutral-400">Ledger, Tax, and Payout Management.</p>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnterpriseStat
          label="Total Balance"
          value="€284,500.00"
          trend="+12%"
          trendUp={true}
          icon={DesignSystem.icons.chart}
          glowColor="gold"
        />
        <EnterpriseStat
          label="Pending Payouts"
          value="€12,450.00"
          trend="Due Today"
          trendUp={false}
          icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"
          glowColor="cyan"
        />
        <EnterpriseStat
          label="Est. Tax Reserve"
          value="€4,200.00"
          trend="Automated"
          trendUp={true}
          icon="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
          glowColor="purple" // Fixed invalid glow color
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Transaction Ledger */}
        <EnterpriseCard>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Live Ledger</h3>
            <EnterpriseButton variant="glass" size="sm">Export CSV</EnterpriseButton>
          </div>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <div className="font-medium text-white">Booking Deposit #TX-882{i}</div>
                  <div className="text-xs text-neutral-500">Stripe • 2 mins ago</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-brand-success">+€150.00</div>
                  <div className="text-xs text-neutral-500">Cleared</div>
                </div>
              </div>
            ))}
          </div>
        </EnterpriseCard>

        {/* Payout Controls */}
        <EnterpriseCard>
          <h3 className="text-xl font-bold mb-6">Payout Controls</h3>
          <div className="p-6 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 mb-6">
            <div className="text-sm text-neutral-400 mb-1">Available for Payout</div>
            <div className="text-4xl font-mono font-bold text-white mb-6">€12,450.00</div>
            <EnterpriseButton variant="neon" size="lg" className="w-full">
              Initiate Mass Payout
            </EnterpriseButton>
            <div className="mt-4 text-xs text-center text-neutral-500">
              Next auto-payout scheduled for Friday, 12:00 AM
            </div>
          </div>
        </EnterpriseCard>
      </div>
    </div>
  );
}
