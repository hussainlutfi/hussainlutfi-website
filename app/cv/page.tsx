import type { Metadata } from "next";
import CvForm from "./components/CvForm";

export const metadata: Metadata = {
  title: "طلب سيرة ذاتية | حسين الزاير",
  description: "اطلب سيرة ذاتية احترافية بالعربية أو الإنجليزية أو كلتيهما",
};

export default function CvRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <CvForm />
    </div>
  );
}
