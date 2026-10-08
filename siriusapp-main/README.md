# Sirius

İşaret dili hareketlerini telefon kamerasıyla algılayıp kelimeye çeviren ve
kullanıcıya işaret dilini öğreten mobil uygulama.

## Kim nerede çalışır

| Kişi | Alan | Klasör | Görev listesi |
|---|---|---|---|
| **K1** | Yapay zeka ve görüntü işleme | `k1-yapay-zeka/` | `k1-yapay-zeka/GOREVLER.md` |
| **K2** | Backend ve veri | `k2-backend/` | `k2-backend/GOREVLER.md` |
| **K3** | Mobil: kamera ve tanıma | `mobil/k3-mobil-kamera/` | `mobil/k3-mobil-kamera/GOREVLER.md` |
| **K4** | Mobil: arayüz, eğitim, tasarım | `mobil/k4-mobil-arayuz/` | `mobil/k4-mobil-arayuz/GOREVLER.md` |

Kural: herkes normalde **yalnızca kendi klasöründe** değişiklik yapar.

## Ortak alanlar

| Klasör | İçinde ne var | Sorumlu | Değiştirmek için |
|---|---|---|---|
| `ortak/` | Sözlük verisi (`veri/words.json`), yardımcı betikler | K2 | PR + ilgili kişinin onayı |
| `mobil/ortak/` | Mobilde K3 ve K4'ün birlikte kullandığı kod (tema, API, türler) | K3 ve K4 | PR + diğerinin onayı |
| `mobil/app/` | Adres → ekran eşlemesi (tek satırlık dosyalar) | K3 ve K4 | Yeni ekran eklerken |
| `mobil/` kökü | `package.json`, `tailwind.config.js` gibi ayar dosyaları | K3 (ayarlar), K4 (renkler) | Önce ekibe haber verin |
| `docs/` | Plan, mimari, veri, kararlar | Herkes | PR |
| `.github/` | PR şablonu, CODEOWNERS, otomatik testler | K2 | PR |

## Klasör ağacı

```
sirius/
├── k1-yapay-zeka/            K1 · Python: el noktaları, model, eğitim, TFLite
├── k2-backend/               K2 · Python: FastAPI, /ws/infer, kelime API'si
├── mobil/                    Tek Expo uygulaması (K3 + K4)
│   ├── app/                  Adres → ekran (tek satırlık dosyalar)
│   ├── k3-mobil-kamera/      K3 · kamera ekranı, sunucu bağlantısı, kare gönderimi
│   ├── k4-mobil-arayuz/      K4 · ana ekran, sözlük, kelime, profil, bileşenler, tasarım
│   └── ortak/                K3 + K4 · tema, API, türler, ilerleme
├── ortak/                    Sözlük verisi ve betikler (K2)
├── docs/                     Plan ve belgeler (herkes)
└── .github/                  CODEOWNERS, şablonlar, CI (K2)
```

## Nasıl çalışıyor (ilk 16 hafta)

```
Telefon kamerası ──(JPEG kare, ~4/sn)──▶ k2-backend  /ws/infer
                                            │ OpenCV: kareyi çöz
                                            │ MediaPipe: el noktaları (K1'in paketi)
                                            │ 30 karelik pencere → model
telefon ◀──────────(kelime + güven)─────────┘
```

Model henüz yokken backend **demo modunda** çalışır ve rastgele kelime döndürür.
Uygulamada bu "Demo modu" etiketiyle görünür. Böylece K3 ve K4, K1 modeli
eğitmeden önce de uçtan uca çalışabilir.

## Hızlı başlangıç

```bash
# 1) Backend (bir terminal)
cd k2-backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2) Mobil (ikinci terminal)
cd mobil
cp .env.example .env        # içindeki adresi kendi bilgisayarınıza göre düzenleyin
npm install
npx expo install --fix
npx expo start
```

Ayrıntılar her klasörün kendi `README.md` dosyasında. Çalışma kuralları: `CONTRIBUTING.md`.
Plan: `docs/haftalik-plan.md`.
