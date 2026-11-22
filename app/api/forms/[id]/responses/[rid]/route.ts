import { denyUnlessAdmin } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";
import { deleteResponse, ID_PATTERN } from "@/app/forms/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; rid: string }> };

/** حذف ردّ واحد — للوحة الإدارة. */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { id, rid } = await ctx.params;
  if (!ID_PATTERN.test(id) || !/^[A-Za-z0-9_-]{1,64}$/.test(rid)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  try {
    const ok = await deleteResponse(id, rid);
    if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("forms response DELETE failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
