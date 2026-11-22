import type { Metadata } from "next";
import AdminApp from "@/app/meetings/admin/AdminApp";
import { requireAdminPage } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة المواعيد — إدارة الحجوزات والأوقات",
  robots: { index: false, follow: false },
};

export default async function MeetingsAdminPage() {
  await requireAdminPage();
  return <AdminApp />;
}
