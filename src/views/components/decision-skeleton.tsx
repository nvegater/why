import { Skeleton } from "@alpic-ai/ui/components/skeleton";

export default function DecisionSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading decision">
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-sm" />
          <Skeleton className="h-7 w-32 rounded-sm" />
          <Skeleton className="h-7 w-28 rounded-sm" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-5/6" />
      </div>
    </div>
  );
}
