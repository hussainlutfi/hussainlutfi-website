import type { Metadata } from "next";
import { Banner, Shell } from "@/app/forms/components/ui";
import Results from "@/app/zawaj/components/Results";
import { listInquiries } from "@/app/zawaj/store";
import { requireAdminPage } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مراجعة الإجابات",
  robots: { index: false, follow: false },
};

export default async function ZawajResultsPage() {
  await requireAdminPage();
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
