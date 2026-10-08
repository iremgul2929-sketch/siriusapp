# Mimari

## Faz 1 (Hafta 1–16): Sunucuda tahmin

1. Mobil uygulama kameradan saniyede ~4 kare alır, küçük JPEG olarak WebSocket'ten yollar.
2. Backend kareyi OpenCV ile çözer.
3. `k1-yapay-zeka` paketindeki `HandLandmarkExtractor` (MediaPipe) karedeki el noktalarını bulur.
4. Noktalar normalize edilip 126 sayılık bir vektöre çevrilir (2 el × 21 nokta × x,y,z).
5. Son 30 karenin vektörü modelden geçer, güven eşiği aşılırsa kelime telefona döner.

## Faz 3 (Hafta 17+): Telefonda tahmin

Aynı 3-5. adımlar telefonda `react-native-vision-camera` + `react-native-fast-tflite`
ile yapılır. Bunun için Expo Go yerine `expo-dev-client` ile development build gerekir.

## WebSocket mesajları: `/ws/infer`

İstemci → sunucu:

```json
{ "type": "frame", "image": "<base64 jpeg>", "ts": 1712345678901 }
{ "type": "reset" }
```

Sunucu → istemci:

```json
{ "type": "ready", "mock": false, "window": 30, "labels": ["tesekkur", "merhaba"] }
{ "type": "frame_ack", "hand": true, "filled": 12 }
{ "type": "prediction", "word": "tesekkur", "confidence": 0.93, "mock": false }
{ "type": "error", "message": "..." }
```

- `hand`: o karede el bulundu mu
- `filled`: pencerede kaç kare birikti (30 olunca tahmin başlar)
- `mock`: model yoksa `true`, uygulama "DEMO" etiketi gösterir

## Özellik vektörü (K1 ve K3 aynı biçimi kullanmalı)

| İndeks | İçerik |
|---|---|
| 0–62 | Sol el, 21 nokta × (x, y, z) |
| 63–125 | Sağ el, 21 nokta × (x, y, z) |

El görünmüyorsa o kısım 0 ile doldurulur. Her el bilek noktasına göre ötelenir ve
bilek–orta parmak kökü uzaklığına bölünerek ölçeklenir (`k1-yapay-zeka/src/sirius_ai/landmarks.py`).
