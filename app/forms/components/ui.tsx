"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

export const inputBase =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 " +
  "placeholder:text-gray-300 outline-none transition focus:border-[#16b1a1] focus:ring-4 focus:ring-[#16b1a1]/10 " +
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#16b1a1] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-900/10 " +
  "transition hover:bg-[#12a091] disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 " +
  "transition hover:border-[#16b1a1] hover:text-[#16b1a1] disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 " +
  "transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50";

/** الغلاف العام للصفحات: خلفية + ترويسة متدرجة بنفس هوية الموقع. */
export function Shell({
  kicker,
  title,
  subtitle,
  actions,
  back,
  children,
  narrow,
}: {
  kicker: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f3f8f7] pb-24">
      <div className={`mx-auto w-[94%] ${narrow ? "max-w-3xl" : "max-w-5xl"} pt-6 md:pt-10`}>
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-[#16b1a1] via-[#12a091] to-[#0e8e81] p-6 text-white shadow-xl shadow-teal-900/15 md:p-9">
          <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              {back && (
                <Link
                  href={back.href}
                  className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-white/70 transition hover:text-white"
                >
                  <span aria-hidden>→</span> {back.label}
                </Link>
              )}
              <p className="text-xs font-bold tracking-wide text-white/70">{kicker}</p>
              <h1 className="mt-1 break-words text-2xl font-extrabold md:text-3xl">{title}</h1>
              {subtitle && <div className="mt-2 text-sm font-medium text-white/80">{subtitle}</div>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6 ${className}`}>
      {children}
    </section>
  );
}

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
    <div className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[13px] font-bold text-gray-600">
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] font-medium text-gray-400">{hint}</span>}
    </div>
  );
}

export function Banner({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const cls = {
    error: "border-red-100 bg-red-50 text-red-700",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    info: "border-amber-100 bg-amber-50 text-amber-800",
  }[kind];
  return <div className={`mt-5 rounded-2xl border p-4 text-sm font-bold ${cls}`}>{children}</div>;
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
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
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#16b1a1]" : "bg-gray-200"}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-0.5" : "right-0.5"}`}
        />
      </span>
    </button>
  );
}

/** نسخ رابط المشاركة. */
export function CopyLink({ url }: { url: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-[#16b1a1]/40 bg-[#16b1a1]/5 p-3">
      <code dir="ltr" className="min-w-0 flex-1 truncate text-left text-xs font-bold text-gray-700">
        {url}
      </code>
      <CopyButton text={url} />
    </div>
  );
}


export function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`${btnPrimary} !px-4 !py-2 text-xs ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* المتصفح لا يسمح بالنسخ */
        }
      }}
    >
      {copied ? "تم النسخ ✓" : "نسخ الرابط"}
    </button>
  );
}
