import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserActivity, addManualTime } from "@/middleware/analytics";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await req.json();
    const { action = "update", minutes } = body;

    // Get current state
    const before = {
      totalTimeSpent: user.totalTimeSpent,
      lastActive: user.lastActive,
    };

    let result;
    if (action === "addTime" && typeof minutes === "number") {
      // Manually add time for testing
      result = await addManualTime(user.id, minutes);
    } else {
      // Regular activity update
      result = await updateUserActivity(user.id);
    }

    // Get updated state
    const after = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        totalTimeSpent: true,
        lastActive: true,
      },
    });

    return NextResponse.json({
      message:
        action === "addTime"
          ? `Added ${minutes} minutes manually`
          : "Analytics test completed",
      before,
      after,
      userId: user.id,
      result,
    });
  } catch (error) {
    console.error("Test analytics error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
