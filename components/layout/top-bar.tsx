"use client";

import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommandPalette } from "@/components/shared/command-palette";

interface TopBarProps {
  notificationCount?: number;
  userName?: string;
}

export function TopBar({
  notificationCount = 0,
  userName,
}: TopBarProps) {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-2"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 ml-auto">
            <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">⌘</kbd>
            <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">K</kbd>
          </kbd>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Button>
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {userName
                ? userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
