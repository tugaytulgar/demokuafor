-- Faz 1: Kuaför Randevu – Şema + RLS + Seed
-- Supabase SQL Editor'da tek seferde çalıştırılabilir.

-- ========== TABLOLAR ==========

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isim text NOT NULL,
  fiyat numeric(10,2) NOT NULL,
  sure_dakika smallint NOT NULL CHECK (sure_dakika > 0),
  aciklama text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isim text NOT NULL,
  uzmanlik_alani text,
  fotograf_url text,
  aktif_mi boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  musteri_adi text NOT NULL,
  telefon text NOT NULL,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE RESTRICT,
  tarih date NOT NULL,
  saat time NOT NULL,
  notlar text,
  durum text NOT NULL DEFAULT 'bekliyor'
    CHECK (durum IN ('bekliyor','onaylandı','tamamlandı','iptal')),
  takip_kodu text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Çakışma önleme: Aynı berber + tarih + saat (iptal hariç) tek kayıt
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_one_slot_per_barber
ON public.appointments (barber_id, tarih, saat)
WHERE durum != 'iptal';

-- ========== RLS ==========

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- services: herkes (anon) okuyabilsin
DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public"
ON public.services FOR SELECT TO anon USING (true);

-- barbers: sadece aktif berberler (anon)
DROP POLICY IF EXISTS "barbers_select_active" ON public.barbers;
CREATE POLICY "barbers_select_active"
ON public.barbers FOR SELECT TO anon USING (aktif_mi = true);

-- appointments: müşteri ekleyebilsin
DROP POLICY IF EXISTS "appointments_insert_anon" ON public.appointments;
CREATE POLICY "appointments_insert_anon"
ON public.appointments FOR INSERT TO anon WITH CHECK (true);

-- appointments: takip linki için okuma (Faz 2'de daraltılabilir)
DROP POLICY IF EXISTS "appointments_select_anon" ON public.appointments;
CREATE POLICY "appointments_select_anon"
ON public.appointments FOR SELECT TO anon USING (true);

-- ========== SEED (örnek veri – tablolar boşsa bir kez çalıştırın) ==========

INSERT INTO public.services (isim, fiyat, sure_dakika, aciklama)
SELECT * FROM (VALUES
  ('Klasik Tıraş'::text, 150.00, 45, 'Geleneksel ustura tıraşı'::text),
  ('Saç Kesimi', 120.00, 45, 'Modern saç kesimi'),
  ('Sakal Düzeltme', 80.00, 30, 'Sakal şekillendirme'),
  ('Saç + Sakal', 200.00, 60, 'Kombine hizmet')
) AS v(isim, fiyat, sure_dakika, aciklama)
WHERE NOT EXISTS (SELECT 1 FROM public.services LIMIT 1);

INSERT INTO public.barbers (isim, uzmanlik_alani, fotograf_url, aktif_mi)
SELECT * FROM (VALUES
  ('Ahmet Usta'::text, 'Klasik Tıraş, Sakal'::text, NULL::text, true),
  ('Mehmet Bey', 'Saç Kesimi, Styling', NULL, true)
) AS v(isim, uzmanlik_alani, fotograf_url, aktif_mi)
WHERE NOT EXISTS (SELECT 1 FROM public.barbers LIMIT 1);
