export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      {eyebrow ? (
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-5 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_0_5px_rgba(85,214,194,0.16)]" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-4xl font-black leading-[1.18] text-ink sm:text-5xl lg:text-6xl">{title}</h2>
      <div className="masar-progress mx-auto mt-6 h-1.5 w-28 rounded-full" />
      {description ? <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{description}</p> : null}
    </div>
  )
}
