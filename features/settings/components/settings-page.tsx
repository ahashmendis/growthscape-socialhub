"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Edit2, Building2, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { useWorkspace } from "@/providers/workspace-provider";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  color: string | null;
  _count: { socialAccounts: number };
};

type WorkspaceFromAPI = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  plan: string;
  _count?: { brands: number; members: number };
};

function SettingsContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "brands";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { workspaces, currentWorkspace, setCurrentWorkspaceId, refresh } = useWorkspace();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceSlug, setNewWorkspaceSlug] = useState("");

  useEffect(() => {
    if (currentWorkspace) {
      fetchBrands(currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const fetchBrands = async (workspaceId: string) => {
    try {
      const res = await fetch(`/api/v1/brands`, {
        headers: { "x-workspace-id": workspaceId },
      });
      const data = await res.json();
      if (data.success) setBrands(data.data);
    } catch {
      // Silently fail
    }
  };

  const handleCreateBrand = async () => {
    if (!newName.trim() || !currentWorkspace) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-workspace-id": currentWorkspace.id },
        body: JSON.stringify({ name: newName, slug: newSlug || newName.toLowerCase().replace(/\s+/g, "-") }),
      });
      const data = await res.json();
      if (data.success) {
        setBrands([...brands, data.data]);
        setNewName("");
        setNewSlug("");
        setShowCreateForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    setLoading(true);
    try {
      await fetch(`/api/v1/brands/${id}`, { method: "DELETE" });
      setBrands(brands.filter((b) => b.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkspaceName,
          slug: newWorkspaceSlug || newWorkspaceName.toLowerCase().replace(/\s+/g, "-"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        setNewWorkspaceName("");
        setNewWorkspaceSlug("");
        setShowWorkspaceForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage workspaces, brands, and connected accounts" />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-fast ${
            activeTab === "workspace" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4 inline mr-2" />
          Workspaces
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-fast ${
            activeTab === "brands" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Brands & Accounts
        </button>
      </div>

      {activeTab === "workspace" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Workspaces</h3>
              <p className="text-sm text-muted-foreground">Manage your workspaces and team members</p>
            </div>
            <Button onClick={() => setShowWorkspaceForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Workspace
            </Button>
          </div>

          {showWorkspaceForm && (
            <Card>
              <CardHeader><CardTitle className="text-base">Create Workspace</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} placeholder="My Workspace" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input value={newWorkspaceSlug} onChange={(e) => setNewWorkspaceSlug(e.target.value)} placeholder={newWorkspaceName.toLowerCase().replace(/\s+/g, "-")} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateWorkspace} disabled={loading || !newWorkspaceName.trim()}>Create</Button>
                  <Button variant="ghost" onClick={() => setShowWorkspaceForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {workspaces.map((ws: WorkspaceFromAPI) => (
              <Card key={ws.id} className={ws.id === currentWorkspace?.id ? "border-primary/50" : ""}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{ws.name}</p>
                      <p className="text-xs text-muted-foreground">/{ws.slug} · {ws._count?.brands || 0} brands · {ws._count?.members || 1} members</p>
                    </div>
                  </div>
                  {ws.id === currentWorkspace?.id && <Badge>Active</Badge>}
                </CardContent>
              </Card>
            ))}
            {workspaces.length === 0 && (
              <EmptyState icon={Building2} title="No workspaces" description="Create your first workspace to get started" actionLabel="Create Workspace" onAction={() => setShowWorkspaceForm(true)} />
            )}
          </div>
        </div>
      )}

      {activeTab === "brands" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Brands</h3>
              <p className="text-sm text-muted-foreground">Manage your social media brands</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} size="sm" disabled={!currentWorkspace}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </div>

          {showCreateForm && (
            <Card>
              <CardHeader><CardTitle className="text-base">Create Brand</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My Brand" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder={newName.toLowerCase().replace(/\s+/g, "-")} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateBrand} disabled={loading || !newName.trim()}>Create</Button>
                  <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {brands.length === 0 && !showCreateForm ? (
            <EmptyState icon={Plus} title="No brands yet" description="Create your first brand to connect social accounts" actionLabel="Add Brand" onAction={() => setShowCreateForm(true)} />
          ) : (
            <div className="space-y-3">
              {brands.map((brand) => (
                <Card key={brand.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brand.color || "#6C5CE7" }}>
                        {brand.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{brand._count?.socialAccounts || 0} accounts</Badge>
                      <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(brand.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
