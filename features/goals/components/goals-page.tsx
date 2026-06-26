"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trophy } from "lucide-react";

type Goal = {
  id: string;
  type: string;
  target: number;
  current: number;
  status: string;
  deadline: string | null;
};

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Track your social media growth targets"
        actions={
          <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Goal</Button>
        }
      />

      {goals.length === 0 ? (
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
            return (
              <Card key={goal.id}>
                <CardContent className="py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{goal.type}</span>
                    </div>
                    <Badge variant={goal.status === "ACHIEVED" ? "default" : "secondary"}>
                      {goal.status}
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
