import type { PoemSlide, Row } from "./model";

/**
 * محلّل نص القصائد كما يصل من رسائل الواتساب:
 * - القطع مفصولة بأسطر «____»، وكل قطعة تبدأ بسطر الشاعر «*1 - أبو هادي*»
 * - النجوم «***» تفصل جانبَي القطعة، وإن غابت فالفاصل سطر فارغ
 * - الأسطر القصيرة الملتفّة (كلمة أو كلمتان قصيرتان) تُدمج بالسطر السابق
 * - الشرطة «/» داخل السطر تقسمه إلى شطرين
 * - كل شطرين متتاليين يكوّنان صفاً واحداً، والسطر الفردي الأخير يُمركز
 */

const INVISIBLE = /[‎‏‪-‮⁦-⁩﻿]/g;
const SEP = /^_{2,}$/;
const STARS = /^\*{3,}$/;
const POET = /^\*?\s*(\d+)\s*-/;

function cleanLine(s: string): string {
  s = s.replace(INVISIBLE, "").trim();
  s = s.replace(/^\*+|\*+$/g, "").trim();
  s = s.replace(/\s+/g, " ");
  s = s.replace(/[،,]+\s*$/, "").trim();
  s = s.replace(/^[،,]+\s*/, "").trim();
  return s;
}

function mergeWraps(lines: string[]): string[] {
  const merged: string[] = [];
  for (const l of lines) {
    const words = l.split(" ");
    const isFragment =
      merged.length > 0 &&
      !l.includes("(") &&
      !l.includes(")") &&
      (words.length === 1 || (words.length === 2 && l.length <= 10));
    if (isFragment) merged[merged.length - 1] += " " + l;
    else merged.push(l);
  }
  return merged;
}

function sideToRows(lines: string[]): Row[] {
  const ls = mergeWraps(lines);
  const rows: Row[] = [];
  let i = 0;
  while (i < ls.length) {
    if (ls[i].includes("/")) {
      const [r, ...rest] = ls[i].split("/");
      rows.push({ right: r.trim(), left: rest.join("/").trim() });
      i += 1;
    } else if (i + 1 < ls.length && !ls[i + 1].includes("/")) {
      rows.push({ right: ls[i], left: ls[i + 1] });
      i += 2;
    } else {
      rows.push({ right: ls[i], left: null });
      i += 1;
    }
  }
  return rows;
}

export function parseAzzaText(raw: string): PoemSlide[] {
  const allLines = raw.split(/\r?\n/);

  // تقسيم إلى قطع على أسطر «____»
  const pieces: string[][] = [];
  let cur: string[] = [];
  for (const ln of allLines) {
    if (SEP.test(ln.replace(INVISIBLE, "").trim())) {
      if (cur.length) pieces.push(cur);
      cur = [];
    } else cur.push(ln);
  }
  if (cur.length) pieces.push(cur);

  const out: PoemSlide[] = [];
  for (const chunk of pieces) {
    let num: number | null = null;
    const lines: string[] = [];
    for (const ln of chunk) {
      const s = ln.replace(INVISIBLE, "").trim();
      const m = s.match(POET);
      if (m) {
        num = parseInt(m[1], 10);
        continue;
      }
      lines.push(ln);
    }
    // قطعة الترويسة (بلا سطر شاعر مرقّم) تُتجاهل
    if (num === null) continue;

    // فاصل النجوم، وإلا فالسطر الفارغ بين مجموعتين
    const norm = lines.map((l) => l.replace(INVISIBLE, "").trim());
    let starIdx = norm.findIndex((l) => STARS.test(l));
    if (starIdx === -1) {
      const contentIdx = norm
        .map((l, i) => (cleanLine(l) ? i : -1))
        .filter((i) => i >= 0);
      if (contentIdx.length > 1) {
        for (let i = contentIdx[0] + 1; i < contentIdx[contentIdx.length - 1]; i++) {
          if (!cleanLine(norm[i]) && cleanLine(norm[i - 1])) {
            starIdx = i;
            break;
          }
        }
      }
    }

    const rawSides =
      starIdx >= 0 ? [lines.slice(0, starIdx), lines.slice(starIdx + 1)] : [lines];

    const sides: Row[][] = rawSides
      .map((side) =>
        side
          .map(cleanLine)
          .filter((l) => l && !/^[_\-.]+$/.test(l))
      )
      .filter((side) => side.length > 0)
      .map(sideToRows);

    if (sides.length) out.push({ kind: "poem", num, sides });
  }
  return out;
}
