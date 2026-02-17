export function Input({
  label,
  icon,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  hint,
  hintTone = 'muted',
}) {
  return (
    <label className="block">
      <span className="text-sm text-text/70">{label}</span>
      <div
        className={[
          'mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5',
          disabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        <span className="text-text/60">{icon}</span>
        <input
          type={type}
          className="w-full bg-transparent outline-none placeholder:text-text/30"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      {hint ? (
        <span
          className={[
            'mt-2 block text-xs',
            hintTone === 'danger' ? 'text-red-200' : 'text-text/60',
          ].join(' ')}
        >
          {hint}
        </span>
      ) : null}
    </label>
  )
}

