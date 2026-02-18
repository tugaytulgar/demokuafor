import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scissors } from 'lucide-react'

const TEXT = 'Kuaför'
const LETTER_DURATION_MS = 120
const HOLD_DURATION_MS = 5000
const CUT_CYCLE_MS = 6000 // typewriter + hold = ~1s + 5s
const CUT_ANIMATION_MS = 400

/** Her 5–6 saniyede bir kesme hareketi yapan makas ikonu (tek başına kullanım için). */
export function ScissorsCutIcon({ className = '', size = 'h-4 w-4' }) {
  const [cut, setCut] = useState(false)
  useEffect(() => {
    const run = () => {
      setCut(true)
      const t = setTimeout(() => setCut(false), CUT_ANIMATION_MS)
      return () => clearTimeout(t)
    }
    run()
    const id = setInterval(run, CUT_CYCLE_MS)
    return () => clearInterval(id)
  }, [])
  return (
    <motion.span
      animate={cut ? { rotate: [-2, 6, -2], scale: [1, 1.08, 1] }}
      transition={{ duration: CUT_ANIMATION_MS / 1000, ease: 'easeInOut' }}
      className={`inline-flex shrink-0 ${className}`}
    >
      <Scissors className={size} strokeWidth={2.2} />
    </motion.span>
  )
}

/**
 * Makas ikonu: Her 5–6 saniyede bir kırpma (kesme) hareketi, sonra sabit.
 * Kuaför yazısı: Harfler tek tek gelir, 5 sn sabit kalır, sonra tekrar kayan yazı.
 */
export function AnimatedLogo({ className = '', iconSize = 'h-6 w-6', asLink = true, to = '/' }) {
  const [visibleLength, setVisibleLength] = useState(0)
  const [cut, setCut] = useState(false)

  // Typewriter: 0..6 harf, sonra 5sn bekle, sıfırla
  useEffect(() => {
    if (visibleLength < TEXT.length) {
      const t = setTimeout(() => setVisibleLength((n) => n + 1), LETTER_DURATION_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisibleLength(0), HOLD_DURATION_MS)
    return () => clearTimeout(t)
  }, [visibleLength])

  // Makas: Her CUT_CYCLE_MS’te bir kesme animasyonu
  useEffect(() => {
    const runCut = () => {
      setCut(true)
      const stop = setTimeout(() => setCut(false), CUT_ANIMATION_MS)
      return () => clearTimeout(stop)
    }
    const id = setInterval(runCut, CUT_CYCLE_MS)
    runCut() // ilk kesme hemen
    return () => clearInterval(id)
  }, [])

  const content = (
    <span className={`inline-flex items-center gap-2 text-accent ${className}`}>
      <motion.span
        animate={cut ? { rotate: [-2, 6, -2], scale: [1, 1.08, 1] }}
        transition={{ duration: CUT_ANIMATION_MS / 1000, ease: 'easeInOut' }}
        className="inline-flex shrink-0"
      >
        <Scissors className={iconSize} strokeWidth={2.2} />
      </motion.span>
      <span className="font-semibold text-lg inline-block min-w-[4.5rem]">
        {TEXT.slice(0, visibleLength)}
        {visibleLength < TEXT.length && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="inline-block w-0.5 h-5 align-middle bg-current ml-0.5"
            aria-hidden
          />
        )}
      </span>
    </span>
  )

  if (asLink && to) {
    return <Link to={to}>{content}</Link>
  }
  return content
}
