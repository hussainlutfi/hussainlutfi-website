import { denyUnlessAdmin } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeFormInput, validateFormInput } from "@/app/forms/model";
import { createForm, listForms } from "@/app/forms/store";

export const dynamic = "force-dynamic";

/** قائمة النماذج — للوحة الإدارة. */
export async function GET() {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json({ forms: await listForms() });
  } catch (err) {
    console.error("forms GET failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}

/** إنشاء نموذج جديد. */
export async function POST(req: NextRequest) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
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
    const form = await createForm(input);
    return NextResponse.json({ form }, { status: 201 });
  } catch (err) {
    console.error("forms POST failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
