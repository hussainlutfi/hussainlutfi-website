import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/meetings/admin-auth";
import { getSettings, saveSettings } from "@/app/meetings/store";

export const dynamic = "force-dynamic";

const denied = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return denied();
  try {
    return NextResponse.json({ settings: await getSettings() });
  } catch (err) {
    console.error("meetings settings GET failed:", err);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return denied();

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
