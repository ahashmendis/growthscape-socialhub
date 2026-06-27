import { prisma } from "@/lib/db/client";

export const workspaceRepository = {
  async findByUserId(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: { select: { brands: true, members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return memberships.map((m) => m.workspace);
  },

  async findById(id: string) {
    return prisma.workspace.findUnique({
      where: { id, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { brands: true, members: true } },
      },
    });
  },

  async create(userId: string, data: { name: string; slug: string; timezone?: string }) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          slug: data.slug,
          timezone: data.timezone || "UTC",
          ownerId: userId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: "OWNER",
          joinedAt: new Date(),
        },
      });

      return workspace;
    });
  },

  async update(id: string, data: { name?: string; slug?: string; timezone?: string; logoUrl?: string }) {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  },

  async getMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { joinedAt: "asc" },
    });
  },

  async addMember(workspaceId: string, userId: string, role: string) {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role: role as any,
        joinedAt: new Date(),
      },
    });
  },

  async removeMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  },

  async updateMemberRole(workspaceId: string, userId: string, role: string) {
    return prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role: role as any },
    });
  },

  async getMemberRole(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    return member?.role || null;
  },
};
