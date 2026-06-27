import { workspaceRepository } from "../repositories/workspace.repository";
import { createWorkspaceSchema, updateWorkspaceSchema, inviteMemberSchema } from "../../schemas/workspace";
import { AppError } from "@/lib/api/errors";

export const workspaceService = {
  async listForUser(userId: string) {
    return workspaceRepository.findByUserId(userId);
  },

  async getById(workspaceId: string, userId: string) {
    // Check membership
    const role = await workspaceRepository.getMemberRole(workspaceId, userId);
    if (!role) throw new AppError("FORBIDDEN", "Not a member of this workspace");

    return workspaceRepository.findById(workspaceId);
  },

  async create(userId: string, input: { name: string; slug: string; timezone?: string }) {
    const validated = createWorkspaceSchema.parse(input);
    return workspaceRepository.create(userId, validated);
  },

  async update(workspaceId: string, userId: string, input: { name?: string; slug?: string; timezone?: string; logoUrl?: string }) {
    const role = await workspaceRepository.getMemberRole(workspaceId, userId);
    if (!role || (role !== "OWNER" && role !== "ADMIN")) {
      throw new AppError("FORBIDDEN", "Only owners and admins can update workspace settings");
    }

    const validated = updateWorkspaceSchema.parse(input);
    return workspaceRepository.update(workspaceId, validated);
  },

  async getMembers(workspaceId: string, userId: string) {
    const role = await workspaceRepository.getMemberRole(workspaceId, userId);
    if (!role) throw new AppError("FORBIDDEN", "Not a member of this workspace");

    return workspaceRepository.getMembers(workspaceId);
  },

  async inviteMember(workspaceId: string, userId: string, input: { email: string; role: string }) {
    const role = await workspaceRepository.getMemberRole(workspaceId, userId);
    if (!role || (role !== "OWNER" && role !== "ADMIN")) {
      throw new AppError("FORBIDDEN", "Only owners and admins can invite members");
    }

    const validated = inviteMemberSchema.parse(input);

    // Find user by email
    const { prisma } = await import("@/lib/db/client");
    const targetUser = await prisma.user.findUnique({ where: { email: validated.email } });
    if (!targetUser) throw new AppError("NOT_FOUND", "User not found");

    // Check if already a member
    const existingRole = await workspaceRepository.getMemberRole(workspaceId, targetUser.id);
    if (existingRole) throw new AppError("CONFLICT", "User is already a member");

    return workspaceRepository.addMember(workspaceId, targetUser.id, validated.role);
  },

  async removeMember(workspaceId: string, userId: string, targetUserId: string) {
    const role = await workspaceRepository.getMemberRole(workspaceId, userId);
    if (role !== "OWNER") throw new AppError("FORBIDDEN", "Only owners can remove members");

    // Cannot remove the owner
    const workspace = await workspaceRepository.findById(workspaceId);
    if (workspace?.ownerId === targetUserId) {
      throw new AppError("CONFLICT", "Cannot remove the workspace owner");
    }

    return workspaceRepository.removeMember(workspaceId, targetUserId);
  },

  async updateMemberRole(workspaceId: string, userId: string, targetUserId: string, role: string) {
    const actorRole = await workspaceRepository.getMemberRole(workspaceId, userId);
    if (actorRole !== "OWNER") throw new AppError("FORBIDDEN", "Only owners can change member roles");

    return workspaceRepository.updateMemberRole(workspaceId, targetUserId, role);
  },
};
