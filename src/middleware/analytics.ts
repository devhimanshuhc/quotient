import { prisma } from '@/lib/prisma';
import { Prisma, User } from '@prisma/client';

type UserWithAnalytics = User & {
  lastActive: Date | null;
  totalTimeSpent: number;
};

export async function updateUserActivity(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    }) as UserWithAnalytics | null;

    if (!user) return null;

    const now = new Date();
    const lastActiveTime = user.lastActive;
    const timeDiff = lastActiveTime ? Math.floor((now.getTime() - lastActiveTime.getTime()) / 1000 / 60) : 0;

    // Only update if more than 1 minute has passed
    if (!lastActiveTime || timeDiff >= 1) {
      const updatedUser = await prisma.$executeRaw`
        UPDATE "User"
        SET "totalTimeSpent" = "totalTimeSpent" + ${timeDiff > 30 ? 0 : timeDiff},
            "lastActive" = ${now}
        WHERE id = ${userId}
      `;

      return user;
    }

    // If less than a minute has passed, just update lastActive
    const updatedUser = await prisma.$executeRaw`
      UPDATE "User"
      SET "lastActive" = ${now}
      WHERE id = ${userId}
    `;

    return user;
  } catch (error) {
    console.error('Error updating user activity:', error);
    return null;
  }
}
