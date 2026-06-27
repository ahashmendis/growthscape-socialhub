"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Image, Upload, Search, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

type MediaAsset = {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  tags: string[];
  createdAt: string;
};

export function ContentLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/content-library?brandId=&search=${search}&type=${filter !== "all" ? filter : ""}`);
      const data = await res.json();
      if (data.success) setAssets(data.data);
    } catch {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/content-library/${id}`, { method: "DELETE" });
      setAssets(assets.filter((a) => a.id !== id));
      toast.success("Asset deleted");
    } catch {
      toast.error("Failed to delete asset");
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Library"
        description="Manage your media assets"
        actions={
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="pl-10"
            />
          </div>
        </form>
        <div className="flex gap-1">
          {["all", "IMAGE", "VIDEO", "GIF"].map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter(type); fetchAssets(); }}
            >
              {type === "all" ? "All" : type}
            </Button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="py-12"><div className="h-4 bg-muted rounded w-3/4 mx-auto animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Image className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No media assets yet. Upload images and videos to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="group hover:shadow-growthscape-md transition-normal">
              <CardContent className="p-0">
                {/* Preview */}
                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                  {asset.type === "IMAGE" || asset.type === "GIF" ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {/* Delete button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>{formatSize(asset.size)}</span>
                    <span>{asset.width && asset.height ? `${asset.width}×${asset.height}` : asset.type}</span>
                  </div>
                  {asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {asset.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
