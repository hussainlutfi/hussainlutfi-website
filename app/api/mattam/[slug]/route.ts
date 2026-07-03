import { NextRequest, NextResponse } from "next/server";
import { getMattamDoc, saveMattamDoc, SLUG_PATTERN } from "@/app/wadi/mattam/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  try {
    const doc = await getMattamDoc(slug);
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err) {
    console.error("mattam GET failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  let body: { data?: unknown; baseRev?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const baseRev = Number(body.baseRev);
  if (!Number.isInteger(baseRev) || baseRev < 0 || typeof body.data !== "object" || body.data === null) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await saveMattamDoc(slug, body.data, baseRev);
    if (!result.ok) {
      return NextResponse.json({ error: "conflict", current: result.current }, { status: 409 });
    }
    return NextResponse.json({ rev: result.rev, updatedAt: result.updatedAt });
  } catch (err) {
    console.error("mattam PUT failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
