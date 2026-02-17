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
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div
        className={[
          'mt-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 px-3 py-2.5',
          disabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        <span className="text-gray-500 dark:text-gray-400">{icon}</span>
        <input
          type={type}
          className="w-full bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
            hintTone === 'danger' ? 'text-red-600 dark:text-red-200' : 'text-gray-500 dark:text-gray-400',
          ].join(' ')}
        >
          {hint}
        </span>
      ) : null}
    </label>
  )
}

