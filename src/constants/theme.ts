/**
 * Sirius temasi — yildizli gece laciverdi zemin, mum isigi sicakliginda antik
 * altin vurgular, bordo / ametist ara tonlar ve parsomen rengi yazilar.
 */
export const theme = {
  color: {
    /** Ekran gradyaninin ust ucu. */
    bgTop: '#1C1842',
    bg: '#0F1028',
    bgDeep: '#08091A',
    panel: '#181A38',
    panelRaised: '#22244A',
    fg: '#F8EFD9',
    fgDim: '#C9BEA6',
    fgMuted: '#8E88A6',
    accent: '#E6B84F',
    accentBright: '#FFDC85',
    accentDeep: '#A9801F',
    accentSoft: 'rgba(230,184,79,0.13)',
    onAccent: '#241803',
    amber: '#FF9F4A',
    gold: '#F7CE68',
    goldDeep: '#C9962E',
    border: 'rgba(255,220,133,0.18)',
    borderStrong: 'rgba(255,220,133,0.55)',
    success: '#4FD08A',
    successDark: '#23945A',
    successSoft: 'rgba(79,208,138,0.14)',
    successBg: '#0D2A1F',
    danger: '#F2607A',
    dangerDark: '#A82E48',
    /** Koyu zemin ustunde hata metni. */
    dangerText: '#FFB8C4',
    dangerSoft: 'rgba(242,96,122,0.14)',
    dangerBg: '#2C0F1B',
    heart: '#F2607A',
    /** Koyu yuzeyler (alt gezinme, baloncuk etiketi) ve ustlerindeki altin vurgular. */
    dark: '#070716',
    darkSoft: '#1E1F42',
    onDark: '#8F89A8',
    purple: '#B89AF0',
    purpleSoft: 'rgba(184,154,240,0.14)',
    neon: '#FFDC85',
    neonLime: '#D8E88A',
    locked: '#232548',
    lockedDark: '#15163A',
    /** Kamera goruntusu ustune binen acik katman. */
    overlay: 'rgba(8,9,26,0.86)',
    /** Arka plandaki isik lekeleri: mum altini, bordo ve gece moru. */
    glow: ['#E6B84F', '#8E2A45', '#5B4BC4'],
    /** Arka planda parildayan yildizlarin tonlari. */
    sparkle: ['#FFDC85', '#FFF6DC', '#E6B84F', '#B89AF0'],
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 22 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  font: {
    display: 'Barlow_700Bold',
    displayBlack: 'Barlow_800ExtraBold',
    body: 'Barlow_400Regular',
    bodyBold: 'Barlow_600SemiBold',
    italic: 'Barlow_400Regular_Italic',
  },
};

export interface CategoryStyle {
  icon: string;
  /** Yazi, cerceve ve ikonlarda kullanilan ton. */
  color: string;
  /** Buyuk yuzeylerde kullanilan pastel dolgu. */
  soft: string;
  subtitle: string;
}

/** Her bolumun kendi rengi ve ikonu var. */
export const categoryStyle: Record<string, CategoryStyle> = {
  gunluk: { icon: 'chatbubbles', color: '#12A5B8', soft: '#B5F0F5', subtitle: 'Selamlaşma ve nezaket' },
  aile: { icon: 'heart', color: '#D69A3C', soft: '#FFE1B0', subtitle: 'Yakınlarımız' },
  sayilar: { icon: 'calculator', color: '#5E8FD6', soft: '#C2D8F8', subtitle: 'Saymayı öğren' },
  acil: { icon: 'medkit', color: '#4CAF82', soft: '#BDE8D0', subtitle: 'Yardım iste' },
  renkler: { icon: 'color-palette', color: '#A85FE0', soft: '#E6CCF8', subtitle: 'Renkli dünya' },
  zaman: { icon: 'time', color: '#7078D0', soft: '#CDD0F8', subtitle: 'Günler ve saatler' },
  duygular: { icon: 'happy', color: '#E08A52', soft: '#FFD3B8', subtitle: 'Nasıl hissediyorsun?' },
  yiyecek: { icon: 'restaurant', color: '#B9783F', soft: '#F5D8B8', subtitle: 'Sofrada' },
  okul: { icon: 'school', color: '#4C9EBD', soft: '#BEE3F0', subtitle: 'Sınıfta' },
  ev: { icon: 'home', color: '#9478CF', soft: '#DCCDF5', subtitle: 'Evimizde' },
  hayvanlar: { icon: 'paw', color: '#7BA646', soft: '#D3EBB5', subtitle: 'Hayvan dostlarımız' },
  meslekler: { icon: 'briefcase', color: '#5B93A0', soft: '#C5E0E4', subtitle: 'Kim ne iş yapar?' },
  fiiller: { icon: 'flash', color: '#DB705C', soft: '#FFCDC2', subtitle: 'Hareketler' },
  sorular: { icon: 'help-circle', color: '#5587C7', soft: '#C4D9F5', subtitle: 'Soru sor, tanış' },
  yerler: { icon: 'map', color: '#43A398', soft: '#BDE8E1', subtitle: 'Nereye gidiyoruz?' },
  doga: { icon: 'leaf', color: '#52A862', soft: '#C5E9C8', subtitle: 'Gökyüzü ve doğa' },
  beden: { icon: 'body', color: '#E0855C', soft: '#FFD6C2', subtitle: 'Vücudumuz' },
  ulasim: { icon: 'boat', color: '#6E86D6', soft: '#CAD5F9', subtitle: 'Yolculuk' },
  sifatlar: { icon: 'star', color: '#C09A30', soft: '#F8E6AE', subtitle: 'Nasıl bir şey?' },
};

export const defaultCategoryStyle: CategoryStyle = {
  icon: 'sparkles',
  color: '#9B6BFF',
  soft: '#DAD3FA',
  subtitle: 'Yeni işaretler',
};
