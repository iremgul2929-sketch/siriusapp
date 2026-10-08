# Haftalık plan (genel bakış)

Başlangıç: 5 Eki 2026. 36 hafta geliştirme (bitiş: 13 Haz 2027), ardından H37–H52 kontrol, rapor ve sunum.

Bu tablo her görevin tek cümlelik hedefini gösterir. Dosyalar, 'bitti' ölçütü, bağımlılık ve örnek yapay zeka sorusu için kişinin kendi `GOREVLER.md` dosyasına bakın:

- K1: `k1-yapay-zeka/GOREVLER.md`
- K2: `k2-backend/GOREVLER.md`
- K3: `mobil/k3-mobil-kamera/GOREVLER.md`
- K4: `mobil/k4-mobil-arayuz/GOREVLER.md`


## Faz 0 · Kurulum ve öğrenme (H1–H2)

Herkesin bilgisayarında proje çalışıyor, araçlar kurulu, veri başvuruları yapılmış.

| Hafta | K1 · Yapay Zeka | K2 · Backend | K3 · Mobil Kamera | K4 · Mobil Arayüz |
|---|---|---|---|---|
| **H1**<br>5 Eki 2026 | Python ortamını kur ve webcam'de elinin iskeletini gör. | Backend'i demo modunda çalıştır; AUTSL ve BosphorusSign22k erişim başvurularını gönder. | Uygulamayı gerçek telefonda (Expo Go) ve Genymotion'da aç. | Uygulamayı çalıştır; Figma dosyasını aç; 3 rakip uygulamayı incele. |
| **H2**<br>12 Eki 2026 | Webcam'den el noktalarını dosyaya kaydeden bir kayıt betiği yaz. | GitHub düzenini kur: main koruması, Projects panosu, etiketler, CODEOWNERS. | Kamera ekranını backend açıkken ve kapalıyken dene; bağlantı etiketinin üç hâlini gör. | 6 temel ekranın kaba taslağını (wireframe) çiz. |

## Faz 1 · Prototip (H3–H8)

10 kelimelik, telefondan sunucuya uçtan uca çalışan ilk tanıma (M1).

| Hafta | K1 · Yapay Zeka | K2 · Backend | K3 · Mobil Kamera | K4 · Mobil Arayüz |
|---|---|---|---|---|
| **H3**<br>19 Eki 2026 | Videodan el noktası çıkarma hattını kendi çektiğin 5 kısa video üzerinde çalıştır. | API'ye `/version` uç noktası ekle ve testini yaz. | El görüldüğünde tarama çerçevesine kısa bir 'yakalandı' animasyonu ekle. | Ana ekran ve sözlük ekranının detaylı tasarımını yap, koda uygula. |
| **H4**<br>26 Eki 2026 | Pilot için 10 kelime seç ve her kelime için en az 20 video hazırla. | Veri setini `data/raw/<kelime_id>/` düzenine sokan betiği yaz. | Kamera izni reddedilince 'Ayarları aç' butonu göster. | Kamera ve kelime detay ekranlarının detaylı tasarımını yap. |
| **H5**<br>2 Kas 2026 | Veri çoğaltmaya zaman kaydırma (time shift) ekle ve testini yaz. | Supabase projesini aç ve tabloları oluştur. | Saniyede kaç kare gönderildiğini ekranda gösteren bir geliştirici sayacı ekle. | Bileşenleri tasarıma göre güncelle ve bir bileşen vitrini ekranı yap. |
| **H6**<br>9 Kas 2026 | İlk LSTM modelini 10 kelimeyle eğit. | Kelime API'sini Supabase'e bağla; Supabase'e ulaşılamazsa JSON dosyasına dön. | Sunucudan gelen hata mesajını kullanıcıya göster. | Kelime detay ekranına video oynatıcıyı ekle. |
| **H7**<br>16 Kas 2026 | Modelin raporunu çıkar ve TFLite dosyasını üret. | `/ws/infer` uç noktasını gerçek el algılamayla çalıştır ve bir test istemcisi yaz. | Son tanınan 5 kelimeyi ekranda cümle şeridi olarak göster. | 3 adımlık tanıtım (onboarding) ekranlarını yap. |
| **H8**<br>23 Kas 2026 | **Tüm ekip · M1 · Prototip demosu** — 10 kelimelik `sirius.tflite` ve `labels.json` dosyalarını K2'ye teslim et. | Modeli `k2-backend/models/` içine koy; `/health` `"mode": "model"` dönsün. | Gerçek telefonda kamerayı sunucuya bağla, 10 kelimeyi tek tek dene. | Demo akışını baştan sona dene, tasarım düzeltme listesini çıkar. |

## Faz 2 · MVP (H9–H16)

50 kelime, kullanıcı hesabı, eğitim modülü, pratik modu, test APK'sı (M2).

| Hafta | K1 · Yapay Zeka | K2 · Backend | K3 · Mobil Kamera | K4 · Mobil Arayüz |
|---|---|---|---|---|
| **H9**<br>30 Kas 2026 | Kelime sayısını 30'a çıkar ve her kelimede kaç örnek olduğunu tabloya dök. | Supabase Auth ile kayıt/girişi kur ve backend'de token doğrula. | Gerçek telefonda kare gönderiminden tahmine kadar geçen süreyi ölç. | Giriş ve kayıt ekranlarını yap. |
| **H10**<br>7 Ara 2026 | LSTM ile GRU'yu aynı veride karşılaştır. | Eğitim videolarını depolamaya yükleyen betiği yaz ve adreslerini sözlüğe işle. | Kare kalitesi ve boyutunu ayarlayarak gecikmeyi düşür. | Eğitim akışını tasarla: izle, dene, geri bildirim. |
| **H11**<br>14 Ara 2026 | Gönüllü kaydı için kelime kelime video çeken bir kayıt aracı yaz. | Gönüllü veri toplama protokolünü ve onam formunu yaz. | Pratik modunu geliştir: 3 deneme hakkı ve doğru/yanlış sayacı. | Eğitim modülünü kodla. |
| **H12**<br>21 Ara 2026 | Modeli 50 kelimeyle yeniden eğit. | İlerleme API'sini yaz: öğrenilen kelimeler ve seri. | Bağlantı kopma senaryolarını test et ve kullanıcıya net mesaj göster. | Geri bildirim arayüzünü yap: doğru animasyonu ve tekrar dene. |
| **H13**<br>28 Ara 2026 | Güven eşiği ve oylama ayarlarını kayıtlı videolar üzerinde dene, en iyi değerleri öner. | Hata yönetimi, istek sınırlama ve loglama ekle. | Sesli okuma ayarını kalıcı yap ve konuşma hızını ekle. | Erişilebilirlik: büyük yazı, kontrast, titreşimli geri bildirim. |
| **H14**<br>4 Oca 2027 | Hareket miktarından işaretin başladığı ve bittiği kareyi bulan fonksiyon yaz. | Testleri genişlet ve CI'da otomatik çalıştır. | Faz 3 hazırlığı: `expo-dev-client` ile bir development build almayı dene. | Oyunlaştırmayı tasarla: puan, seri, rozet. |
| **H15**<br>11 Oca 2027 | Model v1 raporunu yaz. | Sunucuyu buluta taşı. | Uygulamayı buluttaki sunucuya bağla ve gerçek telefonda test et. | Oyunlaştırma arayüzünü kodla ve profil ekranını ilerleme API'sine bağla. |
| **H16**<br>18 Oca 2027 | **Tüm ekip · M2 · MVP** — 50 kelimelik modeli teslim et, bilinen zayıf kelimeleri listele. | Bulut sunucusunu izleyip hataları logla. | EAS ile test APK'sı üret; Genymotion'da arayüzü, gerçek telefonda kamerayı test et. | Hata avını yönet, demo videosunu çek. |

## Faz 3 · Genişleme ve telefonda tahmin (H17–H24)

100 kelime, modelin telefonda çalışması, oyunlaştırma, beta (M3).

| Hafta | K1 · Yapay Zeka | K2 · Backend | K3 · Mobil Kamera | K4 · Mobil Arayüz |
|---|---|---|---|---|
| **H17**<br>25 Oca 2027 | TFLite modelinin Keras modeliyle aynı sonucu verdiğini ölç. | Onaylı gönüllülerin örnek video yükleyebileceği uç noktayı yaz. | Projeyi `expo-dev-client`'a geçir; tüm ekip development build'i kursun. | Ayarlar ekranını yap: kamera yönü, el tercihi, ses. |
| **H18**<br>1 Şub 2027 | Telefonda el noktası çıkarmak için kullanılacak model dosyasını hazırla ve K3'e teslim et. | Liderlik tablosu ve haftalık hedef API'sini yaz. | `react-native-vision-camera` ve frame processor'ı kur. | Rozet görsellerini ve ikon setini hazırla. |
| **H19**<br>8 Şub 2027 | Sınıflandırma modelinin girdi/çıktı biçimini K3 için belgeye dök. | Model sürümleme ekle: uygulama en güncel modeli indirebilsin. | `react-native-fast-tflite` ile telefonda tahmin prototipi yap. | Parmak alfabesi modülünü tasarla. |
| **H20**<br>15 Şub 2027 | Kelime sayısını 100'e çıkar, gönüllü verisini ekle. | Çevrimdışı kullanım için sözlük paketi uç noktasını yaz. | Telefonda tahmin ile sunucu tahmini arasında otomatik geçiş yap. | Parmak alfabesi ekranlarını kodla. |
| **H21**<br>22 Şub 2027 | Modeli küçült (quantization) ve hız/doğruluk farkını ölç. | Kişisel veri içermeyen kullanım ölçümleri ekle. | FPS, pil tüketimi ve ısınmayı ölç. | Çevrimdışı mod arayüzünü yap. |
| **H22**<br>1 Mar 2027 | El noktalarına vücut noktalarını ekleyen model v2 denemesi yap. | Güvenlik ve KVKK gözden geçirmesi yap. | Mini oyunun mantığını yaz: doğru işaretle hedef vur. | Mini oyunun görsellerini ve animasyonlarını yap. |
| **H23**<br>8 Mar 2027 | v1 ile v2'yi karşılaştır ve yayınlanacak modeli seç. | Yük testi yap: aynı anda 50 kullanıcı. | Günlük hatırlatma bildirimlerini ekle. | Boş durum, hata ve yükleniyor ekranlarını yap. |
| **H24**<br>15 Mar 2027 | **Tüm ekip · M3 · Beta** — Seçilen 100 kelimelik modeli teslim et. | Beta sunucusunu hazırla, geri bildirim formunu yayınla. | Beta APK'sını Play Console dahili test ile dağıt. | Bilinen hatalar listesini ve beta duyurusunu yaz. |

## Faz 4 · Kullanıcı testi ve iyileştirme (H25–H30)

İki tur gerçek kullanıcı testi ve ölçülmüş iyileştirmeler (M4).

| Hafta | K1 · Yapay Zeka | K2 · Backend | K3 · Mobil Kamera | K4 · Mobil Arayüz |
|---|---|---|---|---|
| **H25**<br>22 Mar 2027 | Kullanıcı testi için ölçüm protokolünü yaz. | İşitme engelliler derneği veya okuluyla iletişime geç ve test takvimini belirle. | Beta geri bildirimlerindeki hataları düzelt. | Kullanılabilirlik senaryolarını ve SUS anketini hazırla. |
| **H26**<br>29 Mar 2027 | **Tüm ekip · 1. kullanıcı testi (8-10 katılımcı)** — Gerçek kullanıcıda kelime başına doğruluğu ölç. | Oturum loglarını topla. | Hataları anında not et, cihaz sorunlarını çöz. | Gözlemi ve SUS anketini yürüt. |
| **H27**<br>5 Nis 2027 | İlk testte yanlış tanınan kelimeler için veri ekle ve yeniden eğit. | İlk test verilerini analiz et ve rapor taslağını yaz. | İlk kullanıcı testinde görülen kritik kullanım sorunlarını düzelt. | İlk test bulgularına göre tasarım revizyonlarını yap. |
| **H28**<br>12 Nis 2027 | Kullanıcıya özel kısa kalibrasyonun işe yarayıp yaramadığını dene. | Sunucu performansını iyileştir. | Kalibrasyon ekranını yap (K1 'kullanalım' derse) veya el konumu yönlendirmesini iyileştir. | Erişilebilirlik denetimi yap: TalkBack ve renk körlüğü. |
| **H29**<br>19 Nis 2027 | **Tüm ekip · 2. kullanıcı testi** — İlk testle aynı kelimelerde doğruluğu ölç. | Logları topla, ilk testle karşılaştır. | Cihaz ve uygulama desteği. | Aynı senaryolar ve SUS anketi. |
| **H30**<br>26 Nis 2027 | **Tüm ekip · M4 · Kullanıcı testi raporu** — Doğruluk bölümünü yaz. | Raporu derle. | Performans ölçümlerini ekle. | Kullanılabilirlik bölümünü yaz. |

## Faz 5 · Cilalama ve yayın (H31–H36)

Play Store sürümü ve tamamlanmış teknik rapor (M5).

| Hafta | K1 · Yapay Zeka | K2 · Backend | K3 · Mobil Kamera | K4 · Mobil Arayüz |
|---|---|---|---|---|
| **H31**<br>3 May 2027 | Final modeli eğit ve model kartını yaz. | Üretim ortamını kur: yedekleme ve izleme. | Kod temizliği yap ve test ekle. | Mağaza görsellerini ve ekran görüntülerini hazırla. |
| **H32**<br>10 May 2027 | Teknik raporun yöntem, veri ve sonuçlar bölümünü yaz. | API dokümantasyonunu yaz. | Yayın sürümünü (AAB) üret ve imzala. | Tanıtım videosunu hazırla. |
| **H33**<br>17 May 2027 | Rapor grafiklerini son hâline getir; isteğe bağlı bildiri taslağı. | Gizlilik politikası ve KVKK aydınlatma metnini yaz. | Play Store kapalı test kanalını aç. | Tanıtım web sayfasını yap. |
| **H34**<br>24 May 2027 | **Tüm ekip · Final hata avı ve regresyon testleri** — Model ve tanıma senaryoları. | API ve sunucu. | Kamera ve cihaz testleri. | Tüm ekranların kontrol listesi. |
| **H35**<br>31 May 2027 | **Tüm ekip · Play Store yayını ve ekip içi final demo** — Demo için kelime setini hazırla. | Üretim sunucusunu yayın gününde izle. | Uygulamayı Play Store'da yayına al. | Demo provasını yönet. |
| **H36**<br>7 Haz 2027 | **Tüm ekip · M5 · Geliştirmenin sonu** — Model belgelerini arşivle. | Repo ve sunucu belgelerini arşivle. | Sürüm notlarını yaz. | Sunum taslağını hazırla. |

## Son aylar (H37–H52): yeni özellik yok

| Haftalar | Tarih | Konu | İçerik |
|---|---|---|---|
| H37-H40 | 14 Haz 2027 – 11 Tem 2027 | Gecikme telafisi ve son kontroller | Kayan kilometre taşlarını kapat; tüm cihazlarda son test turu; mağaza yorumlarındaki hataları düzelt. |
| H41-H44 | 12 Tem 2027 – 8 Ağu 2027 | Raporlar | TÜBİTAK sonuç raporu ve harcama belgeleri; teknik rapor son okuma; danışman düzeltmeleri. |
| H45-H48 | 9 Ağu 2027 – 5 Eyl 2027 | Sunum hazırlığı | Sunum dosyası, canlı demo provası (en az 3 kez), olası sorulara yanıt listesi, yedek demo videosu. |
| H49-H52 | 6 Eyl 2027 – 3 Eki 2027 | Yedek | Sunum tarihleri ve beklenmeyen işler için boş bırakıldı. |
