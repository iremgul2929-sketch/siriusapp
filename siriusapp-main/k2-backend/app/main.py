"""Sirius backend.

Çalıştırma (k2-backend/ klasöründeyken):
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --env-file .env

--host 0.0.0.0 önemli: telefonun aynı Wi-Fi'dan bağlanabilmesi için.
Tarayıcıda http://localhost:8000/docs adresinde tüm uç noktaları deneyebilirsiniz.
"""

from __future__ import annotations

import json
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings
from .routers import infer, words
from .services.predictor import Engine

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    app = FastAPI(title="Sirius API", version="0.1.0")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

    app.state.settings = settings
    app.state.words = json.loads(settings.words_path.read_text(encoding="utf-8"))
    app.state.engine = Engine(settings, [w["id"] for w in app.state.words["words"]])

    @app.get("/health", tags=["sistem"])
    def health() -> dict:
        engine = app.state.engine
        return {
            "status": "ok",
            "mode": "demo" if engine.mock else "model",
            "handDetection": engine.has_landmarker,
            "labels": len(engine.labels),
        }

    app.include_router(words.router)
    app.include_router(infer.router)
    return app


app = create_app()
