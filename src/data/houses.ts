/** Dort takim: kullanici kayitta birini secer, profil rengi olur. */
export const houses = [
  { id: 'alev', name: 'Alev Takımı', trait: 'Cesaret', icon: 'flame', color: '#DE5F58' },
  { id: 'gunes', name: 'Güneş Takımı', trait: 'Sadakat', icon: 'sunny', color: '#E3B040' },
  { id: 'yildiz', name: 'Yıldız Takımı', trait: 'Bilgelik', icon: 'planet', color: '#6C97E6' },
  { id: 'orman', name: 'Orman Takımı', trait: 'Azim', icon: 'leaf', color: '#4FB387' },
] as const;

export type House = (typeof houses)[number];

export function houseById(id: string | null | undefined): House | undefined {
  return houses.find((h) => h.id === id);
}

export const avatars = [
  // Yuzler
  '😊',
  '😎',
  '🤓',
  '🥳',
  '😇',
  '🤗',
  // Hayvanlar
  '🦊',
  '🐱',
  '🐶',
  '🐼',
  '🦁',
  '🐸',
  '🦉',
  '🐯',
  '🐰',
  '🐨',
  '🐧',
  '🐢',
  '🐬',
  '🦄',
  '🦋',
  '🐝',
  // Doga ve gokyuzu
  '🌈',
  '⭐',
  '🌙',
  '☀️',
  '🌻',
  '🍀',
  '🌊',
  '🔥',
  // Hobiler
  '🎨',
  '🎧',
  '⚽',
  '📚',
  '🚀',
  '🏆',
  '👑',
  '💛',
];
