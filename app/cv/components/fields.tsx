"use client";

import { useState } from "react";
import {
  GREG_MONTHS,
  HIJRI_MONTHS,
  needsAr,
  needsEn,
  needsGreg,
  needsHijri,
  type BiText,
  type CvDate,
  type CvLang,
  type YM,
} from "../model";

export const inputBase =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 " +
  "placeholder:text-gray-300 outline-none transition focus:border-[#16b1a1] focus:ring-4 focus:ring-[#16b1a1]/10";

/** عنوان حقل مع نجمة الإلزام. */
export function FieldLabel({ text, required = false }: { text: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[13px] font-bold text-gray-600">
      {text}
      {required && <span className="mr-1 text-red-500">*</span>}
    </label>
  );
}

export function TextInput({
  value,
  onValue,
  placeholder = "",
  dir,
  type = "text",
  className = "",
}: {
  value: string;
  onValue: (v: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      dir={dir}
      className={`${inputBase} ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onValue(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onValue,
  placeholder = "",
  rows = 5,
}: {
  value: string;
  onValue: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      className={`${inputBase} resize-y leading-relaxed`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onValue(e.target.value)}
    />
  );
}

/**
 * حقل نصي ثنائي اللغة: يعرض إدخالاً بالعربية و/أو بالإنجليزية حسب لغة السيرة المطلوبة.
 */
export function BiTextInput({
  lang,
  label,
  value,
  onValue,
  required = false,
  placeholderAr = "",
  placeholderEn = "",
}: {
  lang: CvLang;
  label: string;
  value: BiText;
  onValue: (v: BiText) => void;
  required?: boolean;
  placeholderAr?: string;
  placeholderEn?: string;
}) {
  const both = lang === "both";
  return (
    <div>
      <FieldLabel text={label} required={required} />
      <div className={both ? "grid gap-2 sm:grid-cols-2" : ""}>
        {needsAr(lang) && (
          <TextInput
            value={value.ar}
            onValue={(ar) => onValue({ ...value, ar })}
            placeholder={both ? placeholderAr || "بالعربية" : placeholderAr}
          />
        )}
        {needsEn(lang) && (
          <TextInput
            dir="ltr"
            value={value.en}
            onValue={(en) => onValue({ ...value, en })}
            placeholder={both ? placeholderEn || "In English" : placeholderEn || "In English"}
          />
        )}
      </div>
    </div>
  );
}

/** إدخال شهر وسنة لتقويم واحد. */
function MonthYearInput({
  kind,
  value,
  onValue,
}: {
  kind: "hijri" | "greg";
  value: YM;
  onValue: (v: YM) => void;
}) {
  const months = kind === "hijri" ? HIJRI_MONTHS : GREG_MONTHS;
  return (
    <div className="flex flex-col gap-2">
      <select
        className={`${inputBase} cursor-pointer appearance-none`}
        value={value.month}
        onChange={(e) => onValue({ ...value, month: Number(e.target.value) })}
      >
        <option value={0}>الشهر</option>
        {months.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
      <input
        type="text"
        inputMode="numeric"
        dir="ltr"
        className={`${inputBase} text-center tabular-nums`}
        placeholder={kind === "hijri" ? "السنة — 1447" : "السنة — 2026"}
        value={value.year}
        onChange={(e) => onValue({ ...value, year: e.target.value })}
      />
    </div>
  );
}

/**
 * إدخال تاريخ كامل حسب لغة السيرة: هجري للعربية، ميلادي للإنجليزية، وكلاهما معاً.
 */
export function CvDateInput({
  lang,
  label,
  value,
  onValue,
  required = false,
}: {
  lang: CvLang;
  label: string;
  value: CvDate;
  onValue: (v: CvDate) => void;
  required?: boolean;
}) {
  const both = lang === "both";
  const calBox = "rounded-xl border border-gray-200 bg-white p-3";
  const calTitle = "mb-2 text-[11.5px] font-extrabold text-[#0e8e81]";
  return (
    <div>
      <FieldLabel text={label} required={required} />
      <div className={both ? "grid gap-2.5 sm:grid-cols-2" : "grid gap-2"}>
        {needsHijri(lang) && (
          <div className={both ? calBox : ""}>
            {both && (
              <div className={calTitle}>
                بالتقويم الهجري <span className="font-bold text-gray-400">— مثال: صفر ١٤٤٧</span>
              </div>
            )}
            <MonthYearInput kind="hijri" value={value.hijri} onValue={(hijri) => onValue({ ...value, hijri })} />
          </div>
        )}
        {needsGreg(lang) && (
          <div className={both ? calBox : ""}>
            {both && (
              <div className={calTitle}>
                بالتقويم الميلادي <span dir="ltr" className="font-bold text-gray-400">— July 2026</span>
              </div>
            )}
            <MonthYearInput kind="greg" value={value.greg} onValue={(greg) => onValue({ ...value, greg })} />
          </div>
        )}
      </div>
    </div>
  );
}

/** زوج أزرار (راديو) لاختيار «بتاريخ محدد» أو «حتى الآن». */
export function PresentToggle({
  present,
  onChange,
  presentLabel,
  dateLabel,
}: {
  present: boolean;
  onChange: (v: boolean) => void;
  presentLabel: string;
  dateLabel: string;
}) {
  const btn = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-[12px] font-bold transition ${
      active
        ? "bg-[#16b1a1] text-white shadow-sm"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`;
  return (
    <div className="flex gap-2">
      <button type="button" className={btn(!present)} onClick={() => onChange(false)}>
        {dateLabel}
      </button>
      <button type="button" className={btn(present)} onClick={() => onChange(true)}>
        {presentLabel}
      </button>
    </div>
  );
}

/** قسم رئيسي في النموذج. */
export function Section({
  title,
  required = false,
  hint,
  children,
}: {
  title: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-gray-800">
          {title}
          {required ? (
            <span className="mr-1 text-red-500">*</span>
          ) : (
            <span className="mr-2 text-[11px] font-bold text-gray-400">(اختياري)</span>
          )}
        </h2>
        {hint && <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{hint}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

/** بطاقة عنصر داخل قسم متعدد الإدخالات، مع زر حذف. */
export function EntryCard({
  index,
  label,
  onRemove,
  removable,
  children,
}: {
  index: number;
  label: string;
  onRemove: () => void;
  removable: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] font-extrabold text-[#0e8e81]">
          {label} {index + 1}
        </span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2 py-1 text-[12px] font-bold text-red-500 transition hover:bg-red-50"
          >
            حذف
          </button>
        )}
      </div>
      <div className="grid gap-3.5">{children}</div>
    </div>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border-2 border-dashed border-[#16b1a1]/40 px-4 py-2.5 text-sm font-bold text-[#0e8e81] transition hover:border-[#16b1a1] hover:bg-[#16b1a1]/5"
    >
      + {label}
    </button>
  );
}

/** مربع تنبيه إرشادي أعلى حقول التفاصيل. */
export function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

/** إدخال المهارات كرقائق (chips) تُضاف بزر Enter أو الفاصلة. */
export function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const parts = draft
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !skills.includes(s));
    if (parts.length) onChange([...skills, ...parts]);
    setDraft("");
  };

  return (
    <div>
      {skills.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#16b1a1]/10 px-3 py-1 text-[12.5px] font-bold text-[#0e8e81]"
            >
              {s}
              <button
                type="button"
                aria-label={`حذف ${s}`}
                onClick={() => onChange(skills.filter((x) => x !== s))}
                className="text-[#0e8e81]/60 transition hover:text-red-500"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          className={inputBase}
          placeholder="اكتب مهارة ثم اضغط Enter — مثال: Python، إدارة المشاريع، التصميم"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
        />
        <button
          type="button"
          onClick={commit}
          className="shrink-0 rounded-xl bg-[#16b1a1] px-4 text-sm font-bold text-white transition hover:bg-[#0e8e81]"
        >
          إضافة
        </button>
      </div>
    </div>
  );
}
