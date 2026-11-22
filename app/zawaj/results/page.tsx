import type { Metadata } from "next";
import { Banner, Shell } from "@/app/forms/components/ui";
import Results from "../components/Results";
import { listInquiries } from "../store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مراجعة الإجابات",
  robots: { index: false, follow: false },
};

export default async function ZawajResultsPage() {
  try {
    return <Results initial={await listInquiries()} />;
  } catch (err) {
    console.error("zawaj list failed:", err);
    return (
      <Shell kicker="مراجعة سرّية" title="إجابات السؤال عن المرشّحات">
        <Banner kind="error">تعذر الاتصال بقاعدة البيانات. حدّث الصفحة أو تحقق من إعدادات Firebase.</Banner>
      </Shell>
    );
  }
}
