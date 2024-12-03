import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/animations/PageTransition";

export default function CollectionsLoading() {
  return (
    <PageTransition>
      <main className="min-h-screen px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header Section Skeleton */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
            <div className="relative z-10">
              <Skeleton className="h-9 w-48 bg-white/10" />
              <Skeleton className="mt-2 h-6 w-96 bg-white/10" />
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          </div>

          {/* Create Collection Button Skeleton */}
          <Skeleton className="w-full h-[120px] rounded-xl" />

          {/* Collections Section Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            
            <div className="space-y-16">
              {[1, 2].map((dateGroup) => (
                <div key={dateGroup} className="space-y-6 pb-20">
                  <div className="py-2">
                    <Skeleton className="h-7 w-36" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((card) => (
                      <Skeleton
                        key={card}
                        className="h-[140px] rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
