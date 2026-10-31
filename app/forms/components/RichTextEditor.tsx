"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Cmd = { label: ReactNode; title: string; cmd: string; arg?: string };

const COMMANDS: Cmd[][] = [
  [
    { label: <b>B</b>, title: "عريض", cmd: "bold" },
    { label: <i>I</i>, title: "مائل", cmd: "italic" },
    { label: <u>U</u>, title: "تحته خط", cmd: "underline" },
    { label: <s>S</s>, title: "يتوسطه خط", cmd: "strikeThrough" },
  ],
  [
    { label: "H2", title: "عنوان", cmd: "formatBlock", arg: "h2" },
    { label: "H3", title: "عنوان فرعي", cmd: "formatBlock", arg: "h3" },
    { label: "❝", title: "اقتباس", cmd: "formatBlock", arg: "blockquote" },
    { label: "¶", title: "نص عادي", cmd: "formatBlock", arg: "p" },
  ],
  [
    { label: "•", title: "قائمة نقطية", cmd: "insertUnorderedList" },
    { label: "1.", title: "قائمة مرقّمة", cmd: "insertOrderedList" },
    { label: "⌫", title: "إزالة التنسيق", cmd: "removeFormat" },
  ],
];

/**
 * محرّر نص منسّق بسيط بدون مكتبات (contentEditable + execCommand).
 * القيمة HTML خام؛ تُنظَّف على الخادم عند الحفظ وعند العرض.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "اكتب إجابتك هنا…",
  minHeight = 160,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // نحدّث المحتوى فقط إذا تغيّر من الخارج، لتجنّب قفز المؤشر أثناء الكتابة
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value && document.activeElement !== el) {
      el.innerHTML = value;
    }
  }, [value]);

  const run = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition focus-within:border-[#16b1a1] focus-within:ring-4 focus-within:ring-[#16b1a1]/10">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-100 bg-gray-50/80 px-2 py-1.5">
        {COMMANDS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {group.map((c) => (
              <button
                key={c.cmd + (c.arg ?? "")}
                type="button"
                title={c.title}
                aria-label={c.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(c.cmd, c.arg)}
                className="grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm font-bold text-gray-600 transition hover:bg-white hover:text-[#16b1a1] hover:shadow-sm"
              >
                {c.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="rich-text rich-editor px-4 py-3 text-sm text-gray-800 outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
