import type { Metadata } from "next";
import CvForm from "../components/CvForm";
import { LANG_LABELS, type CvLang } from "../model";

/** المسارات الثلاثة المسموح بها فقط — أي مسار آخر يعيد 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }, { lang: "both" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: `${LANG_LABELS[lang as CvLang]} | حسين الزاير`,
    description: "اطلب سيرة ذاتية احترافية — تُحفظ مدخلاتك تلقائياً على جهازك",
  };
}

export default async function CvLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <div className="min-h-screen bg-gray-50/50">
      <CvForm lang={lang as CvLang} />
    </div>
  );
}
