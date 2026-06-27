"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Building2, Users, X as XIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { useWorkspace } from "@/providers/workspace-provider";
import { toast } from "sonner";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  color: string | null;
  _count: { socialAccounts: number };
  socialAccounts?: { id: string; platform: string; platformHandle: string | null; accountName: string; followers: number; isActive: boolean }[];
};

type WorkspaceFromAPI = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  plan: string;
  _count?: { brands: number; members: number };
};

const PLATFORMS = [
  { key: "FACEBOOK", label: "Facebook", ready: true },
  { key: "INSTAGRAM", label: "Instagram", ready: true },
  { key: "YOUTUBE", label: "YouTube", ready: true },
  { key: "TIKTOK", label: "TikTok", ready: false },
  { key: "LINKEDIN", label: "LinkedIn", ready: false },
  { key: "PINTEREST", label: "Pinterest", ready: false },
  { key: "X", label: "X", ready: false },
  { key: "THREADS", label: "Threads", ready: false },
];

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

  const handleConnectSocial = async (platform: string, brandId: string) => {
    if (!currentWorkspace) return;
    try {
      const res = await fetch("/api/v1/social/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, brandId, workspaceId: currentWorkspace.id }),
      });
      const data = await res.json();
      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        toast.error(data.error?.message || "Failed to connect");
      }
    } catch {
      toast.error("Failed to initiate connection");
    }
  };

  const handleDisconnectSocial = async (accountId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/v1/social/${accountId}`, { method: "DELETE" });
      if (currentWorkspace) fetchBrands(currentWorkspace.id);
      toast.success("Account disconnected");
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
            <div className="space-y-4">
              {brands.map((brand) => (
                <Card key={brand.id}>
                  <CardContent className="py-4">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brand.color || "#6C5CE7" }}>
                          {brand.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{brand._count?.socialAccounts || 0} connected</Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBrand(brand.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Connected Accounts */}
                    {brand.socialAccounts && brand.socialAccounts.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {brand.socialAccounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <PlatformIcon platform={account.platform.toLowerCase() as any} size="sm" />
                              <span className="text-sm font-medium">{account.accountName}</span>
                              {account.platformHandle && <span className="text-xs text-muted-foreground">@{account.platformHandle}</span>}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDisconnectSocial(account.id)} className="text-destructive h-7">
                              <XIcon className="h-3 w-3 mr-1" />
                              Disconnect
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Connect Platforms */}
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.filter((p) => !brand.socialAccounts?.some((a) => a.platform === p.key)).map((platform) => (
                        <Button
                          key={platform.key}
                          variant="outline"
                          size="sm"
                          disabled={!platform.ready || loading}
                          onClick={() => handleConnectSocial(platform.key, brand.id)}
                          className="gap-2"
                        >
                          <PlatformIcon platform={platform.key.toLowerCase() as any} size="sm" />
                          {platform.label}
                          {!platform.ready && <Badge variant="outline" className="text-[10px] ml-1">Soon</Badge>}
                        </Button>
                      ))}
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
