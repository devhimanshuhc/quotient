import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Fraunces } from "next/font/google";
import { Separator } from "@/components/ui/separator";
import { WriteButton } from "../../notes/components/WriteButton";
import { WriteupCard } from "../../notes/components/WriteupCard";
import PageTransition from '@/components/animations/PageTransition';

const fraunces = Fraunces({ subsets: ["latin"] });

interface CollectionPageProps {
  params: {
    collectionId: string;
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/");
  }

  // Fetch the collection
  const collection = await prisma.collection.findFirst({
    where: {
      id: params.collectionId,
      userId: user.id,
    },
  });

  if (!collection) {
    redirect("/collections");
  }

  // Fetch all writings in this collection
  const writings = await prisma.writing.findMany({
    where: {
      userId: user.id,
      collections: {
        some: {
          id: params.collectionId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
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

  // Fetch all collections for the WriteModal
  const collections = await prisma.collection.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Group writings by date
  const groupedWritings: { [key: string]: typeof writings } = {};
  writings.forEach(writing => {
    const date = format(writing.createdAt, "MMMM d, yyyy");
    if (!groupedWritings[date]) {
      groupedWritings[date] = [];
    }
    groupedWritings[date].push(writing);
  });

  return (
    <PageTransition>
      <div className="min-h-screen px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
            <div className="relative z-10">
              <h1 className={`text-3xl font-semibold mb-2 ${fraunces.className}`}>
                {collection.name}
              </h1>
              <p className="text-gray-300">
                {writings.length} {writings.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
            <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3">
              <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-br from-gray-800/50 to-gray-700/50 blur-3xl" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-semibold ${fraunces.className}`}>
              Notes
            </h2>
            <WriteButton collections={collections} />
          </div>
          <Separator />

          <div className="space-y-6">
            {Object.entries(groupedWritings).map(([date, writings]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">{date}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                  {writings.map((writing) => (
                    <WriteupCard
                      key={writing.id}
                      writing={writing}
                      collections={collections}
                    />
                  ))}
                </div>
              </div>
            ))}
            {writings.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notes in this collection yet
                </h3>
                <p className="text-gray-500">
                  Click the "Write Something" button to create your first note
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
