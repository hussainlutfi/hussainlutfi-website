import type { Metadata } from "next";
import AdminApp from "./AdminApp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة المواعيد — إدارة الحجوزات والأوقات",
  robots: { index: false, follow: false },
};

export default function MeetingsAdminPage() {
  return <AdminApp />;
}
