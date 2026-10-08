import sys
from pathlib import Path

# k2-backend/ klasörünü import yoluna ekle (app paketi için)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
