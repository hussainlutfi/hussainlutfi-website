import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/**
 * حماية خفيفة للوحة المالك: عند ضبط MEETINGS_ADMIN_KEY يصبح المفتاح مطلوباً
 * في ترويسة x-admin-key، وبدون ضبطه تبقى اللوحة مفتوحة كما بقية أدوات الموقع.
 */
export const adminKeyRequired = (): boolean => !!process.env.MEETINGS_ADMIN_KEY;

export function isAdmin(req: NextRequest): boolean {
  const expected = process.env.MEETINGS_ADMIN_KEY;
  if (!expected) return true;

  const given = req.headers.get("x-admin-key") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
