import { useEffect } from 'react'

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => onClose?.(), 3500)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  const tone =
    toast.type === 'success'
      ? 'border-emerald-400/30 bg-emerald-400/10'
      : 'border-red-400/30 bg-red-400/10'

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <div className={['w-full max-w-md rounded-2xl border px-4 py-3 backdrop-blur', tone].join(' ')}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{toast.title}</p>
            {toast.message ? <p className="mt-1 text-sm text-text/70">{toast.message}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-text/70 hover:text-text"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

