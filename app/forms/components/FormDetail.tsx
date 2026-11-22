"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fmtDate, type FormDef, type FormResponse } from "../model";
import RichText from "./RichText";
import { Banner, Card, CopyLink, Shell, Spinner, btnDanger, btnGhost } from "./ui";

type Tab = "responses" | "summary";

export default function FormDetail({
  form: initialForm,
  responses: initialResponses,
}: {
  form: FormDef;
  responses: FormResponse[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [responses, setResponses] = useState(initialResponses);
  const [tab, setTab] = useState<Tab>("responses");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareUrl, setShareUrl] = useState(`/f/${form.id}`);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/f/${form.id}`);
  }, [form.id]);

  const refresh = async () => {
    setBusy("refresh");
    setError(null);
    try {
      const res = await fetch(`/api/forms/${form.id}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const body: { form: FormDef; responses: FormResponse[] } = await res.json();
      setForm(body.form);
      setResponses(body.responses);
    } catch {
      setError("تعذر تحديث البيانات.");
    } finally {
      setBusy(null);
    }
  };

  const toggleOpen = async () => {
    setBusy("open");
    setError(null);
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open: !form.open }),
      });
      if (!res.ok) throw new Error();
      setForm((f) => ({ ...f, open: !f.open }));
    } catch {
      setError("تعذر تغيير حالة النموذج.");
    } finally {
      setBusy(null);
    }
  };

  const removeForm = async () => {
    setBusy("delete");
    setError(null);
    try {
      const res = await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/admin/forms");
      router.refresh();
    } catch {
      setError("تعذر حذف النموذج.");
      setBusy(null);
    }
  };

  const removeResponse = async (rid: string) => {
    setBusy(rid);
    setError(null);
    try {
      const res = await fetch(`/api/forms/${form.id}/responses/${rid}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setResponses((rs) => rs.filter((r) => r.id !== rid));
      setForm((f) => ({ ...f, responses: Math.max(0, f.responses - 1) }));
    } catch {
      setError("تعذر حذف الردّ.");
    } finally {
      setBusy(null);
    }
  };

  const choiceStats = useMemo(() => {
    const out: Record<string, Record<string, number>> = {};
    for (const q of form.questions) {
      if (q.type !== "choice") continue;
      const counts: Record<string, number> = Object.fromEntries(q.options.map((o) => [o, 0]));
      for (const r of responses) {
        const a = r.answers[q.id];
        if (Array.isArray(a)) for (const o of a) if (o in counts) counts[o]++;
      }
      out[q.id] = counts;
    }
    return out;
  }, [form.questions, responses]);

  return (
    <Shell
      kicker="النماذج"
      title={form.title}
      back={{ href: "/admin/forms", label: "كل النماذج" }}
      subtitle={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            <b className="tabular-nums">{responses.length}</b> {responses.length === 1 ? "ردّ" : "ردود"}
          </span>
          <span>
            <b className="tabular-nums">{form.questions.length}</b> {form.questions.length === 1 ? "سؤال" : "أسئلة"}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${form.open ? "bg-white/20" : "bg-black/20"}`}>
            <span className={`h-2 w-2 rounded-full ${form.open ? "bg-emerald-300" : "bg-red-300"}`} />
            {form.open ? "يستقبل الردود" : "مغلق"}
          </span>
        </div>
      }
      actions={
        <>
          <button
            type="button"
            onClick={refresh}
            disabled={busy !== null}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white/85 transition hover:bg-white/25 disabled:opacity-50"
            aria-label="تحديث"
            title="تحديث"
          >
            {busy === "refresh" ? <Spinner /> : "↻"}
          </button>
          <Link href={`/admin/forms/${form.id}/edit`} className="rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/25">
            تعديل
          </Link>
          <button
            type="button"
            onClick={toggleOpen}
            disabled={busy !== null}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0e8e81] shadow transition hover:bg-white/90 disabled:opacity-50"
          >
            {form.open ? "إغلاق الردود" : "فتح الردود"}
          </button>
        </>
      }
    >
      {/* رابط المشاركة */}
      <Card className="mt-6">
        <h2 className="text-sm font-extrabold text-gray-700">رابط المشاركة</h2>
        <p className="mb-3 mt-1 text-xs font-medium text-gray-400">أرسل هذا الرابط لمن تريد أن يجيب على النموذج.</p>
        <CopyLink url={shareUrl} />
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`/f/${form.id}`} target="_blank" rel="noreferrer" className={`${btnGhost} !py-2 text-xs`}>
            فتح صفحة الإجابة ↗
          </a>
          {form.description && <p className="w-full whitespace-pre-line pt-1 text-sm text-gray-500">{form.description}</p>}
        </div>
      </Card>

      {error && <Banner kind="error">{error}</Banner>}

      {/* التبويبات */}
      <div className="mt-6 flex gap-1 rounded-2xl bg-white p-1 shadow-sm">
        {(
          [
            ["responses", `الردود (${responses.length})`],
            ["summary", "ملخص الأسئلة"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              tab === key ? "bg-[#16b1a1] text-white shadow" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="mt-4 space-y-4">
          {form.questions.map((q, i) => (
            <Card key={q.id}>
              <h3 className="flex items-start gap-2 text-base font-extrabold text-gray-800">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#16b1a1]/10 text-xs text-[#0e8e81]">{i + 1}</span>
                <span>
                  {q.title}
                  {q.required && <span className="ms-1 text-red-400">*</span>}
                </span>
              </h3>
              <p className="mt-1 ms-8 text-[11px] font-bold text-gray-400">
                {q.type === "text" ? "إجابة نصية منسّقة" : q.multiple ? "اختيار متعدد" : "اختيار واحد"}
              </p>
              {q.type === "choice" && (
                <div className="mt-4 ms-8 space-y-2">
                  {q.options.map((o) => {
                    const n = choiceStats[q.id]?.[o] ?? 0;
                    const pct = responses.length ? Math.round((n / responses.length) * 100) : 0;
                    return (
                      <div key={o}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-bold text-gray-700">{o}</span>
                          <span className="text-xs font-bold text-gray-500 tabular-nums">
                            {n} · {pct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-[#16b1a1] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {q.type === "text" && (
                <p className="mt-3 ms-8 text-sm font-medium text-gray-500">
                  أجاب عليه {responses.filter((r) => typeof r.answers[q.id] === "string").length} من {responses.length}.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "responses" && (
        <div className="mt-4 space-y-4">
          {responses.length === 0 && (
            <Card className="text-center">
              <p className="text-base font-extrabold text-gray-700">لا توجد ردود بعد</p>
              <p className="mt-1 text-sm font-medium text-gray-400">شارك الرابط أعلاه وستظهر الردود هنا.</p>
            </Card>
          )}
          {responses.map((r, idx) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-base font-extrabold text-gray-800">
                    {r.name || <span className="text-gray-400">مُجيب بلا اسم</span>}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold text-gray-400">
                    ردّ #{responses.length - idx} · {fmtDate(r.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => removeResponse(r.id)}
                  className="text-xs font-bold text-red-400 transition hover:text-red-600 disabled:opacity-40"
                >
                  {busy === r.id ? "جارٍ الحذف…" : "حذف الردّ"}
                </button>
              </div>
              <div className="mt-4 space-y-5">
                {form.questions.map((q) => {
                  const a = r.answers[q.id];
                  return (
                    <div key={q.id}>
                      <p className="text-[13px] font-extrabold text-gray-500">{q.title}</p>
                      <div className="mt-1.5">
                        {a === undefined ? (
                          <span className="text-sm text-gray-300">— لم يُجب —</span>
                        ) : Array.isArray(a) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {a.map((o) => (
                              <span key={o} className="rounded-full bg-[#16b1a1]/10 px-3 py-1 text-xs font-bold text-[#0e8e81]">
                                {o}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <RichText html={a} className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-800" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* حذف النموذج */}
      <div className="mt-10 rounded-2xl border border-red-100 bg-white p-5">
        <h3 className="text-sm font-extrabold text-red-600">حذف النموذج</h3>
        <p className="mt-1 text-xs font-medium text-gray-400">يحذف النموذج وكل ردوده نهائياً ولا يمكن التراجع.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {!confirmDelete ? (
            <button type="button" className={btnDanger} onClick={() => setConfirmDelete(true)}>
              حذف النموذج
            </button>
          ) : (
            <>
              <button type="button" className={btnDanger} onClick={removeForm} disabled={busy !== null}>
                {busy === "delete" && <Spinner />} نعم، احذف نهائياً
              </button>
              <button type="button" className={btnGhost} onClick={() => setConfirmDelete(false)}>
                إلغاء
              </button>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
