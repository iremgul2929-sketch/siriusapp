"""Sirius yapay zeka paketi.

Alt modüller:
- config     : ortak sabitler (pencere boyu, özellik boyutu, yollar)
- landmarks  : MediaPipe ile el noktası çıkarma ve normalizasyon
- sequence   : kare dizilerini sabit uzunluğa getirme, kayan pencere
- dataset    : videolardan eğitim verisi üretme (CLI)
- model      : Keras LSTM modeli
- train      : eğitim (CLI)
- evaluate   : değerlendirme raporu (CLI)
- export_tflite : modeli telefona taşınacak TFLite dosyasına çevirme (CLI)
"""

__version__ = "0.1.0"
