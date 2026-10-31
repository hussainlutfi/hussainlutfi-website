import { NextRequest, NextResponse } from "next/server";
import { sanitizeFormInput, validateFormInput } from "@/app/forms/model";
import {
  deleteForm,
  getForm,
  ID_PATTERN,
  listResponses,
  setFormOpen,
  updateForm,
} from "@/app/forms/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const badId = () => NextResponse.json({ error: "invalid_id" }, { status: 400 });
const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404 });
const unavailable = (where: string, err: unknown) => {
  console.error(`forms ${where} failed:`, err);
  return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
};

/** النموذج مع ردوده — للوحة الإدارة. */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return badId();
  try {
    const form = await getForm(id);
    if (!form) return notFound();
    const responses = await listResponses(id);
    return NextResponse.json({ form, responses });
  } catch (err) {
    return unavailable("GET", err);
  }
}

/** تعديل العنوان والأسئلة. */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return badId();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const input = sanitizeFormInput(body);
  const valid = validateFormInput(input);
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 });
  try {
    const form = await updateForm(id, input);
    if (!form) return notFound();
    return NextResponse.json({ form });
  } catch (err) {
    return unavailable("PUT", err);
  }
}

/** فتح/إغلاق استقبال الردود. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return badId();
  let body: { open?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof body.open !== "boolean") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  try {
    const ok = await setFormOpen(id, body.open);
    if (!ok) return notFound();
    return NextResponse.json({ open: body.open });
  } catch (err) {
    return unavailable("PATCH", err);
  }
}

/** حذف النموذج وكل ردوده. */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return badId();
  try {
    await deleteForm(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return unavailable("DELETE", err);
  }
}
