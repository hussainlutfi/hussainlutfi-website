import { getDb } from "@/lib/firebaseAdmin";
import { sanitizeCvRequest, type CvRequest, type CvRequestDoc } from "./model";

const COLLECTION = "cv_requests";

export async function saveCvRequest(data: CvRequest): Promise<{ id: string }> {
  const db = getDb();
  const ref = await db.collection(COLLECTION).add({
    data,
    createdAt: new Date().toISOString(),
  });
  return { id: ref.id };
}

export async function listCvRequests(): Promise<CvRequestDoc[]> {
  const db = getDb();
  const snap = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  return snap.docs.map((doc) => {
    const createdAt = doc.get("createdAt");
    return {
      id: doc.id,
      data: sanitizeCvRequest(doc.get("data")),
      createdAt: typeof createdAt === "string" ? createdAt : null,
    };
  });
}
