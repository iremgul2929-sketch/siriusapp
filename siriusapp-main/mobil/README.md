# mobil/ · Mobil uygulama (K3 + K4)

React Native + Expo + TypeScript + NativeWind (Tailwind sınıfları). **Tek uygulama,
iki kişinin klasörü ayrı.**

## Neden tek uygulama?

Bir Expo uygulamasının tek bir `package.json` dosyası ve tek bir `app/` klasörü olur;
iki ayrı projeye bölünemez. Bu yüzden:

```
mobil/
├── app/                   Adres → ekran eşlemesi. Her dosya TEK SATIR:
│   ├── index.tsx              export { default } from '@k4/screens/HomeScreen';
│   ├── camera.tsx             export { default } from '@k3/screens/CameraScreen';
│   ├── profile.tsx            → @k4
│   └── learn/…                → @k4
├── k3-mobil-kamera/       K3'ün tüm kodu  (içe aktarma kısaltması: @k3/…)
├── k4-mobil-arayuz/       K4'ün tüm kodu  (içe aktarma kısaltması: @k4/…)
├── ortak/                 İkisinin birlikte kullandığı kod (@ortak/…)
└── package.json, app.json, tailwind.config.js …   ayar dosyaları
```

`app/` içindeki dosyalar sadece "bu adres şu kişinin şu ekranını açar" der; gerçek kod
kişinin kendi klasöründedir. Böylece K3 ve K4 aynı dosyayı neredeyse hiç aynı anda
değiştirmez.

## Kurulum (bir kere)

```bash
cd mobil
npm install
npx expo install --fix     # paket sürümlerini Expo SDK'sına göre hizalar
cp .env.example .env
```

### `.env` içindeki backend adresi

| Nerede çalıştırıyorsunuz | `EXPO_PUBLIC_API_URL` |
|---|---|
| Gerçek telefon (aynı Wi-Fi) | `http://<bilgisayarın IP'si>:8000` · macOS'ta IP: `ipconfig getifaddr en0` |
| Genymotion | `http://10.0.3.2:8000` |
| Web (tarayıcı) | `http://localhost:8000` |

`.env` değişince Expo'yu `npx expo start -c` ile yeniden başlatın.

## Çalıştırma

```bash
npx expo start
```

- Telefonda: Expo Go ile QR kodu tarayın
- Genymotion: emülatör açıkken terminalde `a`
- Tarayıcıda: `w`

**"Project is incompatible with this version of Expo Go"** hatası alırsanız telefonunuzdaki
Expo Go daha yeni bir SDK bekliyor demektir:

```bash
npx expo install expo@latest
npx expo install --fix
```

## Genymotion notu

Ücretsiz sürümde kamera yok. K4'ün ekranlarını Genymotion'da, K3'ün kamera ekranını
gerçek telefonda veya web'de test edin.

## Ayar dosyalarının sorumlusu

| Dosya | Sorumlu |
|---|---|
| `package.json`, `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json` | K3 |
| `tailwind.config.js` (renkler) | K4 |
| `app/_layout.tsx`, `app/learn/_layout.tsx` (gezinme) | K3 ve K4 |

Yeni paket eklemek (`npm install …`) `package.json` dosyasını değiştirir; eklemeden önce
diğer kişiye haber verin, yoksa çakışma çıkar.

## PR öncesi

```bash
npm run typecheck
npm run lint
```
