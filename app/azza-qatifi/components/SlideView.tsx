"use client";

import { useEffect, useMemo, useState } from "react";
import { naskh } from "../fonts";
import { FORMATS, LOGO_SRC, type Row, type Slide, type Theme } from "../model";
import {
  CENTER_LOGO_H,
  CORNER_LOGO,
  DIV_H,
  LINE_H,
  fitCover,
  fitPoem,
} from "../layout-engine";

function usePoemFit(sides: Row[][], W: number, H: number, divider: boolean, ready: boolean) {
  return useMemo(
    () => fitPoem(sides, W, H, divider, ready ? naskh.style.fontFamily : null),
    [sides, W, H, divider, ready]
  );
}

function useCoverFit(
  lines: { text: string; big: boolean }[],
  W: number,
  H: number,
  ready: boolean
) {
  return useMemo(
    () => fitCover(lines, W, H, ready ? naskh.style.fontFamily : null),
    [lines, W, H, ready]
  );
}

function TextLine({
  text,
  size,
  color,
}: {
  text: string;
  size: number;
  color: string;
}) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 700,
        color,
        whiteSpace: "nowrap",
        lineHeight: 1,
        textShadow: `${size * 0.032}px ${size * 0.032}px ${size * 0.02}px rgba(18,4,4,0.9)`,
      }}
    >
      {text}
    </span>
  );
}

function Divider({ width, accent }: { width: number; accent: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: width * 0.34,
        height: 5,
        borderRadius: 3,
        background: accent,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 26,
          height: 26,
          transform: "translate(-50%, -50%) rotate(45deg)",
          background: accent,
          border: "2px solid rgba(90,30,20,0.9)",
        }}
      />
    </div>
  );
}

export default function SlideView({
  slide,
  theme,
  width,
}: {
  slide: Slide;
  theme: Theme;
  width: number;
}) {
  const fmt = FORMATS[theme.format];
  const scale = width / fmt.w;
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    let alive = true;
    document.fonts
      .load(`700 100px ${naskh.style.fontFamily}`)
      .then(() => document.fonts.ready)
      .then(() => alive && setFontReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const poemSides = slide.kind === "poem" ? slide.sides : [];
  const poemFit = usePoemFit(poemSides, fmt.w, fmt.h, theme.divider, fontReady);
  const coverLines = slide.kind === "cover" ? slide.lines : [];
  const coverB = useCoverFit(coverLines, fmt.w, fmt.h, fontReady);

  return (
    <div
      style={{ width, height: fmt.h * scale, position: "relative", overflow: "hidden" }}
      dir="rtl"
    >
      <div
        className={naskh.className}
        style={{
          width: fmt.w,
          height: fmt.h,
          transform: `scale(${scale})`,
          transformOrigin: "top right",
          position: "absolute",
          top: 0,
          right: 0,
          background: theme.bgMode === "color" ? theme.bgColor : undefined,
          visibility: fontReady ? "visible" : "hidden",
        }}
      >
        {theme.bgMode === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fmt.bg}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {theme.centerLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={LOGO_SRC}
            alt=""
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: fmt.h * CENTER_LOGO_H,
              transform: "translate(-50%, -50%)",
              opacity: theme.centerLogoOpacity,
            }}
          />
        )}

        {theme.cornerLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={LOGO_SRC}
            alt=""
            style={{
              position: "absolute",
              left: CORNER_LOGO.left,
              top: CORNER_LOGO.top,
              width: CORNER_LOGO.width,
            }}
          />
        )}

        {/* المحتوى */}
        {slide.kind === "poem" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: `0 ${poemFit.margin}px`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {poemSides.map((side, si) => (
              <div key={si} style={{ display: "contents" }}>
                {si === 1 && poemFit.withDiv && (
                  <div
                    style={{
                      height: poemFit.size * DIV_H,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Divider width={fmt.w} accent={theme.accentColor} />
                  </div>
                )}
                {side.map((row, ri) => (
                  <div
                    key={ri}
                    style={{
                      height: poemFit.size * LINE_H,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: row.left !== null ? poemFit.gap : 0,
                    }}
                  >
                    {row.left !== null ? (
                      <>
                        <div style={{ width: poemFit.col, display: "flex", justifyContent: "center" }}>
                          <TextLine text={row.right} size={poemFit.size} color={theme.textColor} />
                        </div>
                        <div style={{ width: poemFit.col, display: "flex", justifyContent: "center" }}>
                          <TextLine text={row.left} size={poemFit.size} color={theme.textColor} />
                        </div>
                      </>
                    ) : (
                      <TextLine text={row.right} size={poemFit.size} color={theme.textColor} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {coverLines.map((l, i) => (
              <div
                key={i}
                style={{
                  height: coverB * (l.big ? 1.45 : 0.76),
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextLine
                  text={l.text}
                  size={l.big ? coverB : coverB * 0.4}
                  color={l.big ? theme.textColor : theme.accentColor}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
