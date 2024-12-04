import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Writing, User, Prisma } from '@prisma/client';

interface DailyStats {
  date: string;
  writingCount: number;
  contentLength: number;
  updatedCount: number;
}

interface ExtendedUser extends User {
  totalTimeSpent: number;
}

type UserWithWritings = ExtendedUser & {
  writings: Writing[];
};

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { 
      email: session.user.email 
    },
    include: {
      writings: {
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  }) as UserWithWritings | null;

  if (!user) {
    return new NextResponse('User not found', { status: 404 });
  }

  // Initialize daily stats for the last 30 days
  const dailyStats: Record<string, DailyStats> = {};
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    dailyStats[dateStr] = {
      date: dateStr,
      writingCount: 0,
      contentLength: 0,
      updatedCount: 0
    };
  }

  // Calculate daily stats
  user.writings.forEach((writing: Writing) => {
    const date = writing.createdAt.toISOString().split('T')[0];
    if (dailyStats[date]) {
      dailyStats[date].writingCount += 1;
      dailyStats[date].contentLength += writing.content.length;
      if (writing.updatedAt > writing.createdAt) {
        dailyStats[date].updatedCount += 1;
      }
    }
  });

  // Calculate total content length
  const totalContentLength = user.writings.reduce((sum: number, writing: Writing) => 
    sum + writing.content.length, 0
  );
  
  const averageContentLength = user.writings.length > 0 
    ? Math.round(totalContentLength / user.writings.length) 
    : 0;

  // Calculate total updates
  const totalUpdates = user.writings.reduce(
    (sum: number, writing: Writing) => 
      sum + (writing.updatedAt > writing.createdAt ? 1 : 0),
    0
  );

  const analytics = {
    totalWritings: user.writings.length,
    totalContentLength,
    averageContentLength,
    totalTimeSpent: user.totalTimeSpent,
    totalUpdates,
    dailyStats: Object.values(dailyStats).reverse() // Reverse to show oldest to newest
  };

  return NextResponse.json(analytics);
}
