export function LoadingState({ label = "جاري التحميل..." }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-black/10 bg-white/82 p-8 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur">
      <span className="ml-3 h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      {label}
    </div>
  )
}
