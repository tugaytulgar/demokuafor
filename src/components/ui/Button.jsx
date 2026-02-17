export function Button({ type = 'button', disabled, loading, children, onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium',
        'transition-colors',
        disabled || loading
          ? 'bg-white/10 text-text/40 cursor-not-allowed'
          : 'bg-accent text-background hover:bg-accent/90',
      ].join(' ')}
    >
      {loading ? 'İşleniyor…' : children}
    </button>
  )
}

