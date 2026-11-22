import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getDb } from "./firebaseAdmin";

/** البريد الوحيد المسموح له بدخول لوحة الإدارة. */
export const ADMIN_EMAIL = "7ussain212@gmail.com";

export const SESSION_COOKIE = "admin_session";
export const SESSION_DAYS = 14; // الحد الأقصى لجلسات Firebase

const adminAuth = () => {
  getDb(); // يهيّئ تطبيق Firebase Admin إن لم يكن مهيّأً
  return getAuth();
};

export const isAdminClaims = (c: { email?: string; email_verified?: boolean }): boolean =>
  c.email_verified === true && c.email?.toLowerCase() === ADMIN_EMAIL;

/** يحوّل رمز Google (ID token) إلى كوكي جلسة — فقط لصاحب البريد المسموح. */
export async function createAdminSession(idToken: string): Promise<string | null> {
  const auth = adminAuth();
  const claims = await auth.verifyIdToken(idToken, true);
  if (!isAdminClaims(claims)) return null;
  // Firebase يشترط أن يكون تسجيل الدخول حديثاً عند إنشاء الجلسة
  if (Date.now() / 1000 - claims.auth_time > 5 * 60) return null;
  return auth.createSessionCookie(idToken, { expiresIn: SESSION_DAYS * 24 * 60 * 60 * 1000 });
}

/** بريد المدير إن كانت الجلسة صالحة، وإلا null. مُخزَّن طوال الطلب الواحد. */
export const getAdminEmail = cache(async (): Promise<string | null> => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const claims = await adminAuth().verifySessionCookie(cookie, true);
    return isAdminClaims(claims) ? claims.email! : null;
  } catch {
    return null;
  }
});

/** لصفحات الإدارة: يعيد التوجيه لصفحة الدخول إن لم تكن الجلسة صالحة. */
export async function requireAdminPage(): Promise<string> {
  const email = await getAdminEmail();
  if (!email) redirect("/admin/login");
  return email;
}

/** لواجهات الإدارة: يعيد ردّ 401 إن لم تكن الجلسة صالحة، وإلا null. */
export async function denyUnlessAdmin(): Promise<NextResponse | null> {
  return (await getAdminEmail()) ? null : NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
