# K2 · Backend ve Veri — haftalık görevler

Klasörün: `k2-backend/` · Başlangıç: 5 Eki 2026 (Pazartesi)

Her hafta başında o haftanın görevini GitHub'da Issue olarak aç, hafta sonunda Pull Request ile kapat.
Dosya yolları aksi yazmıyorsa kendi klasörüne göredir. `(hazır)` yazan dosyalar başlangıç koduyla birlikte geldi: önce çalıştır ve oku, sonra değiştir.


## Faz 0 · Kurulum ve öğrenme (H1–H2)

Herkesin bilgisayarında proje çalışıyor, araçlar kurulu, veri başvuruları yapılmış.


### H1 · 5 Eki 2026 – 11 Eki 2026

- **Hedef:** Backend'i demo modunda çalıştır; AUTSL ve BosphorusSign22k erişim başvurularını gönder.
- **Dosyalar:** `k2-backend/` (hazır), `docs/veri.md`
- **Bitti sayılır:** `http://localhost:8000/health` adresi `"mode": "demo"` dönüyor; iki başvurunun tarihi `docs/veri.md` içinde; etik kurul sorusu danışmana soruldu.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "FastAPI uygulamasını uvicorn ile nasıl çalıştırırım ve `--host 0.0.0.0` ne işe yarar?"

### H2 · 12 Eki 2026 – 18 Eki 2026

- **Hedef:** GitHub düzenini kur: main koruması, Projects panosu, etiketler, CODEOWNERS.
- **Dosyalar:** `.github/CODEOWNERS`, repo ayarları
- **Bitti sayılır:** main'e doğrudan push reddediliyor; panoda 4 sütun var; CODEOWNERS'ta gerçek kullanıcı adları yazıyor; CI yeşil.
- **Başkasından beklenen:** Herkesin GitHub kullanıcı adı.
- **Yapay zekaya örnek soru:** "GitHub'da main branch'ini PR ve 1 onay zorunlu olacak şekilde nasıl korurum?"

## Faz 1 · Prototip (H3–H8)

10 kelimelik, telefondan sunucuya uçtan uca çalışan ilk tanıma (M1).


### H3 · 19 Eki 2026 – 25 Eki 2026

- **Hedef:** API'ye `/version` uç noktası ekle ve testini yaz.
- **Dosyalar:** `k2-backend/app/main.py`, `tests/test_api.py`
- **Bitti sayılır:** `/docs` sayfasında `/version` görünüyor ve `pytest` geçiyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "FastAPI'de yeni bir GET uç noktası ve TestClient ile testi nasıl yazılır?"

### H4 · 26 Eki 2026 – 1 Kas 2026

- **Hedef:** Veri setini `data/raw/<kelime_id>/` düzenine sokan betiği yaz.
- **Dosyalar:** `k2-backend/scripts/organize_dataset.py` (yeni), `docs/veri.md`
- **Bitti sayılır:** Betik örnek bir klasörde çalışıyor ve videoları kelime klasörlerine taşıyor; kullanımı `docs/veri.md` içinde.
- **Başkasından beklenen:** Veri seti onayı. Gelmediyse K1'in kendi videolarıyla dene.
- **Yapay zekaya örnek soru:** "Bir CSV etiket dosyasına göre videoları klasörlere taşıyan Python betiği nasıl yazılır?"

### H5 · 2 Kas 2026 – 8 Kas 2026

- **Hedef:** Supabase projesini aç ve tabloları oluştur.
- **Dosyalar:** `k2-backend/db/schema.sql` (yeni)
- **Bitti sayılır:** Supabase panelinde `users`, `words`, `categories`, `progress` tabloları görünüyor; `schema.sql` repoda.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Supabase'de bu dört tablo için SQL şemasını ve aralarındaki ilişkileri nasıl yazarım?"

### H6 · 9 Kas 2026 – 15 Kas 2026

- **Hedef:** Kelime API'sini Supabase'e bağla; Supabase'e ulaşılamazsa JSON dosyasına dön.
- **Dosyalar:** `k2-backend/app/routers/words.py`, `ortak/veri/words.json`
- **Bitti sayılır:** `/words` yanıtı Supabase'den geliyor; bağlantı kesilince JSON'dan geliyor; `pytest` geçiyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Python'da Supabase istemcisiyle bir tablodan veri nasıl okunur?"

### H7 · 16 Kas 2026 – 22 Kas 2026

- **Hedef:** `/ws/infer` uç noktasını gerçek el algılamayla çalıştır ve bir test istemcisi yaz.
- **Dosyalar:** `k2-backend/scripts/ws_test_client.py` (yeni), `app/routers/infer.py` (hazır)
- **Bitti sayılır:** Test istemcisi webcam karelerini gönderiyor; yanıtlarda `hand: true` ve artan `filled` değeri görünüyor.
- **Başkasından beklenen:** K1'in `download_models.py` betiği (hazır).
- **Yapay zekaya örnek soru:** "Python `websockets` kütüphanesiyle bir WebSocket'e JSON mesaj nasıl gönderilir?"

### H8 · 23 Kas 2026 – 29 Kas 2026

**Tüm ekip · M1 · Prototip demosu**

- **Senin payın:** Modeli `k2-backend/models/` içine koy; `/health` `"mode": "model"` dönsün.
- **Bitti sayılır:** Telefonda yapılan 10 kelimeden en az 7'si doğru tanınıyor ve bunun ekran kaydı var.

## Faz 2 · MVP (H9–H16)

50 kelime, kullanıcı hesabı, eğitim modülü, pratik modu, test APK'sı (M2).


### H9 · 30 Kas 2026 – 6 Ara 2026

- **Hedef:** Supabase Auth ile kayıt/girişi kur ve backend'de token doğrula.
- **Dosyalar:** `k2-backend/app/services/auth.py`, `app/routers/me.py` (yeni)
- **Bitti sayılır:** Token olmadan `/me` 401, geçerli token ile 200 ve kullanıcı bilgisi dönüyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "FastAPI'de Supabase JWT token'ını doğrulayan bir bağımlılık (dependency) nasıl yazılır?"

### H10 · 7 Ara 2026 – 13 Ara 2026

- **Hedef:** Eğitim videolarını depolamaya yükleyen betiği yaz ve adreslerini sözlüğe işle.
- **Dosyalar:** `k2-backend/scripts/upload_videos.py` (yeni)
- **Bitti sayılır:** `/words` yanıtında en az 5 kelimenin `videoUrl` alanı dolu ve adres tarayıcıda açılıyor.
- **Başkasından beklenen:** K4'ten video dosyaları.
- **Yapay zekaya örnek soru:** "Supabase Storage'a Python ile dosya yükleyip herkese açık adresini nasıl alırım?"

### H11 · 14 Ara 2026 – 20 Ara 2026

- **Hedef:** Gönüllü veri toplama protokolünü ve onam formunu yaz.
- **Dosyalar:** `docs/veri-toplama-protokolu.md`, `docs/onam-formu.md` (yeni)
- **Bitti sayılır:** İki belge yazıldı; danışmanın görüşü `docs/kararlar.md` içinde.
- **Başkasından beklenen:** Danışmandan etik kurul yanıtı.
- **Yapay zekaya örnek soru:** "KVKK'ya uygun bir açık rıza metninde hangi bilgiler bulunmalı?"

### H12 · 21 Ara 2026 – 27 Ara 2026

- **Hedef:** İlerleme API'sini yaz: öğrenilen kelimeler ve seri.
- **Dosyalar:** `k2-backend/app/routers/progress.py` (yeni), `tests/`
- **Bitti sayılır:** `GET /progress` ve `POST /progress` çalışıyor; `/docs` üzerinden denendi; `pytest` geçiyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Ardışık gün serisini (streak) veritabanında nasıl tutar ve hesaplarım?"

### H13 · 28 Ara 2026 – 3 Oca 2027

- **Hedef:** Hata yönetimi, istek sınırlama ve loglama ekle.
- **Dosyalar:** `k2-backend/app/main.py`, `app/services/`
- **Bitti sayılır:** Hatalı istek anlaşılır bir JSON hata dönüyor; aynı adresten art arda çok istek 429 alıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "FastAPI'de basit bir istek sınırlama (rate limiting) nasıl eklenir?"

### H14 · 4 Oca 2027 – 10 Oca 2027

- **Hedef:** Testleri genişlet ve CI'da otomatik çalıştır.
- **Dosyalar:** `k2-backend/tests/`, `.github/workflows/ci.yml`
- **Bitti sayılır:** Her PR'da testler kendiliğinden çalışıyor; kasıtlı bozuk bir PR kırmızı oluyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "GitHub Actions'ta pytest'i sadece ilgili klasör değişince nasıl çalıştırırım?"

### H15 · 11 Oca 2027 – 17 Oca 2027

- **Hedef:** Sunucuyu buluta taşı.
- **Dosyalar:** `k2-backend/Dockerfile` veya platform ayar dosyası (yeni), `k2-backend/README.md`
- **Bitti sayılır:** Herkes kendi telefonundan `https://.../health` adresini açabiliyor.
- **Başkasından beklenen:** K1'den 50 kelimelik model.
- **Yapay zekaya örnek soru:** "FastAPI uygulamasını Render veya Railway'e nasıl yayınlarım, hangisi WebSocket destekler?"

### H16 · 18 Oca 2027 – 24 Oca 2027

**Tüm ekip · M2 · MVP**

- **Senin payın:** Bulut sunucusunu izleyip hataları logla.
- **Bitti sayılır:** Test APK'sı 4 telefonda kurulu; giriş, sözlük, video, pratik modu çalışıyor; demo videosu ve ara rapor notları `docs/` içinde.

## Faz 3 · Genişleme ve telefonda tahmin (H17–H24)

100 kelime, modelin telefonda çalışması, oyunlaştırma, beta (M3).


### H17 · 25 Oca 2027 – 31 Oca 2027

- **Hedef:** Onaylı gönüllülerin örnek video yükleyebileceği uç noktayı yaz.
- **Dosyalar:** `k2-backend/app/routers/samples.py` (yeni)
- **Bitti sayılır:** Onam işareti olmayan yükleme reddediliyor; onaylı yükleme depolamada görünüyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "FastAPI'de dosya yükleme (UploadFile) nasıl alınır ve boyut sınırı nasıl konur?"

### H18 · 1 Şub 2027 – 7 Şub 2027

- **Hedef:** Liderlik tablosu ve haftalık hedef API'sini yaz.
- **Dosyalar:** `k2-backend/app/routers/leaderboard.py` (yeni)
- **Bitti sayılır:** `GET /leaderboard` ilk 10 kullanıcıyı takma adla dönüyor; `pytest` geçiyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "SQL ile bu haftaki puanlara göre sıralama sorgusu nasıl yazılır?"

### H19 · 8 Şub 2027 – 14 Şub 2027

- **Hedef:** Model sürümleme ekle: uygulama en güncel modeli indirebilsin.
- **Dosyalar:** `k2-backend/app/routers/model.py` (yeni)
- **Bitti sayılır:** `GET /model/latest` sürüm numarası ve indirme adresi dönüyor.
- **Başkasından beklenen:** K1'den model dosyası.
- **Yapay zekaya örnek soru:** "Bir dosyanın sürümünü ve özet değerini (hash) API ile nasıl sunarım?"

### H20 · 15 Şub 2027 – 21 Şub 2027

- **Hedef:** Çevrimdışı kullanım için sözlük paketi uç noktasını yaz.
- **Dosyalar:** `k2-backend/app/routers/words.py`
- **Bitti sayılır:** `GET /words/package` tüm sözlüğü tek yanıtta dönüyor; K4 bunu indirip kaydedebildi.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bir API yanıtına sürüm bilgisi ekleyip istemcinin sadece değişince indirmesini nasıl sağlarım?"

### H21 · 22 Şub 2027 – 28 Şub 2027

- **Hedef:** Kişisel veri içermeyen kullanım ölçümleri ekle.
- **Dosyalar:** `k2-backend/app/routers/metrics.py` (yeni), `docs/guvenlik.md`
- **Bitti sayılır:** Günlük tanıma sayısı gibi 3 ölçüm kaydediliyor; hangi verinin tutulduğu belgede yazıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Kullanıcıyı tanımlamadan kullanım istatistiği toplamak için nelere dikkat etmeliyim?"

### H22 · 1 Mar 2027 – 7 Mar 2027

- **Hedef:** Güvenlik ve KVKK gözden geçirmesi yap.
- **Dosyalar:** `docs/guvenlik.md` (yeni)
- **Bitti sayılır:** Belgede hangi veri nerede, ne kadar süre tutuluyor ve kim erişiyor tablosu var; açık bulunan maddeler Issue oldu.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Küçük bir mobil uygulama backend'i için güvenlik kontrol listesi nasıl olmalı?"

### H23 · 8 Mar 2027 – 14 Mar 2027

- **Hedef:** Yük testi yap: aynı anda 50 kullanıcı.
- **Dosyalar:** `k2-backend/scripts/loadtest.py` (yeni)
- **Bitti sayılır:** Test sonuçları (yanıt süresi, hata oranı) `docs/olcumler.md` içinde.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Locust ile bir WebSocket uç noktasına yük testi nasıl yapılır?"

### H24 · 15 Mar 2027 – 21 Mar 2027

**Tüm ekip · M3 · Beta**

- **Senin payın:** Beta sunucusunu hazırla, geri bildirim formunu yayınla.
- **Bitti sayılır:** En az 10 kişi beta sürümünü kurdu; internet kapalıyken tanıma çalışıyor.

## Faz 4 · Kullanıcı testi ve iyileştirme (H25–H30)

İki tur gerçek kullanıcı testi ve ölçülmüş iyileştirmeler (M4).


### H25 · 22 Mar 2027 – 28 Mar 2027

- **Hedef:** İşitme engelliler derneği veya okuluyla iletişime geç ve test takvimini belirle.
- **Dosyalar:** `docs/kullanici-testi.md`
- **Bitti sayılır:** Test tarihi, yer ve katılımcı sayısı belgede yazıyor.
- **Başkasından beklenen:** K4 ile birlikte.
- **Yapay zekaya örnek soru:** "Bir kullanıcı testi için kuruma gönderilecek resmi davet e-postası nasıl yazılır?"

### H26 · 29 Mar 2027 – 4 Nis 2027

**Tüm ekip · 1. kullanıcı testi (8-10 katılımcı)**

- **Senin payın:** Oturum loglarını topla.
- **Bitti sayılır:** Her katılımcı için doldurulmuş ölçüm formu ve anket var.

### H27 · 5 Nis 2027 – 11 Nis 2027

- **Hedef:** İlk test verilerini analiz et ve rapor taslağını yaz.
- **Dosyalar:** `docs/kullanici-testi-1.md` (yeni)
- **Bitti sayılır:** Belgede kelime başına başarı, ortalama gecikme ve en sık 5 sorun var.
- **Başkasından beklenen:** K1'in doğruluk ölçümü, K4'ün anket sonuçları.
- **Yapay zekaya örnek soru:** "Test loglarından kelime başına başarı oranını pandas ile nasıl çıkarırım?"

### H28 · 12 Nis 2027 – 18 Nis 2027

- **Hedef:** Sunucu performansını iyileştir.
- **Dosyalar:** `k2-backend/app/`
- **Bitti sayılır:** Ortalama yanıt süresi öncesi/sonrası `docs/olcumler.md` içinde.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "FastAPI'de yavaş çalışan bir uç noktanın darboğazını nasıl bulurum?"

### H29 · 19 Nis 2027 – 25 Nis 2027

**Tüm ekip · 2. kullanıcı testi**

- **Senin payın:** Logları topla, ilk testle karşılaştır.
- **Bitti sayılır:** İki testin karşılaştırma tablosu `docs/kullanici-testi-2.md` içinde.

### H30 · 26 Nis 2027 – 2 May 2027

**Tüm ekip · M4 · Kullanıcı testi raporu**

- **Senin payın:** Raporu derle.
- **Bitti sayılır:** `docs/kullanici-testi-raporu.md` tamam; TÜBİTAK gelişme raporu için bulgular hazır.

## Faz 5 · Cilalama ve yayın (H31–H36)

Play Store sürümü ve tamamlanmış teknik rapor (M5).


### H31 · 3 May 2027 – 9 May 2027

- **Hedef:** Üretim ortamını kur: yedekleme ve izleme.
- **Dosyalar:** `k2-backend/README.md`, platform ayarları
- **Bitti sayılır:** Veritabanı günlük yedekleniyor; sunucu çökünce e-posta uyarısı geliyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Supabase'de otomatik yedekleme ve basit bir çalışırlık izleme nasıl kurulur?"

### H32 · 10 May 2027 – 16 May 2027

- **Hedef:** API dokümantasyonunu yaz.
- **Dosyalar:** `docs/api.md` (yeni)
- **Bitti sayılır:** Her uç nokta için örnek istek ve yanıt var; K3 ve K4 okuyup onayladı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "FastAPI'nin otomatik ürettiği OpenAPI belgesinden okunaklı bir doküman nasıl çıkarırım?"

### H33 · 17 May 2027 – 23 May 2027

- **Hedef:** Gizlilik politikası ve KVKK aydınlatma metnini yaz.
- **Dosyalar:** `docs/gizlilik.md` (yeni)
- **Bitti sayılır:** Metin danışmana gösterildi; uygulamadan erişilecek adres belli.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Kamera kullanan bir mobil uygulamanın gizlilik politikasında neler yazmalı?"

### H34 · 24 May 2027 – 30 May 2027

**Tüm ekip · Final hata avı ve regresyon testleri**

- **Senin payın:** API ve sunucu.
- **Bitti sayılır:** Kontrol listesindeki tüm maddeler işaretli; 'kritik' etiketli açık Issue yok.

### H35 · 31 May 2027 – 6 Haz 2027

**Tüm ekip · Play Store yayını ve ekip içi final demo**

- **Senin payın:** Üretim sunucusunu yayın gününde izle.
- **Bitti sayılır:** Uygulama Play Store bağlantısından kurulabiliyor.

### H36 · 7 Haz 2027 – 13 Haz 2027

**Tüm ekip · M5 · Geliştirmenin sonu**

- **Senin payın:** Repo ve sunucu belgelerini arşivle.
- **Bitti sayılır:** Repo `v1.0` etiketiyle işaretlendi; `docs/` klasörü eksiksiz. Bu haftadan sonra yeni özellik eklenmez.

## Son aylar (H37–H52): yeni özellik yok

- **H37-H40 · Gecikme telafisi ve son kontroller:** Kayan kilometre taşlarını kapat; tüm cihazlarda son test turu; mağaza yorumlarındaki hataları düzelt.
- **H41-H44 · Raporlar:** TÜBİTAK sonuç raporu ve harcama belgeleri; teknik rapor son okuma; danışman düzeltmeleri.
- **H45-H48 · Sunum hazırlığı:** Sunum dosyası, canlı demo provası (en az 3 kez), olası sorulara yanıt listesi, yedek demo videosu.
- **H49-H52 · Yedek:** Sunum tarihleri ve beklenmeyen işler için boş bırakıldı.
