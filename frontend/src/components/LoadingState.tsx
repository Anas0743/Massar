export function LoadingState({ label = "جاري التحميل..." }: { label?: string }) {
  return (
    <div className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-black/10 bg-white/82 p-8 text-sm font-bold text-slate-500 shadow-sm backdrop-blur">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(85,214,194,0.12),transparent_34%),radial-gradient(circle_at_76%_80%,rgba(184,167,255,0.12),transparent_36%)]" />
      <span className="relative ml-3 h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      <span className="relative">{label}</span>
    </div>
  )
}

