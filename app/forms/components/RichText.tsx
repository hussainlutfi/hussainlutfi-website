import { sanitizeHtml } from "../model";

/** عرض نص منسّق مُنظّف. */
export default function RichText({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
