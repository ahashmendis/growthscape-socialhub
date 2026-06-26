import { prisma } from "@/lib/db/client";
import type { SocialAccount } from "@prisma/client";

export const socialAccountRepository = {
  async findByBrandId(brandId: string): Promise<SocialAccount[]> {
    return prisma.socialAccount.findMany({
      where: { brandId, deletedAt: null },
      include: { credential: true },
      orderBy: { platform: "asc" },
    });
  },

  async findById(id: string): Promise<SocialAccount | null> {
    return prisma.socialAccount.findUnique({
      where: { id, deletedAt: null },
      include: { credential: true, brand: true },
    });
  },

  async updateToken(id: string, data: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
  }): Promise<void> {
    await prisma.oAuthCredential.upsert({
      where: { socialAccountId: id },
      create: {
        socialAccountId: id,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || null,
        expiresAt: data.expiresAt || null,
        scopes: data.scopes || [],
      },
      update: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || null,
        expiresAt: data.expiresAt || null,
        scopes: data.scopes || [],
        lastRefreshedAt: new Date(),
      },
    });
  },

  async softDelete(id: string): Promise<SocialAccount> {
    return prisma.socialAccount.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },
};
