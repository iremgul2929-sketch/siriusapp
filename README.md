# Sirius

Isaret dilini kelimeye ceviren ve ayni zamanda kullaniciya isaret dilini ogreten
yapay zeka destekli mobil uygulama. Bu repo, mobil uygulamanin (Expo / React
Native / TypeScript) profesyonel proje iskeletidir.

## Baslarken

```bash
npm install
npx expo start
```

Terminalde cikan QR kodu telefonunuzda **Expo Go** uygulamasiyla tarayin;
proje telefonunuzda canli olarak acilir. Kod uzerinde yaptiginiz her degisiklik
Fast Refresh ile aninda telefona yansir.

VS Code'da bu klasoru actiktan sonra, ayni klasorde ikinci bir terminalden
`npx expo start` calistirip telefonu yaninizda acik tutmaniz onerilir.

## Klasor yapisi

```
sirius-app/
├── app/                # Expo Router - dosya tabanli ekranlar/rotalar
│   ├── _layout.tsx     # Kok navigasyon
│   ├── index.tsx       # Ana ekran (kategoriler + kamera CTA)
│   ├── camera.tsx      # Canli tanima ekrani
│   └── learn/          # Sozluk / egitim akisi
│       ├── index.tsx
│       └── [word].tsx  # Kelime detayi: video + "simdi sen dene"
├── src/
│   ├── components/     # HandOverlay, WordChip, ScanCorners...
│   ├── hooks/          # useSignRecognizer, useCameraPermission
│   ├── ml/             # Model yukleme, landmark islemleri, tipler
│   ├── data/           # Sozluk / kategori verisi
│   ├── store/          # Zustand ile uygulama durumu (ogrenilen kelimeler, seri)
│   ├── constants/      # Tema (renk/tipografi) ve config
│   └── utils/
├── assets/
│   ├── models/         # Donusturulmus tanima modeli (sirius.tflite)
│   ├── videos/         # Kelime basina beden dili anlatim videolari
│   ├── images/         # Ikon, splash, gorseller
│   └── fonts/
└── ...config dosyalari (app.json, tsconfig.json, babel.config.js, vb.)
```

## Mimari notu

Bu iskelet, daha once cikarilan teknik planla (OpenCV + MediaPipe ile Python'da
egitilen model -> TFLite'a donusturme -> telefonda calisan hafif model) birebir
uyumlu calisacak sekilde kuruldu:

- `src/ml/landmarks.ts` — kare basina el landmark noktalarini cikarir (su an
  bos govde / TODO; MediaPipe Tasks Vision veya benzeri bir native modulle
  doldurulacak).
- `src/ml/model.ts` — `assets/models/sirius.tflite` dosyasini yukleyip
  landmark dizisini kelime tahminine cevirir (su an bos govde / TODO).
- `src/hooks/useSignRecognizer.ts` — bu ikisini bir araya getirip 30 karelik
  bir tampon (window) uzerinden calisan cekirdek tanima hook'u.

## Sonraki adimlar

1. `expo-camera` su an per-frame native goruntu erisimi sunmuyor; gercek zamanli
   tanima icin `react-native-vision-camera` + frame processor'lara gecmeyi
   degerlendirin (`app/camera.tsx` ve `useSignRecognizer.ts` bu gecise gore
   yorumlandi).
2. Egitilen modeli `assets/models/sirius.tflite` altina koyup `src/ml/model.ts`
   icindeki TODO'lari `react-native-fast-tflite` (veya onnxruntime-react-native)
   ile doldurun.
3. `src/data/words.json` icindeki ornek kelimeleri gercek sozluk verinizle
   degistirin, video URL'lerini `assets/videos/` altina baglayin.
