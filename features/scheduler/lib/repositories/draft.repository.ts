import { prisma } from "@/lib/db/client";

export const draftRepository = {
  async findByBrand(brandId: string, status?: string) {
    return prisma.draft.findMany({
      where: {
        brandId,
        deletedAt: null,
        ...(status ? { status: status as any } : {}),
      },
      include: { media: { orderBy: { order: "asc" } }, scheduledPost: true },
      orderBy: { updatedAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.draft.findUnique({
      where: { id, deletedAt: null },
      include: { media: { orderBy: { order: "asc" } }, scheduledPost: true },
    });
  },

  async create(data: {
    brandId: string;
    title?: string;
    caption: string;
    hashtags: string[];
    notes?: string;
    media?: { type: string; url: string; altText?: string; order: number }[];
  }) {
    return prisma.draft.create({
      data: {
        brandId: data.brandId,
        title: data.title || null,
        caption: data.caption,
        hashtags: data.hashtags,
        notes: data.notes || null,
        media: data.media?.length
          ? { create: data.media.map((m) => ({ ...m, type: m.type as any })) }
          : undefined,
      },
      include: { media: true },
    });
  },

  async update(id: string, data: {
    title?: string;
    caption?: string;
    hashtags?: string[];
    notes?: string;
    status?: string;
  }) {
    return prisma.draft.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? (data.status as any) : undefined,
      },
      include: { media: true },
    });
  },

  async softDelete(id: string) {
    return prisma.draft.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
