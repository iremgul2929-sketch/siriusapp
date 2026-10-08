from types import SimpleNamespace

import numpy as np
import pytest

from sirius_ai.config import FEATURES_PER_FRAME, HAND_FEATURES
from sirius_ai.landmarks import features_from_hands, has_hand, hands_from_result, normalize_hand


def _hand(offset=(0.5, 0.5, 0.0), scale=0.1):
    rng = np.random.default_rng(0)
    pts = rng.normal(0, 1, (21, 3)).astype(np.float32) * scale
    pts[0] = 0  # bilek
    return pts + np.array(offset, dtype=np.float32)


def test_normalize_is_position_and_scale_invariant():
    a = normalize_hand(_hand(offset=(0.2, 0.3, 0.0), scale=0.1))
    b = normalize_hand(_hand(offset=(0.7, 0.6, 0.0), scale=0.3))
    np.testing.assert_allclose(a, b, atol=1e-5)
    assert np.allclose(a[0], 0)  # bilek orijinde


def test_normalize_rejects_wrong_shape():
    with pytest.raises(ValueError):
        normalize_hand(np.zeros((20, 3)))


def test_features_layout_left_then_right():
    left, right = _hand(), _hand(offset=(0.1, 0.1, 0))
    f = features_from_hands([("Right", right), ("Left", left)])
    assert f.shape == (FEATURES_PER_FRAME,)
    np.testing.assert_allclose(f[:HAND_FEATURES], normalize_hand(left).reshape(-1))
    np.testing.assert_allclose(f[HAND_FEATURES:], normalize_hand(right).reshape(-1))


def test_missing_hand_is_zero():
    f = features_from_hands([("Right", _hand())])
    assert not np.any(f[:HAND_FEATURES])
    assert has_hand(f)
    assert not has_hand(features_from_hands([]))


def test_hands_from_mediapipe_like_result():
    pts = _hand()
    lms = [SimpleNamespace(x=float(x), y=float(y), z=float(z)) for x, y, z in pts]
    result = SimpleNamespace(
        hand_landmarks=[lms],
        handedness=[[SimpleNamespace(category_name="Left")]],
    )
    hands = hands_from_result(result)
    assert hands[0][0] == "Left"
    np.testing.assert_allclose(hands[0][1], pts, atol=1e-6)
