import { denyUnlessAdmin } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/app/meetings/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json({ settings: await getSettings() });
  } catch (err) {
    console.error("meetings settings GET failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  let body: { settings?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.settings || typeof body.settings !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    return NextResponse.json({ settings: await saveSettings(body.settings) });
  } catch (err) {
    console.error("meetings settings PUT failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
