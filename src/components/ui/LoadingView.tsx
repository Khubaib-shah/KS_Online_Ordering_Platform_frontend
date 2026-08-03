import { Skeleton } from '@components/ui/Skeleton';

export function LoadingView() {
  return (
    <div id="loading-view" className="w-full h-full flex flex-col gap-6 animate-fade-in p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>

      {/* Main Content Area Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px]">
        <Skeleton className="lg:col-span-2 h-full rounded-2xl min-h-[250px]" />
        <Skeleton className="h-full rounded-2xl min-h-[250px]" />
      </div>
    </div>
  );
}

export function SpinnerLoading() {
  return (
    <div id="spinner-loading" className="w-full h-full min-h-[300px] flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-12 h-12 rounded-full border-4 border-accent-dark/10 border-t-accent-dark animate-spin mb-4" />
      <span className="text-sm font-semibold text-text-secondary animate-pulse">Loading modules...</span>
    </div>
  );
}
