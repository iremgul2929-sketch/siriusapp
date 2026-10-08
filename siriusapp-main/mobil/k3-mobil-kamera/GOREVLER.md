# K3 · Mobil · Kamera ve Tanıma — haftalık görevler

Klasörün: `mobil/k3-mobil-kamera/` · Başlangıç: 5 Eki 2026 (Pazartesi)

Her hafta başında o haftanın görevini GitHub'da Issue olarak aç, hafta sonunda Pull Request ile kapat.
Dosya yolları aksi yazmıyorsa kendi klasörüne göredir. `(hazır)` yazan dosyalar başlangıç koduyla birlikte geldi: önce çalıştır ve oku, sonra değiştir.


## Faz 0 · Kurulum ve öğrenme (H1–H2)

Herkesin bilgisayarında proje çalışıyor, araçlar kurulu, veri başvuruları yapılmış.


### H1 · 5 Eki 2026 – 11 Eki 2026

- **Hedef:** Uygulamayı gerçek telefonda (Expo Go) ve Genymotion'da aç.
- **Dosyalar:** `mobil/` (hazır), `mobil/.env`
- **Bitti sayılır:** İki ortamda da ana ekran görünüyor; ekran görüntüleri PR açıklamasında.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Expo Go ile telefondan projeye bağlanamıyorum, aynı Wi-Fi'da olduğumu nasıl kontrol ederim?"

### H2 · 12 Eki 2026 – 18 Eki 2026

- **Hedef:** Kamera ekranını backend açıkken ve kapalıyken dene; bağlantı etiketinin üç hâlini gör.
- **Dosyalar:** `mobil/k3-mobil-kamera/screens/CameraScreen.tsx`, `hooks/useInferenceSocket.ts` (hazır)
- **Bitti sayılır:** Backend kapalıyken 'Sunucuya ulaşılamıyor', açıkken 'Demo modu' yazıyor ve birkaç saniyede bir kelime çıkıyor.
- **Başkasından beklenen:** K2'nin backend'i çalıştırması (H1).
- **Yapay zekaya örnek soru:** "`useInferenceSocket` içindeki yeniden bağlanma mantığını bana adım adım açıklar mısın?"

## Faz 1 · Prototip (H3–H8)

10 kelimelik, telefondan sunucuya uçtan uca çalışan ilk tanıma (M1).


### H3 · 19 Eki 2026 – 25 Eki 2026

- **Hedef:** El görüldüğünde tarama çerçevesine kısa bir 'yakalandı' animasyonu ekle.
- **Dosyalar:** `mobil/k3-mobil-kamera/components/ScanCorners.tsx`
- **Bitti sayılır:** `active` true olduğunda köşeler bir kez büyüyüp küçülüyor. Sunucuda el algılama henüz yoksa denemek için ekrana geçici bir 'dene' butonu koy.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React Native Animated ile bir bileşeni bir kez büyütüp küçülten animasyon nasıl yazılır?"

### H4 · 26 Eki 2026 – 1 Kas 2026

- **Hedef:** Kamera izni reddedilince 'Ayarları aç' butonu göster.
- **Dosyalar:** `mobil/k3-mobil-kamera/screens/CameraScreen.tsx`
- **Bitti sayılır:** İzni reddettikten sonra buton telefonun ayarlar sayfasını açıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Expo'da kullanıcıyı uygulamanın sistem ayarlarına nasıl yönlendiririm?"

### H5 · 2 Kas 2026 – 8 Kas 2026

- **Hedef:** Saniyede kaç kare gönderildiğini ekranda gösteren bir geliştirici sayacı ekle.
- **Dosyalar:** `mobil/k3-mobil-kamera/hooks/useFrameCapture.ts`, `screens/CameraScreen.tsx`
- **Bitti sayılır:** Telefonda ekranın köşesinde 'x kare/sn' yazıyor ve değer 2 ile 5 arasında.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React'te son 1 saniyede kaç kez çağrıldığını sayan bir sayaç nasıl tutulur?"

### H6 · 9 Kas 2026 – 15 Kas 2026

- **Hedef:** Sunucudan gelen hata mesajını kullanıcıya göster.
- **Dosyalar:** `mobil/k3-mobil-kamera/screens/CameraScreen.tsx`, `mobil/ortak/types.ts`
- **Bitti sayılır:** Backend `error` mesajı gönderdiğinde ekranda kırmızı bir uyarı çıkıyor ve 3 saniyede kayboluyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "`docs/mimari.md` içindeki WebSocket mesaj tiplerini TypeScript'te nasıl güvenli işlerim?"

### H7 · 16 Kas 2026 – 22 Kas 2026

- **Hedef:** Son tanınan 5 kelimeyi ekranda cümle şeridi olarak göster.
- **Dosyalar:** `mobil/k3-mobil-kamera/components/SentenceStrip.tsx` (yeni)
- **Bitti sayılır:** Art arda tanınan kelimeler ekranın üstünde yan yana diziliyor; 'Temizle' butonu şeridi boşaltıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React'te bir listeye yeni öğe ekleyip en fazla 5 öğe tutmayı nasıl yaparım?"

### H8 · 23 Kas 2026 – 29 Kas 2026

**Tüm ekip · M1 · Prototip demosu**

- **Senin payın:** Gerçek telefonda kamerayı sunucuya bağla, 10 kelimeyi tek tek dene.
- **Bitti sayılır:** Telefonda yapılan 10 kelimeden en az 7'si doğru tanınıyor ve bunun ekran kaydı var.

## Faz 2 · MVP (H9–H16)

50 kelime, kullanıcı hesabı, eğitim modülü, pratik modu, test APK'sı (M2).


### H9 · 30 Kas 2026 – 6 Ara 2026

- **Hedef:** Gerçek telefonda kare gönderiminden tahmine kadar geçen süreyi ölç.
- **Dosyalar:** `mobil/k3-mobil-kamera/hooks/useInferenceSocket.ts`, `docs/olcumler.md`
- **Bitti sayılır:** Ortalama gecikme (ms) 20 ölçüm üzerinden `docs/olcumler.md` içinde.
- **Başkasından beklenen:** K2'nin gerçek el algılamalı sunucusu (H7).
- **Yapay zekaya örnek soru:** "Bir WebSocket isteğinin gidiş-dönüş süresini istemci tarafında nasıl ölçerim?"

### H10 · 7 Ara 2026 – 13 Ara 2026

- **Hedef:** Kare kalitesi ve boyutunu ayarlayarak gecikmeyi düşür.
- **Dosyalar:** `mobil/k3-mobil-kamera/hooks/useFrameCapture.ts`, `mobil/ortak/config.ts`
- **Bitti sayılır:** Öncesi/sonrası gecikme tablosu `docs/olcumler.md` içinde; el algılama bozulmadı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "expo-camera'da çekilen fotoğrafın çözünürlüğünü nasıl küçültürüm?"

### H11 · 14 Ara 2026 – 20 Ara 2026

- **Hedef:** Pratik modunu geliştir: 3 deneme hakkı ve doğru/yanlış sayacı.
- **Dosyalar:** `mobil/k3-mobil-kamera/screens/CameraScreen.tsx`, `mobil/ortak/store/useProgressStore.ts`
- **Bitti sayılır:** `/camera?target=tesekkur` açıldığında kalan deneme hakkı görünüyor; 3 yanlıştan sonra 'Videoyu tekrar izle' butonu çıkıyor.
- **Başkasından beklenen:** K4'ün kelime detay ekranı (hazır).
- **Yapay zekaya örnek soru:** "expo-router'da bir ekrana parametre gönderip o ekranda nasıl okurum?"

### H12 · 21 Ara 2026 – 27 Ara 2026

- **Hedef:** Bağlantı kopma senaryolarını test et ve kullanıcıya net mesaj göster.
- **Dosyalar:** `mobil/k3-mobil-kamera/hooks/useInferenceSocket.ts`
- **Bitti sayılır:** Uçak modunu açıp kapatınca uygulama çökmüyor, kendiliğinden yeniden bağlanıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React Native'de internet bağlantısının kesildiğini nasıl anlarım?"

### H13 · 28 Ara 2026 – 3 Oca 2027

- **Hedef:** Sesli okuma ayarını kalıcı yap ve konuşma hızını ekle.
- **Dosyalar:** `mobil/k3-mobil-kamera/screens/CameraScreen.tsx`, `mobil/ortak/store/`
- **Bitti sayılır:** Ses kapatılıp uygulama yeniden açıldığında kapalı kalıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Zustand store'unu AsyncStorage ile kalıcı hâle nasıl getiririm?"

### H14 · 4 Oca 2027 – 10 Oca 2027

- **Hedef:** Faz 3 hazırlığı: `expo-dev-client` ile bir development build almayı dene.
- **Dosyalar:** `mobil/app.json`, `mobil/package.json`, `mobil/README.md`
- **Bitti sayılır:** Development build bir Android telefona kuruldu ve uygulama açıldı; adımlar README'de.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Expo Go ile development build arasındaki fark nedir, EAS ile nasıl build alınır?"

### H15 · 11 Oca 2027 – 17 Oca 2027

- **Hedef:** Uygulamayı buluttaki sunucuya bağla ve gerçek telefonda test et.
- **Dosyalar:** `mobil/.env.example`, `mobil/ortak/config.ts`
- **Bitti sayılır:** Telefon Wi-Fi yerine mobil veriyle de tanıma yapabiliyor.
- **Başkasından beklenen:** K2'nin bulut sunucusu (aynı hafta).
- **Yapay zekaya örnek soru:** "Expo'da geliştirme ve üretim için farklı API adresleri nasıl tanımlanır?"

### H16 · 18 Oca 2027 – 24 Oca 2027

**Tüm ekip · M2 · MVP**

- **Senin payın:** EAS ile test APK'sı üret; Genymotion'da arayüzü, gerçek telefonda kamerayı test et.
- **Bitti sayılır:** Test APK'sı 4 telefonda kurulu; giriş, sözlük, video, pratik modu çalışıyor; demo videosu ve ara rapor notları `docs/` içinde.

## Faz 3 · Genişleme ve telefonda tahmin (H17–H24)

100 kelime, modelin telefonda çalışması, oyunlaştırma, beta (M3).


### H17 · 25 Oca 2027 – 31 Oca 2027

- **Hedef:** Projeyi `expo-dev-client`'a geçir; tüm ekip development build'i kursun.
- **Dosyalar:** `mobil/app.json`, `mobil/package.json`
- **Bitti sayılır:** Dört ekip üyesinin telefonunda da development build çalışıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "EAS Build ile aldığım APK'yı ekip arkadaşlarıma nasıl dağıtırım?"

### H18 · 1 Şub 2027 – 7 Şub 2027

- **Hedef:** `react-native-vision-camera` ve frame processor'ı kur.
- **Dosyalar:** `mobil/k3-mobil-kamera/hooks/useVisionFrames.ts` (yeni)
- **Bitti sayılır:** Her karede konsola kare boyutu yazılıyor; kamera 20 FPS üstünde.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "vision-camera frame processor nedir ve worklet ne demek?"

### H19 · 8 Şub 2027 – 14 Şub 2027

- **Hedef:** `react-native-fast-tflite` ile telefonda tahmin prototipi yap.
- **Dosyalar:** `mobil/k3-mobil-kamera/ml/` (yeni)
- **Bitti sayılır:** İnternet kapalıyken en az 1 kelime telefonda tanınıyor.
- **Başkasından beklenen:** K1'in model dosyaları ve `docs/model-format.md`.
- **Yapay zekaya örnek soru:** "fast-tflite ile bir .tflite modelini yükleyip Float32Array girdiyle nasıl çalıştırırım?"

### H20 · 15 Şub 2027 – 21 Şub 2027

- **Hedef:** Telefonda tahmin ile sunucu tahmini arasında otomatik geçiş yap.
- **Dosyalar:** `mobil/k3-mobil-kamera/hooks/useRecognizer.ts` (yeni)
- **Bitti sayılır:** Model telefonda yüklenemezse uygulama kendiliğinden sunucuya geçiyor; ekranda hangi modun çalıştığı yazıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "İki farklı veri kaynağını tek bir React hook arkasında nasıl birleştiririm?"

### H21 · 22 Şub 2027 – 28 Şub 2027

- **Hedef:** FPS, pil tüketimi ve ısınmayı ölç.
- **Dosyalar:** `docs/olcumler.md`
- **Bitti sayılır:** 10 dakikalık kullanımda FPS ve pil düşüşü tabloda; K1'e küçültülmüş modelin hızı bildirildi.
- **Başkasından beklenen:** K1'in küçültülmüş modeli.
- **Yapay zekaya örnek soru:** "Android'de bir uygulamanın pil tüketimini nasıl ölçerim?"

### H22 · 1 Mar 2027 – 7 Mar 2027

- **Hedef:** Mini oyunun mantığını yaz: doğru işaretle hedef vur.
- **Dosyalar:** `mobil/k3-mobil-kamera/game/useSignGame.ts` (yeni)
- **Bitti sayılır:** Oyun hedef kelime veriyor, doğru işarette puan artıyor, 60 saniyede bitiyor.
- **Başkasından beklenen:** K4'ün oyun görselleri (aynı hafta).
- **Yapay zekaya örnek soru:** "React'te geri sayım sayacı olan basit bir oyun döngüsü nasıl kurulur?"

### H23 · 8 Mar 2027 – 14 Mar 2027

- **Hedef:** Günlük hatırlatma bildirimlerini ekle.
- **Dosyalar:** `mobil/k3-mobil-kamera/notifications.ts` (yeni)
- **Bitti sayılır:** Seçilen saatte telefonda bildirim çıkıyor; ayarlardan kapatılabiliyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "expo-notifications ile her gün aynı saatte yerel bildirim nasıl planlanır?"

### H24 · 15 Mar 2027 – 21 Mar 2027

**Tüm ekip · M3 · Beta**

- **Senin payın:** Beta APK'sını Play Console dahili test ile dağıt.
- **Bitti sayılır:** En az 10 kişi beta sürümünü kurdu; internet kapalıyken tanıma çalışıyor.

## Faz 4 · Kullanıcı testi ve iyileştirme (H25–H30)

İki tur gerçek kullanıcı testi ve ölçülmüş iyileştirmeler (M4).


### H25 · 22 Mar 2027 – 28 Mar 2027

- **Hedef:** Beta geri bildirimlerindeki hataları düzelt.
- **Dosyalar:** `mobil/k3-mobil-kamera/`
- **Bitti sayılır:** 'bug' etiketli açık Issue sayısı yarıya indi.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bu hata mesajının nedeni ne olabilir ve nasıl düzeltirim?"

### H26 · 29 Mar 2027 – 4 Nis 2027

**Tüm ekip · 1. kullanıcı testi (8-10 katılımcı)**

- **Senin payın:** Hataları anında not et, cihaz sorunlarını çöz.
- **Bitti sayılır:** Her katılımcı için doldurulmuş ölçüm formu ve anket var.

### H27 · 5 Nis 2027 – 11 Nis 2027

- **Hedef:** İlk kullanıcı testinde görülen kritik kullanım sorunlarını düzelt.
- **Dosyalar:** `mobil/k3-mobil-kamera/`
- **Bitti sayılır:** Test raporundaki 'kritik' işaretli kamera sorunlarının hepsi kapatıldı.
- **Başkasından beklenen:** K2'nin test analizi.
- **Yapay zekaya örnek soru:** "Kullanıcılar eli kadraja sığdıramıyor; onları nasıl yönlendirebilirim?"

### H28 · 12 Nis 2027 – 18 Nis 2027

- **Hedef:** Kalibrasyon ekranını yap (K1 'kullanalım' derse) veya el konumu yönlendirmesini iyileştir.
- **Dosyalar:** `mobil/k3-mobil-kamera/screens/CalibrationScreen.tsx` (yeni)
- **Bitti sayılır:** Yeni kullanıcı ilk açılışta 3 adımlık yönlendirmeyi tamamlayabiliyor.
- **Başkasından beklenen:** K1'in kalibrasyon kararı.
- **Yapay zekaya örnek soru:** "Adım adım ilerleyen bir yönlendirme ekranı nasıl tasarlanır ve kodlanır?"

### H29 · 19 Nis 2027 – 25 Nis 2027

**Tüm ekip · 2. kullanıcı testi**

- **Senin payın:** Cihaz ve uygulama desteği.
- **Bitti sayılır:** İki testin karşılaştırma tablosu `docs/kullanici-testi-2.md` içinde.

### H30 · 26 Nis 2027 – 2 May 2027

**Tüm ekip · M4 · Kullanıcı testi raporu**

- **Senin payın:** Performans ölçümlerini ekle.
- **Bitti sayılır:** `docs/kullanici-testi-raporu.md` tamam; TÜBİTAK gelişme raporu için bulgular hazır.

## Faz 5 · Cilalama ve yayın (H31–H36)

Play Store sürümü ve tamamlanmış teknik rapor (M5).


### H31 · 3 May 2027 – 9 May 2027

- **Hedef:** Kod temizliği yap ve test ekle.
- **Dosyalar:** `mobil/k3-mobil-kamera/`, `__tests__/`
- **Bitti sayılır:** `npm run lint` ve `npm run typecheck` temiz; en az 5 test geçiyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React Native'de bir hook için Jest testi nasıl yazılır?"

### H32 · 10 May 2027 – 16 May 2027

- **Hedef:** Yayın sürümünü (AAB) üret ve imzala.
- **Dosyalar:** `mobil/eas.json` (yeni), `mobil/app.json`
- **Bitti sayılır:** EAS'tan indirilen AAB dosyası Play Console'a yüklenebiliyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "EAS Build ile Play Store için imzalı AAB nasıl üretilir?"

### H33 · 17 May 2027 – 23 May 2027

- **Hedef:** Play Store kapalı test kanalını aç.
- **Dosyalar:** Play Console, `mobil/README.md`
- **Bitti sayılır:** Ekip üyeleri uygulamayı Play Store kapalı test bağlantısından kurabiliyor.
- **Başkasından beklenen:** K4'ün mağaza görselleri, K2'nin gizlilik politikası.
- **Yapay zekaya örnek soru:** "Play Console'da kapalı test kanalı nasıl açılır, hangi bilgiler zorunlu?"

### H34 · 24 May 2027 – 30 May 2027

**Tüm ekip · Final hata avı ve regresyon testleri**

- **Senin payın:** Kamera ve cihaz testleri.
- **Bitti sayılır:** Kontrol listesindeki tüm maddeler işaretli; 'kritik' etiketli açık Issue yok.

### H35 · 31 May 2027 – 6 Haz 2027

**Tüm ekip · Play Store yayını ve ekip içi final demo**

- **Senin payın:** Uygulamayı Play Store'da yayına al.
- **Bitti sayılır:** Uygulama Play Store bağlantısından kurulabiliyor.

### H36 · 7 Haz 2027 – 13 Haz 2027

**Tüm ekip · M5 · Geliştirmenin sonu**

- **Senin payın:** Sürüm notlarını yaz.
- **Bitti sayılır:** Repo `v1.0` etiketiyle işaretlendi; `docs/` klasörü eksiksiz. Bu haftadan sonra yeni özellik eklenmez.

## Son aylar (H37–H52): yeni özellik yok

- **H37-H40 · Gecikme telafisi ve son kontroller:** Kayan kilometre taşlarını kapat; tüm cihazlarda son test turu; mağaza yorumlarındaki hataları düzelt.
- **H41-H44 · Raporlar:** TÜBİTAK sonuç raporu ve harcama belgeleri; teknik rapor son okuma; danışman düzeltmeleri.
- **H45-H48 · Sunum hazırlığı:** Sunum dosyası, canlı demo provası (en az 3 kez), olası sorulara yanıt listesi, yedek demo videosu.
- **H49-H52 · Yedek:** Sunum tarihleri ve beklenmeyen işler için boş bırakıldı.
