"""Telefondan gelen base64 JPEG kareyi OpenCV görüntüsüne çevirir."""

from __future__ import annotations

import base64
import binascii

import numpy as np

MAX_SIDE = 480  # MediaPipe için yeterli; büyük kareler küçültülür


class FrameError(ValueError):
    pass


def decode_base64_jpeg(data: str) -> np.ndarray:
    import cv2

    if "," in data[:64] and data.startswith("data:"):
        data = data.split(",", 1)[1]  # "data:image/jpeg;base64,..." önekini at
    try:
        raw = base64.b64decode(data, validate=False)
    except (binascii.Error, ValueError) as err:
        raise FrameError("Kare base64 olarak çözülemedi") from err
    img = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise FrameError("Kare JPEG olarak çözülemedi")
    h, w = img.shape[:2]
    scale = MAX_SIDE / max(h, w)
    if scale < 1:
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    return img
