# VakıfBank Yapay Zeka Destekli Akıllı Bankacılık (Super App) Projesi

## 1. Projenin Amacı ve Vizyonu
Geleneksel kredi hesaplama araçlarının ötesine geçerek; kullanıcının finansal sağlığını koruyan, açık bankacılık verilerini konsolide eden ve kredi riskini ""Makine Öğrenimi"" yaklaşımlarıyla otomatik hesaplayan yeni nesil bir ""FinTech Super App"" geliştirilmiştir.

## 2. Teknik Mimari (.NET & Angular)
* **Önyüz (Frontend):** Angular 18 (Standalone Components). Tasarım dili olarak Glassmorphism (Buzlu Cam) kullanıldı. Performans için harici kütüphaneler yerine saf CSS ve SVG'ler tercih edildi.
* **Arkayüz (Backend):** .NET 8 (C#) ASP.NET Core Web API. Tüm işlemler yüksek trafiğe dayanıklı olması için asenkron (async/await) mimariyle yazıldı.
* **Veritabanı:** Microsoft SQL Server (LocalDB) & Entity Framework Core ORM kullanılarak güvenlik maksimize edildi (SQL Injection koruması).

## 3. Yenilikçi Modüller (Özellikler)
* **Kredi Sihirbazı:** Müşterinin amacına (Örn: Düğün, Araç) ve bütçesine göre en uygun kredi/vade kombinasyonunu yapay zeka ile otomatik belirler.
* **Akıllı Başvuru (OCR Simülasyonu):** Müşterinin kimlik ve gelir bilgilerini otomatik okuma simülasyonu ile formları anında doldurur.
* **Kumbaram (Tasarruf Modülü):** ""Kredi çekip faiz ödemek"" ile ""Biriktirip gelir elde etmek"" arasındaki finansal tabloyu şeffaf bir şekilde kıyaslayarak müşteriye sunar.
* **Açık Bankacılık & Profilim:** Kullanıcının diğer bankalardaki (Örn: Ziraat, Garanti) borçlarını tek ekranda toplayıp ""Tek Kredide Birleştir"" teklifi yapar.
* **Harcama Analizi:** CSS Pie-chart ile müşterinin aylık harcamalarını görselleştirir.

## 4. Yapay Zeka ve Risk Analizi Altyapısı
* **Teknoloji:** Microsoft ML.NET (Uygulamanın asenkron C# mimarisiyle sıfır gecikmeyle (zero-latency) çalışması için Python yerine tercih edildi).
* **Veri Seti:** Dünyaca ünlü **""German Credit Data"" (Statlog)** veri setinin kredi kuralları referans alınarak, VakıfBank müşteri dinamiklerine uygun ""Sentetik Kredi Risk Veri Seti"" oluşturuldu.
* **Algoritma:** Finansal sınıflandırmalarda en iyi sonucu veren **SDCA Maximum Entropy (Stochastic Dual Coordinate Ascent)** çok sınıflı algoritması kullanıldı. Ayrıca kategorik veriler için ""One-Hot Encoding"" yapıldı.
* **Sahtekarlık (Fraud) Tespiti:** Mantık dışı başvuruları (Örn: Öğrencinin çok yüksek tutar istemesi) Banka Yöneticisi panelinde otomatik tespit eder.
* **What-If Modeli:** Yüksek riskli müşteriyi direkt reddetmek yerine arka planda simülasyon çalıştırarak ""Vadeyi uzatırsanız kredi onaylanır"" tavsiyesi verir.