export function Textarea({ label, icon, value, onChange, placeholder, disabled }) {
  return (
    <label className="block">
      <span className="text-sm text-text/70">{label}</span>
      <div
        className={[
          'mt-2 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5',
          disabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        <span className="mt-0.5 text-text/60">{icon}</span>
        <textarea
          className="min-h-[90px] w-full resize-none bg-transparent outline-none placeholder:text-text/30"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </label>
  )
}

