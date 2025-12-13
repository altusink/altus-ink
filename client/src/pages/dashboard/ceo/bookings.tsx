/**
 * ALTUS INK - BOOKING MANAGEMENT (ENTERPRISE)
 * Kanban-style board for booking management.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  EnterpriseCard,
  EnterpriseButton,
} from "@/components/ui/enterprise-core";

export default function CEOBookingsPage() {
  return (
    <div className="space-y-8 pb-32">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-display font-bold text-white mb-2">Bookings Control</h1>
        <p className="text-neutral-400">Manage incoming requests and active sessions.</p>
      </motion.div>

      {/* Kanban Board Container (Mockup for Visual) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">

        {/* NEW REQUESTS */}
        <div className="flex flex-col gap-4">
          <div className="font-bold text-sm uppercase text-neutral-500 tracking-wider">New Requests (3)</div>
          <EnterpriseCard className="p-4 hover:border-brand-primary/50 cursor-move transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-mono text-brand-primary">#REQ-992</span>
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            </div>
            <h4 className="font-bold text-white">Minimalist Tattoo</h4>
            <p className="text-xs text-neutral-400 mb-3">Client: Alex T.</p>
            <EnterpriseButton variant="glass" size="sm" className="w-full">Review</EnterpriseButton>
          </EnterpriseCard>

          <EnterpriseCard className="p-4 hover:border-brand-primary/50 cursor-move transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-mono text-brand-primary">#REQ-991</span>
            </div>
            <h4 className="font-bold text-white">Full Back Piece</h4>
            <p className="text-xs text-neutral-400 mb-3">Client: John D.</p>
            <EnterpriseButton variant="glass" size="sm" className="w-full">Review</EnterpriseButton>
          </EnterpriseCard>
        </div>

        {/* CONFIRMED */}
        <div className="flex flex-col gap-4">
          <div className="font-bold text-sm uppercase text-neutral-500 tracking-wider">Confirmed (12)</div>
          <EnterpriseCard className="p-4 border-l-4 border-l-brand-success">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-mono text-brand-success">Dec 14, 2:00 PM</span>
            </div>
            <h4 className="font-bold text-white">Geometric Sleeve</h4>
            <p className="text-xs text-neutral-400">Artist: Danilo Santos</p>
          </EnterpriseCard>
        </div>

        {/* COMPLETED */}
        <div className="flex flex-col gap-4">
          <div className="font-bold text-sm uppercase text-neutral-500 tracking-wider">Completed (Past 24h)</div>
          <EnterpriseCard className="p-4 opacity-75">
            <h4 className="font-bold text-white line-through">Small Text</h4>
            <p className="text-xs text-neutral-400">Paid • €150.00</p>
          </EnterpriseCard>
        </div>

      </div>
    </div>
  );
}
