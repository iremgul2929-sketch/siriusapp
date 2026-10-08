# ortak/ · Birden fazla kişinin kullandığı dosyalar

Sorumlu: **K2**. Buradaki bir dosyayı değiştirmeden önce ekibe haber verin.

| Dosya | Ne | Kim kullanır |
|---|---|---|
| `veri/words.json` | Sözlüğün tek kaynağı: kategoriler ve kelimeler | K2 (API), K3 ve K4 (uygulama), K1 (kelime id'leri = veri klasör adları) |
| `araclar/sozluk_esitle.py` | Sözlüğü doğrular ve mobil uygulamadaki yedek kopyayı günceller | Sözlüğü değiştiren herkes |

## Sözlüğe kelime eklemek

1. `veri/words.json` içine kelimeyi ekleyin. `id` küçük harf ve Türkçe karaktersiz olmalı
   (`tesekkur`), `title` ekranda görünen hâlidir (`Teşekkür`).
2. Çalıştırın:
   ```bash
   python ortak/araclar/sozluk_esitle.py
   ```
3. İki dosyayı birlikte commit'leyin. CI, kopyanın güncel olup olmadığını kontrol eder.

K1 için: eğitim verisindeki klasör adları (`data/raw/<kelime_id>/`) buradaki `id` ile aynı
olmalı; modelin döndürdüğü etiket uygulamada bu `id` üzerinden başlığa çevrilir.
