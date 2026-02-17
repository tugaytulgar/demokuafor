export function Card({ className = '', children }) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur',
        'shadow-[0_0_0_1px_rgba(212,175,55,0.04),0_20px_80px_rgba(0,0,0,0.35)]',
        'p-5 sm:p-6',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

