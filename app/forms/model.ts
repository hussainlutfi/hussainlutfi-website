/**
 * نموذج بيانات النماذج (الاستبيانات) — مشترك بين الخادم والمتصفح.
 */

export type QuestionType = "text" | "choice";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  /** خيارات سؤال الاختيار من متعدد */
  options: string[];
  /** يسمح باختيار أكثر من خيار */
  multiple: boolean;
}

export interface FormDef {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  /** يستقبل ردوداً جديدة */
  open: boolean;
  /** يطلب اسم المُجيب (اختياري له) */
  askName: boolean;
  responses: number;
  createdAt: string;
  updatedAt: string;
}

/** ما يرسله المتصفح عند الإنشاء/التعديل */
export type FormInput = Pick<FormDef, "title" | "description" | "questions" | "askName">;

/** الإجابة: نص منسّق (HTML مُنظّف) للسؤال النصي، أو قائمة الخيارات المختارة */
export type Answer = string | string[];

export interface FormResponse {
  id: string;
  name: string;
  answers: Record<string, Answer>;
  createdAt: string;
}

export const newId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const emptyQuestion = (type: QuestionType = "text"): Question => ({
  id: newId(),
  type,
  title: "",
  required: false,
  options: type === "choice" ? ["", ""] : [],
  multiple: false,
});

/* ── تنظيف النص المنسّق ── */

const ALLOWED_TAGS = new Set([
  "p", "br", "div", "span", "b", "strong", "i", "em", "u", "s", "strike", "del",
  "ul", "ol", "li", "h1", "h2", "h3", "blockquote",
]);

/**
 * يُبقي الوسوم المسموحة فقط ويحذف كل الخصائص، ويُهرّب أي "<" أو ">" خارج الوسوم.
 * بما أن كل خاصية تُحذف لا يمكن تمرير أحداث أو روابط ضارة.
 */
export function sanitizeHtml(input: unknown, max = 20000): string {
  if (typeof input !== "string") return "";
  const src = input.slice(0, max);
  let out = "";
  let i = 0;
  while (i < src.length) {
    const lt = src.indexOf("<", i);
    if (lt === -1) {
      out += escapeText(src.slice(i));
      break;
    }
    out += escapeText(src.slice(i, lt));
    const gt = src.indexOf(">", lt);
    if (gt === -1) {
      out += escapeText(src.slice(lt));
      break;
    }
    const raw = src.slice(lt + 1, gt);
    const m = /^(\/?)([a-zA-Z][a-zA-Z0-9]*)(?:[\s/][^]*)?$/.exec(raw);
    if (m) {
      const tag = m[2].toLowerCase();
      if (ALLOWED_TAGS.has(tag)) out += tag === "br" ? "<br>" : `<${m[1]}${tag}>`;
    }
    i = gt + 1;
  }
  return out;
}

const escapeText = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** هل النص المنسّق فارغ فعلياً (لا يحوي سوى وسوم ومسافات)؟ */
export const isHtmlEmpty = (html: string): boolean =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() === "";

/* ── تنظيف البيانات الواردة (الخادم) ── */

const cleanStr = (v: unknown, max = 300): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export function sanitizeFormInput(input: unknown): FormInput {
  const d = (input ?? {}) as Record<string, unknown>;
  const rawQs = Array.isArray(d.questions) ? d.questions.slice(0, 60) : [];
  const questions: Question[] = rawQs
    .map((raw) => {
      const q = (raw ?? {}) as Record<string, unknown>;
      const type: QuestionType = q.type === "choice" ? "choice" : "text";
      const options =
        type === "choice" && Array.isArray(q.options)
          ? q.options.slice(0, 30).map((o) => cleanStr(o, 200)).filter(Boolean)
          : [];
      return {
        id: cleanStr(q.id, 40) || newId(),
        type,
        title: cleanStr(q.title, 500),
        required: q.required === true,
        options,
        multiple: type === "choice" && q.multiple === true,
      };
    })
    .filter((q) => q.title && (q.type === "text" || q.options.length >= 1));

  return {
    title: cleanStr(d.title, 200),
    description: cleanStr(d.description, 2000),
    questions,
    askName: d.askName !== false,
  };
}

export type ValidationError = { ok: false; error: string };

export function validateFormInput(f: FormInput): ValidationError | { ok: true } {
  if (!f.title) return { ok: false, error: "عنوان النموذج مطلوب." };
  if (!f.questions.length) return { ok: false, error: "أضف سؤالاً واحداً على الأقل." };
  return { ok: true };
}

/** ينظّف إجابات المُجيب بحسب أسئلة النموذج ويتحقق من الحقول المطلوبة. */
export function sanitizeAnswers(
  form: Pick<FormDef, "questions">,
  input: unknown
): { ok: true; answers: Record<string, Answer> } | ValidationError {
  const raw = (input ?? {}) as Record<string, unknown>;
  const answers: Record<string, Answer> = {};

  for (const q of form.questions) {
    const v = raw[q.id];
    if (q.type === "text") {
      const html = sanitizeHtml(v);
      if (isHtmlEmpty(html)) {
        if (q.required) return { ok: false, error: `السؤال «${q.title}» مطلوب.` };
        continue;
      }
      answers[q.id] = html;
    } else {
      const list = (Array.isArray(v) ? v : [v])
        .filter((o): o is string => typeof o === "string" && q.options.includes(o))
        .slice(0, q.multiple ? q.options.length : 1);
      if (!list.length) {
        if (q.required) return { ok: false, error: `السؤال «${q.title}» مطلوب.` };
        continue;
      }
      answers[q.id] = list;
    }
  }
  return { ok: true, answers };
}

export function sanitizeResponse(raw: unknown, id: string): FormResponse {
  const r = (raw ?? {}) as Record<string, unknown>;
  const answersRaw = (r.answers ?? {}) as Record<string, unknown>;
  const answers: Record<string, Answer> = {};
  for (const [k, v] of Object.entries(answersRaw)) {
    if (typeof v === "string") answers[k] = sanitizeHtml(v);
    else if (Array.isArray(v)) answers[k] = v.filter((o): o is string => typeof o === "string");
  }
  return {
    id,
    name: cleanStr(r.name, 120),
    answers,
    createdAt: cleanStr(r.createdAt, 40),
  };
}

export function sanitizeForm(raw: unknown, id: string): FormDef {
  const d = (raw ?? {}) as Record<string, unknown>;
  const base = sanitizeFormInput(d);
  return {
    id,
    ...base,
    open: d.open !== false,
    responses: typeof d.responses === "number" ? d.responses : 0,
    createdAt: cleanStr(d.createdAt, 40),
    updatedAt: cleanStr(d.updatedAt, 40),
  };
}

/* ── عرض ── */

export function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
