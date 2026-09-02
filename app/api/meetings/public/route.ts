import { NextRequest, NextResponse } from "next/server";
import {
  addDays,
  generateSlots,
  monthBounds,
  monthOf,
  publicInfo,
  zonedNow,
  type MonthPayload,
  type Slot,
} from "@/app/meetings/model";
import { getSettings, listBookingsBetween } from "@/app/meetings/store";

export const dynamic = "force-dynamic";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** فترات شهر كامل لصفحة الحجز العامة. */
export async function GET(req: NextRequest) {
  try {
    const settings = await getSettings();
    const now = zonedNow(settings.timezone);

    const asked = req.nextUrl.searchParams.get("month") ?? "";
    const month = MONTH_RE.test(asked) ? asked : monthOf(now.date);
    const { first, last } = monthBounds(month);

    const bookings = await listBookingsBetween(first, last);

    const days: Record<string, Slot[]> = {};
    for (let d = first; d <= last; d = addDays(d, 1)) {
      const slots = generateSlots(settings, d, bookings, now);
      if (slots.length) days[d] = slots;
    }

    const payload: MonthPayload = {
      info: publicInfo(settings),
      month,
      today: now.date,
      lastDate: addDays(now.date, settings.horizonDays),
      days,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("meetings public GET failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
