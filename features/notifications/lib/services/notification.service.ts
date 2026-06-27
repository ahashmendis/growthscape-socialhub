import { prisma } from "@/lib/db/client";

export const notificationService = {
  async list(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      return prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
    }
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async delete(userId: string, notificationId: string) {
    return prisma.notification.delete({
      where: { id: notificationId, userId },
    });
  },

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        link: data.link || null,
        metadata: data.metadata as any || {},
      },
    });
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },
};
