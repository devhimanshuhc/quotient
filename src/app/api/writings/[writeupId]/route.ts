import { NextResponse, NextRequest as Request } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { writeupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, content, collectionId } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify writing exists and belongs to user
    const existingWriting = await prisma.writing.findFirst({
      where: {
        id: params.writeupId,
        userId: user.id,
      },
      include: {
        collections: true,
      },
    });

    if (!existingWriting) {
      return new NextResponse("Writing not found", { status: 404 });
    }

    // If collectionId is provided, verify it belongs to the user
    if (collectionId) {
      const collection = await prisma.collection.findFirst({
        where: {
          id: collectionId,
          userId: user.id,
        },
      });

      if (!collection) {
        return new NextResponse("Collection not found", { status: 404 });
      }
    }

    try {
      // Update writing and create version
      const [writing, version] = await prisma.$transaction(async (tx) => {
        // Update the writing
        const updatedWriting = await tx.writing.update({
          where: {
            id: params.writeupId,
          },
          data: {
            title,
            content,
            collections: {
              // First disconnect all existing collections
              disconnect: existingWriting.collections.map(c => ({ id: c.id })),
              // Then connect the new collection if provided
              ...(collectionId && {
                connect: [{ id: collectionId }],
              }),
            },
          },
          include: {
            collections: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Get latest version number
        const latestVersion = await tx.writingVersion.findFirst({
          where: { writingId: params.writeupId },
          orderBy: { versionNumber: 'desc' },
        });

        // Create new version
        const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;
        const newVersion = await tx.writingVersion.create({
          data: {
            title: updatedWriting.title,
            content: updatedWriting.content,
            versionNumber: nextVersionNumber,
            writingId: updatedWriting.id,
          },
        });

        // Keep only last 3 versions
        const oldVersions = await tx.writingVersion.findMany({
          where: { writingId: params.writeupId },
          orderBy: { versionNumber: 'desc' },
          skip: 3,
        });

        if (oldVersions.length > 0) {
          await tx.writingVersion.deleteMany({
            where: {
              id: {
                in: oldVersions.map(v => v.id),
              },
            },
          });
        }

        return [updatedWriting, newVersion];
      });

      return NextResponse.json({ writing, version });
    } catch (txError) {
      console.error("[WRITEUP_PATCH_TRANSACTION]", txError);
      return new NextResponse(
        "Failed to update writing or create version. Please try again.",
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[WRITEUP_PATCH]", error);
    return new NextResponse(
      "An unexpected error occurred. Please try again.",
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { writeupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized - No session", { status: 401 });
    }

    const user = session.user as { id: string; email: string };
    
    if (!user.id) {
      return new NextResponse("Unauthorized - No user ID", { status: 401 });
    }

    console.log("[DELETE] Starting deletion process", {
      writingId: params.writeupId,
      userId: user.id
    });

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First check if the writing exists and belongs to the user
      const writeup = await tx.writing.findUnique({
        where: {
          id: params.writeupId,
        },
        select: {
          userId: true,
          id: true
        },
      });

      if (!writeup) {
        console.log("[DELETE] Writing not found:", params.writeupId);
        throw new Error("Writing not found");
      }

      if (writeup.userId !== user.id) {
        console.log("[DELETE] Unauthorized - User ID mismatch.", {
          expected: writeup.userId,
          got: user.id
        });
        throw new Error("Unauthorized - Not the owner");
      }

      // If all checks pass, delete the writing
      return await tx.writing.delete({
        where: {
          id: params.writeupId,
        },
      });
    });

    console.log("[DELETE] Successfully deleted writing", result);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("[DELETE] Error occurred:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      params: params
    });

    if (error instanceof Error) {
      if (error.message === "Writing not found") {
        return new NextResponse("Writing not found", { status: 404 });
      }
      if (error.message === "Unauthorized - Not the owner") {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Check if it's a Prisma error
    const prismaError = error as { code?: string; meta?: { cause?: string } };
    if (prismaError.code) {
      console.error("[DELETE] Prisma error:", {
        code: prismaError.code,
        meta: prismaError.meta
      });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
