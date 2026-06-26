"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { CalendarDays, Clock, Plus, Edit2, Trash2, Send } from "lucide-react";

type ScheduledPost = {
  id: string;
  title: string | null;
  caption: string;
  hashtags: string[];
  scheduledFor: string;
  status: string;
  socialAccount: { platform: string; platformHandle: string | null } | null;
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  PUBLISHING: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function SchedulerPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "published" | "failed">("upcoming");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/scheduled-posts?brandId=");
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch {
      // Silently fail for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filtered = posts.filter((post) => {
    if (filter === "upcoming") return post.status === "SCHEDULED" || post.status === "DRAFT";
    if (filter === "published") return post.status === "PUBLISHED";
    if (filter === "failed") return post.status === "FAILED";
    return true;
  });

  const upcoming = filtered.filter((p) => p.status === "SCHEDULED");
  const drafts = filtered.filter((p) => p.status === "DRAFT");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduler"
        description="Schedule and manage your social media posts"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <Edit2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{drafts.length}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <Send className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{posts.filter((p) => p.status === "PUBLISHED").length}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{posts.filter((p) => p.status === "FAILED").length}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "upcoming", "published", "failed"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="py-8"><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarDays className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No posts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <Card key={post.id} className="hover:shadow-growthscape-sm transition-normal">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.socialAccount && (
                        <PlatformIcon platform={post.socialAccount.platform.toLowerCase() as any} size="sm" />
                      )}
                      <p className="font-medium truncate">{post.title || post.caption.slice(0, 60)}{post.caption.length > 60 ? "..." : ""}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(post.scheduledFor).toLocaleDateString()}</span>
                      <span>{new Date(post.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {post.hashtags.length > 0 && (
                        <span className="text-primary">{post.hashtags.slice(0, 3).join(" ")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={statusColors[post.status]}>
                      {post.status}
                    </Badge>
                    {post.status === "SCHEDULED" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
