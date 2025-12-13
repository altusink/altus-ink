/**
 * ALTUS INK - ENTERPRISE LOGIN
 * Secure, high-performance gateway with Neon Glass aesthetics.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { EnterpriseButton, EnterpriseInput, EnterpriseCard, EnterpriseLoader } from "@/components/ui/enterprise-core";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { DesignSystem } from "@/lib/enterprise-design";

// Simple icon wrapper
const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
);

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome back", description: "Accessing secure environment...", duration: 2000 });
      setTimeout(() => {
        setLocation(data.user?.role === "ceo" ? "/dashboard/ceo" : "/dashboard/artist");
      }, 500);
    },
    onError: (err: any) => {
      toast({ title: "Access Denied", description: err.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex font-sans text-white overflow-hidden relative selection:bg-brand-primary/30">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon path={DesignSystem.icons.logo} className="w-10 h-10 text-brand-primary" />
              <h1 className="text-3xl font-display font-bold tracking-tight">ALTUS INK</h1>
            </div>
            <p className="text-neutral-400 text-lg">Enterprise Operating System</p>
          </motion.div>

          <EnterpriseCard className="p-8 backdrop-blur-xl bg-neutral-900/40 border-white/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Identify</label>
                  <EnterpriseInput
                    placeholder="Username"
                    value={username}
                    onChange={(e: any) => setUsername(e.target.value)}
                    disabled={loginMutation.isPending}
                    icon={<Icon path={DesignSystem.icons.user} className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Authenticate</label>
                  <EnterpriseInput
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    disabled={loginMutation.isPending}
                    icon={<Icon path="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm11 14H4V10h16v10z" className="w-4 h-4" />}
                  />
                </div>
              </div>

              <EnterpriseButton
                variant="neon"
                size="lg"
                className="w-full"
                isLoading={loginMutation.isPending}
                onClick={handleSubmit}
              >
                Establish Connection
              </EnterpriseButton>
            </form>

            {/* Demo Helpers */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-xs text-neutral-500 mb-3 uppercase tracking-wider">Quick Access</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setUsername("admin"); setPassword("admin123"); }}
                  className="p-3 rounded bg-white/5 hover:bg-white/10 transition text-left group"
                >
                  <div className="text-xs text-neutral-400 group-hover:text-white">Admin</div>
                  <div className="text-sm font-mono text-brand-primary">CEO</div>
                </button>
                <button
                  onClick={() => { setUsername("danilo"); setPassword("artist123"); }}
                  className="p-3 rounded bg-white/5 hover:bg-white/10 transition text-left group"
                >
                  <div className="text-xs text-neutral-400 group-hover:text-white">Artist</div>
                  <div className="text-sm font-mono text-brand-secondary">STAR</div>
                </button>
              </div>
            </div>
          </EnterpriseCard>

          <p className="text-center text-xs text-neutral-600">
            Protected by Altus Guard™ v2.0. All connections encrypted.
          </p>

        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:flex w-1/2 bg-neutral-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=2560')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-l from-neutral-950 via-neutral-950/80 to-transparent" />

        <div className="relative z-10 max-w-lg p-12">
          <div className="h-1 w-20 bg-brand-primary mb-8 rounded-full" />
          <h2 className="text-5xl font-display font-bold leading-tight mb-6">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Body Art</span> Management.
          </h2>
          <div className="space-y-4 text-lg text-neutral-400">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_10px_var(--color-brand-success)]" />
              <span>Real-time Global Marketplace</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_10px_var(--color-brand-accent)]" />
              <span>Predictive AI Analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-secondary shadow-[0_0_10px_var(--color-brand-secondary)]" />
              <span>Immersive 3D Studio Tours</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
