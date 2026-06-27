"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Trash2, Clock, AlertTriangle, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

const typeIcons: Record<string, typeof Bell> = {
  UPLOAD_REMINDER: Clock,
  BEST_POSTING_WINDOW: Clock,
  VIRAL_ALERT: AlertTriangle,
  MILESTONE: Trophy,
  FAILED_PUBLISHING: AlertTriangle,
  WEEKLY_SUMMARY: Sparkles,
  GOAL_ACHIEVED: Trophy,
  SYSTEM: Bell,
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/v1/notifications", { method: "PATCH" });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const dismiss = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications?id=${id}`, { method: "DELETE" });
      setNotifications(notifications.filter((n) => n.id !== id));
      if (!notifications.find((n) => n.id === id)?.isRead) {
        setUnreadCount(unreadCount - 1);
      }
    } catch {
      toast.error("Failed to dismiss notification");
    }
  };

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on your social media performance"
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="py-6"><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>{filter === "unread" ? "No unread notifications" : "No notifications yet"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={`transition-normal ${!notification.isRead ? "bg-primary/5 border-primary/20" : ""}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 mt-0.5 ${!notification.isRead ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-4 w-4 ${!notification.isRead ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && <Badge variant="default" className="text-[10px] h-4">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => dismiss(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
