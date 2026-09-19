/** صف عرض: شطر يمين + شطر يسار، أو سطر واحد ممركّز (left = null) */
export type Row = { right: string; left: string | null };

export type PoemSlide = {
  kind: "poem";
  num: number;
  /** جانب أو جانبان (قبل النجوم وبعدها) */
  sides: Row[][];
};

export type CoverLine = { text: string; big: boolean };
export type CoverSlide = { kind: "cover"; lines: CoverLine[] };

export type Slide = PoemSlide | CoverSlide;

/** مقاسا الشرائح المدعومان */
export type SlideFormat = "wide" | "compact";

export const FORMATS: Record<
  SlideFormat,
  { w: number; h: number; bg: string; label: string }
> = {
  wide: { w: 1920, h: 1080, bg: "/images/azza/bg-wide.png", label: "عريض ١٩٢٠×١٠٨٠" },
  compact: { w: 1200, h: 1080, bg: "/images/azza/bg-compact.png", label: "مصغّر ١٢٠٠×١٠٨٠" },
};

export const LOGO_SRC = "/images/azza/logo.png";

export type Theme = {
  format: SlideFormat;
  bgMode: "image" | "color";
  bgColor: string;
  centerLogo: boolean;
  centerLogoOpacity: number; // 0..1
  cornerLogo: boolean;
  divider: boolean;
  textColor: string;
  accentColor: string;
};

export const DEFAULT_THEME: Theme = {
  format: "wide",
  bgMode: "image",
  bgColor: "#200606",
  centerLogo: true,
  centerLogoOpacity: 0.22,
  cornerLogo: true,
  divider: true,
  textColor: "#f8f3e7",
  accentColor: "#d0a666",
};

export const DEFAULT_COVER: CoverLine[] = [
  { text: "موكب أهالي القطيف الأربعين", big: false },
  { text: "العزاء القطيفي", big: true },
  { text: "يوم ١٧ صفر", big: false },
  { text: "كربلاء المقدسة - ١٤٤٨ هـ", big: false },
  { text: "لبيك يا حسين", big: true },
];
