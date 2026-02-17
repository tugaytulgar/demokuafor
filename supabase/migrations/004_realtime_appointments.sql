-- Realtime: appointments tablosundaki değişiklikler (INSERT/UPDATE/DELETE) anlık gelsin.
-- Supabase SQL Editor'da aşağıdaki tek satırı yapıştırıp Run deyin.
-- (Zaten Dashboard → Database → Replication üzerinden açtıysanız "already member" hatası alabilirsiniz; yok sayın.)

ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
