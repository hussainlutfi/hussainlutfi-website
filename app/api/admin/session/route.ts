import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, SESSION_COOKIE, SESSION_DAYS } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** تسجيل الدخول: يستقبل رمز Google ويضع كوكي الجلسة إن كان البريد مسموحاً. */
export async function POST(req: NextRequest) {
  let idToken: unknown;
  try {
    ({ idToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  let session: string | null;
  try {
    session = await createAdminSession(idToken);
  } catch (err) {
    console.error("admin session failed:", err);
    return NextResponse.json({ error: "تعذر التحقق من تسجيل الدخول." }, { status: 401 });
  }
  if (!session) {
    return NextResponse.json({ error: "هذا الحساب غير مصرّح له بالدخول." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return res;
}

/** تسجيل الخروج. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
