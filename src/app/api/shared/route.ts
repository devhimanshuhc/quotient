import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/shared - Get writings shared with the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all writings where the current user is a collaborator
    const sharedWritings = await prisma.writing.findMany({
      where: {
        collaborators: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        collaborators: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
            joinedAt: true,
            lastActive: true,
          },
        },
        collections: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const formattedWritings = sharedWritings.map((writing) => ({
      id: writing.id,
      title: writing.title,
      content: writing.content,
      createdAt: writing.createdAt,
      updatedAt: writing.updatedAt,
      owner: {
        id: writing.user.id,
        name: writing.user.name,
        email: writing.user.email,
        image: writing.user.image,
      },
      myRole: writing.collaborators[0]?.role || "VIEWER",
      joinedAt: writing.collaborators[0]?.joinedAt,
      lastActive: writing.collaborators[0]?.lastActive,
      collections: writing.collections,
    }));

    return NextResponse.json({ sharedWritings: formattedWritings });
  } catch (error) {
    console.error("Error fetching shared writings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
