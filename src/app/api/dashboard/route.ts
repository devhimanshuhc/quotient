import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DashboardData } from "@/types/dashboard";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get collections with count
    const collections = await prisma.collection.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get writings count
    const writingsCount = await prisma.writing.count({
      where: {
        userId: user.id,
      },
    });

    // Get recent activity (last 5 items)
    const recentActivity = await prisma.writing.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
      include: {
        collections: {
          select: {
            name: true,
          },
        },
      },
    });

    const dashboardData: DashboardData = {
      collections: {
        total: collections.length,
        items: collections,
      },
      writings: {
        total: writingsCount,
      },
      recentActivity: recentActivity.map((item) => ({
        id: item.id,
        title: item.title,
        updatedAt: item.updatedAt.toISOString(),
        collection: item.collections[0]?.name || null,
      })),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
