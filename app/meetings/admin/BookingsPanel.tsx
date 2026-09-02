"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildIcs,
  fmtDateAr,
  fmtSpan,
  fmtTime,
  publicInfo,
  type Booking,
  type Settings,
} from "../model";
import {
  IconBan,
  IconCalendar,
  IconCheck,
  IconCheckCircle,
  IconClose,
  IconDownload,
  IconLink,
  IconNote,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
} from "../components/icons";
import {
  Banner,
  Card,
  EmptyState,
  Field,
  TextArea,
  TextInput,
  TimeInput,
  inputBase,
} from "../components/ui";
import type { Api } from "./AdminApp";

type Filter = "upcoming" | "today" | "past" | "cancelled" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "upcoming", label: "القادمة" },
  { key: "today", label: "اليوم" },
  { key: "past", label: "السابقة" },
  { key: "cancelled", label: "الملغاة" },
  { key: "all", label: "الكل" },
];

export default function BookingsPanel({
  api,
  bookings,
  setBookings,
  settings,
  today,
  onReload,
}: {
  api: Api;
  bookings: Booking[];
  setBookings: (next: Booking[]) => void;
  settings: Settings;
  today: string;
  onReload: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const counts = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    return {
      upcoming: confirmed.filter((b) => b.date >= today).length,
      today: confirmed.filter((b) => b.date === today).length,
      past: confirmed.filter((b) => b.date < today).length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      all: bookings.length,
    } as Record<Filter, number>;
  }, [bookings, today]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => {
        if (filter === "cancelled") return b.status === "cancelled";
        if (b.status === "cancelled") return filter === "all";
        if (filter === "upcoming") return b.date >= today;
        if (filter === "today") return b.date === today;
        if (filter === "past") return b.date < today;
        return true;
      })
      .filter((b) =>
        q
          ? [b.name, b.contact, b.topic, b.code, b.note].some((v) => v.toLowerCase().includes(q))
          : true
      )
      .sort((a, b) => {
        const asc = filter === "upcoming" || filter === "today";
        const cmp = (a.date + a.start).localeCompare(b.date + b.start);
        return asc ? cmp : -cmp;
      });
  }, [bookings, filter, query, today]);

  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of visible) {
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    return [...map.entries()];
  }, [visible]);

  const open = bookings.find((b) => b.id === openId) ?? null;

  const replace = (updated: Booking) =>
    setBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));

  const remove = (id: string) => {
    setBookings(bookings.filter((b) => b.id !== id));
    setOpenId(null);
  };

  return (
    <>
      <div className="space-y-5">
        {/* أدوات التصفية والبحث */}
        <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-gray-100 md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-bold transition ${
                  filter === f.key
                    ? "bg-[#16b1a1] text-white shadow-sm"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f.label}
                <span
                  dir="ltr"
                  className={`rounded-md px-1.5 text-[11px] tabular-nums ${
                    filter === f.key ? "bg-white/20" : "bg-white text-gray-400"
                  }`}
                >
                  {counts[f.key]}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setAdding(true)}
              className="ms-auto inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#16b1a1]/50 px-3.5 py-2 text-[13px] font-bold text-[#0e8e81] transition hover:bg-[#f0faf9]"
            >
              <IconPlus className="h-3.5 w-3.5" />
              حجز يدوي
            </button>
          </div>

          <div className="relative mt-3">
            <IconSearch className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-300" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالاسم، وسيلة التواصل، الموضوع، أو الرقم المرجعي"
              className={`${inputBase} pr-10`}
            />
          </div>
        </div>

        {/* القائمة */}
        {grouped.length === 0 ? (
          <Card>
            <EmptyState
              icon={<IconCalendar className="h-10 w-10" />}
              title={query ? "لا توجد نتائج مطابقة" : "لا توجد حجوزات في هذا التصنيف"}
              hint={query ? "جرّب كلمة بحث أخرى" : "ستظهر الحجوزات هنا فور استلامها"}
            />
          </Card>
        ) : (
          <div className="space-y-5">
            {grouped.map(([date, items]) => (
              <div key={date}>
                <div className="mb-2.5 flex items-center gap-3 px-1">
                  <h3 className="text-[13px] font-extrabold text-gray-700">{fmtDateAr(date)}</h3>
                  {date === today && (
                    <span className="rounded-full bg-[#16b1a1]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#0e8e81]">
                      اليوم
                    </span>
                  )}
                  <span className="h-px flex-1 bg-gray-100" />
                  <span dir="ltr" className="text-[11px] font-bold tabular-nums text-gray-300">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {items.map((b) => (
                    <BookingRow key={b.id} booking={b} onOpen={() => setOpenId(b.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <BookingDetails
          api={api}
          booking={open}
          settings={settings}
          onClose={() => setOpenId(null)}
          onSaved={replace}
          onDeleted={() => remove(open.id)}
        />
      )}

      {adding && (
        <ManualBooking
          api={api}
          settings={settings}
          today={today}
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            onReload();
          }}
        />
      )}
    </>
  );
}

/* ── بطاقة حجز في القائمة ── */

function BookingRow({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  const cancelled = booking.status === "cancelled";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-right shadow-sm ring-1 transition hover:shadow-md ${
        cancelled ? "opacity-60 ring-gray-100" : "ring-gray-100 hover:ring-[#16b1a1]/40"
      }`}
    >
      <div
        className={`grid w-20 shrink-0 place-items-center rounded-xl py-2 ${
          cancelled ? "bg-gray-50 text-gray-400" : "bg-[#f0faf9] text-[#0e8e81]"
        }`}
      >
        <span dir="ltr" className="text-sm font-extrabold tabular-nums">
          {fmtTime(booking.start)}
        </span>
        <span className="mt-0.5 text-[10px] font-bold opacity-60">{fmtTime(booking.end)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-extrabold text-gray-800">{booking.name}</p>
          {cancelled && (
            <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold text-red-500">
              ملغي
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs font-medium text-gray-400">
          {booking.topic || booking.contact || "بدون موضوع"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!cancelled &&
          (booking.meetingUrl ? (
            <span
              title="تم تعيين رابط الاجتماع"
              className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-500"
            >
              <IconLink className="h-4 w-4" />
            </span>
          ) : (
            <span
              title="بانتظار رابط الاجتماع"
              className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-500"
            >
              <IconLink className="h-4 w-4" />
            </span>
          ))}
        <span dir="ltr" className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-extrabold tracking-wider text-gray-400">
          {booking.code}
        </span>
      </div>
    </button>
  );
}

/* ── لوحة التفاصيل ── */

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-gray-100 p-5">
          <h2 className="text-base font-extrabold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-xl text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

function BookingDetails({
  api,
  booking,
  settings,
  onClose,
  onSaved,
  onDeleted,
}: {
  api: Api;
  booking: Booking;
  settings: Settings;
  onClose: () => void;
  onSaved: (b: Booking) => void;
  onDeleted: () => void;
}) {
  const [meetingUrl, setMeetingUrl] = useState(booking.meetingUrl);
  const [topic, setTopic] = useState(booking.topic);
  const [adminNote, setAdminNote] = useState(booking.adminNote);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const dirty =
    meetingUrl !== booking.meetingUrl || topic !== booking.topic || adminNote !== booking.adminNote;

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    try {
      const res = await api(`/api/meetings/bookings/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: { booking: Booking } = await res.json();
      onSaved(data.booking);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("تعذر حفظ التعديل — حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  const destroy = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api(`/api/meetings/bookings/${booking.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      onDeleted();
    } catch {
      setError("تعذر حذف الحجز — حاول مرة أخرى.");
      setBusy(false);
    }
  };

  const summary = [
    `مرحباً ${booking.name}،`,
    `موعدنا: ${fmtDateAr(booking.date)}`,
    `الوقت: ${fmtSpan(booking.start, booking.end)}`,
    meetingUrl ? `رابط الاجتماع: ${meetingUrl}` : settings.location ? `المكان: ${settings.location}` : "",
    `الرقم المرجعي: ${booking.code}`,
  ]
    .filter(Boolean)
    .join("\n");

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("تعذر النسخ من هذا المتصفح.");
    }
  };

  const downloadIcs = () => {
    const blob = new Blob([buildIcs({ ...booking, meetingUrl }, publicInfo(settings))], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-${booking.code}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const cancelled = booking.status === "cancelled";

  return (
    <Drawer title="تفاصيل الحجز" onClose={onClose}>
      <div className="space-y-5">
        {/* الملخص */}
        <div className="rounded-2xl bg-[#f0faf9] p-4">
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-[#16b1a1]" />
            <p className="text-sm font-extrabold text-gray-800">{fmtDateAr(booking.date)}</p>
          </div>
          <p dir="ltr" className="mt-1.5 text-right text-sm font-extrabold text-[#0e8e81]">
            {fmtSpan(booking.start, booking.end)}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white pt-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                cancelled ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {cancelled ? <IconBan className="h-3 w-3" /> : <IconCheckCircle className="h-3 w-3" />}
              {cancelled ? "ملغي" : "مؤكد"}
            </span>
            <span dir="ltr" className="text-[11px] font-extrabold tracking-[0.2em] text-gray-400">
              {booking.code}
            </span>
          </div>
        </div>

        {/* بيانات الحاجز */}
        <div className="space-y-2.5">
          <Line icon={<IconUser className="h-4 w-4" />} label="الاسم" value={booking.name} />
          {booking.contact && (
            <Line icon={<IconPhone className="h-4 w-4" />} label="التواصل" value={booking.contact} ltr />
          )}
          {booking.note && (
            <Line icon={<IconNote className="h-4 w-4" />} label="ملاحظة الحاجز" value={booking.note} block />
          )}
          {booking.createdAt && (
            <Line
              label="تاريخ الحجز"
              value={new Date(booking.createdAt).toLocaleString("ar", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
          )}
        </div>

        {error && <Banner tone="error">{error}</Banner>}
        {saved && <Banner tone="success">تم حفظ التعديل.</Banner>}

        {/* التعديل */}
        <div className="space-y-4 rounded-2xl border border-gray-100 p-4">
          <Field label="رابط الاجتماع" hint="يظهر للحاجز عند مشاركته معه، ويُدرج في ملف التقويم">
            <TextInput
              value={meetingUrl}
              onValue={setMeetingUrl}
              dir="ltr"
              placeholder="https://meet.google.com/..."
            />
          </Field>

          <Field label="موضوع الاجتماع">
            <TextInput value={topic} onValue={setTopic} placeholder="بدون موضوع" />
          </Field>

          <Field label="ملاحظة خاصة بك" hint="لا تظهر للحاجز">
            <TextArea value={adminNote} onValue={setAdminNote} rows={3} placeholder="تحضير، نقاط للنقاش…" />
          </Field>

          <button
            type="button"
            disabled={!dirty || busy}
            onClick={() => patch({ meetingUrl, topic, adminNote })}
            className="w-full rounded-2xl bg-[#16b1a1] py-3 text-sm font-extrabold text-white transition hover:bg-[#0e8e81] disabled:cursor-not-allowed disabled:bg-gray-200"
          >
            {busy ? "جارٍ الحفظ…" : dirty ? "حفظ التعديلات" : "لا توجد تغييرات"}
          </button>
        </div>

        {/* إجراءات */}
        <div className="grid grid-cols-2 gap-2.5">
          <ActionButton onClick={copySummary} icon={<IconCheck className="h-4 w-4" />}>
            {copied ? "تم النسخ" : "نسخ رسالة التأكيد"}
          </ActionButton>
          <ActionButton onClick={downloadIcs} icon={<IconDownload className="h-4 w-4" />}>
            ملف التقويم
          </ActionButton>
        </div>

        <div className="space-y-2.5 border-t border-gray-100 pt-5">
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ status: cancelled ? "confirmed" : "cancelled" })}
            className={`w-full rounded-2xl border py-3 text-sm font-extrabold transition disabled:opacity-50 ${
              cancelled
                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                : "border-amber-200 text-amber-600 hover:bg-amber-50"
            }`}
          >
            {cancelled ? "إعادة تأكيد الحجز" : "إلغاء الحجز (تُحرَّر الفترة)"}
          </button>

          {confirmDelete ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
              <p className="text-xs font-bold text-red-700">حذف الحجز نهائياً؟ لا يمكن التراجع.</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={destroy}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  نعم، احذف
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-xl bg-white py-2.5 text-xs font-extrabold text-gray-500"
                >
                  تراجع
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <IconTrash className="h-4 w-4" />
              حذف الحجز
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function Line({
  icon,
  label,
  value,
  ltr,
  block,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
  block?: boolean;
}) {
  if (block) {
    return (
      <div className="rounded-xl bg-gray-50 p-3.5">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
          {icon}
          {label}
        </p>
        <p className="mt-1.5 whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-gray-700">
          {value}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-[12px] font-bold text-gray-400">
        {icon}
        {label}
      </span>
      <span dir={ltr ? "ltr" : undefined} className="min-w-0 truncate text-[13px] font-extrabold text-gray-700">
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-xs font-extrabold text-gray-600 transition hover:border-[#16b1a1] hover:text-[#16b1a1]"
    >
      {icon}
      {children}
    </button>
  );
}

/* ── حجز يدوي من اللوحة ── */

function ManualBooking({
  api,
  settings,
  today,
  onClose,
  onCreated,
}: {
  api: Api;
  settings: Settings;
  today: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [date, setDate] = useState(today);
  const [start, setStart] = useState("10:00");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = async () => {
    setBusy(true);
    setErrors([]);
    try {
      const res = await api("/api/meetings/bookings", {
        method: "POST",
        body: JSON.stringify({ manual: true, date, start, name, contact, topic, note }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(body.messages ?? [body.message ?? "تعذر إنشاء الحجز."]);
        return;
      }
      onCreated();
    } catch {
      setErrors(["تعذر الاتصال بالخادم."]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer title="حجز يدوي" onClose={onClose}>
      <div className="space-y-4">
        <Banner tone="info">
          الحجز اليدوي يتجاوز أوقات التوفر ومهلة الإشعار، لكنه يرفض التعارض مع حجز مؤكد.
        </Banner>

        {errors.length > 0 && (
          <Banner tone="error">
            <ul className="space-y-1">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Banner>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="التاريخ" required>
            <input
              type="date"
              dir="ltr"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputBase} text-center font-bold tabular-nums`}
            />
          </Field>
          <Field label="وقت البداية" required>
            <TimeInput value={start} onValue={setStart} />
          </Field>
        </div>

        <p className="-mt-1 text-[11px] font-medium text-gray-400">
          المدة المعتمدة: {settings.slotMinutes} دقيقة (من الإعدادات).
        </p>

        <Field label="الاسم" required>
          <TextInput value={name} onValue={setName} placeholder="اسم الشخص" />
        </Field>
        <Field label="وسيلة التواصل">
          <TextInput value={contact} onValue={setContact} dir="ltr" className="text-right" />
        </Field>
        <Field label="الموضوع">
          <TextInput value={topic} onValue={setTopic} />
        </Field>
        <Field label="ملاحظة">
          <TextArea value={note} onValue={setNote} rows={3} />
        </Field>

        <button
          type="button"
          disabled={busy || name.trim().length < 2}
          onClick={submit}
          className="w-full rounded-2xl bg-[#16b1a1] py-3 text-sm font-extrabold text-white transition hover:bg-[#0e8e81] disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          {busy ? "جارٍ الإضافة…" : "إضافة الحجز"}
        </button>
      </div>
    </Drawer>
  );
}
