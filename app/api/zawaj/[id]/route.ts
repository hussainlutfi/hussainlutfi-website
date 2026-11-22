import { NextRequest, NextResponse } from "next/server";
import { deleteInquiry, ID_PATTERN } from "@/app/zawaj/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** حذف ردّ — من صفحة المراجعة. */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  try {
    const ok = await deleteInquiry(id);
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "not_found" }, { status: 404 });
  } catch (err) {
    console.error("zawaj DELETE failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
