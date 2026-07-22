export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6 fade-in">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border bg-card card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="space-y-2">
              <div className="h-4 w-14 shimmer rounded" />
              <div className="h-3 w-28 shimmer rounded" />
            </div>
            <div className="h-8 w-20 shimmer rounded-lg" />
          </div>
          <div className="p-1 space-y-1">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3 px-4 py-3">
                <div className="h-4 w-4 shimmer rounded-sm shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 shimmer rounded" />
                  <div className="h-3 w-1/3 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
