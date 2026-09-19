import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "العزاء القطيفي | موكب عزاء أهالي القطيف",
  description:
    "مولّد شرائح قصائد العزاء القطيفي — تحويل نصوص القصائد إلى شرائح عرض قابلة للتخصيص والتصدير",
};

export default function AzzaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
