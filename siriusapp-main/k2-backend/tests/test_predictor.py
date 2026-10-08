import random

import numpy as np

from app.services.predictor import MockSession, NO_HAND_RESET_FRAMES, Session
from sirius_ai.config import FEATURES_PER_FRAME, WINDOW_SIZE


class FakeClassifier:
    def __init__(self, labels, probs):
        self.labels = labels
        self.probs = np.array(probs, dtype=np.float32)
        self.calls = 0

    def predict(self, window):
        assert window.shape == (WINDOW_SIZE, FEATURES_PER_FRAME)
        self.calls += 1
        return self.probs


HAND = np.ones(FEATURES_PER_FRAME, dtype=np.float32)
NO_HAND = np.zeros(FEATURES_PER_FRAME, dtype=np.float32)


def _feed(session, frames):
    return [p for p in (session.push(f) for f in frames) if p is not None]


def test_no_prediction_until_window_full_and_votes_stable():
    clf = FakeClassifier(["a", "b"], [0.1, 0.9])
    s = Session(clf, threshold=0.8, vote_frames=3)
    assert _feed(s, [HAND] * (WINDOW_SIZE - 1)) == []
    assert clf.calls == 0
    preds = _feed(s, [HAND] * 3)
    assert [p.word for p in preds] == ["b"]
    assert preds[0].mock is False


def test_same_word_not_repeated_while_signing():
    s = Session(FakeClassifier(["a", "b"], [0.1, 0.9]), threshold=0.8, vote_frames=2)
    preds = _feed(s, [HAND] * (WINDOW_SIZE + 20))
    assert len(preds) == 1


def test_word_can_repeat_after_hand_leaves():
    s = Session(FakeClassifier(["a", "b"], [0.1, 0.9]), threshold=0.8, vote_frames=2)
    first = _feed(s, [HAND] * (WINDOW_SIZE + 2))
    _feed(s, [NO_HAND] * NO_HAND_RESET_FRAMES)
    assert s.window.filled == 0
    second = _feed(s, [HAND] * (WINDOW_SIZE + 2))
    assert len(first) == 1 and len(second) == 1


def test_low_confidence_is_ignored():
    s = Session(FakeClassifier(["a", "b"], [0.45, 0.55]), threshold=0.8, vote_frames=2)
    assert _feed(s, [HAND] * (WINDOW_SIZE + 10)) == []


def test_mock_session_emits_every_n_frames():
    s = MockSession(["x", "y"], every=3, rng=random.Random(0))
    preds = _feed(s, [NO_HAND] * 9)
    assert len(preds) == 3
    assert all(p.mock and p.word in {"x", "y"} and 0.85 < p.confidence < 1 for p in preds)
