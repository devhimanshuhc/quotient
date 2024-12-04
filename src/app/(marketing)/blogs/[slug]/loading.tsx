import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/animations/PageTransition";

export default function BlogPostLoading() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          <div className="relative mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
              {/* Metadata */}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-6">
                <Skeleton className="h-4 w-24" />
                <span>•</span>
                <Skeleton className="h-4 w-20" />
                <span>•</span>
                <Skeleton className="h-4 w-20" />
              </div>
              {/* Title */}
              <Skeleton className="h-12 w-[600px] mx-auto mb-6" />
              {/* Author */}
              <div className="mt-6 flex items-center justify-center">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 via-gray-50 to-gray-50/0" />
          <article className="relative mx-auto max-w-2xl px-6 lg:px-8">
            <div className="prose prose-lg prose-gray mx-auto space-y-8">
              {/* Introduction paragraph */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
              </div>

              {/* First Section */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" /> {/* Section header */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[92%]" />
              </div>

              {/* Second Section */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-72" /> {/* Section header */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[88%]" />
                <Skeleton className="h-4 w-[94%]" />
              </div>

              {/* Third Section */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-80" /> {/* Section header */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[91%]" />
                <Skeleton className="h-4 w-[87%]" />
              </div>

              {/* Fourth Section */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-56" /> {/* Section header */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[89%]" />
                <Skeleton className="h-4 w-[93%]" />
              </div>

              {/* Conclusion */}
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[86%]" />
                <Skeleton className="h-4 w-32 mt-8" /> {/* Signature */}
              </div>
            </div>
          </article>
        </section>
      </main>
    </PageTransition>
  );
}
