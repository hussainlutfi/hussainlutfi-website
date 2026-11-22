import type { Metadata } from "next";
import FormBuilder from "@/app/forms/components/FormBuilder";
import { requireAdminPage } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "نموذج جديد",
  robots: { index: false, follow: false },
};

export default async function NewFormPage() {
  await requireAdminPage();
  return <FormBuilder />;
}
