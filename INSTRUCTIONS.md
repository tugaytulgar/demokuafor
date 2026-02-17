# Erkek Kuaförü Modern Randevu Sistemi - Proje Planı

Bu proje, yüksek kaliteli bir erkek berberi için modern, hızlı ve kullanıcı dostu bir randevu yönetim platformu oluşturmayı hedefler.

## 🚀 Faz 1: Altyapı ve Veritabanı (Supabase)
- [ ] Supabase projesini yapılandır.
- [ ] **SQL Şeması:** - `services`: (id, isim, fiyat, süre, açıklama)
    - `barbers`: (id, isim, uzmanlık_alanı, fotoğraf_url, aktif_mi)
    - `appointments`: (id, müşteri_adı, telefon, service_id, barber_id, tarih, saat, notlar, durum: 'bekliyor','onaylandı','tamamlandı','iptal')
- [ ] Row Level Security (RLS) politikalarını ayarla (Müşteri ekleme yapabilir, Berber tümünü görebilir).

## 🎨 Faz 2: Müşteri Deneyimi (Frontend)
- [ ] **Landing Page:** - Hero alanı (Video background veya yüksek kaliteli berber görseli).
    - "Berberini Seç" ve "Hizmetini Seç" interaktif alanları.
    - Galeri ve Müşteri Yorumları alanı.
- [ ] **Akıllı Randevu Akışı:**
    - Dinamik slot hesaplama (Berberin dolu olduğu saatleri DB'den çekip gizle).
    - Tarih seçici (Pazar günleri kapalı ise otomatik devre dışı bırak).
    - Not alanı (Örn: "Saçım çok uzun, ekstra özen rica ederim").
- [ ] **Premium Özellikler:**
    - "Add to Calendar": Randevu sonrası Google/Apple takvime ekleme butonu.
    - Randevu Takip Linki: Müşteriye randevu sonrası verilen, durumunu görebileceği benzersiz link.

## 🛠 Faz 3: Berber / Yönetim Paneli
- [ ] **Canlı Dashboard:**
    - Anlık düşen randevular için sesli veya görsel bildirim.
    - "Sıradaki Müşteri" widget'ı.
- [ ] **Gelişmiş Raporlama:**
    - Günlük/Haftalık ciro tahmini.
    - En çok tercih edilen berber ve en popüler hizmet grafikleri.
- [ ] **Müşteri Yönetimi:**
    - Kayıtlı müşterilerin tıraş geçmişini görebilme (Hangi tarihte ne işlem yapılmış).

## 📲 Faz 4: Bildirim ve Entegrasyonlar
- [ ] **SMS Altyapısı (Hazırlık):**
    - Netgsm/MutluCell API entegrasyonu için merkezi bir `smsService.js` oluştur.
    - Şablonlar: "Onay", "Hatırlatma (1 saat kala)", "İptal".
- [ ] **WhatsApp Yönlendirme:**
    - Randevu sonunda "Sorunuz varsa WhatsApp'tan yazın" butonu.

## 🛠 Faz 5: Yayına Hazırlık ve Optimizasyon
- [ ] SEO Meta etiketlerinin (Barber, Haircut, Appointment keywords) eklenmesi.
- [ ] PWA (Progressive Web App) desteği: Berberin siteyi telefonuna "Uygulama" olarak indirebilmesi için manifest ayarları.
- [ ] `npm run build` ile hosting (Natro/cPanel) uyumlu çıktı üretimi.

---

### 💡 Ekstra Gelişmiş Fikirler (Müşteriye Sunulacaklar)
1. **Sadakat Kartı (Digital Loyalty):** 5 randevuda 1 bakım hediye gibi bir sayaç.
2. **Ön Ödeme Seçeneği:** (İsteğe bağlı) İyzico/Paytr ile randevu anında kaparo alabilme altyapısı.
3. **Önce/Sonra Galerisi:** Berberlerin yaptığı işleri sergileyebileceği dinamik bir portfolyo alanı.