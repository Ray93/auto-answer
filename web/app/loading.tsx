function LoadingIndicator({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/70 bg-white/90 px-8 py-10 shadow-xl backdrop-blur">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <div className="space-y-1 text-center">
        <p className="text-base font-semibold text-primary">{label}</p>
        <p className="text-sm text-muted-foreground">请稍候，正在准备页面内容。</p>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <LoadingIndicator label="页面加载中" />
    </main>
  );
}
