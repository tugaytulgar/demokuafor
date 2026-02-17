export function Textarea({ label, icon, value, onChange, placeholder, disabled }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div
        className={[
          'mt-2 flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 px-3 py-2.5',
          disabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        <span className="mt-0.5 text-gray-500 dark:text-gray-400">{icon}</span>
        <textarea
          className="min-h-[90px] w-full resize-none bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </label>
  )
}

