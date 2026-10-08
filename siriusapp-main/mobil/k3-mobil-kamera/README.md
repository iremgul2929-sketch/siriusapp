# mobil/k3-mobil-kamera/ · Kamera ve Tanıma (K3)

Kameradan kare alıp sunucuya gönderen, gelen kelimeyi ekranda gösteren kısım.
Haftalık görevlerin: `GOREVLER.md`

## Bu klasörde ne var

| Dosya | Ne yapar |
|---|---|
| `screens/CameraScreen.tsx` | Kamera ekranı: izin, önizleme, durum etiketleri, sonuç, pratik modu |
| `hooks/useInferenceSocket.ts` | Backend `/ws/infer` bağlantısı; kopunca yeniden bağlanır |
| `hooks/useFrameCapture.ts` | Kameradan saniyede ~4 kare alır |
| `components/ScanCorners.tsx` | Tarama çerçevesi |
| `components/StatusPill.tsx` | "Bağlı", "Demo modu", "El görüldü" etiketleri |

## Kurulum ve çalıştırma

Kurulum `mobil/README.md` içinde (K4 ile aynı uygulama). Kısaca:

```bash
cd mobil
npm install && npx expo install --fix
cp .env.example .env     # backend adresini yaz
npx expo start
```

Kamera ekranını **gerçek telefonda** (Expo Go) ya da **web'de** (`w` tuşu) dene.
Genymotion'ın ücretsiz sürümünde kamera yok.

Pratik modunu doğrudan açmak için adres: `/camera?target=tesekkur`

## Başkalarıyla bağlantın

- **K2'den alırsın:** çalışan backend ve `/ws/infer` (mesaj biçimi: `docs/mimari.md`).
- **K4'ten alırsın:** `@k4/components/WordChip`, `Button`. Değiştirmen gerekirse K4'e Issue aç.
- **K1'den alırsın (H18+):** telefonda çalışacak model dosyaları ve `docs/model-format.md`.
- **K4'e verirsin:** `/camera?target=<kelime_id>` adresi; K4'ün "Şimdi sen dene" butonu buraya gelir.

## Yeni ekran eklemek

1. Ekranı `screens/YeniEkran.tsx` olarak yaz (`export default function ...`).
2. `mobil/app/yeni.tsx` dosyasını tek satırla oluştur:
   ```ts
   export { default } from '@k3/screens/YeniEkran';
   ```
3. `mobil/app/` ortak alan olduğu için PR'da K4'ü inceleyici ekle.
