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
        <p className="mx-auto mb-4 inline-flex rounded-full border border-black/10 bg-white/90 px-4 py-1.5 text-sm font-black text-primary-700 shadow-sm backdrop-blur">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">{title}</h2>
      <div className="masar-progress mx-auto mt-5 h-1.5 w-24 rounded-full" />
      {description ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">{description}</p> : null}
    </div>
  )
}
