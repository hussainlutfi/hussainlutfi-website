import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FormBuilder from "../../components/FormBuilder";
import { getForm, ID_PATTERN } from "../../store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تعديل النموذج",
  robots: { index: false, follow: false },
};

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_PATTERN.test(id)) notFound();
  const form = await getForm(id);
  if (!form) notFound();
  return <FormBuilder initial={form} />;
}
