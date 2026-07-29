import { NextRequest, NextResponse } from "next/server";
import { sanitizeCvRequest, validateCvRequest } from "@/app/cv/model";
import { saveCvRequest } from "@/app/cv/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const clean = sanitizeCvRequest(body);
  const errors = validateCvRequest(clean);
  if (errors.length) {
    return NextResponse.json({ error: "invalid", messages: errors }, { status: 400 });
  }

  try {
    const { id } = await saveCvRequest(clean);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("cv POST failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
