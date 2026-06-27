import { prisma } from "@/lib/db/client";
import { AppError } from "@/lib/api/errors";

export const goalService = {
  async list(workspaceId: string, brandId?: string | null) {
    return prisma.goal.findMany({
      where: {
        workspaceId,
        ...(brandId ? { brandId } : {}),
      },
      include: {
        brand: { select: { name: true, logoUrl: true } },
        user: { select: { name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(userId: string, workspaceId: string, data: {
    type: string;
    target: number;
    brandId?: string | null;
    deadline?: string;
  }) {
    return prisma.goal.create({
      data: {
        workspaceId,
        userId,
        type: data.type as any,
        target: data.target,
        brandId: data.brandId || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });
  },

  async updateProgress(id: string, current: number) {
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal) throw new AppError("NOT_FOUND", "Goal not found");

    const newStatus = current >= goal.target ? "ACHIEVED" : "ACTIVE";
    return prisma.goal.update({
      where: { id },
      data: { current, status: newStatus as any },
    });
  },

  async delete(id: string) {
    return prisma.goal.delete({ where: { id } });
  },

  // Auto-track goals from analytics data
  async autoTrackGoals(workspaceId: string) {
    const goals = await prisma.goal.findMany({
      where: { workspaceId, status: "ACTIVE" },
      include: { brand: { include: { socialAccounts: true } } },
    });

    for (const goal of goals) {
      let current = 0;
      if (goal.brand) {
        for (const account of goal.brand.socialAccounts) {
          if (goal.type === "FOLLOWERS") current += account.followers;
          if (goal.type === "SUBSCRIBERS" && account.platform === "YOUTUBE") current += account.followers;
        }
      }
      if (current !== goal.current) {
        await this.updateProgress(goal.id, current);
      }
    }
  },
};
