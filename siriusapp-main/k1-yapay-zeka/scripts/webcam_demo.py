"""Yol haritası H1: webcam görüntüsünde el noktalarını canlı çizer.

Kullanım:
    python scripts/download_models.py   # ilk seferde
    python scripts/webcam_demo.py
    python scripts/webcam_demo.py --camera 1   # başka kamera

Çıkmak için pencere seçiliyken q tuşuna basın.
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import cv2  # noqa: E402

from sirius_ai.landmarks import HandLandmarkExtractor, has_hand  # noqa: E402

# MediaPipe el iskeleti bağlantıları (parmak kemikleri)
CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (0, 17), (17, 18), (18, 19), (19, 20),
]
COLOR = (224, 211, 79)  # BGR: Sirius turkuazı


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--camera", type=int, default=0)
    args = ap.parse_args()

    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        raise SystemExit("Kamera açılamadı. macOS'ta Terminal/VS Code'a kamera izni verin.")

    start = time.monotonic()
    last = start
    with HandLandmarkExtractor(video_mode=True) as extractor:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frame = cv2.flip(frame, 1)  # ayna görüntüsü, daha doğal
            ts = int((time.monotonic() - start) * 1000)
            features = extractor.extract(frame, timestamp_ms=ts)

            h, w = frame.shape[:2]
            for side, pts in extractor.last_hands:
                px = [(int(x * w), int(y * h)) for x, y, _ in pts]
                for a, b in CONNECTIONS:
                    cv2.line(frame, px[a], px[b], COLOR, 2)
                for p in px:
                    cv2.circle(frame, p, 4, (255, 255, 255), -1)
                cv2.putText(frame, side, (px[0][0] + 8, px[0][1]), cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR, 2)

            now = time.monotonic()
            fps = 1.0 / max(now - last, 1e-6)
            last = now
            status = "el var" if has_hand(features) else "el yok"
            cv2.putText(frame, f"{fps:4.1f} FPS  {status}", (12, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.7, COLOR, 2)
            cv2.imshow("Sirius - el noktalari (q: cikis)", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
