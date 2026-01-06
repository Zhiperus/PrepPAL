export function ModuleCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="mb-4 h-12 w-12 rounded-lg bg-gray-200" />
        <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
        </div>
        <div className="mb-6 flex gap-4">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-gray-200" />
        <div className="h-10 w-20 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
