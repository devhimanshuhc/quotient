import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Get last 3 versions of a writing
export async function GET(
  request: NextRequest,
  { params }: { params: { writeupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First get the user ID from the email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Then get the writing versions
    const writingVersions = await prisma.writingVersion.findMany({
      where: {
        writing: {
          id: params.writeupId,
          userId: user.id,
        },
      },
      orderBy: {
        versionNumber: 'desc',
      },
      take: 3,
    });

    return NextResponse.json(writingVersions);
  } catch (error) {
    console.error("[VERSIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Create a new version when writing is updated
export async function POST(
  request: NextRequest,
  { params }: { params: { writeupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First get the user ID from the email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const writing = await prisma.writing.findUnique({
      where: {
        id: params.writeupId,
        userId: user.id,
      },
      include: {
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!writing) {
      return new NextResponse("Writing not found", { status: 404 });
    }

    const nextVersionNumber = writing.versions[0]?.versionNumber + 1 || 1;

    const newVersion = await prisma.writingVersion.create({
      data: {
        title: writing.title,
        content: writing.content,
        versionNumber: nextVersionNumber,
        writingId: writing.id,
      },
    });

    // Keep only last 3 versions
    const oldVersions = await prisma.writingVersion.findMany({
      where: {
        writing: {
          id: params.writeupId,
        },
      },
      orderBy: {
        versionNumber: 'desc',
      },
      skip: 3,
    });

    if (oldVersions.length > 0) {
      await prisma.writingVersion.deleteMany({
        where: {
          id: {
            in: oldVersions.map(v => v.id),
          },
        },
      });
    }

    return NextResponse.json(newVersion);
  } catch (error) {
    console.error("[VERSION_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
