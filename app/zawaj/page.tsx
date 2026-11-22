import type { Metadata } from "next";
import InquiryForm from "./components/InquiryForm";

export const metadata: Metadata = {
  title: "السؤال عن المرشّحة للزواج",
  description: "استبيان سرّي",
  robots: { index: false, follow: false },
};

export default function ZawajPage() {
  return <InquiryForm />;
}
