"use client";

import Link from "next/link";
import type { MattamData, Summary } from "../model";
import { fmtMoney } from "../model";
import { Money, VarianceChip } from "./inputs";
import { IconWallet, IconReceipt, IconMoon, IconCoins } from "./icons";

function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "plain",
  currency,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  tone?: "plain" | "teal" | "auto";
  currency: string;
}) {
  const valueColor =
    tone === "teal"
      ? "text-[#0e8e81]"
      : tone === "auto"
        ? value >= 0
          ? "text-emerald-600"
          : "text-red-600"
        : "text-gray-800";
  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg shadow-teal-900/[0.04] ring-1 ring-gray-100 md:p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e8f7f5] text-[#0e8e81]">
          {icon}
        </span>
        <p className="text-[11px] font-bold leading-tight text-gray-400 md:text-xs">{label}</p>
      </div>
      <p className={`mt-3 text-xl font-extrabold md:text-2xl ${valueColor}`}>
        <Money value={value} currency={currency} />
      </p>
      {sub && <p className="mt-1 text-[11px] font-medium text-gray-400">{sub}</p>}
    </div>
  );
}

export default function Overview({
  data,
  summary,
  editHref,
}: {
  data: MattamData;
  summary: Summary;
  editHref: string;
}) {
  const c = data.currency;
  const totalVariance = summary.doneCount ? summary.estimatedTotal - summary.hospitalitySpent : null;

  return (
    <div className="relative z-10 -mt-6 space-y-6 md:-mt-8 md:space-y-8">
      {/* ─── بطاقات الإحصائيات ─── */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard icon={<IconWallet />} label="إجمالي التمويل" value={summary.totalFunds} tone="teal" currency={c} />
        <StatCard
          icon={<IconReceipt />}
          label="إجمالي المصروفات"
          value={summary.totalSpent}
          sub={`ضيافة ${fmtMoney(summary.hospitalitySpent)} + أخرى ${fmtMoney(summary.expensesTotal)}`}
          currency={c}
        />
        <StatCard
          icon={<IconMoon />}
          label="المتبقي للضيافة"
          value={summary.hospitalityRemaining}
          sub={`من ميزانية ${fmtMoney(summary.hospitalityBudget)} ${c}`}
          tone="auto"
          currency={c}
        />
        <StatCard
          icon={<IconCoins />}
          label="المتبقي الإجمالي"
          value={summary.totalRemaining}
          sub="بعد جميع المصروفات"
          tone="auto"
          currency={c}
        />
      </div>

      {/* ─── الليالي ─── */}
      <section className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 p-5 md:px-7">
          <div>
            <h2 className="text-base font-extrabold text-gray-800 md:text-lg">ليالي الموسم</h2>
            <p className="mt-0.5 text-xs text-gray-400">الضيافة والمصاريف الفعلية لكل ليلة</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#e8f7f5] px-3 py-1.5 text-[11px] font-bold text-[#0e8e81]">
              {summary.doneCount} من {data.nights.length} مكتملة
            </span>
            <Link
              href={editHref}
              className="rounded-full border border-[#16b1a1]/30 px-4 py-1.5 text-[11px] font-bold text-[#0e8e81] transition hover:bg-[#e8f7f5]"
            >
              تعديل ↗
            </Link>
          </div>
        </div>

        <ul className="divide-y divide-gray-50">
          {data.nights.map((n, i) => {
            const st = summary.perNight[n.id];
            return (
              <li key={n.id} className="flex flex-col gap-4 p-5 transition hover:bg-gray-50/40 md:flex-row md:items-center md:gap-6 md:px-7">
                {/* الاسم والضيافة */}
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-extrabold ${
                      st.done
                        ? "bg-gradient-to-br from-[#16b1a1] to-[#0e8e81] text-white shadow-md shadow-teal-600/20"
                        : "bg-gray-50 text-gray-300 ring-1 ring-gray-100"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-extrabold ${st.done ? "text-gray-800" : "text-gray-400"}`}>
                        {n.name || "—"}
                      </p>
                      <VarianceChip variance={st.variance} />
                      {!st.done && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-400">
                          قادمة
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-gray-500">{n.item || "لم تحدد الضيافة"}</p>
                    {(n.supplies.length > 0 || n.note) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {n.supplies.map((s) => (
                          <span
                            key={s.id}
                            className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 ring-1 ring-gray-100"
                          >
                            {s.name || "مستلزم"}
                            {s.price !== null && (
                              <span dir="ltr" className="tabular-nums"> · {fmtMoney(s.price)}</span>
                            )}
                          </span>
                        ))}
                        {n.note && <span className="text-[10px] font-medium text-gray-400">{n.note}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* الأرقام */}
                <div className="flex items-center justify-between gap-3 pr-[3.75rem] md:justify-end md:gap-6 md:pr-0">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-300">التقدير</p>
                    <p dir="ltr" className="mt-0.5 text-sm font-bold tabular-nums text-gray-400">
                      {n.estimated !== null ? fmtMoney(n.estimated) : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-300">المصروف</p>
                    <p dir="ltr" className={`mt-0.5 text-base font-extrabold tabular-nums ${st.done ? "text-gray-800" : "text-gray-300"}`}>
                      {st.done ? fmtMoney(st.total) : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#e8f7f5] px-3.5 py-2 text-center">
                    <p className="text-[10px] font-bold text-[#0e8e81]/60">المتبقي بعدها</p>
                    <p dir="ltr" className="mt-0.5 text-sm font-extrabold tabular-nums text-[#0e8e81]">
                      {st.done ? fmtMoney(st.remainingAfter) : "—"}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* إجماليات */}
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-gray-100 bg-gray-50/60 p-5 md:px-7">
          <div>
            <p className="text-[10px] font-bold text-gray-400">إجمالي التقدير</p>
            <p className="mt-0.5 font-extrabold text-gray-600">
              <Money value={summary.estimatedTotal} currency={c} />
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400">إجمالي المصروف الفعلي</p>
            <p className="mt-0.5 font-extrabold text-gray-800">
              <Money value={summary.hospitalitySpent} currency={c} />
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400">الفرق حتى الآن</p>
            <p className="mt-0.5 font-extrabold">
              {totalVariance !== null ? <Money value={totalVariance} currency={c} signed /> : <span className="text-gray-300">—</span>}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400">المتبقي للضيافة</p>
            <p className="mt-0.5 font-extrabold text-[#0e8e81]">
              <Money value={summary.hospitalityRemaining} currency={c} />
            </p>
          </div>
        </div>
      </section>

      {/* ─── التمويل والمصاريف الأخرى ─── */}
      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f7f5] text-[#0e8e81]">
              <IconWallet />
            </span>
            <h2 className="font-extrabold text-gray-800">مصادر التمويل</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {data.funds.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm font-medium text-gray-600">
                  {f.name || "—"}
                  {f.hospitality && (
                    <span className="mr-2 rounded-full bg-[#e8f7f5] px-2.5 py-0.5 text-[10px] font-bold text-[#0e8e81]">
                      للضيافة
                    </span>
                  )}
                </span>
                <Money value={f.amount ?? 0} currency={c} className="font-extrabold text-gray-800" />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50/80 px-4 py-3 text-sm font-extrabold">
            <span className="text-gray-500">الإجمالي</span>
            <Money value={summary.totalFunds} currency={c} className="text-[#0e8e81]" />
          </div>
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-500">
              <IconReceipt />
            </span>
            <h2 className="font-extrabold text-gray-800">مصاريف أخرى</h2>
          </div>
          {data.expenses.length ? (
            <>
              <ul className="divide-y divide-gray-50">
                {data.expenses.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-sm font-medium text-gray-600">
                      {e.name || "—"}
                      {e.note && <span className="block text-[11px] text-gray-400">{e.note}</span>}
                    </span>
                    <Money value={e.amount ?? 0} currency={c} className="font-extrabold text-gray-800" />
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50/80 px-4 py-3 text-sm font-extrabold">
                <span className="text-gray-500">الإجمالي</span>
                <Money value={summary.expensesTotal} currency={c} className="text-[#0e8e81]" />
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-gray-300">لا توجد مصاريف أخرى</p>
          )}
        </section>
      </div>

      <p className="text-center text-[11px] font-medium text-gray-300">
        المبالغ بالريال السعودي · تُحفظ البيانات تلقائياً وتظهر للجميع
      </p>
    </div>
  );
}
