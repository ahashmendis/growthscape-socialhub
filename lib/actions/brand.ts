import { brandService } from "@/features/settings/lib/services/brand.service";
import { requireUser } from "@/lib/auth/server";
import type { CreateBrandInput, UpdateBrandInput } from "@/features/settings/schemas/brand";

export async function listBrandsAction(workspaceId: string) {
  await requireUser();
  return brandService.listByWorkspace(workspaceId);
}

export async function getBrandAction(brandId: string) {
  await requireUser();
  return brandService.getById(brandId);
}

export async function createBrandAction(workspaceId: string, input: CreateBrandInput) {
  await requireUser();
  return brandService.create(workspaceId, input);
}

export async function updateBrandAction(brandId: string, input: UpdateBrandInput) {
  await requireUser();
  return brandService.update(brandId, input);
}

export async function deleteBrandAction(brandId: string) {
  await requireUser();
  return brandService.delete(brandId);
}
