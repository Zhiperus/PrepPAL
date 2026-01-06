export function FeedPostSkeleton() {
  return (
    <div className="card bg-base-100 w-full overflow-hidden shadow-xl">
      <div className="flex items-center gap-3 p-4">
        <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-32 rounded"></div>
          <div className="skeleton h-3 w-16 rounded"></div>
        </div>
      </div>
      <div className="skeleton h-64 w-full"></div>
      <div className="card-body space-y-4 p-4">
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-3/4 rounded"></div>
        </div>
        <div className="flex justify-center pt-2">
          <div className="skeleton h-10 w-64 rounded"></div>
        </div>
      </div>
    </div>
  );
}
