export function Section({ id, title, subtitle, className = '', children }) {
  return (
    <section id={id} className={className}>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        {subtitle ? <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

