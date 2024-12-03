import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Fraunces } from "next/font/google";
import { Separator } from "@/components/ui/separator";
import { WriteButton } from "./components/WriteButton";
import { WriteupCard } from "./components/WriteupCard";
import PageTransition from "@/components/animations/PageTransition";

const fraunces = Fraunces({ subsets: ["latin"] });

export default async function NotesPage() {
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

  // Fetch all writings with their collections
  const writings = await prisma.writing.findMany({
    where: {
      userId: user.id,
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
    <div className="h-full p-4 max-w-6xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-semibold ${fraunces.className}`}>
            Your Notes
          </h2>
          <WriteButton collections={collections} />
        </div>
        <Separator />
      </div>

      <div className="space-y-6">
        {writings.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600 mb-4">No write-ups yet</h3>
            <p className="text-gray-500 mb-6">Start your journey by creating your first write-up!</p>
            <WriteButton collections={collections} />
          </div>
        ) : (
          Object.entries(groupedWritings).map(([date, writings]) => (
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
          ))
        )}
      </div>
    </div>
    </PageTransition>
  );
}
