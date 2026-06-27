"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Workflow, Zap } from "lucide-react";
import { toast } from "sonner";

type AutomationRule = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
};

const TRIGGER_LABELS: Record<string, string> = {
  new_follower: "New Follower",
  post_published: "Post Published",
  low_engagement: "Low Engagement",
  milestone_reached: "Milestone Reached",
  viral_post: "Viral Post Detected",
};

const ACTION_LABELS: Record<string, string> = {
  send_notification: "Send Notification",
  create_report: "Generate Report",
  post_content: "Auto-Post Content",
  tag_competitor: "Tag Competitor",
  update_goal: "Update Goal Progress",
};

export function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/automation?workspaceId=");
      const data = await res.json();
      if (data.success) setRules(data.data);
    } catch {
      toast.error("Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const toggleRule = async (id: string) => {
    try {
      await fetch(`/api/v1/automation/${id}`, { method: "PATCH" });
      setRules(rules.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));
    } catch {
      toast.error("Failed to toggle rule");
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await fetch(`/api/v1/automation/${id}`, { method: "DELETE" });
      setRules(rules.filter((r) => r.id !== id));
      toast.success("Rule deleted");
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Automate your social media workflow with rules"
        actions={
          <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        }
      />

      {showCreateForm && (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              Automation rules are evaluated by the Inngest background job system.
              Configure triggers and actions to automate your workflow.
            </p>
            <div className="mt-4 text-center">
              <Workflow className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Rule Builder</p>
              <p className="text-xs text-muted-foreground">Coming soon — rule configuration UI</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="py-6"><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Zap className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No automation rules yet. Create your first rule to automate your workflow.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">
                        When <Badge variant="outline" className="text-[10px]">{TRIGGER_LABELS[rule.trigger] || rule.trigger}</Badge>
                        {" "}then <Badge variant="outline" className="text-[10px]">{ACTION_LABELS[rule.action] || rule.action}</Badge>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
