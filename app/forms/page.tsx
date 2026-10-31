import type { Metadata } from "next";
import Link from "next/link";
import { fmtDate } from "./model";
import { listForms } from "./store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "النماذج — إدارة النماذج والردود",
  robots: { index: false, follow: false },
};

export default async function FormsPage() {
  let forms = null;
  try {
    forms = await listForms();
  } catch (err) {
    console.error("forms list failed:", err);
  }

  return (
    <div className="min-h-screen bg-[#f3f8f7] pb-24">
      <div className="mx-auto w-[94%] max-w-5xl pt-6 md:pt-10">
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-[#16b1a1] via-[#12a091] to-[#0e8e81] p-6 text-white shadow-xl shadow-teal-900/15 md:p-9">
          <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-wide text-white/70">النماذج</p>
              <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">إدارة النماذج والردود</h1>
              <p className="mt-2 text-sm font-medium text-white/80">
                أنشئ نموذجاً بأسئلة نصية أو اختيار من متعدد، شارك رابطه، وراجع الردود هنا.
              </p>
            </div>
            <Link
              href="/forms/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-[#0e8e81] shadow transition hover:bg-white/90"
            >
              + إنشاء نموذج جديد
            </Link>
          </div>
        </header>

        {forms === null && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
            تعذر الاتصال بقاعدة البيانات. حدّث الصفحة أو تحقق من إعدادات Firebase.
          </div>
        )}

        {forms && forms.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <p className="text-lg font-extrabold text-gray-700">لا توجد نماذج بعد</p>
            <p className="mt-1 text-sm font-medium text-gray-400">ابدأ بإنشاء أول نموذج من الزر أعلاه.</p>
          </div>
        )}

        {forms && forms.length > 0 && (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {forms.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/forms/${f.id}`}
                  className="block h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16b1a1]/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 break-words text-base font-extrabold text-gray-800">{f.title}</h2>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        f.open ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${f.open ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {f.open ? "مفتوح" : "مغلق"}
                    </span>
                  </div>
                  {f.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm font-medium text-gray-500">{f.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-gray-400">
                    <span>
                      <b className="text-[#0e8e81] tabular-nums">{f.responses}</b> {f.responses === 1 ? "ردّ" : "ردود"}
                    </span>
                    <span>
                      <b className="text-gray-600 tabular-nums">{f.questions.length}</b>{" "}
                      {f.questions.length === 1 ? "سؤال" : "أسئلة"}
                    </span>
                    <span className="ms-auto">{fmtDate(f.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
