import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/animations/PageTransition";

export default function NotesLoading() {
  return (
    <PageTransition>
      <div className="h-full p-4 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
          <Separator />
        </div>

        <div className="space-y-6">
          {[1, 2].map((dateGroup) => (
            <div key={dateGroup} className="space-y-4">
              <Skeleton className="h-5 w-36" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
                {[1, 2, 3, 4].map((card) => (
                  <Skeleton 
                    key={card} 
                    className="h-[120px] w-full rounded-xl" 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
