function DashboardLoadingCard() {
  return (
    <div className="rounded-xl border border-white/70 bg-white/85 p-4 shadow animate-pulse">
      <div className="h-3 w-16 rounded bg-stone-200" />
      <div className="mt-4 h-8 w-12 rounded bg-stone-300" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <main className="container py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-40 rounded bg-stone-300" />
          <div className="h-4 w-64 rounded bg-stone-200" />
        </div>
        <div className="h-9 w-24 rounded-md bg-stone-200 animate-pulse" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <DashboardLoadingCard key={index} />
        ))}
      </div>

      <div className="rounded-xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-8 w-16 rounded bg-stone-200" />
          <div className="h-6 w-24 rounded bg-stone-300" />
          <div className="h-8 w-16 rounded bg-stone-200" />
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, index) => (
            <div key={index} className="h-20 rounded-lg border border-stone-200 bg-stone-100 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
