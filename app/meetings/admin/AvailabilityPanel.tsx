"use client";

import { useMemo, useState } from "react";
import {
  WEEKDAYS_AR,
  fmtDateAr,
  fmtDuration,
  fmtSpan,
  isValidDate,
  newId,
  toMinutes,
  type DateOverride,
  type DayRule,
  type Settings,
  type TimeRange,
} from "../model";
import { IconCalendar, IconClock, IconCopy, IconPlus, IconSettings, IconTrash } from "../components/icons";
import {
  Banner,
  Card,
  EmptyState,
  Field,
  NumberInput,
  TextArea,
  TextInput,
  TimeInput,
  Toggle,
  inputBase,
} from "../components/ui";
import type { Api } from "./AdminApp";

const TIMEZONES = [
  "Asia/Riyadh",
  "Asia/Bahrain",
  "Asia/Kuwait",
  "Asia/Qatar",
  "Asia/Dubai",
  "Asia/Baghdad",
  "Asia/Amman",
  "Africa/Cairo",
  "Europe/London",
  "UTC",
];

const DURATIONS = [15, 20, 30, 45, 60, 90];

/** عدد الفترات الناتجة عن قائمة نطاقات — معاينة فورية للمالك. */
function countSlots(ranges: TimeRange[], slotMinutes: number, bufferMinutes: number): number {
  const step = Math.max(5, slotMinutes + bufferMinutes);
  let total = 0;
  for (const r of ranges) {
    const from = toMinutes(r.start);
    const to = toMinutes(r.end);
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) continue;
    for (let m = from; m + slotMinutes <= to; m += step) total++;
  }
  return total;
}

export default function AvailabilityPanel({
  api,
  settings,
  onSaved,
}: {
  api: Api;
  settings: Settings;
  onSaved: (s: Settings) => void;
}) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setDay = (index: number, rule: DayRule) =>
    setDraft((d) => ({ ...d, weekly: d.weekly.map((r, i) => (i === index ? rule : r)) }));

  const weeklyTotal = useMemo(
    () =>
      draft.weekly.reduce(
        (sum, day) => sum + (day.enabled ? countSlots(day.ranges, draft.slotMinutes, draft.bufferMinutes) : 0),
        0
      ),
    [draft]
  );

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/meetings/settings", {
        method: "PUT",
        body: JSON.stringify({ settings: draft }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const body: { settings: Settings } = await res.json();
      setDraft(body.settings);
      onSaved(body.settings);
      setSavedAt(Date.now());
    } catch {
      setError("تعذر حفظ الإعدادات — تحقق من الاتصال ثم أعد المحاولة.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {error && <Banner tone="error">{error}</Banner>}
      {!error && savedAt && !dirty && <Banner tone="success">تم حفظ الإعدادات وستنعكس فوراً على صفحة الحجز.</Banner>}

      {/* ─── مدة الاجتماع وقواعد الحجز ─── */}
      <Card title="مدة الاجتماع وقواعد الحجز" icon={<IconClock className="h-5 w-5" />}>
        <Field label="مدة الاجتماع الواحد" hint="تُقسَّم أوقات توفرك إلى فترات بهذه المدة">
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("slotMinutes", m)}
                className={`rounded-xl px-4 py-2 text-[13px] font-bold transition ${
                  draft.slotMinutes === m
                    ? "bg-[#16b1a1] text-white shadow-sm"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {m} دقيقة
              </button>
            ))}
          </div>
        </Field>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="مدة مخصصة (دقيقة)">
            <NumberInput
              value={draft.slotMinutes}
              onValue={(v) => set("slotMinutes", v)}
              min={5}
              max={480}
              suffix="دقيقة"
            />
          </Field>
          <Field label="فاصل بين اجتماعين" hint="وقت راحة يُضاف بعد كل اجتماع">
            <NumberInput
              value={draft.bufferMinutes}
              onValue={(v) => set("bufferMinutes", v)}
              min={0}
              max={240}
              suffix="دقيقة"
            />
          </Field>
          <Field label="أقل مهلة قبل الموعد" hint="لا يمكن الحجز قبل الموعد بأقل من هذه المدة">
            <NumberInput
              value={draft.noticeHours}
              onValue={(v) => set("noticeHours", v)}
              min={0}
              max={720}
              suffix="ساعة"
            />
          </Field>
          <Field label="مدى الحجز المستقبلي" hint="كم يوماً للأمام يمكن للزائر الحجز">
            <NumberInput
              value={draft.horizonDays}
              onValue={(v) => set("horizonDays", v)}
              min={1}
              max={365}
              suffix="يوم"
            />
          </Field>
          <Field label="حد أقصى للحجوزات في اليوم" hint="اجعله صفراً لإلغاء الحد">
            <NumberInput value={draft.maxPerDay} onValue={(v) => set("maxPerDay", v)} min={0} max={50} suffix="حجز" />
          </Field>
          <Field label="المنطقة الزمنية" hint="كل الأوقات المعروضة تُفسَّر بهذا التوقيت">
            <select
              value={draft.timezone}
              onChange={(e) => set("timezone", e.target.value)}
              className={inputBase}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 rounded-2xl bg-[#f0faf9] p-4 text-[13px] font-bold text-[#0e8e81]">
          كل اجتماع {fmtDuration(draft.slotMinutes)}
          {draft.bufferMinutes > 0 && ` + ${draft.bufferMinutes} دقيقة فاصل`} — إجمالي{" "}
          <span dir="ltr" className="tabular-nums">
            {weeklyTotal}
          </span>{" "}
          فترة متاحة في الأسبوع.
        </div>
      </Card>

      {/* ─── أيام الأسبوع ─── */}
      <Card title="أوقات التوفر الأسبوعية" icon={<IconCalendar className="h-5 w-5" />}>
        <div className="space-y-3">
          {draft.weekly.map((rule, i) => (
            <DayEditor
              key={i}
              index={i}
              rule={rule}
              slotMinutes={draft.slotMinutes}
              bufferMinutes={draft.bufferMinutes}
              onChange={(r) => setDay(i, r)}
              onCopyToAll={() =>
                setDraft((d) => ({
                  ...d,
                  weekly: d.weekly.map((other, j) =>
                    j === i || !other.enabled
                      ? other
                      : { enabled: true, ranges: rule.ranges.map((r) => ({ ...r, id: newId() })) }
                  ),
                }))
              }
            />
          ))}
        </div>
      </Card>

      {/* ─── استثناءات التواريخ ─── */}
      <OverridesEditor
        overrides={draft.overrides}
        slotMinutes={draft.slotMinutes}
        bufferMinutes={draft.bufferMinutes}
        onChange={(o) => set("overrides", o)}
      />

      {/* ─── إعدادات الصفحة العامة ─── */}
      <Card title="صفحة الحجز" icon={<IconSettings className="h-5 w-5" />}>
        <div className="space-y-4">
          <Field label="عنوان الصفحة">
            <TextInput value={draft.title} onValue={(v) => set("title", v)} placeholder="احجز موعداً" />
          </Field>
          <Field label="نص تعريفي" hint="يظهر أسفل العنوان في صفحة الحجز">
            <TextArea value={draft.description} onValue={(v) => set("description", v)} rows={3} />
          </Field>
          <Field label="مكان الاجتماع الافتراضي" hint="مثال: اجتماع عن بُعد، أو عنوان المكتب">
            <TextInput value={draft.location} onValue={(v) => set("location", v)} />
          </Field>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <Toggle
              checked={draft.active}
              onChange={(v) => set("active", v)}
              label="استقبال الحجوزات"
              hint="عند الإيقاف تظهر رسالة بدلاً من الفترات"
            />
            <Toggle
              checked={draft.requireContact}
              onChange={(v) => set("requireContact", v)}
              label="إلزام وسيلة التواصل"
              hint="جوال أو بريد إلكتروني مطلوب للحجز"
            />
            <Toggle
              checked={draft.showNames}
              onChange={(v) => set("showNames", v)}
              label="إظهار أسماء الحاجزين"
              hint="يظهر اسم من حجز الفترة لكل زوار الصفحة"
            />
          </div>

          {draft.showNames && (
            <Banner tone="warn">
              تنبيه: عند التفعيل يرى كل زائر أسماء من حجزوا المواعيد. اتركه مغلقاً إن كانت الأسماء خصوصية.
            </Banner>
          )}

          {!draft.active && (
            <Field label="رسالة الإيقاف">
              <TextArea value={draft.pausedMessage} onValue={(v) => set("pausedMessage", v)} rows={2} />
            </Field>
          )}
        </div>
      </Card>

      {/* ─── شريط الحفظ ─── */}
      <div className="sticky bottom-4 z-20">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-900/95 p-3 ps-5 text-white shadow-xl backdrop-blur">
          <p className="text-[13px] font-bold">
            {dirty ? "لديك تغييرات غير محفوظة" : "كل التغييرات محفوظة"}
          </p>
          <div className="flex gap-2">
            {dirty && (
              <button
                type="button"
                onClick={() => setDraft(settings)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-white/70 transition hover:text-white"
              >
                تراجع
              </button>
            )}
            <button
              type="button"
              disabled={!dirty || busy}
              onClick={save}
              className="rounded-xl bg-[#16b1a1] px-6 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0e8e81] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40"
            >
              {busy ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── محرر يوم من الأسبوع ── */

function DayEditor({
  index,
  rule,
  slotMinutes,
  bufferMinutes,
  onChange,
  onCopyToAll,
}: {
  index: number;
  rule: DayRule;
  slotMinutes: number;
  bufferMinutes: number;
  onChange: (r: DayRule) => void;
  onCopyToAll: () => void;
}) {
  const slots = rule.enabled ? countSlots(rule.ranges, slotMinutes, bufferMinutes) : 0;

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        rule.enabled ? "border-gray-100 bg-white" : "border-gray-100 bg-gray-50/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => onChange({ ...rule, enabled: e.target.checked })}
            className="h-4 w-4 accent-[#16b1a1]"
          />
          <span className={`text-sm font-extrabold ${rule.enabled ? "text-gray-800" : "text-gray-400"}`}>
            {WEEKDAYS_AR[index]}
          </span>
        </label>

        {rule.enabled ? (
          <div className="flex items-center gap-2">
            <span dir="ltr" className="rounded-lg bg-[#f0faf9] px-2 py-1 text-[11px] font-extrabold tabular-nums text-[#0e8e81]">
              {slots} فترة
            </span>
            <button
              type="button"
              onClick={onCopyToAll}
              title="نسخ هذه الأوقات إلى بقية الأيام المفعّلة"
              className="grid h-8 w-8 place-items-center rounded-lg text-gray-300 transition hover:bg-gray-50 hover:text-[#16b1a1]"
            >
              <IconCopy className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-bold text-gray-300">مغلق</span>
        )}
      </div>

      {rule.enabled && (
        <div className="mt-3 space-y-2">
          <RangeList
            ranges={rule.ranges}
            onChange={(ranges) => onChange({ ...rule, ranges })}
          />
        </div>
      )}
    </div>
  );
}

/* ── قائمة نطاقات زمنية قابلة للتحرير ── */

function RangeList({
  ranges,
  onChange,
}: {
  ranges: TimeRange[];
  onChange: (r: TimeRange[]) => void;
}) {
  const update = (id: string, patch: Partial<TimeRange>) =>
    onChange(ranges.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <>
      {ranges.map((range) => {
        const invalid = toMinutes(range.end) <= toMinutes(range.start);
        return (
          <div key={range.id} className="flex items-center gap-2">
            <TimeInput value={range.start} onValue={(v) => update(range.id, { start: v })} className="flex-1" />
            <span className="text-xs font-bold text-gray-300">إلى</span>
            <TimeInput value={range.end} onValue={(v) => update(range.id, { end: v })} className="flex-1" />
            <button
              type="button"
              onClick={() => onChange(ranges.filter((r) => r.id !== range.id))}
              aria-label="حذف الفترة"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
            >
              <IconTrash className="h-4 w-4" />
            </button>
            {invalid && <span className="text-[11px] font-bold text-red-500">وقت غير صحيح</span>}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() =>
          onChange([
            ...ranges,
            { id: newId(), start: ranges.length ? "16:00" : "10:00", end: ranges.length ? "20:00" : "13:00" },
          ])
        }
        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 px-3.5 py-2 text-[12px] font-bold text-gray-400 transition hover:border-[#16b1a1] hover:text-[#16b1a1]"
      >
        <IconPlus className="h-3.5 w-3.5" />
        إضافة فترة
      </button>
    </>
  );
}

/* ── استثناءات التواريخ ── */

function OverridesEditor({
  overrides,
  slotMinutes,
  bufferMinutes,
  onChange,
}: {
  overrides: DateOverride[];
  slotMinutes: number;
  bufferMinutes: number;
  onChange: (o: DateOverride[]) => void;
}) {
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const add = (closed: boolean) => {
    if (!isValidDate(date)) {
      setError("اختر تاريخاً صحيحاً.");
      return;
    }
    if (overrides.some((o) => o.date === date)) {
      setError("هذا التاريخ مضاف مسبقاً.");
      return;
    }
    setError("");
    onChange(
      [
        ...overrides,
        {
          id: newId(),
          date,
          closed,
          ranges: closed ? [] : [{ id: newId(), start: "10:00", end: "13:00" }],
          note: "",
        },
      ].sort((a, b) => a.date.localeCompare(b.date))
    );
    setDate("");
  };

  const update = (id: string, patch: Partial<DateOverride>) =>
    onChange(overrides.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <Card title="استثناءات التواريخ" icon={<IconCalendar className="h-5 w-5" />}>
      <p className="-mt-2 mb-4 text-[12px] font-medium text-gray-400">
        يتجاوز الاستثناء قاعدة اليوم الأسبوعية — استخدمه للإجازات أو لأوقات خاصة في تاريخ محدد.
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[10rem] flex-1">
          <Field label="التاريخ">
            <input
              type="date"
              dir="ltr"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputBase} text-center font-bold tabular-nums`}
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={() => add(true)}
          className="rounded-xl bg-gray-100 px-4 py-2.5 text-[13px] font-bold text-gray-600 transition hover:bg-gray-200"
        >
          يوم إجازة
        </button>
        <button
          type="button"
          onClick={() => add(false)}
          className="rounded-xl bg-[#16b1a1] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#0e8e81]"
        >
          أوقات خاصة
        </button>
      </div>

      {error && <p className="mt-2 text-[12px] font-bold text-red-500">{error}</p>}

      <div className="mt-5 space-y-3">
        {overrides.length === 0 ? (
          <EmptyState title="لا توجد استثناءات" hint="أضف إجازة أو أوقاتاً خاصة لتاريخ محدد" />
        ) : (
          overrides.map((o) => (
            <div key={o.id} className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-gray-800">{fmtDateAr(o.date)}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-gray-400">
                    {o.closed
                      ? "مغلق طوال اليوم"
                      : `${countSlots(o.ranges, slotMinutes, bufferMinutes)} فترة — ${o.ranges
                          .map((r) => fmtSpan(r.start, r.end))
                          .join("، ")}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(overrides.filter((x) => x.id !== o.id))}
                  aria-label="حذف الاستثناء"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>

              {!o.closed && (
                <div className="mt-3 space-y-2">
                  <RangeList ranges={o.ranges} onChange={(ranges) => update(o.id, { ranges })} />
                </div>
              )}

              <div className="mt-3">
                <TextInput
                  value={o.note}
                  onValue={(v) => update(o.id, { note: v })}
                  placeholder="ملاحظة (اختياري) — مثال: سفر"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
