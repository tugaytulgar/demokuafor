-- Faz 3: Yönetim paneli için RLS politikaları
-- Bunu Supabase SQL Editor'da çalıştırın.

-- Authenticated kullanıcılar (yönetim) services ve barbers'ı okuyabilsin
DROP POLICY IF EXISTS "services_select_authenticated" ON public.services;
CREATE POLICY "services_select_authenticated"
ON public.services FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "barbers_select_authenticated" ON public.barbers;
CREATE POLICY "barbers_select_authenticated"
ON public.barbers FOR SELECT
TO authenticated
USING (true);

-- Appointments: yönetim tüm randevuları görebilsin
DROP POLICY IF EXISTS "appointments_select_authenticated" ON public.appointments;
CREATE POLICY "appointments_select_authenticated"
ON public.appointments FOR SELECT
TO authenticated
USING (true);

-- Appointments: yönetim durum güncelleyebilsin
DROP POLICY IF EXISTS "appointments_update_authenticated" ON public.appointments;
CREATE POLICY "appointments_update_authenticated"
ON public.appointments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

