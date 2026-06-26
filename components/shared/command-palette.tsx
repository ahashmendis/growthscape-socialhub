"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
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
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CommandItemType = {
  id: string;
  label: string;
  shortcut?: string;
  icon: typeof LayoutDashboard;
  action: () => void;
  group: string;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const navigate = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const items: CommandItemType[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, action: () => navigate("/dashboard"), group: "Navigation" },
    { id: "analytics", label: "Analytics", icon: BarChart3, action: () => navigate("/dashboard/analytics"), group: "Navigation" },
    { id: "calendar", label: "Calendar", icon: CalendarDays, action: () => navigate("/dashboard/calendar"), group: "Navigation" },
    { id: "scheduler", label: "Scheduler", icon: Clock, action: () => navigate("/dashboard/scheduler"), group: "Navigation" },
    { id: "content-library", label: "Content Library", icon: Image, action: () => navigate("/dashboard/content-library"), group: "Navigation" },
    { id: "ai-social-manager", label: "AI Social Manager", icon: Sparkles, action: () => navigate("/dashboard/ai-social-manager"), group: "Navigation" },
    { id: "ai-content-studio", label: "AI Content Studio", icon: Wand2, action: () => navigate("/dashboard/ai-content-studio"), group: "Navigation" },
    { id: "trends", label: "Trend Center", icon: TrendingUp, action: () => navigate("/dashboard/trend-center"), group: "Navigation" },
    { id: "competitors", label: "Competitor Tracker", icon: Users, action: () => navigate("/dashboard/competitor-tracker"), group: "Navigation" },
    { id: "reports", label: "Reports", icon: FileText, action: () => navigate("/dashboard/reports"), group: "Navigation" },
    { id: "goals", label: "Goals", icon: Target, action: () => navigate("/dashboard/goals"), group: "Navigation" },
    { id: "automation", label: "Automation", icon: Workflow, action: () => navigate("/dashboard/automation"), group: "Navigation" },
    { id: "settings", label: "Settings", icon: Settings, action: () => navigate("/dashboard/settings"), group: "Navigation" },
    { id: "theme-light", label: "Light Mode", icon: Sun, action: () => setTheme("light"), group: "Theme" },
    { id: "theme-dark", label: "Dark Mode", icon: Moon, action: () => setTheme("dark"), group: "Theme" },
    { id: "theme-system", label: "System Theme", icon: Monitor, action: () => setTheme("system"), group: "Theme" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group) => (
            <div key={group}>
              <CommandGroup heading={group}>
                {items
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem key={item.id} onSelect={item.action}>
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandSeparator />
            </div>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
