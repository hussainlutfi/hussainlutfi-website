"use client";

import { useEffect, useRef, useState } from "react";
import { fmtMoney, parseNum } from "../model";

export const inputBase =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 " +
  "placeholder:text-gray-300 outline-none transition focus:border-[#16b1a1] focus:ring-4 focus:ring-[#16b1a1]/10";

/** حقل رقمي يقبل الأرقام العربية والإنجليزية، القيمة الفارغة = غير مُدخل. */
export function NumInput({
  value,
  onValue,
  placeholder = "0",
  className = "",
}: {
  value: number | null;
  onValue: (v: number | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(value === null ? "" : String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(value === null ? "" : String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      dir="ltr"
      className={`${inputBase} text-center font-bold tabular-nums ${className}`}
      value={text}
      placeholder={placeholder}
      onFocus={() => (focused.current = true)}
      onBlur={() => {
        focused.current = false;
        const n = parseNum(text);
        setText(n === null ? "" : String(n));
      }}
      onChange={(e) => {
        setText(e.target.value);
        onValue(parseNum(e.target.value));
      }}
    />
  );
}

export function TextInput({
  value,
  onValue,
  placeholder = "",
  className = "",
}: {
  value: string;
  onValue: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      className={`${inputBase} ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onValue(e.target.value)}
    />
  );
}

/** مبلغ منسّق مع رمز العملة. */
export function Money({
  value,
  currency,
  signed = false,
  className = "",
}: {
  value: number;
  currency: string;
  signed?: boolean;
  className?: string;
}) {
  const color = signed ? (value >= 0 ? "text-emerald-600" : "text-red-600") : "";
  const sign = signed && value > 0 ? "+" : "";
  return (
    <span dir="ltr" className={`whitespace-nowrap tabular-nums ${color} ${className}`}>
      {sign}
      {fmtMoney(value)} <span className="text-[0.72em] font-medium opacity-60">{currency}</span>
    </span>
  );
}

/** شارة الفرق بين التقدير والفعلي (وفر / زيادة). */
export function VarianceChip({ variance }: { variance: number | null }) {
  if (variance === null) return null;
  if (variance === 0)
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
        مطابق للتقدير
      </span>
    );
  const saved = variance > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        saved ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      }`}
    >
      {saved ? "وفر" : "زيادة"}
      <span dir="ltr" className="tabular-nums">
        {fmtMoney(Math.abs(variance))}
      </span>
    </span>
  );
}
