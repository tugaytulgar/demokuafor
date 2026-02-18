import { Link } from 'react-router-dom'
import { CalendarDays, User } from 'lucide-react'
import { motion } from 'framer-motion'

import { useBarbers } from '../hooks/useBarbers'
import { useServices } from '../hooks/useServices'

import { Card } from '../components/ui/Card'
import { Section } from '../components/ui/Section'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { AnimatedLogo, ScissorsCutIcon } from '../components/ui/AnimatedLogo'
import { Gallery } from '../components/ui/Gallery'

const GALLERY_IMAGES = [
  'gallery/gorsel1.png',
  'gallery/gorsel2.png',
  'gallery/gorsel3.png',
  'gallery/gorsel4.png',
]

export default function LandingPage() {
  const servicesState = useServices()
  const barbersState = useBarbers()

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <header className="relative mx-auto max-w-6xl px-4 py-6 flex flex-wrap items-center justify-between gap-4">
          <AnimatedLogo iconSize="h-6 w-6" />
          <nav className="flex flex-wrap items-center gap-4">
            <a href="#hizmetler" className="text-sm text-gray-600 hover:text-accent dark:text-gray-400 dark:hover:text-accent transition-colors">
              Hizmetler
            </a>
            <a href="#berberler" className="text-sm text-gray-600 hover:text-accent dark:text-gray-400 dark:hover:text-accent transition-colors">
              Berberler
            </a>
            <a href="#galeri" className="text-sm text-gray-600 hover:text-accent dark:text-gray-400 dark:hover:text-accent transition-colors">
              Galeri
            </a>
            <a href="#yorumlar" className="text-sm text-gray-600 hover:text-accent dark:text-gray-400 dark:hover:text-accent transition-colors">
              Yorumlar
            </a>
            <ThemeToggle />
            <Link
              to="/randevu"
              className="inline-flex items-center gap-2 rounded-xl bg-accent text-background px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <CalendarDays className="h-4 w-4" />
              Online randevu al
            </Link>
          </nav>
        </header>

        <section className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <p className="inline-flex items-center gap-2 text-accent text-sm tracking-widest uppercase mb-4">
              <ScissorsCutIcon size="h-4 w-4" />
              Erkek Kuaförü & Berber
            </p>
            <h1 className="text-4xl sm:text-6xl font-semibold leading-tight">
              Tarzınız, <span className="text-accent">Bizim İşimiz</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              Saç kesimi, sakal tıraşı ve bakım hizmetleri. Randevunuzu online alın, beklemeden kapımızda olun.
            </p>
            <Link
              to="/randevu"
              className="inline-flex items-center gap-2 mt-10 rounded-xl bg-accent text-background px-8 py-4 text-base font-medium hover:opacity-90 transition-opacity"
            >
              <CalendarDays className="h-5 w-5" />
              Online randevu al
            </Link>
          </motion.div>
        </section>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <Section id="hizmetler" title="Hizmetler" subtitle="Size uygun hizmeti seçin, randevuda berberiniz hazır olsun." className="pt-14">
          {servicesState.loading ? (
            <p className="text-gray-500 dark:text-gray-400">Yükleniyor…</p>
          ) : servicesState.error ? (
            <p className="text-red-200 text-sm">Hizmetler yüklenemedi.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(servicesState.data || []).map((s) => (
                <Card key={s.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-accent/10 p-2.5">
                      <ScissorsCutIcon size="h-5 w-5" className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{s.isim}</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {Number(s.fiyat).toLocaleString('tr-TR')} ₺ • {s.sure_dakika} dk
                      </p>
                      {s.aciklama ? <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{s.aciklama}</p> : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-6">
            <Link to="/randevu" className="text-accent hover:underline text-sm font-medium">
              Randevu al →
            </Link>
          </div>
        </Section>

        <Section id="berberler" title="Berberlerimiz" subtitle="Deneyimli ekibimizle tanışın." className="pt-14">
          {barbersState.loading ? (
            <p className="text-gray-500 dark:text-gray-400">Yükleniyor…</p>
          ) : barbersState.error ? (
            <p className="text-red-200 text-sm">Berberler yüklenemedi.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(barbersState.data || []).map((b) => (
                <Card key={b.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-gray-200 dark:bg-white/10 w-14 h-14 flex items-center justify-center shrink-0">
                      <User className="h-7 w-7 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{b.isim}</h3>
                      {b.uzmanlik_alani ? (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{b.uzmanlik_alani}</p>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-6">
            <Link to="/randevu" className="text-accent hover:underline text-sm font-medium">
              Randevu al →
            </Link>
          </div>
        </Section>

        <Section id="galeri" title="Galeri" subtitle="Tarz ve detay odaklı işçilik." className="pt-14">
          <Gallery images={GALLERY_IMAGES} />
        </Section>

        <Section id="yorumlar" title="Müşteri Yorumları" subtitle="Kalite, hız ve konfor." className="pt-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Mert', text: 'Temiz, hızlı ve çok profesyonel.' },
              { name: 'Can', text: 'Slot sistemi harika, bekleme yok.' },
              { name: 'Eren', text: 'Sakal işçiliği gerçekten üst seviye.' },
            ].map((t) => (
              <Card key={t.name} className="h-full p-5">
                <p className="text-gray-700 dark:text-gray-300">"{t.text}"</p>
                <p className="mt-3 text-sm text-accent">{t.name}</p>
              </Card>
            ))}
          </div>
        </Section>

        <section className="pt-14 pb-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Randevunuzu hemen alın, beklemeden kapımızda olun.</p>
          <Link to="/randevu" className="inline-flex items-center gap-2 mt-4 text-accent font-medium hover:underline">
            <CalendarDays className="h-4 w-4" />
            Online randevu al
          </Link>
        </section>
      </main>
    </div>
  )
}
