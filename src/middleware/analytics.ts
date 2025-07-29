import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

type UserWithAnalytics = User & {
  lastActive: Date | null;
  totalTimeSpent: number;
};

export async function updateUserActivity(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lastActive: true,
        totalTimeSpent: true,
      },
    });

    if (!user) {
      console.warn(`User not found for analytics update: ${userId}`);
      return null;
    }

    const now = new Date();
    const lastActiveTime = user.lastActive;

    // If this is the first time tracking activity
    if (!lastActiveTime) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastActive: now,
          totalTimeSpent: user.totalTimeSpent || 0,
        },
      });
      console.log(`Initialized activity tracking for user ${userId}`);
      return user;
    }

    const timeDiffMinutes = Math.floor(
      (now.getTime() - lastActiveTime.getTime()) / (1000 * 60)
    );

    // Only add time if the gap is reasonable (between 1 minute and 3 hours)
    // This prevents counting idle time or unrealistic sessions
    if (timeDiffMinutes >= 1 && timeDiffMinutes <= 180) {
      const newTotalTime = (user.totalTimeSpent || 0) + timeDiffMinutes;

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalTimeSpent: newTotalTime,
          lastActive: now,
        },
      });

      console.log(
        `Updated user ${userId} activity: +${timeDiffMinutes} minutes (total: ${newTotalTime})`
      );
    } else {
      // Just update lastActive without adding time
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastActive: now,
        },
      });

      if (timeDiffMinutes > 180) {
        console.log(
          `User ${userId} had a long gap (${timeDiffMinutes} minutes), not counting as active time`
        );
      }
    }

    return user;
  } catch (error) {
    console.error("Error updating user activity:", error);
    return null;
  }
}

// Utility function to manually add time (for testing)
export async function addManualTime(userId: string, minutes: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalTimeSpent: true },
    });

    if (!user) return null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalTimeSpent: (user.totalTimeSpent || 0) + minutes,
        lastActive: new Date(),
      },
    });

    return { success: true, newTotal: (user.totalTimeSpent || 0) + minutes };
  } catch (error) {
    console.error("Error adding manual time:", error);
    return null;
  }
}
