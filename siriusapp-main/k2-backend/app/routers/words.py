"""Kelime ve kategori API'si.

Şimdilik repo kökündeki ortak/veri/words.json dosyasından okunur. Yol haritası H5-H6'da
Supabase tablosuna taşınacak; uç nokta adresleri aynı kalacağı için mobil
uygulamada değişiklik gerekmez.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

router = APIRouter(tags=["kelimeler"])


def _data(request: Request) -> dict:
    return request.app.state.words


@router.get("/categories")
def list_categories(request: Request) -> list[dict]:
    data = _data(request)
    counts: dict[str, int] = {}
    for w in data["words"]:
        counts[w["categoryId"]] = counts.get(w["categoryId"], 0) + 1
    return [{**c, "wordCount": counts.get(c["id"], 0)} for c in data["categories"]]


@router.get("/words")
def list_words(request: Request, category: str | None = None) -> list[dict]:
    words = _data(request)["words"]
    if category:
        words = [w for w in words if w["categoryId"] == category]
    return words


@router.get("/words/{word_id}")
def get_word(word_id: str, request: Request) -> dict:
    for w in _data(request)["words"]:
        if w["id"] == word_id:
            return w
    raise HTTPException(status_code=404, detail="Kelime bulunamadı")
