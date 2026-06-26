import { brandRepository } from "../repositories/brand.repository";
import { createBrandSchema, updateBrandSchema, type CreateBrandInput, type UpdateBrandInput } from "../../schemas/brand";
import { AppError } from "@/lib/api/errors";

export const brandService = {
  async listByWorkspace(workspaceId: string) {
    return brandRepository.findByWorkspaceId(workspaceId);
  },

  async getById(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError("NOT_FOUND", "Brand not found");
    return brand;
  },

  async create(workspaceId: string, input: CreateBrandInput) {
    const validated = createBrandSchema.parse(input);

    // Check slug uniqueness within workspace
    const existing = await brandRepository.findByWorkspaceId(workspaceId);
    if (existing.some((b) => b.slug === validated.slug)) {
      throw new AppError("CONFLICT", `Slug "${validated.slug}" is already in use`);
    }

    return brandRepository.create({
      ...validated,
      workspaceId,
      color: validated.color || undefined,
      description: validated.description || undefined,
      website: validated.website || undefined,
      logoUrl: validated.logoUrl || undefined,
    });
  },

  async update(id: string, input: UpdateBrandInput) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError("NOT_FOUND", "Brand not found");

    const validated = updateBrandSchema.parse(input);

    // Check slug uniqueness if changing
    if (validated.slug && validated.slug !== brand.slug) {
      const existing = await brandRepository.findByWorkspaceId(brand.workspaceId);
      if (existing.some((b) => b.slug === validated.slug)) {
        throw new AppError("CONFLICT", `Slug "${validated.slug}" is already in use`);
      }
    }

    return brandRepository.update(id, validated);
  },

  async delete(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw new AppError("NOT_FOUND", "Brand not found");
    return brandRepository.softDelete(id);
  },
};
