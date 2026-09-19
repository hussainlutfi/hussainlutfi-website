import { FORMATS, LOGO_SRC, type Slide, type Theme } from "./model";
import {
  CENTER_LOGO_H,
  CORNER_LOGO,
  DIV_H,
  LINE_H,
  fitCover,
  fitPoem,
} from "./layout-engine";

/** تصدير الشريحة كـ JPG عبر الرسم المباشر على Canvas — نفس معادلات المعاينة تماماً */

const imgCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  let p = imgCache.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    imgCache.set(src, p);
  }
  return p;
}

function drawTextLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  fontFamily: string,
  scale: number
) {
  ctx.font = `700 ${size}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(18,4,4,0.9)";
  ctx.shadowOffsetX = size * 0.032 * scale;
  ctx.shadowOffsetY = size * 0.032 * scale;
  ctx.shadowBlur = size * 0.02 * scale;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
}

function drawDivider(
  ctx: CanvasRenderingContext2D,
  W: number,
  cy: number,
  accent: string
) {
  const half = (W * 0.34) / 2;
  const th = 2.5;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(W / 2 - half, cy - th, half * 2, th * 2, th);
  ctx.fill();
  // معيّن صغير في المنتصف
  ctx.save();
  ctx.translate(W / 2, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-13, -13, 26, 26);
  ctx.strokeStyle = "rgba(90,30,20,0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-13, -13, 26, 26);
  ctx.restore();
}

export async function renderSlideJpeg(
  slide: Slide,
  theme: Theme,
  fontFamily: string,
  scale = 2,
  quality = 0.93
): Promise<Blob> {
  const fmt = FORMATS[theme.format];
  const W = fmt.w;
  const H = fmt.h;

  await document.fonts.load(`700 100px ${fontFamily}`);
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.scale(scale, scale);
  (ctx as CanvasRenderingContext2D & { direction: string }).direction = "rtl";

  /* الخلفية */
  if (theme.bgMode === "image") {
    const bg = await loadImage(fmt.bg);
    ctx.drawImage(bg, 0, 0, W, H);
  } else {
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, W, H);
  }

  /* الشعار في المنتصف (باهت) */
  if (theme.centerLogo) {
    const logo = await loadImage(LOGO_SRC);
    const lw = H * CENTER_LOGO_H;
    const lh = lw * (logo.naturalHeight / logo.naturalWidth);
    ctx.globalAlpha = theme.centerLogoOpacity;
    ctx.drawImage(logo, (W - lw) / 2, (H - lh) / 2, lw, lh);
    ctx.globalAlpha = 1;
  }

  /* الشعار في الزاوية */
  if (theme.cornerLogo) {
    const logo = await loadImage(LOGO_SRC);
    const lw = CORNER_LOGO.width;
    const lh = lw * (logo.naturalHeight / logo.naturalWidth);
    ctx.drawImage(logo, CORNER_LOGO.left, CORNER_LOGO.top, lw, lh);
  }

  /* النص */
  if (slide.kind === "poem") {
    const fit = fitPoem(slide.sides, W, H, theme.divider, fontFamily);
    const n = slide.sides.reduce((acc, s) => acc + s.length, 0);
    const lineH = fit.size * LINE_H;
    const divH = fit.size * DIV_H;
    const totalH = n * lineH + (fit.withDiv ? divH : 0);
    let y = (H - totalH) / 2 + lineH / 2;
    const rightCx = W - fit.margin - fit.col / 2;
    const leftCx = fit.margin + fit.col / 2;

    slide.sides.forEach((side, si) => {
      if (si === 1 && fit.withDiv) {
        drawDivider(ctx, W, y - lineH / 2 + divH / 2, theme.accentColor);
        y += divH;
      }
      for (const row of side) {
        if (row.left === null) {
          drawTextLine(ctx, row.right, W / 2, y, fit.size, theme.textColor, fontFamily, scale);
        } else {
          drawTextLine(ctx, row.right, rightCx, y, fit.size, theme.textColor, fontFamily, scale);
          drawTextLine(ctx, row.left, leftCx, y, fit.size, theme.textColor, fontFamily, scale);
        }
        y += lineH;
      }
    });
  } else {
    const B = fitCover(slide.lines, W, H, fontFamily);
    const totalH = slide.lines.reduce((acc, l) => acc + B * (l.big ? 1.45 : 0.76), 0);
    let y = (H - totalH) / 2;
    for (const l of slide.lines) {
      const h = B * (l.big ? 1.45 : 0.76);
      drawTextLine(
        ctx,
        l.text,
        W / 2,
        y + h / 2,
        l.big ? B : B * 0.4,
        l.big ? theme.textColor : theme.accentColor,
        fontFamily,
        scale
      );
      y += h;
    }
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality
    );
  });
}
