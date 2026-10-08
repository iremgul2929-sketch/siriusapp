# K4 · Mobil · Arayüz, Eğitim ve Tasarım — haftalık görevler

Klasörün: `mobil/k4-mobil-arayuz/` · Başlangıç: 5 Eki 2026 (Pazartesi)

Her hafta başında o haftanın görevini GitHub'da Issue olarak aç, hafta sonunda Pull Request ile kapat.
Dosya yolları aksi yazmıyorsa kendi klasörüne göredir. `(hazır)` yazan dosyalar başlangıç koduyla birlikte geldi: önce çalıştır ve oku, sonra değiştir.


## Faz 0 · Kurulum ve öğrenme (H1–H2)

Herkesin bilgisayarında proje çalışıyor, araçlar kurulu, veri başvuruları yapılmış.


### H1 · 5 Eki 2026 – 11 Eki 2026

- **Hedef:** Uygulamayı çalıştır; Figma dosyasını aç; 3 rakip uygulamayı incele.
- **Dosyalar:** `mobil/k4-mobil-arayuz/tasarim/README.md`
- **Bitti sayılır:** Figma bağlantısı ve 3 uygulamanın 'beğendim / beğenmedim' tablosu README'de; uygulama kendi bilgisayarında açılıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bir mobil uygulamanın arayüzünü incelerken hangi noktalara bakmalıyım?"

### H2 · 12 Eki 2026 – 18 Eki 2026

- **Hedef:** 6 temel ekranın kaba taslağını (wireframe) çiz.
- **Dosyalar:** Figma, `mobil/k4-mobil-arayuz/tasarim/`
- **Bitti sayılır:** Figma'da 6 çerçeve var: Ana, Kamera, Sözlük, Kelime, Profil, Giriş; ekran görüntüleri `tasarim/` klasöründe.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Wireframe nedir ve Figma'da hızlıca nasıl çizilir?"

## Faz 1 · Prototip (H3–H8)

10 kelimelik, telefondan sunucuya uçtan uca çalışan ilk tanıma (M1).


### H3 · 19 Eki 2026 – 25 Eki 2026

- **Hedef:** Ana ekran ve sözlük ekranının detaylı tasarımını yap, koda uygula.
- **Dosyalar:** Figma, `screens/HomeScreen.tsx`, `screens/DictionaryScreen.tsx` (hazır)
- **Bitti sayılır:** İki ekran telefonda Figma tasarımıyla aynı görünüyor; yan yana ekran görüntüsü PR'da.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Figma'daki bir tasarımı NativeWind sınıflarına nasıl çeviririm?"

### H4 · 26 Eki 2026 – 1 Kas 2026

- **Hedef:** Kamera ve kelime detay ekranlarının detaylı tasarımını yap.
- **Dosyalar:** Figma, `screens/WordScreen.tsx`
- **Bitti sayılır:** Tasarım Figma'da hazır; K3 kamera ekranı tasarımını görüp onayladı; kelime ekranı koda uygulandı.
- **Başkasından beklenen:** K3'ün kamera ekranı hakkındaki görüşü.
- **Yapay zekaya örnek soru:** "Kamera görüntüsünün üstüne yazı koyarken okunabilirliği nasıl sağlarım?"

### H5 · 2 Kas 2026 – 8 Kas 2026

- **Hedef:** Bileşenleri tasarıma göre güncelle ve bir bileşen vitrini ekranı yap.
- **Dosyalar:** `components/Button.tsx`, `Card.tsx`, `WordChip.tsx`, `screens/ShowcaseScreen.tsx` (yeni)
- **Bitti sayılır:** `/vitrin` adresinde tüm bileşenler ve hâlleri tek ekranda görünüyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bir Button bileşenine 'devre dışı' ve 'yükleniyor' hâllerini nasıl eklerim?"

### H6 · 9 Kas 2026 – 15 Kas 2026

- **Hedef:** Kelime detay ekranına video oynatıcıyı ekle.
- **Dosyalar:** `screens/WordScreen.tsx`
- **Bitti sayılır:** `videoUrl` dolu bir kelimede video oynuyor, yavaş çekim butonu çalışıyor.
- **Başkasından beklenen:** K2'den en az bir video adresi (yoksa örnek bir video ile).
- **Yapay zekaya örnek soru:** "expo-video ile bir videoyu yarı hızda nasıl oynatırım?"

### H7 · 16 Kas 2026 – 22 Kas 2026

- **Hedef:** 3 adımlık tanıtım (onboarding) ekranlarını yap.
- **Dosyalar:** `screens/OnboardingScreen.tsx` (yeni)
- **Bitti sayılır:** Uygulama ilk açılışta 3 ekranı gösteriyor, ikinci açılışta göstermiyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "İlk açılışta bir kez gösterilecek ekranı AsyncStorage ile nasıl kontrol ederim?"

### H8 · 23 Kas 2026 – 29 Kas 2026

**Tüm ekip · M1 · Prototip demosu**

- **Senin payın:** Demo akışını baştan sona dene, tasarım düzeltme listesini çıkar.
- **Bitti sayılır:** Telefonda yapılan 10 kelimeden en az 7'si doğru tanınıyor ve bunun ekran kaydı var.

## Faz 2 · MVP (H9–H16)

50 kelime, kullanıcı hesabı, eğitim modülü, pratik modu, test APK'sı (M2).


### H9 · 30 Kas 2026 – 6 Ara 2026

- **Hedef:** Giriş ve kayıt ekranlarını yap.
- **Dosyalar:** `screens/LoginScreen.tsx`, `screens/RegisterScreen.tsx` (yeni), `mobil/ortak/services/auth.ts`
- **Bitti sayılır:** Yeni hesap açılabiliyor, çıkış yapıp tekrar giriş yapılabiliyor; hatalı şifrede anlaşılır mesaj çıkıyor.
- **Başkasından beklenen:** K2'nin Supabase Auth kurulumu (aynı hafta).
- **Yapay zekaya örnek soru:** "React Native'de Supabase ile e-posta/şifre girişi nasıl yapılır?"

### H10 · 7 Ara 2026 – 13 Ara 2026

- **Hedef:** Eğitim akışını tasarla: izle, dene, geri bildirim.
- **Dosyalar:** Figma, `tasarim/README.md`
- **Bitti sayılır:** Akışın tüm ekranları Figma'da; ekip toplantısında gösterildi ve onaylandı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Dil öğrenme uygulamalarında ders akışı genelde nasıl kurgulanır?"

### H11 · 14 Ara 2026 – 20 Ara 2026

- **Hedef:** Eğitim modülünü kodla.
- **Dosyalar:** `screens/LessonScreen.tsx` (yeni)
- **Bitti sayılır:** Bir kategorideki kelimeler sırayla: video, 'Şimdi sen dene', sonuç, sonraki kelime.
- **Başkasından beklenen:** K3'ün pratik modu (aynı hafta).
- **Yapay zekaya örnek soru:** "Adım adım ilerleyen bir ders ekranında durumu (state) nasıl yönetirim?"

### H12 · 21 Ara 2026 – 27 Ara 2026

- **Hedef:** Geri bildirim arayüzünü yap: doğru animasyonu ve tekrar dene.
- **Dosyalar:** `components/Feedback.tsx` (yeni)
- **Bitti sayılır:** Doğru işarette yeşil onay animasyonu, yanlışta 'Tekrar dene' ve ipucu görünüyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React Native'de basit bir onay (tik) animasyonu nasıl yapılır?"

### H13 · 28 Ara 2026 – 3 Oca 2027

- **Hedef:** Erişilebilirlik: büyük yazı, kontrast, titreşimli geri bildirim.
- **Dosyalar:** `components/`, `screens/`
- **Bitti sayılır:** Telefonun yazı boyutu en büyüğe alındığında hiçbir ekranda yazı taşmıyor; doğru işarette titreşim var.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React Native'de sistem yazı boyutuna uyum ve titreşim (haptics) nasıl eklenir?"

### H14 · 4 Oca 2027 – 10 Oca 2027

- **Hedef:** Oyunlaştırmayı tasarla: puan, seri, rozet.
- **Dosyalar:** Figma, `tasarim/README.md`
- **Bitti sayılır:** Puan kuralları tablosu README'de; rozet ve seri tasarımları Figma'da.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bir öğrenme uygulamasında puan ve seri sistemi nasıl kurgulanır?"

### H15 · 11 Oca 2027 – 17 Oca 2027

- **Hedef:** Oyunlaştırma arayüzünü kodla ve profil ekranını ilerleme API'sine bağla.
- **Dosyalar:** `screens/ProfileScreen.tsx`, `components/StreakBadge.tsx` (yeni)
- **Bitti sayılır:** Profilde puan, seri ve rozetler sunucudan geliyor; uygulama kapanıp açılınca kaybolmuyor.
- **Başkasından beklenen:** K2'nin ilerleme API'si (H12).
- **Yapay zekaya örnek soru:** "TanStack Query ile bir POST isteğinden sonra listeyi nasıl yenilerim?"

### H16 · 18 Oca 2027 – 24 Oca 2027

**Tüm ekip · M2 · MVP**

- **Senin payın:** Hata avını yönet, demo videosunu çek.
- **Bitti sayılır:** Test APK'sı 4 telefonda kurulu; giriş, sözlük, video, pratik modu çalışıyor; demo videosu ve ara rapor notları `docs/` içinde.

## Faz 3 · Genişleme ve telefonda tahmin (H17–H24)

100 kelime, modelin telefonda çalışması, oyunlaştırma, beta (M3).


### H17 · 25 Oca 2027 – 31 Oca 2027

- **Hedef:** Ayarlar ekranını yap: kamera yönü, el tercihi, ses.
- **Dosyalar:** `screens/SettingsScreen.tsx` (yeni)
- **Bitti sayılır:** Ayarlar değişince kamera ekranı buna uyuyor ve ayarlar kalıcı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React Native'de açma/kapama (Switch) içeren bir ayarlar listesi nasıl yapılır?"

### H18 · 1 Şub 2027 – 7 Şub 2027

- **Hedef:** Rozet görsellerini ve ikon setini hazırla.
- **Dosyalar:** `mobil/assets/`, Figma
- **Bitti sayılır:** En az 8 rozet ve uygulama ikonu `assets/` içinde; uygulama ikonu telefonda görünüyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Figma'dan ikonları uygulamada kullanmak için hangi biçim ve boyutta dışa aktarmalıyım?"

### H19 · 8 Şub 2027 – 14 Şub 2027

- **Hedef:** Parmak alfabesi modülünü tasarla.
- **Dosyalar:** Figma
- **Bitti sayılır:** Harf listesi ve harf detay ekranı Figma'da; hangi harflerin videoya ihtiyacı olduğu listelendi.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Türk İşaret Dili parmak alfabesinde hareketli harfler hangileri?"

### H20 · 15 Şub 2027 – 21 Şub 2027

- **Hedef:** Parmak alfabesi ekranlarını kodla.
- **Dosyalar:** `screens/AlphabetScreen.tsx` (yeni)
- **Bitti sayılır:** 29 harf ızgarada görünüyor; harfe basınca detay açılıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React Native'de FlatList ile ızgara (grid) görünümü nasıl yapılır?"

### H21 · 22 Şub 2027 – 28 Şub 2027

- **Hedef:** Çevrimdışı mod arayüzünü yap.
- **Dosyalar:** `screens/DictionaryScreen.tsx`, `mobil/ortak/services/api.ts`
- **Bitti sayılır:** İnternet kapalıyken sözlük açılıyor ve üstte 'Çevrimdışı' etiketi görünüyor.
- **Başkasından beklenen:** K2'nin sözlük paketi uç noktası (H20).
- **Yapay zekaya örnek soru:** "TanStack Query verisini cihazda saklayıp internetsiz nasıl kullanırım?"

### H22 · 1 Mar 2027 – 7 Mar 2027

- **Hedef:** Mini oyunun görsellerini ve animasyonlarını yap.
- **Dosyalar:** `screens/GameScreen.tsx` (yeni)
- **Bitti sayılır:** Oyun ekranı K3'ün oyun mantığıyla birlikte baştan sona oynanabiliyor.
- **Başkasından beklenen:** K3'ün oyun mantığı (aynı hafta).
- **Yapay zekaya örnek soru:** "React Native Reanimated ile bir nesneyi ekranda hareket ettiren animasyon nasıl yazılır?"

### H23 · 8 Mar 2027 – 14 Mar 2027

- **Hedef:** Boş durum, hata ve yükleniyor ekranlarını yap.
- **Dosyalar:** `components/EmptyState.tsx`, `components/Skeleton.tsx` (yeni)
- **Bitti sayılır:** Sunucu kapalıyken hiçbir ekran boş beyaz kalmıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Yükleme sırasında gösterilen iskelet (skeleton) ekranı nasıl yapılır?"

### H24 · 15 Mar 2027 – 21 Mar 2027

**Tüm ekip · M3 · Beta**

- **Senin payın:** Bilinen hatalar listesini ve beta duyurusunu yaz.
- **Bitti sayılır:** En az 10 kişi beta sürümünü kurdu; internet kapalıyken tanıma çalışıyor.

## Faz 4 · Kullanıcı testi ve iyileştirme (H25–H30)

İki tur gerçek kullanıcı testi ve ölçülmüş iyileştirmeler (M4).


### H25 · 22 Mar 2027 – 28 Mar 2027

- **Hedef:** Kullanılabilirlik senaryolarını ve SUS anketini hazırla.
- **Dosyalar:** `docs/kullanici-testi.md`
- **Bitti sayılır:** 5 görev senaryosu ve Türkçe SUS anketi yazdırılmaya hazır.
- **Başkasından beklenen:** K2 ile birlikte.
- **Yapay zekaya örnek soru:** "SUS anketi nedir, puanı nasıl hesaplanır?"

### H26 · 29 Mar 2027 – 4 Nis 2027

**Tüm ekip · 1. kullanıcı testi (8-10 katılımcı)**

- **Senin payın:** Gözlemi ve SUS anketini yürüt.
- **Bitti sayılır:** Her katılımcı için doldurulmuş ölçüm formu ve anket var.

### H27 · 5 Nis 2027 – 11 Nis 2027

- **Hedef:** İlk test bulgularına göre tasarım revizyonlarını yap.
- **Dosyalar:** Figma, `screens/`
- **Bitti sayılır:** Test raporundaki arayüz sorunlarının hepsi için öncesi/sonrası ekran görüntüsü PR'da.
- **Başkasından beklenen:** K2'nin test analizi.
- **Yapay zekaya örnek soru:** "Kullanıcılar bu butonu fark etmiyor; görünürlüğünü nasıl artırırım?"

### H28 · 12 Nis 2027 – 18 Nis 2027

- **Hedef:** Erişilebilirlik denetimi yap: TalkBack ve renk körlüğü.
- **Dosyalar:** `components/`, `screens/`
- **Bitti sayılır:** TalkBack açıkken ana akış tamamlanabiliyor; renk körlüğü simülasyonunda bilgi kaybı yok.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "React Native bileşenlerine ekran okuyucu etiketleri nasıl eklenir?"

### H29 · 19 Nis 2027 – 25 Nis 2027

**Tüm ekip · 2. kullanıcı testi**

- **Senin payın:** Aynı senaryolar ve SUS anketi.
- **Bitti sayılır:** İki testin karşılaştırma tablosu `docs/kullanici-testi-2.md` içinde.

### H30 · 26 Nis 2027 – 2 May 2027

**Tüm ekip · M4 · Kullanıcı testi raporu**

- **Senin payın:** Kullanılabilirlik bölümünü yaz.
- **Bitti sayılır:** `docs/kullanici-testi-raporu.md` tamam; TÜBİTAK gelişme raporu için bulgular hazır.

## Faz 5 · Cilalama ve yayın (H31–H36)

Play Store sürümü ve tamamlanmış teknik rapor (M5).


### H31 · 3 May 2027 – 9 May 2027

- **Hedef:** Mağaza görsellerini ve ekran görüntülerini hazırla.
- **Dosyalar:** `mobil/assets/store/` (yeni)
- **Bitti sayılır:** Play Store'un istediği boyutlarda en az 4 ekran görüntüsü ve tanıtım görseli hazır.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Play Store mağaza görselleri için hangi boyutlar gerekiyor?"

### H32 · 10 May 2027 – 16 May 2027

- **Hedef:** Tanıtım videosunu hazırla.
- **Dosyalar:** `docs/` (bağlantı)
- **Bitti sayılır:** 1 dakikalık video çekildi; bağlantısı `README.md` içinde.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bir mobil uygulama tanıtım videosunun senaryosu nasıl yazılır?"

### H33 · 17 May 2027 – 23 May 2027

- **Hedef:** Tanıtım web sayfasını yap.
- **Dosyalar:** `web/` (yeni; burada düz CSS/Tailwind kullanılır)
- **Bitti sayılır:** Tek sayfalık site açılıyor; Play Store ve gizlilik politikası bağlantıları çalışıyor.
- **Başkasından beklenen:** K2'nin gizlilik politikası.
- **Yapay zekaya örnek soru:** "Tailwind CSS ile tek sayfalık bir tanıtım sitesi nasıl yapılır ve ücretsiz nerede yayınlanır?"

### H34 · 24 May 2027 – 30 May 2027

**Tüm ekip · Final hata avı ve regresyon testleri**

- **Senin payın:** Tüm ekranların kontrol listesi.
- **Bitti sayılır:** Kontrol listesindeki tüm maddeler işaretli; 'kritik' etiketli açık Issue yok.

### H35 · 31 May 2027 – 6 Haz 2027

**Tüm ekip · Play Store yayını ve ekip içi final demo**

- **Senin payın:** Demo provasını yönet.
- **Bitti sayılır:** Uygulama Play Store bağlantısından kurulabiliyor.

### H36 · 7 Haz 2027 – 13 Haz 2027

**Tüm ekip · M5 · Geliştirmenin sonu**

- **Senin payın:** Sunum taslağını hazırla.
- **Bitti sayılır:** Repo `v1.0` etiketiyle işaretlendi; `docs/` klasörü eksiksiz. Bu haftadan sonra yeni özellik eklenmez.

## Son aylar (H37–H52): yeni özellik yok

- **H37-H40 · Gecikme telafisi ve son kontroller:** Kayan kilometre taşlarını kapat; tüm cihazlarda son test turu; mağaza yorumlarındaki hataları düzelt.
- **H41-H44 · Raporlar:** TÜBİTAK sonuç raporu ve harcama belgeleri; teknik rapor son okuma; danışman düzeltmeleri.
- **H45-H48 · Sunum hazırlığı:** Sunum dosyası, canlı demo provası (en az 3 kez), olası sorulara yanıt listesi, yedek demo videosu.
- **H49-H52 · Yedek:** Sunum tarihleri ve beklenmeyen işler için boş bırakıldı.
