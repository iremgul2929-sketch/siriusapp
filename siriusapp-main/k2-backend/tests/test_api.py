"""API testleri. Model ve el modeli olmadan (DEMO modunda) çalışır."""

import base64
from pathlib import Path

import numpy as np
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def _client(tmp_path: Path) -> TestClient:
    settings = Settings(
        model_path=tmp_path / "yok.tflite",
        labels_path=tmp_path / "yok.json",
        landmarker_path=tmp_path / "yok.task",
        mock_every=2,
    )
    return TestClient(create_app(settings))


def _frame() -> str:
    import cv2

    ok, buf = cv2.imencode(".jpg", np.zeros((120, 160, 3), dtype=np.uint8))
    return base64.b64encode(buf.tobytes()).decode()


def test_health_reports_demo_mode(tmp_path):
    r = _client(tmp_path).get("/health")
    assert r.status_code == 200
    assert r.json()["mode"] == "demo"


def test_words_and_categories(tmp_path):
    c = _client(tmp_path)
    words = c.get("/words").json()
    assert any(w["id"] == "tesekkur" for w in words)
    assert all(w["categoryId"] == "aile" for w in c.get("/words", params={"category": "aile"}).json())
    cats = c.get("/categories").json()
    assert sum(cat["wordCount"] for cat in cats) == len(words)
    assert c.get("/words/yok-boyle-kelime").status_code == 404


def test_ws_demo_flow(tmp_path):
    with _client(tmp_path).websocket_connect("/ws/infer") as ws:
        ready = ws.receive_json()
        assert ready["type"] == "ready" and ready["mock"] is True
        assert ready["handDetection"] is False

        ws.send_json({"type": "frame", "image": _frame()})
        assert ws.receive_json()["type"] == "frame_ack"
        ws.send_json({"type": "frame", "image": _frame()})
        assert ws.receive_json()["type"] == "frame_ack"
        pred = ws.receive_json()
        assert pred["type"] == "prediction" and pred["mock"] is True
        assert pred["word"] in ready["labels"]


def test_ws_bad_message(tmp_path):
    with _client(tmp_path).websocket_connect("/ws/infer") as ws:
        ws.receive_json()
        ws.send_json({"type": "frame", "image": "bozuk"})
        assert ws.receive_json()["type"] == "error"
