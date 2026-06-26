"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Clock,
  Image,
  Sparkles,
  Wand2,
  TrendingUp,
  Users,
  FileText,
  Target,
  Workflow,
  Settings,
  Shield,
  Flag,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Scheduler", href: "/dashboard/scheduler", icon: Clock },
  { label: "Content Library", href: "/dashboard/content-library", icon: Image },
  { label: "AI Social Manager", href: "/dashboard/ai-social-manager", icon: Sparkles, badge: "AI" },
  { label: "AI Content Studio", href: "/dashboard/ai-content-studio", icon: Wand2, badge: "AI" },
  { label: "Trend Center", href: "/dashboard/trend-center", icon: TrendingUp },
  { label: "Competitor Tracker", href: "/dashboard/competitor-tracker", icon: Users },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
  { label: "Automation", href: "/dashboard/automation", icon: Workflow },
  { label: "Audit Log", href: "/dashboard/audit-log", icon: Shield },
  { label: "Feature Flags", href: "/dashboard/feature-flags", icon: Flag },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen border-r bg-card flex flex-col transition-all duration-normal",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-14 flex items-center px-4 border-b shrink-0">
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Growthscape</span>
        )}
        {collapsed && (
          <span className="font-bold text-lg text-primary">G</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-fast",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
