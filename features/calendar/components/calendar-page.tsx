"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

type ScheduledPost = {
  id: string;
  caption: string;
  scheduledFor: string;
  status: string;
  socialAccount: { platform: string } | null;
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const from = new Date(year, month, 1).toISOString().split("T")[0];
      const to = new Date(year, month + 1, 0).toISOString().split("T")[0];
      const res = await fetch(`/api/v1/scheduled-posts?brandId=&dateFrom=${from}&dateTo=${to}`);
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [currentDate]);

  const getPostsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return posts.filter((p) => p.scheduledFor.startsWith(dateStr));
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage your content schedule"
        actions={
          <div className="flex items-center gap-2">
            <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>Month</Button>
            <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Week</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />New Post</Button>
          </div>
        }
      />

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 px-3 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {blanks.map((i) => (
              <div key={`blank-${i}`} className="min-h-[100px] border-b border-r bg-muted/20" />
            ))}
            {days.map((day) => {
              const dayPosts = getPostsForDay(day);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`min-h-[100px] p-2 border-b border-r last:border-r-0 transition-fast hover:bg-accent/50 ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                  {dayPosts.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayPosts.slice(0, 3).map((post) => (
                        <Badge key={post.id} variant="secondary" className="text-[10px] truncate w-full justify-start">
                          {post.socialAccount && (
                            <PlatformIcon platform={post.socialAccount.platform.toLowerCase() as any} size="sm" />
                          )}
                          <span className="ml-1 truncate">{post.caption.slice(0, 20)}</span>
                        </Badge>
                      ))}
                      {dayPosts.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
