import { Skeleton } from "@alpic-ai/ui/components/skeleton";

export default function DecisionSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading decision"
      data-llm="Y is searching the decision corpus and preparing a sourced decision card."
    >
      <div className="space-y-2">
        <p className="type-text-xs text-muted-foreground">
          Searching decision sources
        </p>
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-48 max-w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-sm" />
          <Skeleton className="h-7 w-32 rounded-sm" />
          <Skeleton className="h-7 w-28 rounded-sm" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-[0.75rem_1fr] gap-2">
          <Skeleton className="mt-2 size-1.5 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-[0.75rem_1fr] gap-2">
          <Skeleton className="mt-2 size-1.5 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-7 w-44 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-[0.75rem_1fr] gap-2">
          <Skeleton className="mt-2 size-1.5 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-5/6" />
            <Skeleton className="h-7 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
