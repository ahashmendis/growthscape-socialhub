import { prisma } from "@/lib/db/client";
import { createClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/api/errors";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const storageClient = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = "media-assets";

export const contentLibraryService = {
  async listAssets(brandId: string, params?: { tags?: string[]; type?: string; search?: string }) {
    const where: Record<string, unknown> = { brandId, deletedAt: null };
    if (params?.type) where.type = params.type;
    if (params?.tags?.length) {
      where.tags = { hasSome: params.tags };
    }
    if (params?.search) {
      where.name = { contains: params.search };
    }

    return prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  },

  async createAsset(data: {
    brandId: string;
    name: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    size?: number;
    tags?: string[];
  }) {
    return prisma.mediaAsset.create({
      data: {
        brandId: data.brandId,
        name: data.name,
        type: data.type as any,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl || null,
        width: data.width || null,
        height: data.height || null,
        size: data.size || null,
        tags: data.tags || [],
      },
    });
  },

  async deleteAsset(id: string) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return null;

    // Delete from storage
    try {
      const path = asset.url.split("/").pop();
      if (path) {
        await storageClient.storage.from(BUCKET_NAME).remove([path]);
      }
    } catch {
      // Storage delete failure is non-fatal
    }

    return prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async updateTags(id: string, tags: string[]) {
    return prisma.mediaAsset.update({
      where: { id },
      data: { tags },
    });
  },

  async getUploadUrl(fileName: string, _mimeType: string) {
    const path = `${Date.now()}-${fileName}`;
    const { data, error } = await storageClient.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(path, { upsert: true });

    if (error) throw new AppError("INTERNAL_ERROR", error.message);

    return {
      uploadUrl: data?.signedUrl || "",
      path,
      token: data?.token || "",
    };
  },
};
