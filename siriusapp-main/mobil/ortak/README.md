# mobil/ortak/ · K3 ve K4'ün birlikte kullandığı kod

Sorumlu: **K3 ve K4 birlikte**. Burada değişiklik yapan kişi PR'da diğerini inceleyici ekler.

| Dosya | Ne |
|---|---|
| `config.ts` | Backend adresi, kare gönderme aralığı |
| `theme.ts` | Renkler (`className` kullanılamayan yerler için). `tailwind.config.js` ile aynı olmalı |
| `types.ts` | Kelime, kategori ve WebSocket mesaj türleri (`docs/mimari.md` ile aynı) |
| `services/api.ts` | Backend'den kelime/kategori çekme; ulaşılamazsa `data/words.json` |
| `hooks/useWords.ts` | Kelime ve kategori verisi, id → başlık çevirisi |
| `store/useProgressStore.ts` | Öğrenilen kelimeler, deneme sayısı |
| `data/words.json` | `ortak/veri/words.json` dosyasının kopyası. **Elle düzenlemeyin** |

İçe aktarma: `import { colors } from '@ortak/theme';`
