"use client";

import { useEffect } from "react";

/* ── colour tokens ── */
const C = {
  teal: "#3BB5B0",
  tealDark: "#2E918D",
  tealLight: "#E8F6F5",
  orange: "#E8832A",
  orangeLight: "#FDF0E4",
  gold: "#D4A843",
  goldLight: "#F9F1DC",
  dark: "#2D2D2D",
  darkSoft: "#4A4A4A",
  gray: "#808080",
  grayLight: "#B0B0B0",
  white: "#FFFFFF",
};

/* ── data ── */
interface Task {
  num: string;
  title: string;
  sub?: string;
}
interface Category {
  title: string;
  tasks: Task[];
}
interface Month {
  num: string;
  hijri: string;
  title: string;
  desc: string;
  milestone?: { label: string; type: "sub" | "beta" | "live" };
  categories: Category[];
  twoCol?: boolean;
}

const months: Month[] = [
  {
    num: "١",
    hijri: "نهاية شهر محرّم",
    title: "التأسيس والتخطيط",
    desc: "تهيئة البنية التحتية الكاملة للمشروع من إنشاء الحسابات التقنية وتصميم قاعدة البيانات وإعداد بيئة التطوير والنشر، مع وضع التصاميم الأولية والهيكل البرمجي العام لجميع التطبيقات لضمان انطلاقة تقنية سليمة ومنظّمة.",
    categories: [
      {
        title: "إنشاء وتهيئة الحسابات",
        tasks: [
          { num: "١", title: "إنشاء مشروع Supabase وتهيئة قاعدة البيانات (PostgreSQL)", sub: "إعداد المشروع على خطة Pro مع تفعيل الصلاحيات والنسخ الاحتياطي" },
          { num: "٢", title: "إنشاء حساب Cloudflare Workers", sub: "إعداد بيئة الاستضافة والنشر للواجهة الخلفية والموقع" },
          { num: "٣", title: "إنشاء مستودع GitHub وتنظيم المشروع", sub: "إعداد Monorepo مع تفريعات التطبيقات وصلاحيات الفريق" },
        ],
      },
      {
        title: "تصميم قاعدة البيانات",
        tasks: [
          { num: "٤", title: "تصميم هيكل الجداول الرئيسية", sub: "الحجاج، الكوادر، الرحلات، الحافلات، التسكين، الطلبات، المهام، السجلات المالية" },
          { num: "٥", title: "إعداد سياسات أمان الصفوف (RLS)", sub: "حماية البيانات الشخصية وضبط الصلاحيات حسب الأدوار" },
        ],
      },
      {
        title: "نظام المصادقة والصلاحيات",
        tasks: [
          { num: "٦", title: "إعداد نظام تسجيل الدخول (Supabase Auth)", sub: "دعم رمز التأكيد (OTP)، البريد الإلكتروني، وروابط الدخول السريع" },
          { num: "٧", title: "تصميم نظام الأدوار والصلاحيات", sub: "تحديد مستويات الوصول مع دعم التحقق الثنائي للحسابات الحساسة" },
        ],
      },
      {
        title: "بيئة التطوير والتصميم",
        tasks: [
          { num: "٨", title: "إعداد بيئة التطوير ونظام النشر المستمر (CI/CD)", sub: "ربط المستودع بأنظمة البناء والنشر التلقائي" },
          { num: "٩", title: "تصميم الهيكل البرمجي العام للتطبيقات", sub: "توحيد الإعدادات والمكتبات المشتركة بين جميع التطبيقات" },
          { num: "١٠", title: "إعداد التصاميم الأولية وتجربة المستخدم", sub: "رسم الشاشات الرئيسية (Wireframes) وتحديد تجربة المستخدم" },
        ],
      },
    ],
  },
  {
    num: "٢",
    hijri: "نهاية شهر صفر",
    title: "لوحة الإدارة",
    desc: "بناء لوحة التحكم الرئيسية التي تُمكّن الإدارة من التحكم الكامل ببيانات النظام — من إدارة الرحلات والحجاج والكوادر والحافلات والتسكين، إلى الإحصاءات والإشعارات وإنشاء التقارير، دون الحاجة للتدخل التقني.",
    categories: [
      {
        title: "إدارة الرحلات والحجاج",
        tasks: [
          { num: "١", title: "إضافة وتعديل الرحلات", sub: "إنشاء رحلات جديدة وتعديل تفاصيلها (التواريخ، المطارات، البكجات)" },
          { num: "٢", title: "إضافة وتعديل بيانات الحجاج", sub: "إدارة المعلومات الشخصية وربطهم بالرحلات والمجموعات" },
          { num: "٣", title: "إضافة الكوادر وإسناد الرحلات", sub: "تسجيل بيانات الكوادر وربطهم بالرحلات واللجان" },
          { num: "٤", title: "تعديل القوائم (الرحلات، الحافلات...)", sub: "تحديث وتنظيم قوائم البيانات من واجهة واحدة" },
        ],
      },
      {
        title: "التسكين والحافلات",
        tasks: [
          { num: "٥", title: "تسكين الحجاج في غرف مكة والمدينة", sub: "توزيع الحجاج على الغرف وإدارة أرقام الغرف والمشتركين" },
          { num: "٦", title: "إدارة أرقام الحافلات", sub: "تنظيم الحافلات لجميع المسارات (المطار، عرفة، منى...)" },
        ],
      },
      {
        title: "الإحصاءات والمالية",
        tasks: [
          { num: "٧", title: "إحصاءات التسجيل", sub: "عرض أعداد المسجلين (مؤكد - مبدئي - تذاكر متبقية) بشكل لحظي" },
          { num: "٨", title: "متابعة السداد واستعراض الفواتير", sub: "عرض حالة الدفع لكل حاج والمبالغ المتبقية" },
        ],
      },
      {
        title: "الإشعارات والتقارير",
        tasks: [
          { num: "٩", title: "إدارة الإشعارات والتنبيهات", sub: "إرسال إشعارات مستهدفة للحجاج أو الكوادر" },
          { num: "١٠", title: "إنشاء التقارير", sub: "تقارير الطيران والفنادق والمسلخ وقوائم الحجاج القابلة للطباعة" },
        ],
      },
    ],
  },
  {
    num: "٣",
    hijri: "نهاية شهر ربيع الأول",
    title: "الموقع والتسجيل",
    desc: "تطوير الموقع الإلكتروني لقافلة التقوى كواجهة عامة تعرض معلومات القافلة والرحلات المتاحة، مع بناء نظام التسجيل واختيار البكجات ليتمكّن الحجاج من التسجيل إلكترونيًا بسهولة.",
    milestone: { label: "بداية الاشتراكات", type: "sub" },
    categories: [
      {
        title: "الموقع الإلكتروني — المحتوى",
        tasks: [
          { num: "١", title: "الصفحة الرئيسية ونبذة عن القافلة", sub: "تعريف بقافلة التقوى ورؤيتها وخدماتها بتصميم جذاب واحترافي" },
          { num: "٢", title: "عرض الرحلات والبكجات المتاحة", sub: "صفحة تعرض الرحلات الحالية مع تفاصيل كل بكج وأسعاره" },
          { num: "٣", title: "صفحة الإعلانات والمستجدات", sub: "عرض آخر الأخبار والإعلانات المتعلقة بالقافلة والموسم" },
        ],
      },
      {
        title: "نظام التسجيل",
        tasks: [
          { num: "٤", title: "التسجيل واختيار الرحلات", sub: "نموذج تسجيل متكامل مع اختيار البكج المناسب بحسب رغبة المسجّل" },
          { num: "٥", title: "إنشاء حساب الحاج عبر الموقع", sub: "تسجيل دخول برمز التأكيد (OTP) وربط الحساب ببيانات الرحلة" },
          { num: "٦", title: "استعراض بيانات التسجيل", sub: "عرض تفاصيل التسجيل والرحلة المختارة وحالة التأكيد" },
        ],
      },
      {
        title: "التواصل والإعلام",
        tasks: [
          { num: "٧", title: "وسائل التواصل الاجتماعي", sub: "ربط حسابات القافلة على المنصات المختلفة" },
          { num: "٨", title: "تغطيات الحج", sub: "صفحة لعرض تغطيات ومحتوى مواسم الحج" },
        ],
      },
    ],
  },
  {
    num: "٤",
    hijri: "نهاية شهر ربيع الثاني",
    title: "تطبيق الحاج",
    desc: "بناء تطبيق الحاج المتكامل بجميع خدماته — من المعلومات الشخصية والرحلات والتسكين والحافلات، إلى متابعة أعمال الحج والعمرة وزاد الحاج وخدمات السكن والتواصل والبرنامج اليومي، ليكون المرجع الرقمي الشامل لكل حاج.",
    twoCol: true,
    categories: [
      {
        title: "تسجيل الدخول والمعلومات",
        tasks: [
          { num: "١", title: "تسجيل الدخول برمز التأكيد (OTP)" },
          { num: "٢", title: "استعراض وتعديل البيانات الشخصية" },
          { num: "٣", title: "الربط بالمجموعة" },
        ],
      },
      {
        title: "اختيار البرنامج ومتابعة الأعمال",
        tasks: [
          { num: "١٦", title: "تقديم أعمال (تعبّد أو مبيت)" },
          { num: "١٧", title: "الإحرام من مكة القديمة" },
          { num: "١٨", title: "عمرة التمتع (إحرام، طواف، سعي، تقصير)" },
          { num: "١٩", title: "الإرشاد البلدي والمكي" },
          { num: "٢٠", title: "المبيت بعرفة وجمع الجمار" },
          { num: "٢١", title: "إتمام الرمي يوم العاشر" },
          { num: "٢٢", title: "المبيت/المرور بمزدلفة" },
          { num: "٢٣", title: "الحلق أو التقصير" },
          { num: "٢٤", title: "المبيت بمنى وإتمام الأعمال" },
          { num: "٢٥", title: "الرمي يوم ١١ ويوم ١٢" },
          { num: "٢٦", title: "البرامج الاختيارية (تسوق، زيارة...)" },
        ],
      },
      {
        title: "رحلات الحاج",
        tasks: [
          { num: "٤", title: "استعراض الرحلات المسجلة", sub: "دعم أكثر من رحلة فعالة" },
          { num: "٥", title: "تفاصيل الرحلة", sub: "أوقات ومطارات الذهاب والوصول" },
          { num: "٦", title: "حالة التسجيل (مؤكد – مبدئي)" },
          { num: "٧", title: "الملتحقين وتفاصيلهم الخاصة" },
        ],
      },
      {
        title: "خدمات السكن",
        tasks: [
          { num: "٢٧", title: "رفقاء السكن (اختيارهم)" },
          { num: "٢٨", title: "الخدمات المتوفرة (حلاق، صحية..)" },
          { num: "٢٩", title: "طلبات الصيانة والنظافة" },
          { num: "٣٠", title: "دور الحلاقة والرقم الحالي" },
        ],
      },
      {
        title: "التسكين والحافلات والتكاليف",
        tasks: [
          { num: "٨", title: "أرقام الغرف والمشتركين" },
          { num: "٩", title: "سكن المشاعر (الخيمة والسرير)" },
          { num: "١٠", title: "أرقام الحافلات" },
          { num: "١١", title: "المدفوع والمتبقي من التكاليف" },
        ],
      },
      {
        title: "التواصل والبرنامج",
        tasks: [
          { num: "٣١", title: "أرقام تهمك (اتصال/واتساب)" },
          { num: "٣٢", title: "تحدث مع طبيب القافلة" },
          { num: "٣٣", title: "أسئلة متكررة" },
          { num: "٣٤", title: "مواقع تهمك (مكة، عرفة، مزدلفة، منى)" },
          { num: "٣٥", title: "البرنامج اليومي" },
          { num: "٣٦", title: "برنامج الرحلة (ذهاب وعودة)" },
          { num: "٣٧", title: "الكوادر المرافقة (استعراض وتواصل)" },
        ],
      },
      {
        title: "زاد الحاج",
        tasks: [
          { num: "١٢", title: "أعمال الحج والأدعية" },
          { num: "١٣", title: "أحكام الحج" },
          { num: "١٤", title: "أسئلة فقهية متكررة" },
          { num: "١٥", title: "عداد الأشواط" },
        ],
      },
    ],
  },
  {
    num: "٥",
    hijri: "نهاية شهر جمادى الأولى",
    title: "تطبيق الكادر والخدمات",
    desc: "تطوير تطبيق الكادر ونظام الخدمات الشامل — بدءًا من الملف الشخصي ورحلات الكادر ونظام المهام، مرورًا بجميع اللجان التشغيلية (الحرم، السكن، المشاعر، المسلخ)، وانتهاءً بنظام طلبات الخدمات المتكامل.",
    milestone: { label: "التشغيل التجريبي", type: "beta" },
    twoCol: true,
    categories: [
      {
        title: "الكادر — المعلومات والرحلات",
        tasks: [
          { num: "١", title: "المعلومات الشخصية", sub: "الاسم الرباعي، الجوال — استعراض وتعديل" },
          { num: "٢", title: "إحصاء الرحلة", sub: "مراجع التقليد، حالات صحية، طلبات خاصة" },
          { num: "٣", title: "أرقام الحافلات", sub: "من المطار، إلى عرفة، إلى منى..." },
          { num: "٤", title: "أرقام التواصل مع الحجاج", sub: "اتصال أو واتساب" },
        ],
      },
      {
        title: "نظام طلبات الخدمات",
        tasks: [
          { num: "١٠", title: "تقديم طلبات الخدمة من الحاج", sub: "صيانة، نظافة، خدمات أساسية" },
          { num: "١١", title: "إسناد الطلبات من الإدارة للكادر" },
          { num: "١٢", title: "متابعة وتنفيذ الطلبات" },
        ],
      },
      {
        title: "الإدارة — المهام والإشعارات",
        tasks: [
          { num: "٥", title: "إنشاء المهام وإسنادها" },
          { num: "٦", title: "مهام الكادر (عامة ومخصصة)" },
          { num: "٧", title: "الإعلانات والمستجدات" },
          { num: "٨", title: "إرسال إشعارات للحجاج أو الكوادر" },
          { num: "٩", title: "تحضير الحافلات (إحصاء وتواصل)" },
        ],
      },
      {
        title: "اللجان التشغيلية",
        tasks: [
          { num: "١٣", title: "لجنة الحرم", sub: "الطلبات الخاصة، الحالات الصحية، مراجع التقليد" },
          { num: "١٤", title: "لجنة السكن", sub: "طلبات الحجاج وكادر الاستقبال" },
          { num: "١٥", title: "لجنة المشاعر", sub: "التقصير والتنسيق الميداني" },
          { num: "١٦", title: "لجنة المسلخ", sub: "قوائم الحجاج، أماكن الذبح، تحضير الرمي" },
        ],
      },
    ],
  },
  {
    num: "٦",
    hijri: "نهاية شهر جمادى الثانية",
    title: "المالية والتقارير",
    desc: "بناء النظام المالي المتكامل لمتابعة السداد ورصد الفواتير والمصروفات وإدخال بياناتها، مع عداد الميزانية ومراجعة المحاسب، بالإضافة إلى التقارير التفصيلية الشاملة ونظام تقييم الرحلات.",
    categories: [
      {
        title: "النظام المالي",
        tasks: [
          { num: "١", title: "متابعة السداد واستعراض الفواتير", sub: "عرض حالة الدفع لكل حاج مع تفاصيل المبالغ المدفوعة والمتبقية" },
          { num: "٢", title: "رصد الفواتير والمصروفات", sub: "تسجيل جميع المصروفات التشغيلية وربطها بالفئات المناسبة" },
          { num: "٣", title: "تصوير الفواتير وإدخال بياناتها", sub: "رفع صور الفواتير مع إدخال التفاصيل المالية المرتبطة" },
          { num: "٤", title: "عداد الميزانية", sub: "متابعة لحظية للميزانية المصروفة والمتبقية" },
          { num: "٥", title: "مراجعة المحاسب للفواتير", sub: "نظام مراجعة واعتماد الفواتير من قبل المحاسب المختص" },
        ],
      },
      {
        title: "التقارير الشاملة",
        tasks: [
          { num: "٦", title: "تقارير الطيران والفنادق والمسلخ", sub: "تقارير تفصيلية قابلة للطباعة والتصدير" },
          { num: "٧", title: "تقارير نسبة استخدام الميزات", sub: "إحصائيات استخدام التطبيقات والخدمات المختلفة" },
          { num: "٨", title: "التقارير المالية التفصيلية", sub: "ملخص المصروفات والإيرادات حسب الفئة والفترة" },
        ],
      },
      {
        title: "التقييم",
        tasks: [
          { num: "٩", title: "تقييم الرحلات", sub: "نظام تقييم يتيح للحجاج تقييم خدمات الرحلة" },
          { num: "١٠", title: "استعراض نتائج التقييم ونشر المحتوى", sub: "لوحة عرض نتائج التقييم للإدارة مع إمكانية النشر" },
        ],
      },
    ],
  },
  {
    num: "٧",
    hijri: "نهاية شهر رجب",
    title: "الاختبار والتسليم",
    desc: "المرحلة الأخيرة والأهم — اختبار شامل لجميع أجزاء النظام مع ترحيل البيانات من النظام القديم وإصلاح الأخطاء المكتشفة واختبار الأداء تحت الضغط الموسمي، تمهيدًا للإطلاق الفعلي والتجهيز النهائي لموسم الحج.",
    milestone: { label: "التشغيل الفعلي", type: "live" },
    categories: [
      {
        title: "الاختبار الشامل",
        tasks: [
          { num: "١", title: "اختبار تطبيق الحاج (HajApp) بجميع ميزاته", sub: "تسجيل الدخول، الرحلات، التسكين، الأعمال، زاد الحاج، التواصل" },
          { num: "٢", title: "اختبار تطبيق الكادر (OrganiserApp)", sub: "المعلومات، المهام، اللجان، طلبات الخدمات، الإشعارات" },
          { num: "٣", title: "اختبار لوحة الإدارة (Admin Dashboard)", sub: "إدارة البيانات، التقارير، الإحصاءات، النظام المالي" },
          { num: "٤", title: "اختبار الموقع الإلكتروني", sub: "التسجيل، عرض المحتوى، التوافق مع الأجهزة المختلفة" },
        ],
      },
      {
        title: "اختبار قبول المستخدم (UAT)",
        tasks: [
          { num: "٥", title: "اختبار مع مستخدمين حقيقيين", sub: "تجربة النظام مع عينة من الحجاج والكوادر والإدارة" },
          { num: "٦", title: "اختبار الأداء تحت الضغط الموسمي", sub: "محاكاة الاستخدام المكثف خلال أيام الذروة" },
        ],
      },
      {
        title: "ترحيل البيانات",
        tasks: [
          { num: "٧", title: "ترحيل البيانات من قاعدة البيانات القديمة (Access)", sub: "نقل بيانات الحجاج والكوادر والرحلات السابقة والتحقق من سلامتها" },
          { num: "٨", title: "التحقق من صحة البيانات المُرحّلة", sub: "مقارنة البيانات ومطابقتها مع النظام القديم" },
        ],
      },
      {
        title: "التجهيز النهائي والإطلاق",
        tasks: [
          { num: "٩", title: "إصلاح الأخطاء والمشاكل المكتشفة", sub: "معالجة جميع الملاحظات من مراحل الاختبار" },
          { num: "١٠", title: "التجهيز النهائي لموسم الحج", sub: "إعداد البيئة الإنتاجية والنسخ الاحتياطي والمراقبة" },
          { num: "١١", title: "الإطلاق الفعلي للنظام", sub: "نشر جميع التطبيقات وتفعيل الخدمات للمستخدمين" },
        ],
      },
    ],
  },
];

const hijriLabels = ["محرم", "صفر", "ربيع١", "ربيع٢", "جمادى١", "جمادى٢", "رجب"];

/* ── Components ── */

function Octagon({ children, size = 140, filled = true }: { children: React.ReactNode; size?: number; filled?: boolean }) {
  const clip = "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)";
  return (
    <div style={{ width: size, height: size, border: filled ? "none" : `3px solid ${C.teal}`, clipPath: clip, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {filled ? (
        <div style={{ width: size - 16, height: size - 16, background: C.teal, clipPath: clip, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {children}
        </div>
      ) : children}
    </div>
  );
}

function Sep() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <div style={{ width: 100, height: 1.5, background: `linear-gradient(to left, transparent, ${C.gold}, transparent)`, margin: "12px 0" }} />
      <div style={{ width: 10, height: 10, background: C.gold, transform: "rotate(45deg)" }} />
      <div style={{ width: 100, height: 1.5, background: `linear-gradient(to left, transparent, ${C.gold}, transparent)`, margin: "12px 0" }} />
    </div>
  );
}

function Corner({ pos }: { pos: "tr" | "tl" | "br" | "bl" }) {
  const s: React.CSSProperties = { position: "absolute", width: 60, height: 60 };
  if (pos === "tr") { s.top = 40; s.right = 40; s.borderTop = `2.5px solid ${C.gold}`; s.borderRight = `2.5px solid ${C.gold}`; }
  if (pos === "tl") { s.top = 40; s.left = 40; s.borderTop = `2.5px solid ${C.gold}`; s.borderLeft = `2.5px solid ${C.gold}`; }
  if (pos === "br") { s.bottom = 40; s.right = 40; s.borderBottom = `2.5px solid ${C.gold}`; s.borderRight = `2.5px solid ${C.gold}`; }
  if (pos === "bl") { s.bottom = 40; s.left = 40; s.borderBottom = `2.5px solid ${C.gold}`; s.borderLeft = `2.5px solid ${C.gold}`; }
  return <div style={s} />;
}

function Accent({ pos }: { pos: "top" | "bottom" }) {
  const dir = pos === "top" ? "to left" : "to right";
  return <div style={{ position: "absolute", [pos]: 0, left: 0, right: 0, height: 6, background: `linear-gradient(${dir}, ${C.teal}, ${C.orange})` }} />;
}

function MilestoneBadge({ label, type }: { label: string; type: "sub" | "beta" | "live" }) {
  const bg = type === "live" ? `linear-gradient(135deg, ${C.teal}, ${C.tealDark})` : type === "beta" ? `linear-gradient(135deg, ${C.orange}, ${C.gold})` : C.orange;
  return <div style={{ display: "inline-block", color: C.white, padding: "12px 34px", borderRadius: 8, fontSize: 18, fontWeight: 700, marginTop: 32, background: bg }}>{label}</div>;
}

function TaskItem({ task }: { task: Task }) {
  return (
    <li style={{ position: "relative", padding: "8px 28px 8px 0", fontSize: 16, color: C.darkSoft, lineHeight: 1.8, borderBottom: `1px solid #f2f1ef` }}>
      <div style={{ position: "absolute", right: 0, top: 16, width: 11, height: 11, border: `2px solid ${C.gold}`, borderRadius: 2 }} />
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, background: C.goldLight, color: C.gold, borderRadius: "50%", fontSize: 13, fontWeight: 700, marginLeft: 8 }}>{task.num}</span>
      {task.title}
      {task.sub && <span style={{ display: "block", fontSize: 13.5, color: C.gray, marginTop: 2 }}>{task.sub}</span>}
    </li>
  );
}

function CategoryBlock({ cat }: { cat: Category }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.tealDark, background: C.tealLight, padding: "8px 18px", borderRadius: 6, borderRight: `4px solid ${C.teal}`, marginBottom: 10 }}>{cat.title}</div>
      <ul style={{ listStyle: "none", padding: "0 12px" }}>
        {cat.tasks.map((t, i) => <TaskItem key={i} task={t} />)}
      </ul>
    </div>
  );
}

/* ── Main Page ── */
export default function TimelinePage() {
  useEffect(() => {
    // Hide site navbar and footer
    const nav = document.querySelector("header, nav");
    const footer = document.querySelector("footer");
    if (nav) (nav as HTMLElement).style.display = "none";
    if (footer) (footer as HTMLElement).style.display = "none";
    return () => {
      if (nav) (nav as HTMLElement).style.display = "";
      if (footer) (footer as HTMLElement).style.display = "";
    };
  }, []);

  const sectionStyle: React.CSSProperties = {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "60px 24px",
  };

  return (
    <div style={{ background: "#f8f7f5", minHeight: "100vh", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* ═══════ HERO / COVER ═══════ */}
      <section style={{ background: `radial-gradient(ellipse at center, ${C.tealLight} 0%, ${C.white} 70%)`, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Accent pos="top" />
        <Accent pos="bottom" />
        <Corner pos="tr" /><Corner pos="tl" /><Corner pos="br" /><Corner pos="bl" />

        <div style={{ padding: "60px 24px", zIndex: 1 }}>
          <Octagon size={120}>
            <span style={{ color: C.white, fontSize: 30, fontWeight: 900 }}>التقوى</span>
          </Octagon>
          <div style={{ height: 24 }} />
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, color: C.tealDark, marginBottom: 6 }}>نظام قافلة التقوى</h1>
          <p style={{ fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 500, color: C.darkSoft, marginBottom: 32 }}>منصة رقمية متكاملة لإدارة عمليات الحج والعمرة</p>
          <Sep />
          <div style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, color: C.orange, background: C.orangeLight, padding: "12px 44px", borderRadius: 8, display: "inline-block", marginBottom: 40 }}>الخطة الزمنية للتنفيذ</div>

          {/* Mini timeline */}
          <div style={{ maxWidth: 600, margin: "0 auto 36px", padding: "0 20px" }}>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: C.dark, transform: "translateY(-50%)" }} />
              {hijriLabels.map((_, i) => <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: C.orange, position: "relative", zIndex: 1 }} />)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {[...hijriLabels].reverse().map((l, i) => <span key={i} style={{ fontSize: 13, color: C.gray, flex: 1, textAlign: "center" }}>{l}</span>)}
            </div>
          </div>

          <p style={{ fontSize: 17, color: C.gray }}><strong style={{ color: C.darkSoft }}>إعداد:</strong> حسين الزاير — أبو علي</p>
          <p style={{ fontSize: 17, color: C.gray, marginTop: 4 }}><strong style={{ color: C.darkSoft }}>المراحل:</strong> ٧ مراحل &nbsp;|&nbsp; <strong style={{ color: C.darkSoft }}>المدة:</strong> ٧ أشهر هجرية</p>
          <div style={{ display: "inline-block", background: C.teal, color: C.white, padding: "7px 26px", borderRadius: 16, fontSize: 15, fontWeight: 700, marginTop: 18 }}>النسخة 2.0</div>
        </div>
      </section>

      {/* ═══════ MONTHS ═══════ */}
      {months.map((m, idx) => (
        <section key={idx} id={`month-${idx + 1}`}>
          {/* Month Cover */}
          <div style={{ background: C.white, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", borderBottom: `1px solid #eee` }}>
            <Accent pos="top" />
            <Corner pos="tr" /><Corner pos="tl" />

            <div style={{ padding: "80px 24px", zIndex: 1 }}>
              <Octagon size={140}>
                <span style={{ fontSize: 44, fontWeight: 900, color: C.white, lineHeight: 1 }}>{m.num}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>المرحلة</span>
              </Octagon>
              <div style={{ height: 28 }} />
              <div style={{ fontSize: 26, fontWeight: 700, color: C.orange, marginBottom: 10 }}>{m.hijri}</div>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, color: C.dark, marginBottom: 14 }}>{m.title}</h2>
              <Sep />
              <p style={{ fontSize: 19, color: C.darkSoft, lineHeight: 2.1, maxWidth: 650, margin: "0 auto" }}>{m.desc}</p>
              {m.milestone && <MilestoneBadge label={m.milestone.label} type={m.milestone.type} />}
            </div>
          </div>

          {/* Month Tasks */}
          <div style={{ background: C.white, borderBottom: `4px solid ${C.tealLight}` }}>
            <div style={sectionStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 18, borderBottom: `2px solid ${C.tealLight}`, marginBottom: 28 }}>
                <div style={{ width: 52, height: 52, background: C.teal, clipPath: "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: C.white, fontSize: 22, fontWeight: 900 }}>{m.num}</span>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.dark }}>{m.title}</div>
                  <div style={{ fontSize: 15, color: C.orange, fontWeight: 600, marginTop: 2 }}>{m.hijri}{m.milestone ? ` — ${m.milestone.label}` : ""}</div>
                </div>
              </div>

              <div style={m.twoCol ? { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px 24px" } : {}}>
                {m.categories.map((cat, ci) => <CategoryBlock key={ci} cat={cat} />)}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer style={{ background: C.dark, color: C.grayLight, textAlign: "center", padding: "28px 16px", fontSize: 15 }}>
        نظام قافلة التقوى — الخطة الزمنية للتنفيذ &nbsp;|&nbsp; إعداد: حسين الزاير
      </footer>
    </div>
  );
}
