import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الخطة الزمنية | نظام قافلة التقوى",
  description:
    "الخطة الزمنية لتنفيذ نظام قافلة التقوى — منصة رقمية متكاملة لإدارة عمليات الحج والعمرة",
};

export default function AltaqwaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
