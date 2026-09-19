import type { CoverLine, Row } from "./model";

/* ثوابت التنسيق المشتركة بين المعاينة (DOM) والتصدير (Canvas) — بالبكسل المنطقي */
export const LINE_H = 1.6;
export const DIV_H = 1.76;
export const MAX_SIZE = 400;
export const HEIGHT_BUDGET = 0.92;
export const SAFETY = 0.98;
export const MARGIN_R = 0.045;
export const GAP_R = 0.055;
export const CORNER_LOGO = { left: 34, top: 26, width: 165 };
export const CENTER_LOGO_H = 0.82;

let measureCtx: CanvasRenderingContext2D | null = null;

export function textWidth100(text: string, fontFamily: string): number {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  if (!measureCtx) return text.length * 50;
  measureCtx.font = `700 100px ${fontFamily}`;
  return measureCtx.measureText(text).width;
}

export type PoemFit = {
  size: number;
  margin: number;
  col: number;
  gap: number;
  withDiv: boolean;
};

export function fitPoem(
  sides: Row[][],
  W: number,
  H: number,
  divider: boolean,
  fontFamily: string | null
): PoemFit {
  const margin = W * MARGIN_R;
  const usable = W - 2 * margin;
  const gap = usable * GAP_R;
  const col = (usable - gap) / 2;
  let size = MAX_SIZE;
  if (fontFamily) {
    for (const r of sides.flat()) {
      if (r.left === null) {
        size = Math.min(size, (100 * usable * SAFETY) / textWidth100(r.right, fontFamily));
      } else {
        size = Math.min(
          size,
          (100 * col * SAFETY) / textWidth100(r.right, fontFamily),
          (100 * col * SAFETY) / textWidth100(r.left, fontFamily)
        );
      }
    }
  }
  const n = sides.reduce((acc, s) => acc + s.length, 0);
  const withDiv = divider && sides.length === 2;
  const hUnits = n * LINE_H + (withDiv ? DIV_H : 0);
  size = Math.min(size, (H * HEIGHT_BUDGET) / hUnits);
  return { size, margin, col, gap, withDiv };
}

export function fitCover(
  lines: CoverLine[],
  W: number,
  H: number,
  fontFamily: string | null
): number {
  const usable = W * 0.9;
  let B = 240;
  if (fontFamily) {
    for (const l of lines) {
      const limit = (100 * usable * SAFETY) / textWidth100(l.text, fontFamily);
      B = Math.min(B, l.big ? limit : limit / 0.4);
    }
  }
  const hUnits = lines.reduce((acc, l) => acc + (l.big ? 1.45 : 0.76), 0);
  return Math.min(B, (H * 0.9) / hUnits);
}
