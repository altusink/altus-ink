/**
 * ALTUS INK - ARTIST DASHBOARD (ENTERPRISE)
 * The main view for artists. Focus on schedule and earnings.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseStat
} from "@/components/ui/enterprise-core";
import { DesignSystem } from "@/lib/enterprise-design";
import { useAuth } from "@/hooks/useAuth";

export default function ArtistDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">My Studio</h1>
          <p className="text-neutral-400">Welcome back, {user?.firstName}. Let's create art.</p>
        </div>
        <EnterpriseButton variant="neon" size="md">
          Open Calendar
        </EnterpriseButton>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnterpriseStat
          label="This Month"
          value="€4,250"
          trend="On Track"
          trendUp={true}
          icon={DesignSystem.icons.chart}
          glowColor="green"
        />
        <EnterpriseStat
          label="Upcoming"
          value="8 Clients"
          trend="Next: 2PM"
          trendUp={true}
          icon={DesignSystem.icons.calendar}
          glowColor="blue"
        />
        <EnterpriseStat
          label="Reputation"
          value="5.0"
          trend="Superstar"
          trendUp={true}
          icon={DesignSystem.icons.star}
          glowColor="gold"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <EnterpriseCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-brand-primary/10 blur-[80px] rounded-full point-events-none" />
          <h3 className="text-xl font-bold mb-6 relative z-10">Today's Session</h3>

          <div className="relative z-10 space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-l-4 border-l-brand-primary border-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl font-bold text-white">2:00 PM</span>
                <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary text-xs font-bold uppercase">Confirmed</span>
              </div>
              <h4 className="text-lg font-medium text-white">Full Sleeve - Session 3</h4>
              <p className="text-neutral-400 text-sm mb-4">Client: Sarah Jenkins</p>

              <div className="flex gap-2">
                <EnterpriseButton variant="glass" size="sm">View Design</EnterpriseButton>
                <EnterpriseButton variant="glass" size="sm">Client Notes</EnterpriseButton>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 opacity-50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg font-bold text-white">5:30 PM</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-400 text-xs font-bold uppercase">Break</span>
              </div>
            </div>
          </div>
        </EnterpriseCard>

        {/* Portfolio Quick Access */}
        <EnterpriseCard>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">My Portfolio</h3>
            <span className="text-sm text-neutral-500">128 Items</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-neutral-800 border border-white/5 relative overflow-hidden group cursor-pointer">
                {/* Placeholder for image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          <EnterpriseButton variant="ghost" className="w-full mt-4">
            Manage Portfolio
          </EnterpriseButton>
        </EnterpriseCard>
      </div>
    </div>
  );
}
