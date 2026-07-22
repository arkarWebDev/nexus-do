export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border bg-card animate-pulse">
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-20 bg-muted rounded" />
                <div className="h-3.5 w-36 bg-muted rounded" />
              </div>
              <div className="h-8 w-20 bg-muted rounded-md" />
            </div>
            <div className="space-y-2.5">
              <div className="h-10 bg-muted rounded-lg" />
              <div className="h-10 bg-muted rounded-lg" />
              <div className="h-10 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
