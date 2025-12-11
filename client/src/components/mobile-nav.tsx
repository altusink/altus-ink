import { Link, useLocation } from "wouter";
import { Home, Calendar, User } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  highlight?: boolean;
  active?: boolean;
}

function NavItem({ href, icon: Icon, label, highlight, active }: NavItemProps) {
  const safeLabel = label || '';
  const testId = `mobile-nav-${safeLabel.toLowerCase().replace(/\s+/g, '-')}`;
  
  if (highlight) {
    return (
      <Link href={href} data-testid={testId}>
        <div className="relative -top-4 bg-gold p-4 rounded-full shadow-lg shadow-gold/20">
          <Icon className="w-6 h-6 text-black" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} data-testid={testId}>
      <div className={`flex flex-col items-center gap-1 ${active ? "text-gold" : "text-zinc-400"}`}>
        <Icon className="w-5 h-5" />
        <span className="text-xs">{safeLabel}</span>
      </div>
    </Link>
  );
}

export default function MobileNav() {
  const [location] = useLocation();
  const { t } = useLocale();

  const isBookingPage = location.startsWith("/book/");
  const isDashboard = location.startsWith("/dashboard");

  if (isBookingPage || isDashboard) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-zinc-900 border-t border-zinc-800 z-50 safe-area-pb">
      <div className="flex justify-around items-end py-3 px-2">
        <NavItem href="/" icon={Home} label={t.common.home} active={location === "/"} />
        <NavItem href="/book/demo" icon={Calendar} label={t.common.bookNow} highlight />
        <NavItem href="/api/login" icon={User} label={t.common.login} />
      </div>
    </nav>
  );
}
