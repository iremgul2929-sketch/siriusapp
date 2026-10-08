"""Keras modelini TFLite'a çevirir (yol haritası H17, H21).

Kullanım:
    python -m sirius_ai.export_tflite             # float32
    python -m sirius_ai.export_tflite --quantize  # daha küçük dosya

Çıktı: models/sirius.tflite (K2 backend ve K3 mobil bu dosyayı kullanır)
"""

from __future__ import annotations

import argparse
from pathlib import Path

from .config import MODELS_DIR


def convert(keras_path: Path, out_path: Path, quantize: bool) -> None:
    import tensorflow as tf

    model = tf.keras.models.load_model(keras_path)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    if quantize:
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
    try:
        # Önce sadece standart TFLite işlemleriyle dene: telefonda en sorunsuz yol.
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS]
        data = converter.convert()
        print("Sadece standart TFLite işlemleriyle dönüştürüldü.")
    except Exception as err:  # noqa: BLE001
        print(f"Standart dönüşüm başarısız ({err}). SELECT_TF_OPS ile tekrar deneniyor.")
        print("Uyarı: bu durumda mobil tarafta Flex delegate gerekebilir; K3 ile konuşun.")
        converter.target_spec.supported_ops = [
            tf.lite.OpsSet.TFLITE_BUILTINS,
            tf.lite.OpsSet.SELECT_TF_OPS,
        ]
        converter._experimental_lower_tensor_list_ops = False
        data = converter.convert()
    out_path.write_bytes(data)
    print(f"Kaydedildi: {out_path} ({len(data) / 1024:.0f} KB)")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--models", type=Path, default=MODELS_DIR)
    ap.add_argument("--quantize", action="store_true")
    args = ap.parse_args()
    convert(args.models / "sirius.keras", args.models / "sirius.tflite", args.quantize)


if __name__ == "__main__":
    main()
