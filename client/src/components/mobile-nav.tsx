import { Link, useLocation } from "wouter";
import { Home, Calendar, User } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  highlight?: boolean;
  active?: boolean;
}

function NavItem({ href, icon: Icon, label, highlight, active }: NavItemProps) {
  if (highlight) {
    return (
      <Link href={href} data-testid={`mobile-nav-${label.toLowerCase()}`}>
        <div className="relative -top-4 bg-amber-500 p-4 rounded-full shadow-lg shadow-amber-500/20">
          <Icon className="w-6 h-6 text-black" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} data-testid={`mobile-nav-${label.toLowerCase()}`}>
      <div className={`flex flex-col items-center gap-1 ${active ? "text-amber-500" : "text-zinc-400"}`}>
        <Icon className="w-5 h-5" />
        <span className="text-xs">{label}</span>
      </div>
    </Link>
  );
}

export default function MobileNav() {
  const [location] = useLocation();

  const isBookingPage = location.startsWith("/book/");
  const isDashboard = location.startsWith("/dashboard");

  if (isBookingPage || isDashboard) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-zinc-900 border-t border-zinc-800 z-50 safe-area-pb">
      <div className="flex justify-around items-end py-3 px-2">
        <NavItem href="/" icon={Home} label="Home" active={location === "/"} />
        <NavItem href="/book/demo" icon={Calendar} label="Book" highlight />
        <NavItem href="/api/login" icon={User} label="Login" />
      </div>
    </nav>
  );
}
