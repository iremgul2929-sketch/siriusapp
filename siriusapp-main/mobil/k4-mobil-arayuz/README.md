# mobil/k4-mobil-arayuz/ · Arayüz, Eğitim ve Tasarım (K4)

Uygulamanın kamera dışındaki tüm ekranları, ortak bileşenler ve tasarım.
Haftalık görevlerin: `GOREVLER.md`

## Bu klasörde ne var

| Dosya | Ne yapar |
|---|---|
| `screens/HomeScreen.tsx` | Ana ekran: karşılama, kamera butonu, kategoriler |
| `screens/DictionaryScreen.tsx` | Sözlük: arama, kategori süzme |
| `screens/WordScreen.tsx` | Kelime detayı: video alanı, "Şimdi sen dene" |
| `screens/ProfileScreen.tsx` | İlerleme: öğrenilen kelimeler, başarı oranı |
| `components/Button.tsx`, `Card.tsx`, `WordChip.tsx` | Tüm uygulamanın kullandığı bileşenler |
| `tasarim/README.md` | Figma bağlantısı, renk tablosu |

## Kurulum ve çalıştırma

Kurulum `mobil/README.md` içinde (K3 ile aynı uygulama). Kısaca:

```bash
cd mobil
npm install && npx expo install --fix
cp .env.example .env
npx expo start
```

Senin ekranların kamera kullanmadığı için **Genymotion'da** (`a` tuşu) ve web'de (`w`) rahatça
test edebilirsin. Backend kapalıyken de sözlük açılır (uygulama içi yedek veriyle).

## Stil: NativeWind

```tsx
<View className="rounded-xl border border-line bg-panel p-4">
  <Text className="text-base font-semibold text-fg">Merhaba</Text>
</View>
```

Renk adları (`ink`, `panel`, `line`, `fg`, `dim`, `accent`, `amber`, `ok`, `bad`)
`mobil/tailwind.config.js` içinde ve sorumlusu sensin. Bir rengi değiştirirsen
`mobil/ortak/theme.ts` ve `tasarim/README.md` içindekini de güncelle.

## Başkalarıyla bağlantın

- **K2'den alırsın:** `/words`, `/categories` (sonra giriş, ilerleme, video adresleri).
- **K3'e verirsin:** `WordChip`, `Button` bileşenleri ve kamera ekranının tasarımı.
- **K3'ten alırsın:** `/camera?target=<kelime_id>` adresi (pratik modu).

## Yeni ekran eklemek

1. Ekranı `screens/YeniEkran.tsx` olarak yaz (`export default function ...`).
2. `mobil/app/yeni.tsx` dosyasını tek satırla oluştur:
   ```ts
   export { default } from '@k4/screens/YeniEkran';
   ```
3. `mobil/app/` ortak alan olduğu için PR'da K3'ü inceleyici ekle.
