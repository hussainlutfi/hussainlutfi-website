import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateInput } from "@/app/zawaj/model";
import { addInquiry, listInquiries } from "@/app/zawaj/store";

export const dynamic = "force-dynamic";

/** كل الردود — لصفحة المراجعة. */
export async function GET() {
  try {
    return NextResponse.json({ inquiries: await listInquiries() });
  } catch (err) {
    console.error("zawaj GET failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}

/** إرسال ردّ جديد. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const input = sanitizeInput(body);
  const error = validateInput(input);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const inquiry = await addInquiry(input);
    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (err) {
    console.error("zawaj POST failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
