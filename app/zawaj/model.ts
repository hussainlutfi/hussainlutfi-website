/**
 * استبيان السؤال عن المرشّحة للزواج — الأسئلة وتنظيف البيانات، مشترك بين الخادم والمتصفح.
 * لإضافة سؤال يكفي تعديل SECTIONS؛ الصفحتان تُبنيان منها.
 */

export const UNKNOWN = "لا أعلم";

export const INTRO =
  "أسألكِ بقصد الزواج، وكلامكِ أمانة ويبقى سرّاً. أجيبي بما تعرفينه فقط، واختاري «لا أعلم» إن لم تكوني متأكدة.";

export type Item =
  | { id: string; kind: "choice"; label: string; options: string[]; required?: boolean }
  | { id: string; kind: "text"; label: string; placeholder?: string };

export interface Section {
  id: string;
  title: string;
  /** تمهيد قصير قبل السؤال */
  lead?: string;
  /** السؤال الرئيسي ثم أسئلة المتابعة */
  items: Item[];
}

export const SECTIONS: Section[] = [
  {
    id: "thinking",
    title: "طريقة التفكير",
    items: [
      {
        id: "thinking",
        kind: "choice",
        required: true,
        label: "عند اتخاذ قرار أو مواجهة موقف، كيف تفكّر غالباً؟",
        options: [
          "بعقلانية، تدرس الأمر قبل الحكم",
          "بعاطفة، يغلب عليها الشعور",
          "تجمع بينهما حسب الموقف",
          "تعتمد على رأي غيرها أكثر من رأيها",
          UNKNOWN,
        ],
      },
      {
        id: "thinking_example",
        kind: "text",
        label: "اذكري موقفاً يبيّن ذلك إن أمكن.",
        placeholder: "مثلاً: موقف رأيتِ فيه كيف اتخذت قراراً…",
      },
    ],
  },
  {
    id: "conflict",
    title: "إدارة الخلاف",
    lead: "كل علاقة يقع فيها خلاف.",
    items: [
      {
        id: "conflict",
        kind: "choice",
        required: true,
        label: "كيف تتصرف عادةً إذا اختلفت مع شخص قريب منها؟",
        options: [
          "تبادر بالحوار لمعرفة السبب وحلّه",
          "تحتاج وقتاً لتهدأ ثم تعود للنقاش",
          "تنسحب وتتجاهل الموضوع",
          "تكتم في قلبها ولا تتكلم، وقد تنفجر لاحقاً",
          "تنفعل في لحظتها ثم تهدأ سريعاً",
          UNKNOWN,
        ],
      },
      {
        id: "conflict_apology",
        kind: "choice",
        label: "هل تعتذر إذا أخطأت؟",
        options: ["نعم، تعتذر دون تردد", "تعتذر أحياناً", "نادراً ما تعتذر", UNKNOWN],
      },
      {
        id: "conflict_forgive",
        kind: "choice",
        label: "هل تسامح بسهولة؟",
        options: ["نعم، تسامح بسهولة", "تسامح بعد مدة", "يصعب عليها أن تسامح", UNKNOWN],
      },
      {
        id: "conflict_details",
        kind: "text",
        label: "وضّحي إجابتكِ أو اذكري موقفاً من خلاف شهدتِه.",
      },
    ],
  },
  {
    id: "money",
    title: "المال والكماليات والقناعة",
    items: [
      {
        id: "money",
        kind: "choice",
        required: true,
        label: "كيف تنظر إلى الرفاهية والمظاهر؟",
        options: [
          "قنوعة، ترضى بالموجود ولا تتأثر بما عند غيرها",
          "تحب الأشياء الجميلة ضمن حدود الإمكانيات",
          "تتأثر بما تقتنيه من حولها وتحب مجاراتهن",
          "المظاهر والماركات مهمة جداً عندها",
          UNKNOWN,
        ],
      },
      {
        id: "money_contentment",
        kind: "text",
        label: "ماذا تعني القناعة عندها برأيكِ؟",
      },
      {
        id: "money_unmet",
        kind: "text",
        label: "كيف تتصرف إذا أرادت شيئاً ولم تستطع الحصول عليه؟",
      },
    ],
  },
  {
    id: "other",
    title: "إضافة",
    items: [
      {
        id: "other_notes",
        kind: "text",
        label: "هل تودّين إضافة شيء آخر عنها لم تشمله الأسئلة؟",
      },
    ],
  },
];

export const ALL_ITEMS: Item[] = SECTIONS.flatMap((s) => s.items);

export interface Inquiry {
  id: string;
  /** اسم المرشّحة */
  candidate: string;
  /** اسم المُجيبة */
  submitter: string;
  answers: Record<string, string>;
  createdAt: string;
}

export type InquiryInput = Pick<Inquiry, "candidate" | "submitter" | "answers">;

/* ── تنظيف البيانات ── */

const cleanStr = (v: unknown, max = 300): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/** يُبقي الإجابات المعروفة فقط: خيار من القائمة، أو نص حتى ٥٠٠٠ حرف. */
function cleanAnswers(raw: unknown): Record<string, string> {
  const r = (raw ?? {}) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const item of ALL_ITEMS) {
    const v = cleanStr(r[item.id], item.kind === "text" ? 5000 : 200);
    if (!v) continue;
    if (item.kind === "choice" && !item.options.includes(v)) continue;
    out[item.id] = v;
  }
  return out;
}

export function sanitizeInput(input: unknown): InquiryInput {
  const d = (input ?? {}) as Record<string, unknown>;
  return {
    candidate: cleanStr(d.candidate, 120),
    submitter: cleanStr(d.submitter, 120),
    answers: cleanAnswers(d.answers),
  };
}

/** أول خطأ في الإدخال، أو null إن كان سليماً. */
export function validateInput(f: InquiryInput): string | null {
  if (!f.candidate) return "اكتبي اسم المرشّحة.";
  if (!f.submitter) return "اكتبي اسمكِ.";
  for (const item of ALL_ITEMS) {
    if (item.kind === "choice" && item.required && !f.answers[item.id]) {
      return `أجيبي عن السؤال: «${item.label}»`;
    }
  }
  return null;
}

export function sanitizeInquiry(raw: unknown, id: string): Inquiry {
  const d = (raw ?? {}) as Record<string, unknown>;
  return { id, ...sanitizeInput(d), createdAt: cleanStr(d.createdAt, 40) };
}

/** مفتاح تجميع الردود حسب المرشّحة: يتجاهل المسافات الزائدة والهمزات والتاء المربوطة. */
export const candidateKey = (name: string): string =>
  name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
