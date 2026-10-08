# Veri

## Hazır veri setleri

| Veri seti | İçerik | Erişim |
|---|---|---|
| AUTSL | 226 işaret, 43 kişi, 38.336 video (RGB, derinlik) | cvml.ankara.edu.tr üzerinden başvuru |
| BosphorusSign22k | 744 işaret, 6 kişi, 22.542 video | Yazarlara EULA gönderilerek |

İkisine de **ilk hafta** başvurun; onay süresi belli değil.

## Klasör standardı

```
k1-yapay-zeka/data/raw/<kelime_id>/<kaynak>_<kişi>_<no>.mp4
k1-yapay-zeka/data/processed/X.npy        (örnek, 30, 126)
k1-yapay-zeka/data/processed/y.npy        (örnek,)
k1-yapay-zeka/data/processed/labels.json  ["tesekkur", "merhaba", ...]
```

`k1-yapay-zeka/data/` repoya girmez. Ekip içinde paylaşım için ortak bir bulut klasörü kullanın.

## Kendi veri toplamamız

- Gönüllülerden video almadan önce danışmanla etik kurul gerekliliğini netleştirin.
- Her gönüllüden yazılı, KVKK'ya uygun açık rıza alın; formun bir kopyası `docs/` dışında saklansın.
- Kayıt yönergesi: düz arka plan, omuzlar ve eller kadrajda, her kelime en az 10 tekrar.
- Videolar eğitimden sonra silinebilir; noktalar (`.npy`) kişiyi tanımlamaz, onlar saklanır.
