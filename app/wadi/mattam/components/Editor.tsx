"use client";

import { useEffect, useState } from "react";
import type { MattamData, Night, Summary } from "../model";
import { fmtMoney, newId } from "../model";
import { NumInput, TextInput } from "./inputs";
import {
  IconWallet,
  IconReceipt,
  IconMoon,
  IconTrash,
  IconPlus,
  IconChevronLeft,
  IconArrowRight,
} from "./icons";

type Mutate = (fn: (d: MattamData) => MattamData) => void;

const addBtn =
  "inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#16b1a1]/30 " +
  "px-5 py-3 text-sm font-bold text-[#16b1a1] transition hover:border-[#16b1a1]/60 hover:bg-[#e8f7f5]";

const delBtn =
  "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-gray-300 transition hover:bg-red-50 hover:text-red-500";

function SectionHeader({
  icon,
  iconBg,
  title,
  desc,
  total,
  currency,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
  total?: number;
  currency?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${iconBg}`}>{icon}</span>
        <div>
          <h2 className="font-extrabold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      {total !== undefined && (
        <div className="rounded-xl bg-gray-50 px-4 py-2 text-left">
          <p className="text-[10px] font-bold text-gray-400">الإجمالي</p>
          <p dir="ltr" className="text-sm font-extrabold tabular-nums text-[#0e8e81]">
            {fmtMoney(total)} <span className="text-[0.72em] opacity-60">{currency}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-extrabold text-gray-700">{label}</span>
      {hint && <span className="mb-2 block text-[11px] font-medium text-gray-400">{hint}</span>}
      {children}
    </label>
  );
}

function NightBadge({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-extrabold ${
        done
          ? "bg-gradient-to-br from-[#16b1a1] to-[#0e8e81] text-white shadow-md shadow-teal-600/20"
          : "bg-gray-50 text-gray-300 ring-1 ring-gray-100"
      }`}
    >
      {children}
    </span>
  );
}

/* ═══════════ شاشة تعديل ليلة واحدة ═══════════ */

function NightDetail({
  data,
  night,
  summary,
  mutate,
  onSelect,
}: {
  data: MattamData;
  night: Night;
  summary: Summary;
  mutate: Mutate;
  onSelect: (id: string | null) => void;
}) {
  const c = data.currency;
  const st = summary.perNight[night.id];
  const idx = data.nights.findIndex((n) => n.id === night.id);
  const prev = idx > 0 ? data.nights[idx - 1] : null;
  const next = idx < data.nights.length - 1 ? data.nights[idx + 1] : null;

  const update = (patch: Partial<Night>) =>
    mutate((d) => ({
      ...d,
      nights: d.nights.map((n) => (n.id === night.id ? { ...n, ...patch } : n)),
    }));

  const navBtn =
    "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed";

  return (
    <div className="mt-6 md:mt-8">
      {/* شريط التنقل العلوي */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-100 transition hover:text-[#0e8e81]"
        >
          <IconArrowRight className="h-4 w-4" />
          كل الليالي
        </button>
        <span className="text-xs font-bold text-gray-400">
          الليلة {idx + 1} من {data.nights.length}
        </span>
      </div>

      <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-8">
        {/* رأس الليلة */}
        <div className="mb-6 flex items-center gap-4 border-b border-gray-50 pb-6">
          <NightBadge done={st.done}>{idx + 1}</NightBadge>
          <div className="min-w-0 flex-1">
            <TextInput
              value={night.name}
              onValue={(v) => update({ name: v })}
              placeholder="اسم الليلة"
              className="!border-transparent !bg-transparent !px-2 !py-1.5 !text-lg font-extrabold !text-gray-800 hover:!border-gray-200 focus:!bg-white md:!text-xl"
            />
            <p className="mr-2 mt-0.5 text-[11px] font-bold text-gray-400">
              {st.done ? "ليلة مكتملة — تم إدخال المصروف الفعلي" : "ليلة قادمة — لم يُدخل المصروف بعد"}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-xl space-y-6">
          <Field label="الضيافة" hint="ما الذي سيُقدَّم في هذه الليلة؟">
            <TextInput
              value={night.item}
              onValue={(v) => update({ item: v })}
              placeholder="مثال: رز ودجاج"
              className="!py-3"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={`السعر الافتراضي (${c})`} hint="التقدير المتوقع قبل الشراء">
              <NumInput value={night.estimated} onValue={(v) => update({ estimated: v })} className="!py-3 !text-base" />
            </Field>
            <Field label={`السعر الفعلي (${c})`} hint="المبلغ المدفوع فعلياً — اتركه فارغاً إن لم يُصرف">
              <NumInput
                value={night.actual}
                onValue={(v) => update({ actual: v })}
                placeholder="لم يُصرف بعد"
                className="!py-3 !text-base"
              />
            </Field>
          </div>

          {/* المستلزمات الإضافية */}
          <div>
            <p className="mb-1 text-sm font-extrabold text-gray-700">مستلزمات إضافية</p>
            <p className="mb-3 text-[11px] font-medium text-gray-400">
              أي مشتريات إضافية للّيلة — أواني، بلاستيكات، ثلج…
            </p>
            <div className="rounded-2xl bg-[#f6faf9] p-4 ring-1 ring-gray-100/60">
              {night.supplies.length > 0 && (
                <div className="mb-3 space-y-2.5">
                  {night.supplies.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <TextInput
                        value={s.name}
                        onValue={(v) =>
                          update({ supplies: night.supplies.map((x) => (x.id === s.id ? { ...x, name: v } : x)) })
                        }
                        placeholder="اسم المستلزم"
                      />
                      <NumInput
                        value={s.price}
                        onValue={(v) =>
                          update({ supplies: night.supplies.map((x) => (x.id === s.id ? { ...x, price: v } : x)) })
                        }
                        className="!w-24 shrink-0"
                        placeholder="السعر"
                      />
                      <button
                        type="button"
                        className={delBtn}
                        aria-label="حذف المستلزم"
                        onClick={() => update({ supplies: night.supplies.filter((x) => x.id !== s.id) })}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16b1a1] transition hover:text-[#0e8e81]"
                  onClick={() => update({ supplies: [...night.supplies, { id: newId(), name: "", price: null }] })}
                >
                  <IconPlus className="h-3.5 w-3.5" />
                  إضافة مستلزم
                </button>
                {st.suppliesTotal > 0 && (
                  <span dir="ltr" className="text-[11px] font-bold tabular-nums text-gray-400">
                    {fmtMoney(st.suppliesTotal)} {c}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Field label="ملاحظات" hint="اختياري — أي تفاصيل تهم بقية الفريق">
            <TextInput value={night.note} onValue={(v) => update({ note: v })} className="!py-3" />
          </Field>

          {/* ملخص الليلة */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#e8f7f5] p-4 text-center">
            <div>
              <p className="text-[10px] font-bold text-[#0e8e81]/60">إجمالي الليلة</p>
              <p dir="ltr" className="mt-1 text-base font-extrabold tabular-nums text-[#0e8e81]">
                {st.done ? fmtMoney(st.total) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0e8e81]/60">الفرق عن التقدير</p>
              {st.variance !== null ? (
                <p
                  dir="ltr"
                  className={`mt-1 text-base font-extrabold tabular-nums ${
                    st.variance >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {st.variance > 0 ? "+" : ""}
                  {fmtMoney(st.variance)}
                </p>
              ) : (
                <p className="mt-1 text-base font-extrabold text-[#0e8e81]/40">—</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0e8e81]/60">المتبقي بعدها</p>
              <p dir="ltr" className="mt-1 text-base font-extrabold tabular-nums text-[#0e8e81]">
                {st.done ? fmtMoney(st.remainingAfter) : "—"}
              </p>
            </div>
          </div>

          {/* حذف الليلة */}
          <div className="flex justify-center border-t border-gray-50 pt-5">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-50 hover:text-red-600"
              onClick={() => {
                if (confirm(`حذف «${night.name || "هذه الليلة"}» نهائياً؟`)) {
                  mutate((d) => ({ ...d, nights: d.nights.filter((n) => n.id !== night.id) }));
                  onSelect(null);
                }
              }}
            >
              <IconTrash />
              حذف هذه الليلة
            </button>
          </div>
        </div>
      </div>

      {/* التنقل بين الليالي */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && onSelect(prev.id)}
          className={`${navBtn} ${
            prev ? "bg-white text-gray-600 shadow-sm ring-1 ring-gray-100 hover:text-[#0e8e81]" : "text-gray-200"
          }`}
        >
          <IconChevronLeft className="h-4 w-4 rotate-180" />
          {prev ? prev.name || "الليلة السابقة" : "الليلة السابقة"}
        </button>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && onSelect(next.id)}
          className={`${navBtn} ${
            next
              ? "bg-[#16b1a1] text-white shadow-md shadow-teal-600/20 hover:bg-[#0e8e81]"
              : "text-gray-200"
          }`}
        >
          {next ? next.name || "الليلة التالية" : "الليلة التالية"}
          <IconChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════ قائمة اختيار الليلة + التمويل والمصاريف ═══════════ */

export default function Editor({
  data,
  summary,
  mutate,
}: {
  data: MattamData;
  summary: Summary;
  mutate: Mutate;
}) {
  const c = data.currency;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // استرجاع الليلة من الرابط (?night=…) عند فتح الصفحة
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("night");
    if (id) setSelectedId(id);
  }, []);

  const select = (id: string | null) => {
    setSelectedId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("night", id);
    else url.searchParams.delete("night");
    window.history.replaceState(null, "", url.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedNight = data.nights.find((n) => n.id === selectedId);
  if (selectedNight) {
    return <NightDetail data={data} night={selectedNight} summary={summary} mutate={mutate} onSelect={select} />;
  }

  return (
    <div className="mt-6 space-y-6 md:mt-8 md:space-y-8">
      {/* ─── اختيار الليلة ─── */}
      <section className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 p-5 md:px-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f7f5] text-[#0e8e81]">
              <IconMoon />
            </span>
            <div>
              <h2 className="font-extrabold text-gray-800">ليالي الموسم</h2>
              <p className="text-xs text-gray-400">اختر ليلة لتعديل بياناتها</p>
            </div>
          </div>
          <span className="rounded-full bg-[#e8f7f5] px-3.5 py-1.5 text-[11px] font-bold text-[#0e8e81]">
            {summary.doneCount} من {data.nights.length} مكتملة
          </span>
        </div>

        <ul className="divide-y divide-gray-50">
          {data.nights.map((n, i) => {
            const st = summary.perNight[n.id];
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => select(n.id)}
                  className="flex w-full items-center gap-4 p-4 text-right transition hover:bg-[#f6faf9] md:px-7"
                >
                  <NightBadge done={st.done}>{i + 1}</NightBadge>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={`font-extrabold ${st.done ? "text-gray-800" : "text-gray-400"}`}>
                        {n.name || "بدون اسم"}
                      </span>
                      {!st.done && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-400">
                          قادمة
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-gray-400">
                      {n.item || "لم تُحدد الضيافة بعد"}
                    </span>
                  </span>
                  <span className="text-left">
                    <span className="block text-[10px] font-bold text-gray-300">المصروف</span>
                    <span
                      dir="ltr"
                      className={`block text-sm font-extrabold tabular-nums ${st.done ? "text-gray-700" : "text-gray-300"}`}
                    >
                      {st.done ? `${fmtMoney(st.total)} ${c}` : "—"}
                    </span>
                  </span>
                  <IconChevronLeft className="h-4 w-4 shrink-0 text-gray-300" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-gray-50 p-4 md:px-7">
          <button
            type="button"
            className={`${addBtn} w-full`}
            onClick={() => {
              const id = newId();
              mutate((d) => ({
                ...d,
                nights: [
                  ...d.nights,
                  { id, name: `الليلة ${d.nights.length + 1}`, item: "", estimated: null, actual: null, supplies: [], note: "" },
                ],
              }));
              select(id);
            }}
          >
            <IconPlus />
            إضافة ليلة جديدة
          </button>
        </div>
      </section>

      {/* ─── مصادر التمويل ─── */}
      <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-7">
        <SectionHeader
          icon={<IconWallet />}
          iconBg="bg-[#e8f7f5] text-[#0e8e81]"
          title="مصادر التمويل"
          desc="المبالغ المتوفرة للموسم — علّم المخصص منها للضيافة"
          total={summary.totalFunds}
          currency={c}
        />
        <div className="space-y-3">
          {data.funds.map((f) => (
            <div key={f.id} className="rounded-2xl bg-[#f6faf9] p-4 ring-1 ring-gray-100/60">
              <div className="flex items-center gap-2">
                <TextInput
                  value={f.name}
                  onValue={(v) =>
                    mutate((d) => ({ ...d, funds: d.funds.map((x) => (x.id === f.id ? { ...x, name: v } : x)) }))
                  }
                  placeholder="اسم المصدر (مثال: مبلغ الكاش)"
                />
                <NumInput
                  value={f.amount}
                  onValue={(v) =>
                    mutate((d) => ({ ...d, funds: d.funds.map((x) => (x.id === f.id ? { ...x, amount: v } : x)) }))
                  }
                  className="!w-28 shrink-0"
                  placeholder="المبلغ"
                />
                <button
                  type="button"
                  className={delBtn}
                  aria-label="حذف المصدر"
                  onClick={() => {
                    if (confirm(`حذف «${f.name || "هذا المصدر"}»؟`))
                      mutate((d) => ({ ...d, funds: d.funds.filter((x) => x.id !== f.id) }));
                  }}
                >
                  <IconTrash />
                </button>
              </div>
              <label
                className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold ring-1 transition ${
                  f.hospitality
                    ? "bg-[#e8f7f5] text-[#0e8e81] ring-[#16b1a1]/30"
                    : "bg-white text-gray-400 ring-gray-200 hover:text-gray-500"
                }`}
              >
                <input
                  type="checkbox"
                  checked={f.hospitality}
                  onChange={(e) =>
                    mutate((d) => ({
                      ...d,
                      funds: d.funds.map((x) => (x.id === f.id ? { ...x, hospitality: e.target.checked } : x)),
                    }))
                  }
                  className="h-3.5 w-3.5 accent-[#16b1a1]"
                />
                مخصص لميزانية الضيافة
              </label>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${addBtn} mt-4 w-full md:w-auto`}
          onClick={() =>
            mutate((d) => ({
              ...d,
              funds: [...d.funds, { id: newId(), name: "", amount: null, hospitality: false, note: "" }],
            }))
          }
        >
          <IconPlus />
          إضافة مصدر تمويل
        </button>
      </section>

      {/* ─── مصاريف أخرى ─── */}
      <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-7">
        <SectionHeader
          icon={<IconReceipt />}
          iconBg="bg-amber-50 text-amber-500"
          title="مصاريف أخرى"
          desc="مصاريف عامة خارج الضيافة — مثل بركة الخطيب"
          total={summary.expensesTotal}
          currency={c}
        />
        <div className="space-y-3">
          {data.expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-2 rounded-2xl bg-[#f6faf9] p-4 ring-1 ring-gray-100/60">
              <TextInput
                value={e.name}
                onValue={(v) =>
                  mutate((d) => ({
                    ...d,
                    expenses: d.expenses.map((x) => (x.id === e.id ? { ...x, name: v } : x)),
                  }))
                }
                placeholder="البند (مثال: بركة الخطيب)"
              />
              <NumInput
                value={e.amount}
                onValue={(v) =>
                  mutate((d) => ({
                    ...d,
                    expenses: d.expenses.map((x) => (x.id === e.id ? { ...x, amount: v } : x)),
                  }))
                }
                className="!w-28 shrink-0"
                placeholder="المبلغ"
              />
              <button
                type="button"
                className={delBtn}
                aria-label="حذف المصروف"
                onClick={() => {
                  if (confirm(`حذف «${e.name || "هذا البند"}»؟`))
                    mutate((d) => ({ ...d, expenses: d.expenses.filter((x) => x.id !== e.id) }));
                }}
              >
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${addBtn} mt-4 w-full md:w-auto`}
          onClick={() =>
            mutate((d) => ({
              ...d,
              expenses: [...d.expenses, { id: newId(), name: "", amount: null, note: "" }],
            }))
          }
        >
          <IconPlus />
          إضافة مصروف
        </button>
      </section>
    </div>
  );
}
