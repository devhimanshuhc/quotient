import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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

    // Create writing data
    const writeData = {
      title: title.trim(),
      content: content?.trim() || "",
      userId: user.id,
      published: false,
    } as const;

    // If collectionId is provided, verify and add collection connection
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

    const writing = await prisma.writing.create({
      data: collectionId
        ? {
            ...writeData,
            collections: {
              connect: [{ id: collectionId }],
            },
          }
        : writeData,
      include: {
        collections: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(writing);
  } catch (error) {
    console.error("[WRITINGS_POST]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
