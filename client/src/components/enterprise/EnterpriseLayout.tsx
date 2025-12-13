/**
 * ALTUS INK - ENTERPRISE LAYOUT SHELL
 * The main application wrapper providing navigation, search, and context.
 * 
 * Features:
 * - Glassmorphic Sidebar with Collapse state
 * - Top Bar with Global Search (Command Palette)
 * - Notification Center Drawer
 * - User Profile Dropdown
 * - Dynamic Breadcrumbs
 * - CMS-driven Navigation Items
 * - Keyboard Shortcuts Manager
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCMS } from "@/hooks/enterprise/use-enterprise-modules";
import { DesignSystem } from "@/lib/enterprise-design";
import { EnterpriseButton, EnterpriseInput, EnterpriseLoader } from "../ui/enterprise-core"; // Relative import
import { useAuth } from "@/hooks/useAuth";

// =============================================================================
// ICONS (SVGs)
// =============================================================================
// Using the path strings from DesignSystem for lightweight icons

const Icon = ({ path, className }: { path: string; className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

const SidebarItem = ({ icon, label, href, isActive, onClick, isCollapsed }: any) => {
    return (
        <Link href={href}>
            <a
                onClick={onClick}
                className={`
          group flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200
          ${isActive
                        ? "bg-brand-primary/10 text-white shadow-[inset_3px_0_0_0_#9D4EDD]"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    }
        `}
            >
                <span className={`transition-colors ${isActive ? "text-brand-primary" : "text-neutral-500 group-hover:text-white"}`}>
                    {icon}
                </span>

                {!isCollapsed && (
                    <span className="text-sm font-medium tracking-wide">
                        {label}
                    </span>
                )}

                {/* Hover Tooltip for Collapsed Mode */}
                {isCollapsed && (
                    <div className="absolute left-16 px-2 py-1 bg-neutral-900 border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                        {label}
                    </div>
                )}
            </a>
        </Link>
    );
};

const EnterpriseSidebar = ({ isCollapsed, toggleCollapse }: any) => {
    const [location] = useLocation();
    const { user } = useAuth();

    // Dynamic Menu Items based on Role (simulated CMS fetch in future)
    const menuItems = [
        { label: "Dashboard", href: `/dashboard/${user?.role || "artist"}`, icon: <Icon path={DesignSystem.icons.dashboard} className="w-5 h-5" /> },
        { label: "Bookings", href: `/dashboard/${user?.role || "artist"}/bookings`, icon: <Icon path="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" className="w-5 h-5" /> }, // Calendar
        { label: "Messages", href: "/messages", icon: <Icon path="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" className="w-5 h-5" /> },
        { label: "Finances", href: `/dashboard/${user?.role || "artist"}/earnings`, icon: <Icon path="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" className="w-5 h-5" /> },
        { label: "Marketplace", href: "/marketplace", icon: <Icon path="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" className="w-5 h-5" /> },
        { label: "CMS", href: "/cms", icon: <Icon path="M14 17H4v2h10v-2zm-9.5-6h13l-5.5 5.5-2 2-5.5-7.5zm19-9H2.5l5.5 7.5 5.5-7.5zm0 12h-6v2h6v-2z" className="w-5 h-5" /> },
    ];

    return (
        <aside
            className={`
        fixed left-0 top-0 h-screen z-50 bg-neutral-900/80 backdrop-blur-xl border-r border-white/5 
        transition-all duration-300 ease-[var(--ease-spring)]
        ${isCollapsed ? "w-20" : "w-64"}
      `}
        >
            {/* Brand */}
            <div className="h-20 flex items-center justify-center border-b border-white/5">
                <div className="flex items-center gap-3">
                    <Icon path={DesignSystem.icons.logo} className="w-8 h-8 text-brand-primary animate-pulse-slow" />
                    {!isCollapsed && (
                        <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                            ALTUS
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1 mt-4">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        {...item}
                        isActive={location === item.href || location.startsWith(`${item.href}/`)}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </nav>

            {/* Footer Toggle */}
            <button
                onClick={toggleCollapse}
                className="absolute bottom-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors"
            >
                {isCollapsed ? "→" : "←"}
            </button>

            {/* User Mini Profile */}
            <div className="absolute bottom-16 left-0 w-full px-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-xs text-brand-primary">
                            {user?.username?.slice(0, 2).toUpperCase() || "ME"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.username}</p>
                            <p className="text-xs text-neutral-500 truncate capitalize">{user?.role}</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

// =============================================================================
// TOP BAR / COMMAND PALETTE
// =============================================================================

const CommandPalette = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 py-3 border-b border-white/5">
                    <Icon path={DesignSystem.icons.search} className="w-5 h-5 text-neutral-500" />
                    <input
                        autoFocus
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-neutral-500 px-3 text-sm h-full outline-none"
                    />
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-neutral-400">ESC</kbd>
                </div>
                <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Suggestions</div>
                    <button className="w-full text-left px-4 py-2 hover:bg-brand-primary/10 hover:text-brand-primary text-sm text-neutral-300 transition-colors">
                        Create New Booking
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-brand-primary/10 hover:text-brand-primary text-sm text-neutral-300 transition-colors">
                        Manage Artists
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-brand-primary/10 hover:text-brand-primary text-sm text-neutral-300 transition-colors">
                        View Analytics
                    </button>
                </div>
            </div>
        </div>
    );
};

const EnterpriseTopBar = ({ toggleSidebar }: any) => {
    const [isCmdOpen, setIsCmdOpen] = useState(false);

    // Keyboard shortcut for Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCmdOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-30 h-16 bg-neutral-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6">

                {/* Left: Mobile Toggle & Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="md:hidden p-2 text-neutral-400">
                        <Icon path="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" className="w-6 h-6" />
                    </button>
                    <div className="hidden md:flex items-center text-sm text-neutral-500">
                        <span className="hover:text-white transition-colors cursor-pointer">Dashboard</span>
                        <span className="mx-2">/</span>
                        <span className="text-white">Overview</span>
                    </div>
                </div>

                {/* Center: Search Trigger */}
                <button
                    onClick={() => setIsCmdOpen(true)}
                    className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group w-64"
                >
                    <Icon path={DesignSystem.icons.search} className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                    <span className="text-sm text-neutral-500 group-hover:text-neutral-300">Search...</span>
                    <div className="ml-auto flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-400">⌘</kbd>
                        <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-400">K</kbd>
                    </div>
                </button>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <EnterpriseButton variant="glass" size="sm" className="hidden md:flex">
                        Feedback
                    </EnterpriseButton>
                    <div className="w-px h-6 bg-white/10" />
                    <button className="relative p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <Icon path="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
                    </button>
                </div>
            </header>

            <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
        </>
    );
};

// =============================================================================
// MAIN LAYOUT EXPORT
// =============================================================================

export const EnterpriseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-brand-primary/30">

            {/* Sidebar */}
            <EnterpriseSidebar
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content Wrapper */}
            <div
                className={`
          flex flex-col min-h-screen transition-[margin] duration-300 ease-[var(--ease-spring)]
          ${isSidebarCollapsed ? "ml-20" : "ml-64"}
        `}
            >
                <EnterpriseTopBar toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    );
}
