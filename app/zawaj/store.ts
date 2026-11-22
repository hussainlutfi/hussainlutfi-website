import { getDb } from "@/lib/firebaseAdmin";
import { sanitizeInquiry, type Inquiry, type InquiryInput } from "./model";

const INQUIRIES = "zawajInquiries";

export const ID_PATTERN = /^[A-Za-z0-9]{10,40}$/;

export async function listInquiries(): Promise<Inquiry[]> {
  const snap = await getDb().collection(INQUIRIES).orderBy("createdAt", "desc").limit(1000).get();
  return snap.docs.map((d) => sanitizeInquiry(d.data(), d.id));
}

export async function addInquiry(input: InquiryInput): Promise<Inquiry> {
  const ref = getDb().collection(INQUIRIES).doc();
  const doc = { ...input, createdAt: new Date().toISOString() };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const ref = getDb().collection(INQUIRIES).doc(id);
  if (!(await ref.get()).exists) return false;
  await ref.delete();
  return true;
}
