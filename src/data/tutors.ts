/** Isaretleri gosteren 3B egitmen karakterleri: kullanici profilden birini secer. */
export interface Tutor {
  id: string;
  name: string;
  skin: string;
  hair: string;
  hairStyle: 'wavy' | 'bob' | 'bun' | 'short' | 'long' | 'curly';
  /** Kiyafet: varsayilan neon cizgili tulum; 'robe' kusakli, can kollu cubbe. */
  outfit?: 'suit' | 'robe';
  /** Sivri kulaklar. */
  elf?: boolean;
  glasses?: boolean;
  /**
   * Iskeletli hazir 3B model (GLB, Mixamo kemik adlari). Verilirse kodla cizilen
   * karakter yerine bu model kullanilir; yuklenemezse cizime dusulur.
   */
  model?: string;
  /** Hazir modelde sacin boyanacagi renk (modelin kendi koyu saci yerine). */
  modelHair?: string;
  /** Hazir modelde tenin boyanacagi renk. */
  modelSkin?: string;
  /**
   * Hazir modele eklenen sac: 'messy' daginik tutamlar; 'wavy' modelin toplu
   * sacini gizleyip omuzlara dokulen acik dalgali sac, 'bun' arkada duzgun
   * toplanmis sac ekler.
   */
  modelHairStyle?: 'messy' | 'wavy' | 'bun';
  /**
   * Hazir modelin basini gizleyip yerine cizilen stilize basi takar (gozluksuz
   * yuz, mavi-mor omuz hizasi sac).
   */
  modelHead?: boolean;
  /** Tum vucudu (kollar, eller, parmaklar) neon tel kafesle kaplar. */
  modelWire?: boolean;
  /** Bastaki aksesuarlari (gozluk, kulaklik) mor neon tona ceker. */
  modelGear?: boolean;
  /** Hazir modelin kiyafetini neon cizgili koyu siber tuluma cevirir. */
  modelSuit?: boolean;
}

export const tutors: Tutor[] = [
  {
    id: 'michelle',
    name: 'Michelle',
    skin: '#7A4B33',
    hair: '#1A1A1A',
    hairStyle: 'curly',
    // Modelin kendi hali: yuz, sac ve kiyafet degistirilmez.
    // three.js ornek varliklarindaki Mixamo karakteri.
    model: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/Michelle.glb',
  },
  { id: 'sirius', name: 'Sirius', skin: '#F1DCD2', hair: '#BFC6E4', hairStyle: 'wavy', outfit: 'robe', elf: true },
  { id: 'nova', name: 'Nova', skin: '#F4CDBB', hair: '#5567E8', hairStyle: 'bob' },
  { id: 'ada', name: 'Ada', skin: '#F6C7A0', hair: '#4A3023', hairStyle: 'bun' },
  { id: 'can', name: 'Can', skin: '#E9B58C', hair: '#22190F', hairStyle: 'short' },
  { id: 'elif', name: 'Elif', skin: '#C68E63', hair: '#1C1410', hairStyle: 'long' },
  { id: 'deniz', name: 'Deniz', skin: '#FBDCC2', hair: '#C9892F', hairStyle: 'short', glasses: true },
  { id: 'umut', name: 'Umut', skin: '#8E5B3C', hair: '#16100C', hairStyle: 'curly' },
  { id: 'nil', name: 'Nil', skin: '#F2C4A2', hair: '#B5452C', hairStyle: 'long', glasses: true },
  { id: 'defne', name: 'Defne', skin: '#F8D9C4', hair: '#E2C36B', hairStyle: 'wavy' },
  { id: 'aras', name: 'Aras', skin: '#D9A074', hair: '#8A3B22', hairStyle: 'curly', glasses: true },
  { id: 'zeynep', name: 'Zeynep', skin: '#EFC3A4', hair: '#D46A9C', hairStyle: 'bob' },
  { id: 'kaan', name: 'Kaan', skin: '#6B4430', hair: '#0F0C0A', hairStyle: 'short' },
  { id: 'lina', name: 'Lina', skin: '#F3D2BE', hair: '#7A5BC9', hairStyle: 'bun', outfit: 'robe', glasses: true },
  { id: 'bilge', name: 'Bilge', skin: '#E6BC9A', hair: '#D8DCE6', hairStyle: 'bun', outfit: 'robe' },
  { id: 'atlas', name: 'Atlas', skin: '#A8714C', hair: '#2E7D6B', hairStyle: 'short', elf: true },
  { id: 'maya', name: 'Maya', skin: '#9A6242', hair: '#241812', hairStyle: 'long', outfit: 'robe' },
];

export const tutorById = (id: string | null | undefined) => tutors.find((t) => t.id === id) ?? tutors[0];
