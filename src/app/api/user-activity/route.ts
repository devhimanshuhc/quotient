import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUserActivity } from "@/middleware/analytics";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    await updateUserActivity(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user activity:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
