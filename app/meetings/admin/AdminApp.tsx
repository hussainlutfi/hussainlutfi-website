"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  defaultSettings,
  zonedNow,
  type Booking,
  type Settings,
} from "../model";
import {
  IconCalendar,
  IconLink,
  IconList,
  IconLock,
  IconRefresh,
  IconSettings,
  IconSpark,
} from "../components/icons";
import { Banner, Spinner, TextInput } from "../components/ui";
import AvailabilityPanel from "./AvailabilityPanel";
import BookingsPanel from "./BookingsPanel";

const KEY_STORAGE = "meetings:adminKey";

export type Api = (path: string, init?: RequestInit) => Promise<Response>;

type Tab = "bookings" | "availability";

export default function AdminApp() {
  const [adminKey, setAdminKey] = useState("");
  const [keyReady, setKeyReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [nonce, setNonce] = useState(0);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>("bookings");

  useEffect(() => {
    try {
      setAdminKey(localStorage.getItem(KEY_STORAGE) ?? "");
    } catch {
      /* تجاهل */
    }
    setKeyReady(true);
  }, []);

  const api = useCallback<Api>(
    (path, init = {}) => {
      const headers = new Headers(init.headers);
      headers.set("Content-Type", "application/json");
      if (adminKey) headers.set("x-admin-key", adminKey);
      return fetch(path, { ...init, headers, cache: "no-store" });
    },
    [adminKey]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await api("/api/meetings/bookings");
      if (res.status === 401) {
        setRejected(adminKey.length > 0);
        setLocked(true);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const body: { bookings: Booking[]; settings: Settings } = await res.json();
      setBookings(body.bookings);
      setSettings(body.settings);
      setLocked(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [api, adminKey]);

  // nonce يعيد المحاولة حتى عند إعادة إدخال المفتاح نفسه
  useEffect(() => {
    if (keyReady) load();
  }, [keyReady, load, nonce]);

  const today = useMemo(
    () => zonedNow(settings?.timezone ?? defaultSettings().timezone).date,
    [settings?.timezone]
  );

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    return {
      upcoming: confirmed.filter((b) => b.date >= today).length,
      today: confirmed.filter((b) => b.date === today).length,
      needsLink: confirmed.filter((b) => b.date >= today && !b.meetingUrl).length,
      total: bookings.length,
    };
  }, [bookings, today]);

  if (locked) {
    return (
      <KeyGate
        value={adminKey}
        rejected={rejected}
        onSubmit={(k) => {
          try {
            localStorage.setItem(KEY_STORAGE, k);
          } catch {
            /* تجاهل */
          }
          setAdminKey(k);
          setRejected(false);
          setLocked(false);
          setLoading(true);
          setNonce((n) => n + 1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f8f7] pb-28">
      <div className="mx-auto w-[94%] max-w-6xl pt-6 md:pt-10">
        {/* ─── الترويسة ─── */}
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-[#16b1a1] via-[#12a091] to-[#0e8e81] p-6 text-white shadow-xl shadow-teal-900/15 md:p-9">
          <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-wide text-white/70">لوحة المواعيد</p>
              <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">إدارة الحجوزات والأوقات</h1>
              <p className="mt-2 text-sm font-medium text-white/75">
                {settings?.active ? "الحجز مفتوح للزوار" : "الحجز متوقف حالياً"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/meetings"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur-sm transition hover:bg-white/25"
              >
                <IconLink className="h-3.5 w-3.5" />
                صفحة الحجز
              </Link>
              <button
                type="button"
                onClick={load}
                aria-label="تحديث"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
              >
                <IconRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* مؤشرات سريعة */}
          <div className="relative mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="حجوزات اليوم" value={stats.today} />
            <Stat label="حجوزات قادمة" value={stats.upcoming} />
            <Stat label="بانتظار رابط" value={stats.needsLink} highlight={stats.needsLink > 0} />
            <Stat label="إجمالي الحجوزات" value={stats.total} />
          </div>
        </header>

        {/* ─── التبويبات ─── */}
        <nav className="mt-5 inline-flex w-full rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100 sm:w-auto">
          <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")} icon={<IconList className="h-4 w-4" />}>
            الحجوزات
          </TabButton>
          <TabButton
            active={tab === "availability"}
            onClick={() => setTab("availability")}
            icon={<IconSettings className="h-4 w-4" />}
          >
            الأوقات المتاحة
          </TabButton>
        </nav>

        {loadError && (
          <div className="mt-5">
            <Banner
              tone="error"
              action={
                <button
                  type="button"
                  onClick={load}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  إعادة المحاولة
                </button>
              }
            >
              تعذر الاتصال بقاعدة البيانات.
            </Banner>
          </div>
        )}

        {/* ─── المحتوى ─── */}
        {loading && !settings ? (
          <div className="mt-6 rounded-[1.75rem] bg-white p-16 text-center shadow-sm ring-1 ring-gray-100">
            <Spinner />
            <p className="mt-4 text-sm font-bold text-gray-400">جارٍ تحميل البيانات…</p>
          </div>
        ) : settings ? (
          <div className="mt-5">
            {tab === "bookings" ? (
              <BookingsPanel
                api={api}
                bookings={bookings}
                setBookings={setBookings}
                settings={settings}
                today={today}
                onReload={load}
              />
            ) : (
              <AvailabilityPanel api={api} settings={settings} onSaved={setSettings} />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 backdrop-blur-sm ${highlight ? "bg-white/25 ring-1 ring-white/40" : "bg-white/12"}`}
    >
      <p className="text-[11px] font-bold text-white/70">{label}</p>
      <p dir="ltr" className="mt-1 text-right text-2xl font-extrabold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition sm:flex-none ${
        active ? "bg-[#16b1a1] text-white shadow-sm" : "text-gray-500 hover:text-[#0e8e81]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/** بوابة المفتاح — تظهر فقط عند ضبط MEETINGS_ADMIN_KEY على الخادم. */
function KeyGate({
  value,
  rejected,
  onSubmit,
}: {
  value: string;
  rejected: boolean;
  onSubmit: (key: string) => void;
}) {
  const [key, setKey] = useState(value);

  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f8f7] px-6">
      <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-8 text-center shadow-xl shadow-teal-900/5 ring-1 ring-gray-100">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f0faf9] text-[#16b1a1]">
          <IconLock className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-gray-800">لوحة المواعيد</h1>
        <p className="mt-2 text-sm font-medium text-gray-400">أدخل مفتاح الدخول للوصول إلى الحجوزات والإعدادات.</p>

        {rejected && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
            المفتاح غير صحيح — حاول مرة أخرى.
          </div>
        )}

        <div className="mt-5 space-y-3">
          <TextInput
            value={key}
            onValue={setKey}
            type="password"
            dir="ltr"
            placeholder="مفتاح الدخول"
            autoFocus
          />
          <button
            type="button"
            disabled={key.length === 0}
            onClick={() => onSubmit(key)}
            className="w-full rounded-2xl bg-[#16b1a1] py-3 text-sm font-extrabold text-white transition hover:bg-[#0e8e81] disabled:cursor-not-allowed disabled:bg-gray-200"
          >
            دخول
          </button>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-300">
          <IconSpark className="h-3.5 w-3.5" />
          صفحة خاصة بالمالك
        </p>
        <Link
          href="/meetings"
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 transition hover:text-[#16b1a1]"
        >
          <IconCalendar className="h-3.5 w-3.5" />
          الذهاب إلى صفحة الحجز
        </Link>
      </div>
    </div>
  );
}
