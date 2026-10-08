import base64

import numpy as np
import pytest

from app.services.frames import MAX_SIDE, FrameError, decode_base64_jpeg


def _jpeg_b64(h=960, w=720):
    import cv2

    ok, buf = cv2.imencode(".jpg", np.full((h, w, 3), 128, dtype=np.uint8))
    assert ok
    return base64.b64encode(buf.tobytes()).decode()


def test_decodes_and_downscales():
    img = decode_base64_jpeg(_jpeg_b64())
    assert max(img.shape[:2]) == MAX_SIDE and img.shape[2] == 3


def test_accepts_data_url_prefix():
    img = decode_base64_jpeg("data:image/jpeg;base64," + _jpeg_b64(100, 80))
    assert img.shape[:2] == (100, 80)


def test_rejects_garbage():
    with pytest.raises(FrameError):
        decode_base64_jpeg(base64.b64encode(b"not an image").decode())
