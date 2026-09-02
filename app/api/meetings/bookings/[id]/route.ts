import { NextRequest, NextResponse } from "next/server";
import { deleteBooking, updateBooking, type BookingPatch } from "@/app/meetings/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** تعديل حجز — رابط الاجتماع، ملاحظة المالك، الموضوع، أو الحالة. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const patch: BookingPatch = {};
  if (typeof body.meetingUrl === "string") patch.meetingUrl = body.meetingUrl;
  if (typeof body.adminNote === "string") patch.adminNote = body.adminNote;
  if (typeof body.topic === "string") patch.topic = body.topic;
  if (body.status === "confirmed" || body.status === "cancelled") patch.status = body.status;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const booking = await updateBooking(id, patch);
    if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (err) {
    console.error("meetings booking PATCH failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const removed = await deleteBooking(id);
    if (!removed) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("meetings booking DELETE failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
