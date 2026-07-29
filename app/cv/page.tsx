import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "طلب سيرة ذاتية | حسين الزاير",
  description: "اطلب سيرة ذاتية احترافية بالعربية أو الإنجليزية أو كلتيهما",
};

const LANG_OPTIONS = [
  { slug: "ar", title: "سيرة ذاتية بالعربية", desc: "المحتوى والتواريخ بالعربية والتقويم الهجري" },
  { slug: "en", title: "سيرة ذاتية بالإنجليزية", desc: "المحتوى بالإنجليزية والتواريخ بالتقويم الميلادي" },
  {
    slug: "both",
    title: "سيرة ذاتية بالعربية والإنجليزية",
    desc: "نسختان كاملتان — تُدخل الأسماء والعناوين باللغتين والتواريخ بالتقويمين",
  },
];

export default function CvChooserPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-extrabold text-gray-800">طلب سيرة ذاتية</h1>
          <p className="leading-relaxed text-gray-500">
            عبّئ بياناتك بدقة وسيتم إعداد سيرة ذاتية احترافية لك. ابدأ باختيار لغة السيرة المطلوبة —
            وتُحفظ مدخلاتك تلقائياً على جهازك حتى لو أغلقت الصفحة.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          {LANG_OPTIONS.map((opt) => (
            <Link
              key={opt.slug}
              href={`/cv/${opt.slug}`}
              className="group rounded-2xl border-2 border-gray-200 bg-white p-6 text-right shadow-sm transition hover:border-[#16b1a1] hover:shadow-md"
            >
              <div className="mb-2 text-base font-extrabold text-gray-800 transition group-hover:text-[#0e8e81]">
                {opt.title}
              </div>
              <div className="text-[12.5px] leading-relaxed text-gray-500">{opt.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
