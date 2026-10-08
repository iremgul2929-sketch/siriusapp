"""Canlı tahmin WebSocket'i: /ws/infer

Mesaj formatı için bkz. docs/mimari.md
"""

from __future__ import annotations

import logging

import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.concurrency import run_in_threadpool

from sirius_ai.config import FEATURES_PER_FRAME, WINDOW_SIZE
from sirius_ai.landmarks import has_hand

from ..services.frames import FrameError, decode_base64_jpeg

router = APIRouter()
log = logging.getLogger("sirius.infer")


@router.websocket("/ws/infer")
async def infer(ws: WebSocket) -> None:
    await ws.accept()
    engine = ws.app.state.engine
    session = engine.new_session()
    extractor = await run_in_threadpool(engine.new_extractor)

    await ws.send_json(
        {"type": "ready", "mock": engine.mock, "window": WINDOW_SIZE, "labels": engine.labels,
         "handDetection": extractor is not None}
    )
    try:
        while True:
            msg = await ws.receive_json()
            kind = msg.get("type")
            if kind == "reset":
                session.reset()
                continue
            if kind != "frame" or not isinstance(msg.get("image"), str):
                await ws.send_json({"type": "error", "message": "Beklenen: {type: 'frame', image: base64}"})
                continue

            try:
                frame = await run_in_threadpool(decode_base64_jpeg, msg["image"])
            except FrameError as err:
                await ws.send_json({"type": "error", "message": str(err)})
                continue

            if extractor is not None:
                features = await run_in_threadpool(extractor.extract, frame)
                hand: bool | None = has_hand(features)
            else:
                features = np.zeros(FEATURES_PER_FRAME, dtype=np.float32)
                hand = None

            prediction = await run_in_threadpool(session.push, features)
            await ws.send_json({"type": "frame_ack", "hand": hand, "filled": session.window.filled})
            if prediction is not None:
                await ws.send_json(prediction.to_message())
    except WebSocketDisconnect:
        pass
    finally:
        if extractor is not None:
            extractor.close()
