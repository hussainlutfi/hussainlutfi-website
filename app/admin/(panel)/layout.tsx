import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/adminAuth";
import AdminNav from "./AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** كل صفحات الإدارة: تتطلب جلسة المالك، وكل صفحة تتحقق بنفسها أيضاً. */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const email = await requireAdminPage();
  return (
    <div className="bg-[#f3f8f7]">
      <AdminNav email={email} />
      {children}
    </div>
  );
}
