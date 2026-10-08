"""Modeli eğitir.

Kullanım:
    python -m sirius_ai.train
    python -m sirius_ai.train --cell gru --epochs 80

Çıktı: models/sirius.keras ve models/labels.json
"""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

import numpy as np

from .augment import augment_dataset
from .config import DATA_PROCESSED, MODELS_DIR


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", type=Path, default=DATA_PROCESSED)
    ap.add_argument("--out", type=Path, default=MODELS_DIR)
    ap.add_argument("--cell", choices=["lstm", "gru"], default="lstm")
    ap.add_argument("--epochs", type=int, default=60)
    ap.add_argument("--batch", type=int, default=32)
    ap.add_argument("--no-augment", action="store_true")
    args = ap.parse_args()

    import tensorflow as tf
    from sklearn.model_selection import train_test_split

    from .model import build_model

    X = np.load(args.data / "X.npy")
    y = np.load(args.data / "y.npy")
    labels = json.loads((args.data / "labels.json").read_text())
    print(f"Veri: {X.shape}, {len(labels)} kelime")

    X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    if not args.no_augment:
        X_tr, y_tr = augment_dataset(X_tr, y_tr)

    model = build_model(len(labels), cell=args.cell)
    model.summary()
    args.out.mkdir(parents=True, exist_ok=True)
    model.fit(
        X_tr,
        y_tr,
        validation_data=(X_val, y_val),
        epochs=args.epochs,
        batch_size=args.batch,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=12, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(patience=5, factor=0.5),
        ],
    )
    loss, acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"Doğrulama doğruluğu: {acc:.3f}")

    model.save(args.out / "sirius.keras")
    shutil.copy(args.data / "labels.json", args.out / "labels.json")
    np.save(args.out / "val_X.npy", X_val)
    np.save(args.out / "val_y.npy", y_val)
    print(f"Kaydedildi: {args.out / 'sirius.keras'}")


if __name__ == "__main__":
    main()
