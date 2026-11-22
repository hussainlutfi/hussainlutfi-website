import type { Metadata } from "next";
import InquiryForm from "./components/InquiryForm";

export const metadata: Metadata = {
  title: "استبيان تعريفي",
  description: "استبيان سرّي",
  robots: { index: false, follow: false },
};

export default function ZawajPage() {
  return <InquiryForm />;
}
