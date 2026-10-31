"use client";

import { useState } from "react";
import { isHtmlEmpty, type Answer, type FormDef } from "../model";
import RichTextEditor from "./RichTextEditor";
import { Banner, Card, Spinner, btnPrimary, inputBase } from "./ui";

/** صفحة الإجابة العامة — تُفتح من رابط المشاركة. */
export default function FillForm({ form }: { form: FormDef }) {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (qid: string, v: Answer) => setAnswers((a) => ({ ...a, [qid]: v }));

  const toggleChoice = (qid: string, option: string, multiple: boolean) => {
    const cur = answers[qid];
    const list = Array.isArray(cur) ? cur : [];
    if (!multiple) return set(qid, [option]);
    set(qid, list.includes(option) ? list.filter((o) => o !== option) : [...list, option]);
  };

  const submit = async () => {
    setError(null);
    for (const q of form.questions) {
      if (!q.required) continue;
      const v = answers[q.id];
      const empty = q.type === "text" ? isHtmlEmpty(typeof v === "string" ? v : "") : !Array.isArray(v) || !v.length;
      if (empty) {
        setError(`السؤال «${q.title}» مطلوب.`);
        document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    setSending(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, answers }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "تعذر الإرسال");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error && err.message !== "database_unavailable" ? err.message : "تعذر الاتصال بالخادم، حاول مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f8f7] pb-24">
      <div className="mx-auto w-[94%] max-w-2xl pt-6 md:pt-10">
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-[#16b1a1] via-[#12a091] to-[#0e8e81] p-6 text-white shadow-xl shadow-teal-900/15 md:p-9">
          <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <h1 className="relative break-words text-2xl font-extrabold md:text-3xl">{form.title}</h1>
          {form.description && (
            <p className="relative mt-3 whitespace-pre-line text-sm font-medium leading-relaxed text-white/85">
              {form.description}
            </p>
          )}
        </header>

        {done ? (
          <Card className="mt-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</div>
            <h2 className="mt-4 text-xl font-extrabold text-gray-800">شكراً لك، تم استلام ردّك</h2>
            <p className="mt-2 text-sm font-medium text-gray-500">يمكنك إغلاق هذه الصفحة الآن.</p>
          </Card>
        ) : !form.open ? (
          <Banner kind="info">هذا النموذج لا يستقبل ردوداً حالياً.</Banner>
        ) : (
          <>
            {form.askName && (
              <Card className="mt-6">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-gray-600">الاسم (اختياري)</span>
                  <input
                    className={inputBase}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك"
                    maxLength={120}
                  />
                </label>
              </Card>
            )}

            <div className="mt-6 space-y-4">
              {form.questions.map((q, i) => (
                <Card key={q.id}>
                  <div id={`q-${q.id}`} className="scroll-mt-24">
                    <h2 className="flex items-start gap-2 text-base font-extrabold text-gray-800">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#16b1a1]/10 text-xs text-[#0e8e81]">
                        {i + 1}
                      </span>
                      <span>
                        {q.title}
                        {q.required && <span className="ms-1 text-red-400">*</span>}
                      </span>
                    </h2>
                    <div className="mt-4">
                      {q.type === "text" ? (
                        <RichTextEditor
                          value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                          onChange={(html) => set(q.id, html)}
                        />
                      ) : (
                        <div className="space-y-2">
                          {q.multiple && (
                            <p className="text-[11px] font-bold text-gray-400">يمكنك اختيار أكثر من خيار</p>
                          )}
                          {q.options.map((o) => {
                            const picked = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(o);
                            return (
                              <label
                                key={o}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                  picked
                                    ? "border-[#16b1a1] bg-[#16b1a1]/5 text-[#0e8e81]"
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type={q.multiple ? "checkbox" : "radio"}
                                  name={`q-${q.id}`}
                                  checked={picked}
                                  onChange={() => toggleChoice(q.id, o, q.multiple)}
                                  className="h-4 w-4 accent-[#16b1a1]"
                                />
                                {o}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {error && <Banner kind="error">{error}</Banner>}

            <div className="mt-8 flex justify-end">
              <button type="button" className={`${btnPrimary} !px-8 !py-3 text-base`} onClick={submit} disabled={sending}>
                {sending && <Spinner />}
                إرسال
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
