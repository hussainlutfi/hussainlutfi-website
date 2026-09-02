import { getDb } from "@/lib/firebaseAdmin";
import {
  generateSlots,
  newCode,
  sanitizeBooking,
  sanitizeSettings,
  defaultSettings,
  toMinutes,
  fromMinutes,
  zonedNow,
  type Booking,
  type BookingInput,
  type Settings,
} from "./model";

const SETTINGS_COLLECTION = "meeting_settings";
const SETTINGS_DOC = "default";
const BOOKINGS_COLLECTION = "meeting_bookings";

/* ── الإعدادات ── */

export async function getSettings(): Promise<Settings> {
  const db = getDb();
  const snap = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).get();
  if (!snap.exists) return defaultSettings();
  return sanitizeSettings(snap.get("data"));
}

export async function saveSettings(input: unknown): Promise<Settings> {
  const db = getDb();
  const clean = sanitizeSettings(input);
  await db
    .collection(SETTINGS_COLLECTION)
    .doc(SETTINGS_DOC)
    .set({ data: clean, updatedAt: new Date().toISOString() });
  return clean;
}

/* ── الحجوزات ── */

const readBooking = (doc: FirebaseFirestore.QueryDocumentSnapshot): Booking =>
  sanitizeBooking(doc.data(), doc.id);

export async function listBookings(): Promise<Booking[]> {
  const db = getDb();
  const snap = await db.collection(BOOKINGS_COLLECTION).orderBy("date", "desc").limit(500).get();
  return snap.docs
    .map(readBooking)
    .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start));
}

export async function listBookingsBetween(from: string, to: string): Promise<Booking[]> {
  const db = getDb();
  const snap = await db
    .collection(BOOKINGS_COLLECTION)
    .where("date", ">=", from)
    .where("date", "<=", to)
    .limit(1000)
    .get();
  return snap.docs.map(readBooking);
}

export type CreateResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: "taken" | "unavailable" | "paused" };

/**
 * إنشاء حجز داخل معاملة: نُعيد توليد فترات اليوم من الإعدادات والحجوزات
 * الحالية ونتأكد أن الفترة المطلوبة ما زالت متاحة — يمنع الحجز المزدوج.
 */
export async function createBooking(input: BookingInput): Promise<CreateResult> {
  const db = getDb();
  const settings = await getSettings();
  if (!settings.active) return { ok: false, reason: "paused" };

  const dayQuery = db.collection(BOOKINGS_COLLECTION).where("date", "==", input.date);
  const ref = db.collection(BOOKINGS_COLLECTION).doc();
  const now = new Date().toISOString();

  const outcome = await db.runTransaction<CreateResult>(async (tx) => {
    const snap = await tx.get(dayQuery);
    const dayBookings = snap.docs.map(readBooking);

    const slots = generateSlots(settings, input.date, dayBookings, zonedNow(settings.timezone));
    const slot = slots.find((s) => s.start === input.start);
    if (!slot) return { ok: false, reason: "unavailable" };
    if (slot.state === "taken") return { ok: false, reason: "taken" };
    if (slot.state !== "free") return { ok: false, reason: "unavailable" };

    const booking: Booking = {
      id: ref.id,
      code: newCode(),
      date: input.date,
      start: slot.start,
      end: slot.end,
      name: input.name,
      contact: input.contact,
      topic: input.topic,
      note: input.note,
      status: "confirmed",
      meetingUrl: "",
      adminNote: "",
      createdAt: now,
      updatedAt: now,
    };

    const { id: _id, ...stored } = booking;
    tx.set(ref, stored);
    return { ok: true, booking };
  });

  return outcome;
}

export type BookingPatch = Partial<Pick<Booking, "meetingUrl" | "adminNote" | "status" | "topic">>;

export async function updateBooking(id: string, patch: BookingPatch): Promise<Booking | null> {
  const db = getDb();
  const ref = db.collection(BOOKINGS_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (typeof patch.meetingUrl === "string") updates.meetingUrl = patch.meetingUrl.trim().slice(0, 500);
  if (typeof patch.adminNote === "string") updates.adminNote = patch.adminNote.slice(0, 1000);
  if (typeof patch.topic === "string") updates.topic = patch.topic.trim().slice(0, 200);
  if (patch.status === "confirmed" || patch.status === "cancelled") updates.status = patch.status;

  await ref.update(updates);
  const fresh = await ref.get();
  return sanitizeBooking(fresh.data(), id);
}

export async function deleteBooking(id: string): Promise<boolean> {
  const db = getDb();
  const ref = db.collection(BOOKINGS_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.delete();
  return true;
}

/**
 * حجز يدوي من لوحة المالك — يتجاوز مهلة الإشعار وأوقات التوفر
 * لأن المالك قد يحتاج تثبيت موعد خارج الجدول، لكنه يرفض التعارض.
 */
export async function createManualBooking(input: BookingInput): Promise<CreateResult> {
  const db = getDb();
  const settings = await getSettings();
  const dayQuery = db.collection(BOOKINGS_COLLECTION).where("date", "==", input.date);
  const ref = db.collection(BOOKINGS_COLLECTION).doc();
  const now = new Date().toISOString();
  const startMin = toMinutes(input.start);
  const endMin = startMin + settings.slotMinutes;

  return db.runTransaction<CreateResult>(async (tx) => {
    const snap = await tx.get(dayQuery);
    const clash = snap.docs
      .map(readBooking)
      .some(
        (b) =>
          b.status === "confirmed" &&
          startMin < toMinutes(b.end) &&
          toMinutes(b.start) < endMin
      );
    if (clash) return { ok: false, reason: "taken" };

    const booking: Booking = {
      id: ref.id,
      code: newCode(),
      date: input.date,
      start: input.start,
      end: fromMinutes(endMin),
      name: input.name,
      contact: input.contact,
      topic: input.topic,
      note: input.note,
      status: "confirmed",
      meetingUrl: "",
      adminNote: "",
      createdAt: now,
      updatedAt: now,
    };

    const { id: _id, ...stored } = booking;
    tx.set(ref, stored);
    return { ok: true, booking };
  });
}
