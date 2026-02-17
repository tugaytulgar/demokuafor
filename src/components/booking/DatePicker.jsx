export function DatePicker({ value, onChange, min, disabled, warning }) {
  return (
    <div>
      <label className="block">
        <span className="text-sm text-text/70">Tarih</span>
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={[
            'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none',
            'text-text placeholder:text-text/30',
            disabled ? 'opacity-60' : '',
          ].join(' ')}
        />
      </label>
      {warning ? <p className="mt-2 text-xs text-amber-200">{warning}</p> : null}
    </div>
  )
}

