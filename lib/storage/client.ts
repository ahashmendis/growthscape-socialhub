import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const storageClient = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export const storageService = {
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Buffer,
    options?: { contentType?: string; upsert?: boolean }
  ): Promise<UploadResult> {
    const { data, error } = await storageClient.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      });

    if (error) throw new Error(error.message);

    const { data: urlData } = storageClient.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
      size: typeof file === "object" && "size" in file ? file.size : file.length,
      mimeType: options?.contentType || "application/octet-stream",
    };
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await storageClient.storage
      .from(bucket)
      .remove([path]);
    if (error) throw new Error(error.message);
  },

  async listFiles(bucket: string, prefix?: string) {
    const { data, error } = await storageClient.storage
      .from(bucket)
      .list(prefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getFileUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await storageClient.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw new Error(error.message);
    return data.signedUrl;
  },
};
