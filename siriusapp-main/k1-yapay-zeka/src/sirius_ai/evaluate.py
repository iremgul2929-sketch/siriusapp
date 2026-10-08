"""Eğitilen modelin raporunu çıkarır (yol haritası H7, H15).

Kullanım:
    python -m sirius_ai.evaluate

Çıktı: konsolda kelime bazında başarı tablosu, models/confusion_matrix.png
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from .config import MODELS_DIR


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--models", type=Path, default=MODELS_DIR)
    args = ap.parse_args()

    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import tensorflow as tf
    from sklearn.metrics import ConfusionMatrixDisplay, classification_report, confusion_matrix

    model = tf.keras.models.load_model(args.models / "sirius.keras")
    labels = json.loads((args.models / "labels.json").read_text())
    X_val = np.load(args.models / "val_X.npy")
    y_val = np.load(args.models / "val_y.npy")

    pred = model.predict(X_val, verbose=0).argmax(axis=1)
    present = sorted(set(y_val.tolist()) | set(pred.tolist()))
    names = [labels[i] for i in present]
    print(classification_report(y_val, pred, labels=present, target_names=names, digits=3))

    cm = confusion_matrix(y_val, pred, labels=present)
    size = max(6, len(names) * 0.45)
    fig, ax = plt.subplots(figsize=(size, size))
    ConfusionMatrixDisplay(cm, display_labels=names).plot(ax=ax, xticks_rotation=90, colorbar=False)
    ax.set_title("Karışıklık matrisi (doğrulama verisi)")
    fig.tight_layout()
    out = args.models / "confusion_matrix.png"
    fig.savefig(out, dpi=150)
    print(f"Kaydedildi: {out}")


if __name__ == "__main__":
    main()
