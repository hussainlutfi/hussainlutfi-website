import type { Metadata } from "next";
import MattamApp from "../../components/MattamApp";
import { getMattamDoc } from "../../store";
import { SEED_SLUG_1448 } from "../../seed-1448";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الإدخال والتعديل — مأتم الوادي ١٤٤٨هـ",
  description: "إدخال وتعديل مصاريف ضيافة مأتم الوادي — موسم محرم ١٤٤٨هـ",
};

export default async function EditPage() {
  let initial = null;
  try {
    initial = await getMattamDoc(SEED_SLUG_1448);
  } catch (err) {
    console.error("SSR fetch for mattam doc failed:", err);
  }
  return (
    <MattamApp
      slug={SEED_SLUG_1448}
      base="/wadi/mattam/1448"
      mode="edit"
      initial={initial}
    />
  );
}
