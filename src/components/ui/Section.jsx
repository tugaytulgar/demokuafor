export function Section({ title, subtitle, className = '', children }) {
  return (
    <section className={className}>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        {subtitle ? <p className="mt-2 text-text/70">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

