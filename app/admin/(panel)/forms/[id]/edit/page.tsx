import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FormBuilder from "@/app/forms/components/FormBuilder";
import { getForm, ID_PATTERN } from "@/app/forms/store";
import { requireAdminPage } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تعديل النموذج",
  robots: { index: false, follow: false },
};

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  if (!ID_PATTERN.test(id)) notFound();
  const form = await getForm(id);
  if (!form) notFound();
  return <FormBuilder initial={form} />;
}
