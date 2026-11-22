import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FormDetail from "@/app/forms/components/FormDetail";
import { getForm, ID_PATTERN, listResponses } from "@/app/forms/store";
import { requireAdminPage } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let title = "النموذج";
  try {
    if (ID_PATTERN.test(id)) title = (await getForm(id))?.title ?? title;
  } catch {
    /* يُعرض العنوان الافتراضي */
  }
  return { title: `${title} — الردود`, robots: { index: false, follow: false } };
}

export default async function FormDetailPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  if (!ID_PATTERN.test(id)) notFound();
  const form = await getForm(id);
  if (!form) notFound();
  const responses = await listResponses(id);
  return <FormDetail form={form} responses={responses} />;
}
