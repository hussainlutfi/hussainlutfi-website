import { Noto_Naskh_Arabic } from "next/font/google";

/** خط الشرائح — نفس الخط المستخدم في نسخة الصور الأصلية */
export const naskh = Noto_Naskh_Arabic({
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});
