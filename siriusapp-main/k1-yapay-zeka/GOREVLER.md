# K1 · Yapay Zeka ve Görüntü İşleme — haftalık görevler

Klasörün: `k1-yapay-zeka/` · Başlangıç: 5 Eki 2026 (Pazartesi)

Her hafta başında o haftanın görevini GitHub'da Issue olarak aç, hafta sonunda Pull Request ile kapat.
Dosya yolları aksi yazmıyorsa kendi klasörüne göredir. `(hazır)` yazan dosyalar başlangıç koduyla birlikte geldi: önce çalıştır ve oku, sonra değiştir.


## Faz 0 · Kurulum ve öğrenme (H1–H2)

Herkesin bilgisayarında proje çalışıyor, araçlar kurulu, veri başvuruları yapılmış.


### H1 · 5 Eki 2026 – 11 Eki 2026

- **Hedef:** Python ortamını kur ve webcam'de elinin iskeletini gör.
- **Dosyalar:** `k1-yapay-zeka/scripts/webcam_demo.py` (hazır), `scripts/download_models.py` (hazır)
- **Bitti sayılır:** `python scripts/webcam_demo.py` çalışınca açılan pencerede elinin 21 noktası çiziliyor ve sol üstte FPS yazıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "macOS'ta Python 3.11 sanal ortamı nasıl kurulur ve VS Code'da yorumlayıcı olarak nasıl seçilir?"

### H2 · 12 Eki 2026 – 18 Eki 2026

- **Hedef:** Webcam'den el noktalarını dosyaya kaydeden bir kayıt betiği yaz.
- **Dosyalar:** `k1-yapay-zeka/scripts/record_landmarks.py` (yeni)
- **Bitti sayılır:** Betik 3 saniye kayıt alıp `data/processed/deneme.npy` yazıyor; `np.load(...).shape` çıktısı `(kare_sayısı, 126)`.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "`HandLandmarkExtractor` ile webcam'den 3 saniye boyunca özellik vektörü toplayıp `.npy` olarak nasıl kaydederim?"

## Faz 1 · Prototip (H3–H8)

10 kelimelik, telefondan sunucuya uçtan uca çalışan ilk tanıma (M1).


### H3 · 19 Eki 2026 – 25 Eki 2026

- **Hedef:** Videodan el noktası çıkarma hattını kendi çektiğin 5 kısa video üzerinde çalıştır.
- **Dosyalar:** `src/sirius_ai/dataset.py` (hazır), `data/raw/deneme/` (kendi videoların)
- **Bitti sayılır:** `python -m sirius_ai.dataset` hatasız bitiyor ve `X.npy` şekli `(5, 30, 126)`.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "`dataset.py` içindeki `resample` ve `trim_empty` ne yapıyor, bana satır satır açıklar mısın?"

### H4 · 26 Eki 2026 – 1 Kas 2026

- **Hedef:** Pilot için 10 kelime seç ve her kelime için en az 20 video hazırla.
- **Dosyalar:** `data/raw/<kelime_id>/` (repoya girmez), `docs/kararlar.md` (kelime listesi)
- **Bitti sayılır:** `data/raw/` altında 10 klasör, her birinde en az 20 video var; kelime listesi `docs/kararlar.md` içinde.
- **Başkasından beklenen:** K2'den veri seti erişimi. Onay gelmediyse ekip kendi videolarını çeker.
- **Yapay zekaya örnek soru:** "AUTSL veri setindeki sınıf numaralarını kelime adlarına nasıl eşlerim?"

### H5 · 2 Kas 2026 – 8 Kas 2026

- **Hedef:** Veri çoğaltmaya zaman kaydırma (time shift) ekle ve testini yaz.
- **Dosyalar:** `src/sirius_ai/augment.py`, `tests/test_sequence.py`
- **Bitti sayılır:** `pytest` geçiyor ve yeni `time_shift` fonksiyonunun en az 1 testi var.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bir (30, 126) dizisini birkaç kare ileri/geri kaydırıp boşlukları sıfırla dolduran fonksiyonu nasıl yazarım?"

### H6 · 9 Kas 2026 – 15 Kas 2026

- **Hedef:** İlk LSTM modelini 10 kelimeyle eğit.
- **Dosyalar:** `src/sirius_ai/train.py`, `src/sirius_ai/model.py` (hazır)
- **Bitti sayılır:** `python -m sirius_ai.train` sonunda `Doğrulama doğruluğu: ...` satırı çıkıyor ve `models/sirius.keras` oluşuyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Eğitim doğruluğu yüksek ama doğrulama doğruluğu düşükse bu ne anlama gelir, ne yapmalıyım?"

### H7 · 16 Kas 2026 – 22 Kas 2026

- **Hedef:** Modelin raporunu çıkar ve TFLite dosyasını üret.
- **Dosyalar:** `src/sirius_ai/evaluate.py`, `src/sirius_ai/export_tflite.py` (hazır)
- **Bitti sayılır:** `models/confusion_matrix.png` ve `models/sirius.tflite` oluştu; en zayıf 3 kelime `docs/kararlar.md` içinde.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Karışıklık matrisini nasıl okurum; hangi iki kelimenin birbirine karıştığını nasıl anlarım?"

### H8 · 23 Kas 2026 – 29 Kas 2026

**Tüm ekip · M1 · Prototip demosu**

- **Senin payın:** 10 kelimelik `sirius.tflite` ve `labels.json` dosyalarını K2'ye teslim et.
- **Bitti sayılır:** Telefonda yapılan 10 kelimeden en az 7'si doğru tanınıyor ve bunun ekran kaydı var.

## Faz 2 · MVP (H9–H16)

50 kelime, kullanıcı hesabı, eğitim modülü, pratik modu, test APK'sı (M2).


### H9 · 30 Kas 2026 – 6 Ara 2026

- **Hedef:** Kelime sayısını 30'a çıkar ve her kelimede kaç örnek olduğunu tabloya dök.
- **Dosyalar:** `data/raw/`, `notebooks/01_veri_kesfi.ipynb` (yeni)
- **Bitti sayılır:** Defterde kelime başına örnek sayısı grafiği var; 30 kelimelik model eğitildi.
- **Başkasından beklenen:** K2'nin veri düzenleme betiği (H4).
- **Yapay zekaya örnek soru:** "Bazı kelimelerde çok az örnek varsa sınıf dengesizliğini nasıl azaltırım?"

### H10 · 7 Ara 2026 – 13 Ara 2026

- **Hedef:** LSTM ile GRU'yu aynı veride karşılaştır.
- **Dosyalar:** `notebooks/02_lstm_vs_gru.ipynb` (yeni), `docs/kararlar.md`
- **Bitti sayılır:** İki modelin doğruluk, dosya boyutu ve eğitim süresi tablosu `docs/kararlar.md` içinde; hangisinin seçildiği yazılı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "LSTM ve GRU arasındaki fark nedir, küçük veri setinde hangisi genelde daha iyi sonuç verir?"

### H11 · 14 Ara 2026 – 20 Ara 2026

- **Hedef:** Gönüllü kaydı için kelime kelime video çeken bir kayıt aracı yaz.
- **Dosyalar:** `k1-yapay-zeka/scripts/record_samples.py` (yeni)
- **Bitti sayılır:** Araç ekranda kelimeyi gösteriyor, geri sayımdan sonra 2 saniyelik videoyu `data/raw/<kelime>/` içine doğru adla kaydediyor.
- **Başkasından beklenen:** K2'nin veri toplama protokolü (aynı hafta).
- **Yapay zekaya örnek soru:** "OpenCV ile webcam'den geri sayımlı 2 saniyelik video kaydı nasıl yapılır?"

### H12 · 21 Ara 2026 – 27 Ara 2026

- **Hedef:** Modeli 50 kelimeyle yeniden eğit.
- **Dosyalar:** `src/sirius_ai/train.py`
- **Bitti sayılır:** 50 kelimelik `sirius.tflite` ve `labels.json` K2'ye teslim edildi; doğrulama doğruluğu `docs/kararlar.md` içinde.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Kelime sayısı artınca doğruluk düştü; model boyutunu mu veriyi mi artırmalıyım?"

### H13 · 28 Ara 2026 – 3 Oca 2027

- **Hedef:** Güven eşiği ve oylama ayarlarını kayıtlı videolar üzerinde dene, en iyi değerleri öner.
- **Dosyalar:** `k1-yapay-zeka/scripts/tune_threshold.py` (yeni); değerler `k2-backend/.env.example` içine K2 onayıyla
- **Bitti sayılır:** Farklı eşiklerde yanlış alarm ve kaçırma sayılarının tablosu var; önerilen değerler PR'da.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Güven eşiğini yükseltmenin yanlış alarm ve kaçırma oranına etkisi nedir?"

### H14 · 4 Oca 2027 – 10 Oca 2027

- **Hedef:** Hareket miktarından işaretin başladığı ve bittiği kareyi bulan fonksiyon yaz.
- **Dosyalar:** `src/sirius_ai/sequence.py`, `tests/test_sequence.py`
- **Bitti sayılır:** `find_active_segment` fonksiyonu ve testi var; `pytest` geçiyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Ardışık kareler arasındaki nokta farkından hareket enerjisi nasıl hesaplanır?"

### H15 · 11 Oca 2027 – 17 Oca 2027

- **Hedef:** Model v1 raporunu yaz.
- **Dosyalar:** `docs/model-v1.md` (yeni)
- **Bitti sayılır:** Raporda veri miktarı, kelime başına doğruluk tablosu, karışıklık matrisi ve bilinen zayıflıklar var.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bir makine öğrenmesi modelinin raporunda hangi başlıklar bulunmalı?"

### H16 · 18 Oca 2027 – 24 Oca 2027

**Tüm ekip · M2 · MVP**

- **Senin payın:** 50 kelimelik modeli teslim et, bilinen zayıf kelimeleri listele.
- **Bitti sayılır:** Test APK'sı 4 telefonda kurulu; giriş, sözlük, video, pratik modu çalışıyor; demo videosu ve ara rapor notları `docs/` içinde.

## Faz 3 · Genişleme ve telefonda tahmin (H17–H24)

100 kelime, modelin telefonda çalışması, oyunlaştırma, beta (M3).


### H17 · 25 Oca 2027 – 31 Oca 2027

- **Hedef:** TFLite modelinin Keras modeliyle aynı sonucu verdiğini ölç.
- **Dosyalar:** `k1-yapay-zeka/scripts/compare_tflite.py` (yeni)
- **Bitti sayılır:** Betik iki modelin doğrulama doğruluğunu yan yana yazdırıyor; fark `docs/model-v1.md` içinde.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Python'da bir TFLite modelini yükleyip tek bir örnek üzerinde nasıl çalıştırırım?"

### H18 · 1 Şub 2027 – 7 Şub 2027

- **Hedef:** Telefonda el noktası çıkarmak için kullanılacak model dosyasını hazırla ve K3'e teslim et.
- **Dosyalar:** `models/hand_landmarker.task`, `docs/model-format.md` (yeni)
- **Bitti sayılır:** Dosya ve girdi/çıktı boyutları belgelendi; K3 dosyayı telefonda yükleyebildiğini doğruladı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "MediaPipe hand_landmarker.task dosyasının girdi görüntü boyutu ve çıktı biçimi nedir?"

### H19 · 8 Şub 2027 – 14 Şub 2027

- **Hedef:** Sınıflandırma modelinin girdi/çıktı biçimini K3 için belgeye dök.
- **Dosyalar:** `docs/model-format.md`
- **Bitti sayılır:** Belgede 126'lık vektörün sırası, normalizasyon adımları ve örnek bir girdi/çıktı var; K3 okuyup onayladı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Python'daki normalizasyon adımlarımı TypeScript'e çevirirken nelere dikkat etmeliyim?"

### H20 · 15 Şub 2027 – 21 Şub 2027

- **Hedef:** Kelime sayısını 100'e çıkar, gönüllü verisini ekle.
- **Dosyalar:** `data/raw/`, `src/sirius_ai/train.py`
- **Bitti sayılır:** 100 kelimelik model eğitildi; doğruluk tablosu güncellendi.
- **Başkasından beklenen:** K2'den gönüllü videoları.
- **Yapay zekaya örnek soru:** "Farklı kişilerden gelen veriyi eğitim ve doğrulamaya kişi bazında nasıl ayırırım?"

### H21 · 22 Şub 2027 – 28 Şub 2027

- **Hedef:** Modeli küçült (quantization) ve hız/doğruluk farkını ölç.
- **Dosyalar:** `src/sirius_ai/export_tflite.py --quantize`
- **Bitti sayılır:** Küçültülmüş dosyanın boyutu, doğruluğu ve K3'ün ölçtüğü telefon hızı tabloda.
- **Başkasından beklenen:** K3'ten telefonda hız ölçümü.
- **Yapay zekaya örnek soru:** "TFLite quantization nedir, doğruluğu ne kadar etkiler?"

### H22 · 1 Mar 2027 – 7 Mar 2027

- **Hedef:** El noktalarına vücut noktalarını ekleyen model v2 denemesi yap.
- **Dosyalar:** `src/sirius_ai/landmarks.py`, `notebooks/03_model_v2.ipynb` (yeni)
- **Bitti sayılır:** v2 modelinin doğruluğu defterde v1 ile yan yana.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "MediaPipe PoseLandmarker ile omuz ve dirsek noktalarını nasıl alırım?"

### H23 · 8 Mar 2027 – 14 Mar 2027

- **Hedef:** v1 ile v2'yi karşılaştır ve yayınlanacak modeli seç.
- **Dosyalar:** `docs/kararlar.md`
- **Bitti sayılır:** Karar ve gerekçesi yazıldı; seçilen model K2 ve K3'e teslim edildi.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "İki modeli karşılaştırırken doğruluk dışında hangi ölçütlere bakmalıyım?"

### H24 · 15 Mar 2027 – 21 Mar 2027

**Tüm ekip · M3 · Beta**

- **Senin payın:** Seçilen 100 kelimelik modeli teslim et.
- **Bitti sayılır:** En az 10 kişi beta sürümünü kurdu; internet kapalıyken tanıma çalışıyor.

## Faz 4 · Kullanıcı testi ve iyileştirme (H25–H30)

İki tur gerçek kullanıcı testi ve ölçülmüş iyileştirmeler (M4).


### H25 · 22 Mar 2027 – 28 Mar 2027

- **Hedef:** Kullanıcı testi için ölçüm protokolünü yaz.
- **Dosyalar:** `docs/kullanici-testi.md`
- **Bitti sayılır:** Belgede test edilecek 20 kelime, her kelime için tekrar sayısı ve başarı tanımı var.
- **Başkasından beklenen:** K2 ve K4'ün test takvimi.
- **Yapay zekaya örnek soru:** "Bir tanıma sisteminin gerçek kullanıcıyla doğruluğunu ölçmek için nasıl bir protokol kurulur?"

### H26 · 29 Mar 2027 – 4 Nis 2027

**Tüm ekip · 1. kullanıcı testi (8-10 katılımcı)**

- **Senin payın:** Gerçek kullanıcıda kelime başına doğruluğu ölç.
- **Bitti sayılır:** Her katılımcı için doldurulmuş ölçüm formu ve anket var.

### H27 · 5 Nis 2027 – 11 Nis 2027

- **Hedef:** İlk testte yanlış tanınan kelimeler için veri ekle ve yeniden eğit.
- **Dosyalar:** `data/raw/`, `src/sirius_ai/train.py`
- **Bitti sayılır:** Sorunlu kelimelerin doğruluğu öncesi/sonrası tablosu `docs/kullanici-testi-1.md` içinde.
- **Başkasından beklenen:** K2'nin test analizi.
- **Yapay zekaya örnek soru:** "Model belirli iki kelimeyi sürekli karıştırıyorsa nasıl düzeltirim?"

### H28 · 12 Nis 2027 – 18 Nis 2027

- **Hedef:** Kullanıcıya özel kısa kalibrasyonun işe yarayıp yaramadığını dene.
- **Dosyalar:** `notebooks/04_kalibrasyon.ipynb` (yeni)
- **Bitti sayılır:** Kalibrasyonlu ve kalibrasyonsuz doğruluk karşılaştırması ve 'kullanalım/kullanmayalım' kararı yazılı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bir kullanıcının birkaç örneğiyle modeli ince ayarlamak (fine-tuning) nasıl yapılır?"

### H29 · 19 Nis 2027 – 25 Nis 2027

**Tüm ekip · 2. kullanıcı testi**

- **Senin payın:** İlk testle aynı kelimelerde doğruluğu ölç.
- **Bitti sayılır:** İki testin karşılaştırma tablosu `docs/kullanici-testi-2.md` içinde.

### H30 · 26 Nis 2027 – 2 May 2027

**Tüm ekip · M4 · Kullanıcı testi raporu**

- **Senin payın:** Doğruluk bölümünü yaz.
- **Bitti sayılır:** `docs/kullanici-testi-raporu.md` tamam; TÜBİTAK gelişme raporu için bulgular hazır.

## Faz 5 · Cilalama ve yayın (H31–H36)

Play Store sürümü ve tamamlanmış teknik rapor (M5).


### H31 · 3 May 2027 – 9 May 2027

- **Hedef:** Final modeli eğit ve model kartını yaz.
- **Dosyalar:** `docs/model-karti.md` (yeni)
- **Bitti sayılır:** Model kartında veri kaynağı, başarı, sınırlar ve kullanılmaması gereken durumlar yazıyor.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Model kartı (model card) nedir, hangi bölümleri içerir?"

### H32 · 10 May 2027 – 16 May 2027

- **Hedef:** Teknik raporun yöntem, veri ve sonuçlar bölümünü yaz.
- **Dosyalar:** `docs/rapor/yontem-ve-sonuclar.md` (yeni)
- **Bitti sayılır:** Bölüm tamamlandı, grafikler eklendi, bir ekip üyesi okuyup onayladı.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Bu notlarımı akademik rapor diline nasıl çeviririm?"

### H33 · 17 May 2027 – 23 May 2027

- **Hedef:** Rapor grafiklerini son hâline getir; isteğe bağlı bildiri taslağı.
- **Dosyalar:** `docs/rapor/`
- **Bitti sayılır:** Tüm grafikler aynı biçimde ve Türkçe etiketli; taslak varsa danışmana gönderildi.
- **Başkasından beklenen:** Yok
- **Yapay zekaya örnek soru:** "Matplotlib grafiklerini rapor için tutarlı ve okunaklı nasıl yaparım?"

### H34 · 24 May 2027 – 30 May 2027

**Tüm ekip · Final hata avı ve regresyon testleri**

- **Senin payın:** Model ve tanıma senaryoları.
- **Bitti sayılır:** Kontrol listesindeki tüm maddeler işaretli; 'kritik' etiketli açık Issue yok.

### H35 · 31 May 2027 – 6 Haz 2027

**Tüm ekip · Play Store yayını ve ekip içi final demo**

- **Senin payın:** Demo için kelime setini hazırla.
- **Bitti sayılır:** Uygulama Play Store bağlantısından kurulabiliyor.

### H36 · 7 Haz 2027 – 13 Haz 2027

**Tüm ekip · M5 · Geliştirmenin sonu**

- **Senin payın:** Model belgelerini arşivle.
- **Bitti sayılır:** Repo `v1.0` etiketiyle işaretlendi; `docs/` klasörü eksiksiz. Bu haftadan sonra yeni özellik eklenmez.

## Son aylar (H37–H52): yeni özellik yok

- **H37-H40 · Gecikme telafisi ve son kontroller:** Kayan kilometre taşlarını kapat; tüm cihazlarda son test turu; mağaza yorumlarındaki hataları düzelt.
- **H41-H44 · Raporlar:** TÜBİTAK sonuç raporu ve harcama belgeleri; teknik rapor son okuma; danışman düzeltmeleri.
- **H45-H48 · Sunum hazırlığı:** Sunum dosyası, canlı demo provası (en az 3 kez), olası sorulara yanıt listesi, yedek demo videosu.
- **H49-H52 · Yedek:** Sunum tarihleri ve beklenmeyen işler için boş bırakıldı.
