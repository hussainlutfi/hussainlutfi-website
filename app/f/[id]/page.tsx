import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FillForm from "@/app/forms/components/FillForm";
import { getForm, ID_PATTERN } from "@/app/forms/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/** صفحة الإجابة العامة — رابط المشاركة /f/<id> */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let form = null;
  try {
    if (ID_PATTERN.test(id)) form = await getForm(id);
  } catch {
    /* يُعرض العنوان الافتراضي */
  }
  return {
    title: form?.title ?? "نموذج",
    description: form?.description || "أجب على هذا النموذج",
    robots: { index: false, follow: false },
  };
}

export default async function PublicFormPage({ params }: Props) {
  const { id } = await params;
  if (!ID_PATTERN.test(id)) notFound();
  const form = await getForm(id);
  if (!form) notFound();
  return <FillForm form={form} />;
}
