/**
 * نظام حجز المواعيد — نموذج البيانات والحسابات المشتركة بين الخادم والمتصفح.
 *
 * كل التواريخ نصية بصيغة YYYY-MM-DD وكل الأوقات بصيغة HH:MM،
 * وتُفسَّر جميعها بحسب المنطقة الزمنية المحفوظة في الإعدادات.
 */

/* ── الأنواع ── */

export interface TimeRange {
  id: string;
  start: string; // HH:MM
  end: string; // HH:MM
}

/** قاعدة يوم من أيام الأسبوع (0 = الأحد). */
export interface DayRule {
  enabled: boolean;
  ranges: TimeRange[];
}

/** استثناء لتاريخ محدد — إجازة أو أوقات خاصة تتجاوز قاعدة الأسبوع. */
export interface DateOverride {
  id: string;
  date: string; // YYYY-MM-DD
  closed: boolean;
  ranges: TimeRange[];
  note: string;
}

export interface Settings {
  title: string;
  description: string;
  timezone: string; // IANA
  slotMinutes: number; // مدة الاجتماع
  bufferMinutes: number; // فاصل بين اجتماعين
  noticeHours: number; // أقل مهلة قبل موعد الحجز
  horizonDays: number; // مدى الحجز المستقبلي بالأيام
  maxPerDay: number; // حد أقصى للحجوزات في اليوم (0 = بلا حد)
  weekly: DayRule[]; // سبعة عناصر بدءاً من الأحد
  overrides: DateOverride[];
  location: string; // مكان الاجتماع الافتراضي أو ملاحظة عنه
  active: boolean; // استقبال الحجوزات
  pausedMessage: string; // رسالة تظهر عند الإيقاف
  showNames: boolean; // إظهار أسماء الحاجزين في الصفحة العامة
  requireContact: boolean; // إلزام وسيلة التواصل
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  code: string; // رقم مرجعي للحاجز
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  name: string;
  contact: string; // جوال أو بريد
  topic: string; // موضوع الاجتماع
  note: string; // ملاحظة من الحاجز
  status: BookingStatus;
  meetingUrl: string; // رابط الاجتماع — يعيّنه المالك
  adminNote: string; // ملاحظة خاصة بالمالك
  createdAt: string | null;
  updatedAt: string | null;
}

export type SlotState = "free" | "taken" | "past" | "closed";

export interface Slot {
  start: string;
  end: string;
  state: SlotState;
  name?: string; // اسم الحاجز — يُرسل فقط عند تفعيل إظهار الأسماء
}

/** المعلومات العامة التي تحتاجها صفحة الحجز (بدون تفاصيل حساسة). */
export interface PublicInfo {
  title: string;
  description: string;
  timezone: string;
  slotMinutes: number;
  location: string;
  active: boolean;
  pausedMessage: string;
  showNames: boolean;
  requireContact: boolean;
  horizonDays: number;
  noticeHours: number;
}

export interface MonthPayload {
  info: PublicInfo;
  month: string; // YYYY-MM
  today: string; // اليوم بحسب المنطقة الزمنية للإعدادات
  lastDate: string; // آخر تاريخ متاح للحجز
  days: Record<string, Slot[]>;
}

/* ── نصوص عربية ثابتة (لتفادي اختلاف التنسيق بين الخادم والمتصفح) ── */

export const WEEKDAYS_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export const WEEKDAYS_SHORT_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/* ── أدوات الوقت ── */

export const pad2 = (n: number): string => String(n).padStart(2, "0");

const TIME_RE = /^([01]\d|2[0-4]):([0-5]\d)$/;

export const isValidTime = (t: string): boolean => TIME_RE.test(t) && toMinutes(t) <= 1440;

export function toMinutes(t: string): number {
  const m = TIME_RE.exec(t);
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function fromMinutes(total: number): string {
  const m = Math.max(0, Math.min(1440, Math.round(total)));
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

/** تنسيق ثابت بنظام ١٢ ساعة — لا يعتمد على إعدادات المتصفح. */
export function fmtTime(t: string): string {
  const total = toMinutes(t);
  if (!Number.isFinite(total)) return t;
  const h = Math.floor(total / 60);
  const mm = total % 60;
  const period = h < 12 || h === 24 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(mm)} ${period}`;
}

export const fmtSpan = (start: string, end: string): string => `${fmtTime(start)} − ${fmtTime(end)}`;

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hp = h === 1 ? "ساعة" : h === 2 ? "ساعتان" : h <= 10 ? `${h} ساعات` : `${h} ساعة`;
  return m ? `${hp} و${m} دقيقة` : hp;
}

/* ── أدوات التاريخ ── */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDate(d: string): boolean {
  const m = DATE_RE.exec(d);
  if (!m) return false;
  const [y, mo, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(y, mo - 1, day));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === day;
}

const dateMs = (d: string): number => {
  const m = DATE_RE.exec(d);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

export const fromMs = (ms: number): string => {
  const dt = new Date(ms);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
};

export const addDays = (d: string, n: number): string => fromMs(dateMs(d) + n * 86400000);

/** فرق الأيام: (b − a). */
export const dayDiff = (a: string, b: string): number => Math.round((dateMs(b) - dateMs(a)) / 86400000);

/** 0 = الأحد. */
export const weekdayOf = (d: string): number => new Date(dateMs(d)).getUTCDay();

export const monthOf = (d: string): string => d.slice(0, 7);

export function fmtDateAr(d: string): string {
  const m = DATE_RE.exec(d);
  if (!m) return d;
  return `${WEEKDAYS_AR[weekdayOf(d)]} ${Number(m[3])} ${MONTHS_AR[Number(m[2]) - 1]} ${m[1]}`;
}

export function fmtDateShortAr(d: string): string {
  const m = DATE_RE.exec(d);
  if (!m) return d;
  return `${Number(m[3])} ${MONTHS_AR[Number(m[2]) - 1]} ${m[1]}`;
}

export function fmtMonthAr(month: string): string {
  const [y, mo] = month.split("-");
  return `${MONTHS_AR[Number(mo) - 1]} ${y}`;
}

/** أول وآخر يوم في الشهر (YYYY-MM). */
export function monthBounds(month: string): { first: string; last: string } {
  const [y, mo] = [Number(month.slice(0, 4)), Number(month.slice(5, 7))];
  const first = `${month}-01`;
  const last = fromMs(Date.UTC(y, mo, 0));
  return { first, last };
}

export function shiftMonth(month: string, n: number): string {
  const y = Number(month.slice(0, 4));
  const mo = Number(month.slice(5, 7));
  const dt = new Date(Date.UTC(y, mo - 1 + n, 1));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}`;
}

/* ── المنطقة الزمنية ── */

/** اللحظة الحالية معبَّراً عنها بتاريخ ودقائق داخل المنطقة الزمنية المطلوبة. */
export function zonedNow(timezone: string, at: Date = new Date()): { date: string; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(at);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
    const hour = get("hour") % 24;
    return {
      date: `${pad2(get("year")).padStart(4, "0")}-${pad2(get("month"))}-${pad2(get("day"))}`,
      minutes: hour * 60 + get("minute"),
    };
  } catch {
    return zonedNow("UTC", at);
  }
}

/** تحويل تاريخ/وقت في منطقة زمنية إلى لحظة UTC حقيقية. */
export function zonedToUtc(timezone: string, date: string, time: string): Date {
  const ms = dateMs(date);
  const mins = toMinutes(time);
  const naive = ms + mins * 60000;
  const guess = new Date(naive);
  const back = zonedNow(timezone, guess);
  const offset = dayDiff(date, back.date) * 1440 + (back.minutes - mins);
  return new Date(naive - offset * 60000);
}

/* ── توليد الفترات ── */

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number): boolean =>
  aStart < bEnd && bStart < aEnd;

/** الفترات الزمنية المعتمدة لتاريخ معيّن، مع مراعاة الاستثناءات. */
export function rangesForDate(s: Settings, date: string): { ranges: TimeRange[]; closed: boolean; note: string } {
  const override = s.overrides.find((o) => o.date === date);
  if (override) {
    if (override.closed || override.ranges.length === 0) {
      return { ranges: [], closed: true, note: override.note };
    }
    return { ranges: override.ranges, closed: false, note: override.note };
  }
  const rule = s.weekly[weekdayOf(date)];
  if (!rule || !rule.enabled || rule.ranges.length === 0) {
    return { ranges: [], closed: true, note: "" };
  }
  return { ranges: rule.ranges, closed: false, note: "" };
}

/**
 * كل فترات اليوم مع حالتها. تُستخدم في الواجهة وفي التحقق من صحة الحجز
 * على الخادم — مصدر واحد للحقيقة يمنع الحجز المزدوج.
 */
export function generateSlots(
  s: Settings,
  date: string,
  bookings: Booking[],
  now: { date: string; minutes: number }
): Slot[] {
  if (!isValidDate(date)) return [];

  const diffFromToday = dayDiff(now.date, date);
  if (diffFromToday < 0 || diffFromToday > s.horizonDays) return [];

  const { ranges } = rangesForDate(s, date);
  if (ranges.length === 0) return [];

  const step = Math.max(5, s.slotMinutes + s.bufferMinutes);
  const confirmed = bookings.filter((b) => b.date === date && b.status === "confirmed");
  const dayFull = s.maxPerDay > 0 && confirmed.length >= s.maxPerDay;

  // أقرب دقيقة قابلة للحجز داخل هذا اليوم بعد احتساب مهلة الإشعار
  const earliest = now.minutes + s.noticeHours * 60 - diffFromToday * 1440;

  const seen = new Set<string>();
  const slots: Slot[] = [];

  for (const range of ranges) {
    const from = toMinutes(range.start);
    const to = toMinutes(range.end);
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) continue;

    for (let m = from; m + s.slotMinutes <= to; m += step) {
      const start = fromMinutes(m);
      if (seen.has(start)) continue;
      seen.add(start);

      const end = fromMinutes(m + s.slotMinutes);
      const hit = confirmed.find((b) =>
        overlaps(m, m + s.slotMinutes, toMinutes(b.start), toMinutes(b.end))
      );

      let state: SlotState = "free";
      if (hit) state = "taken";
      else if (m < earliest) state = "past";
      else if (dayFull) state = "closed";

      slots.push({
        start,
        end,
        state,
        ...(hit && s.showNames ? { name: hit.name } : {}),
      });
    }
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

export const countFree = (slots: Slot[]): number => slots.filter((x) => x.state === "free").length;

/* ── الإعدادات الافتراضية ── */

const range = (start: string, end: string): TimeRange => ({ id: newId(), start, end });

export function defaultSettings(): Settings {
  const workday = (): DayRule => ({ enabled: true, ranges: [range("10:00", "13:00"), range("16:00", "20:00")] });
  const off = (): DayRule => ({ enabled: false, ranges: [range("10:00", "13:00")] });
  return {
    title: "احجز موعداً",
    description: "اختر اليوم والوقت المناسب لك، وسأؤكد الموعد وأرسل رابط الاجتماع.",
    timezone: "Asia/Riyadh",
    slotMinutes: 30,
    bufferMinutes: 0,
    noticeHours: 3,
    horizonDays: 30,
    maxPerDay: 0,
    weekly: [workday(), workday(), workday(), workday(), workday(), off(), off()],
    overrides: [],
    location: "اجتماع عن بُعد",
    active: true,
    pausedMessage: "الحجز متوقف مؤقتاً، تواصل معي مباشرة وسأرتب لك موعداً.",
    showNames: true,
    requireContact: true,
  };
}

/* ── معرّفات ── */

export const newId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return out;
}

/* ── تنظيف البيانات الواردة ── */

const cleanStr = (v: unknown, max = 300): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

const cleanInt = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

const cleanArr = (v: unknown, max: number): unknown[] => (Array.isArray(v) ? v.slice(0, max) : []);

function cleanRanges(v: unknown): TimeRange[] {
  const out: TimeRange[] = [];
  for (const raw of cleanArr(v, 12)) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const start = cleanStr(r.start, 5);
    const end = cleanStr(r.end, 5);
    if (!isValidTime(start) || !isValidTime(end) || toMinutes(end) <= toMinutes(start)) continue;
    out.push({ id: cleanStr(r.id, 40) || newId(), start, end });
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export function sanitizeSettings(input: unknown): Settings {
  const base = defaultSettings();
  if (!input || typeof input !== "object") return base;
  const d = input as Record<string, unknown>;

  const weeklyRaw = cleanArr(d.weekly, 7);
  const weekly: DayRule[] = base.weekly.map((fallback, i) => {
    const raw = (weeklyRaw[i] ?? null) as Record<string, unknown> | null;
    if (!raw) return fallback;
    return { enabled: raw.enabled === true, ranges: cleanRanges(raw.ranges) };
  });

  const overrides: DateOverride[] = [];
  for (const raw of cleanArr(d.overrides, 120)) {
    const o = (raw ?? {}) as Record<string, unknown>;
    const date = cleanStr(o.date, 10);
    if (!isValidDate(date) || overrides.some((x) => x.date === date)) continue;
    overrides.push({
      id: cleanStr(o.id, 40) || newId(),
      date,
      closed: o.closed !== false,
      ranges: cleanRanges(o.ranges),
      note: cleanStr(o.note, 200),
    });
  }
  overrides.sort((a, b) => a.date.localeCompare(b.date));

  let timezone = cleanStr(d.timezone, 60) || base.timezone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    timezone = base.timezone;
  }

  return {
    title: cleanStr(d.title, 120) || base.title,
    description: cleanStr(d.description, 500),
    timezone,
    slotMinutes: cleanInt(d.slotMinutes, 5, 480, base.slotMinutes),
    bufferMinutes: cleanInt(d.bufferMinutes, 0, 240, base.bufferMinutes),
    noticeHours: cleanInt(d.noticeHours, 0, 720, base.noticeHours),
    horizonDays: cleanInt(d.horizonDays, 1, 365, base.horizonDays),
    maxPerDay: cleanInt(d.maxPerDay, 0, 50, base.maxPerDay),
    weekly,
    overrides,
    location: cleanStr(d.location, 200),
    active: d.active !== false,
    pausedMessage: cleanStr(d.pausedMessage, 300) || base.pausedMessage,
    showNames: d.showNames === true,
    requireContact: d.requireContact === true,
  };
}

export function publicInfo(s: Settings): PublicInfo {
  return {
    title: s.title,
    description: s.description,
    timezone: s.timezone,
    slotMinutes: s.slotMinutes,
    location: s.location,
    active: s.active,
    pausedMessage: s.pausedMessage,
    showNames: s.showNames,
    requireContact: s.requireContact,
    horizonDays: s.horizonDays,
    noticeHours: s.noticeHours,
  };
}

export function sanitizeBooking(input: unknown, id: string): Booking {
  const d = (input ?? {}) as Record<string, unknown>;
  const date = cleanStr(d.date, 10);
  const start = cleanStr(d.start, 5);
  const end = cleanStr(d.end, 5);
  return {
    id,
    code: cleanStr(d.code, 12),
    date: isValidDate(date) ? date : "",
    start: isValidTime(start) ? start : "",
    end: isValidTime(end) ? end : "",
    name: cleanStr(d.name, 80),
    contact: cleanStr(d.contact, 120),
    topic: cleanStr(d.topic, 200),
    note: cleanStr(d.note, 1000),
    status: d.status === "cancelled" ? "cancelled" : "confirmed",
    meetingUrl: cleanStr(d.meetingUrl, 500),
    adminNote: cleanStr(d.adminNote, 1000),
    createdAt: typeof d.createdAt === "string" ? d.createdAt : null,
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : null,
  };
}

/* ── طلب الحجز القادم من الزائر ── */

export interface BookingInput {
  date: string;
  start: string;
  name: string;
  contact: string;
  topic: string;
  note: string;
}

export function sanitizeBookingInput(input: unknown): BookingInput {
  const d = (input ?? {}) as Record<string, unknown>;
  return {
    date: cleanStr(d.date, 10),
    start: cleanStr(d.start, 5),
    name: cleanStr(d.name, 80),
    contact: cleanStr(d.contact, 120),
    topic: cleanStr(d.topic, 200),
    note: cleanStr(d.note, 1000),
  };
}

/** تحقق يعمل في المتصفح وعلى الخادم — الرسائل تُعرض كما هي للمستخدم. */
export function validateBookingInput(input: BookingInput, requireContact: boolean): string[] {
  const errors: string[] = [];
  if (input.name.length < 2) errors.push("الاسم مطلوب (حرفان على الأقل).");
  if (requireContact && input.contact.length < 5) errors.push("وسيلة التواصل مطلوبة (جوال أو بريد إلكتروني).");
  if (!isValidDate(input.date)) errors.push("التاريخ غير صحيح.");
  if (!isValidTime(input.start)) errors.push("الوقت غير صحيح.");
  return errors;
}

/* ── ملف تقويم (ics) لإضافة الموعد إلى تقويم الحاجز ── */

const icsEscape = (v: string): string => v.replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");

const icsStamp = (d: Date): string => `${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

export function buildIcs(b: Booking, s: PublicInfo): string {
  const startAt = zonedToUtc(s.timezone, b.date, b.start);
  const endAt = zonedToUtc(s.timezone, b.date, b.end);
  const summary = b.topic ? `${s.title} — ${b.topic}` : s.title;
  const description = [b.note, b.meetingUrl && `رابط الاجتماع: ${b.meetingUrl}`, `الرقم المرجعي: ${b.code}`]
    .filter(Boolean)
    .join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//hussainlutfi//meetings//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id || b.code}@hussainlutfi`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(startAt)}`,
    `DTEND:${icsStamp(endAt)}`,
    `SUMMARY:${icsEscape(summary)}`,
    `LOCATION:${icsEscape(b.meetingUrl || s.location)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
