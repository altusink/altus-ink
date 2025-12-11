import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Calendar,
  Home,
  LogOut,
  MapPin,
  Palette,
  Settings,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const artistMenuItems = [
  { title: "Dashboard", url: "/dashboard/artist", icon: Home },
  { title: "Calendar", url: "/dashboard/artist/calendar", icon: Calendar },
  { title: "Tour Mode", url: "/dashboard/artist/tour", icon: MapPin },
  { title: "Earnings", url: "/dashboard/artist/earnings", icon: TrendingUp },
  { title: "Personalize", url: "/dashboard/artist/personalize", icon: Palette },
  { title: "Settings", url: "/dashboard/artist/settings", icon: Settings },
];

const ceoMenuItems = [
  { title: "Dashboard", url: "/dashboard/ceo", icon: Home },
  { title: "Artists", url: "/dashboard/ceo/artists", icon: Users },
  { title: "Bookings", url: "/dashboard/ceo/bookings", icon: Calendar },
  { title: "Financial", url: "/dashboard/ceo/financial", icon: TrendingUp },
  { title: "Reports", url: "/dashboard/ceo/reports", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/ceo/settings", icon: Settings },
];

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const isCeo = user?.role === "ceo";
  const menuItems = isCeo ? ceoMenuItems : artistMenuItems;

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/">
              <div className="flex items-center hover-elevate rounded-lg p-2 -m-2 cursor-pointer">
                <Logo size="md" />
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                {isCeo ? "Agency" : "Artist"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location === item.url}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-9 h-9">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(user?.firstName || user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName || user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {isCeo ? "CEO" : "Artist"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              data-testid="button-sidebar-logout"
              onClick={() => window.location.href = "/api/logout"}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="flex items-center gap-4 h-16 px-4 md:px-6 border-b border-border/50 bg-background/80 glass sticky top-0 z-40">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1">
              <h1 className="font-semibold text-lg">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 lg:p-8 page-transition">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
