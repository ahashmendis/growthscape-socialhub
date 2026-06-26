"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, User, FileText, Settings } from "lucide-react";

type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string | null;
  createdAt: string;
  previousValue: unknown;
  newValue: unknown;
};

const actionColors: Record<string, string> = {
  CREATED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  UPDATED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  DELETED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  PUBLISHED: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  LOGIN: "bg-muted text-muted-foreground",
};

const entityIcons: Record<string, typeof FileText> = {
  Brand: Plus,
  ScheduledPost: FileText,
  User: User,
  Workspace: Settings,
};

export function AuditLogPage() {
  const [entries] = useState<AuditEntry[]>([]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all workspace activity and changes"
      />

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No audit entries yet. Activity will be logged as you use the platform.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const Icon = entityIcons[entry.entity] || Shield;
            return (
              <Card key={entry.id}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className={actionColors[entry.action] || "bg-muted"}>
                          {entry.action}
                        </Badge>
                        <span className="text-sm font-medium">{entry.entity}</span>
                        <span className="text-xs text-muted-foreground truncate">{entry.entityId}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
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
