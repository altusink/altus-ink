import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  Globe,
  Palette,
  Settings,
  Users,
  BarChart3,
  CreditCard,
  LogOut,
  ChevronDown,
  Bell,
  Menu,
  X,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const artistMenuItems = [
  { href: "/dashboard/artist", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/artist/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/artist/earnings", label: "Earnings", icon: Wallet },
  { href: "/dashboard/artist/tour", label: "Tour Mode", icon: Globe },
  { href: "/dashboard/artist/portfolio", label: "Portfolio", icon: Palette },
  { href: "/dashboard/artist/settings", label: "Settings", icon: Settings },
];

const ceoMenuItems = [
  { href: "/dashboard/ceo", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/ceo/artists", label: "Artists", icon: Users },
  { href: "/dashboard/ceo/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/ceo/financial", label: "Financial", icon: CreditCard },
  { href: "/dashboard/ceo/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/ceo/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = (user as any)?.role || "artist";
  const menuItems = userRole === "ceo" ? ceoMenuItems : artistMenuItems;
  const displayName = (user as any)?.displayName || (user as any)?.username || "User";

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 sidebar-dark fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--border-dark)]">
          <Link href="/">
            <img src="/logo-altus-white.png" alt="Altus Ink" className="h-7" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "nav-item",
                    isActive && "nav-item-active"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[var(--border-dark)]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <Avatar className="w-10 h-10 border-2 border-white/20">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-[var(--brand-primary)] text-white text-sm font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-on-dark)] truncate">{displayName}</p>
              <p className="text-xs text-[var(--text-on-dark-muted)] capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 sidebar-dark transform transition-transform duration-300 lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-dark)]">
          <Link href="/">
            <img src="/logo-altus-white.png" alt="Altus Ink" className="h-7" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "nav-item",
                    isActive && "nav-item-active"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">

        {/* Top Header - Light */}
        <header className="sticky top-0 z-30 h-16 header-light flex items-center justify-between px-6">
          {/* Left: Mobile Menu + Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
            </Button>

            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
              {subtitle && (
                <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--signal-error)] rounded-full" />
            </Button>

            {/* Home Link */}
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="w-5 h-5 text-[var(--text-secondary)]" />
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-[var(--brand-primary)] text-white text-xs font-semibold">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium text-[var(--text-primary)]">
                    {displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-[var(--text-secondary)] capitalize">{userRole}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={userRole === "ceo" ? "/dashboard/ceo/settings" : "/dashboard/artist/settings"}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-[var(--signal-error)]">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content - Light Background */}
        <main className="p-6 bg-[var(--bg-surface)] min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
