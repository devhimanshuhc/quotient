import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CollaboratorRole } from "@prisma/client";

// GET /api/collaboration/[writingId] - Get collaboration info
export async function GET(
  request: NextRequest,
  { params }: { params: { writingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { writingId } = params;

    // Check if user has access to this writing
    const writing = await prisma.writing.findFirst({
      where: {
        id: writingId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: { userId: session.user.id },
            },
          },
        ],
      },
      include: {
        collaborators: {
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
        },
        shareTokens: {
          where: { isActive: true },
        },
      },
    });

    if (!writing) {
      return NextResponse.json({ error: "Writing not found" }, { status: 404 });
    }

    return NextResponse.json({
      writing: {
        id: writing.id,
        title: writing.title,
        content: writing.content, // Added missing content field!
        userId: writing.userId, // Added userId for ownership check
        collaborators: writing.collaborators,
        shareTokens: writing.shareTokens,
      },
    });
  } catch (error) {
    console.error("Error fetching collaboration info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/collaboration/[writingId] - Add collaborator or create share token
export async function POST(
  request: NextRequest,
  { params }: { params: { writingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { writingId } = params;
    const body = await request.json();
    const { action, email, role = "EDITOR" } = body;

    // Check if user is owner or has OWNER role
    const writing = await prisma.writing.findFirst({
      where: {
        id: writingId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: CollaboratorRole.OWNER,
              },
            },
          },
        ],
      },
      include: {
        collaborators: true,
      },
    });

    if (!writing) {
      return NextResponse.json(
        { error: "Writing not found or no permission" },
        { status: 404 }
      );
    }

    if (action === "create_share_token") {
      // Create a new share token
      const shareToken = await prisma.shareToken.create({
        data: {
          writingId,
          createdBy: session.user.id,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          maxUsers: body.maxUsers || 3,
        },
      });

      return NextResponse.json({
        shareToken: {
          id: shareToken.id,
          token: shareToken.token,
          expiresAt: shareToken.expiresAt,
          maxUsers: shareToken.maxUsers,
        },
      });
    }

    if (action === "add_collaborator" && email) {
      // Find user by email
      const collaboratorUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!collaboratorUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if already a collaborator
      const existingCollaborator = writing.collaborators.find(
        (c) => c.userId === collaboratorUser.id
      );

      if (existingCollaborator) {
        return NextResponse.json(
          { error: "User is already a collaborator" },
          { status: 400 }
        );
      }

      // Add collaborator
      const collaborator = await prisma.collaborator.create({
        data: {
          writingId,
          userId: collaboratorUser.id,
          role: role as CollaboratorRole,
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

      return NextResponse.json({ collaborator });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in collaboration POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/collaboration/[writingId] - Remove collaborator or deactivate share token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { writingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { writingId } = params;
    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get("collaboratorId");
    const shareTokenId = searchParams.get("shareTokenId");

    // Check if user is owner
    const writing = await prisma.writing.findFirst({
      where: {
        id: writingId,
        userId: session.user.id,
      },
    });

    if (!writing) {
      return NextResponse.json(
        { error: "Writing not found or no permission" },
        { status: 404 }
      );
    }

    if (collaboratorId) {
      await prisma.collaborator.delete({
        where: { id: collaboratorId },
      });
      return NextResponse.json({ success: true });
    }

    if (shareTokenId) {
      await prisma.shareToken.update({
        where: { id: shareTokenId },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Missing collaboratorId or shareTokenId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in collaboration DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/collaboration/[writingId] - Update writing content (for collaborators)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { writingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { writingId } = params;
    const body = await request.json();
    const { action, content, title } = body;

    if (action !== "update_content") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this writing (owner or collaborator with EDITOR/OWNER role)
    const writing = await prisma.writing.findFirst({
      where: {
        id: writingId,
        OR: [
          { userId: session.user.id }, // Owner
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: {
                  in: [CollaboratorRole.OWNER, CollaboratorRole.EDITOR],
                },
              },
            },
          },
        ],
      },
      include: {
        collaborators: {
          include: {
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

    if (!writing) {
      return NextResponse.json(
        { error: "Writing not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Update the writing content
    const updatedWriting = await prisma.writing.update({
      where: { id: writingId },
      data: {
        content,
        ...(title && { title }),
        updatedAt: new Date(),
      },
    });

    // Update collaborator last active timestamp
    const userCollaborator = writing.collaborators.find(
      (c) => c.userId === session.user.id
    );
    if (userCollaborator) {
      await prisma.collaborator.update({
        where: { id: userCollaborator.id },
        data: { lastActive: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      writing: {
        id: updatedWriting.id,
        title: updatedWriting.title,
        content: updatedWriting.content,
        updatedAt: updatedWriting.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in collaboration PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
