"use client";

import { useMemo, useState } from "react";
import { Banner, Card, Shell, btnDanger, btnGhost } from "@/app/forms/components/ui";
import { fmtDate } from "@/app/forms/model";
import { SECTIONS, UNKNOWN, candidateKey, type Inquiry, type Item } from "../model";

interface Group {
  key: string;
  name: string;
  items: Inquiry[];
}

/** مراجعة الإجابات: مجمّعة حسب المرشّحة، وكل سؤال يعرض إجابات كل المُجيبات جنباً إلى جنب. */
export default function Results({ initial }: { initial: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const q of inquiries) {
      const key = candidateKey(q.candidate);
      const g = map.get(key) ?? { key, name: q.candidate, items: [] };
      g.items.push(q);
      map.set(key, g);
    }
    return [...map.values()];
  }, [inquiries]);

  const [selected, setSelected] = useState<string | null>(groups[0]?.key ?? null);
  const group = groups.find((g) => g.key === selected) ?? groups[0];

  const remove = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/zawaj/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setInquiries((list) => list.filter((q) => q.id !== id));
    } catch {
      setError("تعذر حذف الردّ.");
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <Shell
      kicker="مراجعة سرّية"
      title="إجابات السؤال عن المرشّحات"
      subtitle={`${inquiries.length.toLocaleString("ar-SA")} ردّ عن ${groups.length.toLocaleString("ar-SA")} مرشّحة`}
      actions={
        <a href="/zawaj" target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-[#0e8e81] shadow transition hover:bg-white/90">
          فتح الاستبيان
        </a>
      }
    >
      {error && <Banner kind="error">{error}</Banner>}

      {!group ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-lg font-extrabold text-gray-700">لا توجد ردود بعد</p>
          <p className="mt-1 text-sm font-medium text-gray-400">شارك رابط /zawaj لتصلك الإجابات هنا.</p>
        </div>
      ) : (
        <>
          {groups.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {groups.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setSelected(g.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    g.key === group.key
                      ? "border-[#16b1a1] bg-[#16b1a1] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#16b1a1]"
                  }`}
                >
                  {g.name}
                  <span className="ms-2 tabular-nums opacity-70">{g.items.length.toLocaleString("ar-SA")}</span>
                </button>
              ))}
            </div>
          )}

          <Card className="mt-6">
            <h2 className="text-xl font-extrabold text-gray-800">{group.name}</h2>
            <p className="mt-1 text-sm font-medium text-gray-500">المُجيبات:</p>
            <ul className="mt-3 divide-y divide-gray-100">
              {group.items.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <span className="text-sm font-bold text-gray-700">
                    {q.submitter}
                    <span className="ms-3 text-xs font-medium text-gray-400">{fmtDate(q.createdAt)}</span>
                  </span>
                  {confirmId === q.id ? (
                    <span className="flex gap-2">
                      <button type="button" className={`${btnDanger} !px-3 !py-1.5 text-xs`} onClick={() => remove(q.id)}>
                        تأكيد الحذف
                      </button>
                      <button type="button" className={`${btnGhost} !px-3 !py-1.5 text-xs`} onClick={() => setConfirmId(null)}>
                        إلغاء
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-bold text-gray-400 transition hover:text-red-500"
                      onClick={() => setConfirmId(q.id)}
                    >
                      حذف
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <div className="mt-5 space-y-5">
            {SECTIONS.map((s, i) => (
              <Card key={s.id}>
                <h3 className="flex items-center gap-2.5 text-lg font-extrabold text-gray-800">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#16b1a1]/10 text-sm text-[#0e8e81]">
                    {(i + 1).toLocaleString("ar-SA")}
                  </span>
                  {s.title}
                </h3>
                <div className="mt-4 space-y-6">
                  {s.items.map((it) => (
                    <ItemResult key={it.id} item={it} inquiries={group.items} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}

function ItemResult({ item, inquiries }: { item: Item; inquiries: Inquiry[] }) {
  const answered = inquiries.filter((q) => q.answers[item.id]);

  return (
    <div>
      <p className="text-sm font-extrabold text-gray-700">{item.label}</p>
      {item.kind === "choice" ? (
        <ul className="mt-3 space-y-2">
          {item.options.map((o) => {
            const who = answered.filter((q) => q.answers[item.id] === o);
            if (!who.length && o === UNKNOWN) return null;
            const pct = inquiries.length ? (who.length / inquiries.length) * 100 : 0;
            return (
              <li key={o} className={who.length ? "" : "opacity-45"}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={`font-bold ${o === UNKNOWN ? "text-gray-400" : "text-gray-700"}`}>{o}</span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-gray-400">
                    {who.length.toLocaleString("ar-SA")}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#16b1a1]" style={{ width: `${pct}%` }} />
                </div>
                {who.length > 0 && (
                  <p className="mt-1 text-[11px] font-medium text-gray-400">{who.map((q) => q.submitter).join("، ")}</p>
                )}
              </li>
            );
          })}
        </ul>
      ) : answered.length ? (
        <ul className="mt-3 space-y-2">
          {answered.map((q) => (
            <li key={q.id} className="rounded-xl bg-[#f3f8f7] p-3.5">
              <p className="text-[11px] font-bold text-[#0e8e81]">{q.submitter}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-gray-700">
                {q.answers[item.id]}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs font-medium text-gray-300">لا توجد إجابات.</p>
      )}
    </div>
  );
}
