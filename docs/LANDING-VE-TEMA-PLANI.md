# Plan: Tanıtım Sitesi + Randevu Sayfası + Karanlık/Aydınlık Tema

## 1. Amaç

- **Ana sayfa (`/`):** Firma tanıtım sitesi. Randevu almayan ziyaretçi sadece siteyi gezer (hizmetler, berberler, galeri, yorumlar).
- **Randevu sayfası (`/randevu`):** "Online randevu al" butonuna basınca açılır; mevcut randevu akışı (hizmet/berber/tarih/saat, form, sorgula, takip) burada olur.
- **Tema:** Karanlık ve aydınlık tema seçilebilir; tercih saklansın (localStorage).

---

## 2. Sayfa ve Route Yapısı

| Route       | İçerik |
|------------|--------|
| `/`        | **Tanıtım (Landing):** Hero, hizmetler özeti, berberler, galeri, yorumlar, CTA "Online randevu al". |
| `/randevu` | **Randevu akışı:** Mevcut müşteri sayfası (hizmet/berber/tarih/saat seçimi, form, randevu sorgula, takip). |
| `/yonetim` | **Yönetim paneli:** Mevcut admin (değişmez). |

---

## 3. Tanıtım Sayfası (Landing) İçeriği

- **Hero:** Büyük başlık, kısa slogan, arka plan (görsel/video), tek net CTA: **"Online randevu al"** → `/randevu` linki.
- **Hizmetler:** Mevcut `services` verisinden veya statik kartlarla kısa liste (isim, kısa açıklama, isteğe bağlı fiyat).
- **Berberler:** Mevcut `barbers` ile kısa tanıtım (isim, uzmanlık, isteğe bağlı fotoğraf).
- **Galeri:** Mevcut placeholder galeri (grid, görseller).
- **Müşteri yorumları:** Mevcut statik yorumlar.
- **Footer:** İletişim, adres, WhatsApp (isteğe bağlı).
- **Header:** Logo/site adı + menü (Ana sayfa, Hizmetler, Berberler, Galeri, Yorumlar – anchor veya bölüm id) + **"Online randevu al"** butonu + **tema değiştirici** (güneş/ay ikonu).

---

## 4. Tema (Karanlık / Aydınlık)

- **Yaklaşım:** Tailwind `dark:` sınıfları + `<html class="dark">` veya `class="light"`. Tema tercihi `localStorage` ile saklansın (`theme: 'dark' | 'light'`).
- **Renkler:**
  - **Karanlık (mevcut):** Arka plan `#0A0A0A`, metin `#F5F5F5`, vurgu `#D4AF37`.
  - **Aydınlık:** Açık arka plan (örn. `#FAFAFA`), koyu metin (örn. `#171717`), vurgu yine altın veya koyu altın.
- **Toggle:** Header’da veya sabit köşede ikon (güneş ↔ ay). Tıklanınca tema değişsin, sayfa yenilenmeden güncellensin.
- **Uygulama:** Bir **ThemeContext** (veya basit hook + DOM’da `document.documentElement.className`) ile tema state’i ve localStorage okuma/yazma. Bileşenlerde hem normal hem `dark:` sınıfları kullanılacak; böylece hem landing hem randevu hem yönetim aynı tema sistemine bağlanır.

---

## 5. Fazlar (Uygulama Sırası)

### Faz 1: Routing ve Landing iskeleti
- [x] `App.jsx`: `/` → yeni `LandingPage`, `/randevu` → `CustomerApp`, `/yonetim` → `AdminApp`.
- [x] Yeni bileşen: `LandingPage` (veya `HomePage`) – hero, hizmetler, berberler, galeri, yorumlar bölümleri; CTA "Online randevu al" → `Link to="/randevu"`.
- [x] `CustomerApp` sadece `/randevu` için: üstte kısa başlık ("Online randevu") + mevcut form + randevu sorgula + takip. Gereksiz tekrarlayan tanıtım blokları kaldırılabilir.

### Faz 2: Tema altyapısı
- [ ] `tailwind.config`: `darkMode: 'class'` (zaten varsa kontrol).
- [ ] `ThemeContext` (veya tema hook’u): tema state, localStorage okuma/yazma, `document.documentElement.classList.add('dark')` / `remove('dark')`.
- [ ] Uygulama ilk yüklendiğinde localStorage’dan okuyup `<html>` sınıfını ayarla.

### Faz 3: Tema toggle ve stiller
- [ ] Tema toggle bileşeni (güneş/ay ikonu); header’da kullan (landing + mümkünse randevu sayfasında).
- [ ] Landing ve gerekirse randevu bileşenlerinde aydınlık tema için `dark:` ile ayrılmış arka plan ve metin renkleri.

### Faz 4: İnce ayar ve test
- [ ] Tüm sayfalarda tema tutarlı; "Online randevu al" her yerden `/randevu`’ya gidiyor.
- [ ] Sayfa yenilenince tema tercihi korunuyor.

---

## 6. Özet

- Ana sayfa = firma tanıtımı; randevu almayan da gezebilir.
- "Online randevu al" → `/randevu`; mevcut randevu sistemi orada.
- Karanlık/aydınlık tema seçilebilir, tercih saklanır.
