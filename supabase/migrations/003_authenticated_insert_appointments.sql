-- Faz 3/Hotfix: Admin oturumu açıkken de randevu oluşturulabilsin.
-- Problem: Tarayıcıda authenticated session varken anon policy uygulanmaz.
-- Çözüm: authenticated rolüne INSERT izni ver.

DROP POLICY IF EXISTS "appointments_insert_authenticated" ON public.appointments;
CREATE POLICY "appointments_insert_authenticated"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (true);

