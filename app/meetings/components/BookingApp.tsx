"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildIcs,
  fmtDateAr,
  fmtDuration,
  fmtSpan,
  fmtTime,
  monthOf,
  shiftMonth,
  toMinutes,
  validateBookingInput,
  type Booking,
  type MonthPayload,
  type PublicInfo,
  type Slot,
} from "../model";
import MonthCalendar, { buildMonthCells } from "./MonthCalendar";
import {
  IconArrowBack,
  IconCalendarCheck,
} from "./bookingIcons";
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconDownload,
  IconRefresh,
  IconUser,
} from "./icons";
import { Banner, EmptyState, Field, Spinner, TextArea, TextInput } from "./ui";

type Form = { name: string; contact: string; topic: string; note: string };

const EMPTY_FORM: Form = { name: "", contact: "", topic: "", note: "" };

const PERIODS = [
  { key: "morning", label: "صباحاً", until: 12 * 60 },
  { key: "noon", label: "ظهراً", until: 17 * 60 },
  { key: "evening", label: "مساءً", until: 24 * 60 + 1 },
] as const;

const DRAFT_KEY = "meetings:guest";

export default function BookingApp({ initialInfo }: { initialInfo: PublicInfo | null }) {
  const [info, setInfo] = useState<PublicInfo | null>(initialInfo);
  const [month, setMonth] = useState<string | null>(null);
  const [payload, setPayload] = useState<MonthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ booking: Booking; info: PublicInfo } | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);
  const slotsRef = useRef<HTMLDivElement | null>(null);

  /* ── استرجاع بيانات الزائر المحفوظة محلياً ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Form>;
        setForm((f) => ({
          ...f,
          name: typeof saved.name === "string" ? saved.name : "",
          contact: typeof saved.contact === "string" ? saved.contact : "",
        }));
      }
    } catch {
      /* تجاهل — التخزين المحلي قد يكون معطلاً */
    }
  }, []);

  /* ── تحميل شهر ── */
  const load = useCallback(async (target: string | null) => {
    setLoading(true);
    setLoadError(false);
    try {
      const url = target ? `/api/meetings/public?month=${target}` : "/api/meetings/public";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const body: MonthPayload = await res.json();
      setPayload(body);
      setInfo(body.info);
      setMonth(body.month);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(null);
  }, [load]);

  const goMonth = (n: number) => {
    if (!month) return;
    const next = shiftMonth(month, n);
    setSelectedDate(null);
    setSelectedStart(null);
    load(next);
  };

  /* ── اليوم المختار وفتراته ── */
  const slots: Slot[] = useMemo(
    () => (payload && selectedDate ? (payload.days[selectedDate] ?? []) : []),
    [payload, selectedDate]
  );

  const grouped = useMemo(() => {
    return PERIODS.map((p, i) => {
      const from = i === 0 ? 0 : PERIODS[i - 1].until;
      return { ...p, items: slots.filter((s) => toMinutes(s.start) >= from && toMinutes(s.start) < p.until) };
    }).filter((g) => g.items.length > 0);
  }, [slots]);

  const selectedSlot = slots.find((s) => s.start === selectedStart) ?? null;

  const { leading, cells } = useMemo(() => {
    if (!payload || !month) return { leading: 0, cells: [] };
    return buildMonthCells(month, payload.days, payload.today, payload.today, payload.lastDate);
  }, [payload, month]);

  const canGoBack = !!payload && !!month && month > monthOf(payload.today);
  const canGoForward = !!payload && !!month && month < monthOf(payload.lastDate);

  /* أول يوم متاح يُختار تلقائياً لتقليل خطوة على الزائر */
  useEffect(() => {
    if (!payload || selectedDate) return;
    const firstFree = cells.find((c) => c.selectable);
    if (firstFree) setSelectedDate(firstFree.date);
  }, [payload, cells, selectedDate]);

  const pickDate = (date: string) => {
    setSelectedDate(date);
    setSelectedStart(null);
    setErrors([]);
    requestAnimationFrame(() => slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const pickSlot = (slot: Slot) => {
    setSelectedStart(slot.start);
    setErrors([]);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  /* ── إرسال الحجز ── */
  const submit = async () => {
    if (!selectedDate || !selectedStart || !info) return;

    const input = { date: selectedDate, start: selectedStart, ...form };
    const local = validateBookingInput(input, info.requireContact);
    if (local.length) {
      setErrors(local);
      return;
    }

    setSubmitting(true);
    setErrors([]);
    try {
      const res = await fetch("/api/meetings/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setErrors([body.message ?? "هذه الفترة لم تعد متاحة."]);
        setSelectedStart(null);
        load(month);
        return;
      }
      if (!res.ok) {
        setErrors(body.messages ?? ["تعذر إتمام الحجز، حاول مرة أخرى."]);
        return;
      }

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ name: form.name, contact: form.contact }));
      } catch {
        /* تجاهل */
      }
      setDone({ booking: body.booking, info: body.info ?? info });
    } catch {
      setErrors(["تعذر الاتصال بالخادم — تحقق من اتصالك ثم أعد المحاولة."]);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDone(null);
    setSelectedStart(null);
    setForm((f) => ({ ...f, topic: "", note: "" }));
    load(month);
  };

  /* ── شاشة التأكيد ── */
  if (done) {
    return <Confirmation booking={done.booking} info={done.info} onAgain={reset} />;
  }

  const paused = info && !info.active;

  return (
    <div className="min-h-screen bg-[#f3f8f7] pb-24">
      <div className="mx-auto w-[92%] max-w-5xl pt-6 md:pt-10">
        {/* ─── الترويسة ─── */}
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-[#16b1a1] via-[#12a091] to-[#0e8e81] p-6 text-white shadow-xl shadow-teal-900/15 md:p-10">
          <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/4 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-bold tracking-wide text-white/70">حجز موعد</p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{info?.title ?? "احجز موعداً"}</h1>
            {info?.description && (
              <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/80">
                {info.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {info && (
                <Chip icon={<IconClock className="h-3.5 w-3.5" />}>{fmtDuration(info.slotMinutes)}</Chip>
              )}
              {info?.location && <Chip icon={<IconCalendar className="h-3.5 w-3.5" />}>{info.location}</Chip>}
              {info && <Chip>التوقيت: {tzLabel(info.timezone)}</Chip>}
            </div>
          </div>
        </header>

        {paused && (
          <div className="mt-5">
            <Banner tone="warn">{info?.pausedMessage}</Banner>
          </div>
        )}

        {loadError && (
          <div className="mt-5">
            <Banner
              tone="error"
              action={
                <button
                  type="button"
                  onClick={() => load(month)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  إعادة المحاولة
                </button>
              }
            >
              تعذر تحميل الأوقات المتاحة.
            </Banner>
          </div>
        )}

        {/* ─── الخطوات ─── */}
        {!payload && loading ? (
          <div className="mt-6 rounded-[1.75rem] bg-white p-16 text-center shadow-sm ring-1 ring-gray-100">
            <Spinner />
            <p className="mt-4 text-sm font-bold text-gray-400">جارٍ تحميل الأوقات المتاحة…</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_1fr] lg:items-start">
            {/* التقويم */}
            <section className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-6">
              <StepTitle n={1} title="اختر اليوم" />
              {month && (
                <MonthCalendar
                  month={month}
                  cells={cells}
                  leading={leading}
                  selected={selectedDate}
                  onSelect={pickDate}
                  onMonthShift={goMonth}
                  canGoBack={canGoBack}
                  canGoForward={canGoForward}
                  loading={loading}
                />
              )}
            </section>

            {/* الفترات ثم النموذج */}
            <div className="space-y-5">
              <section
                ref={slotsRef}
                className="scroll-mt-6 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <StepTitle n={2} title="اختر الوقت" className="mb-0" />
                  <button
                    type="button"
                    onClick={() => load(month)}
                    aria-label="تحديث الفترات"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-300 transition hover:bg-gray-50 hover:text-[#16b1a1]"
                  >
                    <IconRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {!selectedDate ? (
                  <EmptyState
                    icon={<IconCalendar className="h-9 w-9" />}
                    title="اختر يوماً من التقويم"
                    hint="الأيام التي تحتها نقطة خضراء بها فترات متاحة"
                  />
                ) : (
                  <>
                    <p className="mb-4 text-sm font-bold text-gray-700">{fmtDateAr(selectedDate)}</p>
                    {grouped.length === 0 ? (
                      <EmptyState title="لا توجد فترات في هذا اليوم" hint="جرّب يوماً آخر من التقويم" />
                    ) : (
                      <div className="space-y-4">
                        {grouped.map((group) => (
                          <div key={group.key}>
                            <p className="mb-2 text-[11px] font-bold text-gray-400">{group.label}</p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {group.items.map((slot) => (
                                <SlotButton
                                  key={slot.start}
                                  slot={slot}
                                  selected={slot.start === selectedStart}
                                  disabled={!!paused}
                                  onPick={() => pickSlot(slot)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* النموذج */}
              {selectedSlot && !paused && (
                <section
                  ref={formRef}
                  className="scroll-mt-6 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-gray-100 md:p-6"
                >
                  <StepTitle n={3} title="بياناتك" />

                  <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#f0faf9] p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#16b1a1] shadow-sm">
                      <IconCalendarCheck className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-800">{fmtDateAr(selectedDate!)}</p>
                      <p dir="ltr" className="mt-0.5 text-right text-xs font-bold text-[#0e8e81]">
                        {fmtSpan(selectedSlot.start, selectedSlot.end)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStart(null)}
                      className="ms-auto shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-gray-400 transition hover:bg-white hover:text-gray-600"
                    >
                      تغيير
                    </button>
                  </div>

                  {errors.length > 0 && (
                    <div className="mb-4">
                      <Banner tone="error">
                        <ul className="space-y-1">
                          {errors.map((e) => (
                            <li key={e}>{e}</li>
                          ))}
                        </ul>
                      </Banner>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Field label="الاسم" required>
                      <TextInput
                        value={form.name}
                        onValue={(v) => setForm({ ...form, name: v })}
                        placeholder="اسمك الكامل"
                      />
                    </Field>

                    <Field
                      label="وسيلة التواصل"
                      required={info?.requireContact}
                      hint="جوال أو بريد إلكتروني لإرسال تفاصيل الاجتماع"
                    >
                      <TextInput
                        value={form.contact}
                        onValue={(v) => setForm({ ...form, contact: v })}
                        placeholder="05xxxxxxxx أو name@example.com"
                        dir="ltr"
                        className="text-right"
                      />
                    </Field>

                    <Field label="موضوع الاجتماع">
                      <TextInput
                        value={form.topic}
                        onValue={(v) => setForm({ ...form, topic: v })}
                        placeholder="مثال: استشارة تقنية لمشروع"
                      />
                    </Field>

                    <Field label="ملاحظات">
                      <TextArea
                        value={form.note}
                        onValue={(v) => setForm({ ...form, note: v })}
                        placeholder="أي تفاصيل تساعدني على التحضير للاجتماع"
                      />
                    </Field>

                    <button
                      type="button"
                      onClick={submit}
                      disabled={submitting}
                      className="w-full rounded-2xl bg-[#16b1a1] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-teal-600/20 transition hover:bg-[#0e8e81] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                    >
                      {submitting ? "جارٍ تأكيد الحجز…" : "تأكيد الحجز"}
                    </button>

                    <p className="text-center text-[11px] font-medium text-gray-400">
                      بتأكيد الحجز تحتفظ بهذه الفترة، وسيصلك رقم مرجعي يمكنك الرجوع إليه.
                    </p>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── أجزاء صغيرة ── */

function StepTitle({ n, title, className = "mb-4" }: { n: number; title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#16b1a1]/10 text-xs font-extrabold text-[#0e8e81]">
        {n}
      </span>
      <h2 className="text-base font-extrabold text-gray-800">{title}</h2>
    </div>
  );
}

function Chip({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
      {icon}
      {children}
    </span>
  );
}

function SlotButton({
  slot,
  selected,
  disabled,
  onPick,
}: {
  slot: Slot;
  selected: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  const free = slot.state === "free" && !disabled;

  return (
    <button
      type="button"
      disabled={!free}
      onClick={onPick}
      title={slot.name ? `محجوز — ${slot.name}` : undefined}
      className={[
        "rounded-xl border px-2 py-2.5 text-center transition",
        selected
          ? "border-[#16b1a1] bg-[#16b1a1] text-white shadow-md shadow-teal-600/20"
          : free
            ? "border-gray-200 bg-white text-gray-700 hover:border-[#16b1a1] hover:bg-[#f0faf9] hover:text-[#0e8e81]"
            : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300",
      ].join(" ")}
    >
      <span dir="ltr" className="block text-sm font-bold tabular-nums">
        {fmtTime(slot.start)}
      </span>
      <span className="mt-0.5 block truncate text-[10px] font-bold opacity-70">
        {slot.state === "taken" ? (slot.name ? slot.name : "محجوز") : slot.state === "free" ? "متاح" : "منتهٍ"}
      </span>
    </button>
  );
}

function Confirmation({
  booking,
  info,
  onAgain,
}: {
  booking: Booking;
  info: PublicInfo;
  onAgain: () => void;
}) {
  const downloadIcs = () => {
    const blob = new Blob([buildIcs(booking, info)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-${booking.code}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f3f8f7] pb-24">
      <div className="mx-auto w-[92%] max-w-2xl pt-10 md:pt-16">
        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-teal-900/5 ring-1 ring-gray-100">
          <div className="bg-gradient-to-bl from-[#16b1a1] to-[#0e8e81] p-8 text-center text-white">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
              <IconCheckCircle className="h-9 w-9" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold">تم تأكيد حجزك</h1>
            <p className="mt-2 text-sm font-medium text-white/80">
              احتفظ بالرقم المرجعي، وسأتواصل معك على وسيلة التواصل التي أدخلتها.
            </p>
          </div>

          <div className="space-y-3 p-6 md:p-8">
            <Row icon={<IconCalendar className="h-4 w-4" />} label="التاريخ" value={fmtDateAr(booking.date)} />
            <Row
              icon={<IconClock className="h-4 w-4" />}
              label="الوقت"
              value={fmtSpan(booking.start, booking.end)}
              ltr
            />
            <Row icon={<IconUser className="h-4 w-4" />} label="الاسم" value={booking.name} />
            {booking.topic && <Row label="الموضوع" value={booking.topic} />}
            {info.location && <Row label="المكان" value={info.location} />}
            <Row label="التوقيت المعتمد" value={tzLabel(info.timezone)} />

            <div className="!mt-6 rounded-2xl border border-dashed border-[#16b1a1]/30 bg-[#f0faf9] p-4 text-center">
              <p className="text-[11px] font-bold text-gray-500">الرقم المرجعي</p>
              <p dir="ltr" className="mt-1 text-2xl font-extrabold tracking-[0.3em] text-[#0e8e81]">
                {booking.code}
              </p>
            </div>

            <div className="!mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={downloadIcs}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#16b1a1] py-3 text-sm font-extrabold text-white transition hover:bg-[#0e8e81]"
              >
                <IconDownload className="h-4 w-4" />
                أضِف إلى تقويمي
              </button>
              <button
                type="button"
                onClick={onAgain}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-extrabold text-gray-600 transition hover:border-[#16b1a1] hover:text-[#16b1a1]"
              >
                <IconArrowBack className="h-4 w-4" />
                حجز موعد آخر
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  ltr,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-50 pb-3 last:border-0">
      <span className="flex items-center gap-2 text-[13px] font-bold text-gray-400">
        {icon}
        {label}
      </span>
      <span
        dir={ltr ? "ltr" : undefined}
        className="min-w-0 truncate text-sm font-extrabold text-gray-800"
      >
        {value}
      </span>
    </div>
  );
}

/** اسم مختصر للمنطقة الزمنية بالعربية عند توفره. */
function tzLabel(tz: string): string {
  const known: Record<string, string> = {
    "Asia/Riyadh": "توقيت السعودية",
    "Asia/Bahrain": "توقيت البحرين",
    "Asia/Kuwait": "توقيت الكويت",
    "Asia/Qatar": "توقيت قطر",
    "Asia/Dubai": "توقيت الإمارات",
    "Asia/Baghdad": "توقيت العراق",
    "Asia/Amman": "توقيت الأردن",
    "Africa/Cairo": "توقيت مصر",
    UTC: "التوقيت العالمي",
  };
  return known[tz] ?? tz;
}
