/** نموذج بيانات طلب السيرة الذاتية — مشترك بين النموذج وواجهة المراجعة والخادم. */

export type CvLang = "ar" | "en" | "both";

/** نص ثنائي اللغة — يُعبّأ حسب لغة السيرة المطلوبة. */
export type BiText = { ar: string; en: string };

/** شهر وسنة — month من 1 إلى 12، والقيمة 0 تعني غير محدد. */
export type YM = { month: number; year: string };

/** تاريخ قد يكون هجرياً أو ميلادياً أو كليهما حسب لغة السيرة. */
export type CvDate = { hijri: YM; greg: YM };

export type EducationEntry = {
  major: BiText;
  degree: string; // مفتاح من DEGREES
  authority: BiText;
  start: CvDate;
  end: CvDate;
  present: boolean;
};

export type ExperienceEntry = {
  title: BiText;
  employer: BiText;
  start: CvDate;
  end: CvDate;
  present: boolean;
  details: string;
};

export type ProjectEntry = {
  title: BiText;
  owner: BiText;
  start: CvDate;
  end: CvDate;
  details: string;
};

export type CourseEntry = {
  title: BiText;
  details: string;
};

export type CertificateEntry = {
  title: BiText;
  issuer: BiText;
  date: CvDate;
};

export type CvRequest = {
  lang: CvLang;
  name: BiText;
  jobTitle: BiText;
  email: string;
  linkedin: string;
  portfolio: string;
  education: EducationEntry[];
  experiences: ExperienceEntry[];
  projects: ProjectEntry[];
  courses: CourseEntry[];
  certificates: CertificateEntry[];
  skills: string[];
};

export type CvRequestDoc = {
  id: string;
  data: CvRequest;
  createdAt: string | null;
};

/* ------------------------------------------------------------------ */
/* الثوابت                                                             */
/* ------------------------------------------------------------------ */

export const HIJRI_MONTHS = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
] as const;

export const GREG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const DEGREES = [
  { key: "high-school", ar: "الثانوية العامة", en: "High School Diploma" },
  { key: "diploma", ar: "دبلوم", en: "Diploma" },
  { key: "bachelor", ar: "بكالوريوس", en: "Bachelor's Degree" },
  { key: "master", ar: "ماجستير", en: "Master's Degree" },
  { key: "phd", ar: "دكتوراه", en: "PhD" },
  { key: "fellowship", ar: "زمالة", en: "Fellowship" },
] as const;

export const LANG_LABELS: Record<CvLang, string> = {
  ar: "سيرة ذاتية بالعربية",
  en: "سيرة ذاتية بالإنجليزية",
  both: "سيرة ذاتية بالعربية والإنجليزية",
};

/** هل تتطلب اللغة المختارة إدخالاً بالعربية؟ */
export const needsAr = (lang: CvLang) => lang !== "en";
/** هل تتطلب اللغة المختارة إدخالاً بالإنجليزية؟ */
export const needsEn = (lang: CvLang) => lang !== "ar";
/** هل التواريخ بالتقويم الهجري؟ */
export const needsHijri = (lang: CvLang) => lang !== "en";
/** هل التواريخ بالتقويم الميلادي؟ */
export const needsGreg = (lang: CvLang) => lang !== "ar";

/* ------------------------------------------------------------------ */
/* قوالب فارغة                                                         */
/* ------------------------------------------------------------------ */

export const emptyBi = (): BiText => ({ ar: "", en: "" });
export const emptyYM = (): YM => ({ month: 0, year: "" });
export const emptyDate = (): CvDate => ({ hijri: emptyYM(), greg: emptyYM() });

export const emptyEducation = (): EducationEntry => ({
  major: emptyBi(),
  degree: "",
  authority: emptyBi(),
  start: emptyDate(),
  end: emptyDate(),
  present: false,
});

export const emptyExperience = (): ExperienceEntry => ({
  title: emptyBi(),
  employer: emptyBi(),
  start: emptyDate(),
  end: emptyDate(),
  present: false,
  details: "",
});

export const emptyProject = (): ProjectEntry => ({
  title: emptyBi(),
  owner: emptyBi(),
  start: emptyDate(),
  end: emptyDate(),
  details: "",
});

export const emptyCourse = (): CourseEntry => ({ title: emptyBi(), details: "" });

export const emptyCertificate = (): CertificateEntry => ({
  title: emptyBi(),
  issuer: emptyBi(),
  date: emptyDate(),
});

export const emptyCvRequest = (lang: CvLang = "ar"): CvRequest => ({
  lang,
  name: emptyBi(),
  jobTitle: emptyBi(),
  email: "",
  linkedin: "",
  portfolio: "",
  education: [emptyEducation()],
  experiences: [],
  projects: [],
  courses: [],
  certificates: [],
  skills: [],
});

/* ------------------------------------------------------------------ */
/* فحوصات الفراغ                                                       */
/* ------------------------------------------------------------------ */

export const isEmptyBi = (b: BiText) => !b.ar.trim() && !b.en.trim();
export const isEmptyYM = (ym: YM) => ym.month === 0 && !ym.year.trim();
export const isEmptyDate = (d: CvDate) => isEmptyYM(d.hijri) && isEmptyYM(d.greg);

export const isEmptyProject = (p: ProjectEntry) =>
  isEmptyBi(p.title) && isEmptyBi(p.owner) && isEmptyDate(p.start) && isEmptyDate(p.end) && !p.details.trim();

export const isEmptyCourse = (c: CourseEntry) => isEmptyBi(c.title) && !c.details.trim();

export const isEmptyCertificate = (c: CertificateEntry) =>
  isEmptyBi(c.title) && isEmptyBi(c.issuer) && isEmptyDate(c.date);

export const isEmptyExperience = (e: ExperienceEntry) =>
  isEmptyBi(e.title) && isEmptyBi(e.employer) && isEmptyDate(e.start) && isEmptyDate(e.end) && !e.details.trim() && !e.present;

/* ------------------------------------------------------------------ */
/* التنظيف (يُستخدم في الخادم لفرض الشكل الصحيح)                        */
/* ------------------------------------------------------------------ */

const MAX_SHORT = 200;
const MAX_LONG = 5000;
const MAX_ENTRIES = 20;
const MAX_SKILLS = 40;

/** تحويل الأرقام العربية إلى إنجليزية. */
const normalizeDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const str = (v: unknown, max = MAX_SHORT): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const bi = (v: unknown): BiText => {
  const o = (v ?? {}) as Record<string, unknown>;
  return { ar: str(o.ar), en: str(o.en) };
};

const ym = (v: unknown): YM => {
  const o = (v ?? {}) as Record<string, unknown>;
  const month = Number(o.month);
  const year = normalizeDigits(str(o.year, 8)).replace(/[^0-9]/g, "").slice(0, 4);
  return { month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : 0, year };
};

const date = (v: unknown): CvDate => {
  const o = (v ?? {}) as Record<string, unknown>;
  return { hijri: ym(o.hijri), greg: ym(o.greg) };
};

const arr = <T,>(v: unknown, map: (item: unknown) => T): T[] =>
  Array.isArray(v) ? v.slice(0, MAX_ENTRIES).map(map) : [];

export function sanitizeCvRequest(raw: unknown): CvRequest {
  const o = (raw ?? {}) as Record<string, unknown>;
  const lang: CvLang = o.lang === "en" || o.lang === "both" ? o.lang : "ar";

  const degreeKeys = new Set<string>(DEGREES.map((d) => d.key));

  return {
    lang,
    name: bi(o.name),
    jobTitle: bi(o.jobTitle),
    email: str(o.email),
    linkedin: str(o.linkedin, 500),
    portfolio: str(o.portfolio, 500),
    education: arr(o.education, (e) => {
      const x = (e ?? {}) as Record<string, unknown>;
      const deg = str(x.degree);
      return {
        major: bi(x.major),
        degree: degreeKeys.has(deg) ? deg : "",
        authority: bi(x.authority),
        start: date(x.start),
        end: date(x.end),
        present: x.present === true,
      };
    }),
    experiences: arr(o.experiences, (e) => {
      const x = (e ?? {}) as Record<string, unknown>;
      return {
        title: bi(x.title),
        employer: bi(x.employer),
        start: date(x.start),
        end: date(x.end),
        present: x.present === true,
        details: str(x.details, MAX_LONG),
      };
    }),
    projects: arr(o.projects, (p) => {
      const x = (p ?? {}) as Record<string, unknown>;
      return {
        title: bi(x.title),
        owner: bi(x.owner),
        start: date(x.start),
        end: date(x.end),
        details: str(x.details, MAX_LONG),
      };
    }).filter((p) => !isEmptyProject(p)),
    courses: arr(o.courses, (c) => {
      const x = (c ?? {}) as Record<string, unknown>;
      return { title: bi(x.title), details: str(x.details, MAX_LONG) };
    }).filter((c) => !isEmptyCourse(c)),
    certificates: arr(o.certificates, (c) => {
      const x = (c ?? {}) as Record<string, unknown>;
      return { title: bi(x.title), issuer: bi(x.issuer), date: date(x.date) };
    }).filter((c) => !isEmptyCertificate(c)),
    skills: (Array.isArray(o.skills) ? o.skills : [])
      .slice(0, MAX_SKILLS)
      .map((s) => str(s, 80))
      .filter(Boolean),
  };
}

/* ------------------------------------------------------------------ */
/* التحقق — يعيد قائمة رسائل خطأ بالعربية (فارغة = صالح)                */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** التحقق من نص ثنائي اللغة حسب اللغة المطلوبة. */
function biMissing(lang: CvLang, b: BiText): "ar" | "en" | null {
  if (needsAr(lang) && !b.ar.trim()) return "ar";
  if (needsEn(lang) && !b.en.trim()) return "en";
  return null;
}

function biError(lang: CvLang, b: BiText, label: string): string | null {
  const missing = biMissing(lang, b);
  if (!missing) return null;
  if (lang === "both") return `${label} مطلوب ${missing === "ar" ? "بالعربية" : "بالإنجليزية"}`;
  return `${label} مطلوب`;
}

function ymComplete(v: YM, kind: "hijri" | "greg"): boolean {
  if (v.month < 1 || v.month > 12) return false;
  const y = Number(v.year);
  if (!Number.isInteger(y)) return false;
  return kind === "hijri" ? y >= 1300 && y <= 1500 : y >= 1900 && y <= 2100;
}

function dateComplete(lang: CvLang, d: CvDate): boolean {
  if (needsHijri(lang) && !ymComplete(d.hijri, "hijri")) return false;
  if (needsGreg(lang) && !ymComplete(d.greg, "greg")) return false;
  return true;
}

export function validateCvRequest(d: CvRequest): string[] {
  const errors: string[] = [];
  const lang = d.lang;

  const nameErr = biError(lang, d.name, "الاسم الكامل");
  if (nameErr) errors.push(nameErr);
  const titleErr = biError(lang, d.jobTitle, "المسمى الوظيفي المستهدف");
  if (titleErr) errors.push(titleErr);

  if (!d.email.trim()) errors.push("البريد الإلكتروني مطلوب");
  else if (!EMAIL_RE.test(d.email.trim())) errors.push("البريد الإلكتروني غير صحيح");

  // التعليم — مطلوب مؤهل واحد على الأقل وجميع حقوله إلزامية
  if (d.education.length === 0) {
    errors.push("أضف مؤهلاً تعليمياً واحداً على الأقل");
  }
  d.education.forEach((e, i) => {
    const tag = d.education.length > 1 ? `التعليم ${i + 1}: ` : "التعليم: ";
    const majorErr = biError(lang, e.major, "التخصص");
    if (majorErr) errors.push(tag + majorErr);
    if (!e.degree) errors.push(tag + "اختر الدرجة العلمية");
    const authErr = biError(lang, e.authority, "الجهة التعليمية");
    if (authErr) errors.push(tag + authErr);
    if (!dateComplete(lang, e.start)) errors.push(tag + "أكمل تاريخ الالتحاق (الشهر والسنة)");
    if (!e.present && !dateComplete(lang, e.end)) errors.push(tag + "أكمل تاريخ التخرج أو اختر «حتى الآن»");
  });

  // الخبرات — القسم اختياري، لكن أي بطاقة مضافة يجب إكمالها
  d.experiences.forEach((e, i) => {
    if (isEmptyExperience(e)) return;
    const tag = `الخبرة ${i + 1}: `;
    const titleE = biError(lang, e.title, "المسمى الوظيفي");
    if (titleE) errors.push(tag + titleE);
    const empE = biError(lang, e.employer, "جهة العمل");
    if (empE) errors.push(tag + empE);
    if (!dateComplete(lang, e.start)) errors.push(tag + "أكمل تاريخ الالتحاق (الشهر والسنة)");
    if (!e.present && !dateComplete(lang, e.end)) errors.push(tag + "أكمل تاريخ ترك العمل أو اختر «حتى الآن»");
    if (!e.details.trim()) errors.push(tag + "اكتب تفاصيل المهام والإنجازات");
  });

  // دورة تدريبية واحدة على الأقل إن لم توجد خبرات أو مشاريع
  const hasExperience = d.experiences.some((e) => !isEmptyExperience(e));
  const hasProjects = d.projects.some((p) => !isEmptyProject(p));
  const hasCourses = d.courses.some((c) => !isEmptyCourse(c));
  if (!hasExperience && !hasProjects && !hasCourses) {
    errors.push("أضف خبرة عملية أو مشروعاً أو دورة تدريبية واحدة على الأقل");
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/* تنسيق العرض (لصفحة المراجعة)                                        */
/* ------------------------------------------------------------------ */

export function fmtYM(v: YM, kind: "hijri" | "greg"): string {
  if (v.month < 1 || v.month > 12 || !v.year) return "";
  return kind === "hijri"
    ? `${HIJRI_MONTHS[v.month - 1]} ${v.year}هـ`
    : `${GREG_MONTHS[v.month - 1]} ${v.year}`;
}

/** يجمع الهجري والميلادي في نص واحد إن وُجدا. */
export function fmtDate(d: CvDate): string {
  const parts = [fmtYM(d.hijri, "hijri"), fmtYM(d.greg, "greg")].filter(Boolean);
  return parts.join(" — ");
}

export function fmtRange(start: CvDate, end: CvDate, present: boolean): string {
  const s = fmtDate(start);
  const e = present ? "حتى الآن" : fmtDate(end);
  if (!s && !e) return "";
  return [s, e].filter(Boolean).join(" ← ");
}

export function degreeLabel(key: string, lang: CvLang): string {
  const d = DEGREES.find((x) => x.key === key);
  if (!d) return "";
  if (lang === "ar") return d.ar;
  if (lang === "en") return d.en;
  return `${d.ar} / ${d.en}`;
}
