import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

import { AdminPanel } from '../components/admin/AdminPanel'
import { Card } from '../components/ui/Card'

export default function AdminApp() {
  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <header className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-accent"
          >
            <Shield className="h-5 w-5" />
            <span className="text-sm tracking-widest uppercase">Yönetim Paneli</span>
          </motion.div>
        </header>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Card>
          <AdminPanel />
        </Card>
      </main>
    </div>
  )
}

