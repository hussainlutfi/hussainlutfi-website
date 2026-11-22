"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export const ADMIN_SECTIONS = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/cv", label: "طلبات السيرة الذاتية" },
  { href: "/admin/meetings", label: "المواعيد" },
  { href: "/admin/forms", label: "النماذج" },
  { href: "/admin/zawaj", label: "السؤال عن المرشّحات" },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const logout = async () => {
    setLeaving(true);
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  };

  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex w-[94%] max-w-6xl items-center gap-3 py-2.5">
        <nav className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1">
          {ADMIN_SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-bold transition ${
                active(s.href) ? "bg-[#16b1a1] text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <span dir="ltr" className="hidden shrink-0 text-[11px] font-bold text-gray-400 md:block">
          {email}
        </span>
        <button
          type="button"
          onClick={logout}
          disabled={leaving}
          className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-bold text-gray-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
        >
          خروج
        </button>
      </div>
    </div>
  );
}
