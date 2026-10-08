# k2-backend/ · Sunucu (K2)

Haftalık görevlerin: `GOREVLER.md`

**Başkalarıyla bağlantın**
- **K1'den alırsın:** `sirius.tflite`, `labels.json` ve `sirius_ai` paketi (`../k1-yapay-zeka`). Paketi değiştirme; gerekiyorsa K1'e Issue aç.
- **K3 ve K4'e verirsin:** çalışan API ve `/ws/infer`. Mesaj biçimini (`docs/mimari.md`) değiştirmeden önce K3'e haber ver.
- Ayrıca `ortak/` ve `.github/` klasörlerinin sorumlususun.

FastAPI ile kelime API'si ve canlı tahmin WebSocket'i.

## Kurulum (bir kere)

```bash
cd k2-backend
python3.11 -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt  # K1'in paketini de otomatik kurar
cp .env.example .env
```

## Çalıştırma

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --env-file .env
```

- Tarayıcıda **http://localhost:8000/docs** → tüm uç noktaları deneyebileceğiniz sayfa
- **http://localhost:8000/health** → `"mode": "demo"` ya da `"model"`

`--host 0.0.0.0` telefonun aynı Wi-Fi üzerinden bağlanabilmesi için gerekli.
Bilgisayarınızın yerel IP'sini öğrenmek için macOS'ta: `ipconfig getifaddr en0`

## Demo modu ve gerçek model

`models/sirius.tflite` yoksa sunucu **demo modunda** açılır: telefondan gelen
kareleri kabul eder, birkaç saniyede bir rastgele kelime döner (`"mock": true`).
Mobil ekip bu sayede model hazır olmadan çalışabilir.

Gerçek modele geçmek için:

1. K1'den `sirius.tflite` ve `labels.json` alıp `k2-backend/models/` içine koyun.
2. El modelini indirin: `cd ../k1-yapay-zeka && python scripts/download_models.py`
3. Model çalıştırıcıyı kurun: `pip install -r requirements-model.txt`
4. Sunucuyu yeniden başlatın; `/health` artık `"mode": "model"` göstermeli.

## Uç noktalar

| Yöntem | Adres | Açıklama |
|---|---|---|
| GET | `/health` | Sunucu durumu, mod |
| GET | `/categories` | Kategoriler ve kelime sayıları |
| GET | `/words?category=aile` | Kelimeler (kategoriye göre süzülebilir) |
| GET | `/words/{id}` | Tek kelime |
| WS | `/ws/infer` | Canlı tahmin (mesaj formatı: `docs/mimari.md`) |

## Dosyalar

| Dosya | Ne yapar |
|---|---|
| `app/main.py` | Uygulamayı kurar, router'ları bağlar |
| `app/config.py` | `.env` ayarları |
| `app/routers/words.py` | Kelime API'si (şimdilik `ortak/veri/words.json`, H6'da Supabase) |
| `app/routers/infer.py` | WebSocket: kare al → el noktaları → tahmin |
| `app/services/predictor.py` | Pencere, oylama, demo modu, TFLite model |
| `app/services/frames.py` | base64 JPEG → OpenCV görüntüsü |

## Test

```bash
pytest
```

Testler demo modunda çalışır; model dosyası gerekmez. CI her PR'da çalıştırır.

## Sonraki adımlar (yol haritası)

- H5: Supabase şeması (users, words, categories, progress)
- H9: Supabase Auth
- H10: Video depolama, `videoUrl` alanlarını doldurma
- H15: Bulutta yayın (Render / Railway / VPS)
