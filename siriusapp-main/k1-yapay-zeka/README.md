# k1-yapay-zeka/ · Yapay Zeka (K1)

Haftalık görevlerin: `GOREVLER.md`

**Başkalarıyla bağlantın**
- **K2'ye verirsin:** `models/sirius.tflite` + `labels.json` ve `sirius_ai` paketi (K2 bu paketi kullanır ama değiştirmez; paketteki bir fonksiyonun imzasını değiştirmeden önce K2'ye haber ver).
- **K3'e verirsin (H18+):** telefonda çalışacak model dosyaları ve `docs/model-format.md`.
- **K2'den alırsın:** veri seti erişimi ve düzenlenmiş videolar.
- Kelime klasör adların `ortak/veri/words.json` içindeki `id` ile aynı olmalı.

El noktası çıkarma, işaret sınıflandırma modeli ve TFLite dönüşümü.

## Kurulum (bir kere)

```bash
cd k1-yapay-zeka
python3.11 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/download_models.py  # MediaPipe el modeli (~8 MB)
```

VS Code'da sağ alttan Python yorumlayıcısı olarak `k1-yapay-zeka/.venv` seçin.

## İlk hafta hedefi: webcam'de el noktaları

```bash
python scripts/webcam_demo.py
```

Ekranda elinizin iskeleti çiziliyorsa her şey doğru kurulmuş demektir.
macOS kamera izni sorarsa Terminal / VS Code'a izin verin.

## Eğitim hattı

```bash
# 1) Videoları yerleştirin: data/raw/<kelime_id>/*.mp4   (bkz. docs/veri.md)

# 2) Videolardan el noktalarını çıkar → data/processed/
python -m sirius_ai.dataset --limit 10       # pilot: ilk 10 kelime

# 3) Eğit → models/sirius.keras
python -m sirius_ai.train
python -m sirius_ai.train --cell gru         # GRU ile karşılaştırma

# 4) Rapor → konsolda tablo + models/confusion_matrix.png
python -m sirius_ai.evaluate

# 5) Backend / telefon için → models/sirius.tflite
python -m sirius_ai.export_tflite
```

Eğitilen modeli backend'e vermek için `models/sirius.tflite` ve `models/labels.json`
dosyalarını `k2-backend/models/` klasörüne kopyalayın. Backend yeniden başlatıldığında
demo modundan çıkıp gerçek modeli kullanır.

## Dosyalar

| Dosya | Ne yapar |
|---|---|
| `src/sirius_ai/config.py` | Pencere boyu (30), özellik boyutu (126), yollar |
| `src/sirius_ai/landmarks.py` | MediaPipe ile el noktaları, normalizasyon, 126'lık vektör |
| `src/sirius_ai/sequence.py` | Videoyu 30 kareye indirme, canlı akış penceresi |
| `src/sirius_ai/augment.py` | Ayna ve gürültü ile veri çoğaltma |
| `src/sirius_ai/dataset.py` | Videolardan `X.npy`, `y.npy` üretir |
| `src/sirius_ai/model.py` | LSTM / GRU modeli |
| `src/sirius_ai/train.py` · `evaluate.py` · `export_tflite.py` | Eğitim, rapor, dönüşüm |
| `scripts/webcam_demo.py` | Canlı el noktası gösterimi |
| `notebooks/` | Deneme defterleri (Jupyter) |

## Test

```bash
pytest
```

`landmarks.py` içindeki normalizasyon ve `sequence.py` testleri MediaPipe ya da
TensorFlow olmadan da çalışır; CI bu testleri her PR'da koşar.

## Not: MediaPipe API'si

MediaPipe'ın yeni sürümlerinde eski `mp.solutions.hands` kaldırıldı. İnternette
gördüğünüz eski örnekler çalışmayabilir. Bu projede `HandLandmarker` (Tasks API)
kullanılıyor; örnek kod için `landmarks.py` dosyasına bakın.
