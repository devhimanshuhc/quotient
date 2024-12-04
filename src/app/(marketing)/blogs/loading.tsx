import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/animations/PageTransition";

export default function BlogLoading() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <Skeleton className="h-16 w-96 bg-gray-700" />
              <Skeleton className="mt-6 h-12 w-[560px] bg-gray-700" />
            </div>
          </div>
          <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* Blog Posts Grid */}
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-4 rounded-2xl border border-gray-200 p-6">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
