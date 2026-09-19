import type { Metadata } from "next";
import CaptionsApp from "./CaptionsApp";

export const metadata: Metadata = {
  title: "استخراج ترجمات يوتيوب — حسين الزاير",
  description: "الصق رابط فيديو يوتيوب لاستخراج نصّه كاملًا أو تنزيله كملف ترجمة SRT أو VTT.",
};

export default function YoutubeCaptionsPage() {
  return <CaptionsApp />;
}
