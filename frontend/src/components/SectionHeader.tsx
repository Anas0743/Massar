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
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? (
        <p className="mx-auto mb-4 inline-flex rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-sm font-black text-primary-700 shadow-sm">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-black leading-tight text-ink sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}
    </div>
  )
}
