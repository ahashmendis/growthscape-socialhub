import { prisma } from "@/lib/db/client";
import type { Brand } from "@prisma/client";

export const brandRepository = {
  async findByWorkspaceId(workspaceId: string): Promise<Brand[]> {
    return prisma.brand.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        persona: true,
        _count: {
          select: { socialAccounts: { where: { isActive: true } } },
        },
      },
    });
  },

  async findById(id: string): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { id, deletedAt: null },
      include: { persona: true, socialAccounts: { where: { isActive: true } } },
    });
  },

  async create(data: {
    name: string;
    slug: string;
    workspaceId: string;
    color?: string;
    description?: string;
    website?: string;
    logoUrl?: string;
  }): Promise<Brand> {
    return prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        workspaceId: data.workspaceId,
        color: data.color || null,
        description: data.description || null,
        website: data.website || null,
        logoUrl: data.logoUrl || null,
      },
    });
  },

  async update(id: string, data: Partial<Pick<Brand, "name" | "slug" | "color" | "description" | "website" | "logoUrl">>): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data,
    });
  },

  async softDelete(id: string): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
