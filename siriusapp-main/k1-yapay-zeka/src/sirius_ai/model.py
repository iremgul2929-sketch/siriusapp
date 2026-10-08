"""İşaret sınıflandırma modeli: (30 kare, 126 özellik) → kelime olasılıkları."""

from __future__ import annotations

from .config import FEATURES_PER_FRAME, WINDOW_SIZE


def build_model(num_classes: int, units: int = 128, dropout: float = 0.3, cell: str = "lstm"):
    """Küçük bir LSTM/GRU modeli. Telefona taşınabilecek kadar hafif tutuldu.

    cell: "lstm" veya "gru" (yol haritası H10: ikisini karşılaştırın).
    """
    import tensorflow as tf
    from tensorflow.keras import layers

    Rnn = {"lstm": layers.LSTM, "gru": layers.GRU}[cell]
    model = tf.keras.Sequential(
        [
            layers.Input(shape=(WINDOW_SIZE, FEATURES_PER_FRAME)),
            layers.Masking(mask_value=0.0),
            Rnn(units, return_sequences=True),
            layers.Dropout(dropout),
            Rnn(units // 2),
            layers.Dropout(dropout),
            layers.Dense(64, activation="relu"),
            layers.Dense(num_classes, activation="softmax"),
        ]
    )
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model
