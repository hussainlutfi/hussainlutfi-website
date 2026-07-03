"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MattamData, MattamDoc } from "../model";
import { computeSummary, fmtMoney } from "../model";
import Overview from "./Overview";
import Editor from "./Editor";
import { IconRefresh } from "./icons";

export type Mode = "overview" | "edit";
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";

const SAVE_META: Record<Exclude<SaveState, "idle">, { text: string; dot: string }> = {
  dirty: { text: "تغييرات غير محفوظة", dot: "bg-amber-300" },
  saving: { text: "جارٍ الحفظ…", dot: "bg-amber-300 animate-pulse" },
  saved: { text: "تم الحفظ", dot: "bg-emerald-300" },
  error: { text: "تعذر الحفظ", dot: "bg-red-400" },
  conflict: { text: "تعارض في البيانات", dot: "bg-red-400" },
};

export default function MattamApp({
  slug,
  base,
  mode,
  initial,
}: {
  slug: string;
  base: string;
  mode: Mode;
  initial: MattamDoc | null;
}) {
  const [data, setData] = useState<MattamData | null>(initial?.data ?? null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initial?.updatedAt ?? null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const revRef = useRef(initial?.rev ?? 0);
  const latestRef = useRef<MattamData | null>(initial?.data ?? null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const queuedRef = useRef(false);
  const pendingRef = useRef(false);

  const apiUrl = `/api/mattam/${slug}`;

  /* ── تحميل / تحديث ── */
  const load = useCallback(async () => {
    setLoadError(false);
    setRefreshing(true);
    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const doc: MattamDoc = await res.json();
      revRef.current = doc.rev;
      latestRef.current = doc.data;
      pendingRef.current = false;
      setData(doc.data);
      setUpdatedAt(doc.updatedAt);
      setSaveState("idle");
    } catch {
      setLoadError(true);
    } finally {
      setRefreshing(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!initial) load();
  }, [initial, load]);

  /* ── حفظ ── */
  const doSave = useCallback(async () => {
    if (savingRef.current) {
      queuedRef.current = true;
      return;
    }
    savingRef.current = true;
    setSaveState("saving");
    try {
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: latestRef.current, baseRev: revRef.current }),
      });
      if (res.status === 409) {
        setSaveState("conflict");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const body: { rev: number; updatedAt: string } = await res.json();
      revRef.current = body.rev;
      pendingRef.current = false;
      setUpdatedAt(body.updatedAt);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      savingRef.current = false;
      if (queuedRef.current) {
        queuedRef.current = false;
        doSave();
      }
    }
  }, [apiUrl]);

  const mutate = useCallback(
    (fn: (d: MattamData) => MattamData) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = fn(prev);
        latestRef.current = next;
        return next;
      });
      pendingRef.current = true;
      setSaveState((s) => (s === "conflict" ? s : "dirty"));
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(doSave, 1200);
    },
    [doSave]
  );

  /* تحذير قبل إغلاق الصفحة + حفظ سريع عند مغادرة صفحة التعديل */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (pendingRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(
    () => () => {
      if (pendingRef.current && latestRef.current) {
        fetch(apiUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: latestRef.current, baseRev: revRef.current }),
          keepalive: true,
        }).catch(() => {});
      }
    },
    [apiUrl]
  );

  const summary = useMemo(() => (data ? computeSummary(data) : null), [data]);

  const spentPct =
    summary && summary.hospitalityBudget > 0
      ? Math.round((summary.hospitalitySpent / summary.hospitalityBudget) * 100)
      : 0;
  const over = !!summary && summary.hospitalitySpent > summary.hospitalityBudget;

  const badge = saveState !== "idle" ? SAVE_META[saveState] : null;

  return (
    <div className="min-h-screen bg-[#f3f8f7] pb-24">
      <div className="mx-auto w-[92%] max-w-5xl pt-6 md:pt-10">
        {/* ─── الترويسة ─── */}
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-[#16b1a1] via-[#12a091] to-[#0e8e81] p-6 pb-10 text-white shadow-xl shadow-teal-900/15 md:p-10 md:pb-14">
          {/* زخارف */}
          <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
          <div className="pointer-events-none absolute -top-10 right-10 h-32 w-32 rounded-full border-[1.5rem] border-white/5" />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-wide text-white/70">{data?.season ?? "موسم محرم ١٤٤٨هـ"}</p>
              <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{data?.title ?? "مأتم الوادي"}</h1>
              <p className="mt-2 text-sm font-medium text-white/75">إدارة مصاريف الضيافة</p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <nav className="inline-flex items-center rounded-full bg-white/15 p-1 backdrop-blur-sm">
                <Link
                  href={`${base}/overview`}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                    mode === "overview" ? "bg-white text-[#0e8e81] shadow-sm" : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  الملخص العام
                </Link>
                <Link
                  href={`${base}/edit`}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                    mode === "edit" ? "bg-white text-[#0e8e81] shadow-sm" : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  الإدخال والتعديل
                </Link>
              </nav>

              <div className="flex items-center gap-2">
                {badge && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                    <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                    {badge.text}
                  </span>
                )}
                {updatedAt && (
                  <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-medium text-white/70 sm:inline-flex">
                    آخر تحديث:{" "}
                    {new Date(updatedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                )}
                {mode === "overview" && data && (
                  <button
                    type="button"
                    onClick={load}
                    aria-label="تحديث البيانات"
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white/85 transition hover:bg-white/25"
                  >
                    <IconRefresh className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* مؤشر ميزانية الضيافة داخل الترويسة */}
          {summary && (
            <div className="relative mt-8">
              <div className="mb-2 flex items-end justify-between text-sm">
                <span className="font-bold text-white/85">الصرف من ميزانية الضيافة</span>
                <span dir="ltr" className="text-lg font-extrabold tabular-nums">
                  {spentPct}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${over ? "bg-red-300" : "bg-white"}`}
                  style={{ width: `${Math.min(100, spentPct)}%` }}
                />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-medium text-white/70">
                <span>
                  المصروف: <b dir="ltr" className="tabular-nums">{fmtMoney(summary.hospitalitySpent)}</b> {data!.currency}
                </span>
                <span>
                  الميزانية: <b dir="ltr" className="tabular-nums">{fmtMoney(summary.hospitalityBudget)}</b> {data!.currency}
                </span>
                <span>
                  اكتملت {summary.doneCount} من {data!.nights.length} ليالٍ
                </span>
              </div>
            </div>
          )}
        </header>

        {/* ─── تنبيهات ─── */}
        {saveState === "conflict" && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-bold">
              تم تعديل البيانات من جهاز آخر. حدّث الصفحة لعرض أحدث نسخة (ستفقد تعديلاتك غير المحفوظة).
            </p>
            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
            >
              تحديث البيانات
            </button>
          </div>
        )}
        {saveState === "error" && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
            <p className="font-bold">لم يتم حفظ آخر التغييرات — تحقق من الاتصال.</p>
            <button
              type="button"
              onClick={doSave}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* ─── المحتوى ─── */}
        {!data || !summary ? (
          <div className="mt-6 rounded-[1.75rem] bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            {loadError ? (
              <>
                <p className="text-lg font-bold text-gray-700">تعذر الاتصال بقاعدة البيانات</p>
                <p className="mt-2 text-sm text-gray-400">تأكد من اتصالك بالإنترنت ثم أعد المحاولة</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-6 rounded-xl bg-[#16b1a1] px-7 py-2.5 text-sm font-bold text-white transition hover:bg-[#0e8e81]"
                >
                  إعادة المحاولة
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e8f7f5] border-t-[#16b1a1]" />
                <p className="mt-4 text-sm font-bold text-gray-400">جارٍ تحميل البيانات…</p>
              </>
            )}
          </div>
        ) : mode === "overview" ? (
          <Overview data={data} summary={summary} editHref={`${base}/edit`} />
        ) : (
          <Editor data={data} summary={summary} mutate={mutate} />
        )}
      </div>
    </div>
  );
}
