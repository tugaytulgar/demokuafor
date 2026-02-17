# Faz 1: Altyapı ve Veritabanı (Supabase) – Detaylı Plan

Bu plan, **INSTRUCTIONS.md** Faz 1 maddeleri ile **kuaforrules** (iş kuralları, teknik stack, güvenlik) uyumlu olacak şekilde hazırlanmıştır.

---

## 1. Supabase Projesinin Yapılandırılması

| # | Görev | Açıklama |
|---|--------|----------|
| 1.1 | Supabase hesabı / proje | [supabase.com](https://supabase.com) üzerinden yeni proje oluştur. Region: yakın bölge (örn. Frankfurt). |
| 1.2 | Ortam değişkenleri | `.env.local` içinde `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` tanımla. Bu key'ler sadece anon (public) erişim için; RLS ile kısıtlanacak. |
| 1.3 | Supabase Client | Projede `src/services/supabase.js` (veya `supabaseClient.js`) oluştur; `@supabase/supabase-js` ile client initialize et. |
| 1.4 | Auth (Faz 1’de minimal) | Berber paneli için ileride kullanılacak Auth’u not et; Faz 1’de sadece DB + RLS ile “anon” ve “service_role” ayrımı yeterli. İsteğe bağlı: Berber girişi için bir `auth.users` / `profiles` planı. |

**Kural uyumu:** Backend = Supabase (Database, Auth, Edge Functions).

---

## 2. SQL Şeması

Kurallara göre: **45 dk slot**, **09:00–21:00** mesai, **12:00–13:00** öğle arası. Şema bu kurallarla uyumlu olacak şekilde tasarlanmalı.

### 2.1 Tablo: `services`

| Sütun | Tip | Açıklama |
|--------|------|----------|
| `id` | `uuid` (PK, default `gen_random_uuid()`) | Benzersiz kimlik |
| `isim` | `text` NOT NULL | Hizmet adı (örn. "Klasik Tıraş", "Saç Kesimi") |
| `fiyat` | `numeric(10,2)` NOT NULL | TL cinsinden fiyat |
| `sure_dakika` | `smallint` NOT NULL | Süre (dakika). **Kural:** Randevu slotu 45 dk; hizmet süresi 45’e eşit veya katı olabilir (45, 90 vb.). |
| `aciklama` | `text` | Opsiyonel açıklama |

- **Constraint:** `sure_dakika > 0` (ve isteğe bağlı: 45’in katı kontrolü uygulama tarafında).

### 2.2 Tablo: `barbers`

| Sütun | Tip | Açıklama |
|--------|------|----------|
| `id` | `uuid` (PK, default `gen_random_uuid()`) | Benzersiz kimlik |
| `isim` | `text` NOT NULL | Berber adı |
| `uzmanlik_alani` | `text` | Uzmanlık alanı (örn. "Sakal, Klasik Tıraş") |
| `fotoğraf_url` | `text` | Profil / galeri fotoğrafı URL |
| `aktif_mi` | `boolean` NOT NULL DEFAULT `true` | Listede gösterilsin mi, randevu alınabilsin mi |
| `created_at` | `timestamptz` DEFAULT `now()` | Kayıt zamanı |

### 2.3 Tablo: `appointments`

| Sütun | Tip | Açıklama |
|--------|------|----------|
| `id` | `uuid` (PK, default `gen_random_uuid()`) | Benzersiz kimlik |
| `musteri_adi` | `text` NOT NULL | Müşteri adı |
| `telefon` | `text` NOT NULL | **Türkiye formatı:** +90 5XX veya 05XX; validasyon uygulama + isteğe bağlı DB check. |
| `service_id` | `uuid` NOT NULL → `services(id)` | Hizmet |
| `barber_id` | `uuid` NOT NULL → `barbers(id)` | Berber |
| `tarih` | `date` NOT NULL | Randevu tarihi |
| `saat` | `time` NOT NULL | Başlangıç saati. **Kural:** 45 dk slot; 09:00–21:00; 12:00–13:00 bloklu. |
| `notlar` | `text` | Müşteri notu (örn. "Saçım çok uzun...") |
| `durum` | `text` NOT NULL DEFAULT `'bekliyor'` | Değerler: `'bekliyor'`, `'onaylandı'`, `'tamamlandı'`, `'iptal'` |
| `takip_kodu` | `text` UNIQUE | Randevu takip linki için benzersiz kod (Faz 2’de kullanılacak) |
| `created_at` | `timestamptz` DEFAULT `now()` | Oluşturulma zamanı |

- **Constraint:** `durum` için CHECK: `durum IN ('bekliyor','onaylandı','tamamlandı','iptal')`.
- **Conflict prevention:** Aynı `barber_id`, `tarih`, `saat` için çakışan randevu eklenmesin. Bunu:
  - Ya **unique partial index** (aktif randevular için) ile,
  - Ya da **trigger / application-level** kontrol ile sağlayacağız (Faz 1’de en az biri yapılacak).

**Kural uyumu:** 45 dk slot, 09:00–21:00, 12:00–13:00 blok, Türk telefon validasyonu, çakışma önleme.

---

## 3. Örnek SQL (Şema + Temel Constraint’ler)

Aşağıdaki SQL’i Supabase SQL Editor’da çalıştırabilirsin.

```sql
-- Services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isim text NOT NULL,
  fiyat numeric(10,2) NOT NULL,
  sure_dakika smallint NOT NULL CHECK (sure_dakika > 0),
  aciklama text,
  created_at timestamptz DEFAULT now()
);

-- Barbers
CREATE TABLE public.barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isim text NOT NULL,
  uzmanlik_alani text,
  fotograf_url text,
  aktif_mi boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Appointments
CREATE TABLE public.appointments (
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

-- Çakışma önleme: Aynı berber + tarih + saat (iptal olmayan) tek kayıt
CREATE UNIQUE INDEX idx_appointments_one_slot_per_barber
ON public.appointments (barber_id, tarih, saat)
WHERE durum != 'iptal';

-- Takip kodu için basit unique index (zaten UNIQUE var, opsiyonel)
-- CREATE UNIQUE INDEX idx_appointments_takip_kodu ON public.appointments (takip_kodu) WHERE takip_kodu IS NOT NULL;
```

---

## 4. Row Level Security (RLS) Politikaları

**Hedef (INSTRUCTIONS):** Müşteri sadece randevu ekleyebilsin; berber (yönetim) tüm randevuları görebilsin ve güncelleyebilsin.

Faz 1’de “berber” için Supabase Auth kullanmıyorsak, pratik yaklaşım:
- **Anon key:** Sadece belirli işlemlere izin ver (INSERT appointments, SELECT services, SELECT barbers).
- **Service role / Dashboard:** Berber paneli ileride Auth ile korunacak; şimdilik RLS’te “berber görsün hepsini” için bir policy tanımlanabilir (ör. `auth.role() = 'authenticated'` veya geçici olarak anon’a da SELECT all appointments verilip, paneli sonra kısıtlayabilirsin).

Aşağıdaki politikalar **anon** kullanıcı için “müşteri” senaryosuna göredir.

### 4.1 RLS’i Etkinleştir

```sql
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
```

### 4.2 `services` – Herkes (anon) okuyabilsin

```sql
CREATE POLICY "services_select_public"
ON public.services FOR SELECT
TO anon
USING (true);
```

### 4.3 `barbers` – Sadece aktif berberler listelensin (anon)

```sql
CREATE POLICY "barbers_select_active"
ON public.barbers FOR SELECT
TO anon
USING (aktif_mi = true);
```

### 4.4 `appointments`

- **Müşteri ekleyebilsin (anon):** Sadece INSERT; müşteri kendi eklediği kaydı görmesin gerekmez, takip linki ile görür (Faz 2).
- **Berber / panel tümünü görsün, güncellesin:** Faz 1’de bunu `authenticated` veya `service_role` ile yapabilirsin. Örnek: panel için ayrı bir “admin” rolü veya Auth sonrası `auth.uid()` ile berber eşlemesi.

Önerilen (anon = müşteri tarafı):

```sql
-- Müşteri yeni randevu ekleyebilir
CREATE POLICY "appointments_insert_anon"
ON public.appointments FOR INSERT
TO anon
WITH CHECK (true);

-- Müşteri kendi randevusunu takip_kodu ile görecek (Faz 2'de kullanılır)
-- Şimdilik: takip_kodu ile SELECT izni
CREATE POLICY "appointments_select_by_takip_kodu"
ON public.appointments FOR SELECT
TO anon
USING (true);  -- Faz 2'de: takip_kodu = current_setting('request.takip_kodu') gibi daraltılabilir
```

**Berber paneli** için (Faz 3’te Auth gelecek):  
- `authenticated` kullanıcılar için `SELECT`, `UPDATE` tüm `appointments` politikası eklenebilir.  
- Faz 1 çıktısı: Müşteri INSERT yapabilsin, gerekirse anon ile appointments’a SELECT de verilir (güvenlik Faz 2/3’te takip kodu ve Auth ile sıkılaştırılır).

---

## 5. İş Kurallarının Şemaya Yansıması (Özet)

| Kural (kuaforrules) | Faz 1 karşılığı |
|---------------------|------------------|
| 45 dk slot | `services.sure_dakika`; slot listesi uygulama tarafında 45 dk adımlarla hesaplanır. |
| 09:00–21:00 | Slot üretimi uygulama tarafında; DB’de sadece `saat` alanı. |
| 12:00–13:00 blok | Slot listesinde bu aralık çıkarılır (uygulama). |
| Türk telefon (+90 / 05xx) | `telefon` NOT NULL; validasyon `utils` / form’da (Faz 2). |
| Çakışma önleme | Unique index `(barber_id, tarih, saat)` WHERE `durum != 'iptal'`. |
| Real-time | Supabase Realtime; Faz 1’de tabloya abone olmak için hazırlık (channel’lar Faz 3’te kullanılacak). |

---

## 6. Faz 1 Kontrol Listesi

- [ ] **1. Supabase:** [supabase.com](https://supabase.com) üzerinden proje oluştur; `.env.local` dosyasını `.env.example` kopyalayıp `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` ile doldur.
- [ ] **2. Şema:** Supabase SQL Editor’da `supabase/migrations/001_initial_schema_and_rls.sql` dosyasını çalıştır (tablolar + RLS + seed).
- [x] **3. Constraint’ler:** Aynı SQL içinde: `durum` CHECK, `sure_dakika` CHECK, FK’lar ve çakışma önleyici unique index tanımlı.
- [x] **4. RLS:** Aynı migration’da tüm tablolarda RLS ve politikalar tanımlı.
- [x] **5. Supabase client:** `src/services/supabase.js` hazır.
- [x] **6. Seed:** Migration içinde örnek `services` ve `barbers` (tablolar boşsa eklenir).

**Proje komutları:** `npm install` → `npm run dev`. Faz 2’de landing ve randevu akışı bu altyapı üzerine eklenecek.
