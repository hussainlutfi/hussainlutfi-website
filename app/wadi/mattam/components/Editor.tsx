"use client";

import type { MattamData, Night, Summary } from "../model";
import { fmtMoney, newId } from "../model";
import { NumInput, TextInput } from "./inputs";
import { IconWallet, IconReceipt, IconMoon, IconTrash, IconPlus } from "./icons";

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
  total: number;
  currency: string;
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
      <div className="rounded-xl bg-gray-50 px-4 py-2 text-left">
        <p className="text-[10px] font-bold text-gray-400">الإجمالي</p>
        <p dir="ltr" className="text-sm font-extrabold tabular-nums text-[#0e8e81]">
          {fmtMoney(total)} <span className="text-[0.72em] opacity-60">{currency}</span>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function NightCard({
  night,
  index,
  summary,
  currency,
  mutate,
}: {
  night: Night;
  index: number;
  summary: Summary;
  currency: string;
  mutate: Mutate;
}) {
  const st = summary.perNight[night.id];

  const update = (patch: Partial<Night>) =>
    mutate((d) => ({
      ...d,
      nights: d.nights.map((n) => (n.id === night.id ? { ...n, ...patch } : n)),
    }));

  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-sm font-extrabold ${
            st.done
              ? "bg-gradient-to-br from-[#16b1a1] to-[#0e8e81] text-white shadow-md shadow-teal-600/20"
              : "bg-gray-50 text-gray-300 ring-1 ring-gray-100"
          }`}
        >
          {index + 1}
        </span>
        <TextInput
          value={night.name}
          onValue={(v) => update({ name: v })}
          placeholder="اسم الليلة"
          className="!border-transparent !bg-transparent !px-2 !py-1.5 !text-base font-extrabold !text-gray-800 hover:!border-gray-200 focus:!bg-white"
        />
        <button
          type="button"
          className={delBtn}
          aria-label="حذف الليلة"
          onClick={() => {
            if (confirm(`حذف «${night.name || "هذه الليلة"}»؟`))
              mutate((d) => ({ ...d, nights: d.nights.filter((n) => n.id !== night.id) }));
          }}
        >
          <IconTrash />
        </button>
      </div>

      <div className="space-y-4">
        <Field label="الضيافة">
          <TextInput value={night.item} onValue={(v) => update({ item: v })} placeholder="مثال: رز ودجاج" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`السعر الافتراضي (${currency})`}>
            <NumInput value={night.estimated} onValue={(v) => update({ estimated: v })} />
          </Field>
          <Field label={`السعر الفعلي (${currency})`}>
            <NumInput value={night.actual} onValue={(v) => update({ actual: v })} placeholder="لم يُصرف" />
          </Field>
        </div>

        {/* المستلزمات الإضافية */}
        <div className="rounded-2xl bg-[#f6faf9] p-4 ring-1 ring-gray-100/60">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-gray-500">مستلزمات إضافية</p>
            {st.suppliesTotal > 0 && (
              <span dir="ltr" className="text-[11px] font-bold tabular-nums text-gray-400">
                {fmtMoney(st.suppliesTotal)} {currency}
              </span>
            )}
          </div>
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
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16b1a1] transition hover:text-[#0e8e81]"
            onClick={() => update({ supplies: [...night.supplies, { id: newId(), name: "", price: null }] })}
          >
            <IconPlus className="h-3.5 w-3.5" />
            إضافة مستلزم
          </button>
        </div>

        <Field label="ملاحظات">
          <TextInput value={night.note} onValue={(v) => update({ note: v })} placeholder="اختياري" />
        </Field>
      </div>

      {/* ملخص الليلة */}
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#e8f7f5] px-4 py-3">
        <span className="text-xs font-extrabold text-[#0e8e81]">
          إجمالي الليلة:{" "}
          <span dir="ltr" className="text-sm tabular-nums">
            {st.done ? fmtMoney(st.total) : "—"}
          </span>
        </span>
        {st.variance !== null && (
          <span className={`text-xs font-extrabold ${st.variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {st.variance >= 0 ? "وفر " : "زيادة "}
            <span dir="ltr" className="tabular-nums">
              {fmtMoney(Math.abs(st.variance))}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

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

  return (
    <div className="mt-6 space-y-6 md:mt-8 md:space-y-8">
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

      {/* ─── الليالي ─── */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f7f5] text-[#0e8e81]">
              <IconMoon />
            </span>
            <div>
              <h2 className="font-extrabold text-gray-800">ليالي الموسم</h2>
              <p className="text-xs text-gray-400">أدخل السعر الفعلي والمستلزمات عند اكتمال كل ليلة</p>
            </div>
          </div>
          <span className="rounded-full bg-[#e8f7f5] px-3.5 py-1.5 text-[11px] font-bold text-[#0e8e81]">
            {summary.doneCount} من {data.nights.length} مكتملة
          </span>
        </div>
        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          {data.nights.map((n, i) => (
            <NightCard key={n.id} night={n} index={i} summary={summary} currency={c} mutate={mutate} />
          ))}
        </div>
        <button
          type="button"
          className={`${addBtn} mt-5 w-full`}
          onClick={() =>
            mutate((d) => ({
              ...d,
              nights: [
                ...d.nights,
                {
                  id: newId(),
                  name: `الليلة ${d.nights.length + 1}`,
                  item: "",
                  estimated: null,
                  actual: null,
                  supplies: [],
                  note: "",
                },
              ],
            }))
          }
        >
          <IconPlus />
          إضافة ليلة جديدة
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
