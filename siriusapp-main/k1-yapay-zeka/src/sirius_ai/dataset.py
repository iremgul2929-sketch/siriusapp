"""Videolardan eğitim verisi üretir.

Girdi:  data/raw/<kelime_id>/*.mp4   (bkz. docs/veri.md)
Çıktı:  data/processed/X.npy  (örnek, 30, 126)
        data/processed/y.npy  (örnek,)
        data/processed/labels.json

Kullanım:
    python -m sirius_ai.dataset
    python -m sirius_ai.dataset --limit 10   # ilk 10 kelime (pilot)
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from .config import DATA_PROCESSED, DATA_RAW, WINDOW_SIZE
from .sequence import resample, trim_empty

VIDEO_EXTS = {".mp4", ".mov", ".avi", ".mkv"}


def video_to_features(path: Path, extractor) -> np.ndarray:
    import cv2

    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frames: list[np.ndarray] = []
    i = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frames.append(extractor.extract(frame, timestamp_ms=int(i * 1000 / fps)))
        i += 1
    cap.release()
    return np.stack(frames) if frames else np.zeros((0, 126), dtype=np.float32)


def build(raw_dir: Path, out_dir: Path, limit: int | None = None) -> None:
    from .landmarks import HandLandmarkExtractor

    labels = sorted(p.name for p in raw_dir.iterdir() if p.is_dir())
    if limit:
        labels = labels[:limit]
    if not labels:
        raise SystemExit(f"{raw_dir} içinde kelime klasörü yok. docs/veri.md'ye bakın.")

    X: list[np.ndarray] = []
    y: list[int] = []
    skipped = 0
    for label_idx, label in enumerate(labels):
        videos = [p for p in sorted((raw_dir / label).iterdir()) if p.suffix.lower() in VIDEO_EXTS]
        print(f"[{label_idx + 1}/{len(labels)}] {label}: {len(videos)} video")
        for video in videos:
            # Her video için yeni extractor: VIDEO modunda zaman damgası sıfırdan başlamalı.
            with HandLandmarkExtractor(video_mode=True) as extractor:
                seq = trim_empty(video_to_features(video, extractor))
            if len(seq) < 5:
                skipped += 1
                continue
            X.append(resample(seq, WINDOW_SIZE))
            y.append(label_idx)

    out_dir.mkdir(parents=True, exist_ok=True)
    np.save(out_dir / "X.npy", np.stack(X))
    np.save(out_dir / "y.npy", np.array(y, dtype=np.int64))
    (out_dir / "labels.json").write_text(json.dumps(labels, ensure_ascii=False, indent=2))
    print(f"Bitti: {len(X)} örnek, {len(labels)} kelime, {skipped} video atlandı (el bulunamadı).")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--raw", type=Path, default=DATA_RAW)
    ap.add_argument("--out", type=Path, default=DATA_PROCESSED)
    ap.add_argument("--limit", type=int, default=None, help="Sadece ilk N kelime")
    args = ap.parse_args()
    build(args.raw, args.out, args.limit)


if __name__ == "__main__":
    main()
