import { getDb } from "@/lib/firebaseAdmin";
import { sanitizeMattamData, type MattamData, type MattamDoc } from "./model";
import { SEED_DATA_1448, SEED_SLUG_1448 } from "./seed-1448";

const COLLECTION = "mattam_docs";

/** المسارات المسموح بها فقط — يمنع إنشاء مستندات عشوائية. */
export const SLUG_PATTERN = /^wadi-mattam-1[0-9]{3}$/;

export type SaveResult =
  | { ok: true; rev: number; updatedAt: string }
  | { ok: false; conflict: true; current: MattamDoc };

class ConflictError extends Error {
  constructor(public current: MattamDoc) {
    super("revision conflict");
  }
}

export async function getMattamDoc(slug: string): Promise<MattamDoc | null> {
  const db = getDb();
  const ref = db.collection(COLLECTION).doc(slug);
  const snap = await ref.get();

  if (!snap.exists) {
    // مستند موسم ١٤٤٨ يُنشأ تلقائياً من بيانات ملف Excel الأصلي
    if (slug === SEED_SLUG_1448) {
      await ref.set({ data: SEED_DATA_1448, rev: 1 });
      return { data: SEED_DATA_1448, rev: 1, updatedAt: new Date().toISOString() };
    }
    return null;
  }

  return {
    data: sanitizeMattamData(snap.get("data")),
    rev: Number(snap.get("rev")) || 0,
    updatedAt: snap.updateTime?.toDate().toISOString() ?? null,
  };
}

export async function saveMattamDoc(
  slug: string,
  data: unknown,
  baseRev: number
): Promise<SaveResult> {
  const db = getDb();
  const ref = db.collection(COLLECTION).doc(slug);
  const clean: MattamData = sanitizeMattamData(data);

  try {
    const rev = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const currentRev = snap.exists ? Number(snap.get("rev")) || 0 : 0;
      if (currentRev !== baseRev) {
        throw new ConflictError({
          data: sanitizeMattamData(snap.exists ? snap.get("data") : null),
          rev: currentRev,
          updatedAt: snap.updateTime?.toDate().toISOString() ?? null,
        });
      }
      tx.set(ref, { data: clean, rev: currentRev + 1 });
      return currentRev + 1;
    });
    return { ok: true, rev, updatedAt: new Date().toISOString() };
  } catch (err) {
    if (err instanceof ConflictError) {
      return { ok: false, conflict: true, current: err.current };
    }
    throw err;
  }
}
