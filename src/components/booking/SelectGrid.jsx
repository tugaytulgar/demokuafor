export function SelectGrid({
  title,
  icon,
  items,
  loading,
  error,
  selectedId,
  onSelect,
  getItemTitle,
  getItemSubtitle,
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-accent">
        <span className="text-accent">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>

      {loading ? <p className="text-sm text-gray-600 dark:text-gray-400">Yükleniyor…</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-200">Hata: {String(error.message || error)}</p> : null}

      {!loading && !error ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((it) => {
            const active = it.id === selectedId
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onSelect?.(it.id)}
                className={[
                  'text-left rounded-2xl border-2 px-4 py-3 transition-colors min-h-[52px]',
                  active
                    ? 'border-accent bg-accent/20 ring-2 ring-accent/40 dark:border-accent dark:bg-accent/20 dark:ring-accent/40'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25 dark:hover:bg-white/10',
                ].join(' ')}
              >
                <div className="font-medium text-gray-900 dark:text-text">{getItemTitle(it)}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{getItemSubtitle?.(it)}</div>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

