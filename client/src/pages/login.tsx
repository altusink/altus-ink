import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      setTimeout(() => {
        if (data.user?.role === "ceo") {
          setLocation("/dashboard/ceo");
        } else {
          setLocation("/dashboard/artist");
        }
      }, 300);
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-app)]">

      {/* Left Column - Form (Light) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[var(--bg-surface)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/">
            <img src="/logo-altus.png" alt="Altus Ink" className="h-10 mb-8" />
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-2 text-[var(--text-primary)] mb-2">
              Welcome Back
            </h1>
            <p className="body-base text-[var(--text-secondary)]">
              Sign in to access your dashboard and manage your bookings.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[var(--text-primary)] font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 input-light"
                disabled={loginMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[var(--text-primary)] font-medium">
                  Password
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-[var(--brand-primary)] p-0 h-auto hover:bg-transparent"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 input-light pr-12"
                  disabled={loginMutation.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 btn-primary text-base font-medium"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-lg card-white">
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Demo Accounts</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">CEO:</span>
                <code className="text-[var(--brand-primary)] font-mono bg-[var(--brand-primary)]/10 px-2 py-0.5 rounded">ceo / ceo123</code>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Artist:</span>
                <code className="text-[var(--brand-primary)] font-mono bg-[var(--brand-primary)]/10 px-2 py-0.5 rounded">artist / artist123</code>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Visual (Dark) */}
      <div className="hidden lg:flex w-1/2 bg-[var(--bg-app)] relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--signal-success)]/20 text-[var(--signal-success)] text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-[var(--signal-success)] animate-pulse" />
                Enterprise Platform
              </span>
            </div>

            <h2 className="text-4xl font-bold text-[var(--text-on-dark)] mb-6 leading-tight">
              Professional Tattoo
              <span className="block text-[var(--brand-primary)]">Booking Management</span>
            </h2>

            <p className="text-lg text-[var(--text-on-dark-muted)] mb-10 max-w-md">
              Streamline your studio operations with automated booking,
              secure payments, and comprehensive analytics.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                "Automated booking & scheduling",
                "Secure payment processing",
                "Real-time analytics dashboard",
                "Multi-artist support"
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 text-[var(--text-on-dark-muted)]"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--signal-success)]/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[var(--signal-success)]" />
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[var(--brand-primary)]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--signal-success)]/10 to-transparent rounded-full blur-2xl" />
      </div>
    </div>
  );
}
