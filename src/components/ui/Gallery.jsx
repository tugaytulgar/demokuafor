import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const BASE = import.meta.env.BASE_URL || '/'

/** Galeri: küçük kareler, tıklayınca büyük lightbox; tekrar tıklayınca kapanır. Tema ile uyumlu. */
export function Gallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const open = (index) => setLightboxIndex(index)
  const close = () => setLightboxIndex(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => open(i)}
            className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 dark:border-white/10 dark:bg-white/5 hover:border-accent/40 hover:ring-2 hover:ring-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          >
            <img
              src={BASE + src}
              alt={`Galeri ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Galeri büyük görünüm"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-text hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={BASE + images[lightboxIndex]}
                alt={`Galeri ${lightboxIndex + 1}`}
                className="w-full h-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
