"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trophy, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type Goal = {
  id: string;
  type: string;
  target: number;
  current: number;
  status: string;
  deadline: string | null;
  brand?: { name: string; logoUrl: string | null } | null;
};

const typeLabels: Record<string, string> = {
  FOLLOWERS: "Followers",
  SUBSCRIBERS: "Subscribers",
  VIEWS: "Views",
  REACH: "Reach",
  UPLOADS: "Uploads",
  ENGAGEMENT: "Engagement",
};

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newType, setNewType] = useState("FOLLOWERS");
  const [newTarget, setNewTarget] = useState("");

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/goals?workspaceId=");
      const data = await res.json();
      if (data.success) setGoals(data.data);
    } catch {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleCreate = async () => {
    if (!newTarget) return;
    try {
      const res = await fetch("/api/v1/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: "", type: newType, target: parseInt(newTarget) }),
      });
      const data = await res.json();
      if (data.success) {
        setGoals([data.data, ...goals]);
        setShowCreateForm(false);
        setNewTarget("");
        toast.success("Goal created");
      }
    } catch {
      toast.error("Failed to create goal");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Track your social media growth targets"
        actions={
          <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        }
      />

      {showCreateForm && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="Target"
                className="rounded-md border bg-background px-3 py-2 text-sm w-32"
              />
              <Button onClick={handleCreate} disabled={!newTarget}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="py-8"><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No goals set yet. Create your first goal to track progress.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
            const isAchieved = goal.status === "ACHIEVED";
            return (
              <Card key={goal.id} className={isAchieved ? "border-green-500/50" : ""}>
                <CardContent className="py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isAchieved ? <Trophy className="h-4 w-4 text-yellow-500" /> : <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium">{typeLabels[goal.type] || goal.type}</span>
                    </div>
                    <Badge variant={isAchieved ? "default" : "secondary"}>
                      {isAchieved ? "Achieved" : "In Progress"}
                    </Badge>
                  </div>
                  <Progress value={progress} className="mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{goal.current.toLocaleString()}</span>
                    <span>Target: {goal.target.toLocaleString()}</span>
                  </div>
                  {goal.deadline && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
