import type { Metadata } from "next";
import FormBuilder from "../components/FormBuilder";

export const metadata: Metadata = {
  title: "نموذج جديد",
  robots: { index: false, follow: false },
};

export default function NewFormPage() {
  return <FormBuilder />;
}
