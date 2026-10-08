"""Sözlüğün tek kaynağı ortak/veri/words.json dosyasıdır.

Mobil uygulama, backend'e ulaşamadığında kullanmak üzere bu dosyanın bir
kopyasını mobil/ortak/data/words.json içinde taşır. Sözlüğü değiştirdikten
sonra bu betiği çalıştırın:

    python ortak/araclar/sozluk_esitle.py           # kopyayı günceller
    python ortak/araclar/sozluk_esitle.py --kontrol # sadece aynı mı diye bakar (CI bunu kullanır)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

KOK = Path(__file__).resolve().parents[2]
KAYNAK = KOK / "ortak" / "veri" / "words.json"
KOPYA = KOK / "mobil" / "ortak" / "data" / "words.json"


def dogrula(veri: dict) -> list[str]:
    """Sözlükteki basit hataları bulur (tekrarlayan id, olmayan kategori)."""
    hatalar: list[str] = []
    kategori_idleri = {k["id"] for k in veri["categories"]}
    gorulen: set[str] = set()
    for kelime in veri["words"]:
        if kelime["id"] in gorulen:
            hatalar.append(f"Tekrarlayan kelime id: {kelime['id']}")
        gorulen.add(kelime["id"])
        if kelime["categoryId"] not in kategori_idleri:
            hatalar.append(f"{kelime['id']}: '{kelime['categoryId']}' diye bir kategori yok")
    return hatalar


def main() -> int:
    kaynak_metin = KAYNAK.read_text(encoding="utf-8")
    hatalar = dogrula(json.loads(kaynak_metin))
    if hatalar:
        print("\n".join(hatalar))
        return 1
    if "--kontrol" in sys.argv:
        if not KOPYA.exists() or KOPYA.read_text(encoding="utf-8") != kaynak_metin:
            print("mobil/ortak/data/words.json güncel değil. `python ortak/araclar/sozluk_esitle.py` çalıştırın.")
            return 1
        print("Sözlük kopyası güncel.")
        return 0
    KOPYA.write_text(kaynak_metin, encoding="utf-8")
    print(f"Güncellendi: {KOPYA.relative_to(KOK)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
