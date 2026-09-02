"use client";

import {
  MONTHS_AR,
  WEEKDAYS_SHORT_AR,
  fmtMonthAr,
  monthBounds,
  weekdayOf,
  type Slot,
} from "../model";
import { IconChevronLeft, IconChevronRight } from "./icons";

export interface DayCell {
  date: string;
  day: number;
  free: number;
  total: number;
  isToday: boolean;
  selectable: boolean;
}

export function buildMonthCells(
  month: string,
  days: Record<string, Slot[]>,
  today: string,
  minDate: string,
  maxDate: string
): { leading: number; cells: DayCell[] } {
  const { first, last } = monthBounds(month);
  const cells: DayCell[] = [];

  for (let d = first; d <= last; d = nextDay(d)) {
    const slots = days[d] ?? [];
    const free = slots.filter((s) => s.state === "free").length;
    cells.push({
      date: d,
      day: Number(d.slice(8, 10)),
      free,
      total: slots.length,
      isToday: d === today,
      selectable: free > 0 && d >= minDate && d <= maxDate,
    });
  }

  return { leading: weekdayOf(first), cells };
}

const nextDay = (d: string): string => {
  const dt = new Date(`${d}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
};

export default function MonthCalendar({
  month,
  cells,
  leading,
  selected,
  onSelect,
  onMonthShift,
  canGoBack,
  canGoForward,
  loading = false,
}: {
  month: string;
  cells: DayCell[];
  leading: number;
  selected: string | null;
  onSelect: (date: string) => void;
  onMonthShift: (n: number) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  loading?: boolean;
}) {
  return (
    <div>
      {/* شريط التنقل بين الأشهر */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onMonthShift(-1)}
          disabled={!canGoBack}
          aria-label="الشهر السابق"
          className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-[#16b1a1] hover:text-[#16b1a1] disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-200"
        >
          <IconChevronRight className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-base font-extrabold text-gray-800">{fmtMonthAr(month)}</p>
          {loading && <p className="text-[11px] font-bold text-[#16b1a1]">جارٍ التحديث…</p>}
        </div>

        <button
          type="button"
          onClick={() => onMonthShift(1)}
          disabled={!canGoForward}
          aria-label="الشهر التالي"
          className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-[#16b1a1] hover:text-[#16b1a1] disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-200"
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* رؤوس أيام الأسبوع */}
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {WEEKDAYS_SHORT_AR.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-bold text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* شبكة الأيام */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: leading }, (_, i) => (
          <div key={`lead-${i}`} />
        ))}

        {cells.map((cell) => {
          const isSelected = cell.date === selected;
          return (
            <button
              key={cell.date}
              type="button"
              disabled={!cell.selectable}
              onClick={() => onSelect(cell.date)}
              aria-label={`${cell.day} ${MONTHS_AR[Number(month.slice(5, 7)) - 1]}${
                cell.selectable ? ` — ${cell.free} فترة متاحة` : " — غير متاح"
              }`}
              className={[
                "relative aspect-square rounded-xl text-sm font-bold transition",
                isSelected
                  ? "bg-[#16b1a1] text-white shadow-md shadow-teal-600/25"
                  : cell.selectable
                    ? "bg-[#f0faf9] text-gray-700 hover:bg-[#dcf3f0] hover:text-[#0e8e81]"
                    : "text-gray-300",
                cell.isToday && !isSelected ? "ring-1 ring-[#16b1a1]/40" : "",
              ].join(" ")}
            >
              <span dir="ltr" className="tabular-nums">
                {cell.day}
              </span>
              {cell.selectable && (
                <span
                  className={`absolute inset-x-0 bottom-1.5 mx-auto block h-1 w-1 rounded-full ${
                    isSelected ? "bg-white/80" : "bg-[#16b1a1]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* دليل الألوان */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#dcf3f0]" /> أيام متاحة
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#16b1a1]" /> اليوم المختار
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200" /> لا توجد فترات
        </span>
      </div>
    </div>
  );
}
