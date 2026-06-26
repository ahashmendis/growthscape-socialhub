"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  color: string | null;
  _count: { socialAccounts: number };
  persona: unknown;
};

type SocialAccount = {
  id: string;
  platform: string;
  platformHandle: string | null;
  accountName: string;
  followers: number;
  isActive: boolean;
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "brands">("brands");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandSlug, setNewBrandSlug] = useState("");

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/v1/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName, slug: newBrandSlug || newBrandName.toLowerCase().replace(/\s+/g, "-") }),
      });
      const result = await response.json();
      if (result.success) {
        setBrands([...brands, result.data]);
        setNewBrandName("");
        setNewBrandSlug("");
        setShowCreateForm(false);
      } else {
        setError(result.error?.message || "Failed to create brand");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    setLoading(true);
    try {
      await fetch(`/api/v1/brands/${id}`, { method: "DELETE" });
      setBrands(brands.filter((b) => b.id !== id));
    } catch {
      setError("Failed to delete brand");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlatform = async (platform: string) => {
    try {
      const response = await fetch(`/api/v1/social/connect/${platform}`);
      const result = await response.json();
      if (result.success) {
        window.location.href = result.data.authUrl;
      }
    } catch {
      setError("Failed to initiate connection");
    }
  };

  const handleDisconnectAccount = async (id: string) => {
    try {
      await fetch(`/api/v1/social/${id}`, { method: "DELETE" });
      setSocialAccounts(socialAccounts.filter((a) => a.id !== id));
    } catch {
      setError("Failed to disconnect account");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your workspace, brands, and connected accounts"
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-fast ${
            activeTab === "workspace"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Workspace
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-fast ${
            activeTab === "brands"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Brands & Accounts
        </button>
      </div>

      {error && <ErrorState title="Error" description={error} onRetry={() => setError(null)} />}

      {activeTab === "workspace" && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
            <CardDescription>Configure your workspace name, timezone, and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Workspace settings will be available in the next update.</p>
          </CardContent>
        </Card>
      )}

      {activeTab === "brands" && (
        <div className="space-y-6">
          {/* Brands Section */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Brands</h3>
              <p className="text-sm text-muted-foreground">Manage your social media brands</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </div>

          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create Brand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="My Brand"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={newBrandSlug}
                    onChange={(e) => setNewBrandSlug(e.target.value)}
                    placeholder={newBrandName.toLowerCase().replace(/\s+/g, "-") || "my-brand"}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateBrand} disabled={loading || !newBrandName.trim()}>
                    {loading ? "Creating..." : "Create"}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {brands.length === 0 && !showCreateForm ? (
            <EmptyState
              icon={Plus}
              title="No brands yet"
              description="Create your first brand to start connecting social media accounts"
              actionLabel="Add Brand"
              onAction={() => setShowCreateForm(true)}
            />
          ) : (
            <div className="space-y-3">
              {brands.map((brand) => (
                <Card key={brand.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: brand.color || "#6C5CE7" }}
                      >
                        {brand.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {brand._count.socialAccounts} account{brand._count.socialAccounts !== 1 ? "s" : ""}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Social Accounts Section */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-1">Connected Accounts</h3>
            <p className="text-sm text-muted-foreground mb-4">Connect your social media platforms</p>

            {socialAccounts.length > 0 && (
              <div className="space-y-3 mb-6">
                {socialAccounts.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <PlatformIcon platform={account.platform.toLowerCase() as any} />
                        <div>
                          <p className="font-medium">{account.accountName}</p>
                          {account.platformHandle && (
                            <p className="text-xs text-muted-foreground">@{account.platformHandle}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {account.followers.toLocaleString()} followers
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnectAccount(account.id)}
                          className="text-destructive"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "facebook", label: "Facebook" },
                { key: "instagram", label: "Instagram" },
                { key: "youtube", label: "YouTube" },
              ].map((platform) => (
                <Card
                  key={platform.key}
                  className="cursor-pointer hover:shadow-growthscape-md hover:-translate-y-0.5 transition-normal"
                  onClick={() => handleConnectPlatform(platform.key)}
                >
                  <CardContent className="flex flex-col items-center gap-2 py-6">
                    <PlatformIcon platform={platform.key as any} size="lg" />
                    <span className="text-sm font-medium">{platform.label}</span>
                    <Badge variant="outline" className="text-xs">Connect</Badge>
                  </CardContent>
                </Card>
              ))}
              {["tiktok", "linkedin", "pinterest", "x"].map((platform) => (
                <Card key={platform} className="opacity-50">
                  <CardContent className="flex flex-col items-center gap-2 py-6">
                    <PlatformIcon platform={platform as any} size="lg" />
                    <span className="text-sm font-medium">{platform.toUpperCase()}</span>
                    <Badge variant="outline" className="text-xs">Coming soon</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
