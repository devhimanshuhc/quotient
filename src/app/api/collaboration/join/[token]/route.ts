import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CollaboratorRole } from "@prisma/client";

// POST /api/collaboration/join/[token] - Join collaboration via share token
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = params;

    // Find and validate share token
    const shareToken = await prisma.shareToken.findUnique({
      where: { token },
      include: {
        writing: {
          include: {
            collaborators: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!shareToken || !shareToken.isActive) {
      return NextResponse.json(
        { error: "Invalid or expired share token" },
        { status: 404 }
      );
    }

    // Check expiration
    if (shareToken.expiresAt && shareToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Share token has expired" },
        { status: 410 }
      );
    }

    // Check if user is already a collaborator or owner
    const writing = shareToken.writing;
    if (writing.userId === session.user.id) {
      return NextResponse.json({
        message: "You are the owner of this writing",
        writing: {
          id: writing.id,
          title: writing.title,
          role: "OWNER",
        },
      });
    }

    const existingCollaborator = writing.collaborators.find(
      (c) => c.userId === session.user.id
    );

    if (existingCollaborator) {
      return NextResponse.json({
        message: "You are already a collaborator",
        writing: {
          id: writing.id,
          title: writing.title,
          role: existingCollaborator.role,
        },
      });
    }

    // Check if max users limit reached
    const currentCollaboratorCount = writing.collaborators.length + 1; // +1 for owner
    if (currentCollaboratorCount >= shareToken.maxUsers) {
      return NextResponse.json(
        {
          error: "Maximum number of collaborators reached for this writing",
        },
        { status: 403 }
      );
    }

    // Add user as collaborator
    const collaborator = await prisma.collaborator.create({
      data: {
        writingId: writing.id,
        userId: session.user.id,
        role: CollaboratorRole.EDITOR, // Default role for shared users
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
      },
    });

    return NextResponse.json({
      message: "Successfully joined as collaborator",
      writing: {
        id: writing.id,
        title: writing.title,
        role: collaborator.role,
      },
      collaborator,
    });
  } catch (error) {
    console.error("Error joining collaboration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/collaboration/join/[token] - Get share token info (for preview)
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find share token with basic writing info
    const shareToken = await prisma.shareToken.findUnique({
      where: { token },
      include: {
        writing: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!shareToken || !shareToken.isActive) {
      return NextResponse.json(
        { error: "Invalid or expired share token" },
        { status: 404 }
      );
    }

    // Check expiration
    if (shareToken.expiresAt && shareToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Share token has expired" },
        { status: 410 }
      );
    }

    // Get current collaborator count
    const collaboratorCount = await prisma.collaborator.count({
      where: { writingId: shareToken.writingId },
    });

    return NextResponse.json({
      writing: shareToken.writing,
      creator: shareToken.creator,
      currentCollaborators: collaboratorCount + 1, // +1 for owner
      maxUsers: shareToken.maxUsers,
      expiresAt: shareToken.expiresAt,
      canJoin: collaboratorCount + 1 < shareToken.maxUsers,
    });
  } catch (error) {
    console.error("Error fetching share token info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
