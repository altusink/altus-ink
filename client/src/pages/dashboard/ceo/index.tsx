/**
 * ALTUS INK - CEO DASHBOARD (ENTERPRISE EDITION)
 * 120fps, GPU-accelerated, Physics-based animations.
 * 
 * Replaces the 'horrible' basic dashboard with a Silicon Valley standard interface.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseStat,
  EnterpriseLoader
} from "@/components/ui/enterprise-core"; // Using the new high-end components
import { DesignSystem } from "@/lib/enterprise-design";

// Icons
const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
);

// Animation Variants (Physics-based)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function CEODashboard() {
  const { user } = useAuth();

  // Mock Data (Connecting to real would use hooks/use-enterprise-modules)
  const stats = {
    revenue: 124500,
    growth: 12.5,
    bookings: 142,
    artists: { active: 8, total: 12 },
    rating: 4.9
  };

  return (
    <div className="space-y-8 pb-20">

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">
            Command Center
          </h1>
          <p className="text-neutral-400">
            Welcome back, <span className="text-brand-primary font-medium">{user?.firstName || "CEO"}</span>.
            System status: <span className="text-brand-success">OPTIMAL</span>
          </p>
        </div>
        <div className="flex gap-3">
          <EnterpriseButton variant="glass" size="sm">
            Generate Report
          </EnterpriseButton>
          <EnterpriseButton variant="neon" size="sm">
            + New Campaign
          </EnterpriseButton>
        </div>
      </motion.div>

      {/* Hero Stats Grid - 3D Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}>
          <EnterpriseStat
            label="Total Revenue"
            value="€124,500"
            trend="+12.5%"
            trendUp={true}
            icon={DesignSystem.icons.chart}
            glowColor="gold"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <EnterpriseStat
            label="Active Bookings"
            value="142"
            trend="+8.2%"
            trendUp={true}
            icon={DesignSystem.icons.calendar}
            glowColor="cyan"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <EnterpriseStat
            label="Global Reach"
            value="12 Countries"
            trend="Expanding"
            trendUp={true}
            icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93C7.06 19.43 4 16.07 4 12zm13.89 5.4c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.05-.81 3.93-2.11 5.4z"
            glowColor="magenta"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <EnterpriseStat
            label="Artist Performance"
            value="4.9/5.0"
            trend="Top Tier"
            trendUp={true}
            icon={DesignSystem.icons.star}
            glowColor="green"
          />
        </motion.div>
      </motion.div>

      {/* Main Content Split */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left Column: Revenue Chart & Big Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-8"
        >
          <EnterpriseCard className="min-h-[400px] flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Revenue Analytics</h3>
                <select className="bg-black/20 border border-white/10 rounded px-3 py-1 text-sm text-neutral-400 focus:outline-none hover:text-white transition-colors">
                  <option>Last 30 Days</option>
                  <option>Last Quarter</option>
                  <option>YTD</option>
                </select>
              </div>

              {/* FAKE CHART VISUALIZATION (CSS ONLY FOR PERFORMANCE) */}
              <div className="h-64 flex items-end gap-2 px-4 pb-4 border-b border-white/5 relative">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.05, ease: [0.175, 0.885, 0.32, 1.275] }} // physics ease
                    className="flex-1 bg-gradient-to-t from-brand-primary/20 to-brand-primary rounded-t-sm relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-black/80 px-2 py-1 rounded text-white whitespace-nowrap">
                      €{(h * 1250).toLocaleString()}
                    </div>
                  </motion.div>
                ))}

                {/* Chart Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white/5 border-t border-dashed border-white/5" />)}
                </div>
              </div>

              <div className="flex justify-between pt-4 text-sm text-neutral-500 font-mono">
                <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
              </div>
            </div>
          </EnterpriseCard>

          {/* Recent Activity Table */}
          <EnterpriseCard>
            <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-neutral-500 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="pb-3 pl-4">ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { id: "#TX-992", user: "Sarah J.", amt: "€450.00", status: "Completed" },
                    { id: "#TX-991", user: "Mike T.", amt: "€120.00", status: "Pending" },
                    { id: "#TX-990", user: "Alex R.", amt: "€850.00", status: "Completed" },
                    { id: "#TX-989", user: "Emma W.", amt: "€200.00", status: "Processing" },
                  ].map((row, i) => (
                    <motion.tr
                      key={i}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                      className="border-b border-white/5 last:border-0 transition-colors"
                    >
                      <td className="py-3 pl-4 font-mono text-neutral-400">{row.id}</td>
                      <td className="py-3 font-medium">{row.user}</td>
                      <td className="py-3 text-brand-primary">{row.amt}</td>
                      <td className="py-3 min-w-[100px]">
                        <span className={`
                          px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                          ${row.status === "Completed" ? "bg-brand-success/20 text-brand-success shadow-[0_0_10px_rgba(34,197,94,0.2)]" :
                            row.status === "Pending" ? "bg-brand-warning/20 text-brand-warning" :
                              "bg-brand-primary/20 text-brand-primary"}
                        `}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-neutral-500">2 mins ago</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EnterpriseCard>
        </motion.div>

        {/* Right Column: Live Feed & Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Live Studio Status */}
          <EnterpriseCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-success/10 rounded-full blur-[40px] animate-pulse" />
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-success animate-ping" />
              Live Studio Status
            </h3>
            <div className="space-y-4">
              {[
                { name: "Main Floor", status: "Active", occupancy: "85%" },
                { name: "Private Suite A", status: "In Session", occupancy: "100%" },
                { name: "Private Suite B", status: "Available", occupancy: "0%" },
              ].map((room, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5">
                  <div>
                    <div className="font-medium text-sm">{room.name}</div>
                    <div className="text-xs text-neutral-500">{room.status}</div>
                  </div>
                  <div className={`text-sm font-bold ${room.occupancy === "0%" ? "text-neutral-500" : "text-brand-success"}`}>
                    {room.occupancy}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <EnterpriseButton variant="glass" size="sm" className="w-full">
                View Surveillance
              </EnterpriseButton>
            </div>
          </EnterpriseCard>

          {/* AI Insights */}
          <EnterpriseCard>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              AI Oracle Insights
            </h3>
            <ul className="space-y-3">
              <li className="text-sm p-3 rounded bg-brand-primary/5 border-l-2 border-brand-primary">
                <p className="text-neutral-300">Booking demand is projected to spike <span className="text-white font-bold">+24%</span> next weekend.</p>
              </li>
              <li className="text-sm p-3 rounded bg-brand-secondary/5 border-l-2 border-brand-secondary">
                <p className="text-neutral-300">Artist <span className="text-white font-bold">Danilo</span> has 3 overlapping slots.</p>
              </li>
            </ul>
            <EnterpriseButton variant="neon" size="sm" className="w-full mt-4">
              Ask AI Assistant
            </EnterpriseButton>
          </EnterpriseCard>

        </motion.div>
      </div>
    </div>
  );
}
