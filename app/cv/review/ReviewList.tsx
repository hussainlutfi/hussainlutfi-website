"use client";

import { useState } from "react";
import {
  degreeLabel,
  fmtDate,
  fmtRange,
  isEmptyBi,
  LANG_LABELS,
  type BiText,
  type CvLang,
  type CvRequestDoc,
} from "../model";
import { buildClaudePrompt, buildPlainText, fmtCreatedAt } from "./prompt";

const LANG_BADGE: Record<CvLang, string> = {
  ar: "عربية",
  en: "إنجليزية",
  both: "عربية + إنجليزية",
};

/** زر نسخ مع تأكيد مؤقت. */
function CopyButton({
  label,
  getText,
  accent = false,
}: {
  label: string;
  getText: () => string;
  accent?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // متصفحات قديمة أو سياق غير آمن
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition ${
        copied
          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
          : accent
          ? "bg-[#16b1a1] text-white hover:bg-[#0e8e81]"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {copied ? "✓ تم النسخ" : label}
    </button>
  );
}

/** عرض نص ثنائي اللغة — العربية أولاً ثم الإنجليزية باتجاه معاكس. */
function Bi({ value, strong = false }: { value: BiText; strong?: boolean }) {
  if (isEmptyBi(value)) return <span className="text-gray-300">—</span>;
  const cls = strong ? "font-extrabold text-gray-800" : "text-gray-700";
  return (
    <span className={cls}>
      {value.ar}
      {value.ar && value.en && <span className="mx-1.5 text-gray-300">|</span>}
      {value.en && (
        <span dir="ltr" className="inline-block">
          {value.en}
        </span>
      )}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2.5 text-[13px] font-extrabold text-[#0e8e81]">{children}</h3>;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2 text-[13.5px] leading-relaxed">
      <span className="font-bold text-gray-400">{label}:</span>
      {children}
    </div>
  );
}

function Card({ doc }: { doc: CvRequestDoc }) {
  const [open, setOpen] = useState(false);
  const d = doc.data;

  const counts = [
    d.education.length && `${d.education.length} تعليم`,
    d.experiences.length && `${d.experiences.length} خبرة`,
    d.projects.length && `${d.projects.length} مشروع`,
    d.courses.length && `${d.courses.length} دورة`,
    d.certificates.length && `${d.certificates.length} شهادة`,
    d.skills.length && `${d.skills.length} مهارة`,
  ].filter(Boolean) as string[];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* رأس البطاقة */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-right transition hover:bg-gray-50"
      >
        <div className="min-w-0">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <Bi value={d.name} strong />
            <span className="rounded-full bg-[#16b1a1]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0e8e81]">
              {LANG_BADGE[d.lang]}
            </span>
          </div>
          <div className="text-[13px] text-gray-500">
            <Bi value={d.jobTitle} />
          </div>
        </div>
        <div className="text-left">
          <div className="text-[12px] text-gray-400" suppressHydrationWarning>
            {fmtCreatedAt(doc.createdAt)}
          </div>
          <div className="mt-0.5 text-[11.5px] font-bold text-gray-400">{counts.join(" · ")}</div>
        </div>
      </button>

      {/* أزرار النسخ */}
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-50 px-5 py-2.5">
        <CopyButton accent label="نسخ برومبت Claude" getText={() => buildClaudePrompt(doc)} />
        <CopyButton label="نسخ النص" getText={() => buildPlainText(doc)} />
      </div>

      {/* التفاصيل */}
      {open && (
        <div className="grid gap-6 border-t border-gray-100 px-5 py-5">
          <div>
            <SectionTitle>المعلومات الأساسية</SectionTitle>
            <div className="grid gap-1.5">
              <DetailRow label="نوع الطلب">
                <span className="text-gray-700">{LANG_LABELS[d.lang]}</span>
              </DetailRow>
              <DetailRow label="البريد">
                <a dir="ltr" href={`mailto:${d.email}`} className="text-[#0e8e81] underline underline-offset-2">
                  {d.email}
                </a>
              </DetailRow>
              {d.linkedin && (
                <DetailRow label="LinkedIn">
                  <a dir="ltr" href={d.linkedin} target="_blank" rel="noreferrer" className="break-all text-[#0e8e81] underline underline-offset-2">
                    {d.linkedin}
                  </a>
                </DetailRow>
              )}
              {d.portfolio && (
                <DetailRow label="رابط إضافي">
                  <a dir="ltr" href={d.portfolio} target="_blank" rel="noreferrer" className="break-all text-[#0e8e81] underline underline-offset-2">
                    {d.portfolio}
                  </a>
                </DetailRow>
              )}
            </div>
          </div>

          {d.education.length > 0 && (
            <div>
              <SectionTitle>التعليم</SectionTitle>
              <div className="grid gap-3">
                {d.education.map((e, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 p-3.5">
                    <div className="mb-1 text-[14px]">
                      <Bi value={e.major} strong />
                      {e.degree && (
                        <span className="mr-2 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-gray-500 ring-1 ring-gray-200">
                          {degreeLabel(e.degree, d.lang)}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-1">
                      <DetailRow label="الجهة">
                        <Bi value={e.authority} />
                      </DetailRow>
                      <DetailRow label="الفترة">
                        <span className="text-gray-700">{fmtRange(e.start, e.end, e.present) || "—"}</span>
                      </DetailRow>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {d.experiences.length > 0 && (
            <div>
              <SectionTitle>الخبرات العملية</SectionTitle>
              <div className="grid gap-3">
                {d.experiences.map((e, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 p-3.5">
                    <div className="mb-1 text-[14px]">
                      <Bi value={e.title} strong />
                    </div>
                    <div className="grid gap-1">
                      <DetailRow label="جهة العمل">
                        <Bi value={e.employer} />
                      </DetailRow>
                      <DetailRow label="الفترة">
                        <span className="text-gray-700">{fmtRange(e.start, e.end, e.present) || "—"}</span>
                      </DetailRow>
                    </div>
                    {e.details && (
                      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-[13px] leading-relaxed text-gray-600 ring-1 ring-gray-100">
                        {e.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {d.projects.length > 0 && (
            <div>
              <SectionTitle>المشاريع</SectionTitle>
              <div className="grid gap-3">
                {d.projects.map((p, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 p-3.5">
                    <div className="mb-1 text-[14px]">
                      <Bi value={p.title} strong />
                    </div>
                    <div className="grid gap-1">
                      {!isEmptyBi(p.owner) && (
                        <DetailRow label="الجهة">
                          <Bi value={p.owner} />
                        </DetailRow>
                      )}
                      {fmtRange(p.start, p.end, false) && (
                        <DetailRow label="الفترة">
                          <span className="text-gray-700">{fmtRange(p.start, p.end, false)}</span>
                        </DetailRow>
                      )}
                    </div>
                    {p.details && (
                      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-[13px] leading-relaxed text-gray-600 ring-1 ring-gray-100">
                        {p.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {d.courses.length > 0 && (
            <div>
              <SectionTitle>الدورات التدريبية</SectionTitle>
              <div className="grid gap-3">
                {d.courses.map((c, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 p-3.5">
                    <div className="text-[14px]">
                      <Bi value={c.title} strong />
                    </div>
                    {c.details && (
                      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-3 text-[13px] leading-relaxed text-gray-600 ring-1 ring-gray-100">
                        {c.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {d.certificates.length > 0 && (
            <div>
              <SectionTitle>الشهادات الاحترافية</SectionTitle>
              <div className="grid gap-3">
                {d.certificates.map((c, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 p-3.5">
                    <div className="mb-1 text-[14px]">
                      <Bi value={c.title} strong />
                    </div>
                    <div className="grid gap-1">
                      {!isEmptyBi(c.issuer) && (
                        <DetailRow label="الجهة المانحة">
                          <Bi value={c.issuer} />
                        </DetailRow>
                      )}
                      {fmtDate(c.date) && (
                        <DetailRow label="التاريخ">
                          <span className="text-gray-700">{fmtDate(c.date)}</span>
                        </DetailRow>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {d.skills.length > 0 && (
            <div>
              <SectionTitle>المهارات</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {d.skills.map((s) => (
                  <span key={s} className="rounded-full bg-[#16b1a1]/10 px-3 py-1 text-[12.5px] font-bold text-[#0e8e81]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewList({
  requests,
  failed,
}: {
  requests: CvRequestDoc[];
  failed: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="mb-1 text-2xl font-extrabold text-gray-800">طلبات السير الذاتية</h1>
        <p className="text-sm text-gray-500">
          {failed ? "" : `${requests.length} ${requests.length === 1 ? "طلب" : "طلبات"} — الأحدث أولاً`}
        </p>
      </header>

      {failed && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-bold text-red-600">
          تعذّر الاتصال بقاعدة البيانات — حدّث الصفحة للمحاولة مرة أخرى.
        </div>
      )}

      {!failed && requests.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          لا توجد طلبات بعد.
        </div>
      )}

      <div className="grid gap-4">
        {requests.map((doc) => (
          <Card key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}
