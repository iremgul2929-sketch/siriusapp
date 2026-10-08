import numpy as np

from sirius_ai.augment import augment_dataset, jitter, mirror
from sirius_ai.config import FEATURES_PER_FRAME, HAND_FEATURES
from sirius_ai.sequence import SlidingWindow, resample, trim_empty


def test_resample_lengths():
    for n in (1, 7, 30, 95):
        out = resample(np.random.rand(n, FEATURES_PER_FRAME), 30)
        assert out.shape == (30, FEATURES_PER_FRAME)


def test_resample_keeps_first_and_last():
    seq = np.arange(50, dtype=np.float32)[:, None].repeat(4, axis=1)
    out = resample(seq, 10)
    assert out[0, 0] == 0 and out[-1, 0] == 49


def test_trim_empty():
    seq = np.zeros((10, 4))
    seq[3:6] = 1
    assert trim_empty(seq).shape[0] == 3
    assert trim_empty(np.zeros((5, 4))).shape[0] == 0


def test_sliding_window():
    w = SlidingWindow(3)
    for i in range(5):
        w.push(np.full(FEATURES_PER_FRAME, i))
    assert w.ready and w.filled == 3
    assert w.array()[:, 0].tolist() == [2, 3, 4]
    w.clear()
    assert not w.ready


def test_mirror_swaps_hands_and_flips_x():
    seq = np.zeros((2, FEATURES_PER_FRAME), dtype=np.float32)
    seq[:, 0] = 0.5  # sol el ilk noktanın x'i
    m = mirror(seq)
    assert m[0, HAND_FEATURES] == -0.5
    assert m[0, 0] == 0
    np.testing.assert_allclose(mirror(m), seq)


def test_jitter_keeps_missing_hand_zero():
    seq = np.zeros((2, FEATURES_PER_FRAME), dtype=np.float32)
    seq[:, :HAND_FEATURES] = 1
    j = jitter(seq, rng=np.random.default_rng(1))
    assert not np.any(j[:, HAND_FEATURES:])
    assert not np.allclose(j[:, :HAND_FEATURES], 1)


def test_augment_triples_dataset():
    X = np.random.rand(4, 30, FEATURES_PER_FRAME).astype(np.float32)
    y = np.array([0, 1, 0, 1])
    X2, y2 = augment_dataset(X, y)
    assert X2.shape[0] == 12 and y2.shape[0] == 12
