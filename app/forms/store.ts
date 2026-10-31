import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";
import {
  sanitizeForm,
  sanitizeResponse,
  type Answer,
  type FormDef,
  type FormInput,
  type FormResponse,
} from "./model";

const FORMS = "forms";
const RESPONSES = "responses"; // مجموعة فرعية داخل كل نموذج

export const ID_PATTERN = /^[a-z0-9]{6,40}$/;

/** معرّف قصير غير متسلسل حتى لا يُخمَّن رابط النموذج. */
const newFormId = (): string =>
  randomBytes(8).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) ||
  Date.now().toString(36);

export async function listForms(): Promise<FormDef[]> {
  const snap = await getDb().collection(FORMS).orderBy("createdAt", "desc").limit(200).get();
  return snap.docs.map((d) => sanitizeForm(d.data(), d.id));
}

export async function getForm(id: string): Promise<FormDef | null> {
  const snap = await getDb().collection(FORMS).doc(id).get();
  return snap.exists ? sanitizeForm(snap.data(), snap.id) : null;
}

export async function createForm(input: FormInput): Promise<FormDef> {
  const db = getDb();
  const now = new Date().toISOString();
  let id = newFormId();
  // تجنّب التصادم النادر
  while ((await db.collection(FORMS).doc(id).get()).exists) id = newFormId();
  const doc = { ...input, open: true, responses: 0, createdAt: now, updatedAt: now };
  await db.collection(FORMS).doc(id).set(doc);
  return sanitizeForm(doc, id);
}

export async function updateForm(id: string, input: FormInput): Promise<FormDef | null> {
  const ref = getDb().collection(FORMS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.set({ ...input, updatedAt: new Date().toISOString() }, { merge: true });
  return sanitizeForm({ ...snap.data(), ...input }, id);
}

export async function setFormOpen(id: string, open: boolean): Promise<boolean> {
  const ref = getDb().collection(FORMS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.set({ open, updatedAt: new Date().toISOString() }, { merge: true });
  return true;
}

export async function deleteForm(id: string): Promise<void> {
  const db = getDb();
  const ref = db.collection(FORMS).doc(id);
  await db.recursiveDelete(ref);
}

export async function listResponses(formId: string): Promise<FormResponse[]> {
  const snap = await getDb()
    .collection(FORMS)
    .doc(formId)
    .collection(RESPONSES)
    .orderBy("createdAt", "desc")
    .limit(1000)
    .get();
  return snap.docs.map((d) => sanitizeResponse(d.data(), d.id));
}

export async function addResponse(
  formId: string,
  name: string,
  answers: Record<string, Answer>
): Promise<FormResponse> {
  const db = getDb();
  const formRef = db.collection(FORMS).doc(formId);
  const createdAt = new Date().toISOString();
  const respRef = formRef.collection(RESPONSES).doc();
  const batch = db.batch();
  batch.set(respRef, { name, answers, createdAt });
  batch.update(formRef, { responses: FieldValue.increment(1) });
  await batch.commit();
  return { id: respRef.id, name, answers, createdAt };
}

export async function deleteResponse(formId: string, responseId: string): Promise<boolean> {
  const db = getDb();
  const formRef = db.collection(FORMS).doc(formId);
  const respRef = formRef.collection(RESPONSES).doc(responseId);
  const snap = await respRef.get();
  if (!snap.exists) return false;
  const batch = db.batch();
  batch.delete(respRef);
  batch.update(formRef, { responses: FieldValue.increment(-1) });
  await batch.commit();
  return true;
}
