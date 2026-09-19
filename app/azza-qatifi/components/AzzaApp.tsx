"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { naskh } from "../fonts";
import { renderSlideJpeg } from "../exporter";
import { parseAzzaText } from "../parser";
import {
  DEFAULT_COVER,
  DEFAULT_THEME,
  FORMATS,
  type CoverLine,
  type Slide,
  type Theme,
} from "../model";
import SlideView from "./SlideView";

const DRAFT_KEY = "azza-qatifi-draft-v1";

type Draft = {
  rawText: string;
  theme: Theme;
  coverLines: CoverLine[];
  includeCover: boolean;
};

export default function AzzaApp() {
  const [rawText, setRawText] = useState("");
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [coverLines, setCoverLines] = useState<CoverLine[]>(DEFAULT_COVER);
  const [includeCover, setIncludeCover] = useState(true);
  const [present, setPresent] = useState<number | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /* استرجاع المسودة وحفظها محلياً */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved) as Draft;
        if (d.rawText) setRawText(d.rawText);
        if (d.theme) setTheme({ ...DEFAULT_THEME, ...d.theme });
        if (d.coverLines?.length) setCoverLines(d.coverLines);
        if (typeof d.includeCover === "boolean") setIncludeCover(d.includeCover);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const draft: Draft = { rawText, theme, coverLines, includeCover };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [rawText, theme, coverLines, includeCover, hydrated]);

  const slides: Slide[] = useMemo(() => {
    const poems = parseAzzaText(rawText);
    const cover: Slide[] = includeCover
      ? [{ kind: "cover", lines: coverLines.filter((l) => l.text.trim()) }]
      : [];
    return [...cover, ...poems];
  }, [rawText, coverLines, includeCover]);

  const slideName = useCallback((s: Slide, i: number) => {
    if (s.kind === "cover") return "00-الغلاف";
    return String(s.num).padStart(2, "0");
  }, []);

  /* التنقل في وضع العرض */
  useEffect(() => {
    if (present === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPresent(null);
      if (e.key === "ArrowLeft" || e.key === " ")
        setPresent((p) => (p !== null && p < slides.length - 1 ? p + 1 : p));
      if (e.key === "ArrowRight") setPresent((p) => (p !== null && p > 0 ? p - 1 : p));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [present, slides.length]);

  /* التصدير — رسم مباشر على Canvas بنفس معادلات المعاينة */
  const captureSlide = useCallback(
    (slide: Slide): Promise<Blob> =>
      renderSlideJpeg(slide, theme, naskh.style.fontFamily, 2),
    [theme]
  );

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportOne = async (slide: Slide, i: number) => {
    setExporting(`جاري تصدير الشريحة ${slideName(slide, i)}…`);
    try {
      const blob = await captureSlide(slide);
      download(blob, `${slideName(slide, i)}.jpg`);
    } finally {
      setExporting(null);
    }
  };

  const exportAll = async () => {
    const zip = new JSZip();
    try {
      for (let i = 0; i < slides.length; i++) {
        setExporting(`جاري التصدير ${i + 1} / ${slides.length}…`);
        const blob = await captureSlide(slides[i]);
        zip.file(`${slideName(slides[i], i)}.jpg`, blob);
      }
      setExporting("جاري ضغط الملف…");
      const out = await zip.generateAsync({ type: "blob" });
      download(out, "شرائح-العزاء-القطيفي.zip");
    } finally {
      setExporting(null);
    }
  };

  const fmt = FORMATS[theme.format];
  const set = (patch: Partial<Theme>) => setTheme((t) => ({ ...t, ...patch }));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">العزاء القطيفي — مولّد الشرائح</h1>
        <p className="text-neutral-400 mb-6 text-sm">
          الصق نص القصائد كما يصلك، وسيتم تحويله تلقائياً إلى شرائح جاهزة للعرض والتصدير.
        </p>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* لوحة الإدخال والتخصيص */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">نص القصائد</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"الصق هنا نص الرسالة…\n\n*1- *الشاعر*\nالشطر الأول\n*****\nالشطر الثاني\n___________"}
                className="w-full h-64 rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-sm leading-6 focus:outline-none focus:border-amber-600"
              />
            </div>

            {/* الغلاف */}
            <div className="rounded-lg border border-neutral-800 p-4 space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={includeCover}
                  onChange={(e) => setIncludeCover(e.target.checked)}
                />
                شريحة الغلاف
              </label>
              {includeCover &&
                coverLines.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={l.text}
                      onChange={(e) =>
                        setCoverLines((ls) =>
                          ls.map((x, xi) => (xi === i ? { ...x, text: e.target.value } : x))
                        )
                      }
                      className="flex-1 rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-sm"
                    />
                    <label className="flex items-center gap-1 text-xs text-neutral-400 shrink-0">
                      <input
                        type="checkbox"
                        checked={l.big}
                        onChange={(e) =>
                          setCoverLines((ls) =>
                            ls.map((x, xi) => (xi === i ? { ...x, big: e.target.checked } : x))
                          )
                        }
                      />
                      كبير
                    </label>
                  </div>
                ))}
            </div>

            {/* التخصيص */}
            <div className="rounded-lg border border-neutral-800 p-4 space-y-4 text-sm">
              <div>
                <div className="font-bold mb-2">مقاس الشريحة</div>
                <div className="flex gap-2">
                  {(Object.keys(FORMATS) as (keyof typeof FORMATS)[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => set({ format: f })}
                      className={`px-3 py-1.5 rounded-lg border ${
                        theme.format === f
                          ? "border-amber-600 bg-amber-600/15 text-amber-400"
                          : "border-neutral-700 text-neutral-300"
                      }`}
                    >
                      {FORMATS[f].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold mb-2">الخلفية</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => set({ bgMode: "image" })}
                    className={`px-3 py-1.5 rounded-lg border ${
                      theme.bgMode === "image"
                        ? "border-amber-600 bg-amber-600/15 text-amber-400"
                        : "border-neutral-700 text-neutral-300"
                    }`}
                  >
                    صورة
                  </button>
                  <button
                    onClick={() => set({ bgMode: "color" })}
                    className={`px-3 py-1.5 rounded-lg border ${
                      theme.bgMode === "color"
                        ? "border-amber-600 bg-amber-600/15 text-amber-400"
                        : "border-neutral-700 text-neutral-300"
                    }`}
                  >
                    لون
                  </button>
                  {theme.bgMode === "color" && (
                    <input
                      type="color"
                      value={theme.bgColor}
                      onChange={(e) => set({ bgColor: e.target.value })}
                      className="h-8 w-12 rounded cursor-pointer bg-transparent"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold">الشعار</div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={theme.centerLogo}
                    onChange={(e) => set({ centerLogo: e.target.checked })}
                  />
                  شعار في المنتصف (باهت)
                </label>
                {theme.centerLogo && (
                  <div className="flex items-center gap-2 pr-6">
                    <span className="text-xs text-neutral-400">الشفافية</span>
                    <input
                      type="range"
                      min={0.05}
                      max={0.6}
                      step={0.01}
                      value={theme.centerLogoOpacity}
                      onChange={(e) => set({ centerLogoOpacity: Number(e.target.value) })}
                      className="flex-1"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={theme.cornerLogo}
                    onChange={(e) => set({ cornerLogo: e.target.checked })}
                  />
                  شعار في الزاوية
                </label>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={theme.divider}
                  onChange={(e) => set({ divider: e.target.checked })}
                />
                فاصل ذهبي بين الجانبين
              </label>
            </div>

            {/* التصدير */}
            <div className="rounded-lg border border-neutral-800 p-4 space-y-3">
              <button
                onClick={exportAll}
                disabled={!slides.length || exporting !== null}
                className="w-full py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:opacity-40 font-bold"
              >
                تصدير الكل JPG (ملف مضغوط)
              </button>
              {exporting && <div className="text-xs text-amber-400">{exporting}</div>}
              <div className="text-xs text-neutral-500">
                دقة التصدير: {fmt.w * 2}×{fmt.h * 2}
              </div>
            </div>
          </div>

          {/* المعاينة */}
          <div>
            {slides.length === 0 ? (
              <div className="h-64 grid place-items-center rounded-xl border border-dashed border-neutral-800 text-neutral-500">
                الصق النص لتظهر الشرائح هنا
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  theme.format === "wide" ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {slides.map((s, i) => (
                  <div key={i} className="group relative">
                    <button
                      onClick={() => setPresent(i)}
                      className="block w-full rounded-lg overflow-hidden ring-1 ring-neutral-800 hover:ring-amber-600 transition"
                    >
                      <ResponsiveSlide slide={s} theme={theme} />
                    </button>
                    <div className="mt-1 flex items-center justify-between text-xs text-neutral-400">
                      <span>{s.kind === "cover" ? "الغلاف" : `قصيدة ${s.num}`}</span>
                      <button
                        onClick={() => exportOne(s, i)}
                        disabled={exporting !== null}
                        className="opacity-0 group-hover:opacity-100 transition text-amber-500 hover:text-amber-400 disabled:opacity-30"
                      >
                        تصدير JPG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* وضع العرض */}
      {present !== null && slides[present] && (
        <div
          className="fixed inset-0 z-[200] bg-black grid place-items-center cursor-pointer"
          onClick={() =>
            setPresent((p) => (p !== null && p < slides.length - 1 ? p + 1 : null))
          }
        >
          <PresentSlide slide={slides[present]} theme={theme} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPresent(null);
            }}
            className="absolute top-4 left-4 text-neutral-400 hover:text-white text-2xl leading-none"
            aria-label="إغلاق"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-neutral-500 text-sm">
            {present + 1} / {slides.length}
          </div>
        </div>
      )}

    </div>
  );
}

/** شريحة تتمدد مع عرض حاويتها (المعاينة الشبكية) */
function ResponsiveSlide({ slide, theme }: { slide: Slide; theme: Theme }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full">
      {w > 0 && <SlideView slide={slide} theme={theme} width={w} />}
    </div>
  );
}

/** شريحة العرض الكامل: أكبر مقاس يسع الشاشة مع حفظ النسبة */
function PresentSlide({ slide, theme }: { slide: Slide; theme: Theme }) {
  const fmt = FORMATS[theme.format];
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const width = Math.min(size.w, (size.h * fmt.w) / fmt.h);
  return width > 0 ? <SlideView slide={slide} theme={theme} width={width} /> : null;
}
