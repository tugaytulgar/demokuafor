export function Card({ className = '', children }) {
  return (
    <div
      className={[
        'rounded-2xl border border-gray-200 bg-gray-50/90 backdrop-blur dark:border-white/10 dark:bg-white/5',
        'shadow-sm dark:shadow-[0_0_0_1px_rgba(212,175,55,0.04),0_20px_80px_rgba(0,0,0,0.35)]',
        'p-5 sm:p-6',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

