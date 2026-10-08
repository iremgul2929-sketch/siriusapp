# Katkı rehberi: GitHub'da birlikte çalışma

Tek cümleyle: **kimse doğrudan `main`'e kod göndermez; herkes kendi dalında
çalışır, işi bitince Pull Request açar, bir arkadaşı onaylayınca birleştirilir.**

## Terimler

| Terim | Anlamı |
|---|---|
| **Repo** | Projenin tüm dosyalarının ve geçmişinin durduğu yer. |
| **main** | Projenin her zaman çalışır durumda olması gereken ana dalı. |
| **Branch (dal)** | main'den ayrılan, üzerinde güvenle çalışabileceğiniz kendi kopyanız. |
| **Commit** | Değişikliklerinizin açıklamalı bir kaydı; "kaydet" noktası. |
| **Push** | Bilgisayarınızdaki commit'leri GitHub'a göndermek. |
| **Pull** | GitHub'daki güncel hâli bilgisayarınıza indirmek. |
| **Pull Request (PR)** | "Bu değişikliği main'e eklemek istiyorum, bakar mısınız?" isteği. |
| **Review (inceleme)** | PR'ın başka biri tarafından okunup kontrol edilmesi. |
| **Merge (birleştirme)** | Onaylanan PR'ın main'e eklenmesi. |
| **Conflict (çakışma)** | Aynı satırı iki kişi farklı değiştirince Git'in "hangisi?" diye sorması. |
| **Issue** | Yapılacak bir işin ya da bulunan bir hatanın kaydı. |
| **CI** | Her PR'da testleri kendiliğinden çalıştıran otomatik kontrol. |

## Haftalık akış

1. **Pazartesi:** `GOREVLER.md` dosyandaki o haftanın görevini GitHub'da Issue olarak aç, kendine ata.
2. Güncel main'den dal aç:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b k3/h05-kare-sayaci
   ```
3. Çalışırken küçük commit'ler at:
   ```bash
   git add .
   git commit -m "k3: kare/sn sayacı eklendi"
   ```
4. **Hafta sonuna kadar** dalını gönder ve PR aç:
   ```bash
   git push -u origin k3/h05-kare-sayaci
   ```
   GitHub'da çıkan "Compare & pull request" bağlantısına tıkla; açıklamaya `Closes #12` yaz
   (12, Issue numarası; PR birleşince Issue kendiliğinden kapanır).
5. Bir ekip arkadaşın inceler. Onaylarsa **Squash and merge** ile birleştir, dalı sil.

## Adlandırma

**Dal:** `<kişi>/h<hafta>-<kısa-açıklama>` → `k1/h06-ilk-lstm`, `k4/h05-bilesenler`
Hata düzeltmesi için: `k2/fix-ws-baglanti`

**Commit mesajı:** `<kişi>: <ne yapıldı>` → `k2: /version uç noktası eklendi`
Geçmişte kimin neyi değiştirdiği bu sayede tek bakışta görünür.

## Klasör kuralı

- Normalde **yalnızca kendi klasöründe** değişiklik yap (bkz. `README.md` tablosu).
- Ortak bir dosyayı (`ortak/`, `mobil/ortak/`, `mobil/app/`, `mobil/package.json`,
  `mobil/tailwind.config.js`) değiştireceksen önce ekip kanalına yaz, PR'da o dosyanın
  sorumlusunu inceleyici olarak ekle.
- Başkasının klasöründe bir şeyin değişmesi gerekiyorsa kendin değiştirme; ona Issue aç.

## İnceleme kuralları

- Kendi PR'ını kendin onaylama. En az 1 onay olmadan birleştirme.
- İnceleyen kişi "Files changed" sekmesinde değişikliği okur, anlamadığı yeri sorar.
- PR'ı açan kişi, yapay zekadan aldığı kodu çalıştırmış ve ne yaptığını açıklayabilecek
  kadar okumuş olmalı. "Bu satır ne yapıyor?" sorusuna cevap verebilmelisin.
- PR küçük olsun: bir haftalık görev, bir PR.

## PR açmadan önce

| Klasör | Komut |
|---|---|
| `k1-yapay-zeka/` | `pytest` |
| `k2-backend/` | `pytest` |
| `mobil/` | `npm run typecheck && npm run lint` |
| `ortak/veri/words.json` değiştiyse | `python ortak/araclar/sozluk_esitle.py` |

## Çakışma olursa

Sen çalışırken main değişmiş olabilir. Dalını güncelle:

```bash
git checkout main
git pull origin main
git checkout k3/h05-kare-sayaci
git merge main
```

Git çakışan dosyaları söyler. Dosyayı aç; `<<<<<<<`, `=======`, `>>>>>>>` işaretleri
arasında iki sürüm görünür. Doğru olanı bırak, işaretleri sil, sonra:

```bash
git add .
git commit
git push
```

Hangisinin doğru olduğundan emin değilsen o satırı yazan arkadaşına sor. Kişi bazlı
klasör düzeni sayesinde çakışmalar çoğunlukla ortak dosyalarda çıkar.

## Repoya girmeyenler

- Ham videolar, kişisel veriler, model dosyaları (`.gitignore` engeller)
- `.env` dosyaları ve şifreler
- `node_modules/`, `.venv/`
