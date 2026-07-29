"use client";

import { useRef, useState } from "react";
import {
  DEGREES,
  emptyCertificate,
  emptyCourse,
  emptyCvRequest,
  emptyEducation,
  emptyExperience,
  emptyProject,
  LANG_LABELS,
  validateCvRequest,
  type CvLang,
  type CvRequest,
} from "../model";
import {
  AddButton,
  BiTextInput,
  CvDateInput,
  EntryCard,
  FieldLabel,
  inputBase,
  NoteBox,
  PresentToggle,
  Section,
  SkillsInput,
  TextArea,
  TextInput,
} from "./fields";

const LANG_OPTIONS: { key: CvLang; title: string; desc: string }[] = [
  { key: "ar", title: "سيرة ذاتية بالعربية", desc: "المحتوى والتواريخ بالعربية والتقويم الهجري" },
  { key: "en", title: "سيرة ذاتية بالإنجليزية", desc: "المحتوى بالإنجليزية والتواريخ بالتقويم الميلادي" },
  { key: "both", title: "سيرة ذاتية بالعربية والإنجليزية", desc: "نسختان كاملتان — تُدخل الأسماء والعناوين باللغتين والتواريخ بالتقويمين" },
];

export default function CvForm() {
  const [data, setData] = useState<CvRequest | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const errorsRef = useRef<HTMLDivElement>(null);

  /* ---------- شاشة النجاح ---------- */
  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#16b1a1]/10 text-4xl">
          ✓
        </div>
        <h1 className="mb-3 text-2xl font-extrabold text-gray-800">تم استلام طلبك بنجاح</h1>
        <p className="mb-8 leading-relaxed text-gray-500">
          شكراً لك — تم حفظ جميع البيانات، وسيتم إعداد سيرتك الذاتية والتواصل معك عبر البريد الإلكتروني.
        </p>
        <button
          type="button"
          onClick={() => {
            setData(null);
            setErrors([]);
            setDone(false);
          }}
          className="rounded-xl bg-[#16b1a1] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0e8e81]"
        >
          إرسال طلب جديد
        </button>
      </div>
    );
  }

  /* ---------- الخطوة الأولى: اختيار لغة السيرة ---------- */
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-extrabold text-gray-800">طلب سيرة ذاتية</h1>
          <p className="leading-relaxed text-gray-500">
            عبّئ بياناتك بدقة وسيتم إعداد سيرة ذاتية احترافية لك. ابدأ باختيار لغة السيرة المطلوبة:
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setData(emptyCvRequest(opt.key))}
              className="group rounded-2xl border-2 border-gray-200 bg-white p-6 text-right shadow-sm transition hover:border-[#16b1a1] hover:shadow-md"
            >
              <div className="mb-2 text-base font-extrabold text-gray-800 transition group-hover:text-[#0e8e81]">
                {opt.title}
              </div>
              <div className="text-[12.5px] leading-relaxed text-gray-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const lang = data.lang;
  const set = (patch: Partial<CvRequest>) => setData({ ...data, ...patch });

  /** تحديث عنصر داخل مصفوفة قسم متعدد. */
  function updateAt<K extends "education" | "experiences" | "projects" | "courses" | "certificates">(
    key: K,
    index: number,
    patch: Partial<CvRequest[K][number]>
  ) {
    const list = [...data![key]] as CvRequest[K];
    list[index] = { ...list[index], ...patch };
    set({ [key]: list } as Partial<CvRequest>);
  }

  function removeAt(key: "education" | "experiences" | "projects" | "courses" | "certificates", index: number) {
    set({ [key]: data![key].filter((_, i) => i !== index) } as Partial<CvRequest>);
  }

  const submit = async () => {
    const found = validateCvRequest(data);
    setErrors(found);
    if (found.length) {
      setTimeout(() => errorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setDone(true);
        window.scrollTo({ top: 0 });
      } else {
        const body = await res.json().catch(() => null);
        setErrors(
          Array.isArray(body?.messages) && body.messages.length
            ? body.messages
            : ["تعذّر إرسال الطلب، حاول مرة أخرى بعد قليل"]
        );
        setTimeout(() => errorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      }
    } catch {
      setErrors(["تعذّر الاتصال بالخادم، تأكد من اتصالك بالإنترنت وحاول مرة أخرى"]);
      setTimeout(() => errorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-gray-800">طلب سيرة ذاتية</h1>
        <p className="text-sm text-gray-500">
          الحقول المعلّمة بـ <span className="font-bold text-red-500">*</span> إلزامية
        </p>
      </header>

      {/* شريط لغة السيرة المختارة */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#16b1a1]/25 bg-[#16b1a1]/5 px-5 py-3.5">
        <div className="text-sm font-extrabold text-[#0e8e81]">{LANG_LABELS[lang]}</div>
        <button
          type="button"
          onClick={() => {
            setData(null);
            setErrors([]);
          }}
          className="text-[12px] font-bold text-gray-500 underline underline-offset-4 transition hover:text-[#0e8e81]"
        >
          تغيير اللغة
        </button>
      </div>

      <div className="grid gap-6">
        {/* ------------------------------------------------ المعلومات الأساسية */}
        <Section title="المعلومات الأساسية" required>
          <BiTextInput lang={lang} label="الاسم الكامل" required value={data.name} onValue={(name) => set({ name })} />
          <BiTextInput
            lang={lang}
            label="المسمى الوظيفي المستهدف"
            required
            value={data.jobTitle}
            onValue={(jobTitle) => set({ jobTitle })}
            placeholderAr="مثال: مهندس برمجيات"
            placeholderEn="e.g. Software Engineer"
          />
          <div>
            <FieldLabel text="البريد الإلكتروني (يظهر في السيرة لجهات التوظيف)" required />
            <TextInput dir="ltr" type="email" value={data.email} onValue={(email) => set({ email })} placeholder="name@example.com" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel text="رابط LinkedIn" />
              <TextInput dir="ltr" value={data.linkedin} onValue={(linkedin) => set({ linkedin })} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <FieldLabel text="رابط إضافي (معرض أعمال أو موقع شخصي)" />
              <TextInput dir="ltr" value={data.portfolio} onValue={(portfolio) => set({ portfolio })} placeholder="https://..." />
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------ التعليم */}
        <Section title="التعليم" required hint="أضف مؤهلاتك التعليمية — يمكن إضافة أكثر من مؤهل، وجميع حقول كل مؤهل إلزامية.">
          {data.education.map((e, i) => (
            <EntryCard key={i} index={i} label="المؤهل" removable={data.education.length > 1} onRemove={() => removeAt("education", i)}>
              <BiTextInput
                lang={lang}
                label="التخصص"
                required
                value={e.major}
                onValue={(major) => updateAt("education", i, { major })}
                placeholderAr="مثال: علوم الحاسب"
                placeholderEn="e.g. Computer Science"
              />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <FieldLabel text="الدرجة العلمية" required />
                  <select
                    className={`${inputBase} cursor-pointer appearance-none`}
                    value={e.degree}
                    onChange={(ev) => updateAt("education", i, { degree: ev.target.value })}
                  >
                    <option value="">اختر الدرجة…</option>
                    {DEGREES.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.ar}
                      </option>
                    ))}
                  </select>
                </div>
                <BiTextInput
                  lang={lang}
                  label="الجهة التعليمية"
                  required
                  value={e.authority}
                  onValue={(authority) => updateAt("education", i, { authority })}
                  placeholderAr="مثال: جامعة الملك فهد للبترول والمعادن"
                  placeholderEn="e.g. KFUPM"
                />
              </div>
              <CvDateInput lang={lang} label="تاريخ الالتحاق" required value={e.start} onValue={(start) => updateAt("education", i, { start })} />
              <div>
                <FieldLabel text="تاريخ التخرج" required />
                <div className="grid gap-2.5">
                  <PresentToggle
                    present={e.present}
                    onChange={(present) => updateAt("education", i, { present })}
                    dateLabel="تخرجت بتاريخ"
                    presentLabel="ما زلت أدرس (حتى الآن)"
                  />
                  {!e.present && <CvDateInput lang={lang} label="" value={e.end} onValue={(end) => updateAt("education", i, { end })} />}
                </div>
              </div>
            </EntryCard>
          ))}
          <AddButton label="إضافة مؤهل تعليمي" onClick={() => set({ education: [...data.education, emptyEducation()] })} />
        </Section>

        {/* ------------------------------------------------ الخبرات العملية */}
        <Section title="الخبرات العملية" hint="أضف خبراتك الوظيفية والتدريبية — يمكن إضافة أكثر من خبرة.">
          {data.experiences.map((e, i) => (
            <EntryCard key={i} index={i} label="الخبرة" removable onRemove={() => removeAt("experiences", i)}>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <BiTextInput
                  lang={lang}
                  label="المسمى الوظيفي"
                  required
                  value={e.title}
                  onValue={(title) => updateAt("experiences", i, { title })}
                  placeholderAr="مثال: مطوّر تطبيقات"
                  placeholderEn="e.g. App Developer"
                />
                <BiTextInput
                  lang={lang}
                  label="جهة العمل"
                  required
                  value={e.employer}
                  onValue={(employer) => updateAt("experiences", i, { employer })}
                  placeholderAr="اسم الشركة أو المؤسسة"
                  placeholderEn="Company name"
                />
              </div>
              <CvDateInput lang={lang} label="تاريخ الالتحاق" required value={e.start} onValue={(start) => updateAt("experiences", i, { start })} />
              <div>
                <FieldLabel text="تاريخ ترك العمل" required />
                <div className="grid gap-2.5">
                  <PresentToggle
                    present={e.present}
                    onChange={(present) => updateAt("experiences", i, { present })}
                    dateLabel="تركت العمل بتاريخ"
                    presentLabel="ما زلت أعمل (حتى الآن)"
                  />
                  {!e.present && <CvDateInput lang={lang} label="" value={e.end} onValue={(end) => updateAt("experiences", i, { end })} />}
                </div>
              </div>
              <div>
                <FieldLabel text="تفاصيل المهام والإنجازات" required />
                <div className="mb-2">
                  <NoteBox>
                    اكتب تفاصيل مهنية دقيقة عن مهامك وإنجازاتك، وتجنّب العبارات العامة. ركّز على الجوانب التقنية:
                    الأدوات والأنظمة التي استخدمتها، والعمليات التي أدرتها، والنتائج التي حققتها.
                    <br />
                    مثال: بدلاً من «كنت أعدّ الخبز في مخبز»، اكتب «أدرت أفران إنتاج بطاقة ٥٠٠ رغيف يومياً، وضبطت
                    درجات الحرارة ومعايير جودة العجين، وأشرفت على سلامة خط الإنتاج».
                  </NoteBox>
                </div>
                <TextArea
                  value={e.details}
                  onValue={(details) => updateAt("experiences", i, { details })}
                  placeholder="اذكر مهامك وإنجازاتك بتفصيل تقني…"
                />
              </div>
            </EntryCard>
          ))}
          <AddButton label="إضافة خبرة عملية" onClick={() => set({ experiences: [...data.experiences, emptyExperience()] })} />
        </Section>

        {/* ------------------------------------------------ المشاريع */}
        <Section title="المشاريع" hint="مشاريع أنجزتها خلال الدراسة أو العمل أو بشكل مستقل — يمكن إضافة أكثر من مشروع.">
          {data.projects.map((p, i) => (
            <EntryCard key={i} index={i} label="المشروع" removable onRemove={() => removeAt("projects", i)}>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <BiTextInput
                  lang={lang}
                  label="عنوان المشروع"
                  value={p.title}
                  onValue={(title) => updateAt("projects", i, { title })}
                />
                <BiTextInput
                  lang={lang}
                  label="الجهة المرتبطة بالمشروع"
                  value={p.owner}
                  onValue={(owner) => updateAt("projects", i, { owner })}
                  placeholderAr="مثال: جامعة، شركة، مشروع شخصي"
                  placeholderEn="e.g. University, Company"
                />
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <CvDateInput lang={lang} label="تاريخ البداية" value={p.start} onValue={(start) => updateAt("projects", i, { start })} />
                <CvDateInput lang={lang} label="تاريخ النهاية" value={p.end} onValue={(end) => updateAt("projects", i, { end })} />
              </div>
              <div>
                <FieldLabel text="تفاصيل المشروع" />
                <div className="mb-2">
                  <NoteBox>
                    صف المشروع بلغة مهنية وتقنية: الهدف منه، والأدوات والتقنيات المستخدمة، ودورك فيه، والنتيجة
                    النهائية التي تحققت.
                  </NoteBox>
                </div>
                <TextArea value={p.details} onValue={(details) => updateAt("projects", i, { details })} placeholder="اشرح المشروع ودورك فيه بتفصيل تقني…" />
              </div>
            </EntryCard>
          ))}
          <AddButton label="إضافة مشروع" onClick={() => set({ projects: [...data.projects, emptyProject()] })} />
        </Section>

        {/* ------------------------------------------------ الدورات التدريبية */}
        <Section
          title="الدورات التدريبية"
          hint="أضف الدورات التي التحقت بها — إضافتها ضرورية إذا لم تكن لديك خبرات عملية أو مشاريع."
        >
          {data.courses.map((c, i) => (
            <EntryCard key={i} index={i} label="الدورة" removable onRemove={() => removeAt("courses", i)}>
              <BiTextInput lang={lang} label="عنوان الدورة" value={c.title} onValue={(title) => updateAt("courses", i, { title })} />
              <div>
                <FieldLabel text="تفاصيل الدورة" />
                <TextArea
                  rows={3}
                  value={c.details}
                  onValue={(details) => updateAt("courses", i, { details })}
                  placeholder="ما الذي تعلمته أو أتقنته في هذه الدورة؟"
                />
              </div>
            </EntryCard>
          ))}
          <AddButton label="إضافة دورة تدريبية" onClick={() => set({ courses: [...data.courses, emptyCourse()] })} />
        </Section>

        {/* ------------------------------------------------ الشهادات الاحترافية */}
        <Section title="الشهادات الاحترافية" hint="شهادات مهنية معتمدة حصلت عليها — يمكن إضافة أكثر من شهادة.">
          {data.certificates.map((c, i) => (
            <EntryCard key={i} index={i} label="الشهادة" removable onRemove={() => removeAt("certificates", i)}>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <BiTextInput lang={lang} label="اسم الشهادة" value={c.title} onValue={(title) => updateAt("certificates", i, { title })} />
                <BiTextInput
                  lang={lang}
                  label="الجهة المانحة"
                  value={c.issuer}
                  onValue={(issuer) => updateAt("certificates", i, { issuer })}
                />
              </div>
              <CvDateInput lang={lang} label="تاريخ الحصول عليها" value={c.date} onValue={(date) => updateAt("certificates", i, { date })} />
            </EntryCard>
          ))}
          <AddButton label="إضافة شهادة احترافية" onClick={() => set({ certificates: [...data.certificates, emptyCertificate()] })} />
        </Section>

        {/* ------------------------------------------------ المهارات */}
        <Section title="المهارات" hint="أضف مهاراتك التقنية والشخصية واللغوية.">
          <SkillsInput skills={data.skills} onChange={(skills) => set({ skills })} />
        </Section>

        {/* ------------------------------------------------ الأخطاء والإرسال */}
        {errors.length > 0 && (
          <div ref={errorsRef} className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="mb-2 text-sm font-extrabold text-red-600">أكمل الحقول التالية قبل الإرسال:</div>
            <ul className="grid list-inside list-disc gap-1 text-[13px] leading-relaxed text-red-600">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          disabled={sending}
          onClick={submit}
          className="rounded-2xl bg-[#16b1a1] py-4 text-base font-extrabold text-white shadow-md transition hover:bg-[#0e8e81] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "جارٍ الإرسال…" : "إرسال الطلب"}
        </button>
      </div>
    </div>
  );
}
