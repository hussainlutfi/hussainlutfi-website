"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  emptyQuestion,
  validateFormInput,
  sanitizeFormInput,
  type FormDef,
  type FormInput,
  type Question,
} from "../model";
import {
  Banner,
  Card,
  Field,
  Shell,
  Spinner,
  Toggle,
  btnGhost,
  btnPrimary,
  inputBase,
} from "./ui";

export default function FormBuilder({ initial }: { initial?: FormDef }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [askName, setAskName] = useState(initial?.askName ?? true);
  const [questions, setQuestions] = useState<Question[]>(
    initial?.questions.length ? initial.questions : [emptyQuestion("text")]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (id: string, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const move = (idx: number, dir: -1 | 1) =>
    setQuestions((qs) => {
      const to = idx + dir;
      if (to < 0 || to >= qs.length) return qs;
      const next = [...qs];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });

  const remove = (id: string) => setQuestions((qs) => qs.filter((q) => q.id !== id));

  const submit = async () => {
    setError(null);
    const input: FormInput = sanitizeFormInput({ title, description, askName, questions });
    const valid = validateFormInput(input);
    if (!valid.ok) {
      setError(valid.error);
      return;
    }
    const dropped = questions.length - input.questions.length;
    if (dropped > 0) {
      setError("هناك أسئلة بلا عنوان أو بلا خيارات — أكملها أو احذفها.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(initial ? `/api/forms/${initial.id}` : "/api/forms", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "تعذر الحفظ");
      router.push(`/admin/forms/${body.form.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error && err.message !== "database_unavailable" ? err.message : "تعذر الاتصال بقاعدة البيانات.");
      setSaving(false);
    }
  };

  return (
    <Shell
      narrow
      kicker="النماذج"
      title={initial ? "تعديل النموذج" : "نموذج جديد"}
      subtitle="أضف الأسئلة ثم احفظ، وستحصل على رابط للمشاركة."
      back={{ href: initial ? `/admin/forms/${initial.id}` : "/admin/forms", label: initial ? "رجوع إلى النموذج" : "كل النماذج" }}
    >
      <Card className="mt-6">
        <div className="space-y-4">
          <Field label="عنوان النموذج" required>
            <input
              className={`${inputBase} text-base font-bold`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: استبيان رأي المشاركين"
              autoFocus={!initial}
            />
          </Field>
          <Field label="وصف مختصر" hint="يظهر للمُجيب أعلى الأسئلة.">
            <textarea
              rows={3}
              className={`${inputBase} resize-y leading-relaxed`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اختياري"
            />
          </Field>
          <Toggle
            checked={askName}
            onChange={setAskName}
            label="طلب اسم المُجيب"
            hint="يظهر حقل اسم اختياري أعلى النموذج."
          />
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {questions.map((q, idx) => (
          <QuestionEditor
            key={q.id}
            q={q}
            index={idx}
            total={questions.length}
            onChange={(patch) => update(q.id, patch)}
            onMove={(dir) => move(idx, dir)}
            onRemove={() => remove(q.id)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btnGhost} onClick={() => setQuestions((qs) => [...qs, emptyQuestion("text")])}>
          + سؤال نصي
        </button>
        <button type="button" className={btnGhost} onClick={() => setQuestions((qs) => [...qs, emptyQuestion("choice")])}>
          + اختيار من متعدد
        </button>
      </div>

      {error && <Banner kind="error">{error}</Banner>}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className={btnGhost} onClick={() => router.back()} disabled={saving}>
          إلغاء
        </button>
        <button type="button" className={btnPrimary} onClick={submit} disabled={saving}>
          {saving && <Spinner />}
          {initial ? "حفظ التعديلات" : "إنشاء النموذج"}
        </button>
      </div>
    </Shell>
  );
}

function QuestionEditor({
  q,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  q: Question;
  index: number;
  total: number;
  onChange: (patch: Partial<Question>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const setOption = (i: number, v: string) =>
    onChange({ options: q.options.map((o, j) => (j === i ? v : o)) });

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="rounded-full bg-[#16b1a1]/10 px-3 py-1 text-xs font-extrabold text-[#0e8e81]">
          سؤال {index + 1} · {q.type === "text" ? "نص منسّق" : "اختيار من متعدد"}
        </span>
        <div className="flex items-center gap-1">
          <IconBtn label="تحريك لأعلى" onClick={() => onMove(-1)} disabled={index === 0}>↑</IconBtn>
          <IconBtn label="تحريك لأسفل" onClick={() => onMove(1)} disabled={index === total - 1}>↓</IconBtn>
          <IconBtn label="حذف السؤال" onClick={onRemove} danger>✕</IconBtn>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <Field label="نص السؤال" required>
          <input
            className={`${inputBase} font-bold`}
            value={q.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={q.type === "text" ? "مثال: ما رأيك في الفعالية؟" : "مثال: كيف تقيّم التنظيم؟"}
          />
        </Field>

        {q.type === "choice" && (
          <Field label="الخيارات" required>
            <div className="space-y-2">
              {q.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-gray-300" />
                  <input
                    className={inputBase}
                    value={o}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={`الخيار ${i + 1}`}
                  />
                  <IconBtn
                    label="حذف الخيار"
                    disabled={q.options.length <= 1}
                    onClick={() => onChange({ options: q.options.filter((_, j) => j !== i) })}
                  >
                    ✕
                  </IconBtn>
                </div>
              ))}
              <button
                type="button"
                className="text-xs font-bold text-[#16b1a1] hover:underline"
                onClick={() => onChange({ options: [...q.options, ""] })}
              >
                + إضافة خيار
              </button>
            </div>
          </Field>
        )}

        <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-4">
          <Check checked={q.required} onChange={(v) => onChange({ required: v })} label="إجابة مطلوبة" />
          {q.type === "choice" && (
            <Check checked={q.multiple} onChange={(v) => onChange({ multiple: v })} label="السماح باختيار أكثر من خيار" />
          )}
        </div>
      </div>
    </Card>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-gray-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-[#16b1a1]"
      />
      {label}
    </label>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold transition disabled:opacity-30 ${
        danger ? "text-red-500 hover:bg-red-50" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
