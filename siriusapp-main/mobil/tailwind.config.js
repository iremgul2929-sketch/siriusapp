/** @type {import('tailwindcss').Config} */
// Renkler k4-mobil-arayuz/tasarim/README.md ve ortak/theme.ts ile aynı tutulmalı.
// Sahibi: K4. Değiştirmeden önce K3'e haber verin.
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './k3-mobil-kamera/**/*.{js,jsx,ts,tsx}',
    './k4-mobil-arayuz/**/*.{js,jsx,ts,tsx}',
    './ortak/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0F131A',
        panel: '#161B22',
        line: '#28303C',
        fg: '#E6E9EF',
        dim: '#7D8899',
        accent: '#4FD3E0',
        amber: '#E3AE5D',
        ok: '#5BC787',
        bad: '#E58A8A',
      },
    },
  },
  plugins: [],
};
