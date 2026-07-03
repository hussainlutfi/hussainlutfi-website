/**
 * نموذج بيانات إدارة مصاريف المأتم — مشترك بين الخادم والمتصفح.
 */

export interface Supply {
  id: string;
  name: string;
  price: number | null;
}

export interface Night {
  id: string;
  name: string;
  item: string; // الضيافة
  estimated: number | null; // السعر الافتراضي
  actual: number | null; // السعر الفعلي
  supplies: Supply[]; // مستلزمات إضافية
  note: string;
}

export interface Fund {
  id: string;
  name: string;
  amount: number | null;
  hospitality: boolean; // مخصص للضيافة
  note: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number | null;
  note: string;
}

export interface MattamData {
  title: string;
  season: string;
  currency: string;
  funds: Fund[];
  expenses: ExpenseItem[];
  nights: Night[];
}

export interface MattamDoc {
  data: MattamData;
  rev: number;
  updatedAt: string | null;
}

/* ── حسابات مالية ── */

export interface NightStats {
  suppliesTotal: number;
  total: number; // الفعلي + المستلزمات
  variance: number | null; // الافتراضي − الفعلي (موجب = وفر)
  done: boolean;
  remainingAfter: number; // المتبقي من ميزانية الضيافة بعد هذه الليلة
}

export interface Summary {
  totalFunds: number;
  hospitalityBudget: number;
  hospitalitySpent: number;
  hospitalityRemaining: number;
  expensesTotal: number;
  totalSpent: number;
  totalRemaining: number;
  estimatedTotal: number;
  doneCount: number;
  perNight: Record<string, NightStats>;
}

const n0 = (v: number | null | undefined) => (typeof v === "number" ? v : 0);

export function computeSummary(d: MattamData): Summary {
  const totalFunds = d.funds.reduce((s, f) => s + n0(f.amount), 0);
  const flagged = d.funds.filter((f) => f.hospitality);
  const hospitalityBudget = flagged.length
    ? flagged.reduce((s, f) => s + n0(f.amount), 0)
    : totalFunds;

  const perNight: Record<string, NightStats> = {};
  let running = hospitalityBudget;
  let hospitalitySpent = 0;
  let estimatedTotal = 0;
  let doneCount = 0;

  for (const night of d.nights) {
    const suppliesTotal = night.supplies.reduce((s, x) => s + n0(x.price), 0);
    const total = n0(night.actual) + suppliesTotal;
    const done = night.actual !== null || suppliesTotal > 0;
    if (done) {
      running -= total;
      hospitalitySpent += total;
      doneCount++;
    }
    estimatedTotal += n0(night.estimated);
    perNight[night.id] = {
      suppliesTotal,
      total,
      variance: night.actual !== null ? n0(night.estimated) - night.actual : null,
      done,
      remainingAfter: running,
    };
  }

  const expensesTotal = d.expenses.reduce((s, e) => s + n0(e.amount), 0);
  const totalSpent = hospitalitySpent + expensesTotal;

  return {
    totalFunds,
    hospitalityBudget,
    hospitalitySpent,
    hospitalityRemaining: hospitalityBudget - hospitalitySpent,
    expensesTotal,
    totalSpent,
    totalRemaining: totalFunds - totalSpent,
    estimatedTotal,
    doneCount,
    perNight,
  };
}

/* ── أدوات أرقام ونصوص ── */

export const fmtMoney = (v: number): string =>
  v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٫": ".", "٬": "",
};

export function parseNum(raw: string): number | null {
  const cleaned = raw
    .split("")
    .map((c) => ARABIC_DIGITS[c] ?? c)
    .join("")
    .replace(/[,\s]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const v = Number(cleaned);
  if (!Number.isFinite(v)) return null;
  return Math.round(v * 100) / 100;
}

export const newId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* ── تنظيف البيانات الواردة (الخادم) ── */

const cleanStr = (v: unknown, max = 300): string =>
  typeof v === "string" ? v.slice(0, max) : "";

const cleanNum = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v * 100) / 100;
  return null;
};

const cleanArr = (v: unknown, max: number): unknown[] =>
  Array.isArray(v) ? v.slice(0, max) : [];

export function sanitizeMattamData(input: unknown): MattamData {
  const d = (input ?? {}) as Record<string, unknown>;
  return {
    title: cleanStr(d.title, 120) || "مأتم الوادي",
    season: cleanStr(d.season, 120),
    currency: cleanStr(d.currency, 20) || "ر.س",
    funds: cleanArr(d.funds, 30).map((raw) => {
      const f = (raw ?? {}) as Record<string, unknown>;
      return {
        id: cleanStr(f.id, 40) || newId(),
        name: cleanStr(f.name, 200),
        amount: cleanNum(f.amount),
        hospitality: f.hospitality === true,
        note: cleanStr(f.note),
      };
    }),
    expenses: cleanArr(d.expenses, 60).map((raw) => {
      const e = (raw ?? {}) as Record<string, unknown>;
      return {
        id: cleanStr(e.id, 40) || newId(),
        name: cleanStr(e.name, 200),
        amount: cleanNum(e.amount),
        note: cleanStr(e.note),
      };
    }),
    nights: cleanArr(d.nights, 40).map((raw) => {
      const night = (raw ?? {}) as Record<string, unknown>;
      return {
        id: cleanStr(night.id, 40) || newId(),
        name: cleanStr(night.name, 100),
        item: cleanStr(night.item, 200),
        estimated: cleanNum(night.estimated),
        actual: cleanNum(night.actual),
        supplies: cleanArr(night.supplies, 20).map((s) => {
          const sup = (s ?? {}) as Record<string, unknown>;
          return {
            id: cleanStr(sup.id, 40) || newId(),
            name: cleanStr(sup.name, 200),
            price: cleanNum(sup.price),
          };
        }),
        note: cleanStr(night.note),
      };
    }),
  };
}
