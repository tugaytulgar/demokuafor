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

      {loading ? <p className="text-sm text-text/70">Yükleniyor…</p> : null}
      {error ? <p className="text-sm text-red-200">Hata: {String(error.message || error)}</p> : null}

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
                  'text-left rounded-2xl border px-4 py-3 transition-colors',
                  active ? 'border-accent/50 bg-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10',
                ].join(' ')}
              >
                <div className="font-medium">{getItemTitle(it)}</div>
                <div className="mt-1 text-sm text-text/70">{getItemSubtitle?.(it)}</div>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

