import {
  degreeLabel,
  fmtDate,
  fmtRange,
  isEmptyBi,
  LANG_LABELS,
  type BiText,
  type CvLang,
  type CvRequestDoc,
} from "../model";

/* ------------------------------------------------------------------ */
/* أدوات مساعدة                                                        */
/* ------------------------------------------------------------------ */

export function fmtCreatedAt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
  }).format(d);
}

/** نص ثنائي اللغة كسطر واحد: «العربية / English». */
const bi = (v: BiText): string => [v.ar, v.en].filter(Boolean).join(" / ");

const line = (label: string, value: string): string => (value ? `${label}: ${value}` : "");

/* ------------------------------------------------------------------ */
/* النسخة النصية — أقسام معنونة بالعربية                                */
/* ------------------------------------------------------------------ */

export function buildPlainText(doc: CvRequestDoc): string {
  const d = doc.data;
  const out: string[] = [];

  out.push(`طلب سيرة ذاتية — ${LANG_LABELS[d.lang]}`);
  const created = fmtCreatedAt(doc.createdAt);
  if (created) out.push(`تاريخ الطلب: ${created}`);

  out.push("", "== المعلومات الأساسية ==");
  out.push(line("الاسم الكامل", bi(d.name)));
  out.push(line("المسمى الوظيفي المستهدف", bi(d.jobTitle)));
  out.push(line("البريد الإلكتروني", d.email));
  out.push(line("LinkedIn", d.linkedin));
  out.push(line("رابط إضافي", d.portfolio));

  if (d.education.length) {
    out.push("", "== التعليم ==");
    d.education.forEach((e, i) => {
      out.push(`${i + 1}) ${line("التخصص", bi(e.major))}`);
      out.push(`   ${line("الدرجة العلمية", degreeLabel(e.degree, d.lang))}`);
      out.push(`   ${line("الجهة التعليمية", bi(e.authority))}`);
      out.push(`   ${line("الفترة", fmtRange(e.start, e.end, e.present))}`);
    });
  }

  if (d.experiences.length) {
    out.push("", "== الخبرات العملية ==");
    d.experiences.forEach((e, i) => {
      out.push(`${i + 1}) ${line("المسمى الوظيفي", bi(e.title))}`);
      out.push(`   ${line("جهة العمل", bi(e.employer))}`);
      out.push(`   ${line("الفترة", fmtRange(e.start, e.end, e.present))}`);
      if (e.details) out.push(`   تفاصيل المهام والإنجازات:`, `   ${e.details.replace(/\n/g, "\n   ")}`);
    });
  }

  if (d.projects.length) {
    out.push("", "== المشاريع ==");
    d.projects.forEach((p, i) => {
      out.push(`${i + 1}) ${line("عنوان المشروع", bi(p.title))}`);
      if (!isEmptyBi(p.owner)) out.push(`   ${line("الجهة", bi(p.owner))}`);
      const range = fmtRange(p.start, p.end, false);
      if (range) out.push(`   ${line("الفترة", range)}`);
      if (p.details) out.push(`   تفاصيل المشروع:`, `   ${p.details.replace(/\n/g, "\n   ")}`);
    });
  }

  if (d.courses.length) {
    out.push("", "== الدورات التدريبية ==");
    d.courses.forEach((c, i) => {
      out.push(`${i + 1}) ${line("عنوان الدورة", bi(c.title))}`);
      if (c.details) out.push(`   تفاصيل الدورة:`, `   ${c.details.replace(/\n/g, "\n   ")}`);
    });
  }

  if (d.certificates.length) {
    out.push("", "== الشهادات الاحترافية ==");
    d.certificates.forEach((c, i) => {
      out.push(`${i + 1}) ${line("اسم الشهادة", bi(c.title))}`);
      if (!isEmptyBi(c.issuer)) out.push(`   ${line("الجهة المانحة", bi(c.issuer))}`);
      const date = fmtDate(c.date);
      if (date) out.push(`   ${line("التاريخ", date)}`);
    });
  }

  if (d.skills.length) {
    out.push("", "== المهارات ==");
    out.push(d.skills.join("، "));
  }

  return out.filter((l, i, arr) => l !== "" || arr[i + 1]?.startsWith("==")).join("\n");
}

/* ------------------------------------------------------------------ */
/* برومبت Claude — تعليمات إنجليزية احترافية + البيانات كما هي           */
/* ------------------------------------------------------------------ */

const CV_LANG_DESC: Record<CvLang, string> = {
  ar: "Arabic only (one Arabic CV will be built)",
  en: "English only (one English CV will be built)",
  both: "Arabic AND English (two CV versions will be built from this content)",
};

const BULLET_LANG_RULE: Record<CvLang, string> = {
  ar: "   - Write all bullets in professional, formal Arabic.",
  en: "   - Write all bullets in professional English.",
  both:
    "   - Write each bullet in professional English (max 90 characters), and directly below it provide its Arabic translation as its own separate copyable line. The English set will be used for the English CV and the Arabic set for the Arabic CV, so the pairs must match in meaning.",
};

export function buildClaudePrompt(doc: CvRequestDoc): string {
  const lang = doc.data.lang;

  return `You are an expert bilingual (Arabic/English) CV writer and front-end developer. Below is a structured CV request submitted by a candidate through my website. Your job is to produce ONE self-contained HTML file that presents the candidate's polished, copy-ready CV content, so that each piece can be copied with one click straight into a CV template.

REQUESTED CV LANGUAGE: ${CV_LANG_DESC[lang]}

## Output requirements (the HTML file)

1. Produce a single self-contained HTML file: inline CSS and vanilla JavaScript only — no external resources, fonts, or libraries.
2. Page direction is RTL and all interface labels are in Arabic, regardless of the CV language.
3. Organize the page into these sections in this exact order, skipping any section that has no data:
   المعلومات الأساسية، التعليم، الخبرات العملية، المشاريع، الدورات التدريبية، الشهادات الاحترافية، المهارات
4. Every piece of content must live inside a copyable block: a card showing a small Arabic label, the content text, and a «نسخ» button that copies the block's EXACT text to the clipboard via navigator.clipboard.writeText, showing a brief «تم النسخ ✓» confirmation on the button itself.
5. Granularity matters: each field is its own block (the name, the job title, the email, each degree line, each date range, each bullet group, the skills list) so I can copy items independently. For bullet groups, add one button that copies the whole group AND a small copy button per individual bullet.
6. Use a clean, professional design: light background, one accent color (#16b1a1), generous spacing, clear section headings.

## Content rules

1. «المعلومات الأساسية» and «التعليم»: reproduce the data EXACTLY as provided — verbatim, no rewriting, no translation, no embellishment. You may only normalize obvious spacing/punctuation issues.
2. «تفاصيل المهام والإنجازات» (experience details), «تفاصيل المشروع» (project details), and «تفاصيل الدورة» (course details): rewrite each one into 3 to 5 professional CV bullet points:
   - Each bullet is at most 90 characters.
   - Start each bullet with a strong action verb; be technical and specific — name the tools, systems, and processes involved, and quantify results whenever the source text allows.
   - NEVER invent facts, numbers, tools, or achievements that the candidate did not state — refine, compress, and professionalize only what is written.
${BULLET_LANG_RULE[lang]}
3. «المهارات»: keep exactly as provided; render them as one copyable comma-separated block plus individual copyable chips.
4. Dates: keep the calendar(s) exactly as given (Hijri and/or Gregorian). Do NOT convert between calendars and do NOT reformat month names.
5. Do not add any section, field, or content the candidate did not provide, and do not drop anything they did provide.

## Candidate data

${buildPlainText(doc)}`;
}
