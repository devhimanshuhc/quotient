import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ writings: [], collections: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const searchTerm = query.trim();

    // Search writings
    const writings = await prisma.writing.findMany({
      where: {
        userId: user.id,
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
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
      take: 10,
    });

    // Search collections
    const collections = await prisma.collection.findMany({
      where: {
        userId: user.id,
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            writings: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    // Format writings to include preview text
    const formattedWritings = writings.map((writing) => ({
      ...writing,
      preview:
        writing.content.length > 100
          ? writing.content.substring(0, 100) + "..."
          : writing.content,
      type: "writing" as const,
    }));

    const formattedCollections = collections.map((collection) => ({
      ...collection,
      type: "collection" as const,
    }));

    return NextResponse.json({
      writings: formattedWritings,
      collections: formattedCollections,
      total: formattedWritings.length + formattedCollections.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
