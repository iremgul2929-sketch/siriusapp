# Karar kayıtları

Her karar için: tarih, karar, neden, alternatifler. Yeni kararı en alta ekleyin.

## 2026-10 · Tek repo, kişi bazlı klasörler
`k1-yapay-zeka/`, `k2-backend/`, `mobil/k3-mobil-kamera/`, `mobil/k4-mobil-arayuz/`.
Neden: herkes kendi klasöründe çalışınca çakışma azalır ve kimin neyi değiştirdiği
klasör adından anlaşılır. Ortak dosyalar `ortak/` ve `mobil/ortak/` içinde.

## 2026-10 · K3 ve K4 tek Expo uygulamasını paylaşır
Bir Expo uygulaması iki ayrı projeye bölünemez (tek `package.json`, tek `app/`).
Bu yüzden `mobil/` tek uygulama; `app/` içindeki dosyalar tek satırdır ve ekranı
sahibinin klasöründen çağırır. Gerçek kod `k3-mobil-kamera/` ve `k4-mobil-arayuz/` içinde.

## 2026-10 · Yol haritasındaki rol dağılımında üç değişiklik
PDF'te K1 ve K3 "yüksek", K2 ve K4 "orta" zorlukta işaretliydi. Dengelemek için:
1. Sözlük, giriş/kayıt ve profil ekranları K3'ten K4'e geçti (bunlar arayüz işi).
2. Gönüllü veri toplama protokolü ve onam formu K1'den K2'ye geçti.
3. K3, Faz 3'ün en riskli işi olan development build'i H14'te önceden deniyor.

## 2026-10 · İlk 16 hafta tahmin sunucuda
Neden: Expo Go cihazda özel native ML modüllerini çalıştıramaz; sunucuda tahmin
ile 8. haftada çalışan demo çıkar. Faz 3'te telefona taşınacak.

## 2026-10 · Ham görüntü yerine el noktaları; H2'de sadece el
MediaPipe ile çıkarılan noktalar modele girer. PDF'te H2'de "el + poz" yazıyordu;
ilk model sadece el noktalarıyla kuruldu, vücut noktaları H22'deki v2 denemesine bırakıldı.

## 2026-10 · Tailwind → NativeWind
React Native'de CSS motoru yok; Tailwind sınıfları NativeWind ile kullanılıyor.

## 2026-10 · Genymotion sadece arayüz testi için
Ücretsiz sürümde kamera yok. Kamera ve tanıma testleri gerçek Android telefonda.
