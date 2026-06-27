import { prisma } from "@/lib/db/client";
import { AppError } from "@/lib/api/errors";

export const automationService = {
  async createRule(userId: string, workspaceId: string, data: {
    name: string;
    trigger: string;
    action: string;
    config: Record<string, unknown>;
    isActive?: boolean;
  }) {
    return prisma.automationRule.create({
      data: {
        workspaceId,
        name: data.name,
        trigger: data.trigger,
        action: data.action,
        config: data.config as any,
        isActive: data.isActive ?? true,
      },
    });
  },

  async listRules(workspaceId: string) {
    return prisma.automationRule.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async toggleRule(id: string) {
    const rule = await prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new AppError("NOT_FOUND", "Rule not found");

    return prisma.automationRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });
  },

  async deleteRule(id: string) {
    return prisma.automationRule.delete({ where: { id } });
  },

  async getExecutions(ruleId: string) {
    return prisma.automationExecution.findMany({
      where: { ruleId },
      orderBy: { executedAt: "desc" },
      take: 50,
    });
  },
};
