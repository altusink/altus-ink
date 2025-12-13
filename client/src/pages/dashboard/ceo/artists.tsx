/**
 * ALTUS INK - ARTIST MANAGEMENT (ENTERPRISE)
 * 120fps Glass Layout, 3D Grids, Drag-and-Drop Scheduling
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseInput,
  EnterpriseStat
} from "@/components/ui/enterprise-core";
import { DesignSystem } from "@/lib/enterprise-design";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Icon Wrapper
const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
);

export default function CEOArtistsPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const { data: artists } = useQuery({
    queryKey: ["/api/ceo/artists"],
    queryFn: async () => {
      // Mock for UI Dev - real fetch: (await apiRequest("GET", "/api/ceo/artists")).json();
      return [
        { id: 1, name: "Danilo Santos", role: "Resident", style: "Blackwork", status: "active", revenue: "€18,500" },
        { id: 2, name: "Ana Ink", role: "Guest", style: "Fine Line", status: "touring", revenue: "€12,200" },
        { id: 3, name: "Carlos Art", role: "Resident", style: "Realism", status: "active", revenue: "€9,800" },
      ];
    }
  });

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Artist Roster</h1>
          <p className="text-neutral-400">Manage talent, guest spots, and commission rates.</p>
        </div>
        <EnterpriseButton variant="neon" size="md">
          + Invite Artist
        </EnterpriseButton>
      </div>

      {/* 3D Grid of Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists?.map((artist: any, i: number) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <EnterpriseCard className="relative overflow-hidden h-full hover:border-brand-primary/50 transition-colors duration-500">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-brand-primary/30 p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-xl font-bold">
                    {artist.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">{artist.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{artist.role}</span>
                    <span>•</span>
                    <span>{artist.style}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="p-3 rounded bg-black/20 border border-white/5">
                  <div className="text-xs text-neutral-500 uppercase">Revenue (Mo)</div>
                  <div className="text-lg font-mono text-brand-gold">{artist.revenue}</div>
                </div>
                <div className="p-3 rounded bg-black/20 border border-white/5">
                  <div className="text-xs text-neutral-500 uppercase">Status</div>
                  <div className={`text-sm font-bold uppercase ${artist.status === "active" ? "text-brand-success" : "text-brand-warning"}`}>
                    {artist.status}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 relative z-10">
                <EnterpriseButton variant="glass" size="sm" className="flex-1">Profile</EnterpriseButton>
                <EnterpriseButton variant="glass" size="sm" className="flex-1">Calendar</EnterpriseButton>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-[60px] group-hover:bg-brand-primary/20 transition-all duration-700" />
            </EnterpriseCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
