import { NextRequest, NextResponse } from "next/server";
import { sanitizeAnswers } from "@/app/forms/model";
import { addResponse, getForm, ID_PATTERN } from "@/app/forms/store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** إرسال ردّ — عام، من رابط المشاركة. */
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  let body: { name?: unknown; answers?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const form = await getForm(id);
    if (!form) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!form.open) {
      return NextResponse.json({ error: "هذا النموذج لا يستقبل ردوداً حالياً." }, { status: 403 });
    }
    const result = sanitizeAnswers(form, body.answers);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    const name = form.askName && typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const response = await addResponse(id, name, result.answers);
    return NextResponse.json({ response }, { status: 201 });
  } catch (err) {
    console.error("forms responses POST failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
