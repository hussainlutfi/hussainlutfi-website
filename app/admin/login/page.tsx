import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/adminAuth";
import LoginCard from "./LoginCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تسجيل الدخول — لوحة الإدارة",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdminEmail()) redirect("/admin");
  return (
    <div className="grid min-h-[80vh] place-items-center bg-[#f3f8f7] px-4 py-16">
      <LoginCard />
    </div>
  );
}
