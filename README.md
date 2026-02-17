# Kuaför Randevu Sistemi

Erkek kuaförü için modern randevu yönetim platformu (React + Vite + Tailwind + Supabase).

## Kurulum (Supabase SQL Editor)

SQL’i çalıştırırken **dosya yolunu değil**, dosyanın **içindeki SQL metnini** kopyalayıp yapıştırın, sonra Run deyin.

- **Şema + RLS + seed:** `supabase/migrations/001_initial_schema_and_rls.sql` içeriği
- **Yönetim paneli RLS:** `supabase/migrations/002_admin_rls_policies.sql` içeriği
- **Authenticated randevu ekleme:** `supabase/migrations/003_authenticated_insert_appointments.sql` içeriği
- **Canlı bildirim (Realtime):** `supabase/migrations/004_realtime_appointments.sql` içeriği — yönetim panelinde yeni randevu anında görünsün ve ses çalsın

Ortam: `.env.example` → `.env.local`, `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY`. İsteğe bağlı: `VITE_WHATSAPP_NUMBER=905321234567` (randevu sonrası WhatsApp butonu).

## Çalıştırma

```bash
npm install
npm run dev
```

## GitHub’a yükleme ve GitHub Pages ile yayına alma

1. **Repoyu GitHub’da oluştur**  
   GitHub’da yeni repo aç (örn. `kuafor`). README ekleme, .gitignore ekleme seçme; proje zaten hazır.

2. **Projeyi GitHub’a bağla ve push et** (henüz git yoksa):
   ```bash
   git init
   git add .
   git commit -m "İlk commit"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADIN/kuafor.git
   git push -u origin main
   ```
   `KULLANICI_ADIN` ve `kuafor` yerine kendi kullanıcı adın ve repo adını yaz.

3. **Supabase anahtarlarını GitHub’a ekle**  
   Repo **Settings > Secrets and variables > Actions** bölümüne git. **New repository secret** ile şunları ekle:
   - `VITE_SUPABASE_URL` → Supabase proje URL’in
   - `VITE_SUPABASE_ANON_KEY` → Supabase anon (public) key’in  

   (WhatsApp numarası isteğe bağlı: **Variables** kısmına `VITE_WHATSAPP_NUMBER` ekleyebilirsin.)

4. **GitHub Pages’i aç**  
   Aynı repoda **Settings > Pages**:
   - **Source:** “GitHub Actions” seçin.
   - Kaydedince her `main` push’unda workflow çalışır; birkaç dakika sonra site yayında olur.

5. **Site adresi**  
   Proje sayfası şu formatta açılır:  
   **https://KULLANICI_ADIN.github.io/REPO_ADI/**  
   (Örn. repo adı `kuafor` ise: `https://kullanici.github.io/kuafor/`)

Varsayılan branch’in `master` ise `.github/workflows/deploy-pages.yml` içinde `branches: [main]` satırını `branches: [master]` yap.

---

## Yayına alma (build & hosting, manuel)

```bash
npm run build
```

Çıktı `dist/` klasöründedir. Natro/cPanel gibi statik hosting’e `dist/` içeriğini yükleyin. Apache kullanıyorsanız `dist/` içindeki `.htaccess` ile SPA yönlendirmesi (React Router) otomatik çalışır. Alt klasörde yayınlıyorsanız `vite.config.js` içinde `base: '/alt-klasor/'` tanımlayın.

## PWA (telefona kurulum)

Site `manifest.webmanifest` ve tema rengi ile PWA uyumludur; tarayıcı “Ana ekrana ekle” / “Uygulama olarak yükle” sunabilir. İkon için `public/favicon.svg` kullanılıyor; isterseniz 192×192 ve 512×512 PNG ikonlar ekleyip manifest’e ekleyebilirsiniz.

## Proje yapısı

- `src/components` – React bileşenleri
- `src/hooks` – Özel hook’lar
- `src/services` – Supabase client ve API
- `src/styles` – Global CSS (Tailwind)
- `src/utils` – Sabitler (mesai, slot süresi), telefon validasyonu

Genel kurallar ve faz planı: `INSTRUCTIONS.md`, `docs/FAZ1-PLAN.md`.
