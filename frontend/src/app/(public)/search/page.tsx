import { Suspense } from "react";
import { SearchResultsPanel } from "@/features/search/SearchResultsPanel";
import { Skeleton } from "@/components/states/Skeleton";

function SearchFallback() {
  return (
    <main className="mx-auto max-w-container-max px-lg py-xl">
      <Skeleton className="mb-lg h-10 w-1/2" />
      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResultsPanel />
    </Suspense>
  );
}
