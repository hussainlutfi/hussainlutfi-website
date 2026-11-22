"use client";

import { useState } from "react";
import { Banner, Card, Field, Spinner, btnGhost, btnPrimary, inputBase } from "@/app/forms/components/ui";
import { INTRO, SECTIONS, validateInput, type Item } from "../model";

const toArabicDigits = (n: number) => n.toLocaleString("ar-SA");

/** صفحة الاستبيان: اسم المرشّحة واسم المُجيبة ثم الأسئلة. */
export default function InquiryForm() {
  const [candidate, setCandidate] = useState("");
  const [submitter, setSubmitter] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));

  const submit = async () => {
    setError(null);
    const input = { candidate: candidate.trim(), submitter: submitter.trim(), answers };
    const invalid = validateInput(input);
    if (invalid) {
      setError(invalid);
      const target = !input.candidate ? "candidate" : !input.submitter ? "submitter" : firstMissing();
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/zawaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "تعذر الإرسال");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "database_unavailable"
          ? err.message
          : "تعذر الاتصال بالخادم، حاولي مرة أخرى."
      );
    } finally {
      setSending(false);
    }
  };

  const firstMissing = () => {
    for (const s of SECTIONS)
      for (const it of s.items) if (it.kind === "choice" && it.required && !answers[it.id]) return `q-${it.id}`;
    return "";
  };

  const reset = () => {
    setAnswers({});
    setCandidate("");
    setDone(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f8f7] pb-24">
      <div className="mx-auto w-[94%] max-w-2xl pt-6 md:pt-10">
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-[#16b1a1] via-[#12a091] to-[#0e8e81] p-6 text-white shadow-xl shadow-teal-900/15 md:p-9">
          <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <p className="relative text-xs font-bold tracking-wide text-white/70">استبيان سرّي</p>
          <h1 className="relative mt-1 text-2xl font-extrabold md:text-3xl">استبيان للتعرّف على الشخصية</h1>
          <p className="relative mt-3 text-sm font-medium leading-loose text-white/90">{INTRO}</p>
        </header>

        {done ? (
          <Card className="mt-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</div>
            <h2 className="mt-4 text-xl font-extrabold text-gray-800">جزاكِ الله خيراً، وصلت إجاباتكِ</h2>
            <p className="mt-2 text-sm font-medium text-gray-500">ستبقى إجاباتكِ سرّاً. يمكنكِ إغلاق الصفحة الآن.</p>
            <button type="button" className={`${btnGhost} mt-5`} onClick={reset}>
              الإجابة عن مرشّحة أخرى
            </button>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div id="candidate" className="scroll-mt-24">
                  <Field label="اسم المرشّحة" required>
                    <input
                      className={inputBase}
                      value={candidate}
                      onChange={(e) => setCandidate(e.target.value)}
                      placeholder="الاسم الكامل"
                      maxLength={120}
                    />
                  </Field>
                </div>
                <div id="submitter" className="scroll-mt-24">
                  <Field label="اسمكِ" required hint="لا يظهر اسمكِ إلا لصاحب السؤال.">
                    <input
                      className={inputBase}
                      value={submitter}
                      onChange={(e) => setSubmitter(e.target.value)}
                      placeholder="اسمكِ وصلتكِ بها إن أحببتِ"
                      maxLength={120}
                    />
                  </Field>
                </div>
              </div>
            </Card>

            <div className="mt-6 space-y-5">
              {SECTIONS.map((s, i) => (
                <Card key={s.id}>
                  <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-gray-800">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#16b1a1]/10 text-sm text-[#0e8e81]">
                      {toArabicDigits(i + 1)}
                    </span>
                    {s.title}
                  </h2>
                  {s.lead && <p className="mt-2 text-sm font-medium text-gray-500">{s.lead}</p>}
                  <div className="mt-4 space-y-6">
                    {s.items.map((it, j) => (
                      <ItemInput
                        key={it.id}
                        item={it}
                        followUp={j > 0 && s.items[0].kind === "choice"}
                        value={answers[it.id] ?? ""}
                        onChange={(v) => set(it.id, v)}
                      />
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {error && <Banner kind="error">{error}</Banner>}

            <div className="mt-8 flex justify-end">
              <button type="button" className={`${btnPrimary} !px-8 !py-3 text-base`} onClick={submit} disabled={sending}>
                {sending && <Spinner />}
                إرسال الإجابات
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ItemInput({
  item,
  followUp,
  value,
  onChange,
}: {
  item: Item;
  followUp: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = (
    <p className={`font-bold ${followUp ? "text-sm text-gray-600" : "text-base text-gray-800"}`}>
      {item.label}
      {item.kind === "choice" && item.required && <span className="ms-1 text-red-400">*</span>}
    </p>
  );

  return (
    <div id={`q-${item.id}`} className={`scroll-mt-24 ${followUp ? "border-s-2 border-[#16b1a1]/25 ps-4" : ""}`}>
      {followUp && <p className="mb-1 text-[11px] font-bold text-[#0e8e81]/70">للتوضيح</p>}
      {label}
      <div className="mt-3">
        {item.kind === "text" ? (
          <textarea
            className={`${inputBase} min-h-28 resize-y leading-relaxed`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={item.placeholder ?? "اكتبي ما تعرفينه…"}
            maxLength={5000}
          />
        ) : (
          <div className={followUp ? "flex flex-wrap gap-2" : "space-y-2"}>
            {item.options.map((o) => {
              const picked = value === o;
              return (
                <label
                  key={o}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                    picked
                      ? "border-[#16b1a1] bg-[#16b1a1]/5 text-[#0e8e81]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${item.id}`}
                    checked={picked}
                    onChange={() => onChange(o)}
                    onClick={() => !item.required && picked && onChange("")}
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
  );
}
