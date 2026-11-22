import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/adminAuth";
import { Shell } from "@/app/forms/components/ui";
import { fmtDate } from "@/app/forms/model";
import { listCvRequests } from "@/app/cv/store";
import { listBookings } from "@/app/meetings/store";
import { listForms } from "@/app/forms/store";
import { listInquiries } from "@/app/zawaj/store";
import { candidateKey } from "@/app/zawaj/model";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  robots: { index: false, follow: false },
};

/** يُرجع null عند فشل القراءة حتى لا يُسقط قسمٌ واحد الصفحة كلها. */
const safe = <T,>(p: Promise<T>): Promise<T | null> =>
  p.catch((err) => {
    console.error("admin overview read failed:", err);
    return null;
  });

interface Activity {
  kind: string;
  title: string;
  sub: string;
  at: string;
  href: string;
}

export default async function AdminHome() {
  await requireAdminPage();
  const [cvs, bookings, forms, inquiries] = await Promise.all([
    safe(listCvRequests()),
    safe(listBookings()),
    safe(listForms()),
    safe(listInquiries()),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (bookings ?? [])
    .filter((b) => b.status === "confirmed" && b.date >= today)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const responsesTotal = (forms ?? []).reduce((n, f) => n + f.responses, 0);
  const candidates = new Set((inquiries ?? []).map((q) => candidateKey(q.candidate))).size;

  const activity: Activity[] = [
    ...(cvs ?? []).map((c) => ({
      kind: "سيرة ذاتية",
      title: c.data.name.ar || c.data.name.en || "بدون اسم",
      sub: c.data.jobTitle.ar || c.data.jobTitle.en,
      at: c.createdAt ?? "",
      href: "/admin/cv",
    })),
    ...(bookings ?? []).map((b) => ({
      kind: "حجز موعد",
      title: b.name,
      sub: `${b.date} · ${b.start}${b.topic ? ` · ${b.topic}` : ""}`,
      at: b.createdAt ?? "",
      href: "/admin/meetings",
    })),
    ...(inquiries ?? []).map((q) => ({
      kind: "سؤال عن مرشّحة",
      title: q.candidate,
      sub: `من ${q.submitter}`,
      at: q.createdAt,
      href: "/admin/zawaj",
    })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12);

  const n = (v: number) => v.toLocaleString("ar-SA");

  const cards = [
    {
      href: "/admin/cv",
      label: "طلبات السيرة الذاتية",
      value: cvs?.length,
      note: cvs?.[0] ? `آخرها ${fmtDate(cvs[0].createdAt ?? "")}` : "لا طلبات بعد",
    },
    {
      href: "/admin/meetings",
      label: "حجوزات المواعيد",
      value: bookings?.length,
      note: upcoming.length ? `${n(upcoming.length)} قادمة · الأقرب ${upcoming[0].date} ${upcoming[0].start}` : "لا مواعيد قادمة",
    },
    {
      href: "/admin/forms",
      label: "النماذج",
      value: forms?.length,
      note: `${n(responsesTotal)} ردّ على كل النماذج`,
    },
    {
      href: "/admin/zawaj",
      label: "السؤال عن المرشّحات",
      value: inquiries?.length,
      note: `عن ${n(candidates)} مرشّحة`,
    },
  ];

  return (
    <Shell kicker="لوحة الإدارة" title="كل الردود والطلبات في مكان واحد" subtitle="اختر قسماً لمراجعة تفاصيله.">
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#16b1a1]/40 hover:shadow-md"
          >
            <p className="text-[13px] font-bold text-gray-500">{c.label}</p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums text-[#0e8e81]">
              {c.value === undefined ? <span className="text-base text-red-500">تعذر التحميل</span> : n(c.value)}
            </p>
            <p className="mt-2 text-xs font-medium text-gray-400">{c.note}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-extrabold text-gray-800">آخر النشاط</h2>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-gray-400">لا يوجد نشاط بعد.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {activity.map((a, i) => (
              <li key={i}>
                <Link href={a.href} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 transition hover:bg-gray-50">
                  <span className="rounded-full bg-[#16b1a1]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0e8e81]">{a.kind}</span>
                  <span className="text-sm font-bold text-gray-800">{a.title}</span>
                  {a.sub && <span className="min-w-0 truncate text-xs font-medium text-gray-400">{a.sub}</span>}
                  <span className="ms-auto text-xs font-medium text-gray-400">{fmtDate(a.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
