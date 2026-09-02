import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/meetings/admin-auth";
import {
  publicInfo,
  sanitizeBookingInput,
  toMinutes,
  validateBookingInput,
  type Settings,
} from "@/app/meetings/model";
import {
  createBooking,
  createManualBooking,
  getSettings,
  listBookings,
} from "@/app/meetings/store";

export const dynamic = "force-dynamic";

const REASON_TEXT: Record<string, string> = {
  taken: "هذه الفترة حُجزت للتو من شخص آخر — اختر فترة أخرى.",
  unavailable: "هذه الفترة لم تعد متاحة للحجز — حدّث الصفحة واختر فترة أخرى.",
  paused: "الحجز متوقف مؤقتاً في الوقت الحالي.",
};

/** قائمة الحجوزات — للمالك فقط. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const [bookings, settings] = await Promise.all([listBookings(), getSettings()]);
    return NextResponse.json({ bookings, settings });
  } catch (err) {
    console.error("meetings bookings GET failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}

/** إنشاء حجز — عام، أو يدوي من لوحة المالك عند إرسال manual: true. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const manual = body.manual === true;
  if (manual && !isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const input = sanitizeBookingInput(body);

  let settings: Settings;
  try {
    settings = await getSettings();
  } catch (err) {
    console.error("meetings settings read failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  const errors = validateBookingInput(input, manual ? false : settings.requireContact);
  if (errors.length) {
    return NextResponse.json({ error: "invalid", messages: errors }, { status: 400 });
  }

  // الحجز اليدوي يبني نهايته من مدة الاجتماع، فلا بد أن يتسع اليوم للمدة كاملة
  if (manual && toMinutes(input.start) + settings.slotMinutes > 1440) {
    return NextResponse.json(
      { error: "invalid", messages: ["وقت البداية لا يترك مدة كافية قبل نهاية اليوم."] },
      { status: 400 }
    );
  }

  try {
    const result = manual ? await createManualBooking(input) : await createBooking(input);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason, message: REASON_TEXT[result.reason] },
        { status: 409 }
      );
    }
    return NextResponse.json({ booking: result.booking, info: publicInfo(settings) });
  } catch (err) {
    console.error("meetings bookings POST failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
