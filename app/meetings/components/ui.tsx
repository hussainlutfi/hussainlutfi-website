"use client";

import type { ReactNode } from "react";

export const inputBase =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 " +
  "placeholder:text-gray-300 outline-none transition focus:border-[#16b1a1] focus:ring-4 focus:ring-[#16b1a1]/10 " +
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[13px] font-bold text-gray-600">
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] font-medium text-gray-400">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onValue,
  placeholder = "",
  type = "text",
  dir,
  className = "",
  disabled,
  autoFocus,
}: {
  value: string;
  onValue: (v: string) => void;
  placeholder?: string;
  type?: string;
  dir?: "rtl" | "ltr";
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <input
      type={type}
      dir={dir}
      autoFocus={autoFocus}
      disabled={disabled}
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
  rows = 3,
  className = "",
}: {
  value: string;
  onValue: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      rows={rows}
      className={`${inputBase} resize-y leading-relaxed ${className}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onValue(e.target.value)}
    />
  );
}

/** حقل وقت أصلي — يعرض منتقي الوقت الخاص بالجهاز. */
export function TimeInput({
  value,
  onValue,
  className = "",
}: {
  value: string;
  onValue: (v: string) => void;
  className?: string;
}) {
  return (
    <input
      type="time"
      dir="ltr"
      step={300}
      className={`${inputBase} text-center font-bold tabular-nums ${className}`}
      value={value}
      onChange={(e) => onValue(e.target.value)}
    />
  );
}

export function NumberInput({
  value,
  onValue,
  min = 0,
  max = 999,
  suffix,
}: {
  value: number;
  onValue: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex items-stretch gap-1.5">
      <button
        type="button"
        aria-label="إنقاص"
        onClick={() => onValue(clamp(value - 1))}
        className="w-10 shrink-0 rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-500 transition hover:border-[#16b1a1] hover:text-[#16b1a1]"
      >
        −
      </button>
      <div className="relative flex-1">
        <input
          type="number"
          dir="ltr"
          min={min}
          max={max}
          className={`${inputBase} text-center font-bold tabular-nums ${suffix ? "pe-12" : ""}`}
          value={String(value)}
          onChange={(e) => onValue(clamp(Number(e.target.value) || 0))}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] font-bold text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label="زيادة"
        onClick={() => onValue(clamp(value + 1))}
        className="w-10 shrink-0 rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-500 transition hover:border-[#16b1a1] hover:text-[#16b1a1]"
      >
        +
      </button>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-right transition hover:border-gray-200"
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-gray-700">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] font-medium text-gray-400">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#16b1a1]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-0.5" : "right-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function Card({
  title,
  icon,
  action,
  children,
  className = "",
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-gray-800">
            {icon && <span className="text-[#16b1a1]">{icon}</span>}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Spinner({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div
      className={`mx-auto animate-spin rounded-full border-4 border-[#e8f7f5] border-t-[#16b1a1] ${className}`}
    />
  );
}

export function Banner({
  tone,
  children,
  action,
}: {
  tone: "error" | "warn" | "success" | "info";
  children: ReactNode;
  action?: ReactNode;
}) {
  const tones = {
    error: "border-red-100 bg-red-50 text-red-700",
    warn: "border-amber-100 bg-amber-50 text-amber-700",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    info: "border-sky-100 bg-sky-50 text-sky-700",
  } as const;
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-bold ${tones[tone]}`}
    >
      <div className="min-w-0">{children}</div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
      {icon && <div className="mx-auto mb-3 w-fit text-gray-300">{icon}</div>}
      <p className="text-sm font-bold text-gray-500">{title}</p>
      {hint && <p className="mt-1.5 text-xs font-medium text-gray-400">{hint}</p>}
    </div>
  );
}

/** زر ينسخ نصاً ويعرض تأكيداً قصيراً. */
export function CopyButton({
  value,
  label = "نسخ",
  done = "تم النسخ",
  copied,
  onCopy,
  className = "",
}: {
  value: string;
  label?: string;
  done?: string;
  copied: boolean;
  onCopy: (v: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
        copied ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      } ${className}`}
    >
      {copied ? done : label}
    </button>
  );
}
