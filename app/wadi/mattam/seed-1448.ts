import type { MattamData } from "./model";

/** البيانات الابتدائية لموسم ١٤٤٨هـ — منقولة من ملف Excel «مأتم الوادي». */
export const SEED_SLUG_1448 = "wadi-mattam-1448";

export const SEED_DATA_1448: MattamData = {
  title: "مأتم الوادي",
  season: "موسم محرم ١٤٤٨هـ",
  currency: "ر.س",
  funds: [
    { id: "f-cash", name: "مبلغ الكاش", amount: 950, hospitality: false, note: "" },
    { id: "f-stc", name: "مبلغ STC (المخصص للضيافة)", amount: 2826, hospitality: true, note: "" },
  ],
  expenses: [{ id: "e-khatib", name: "بركة الخطيب", amount: 1500, note: "" }],
  nights: [
    { id: "n1", name: "الليلة الأولى", item: "خمسين سندويش فلافل", estimated: 214, actual: 218.5, supplies: [], note: "" },
    {
      id: "n2",
      name: "الليلة الثانية",
      item: "مكرونية",
      estimated: 200,
      actual: 115,
      supplies: [{ id: "n2s1", name: "بلاستيكات", price: 8.5 }],
      note: "",
    },
    { id: "n3", name: "الليلة الثالثة", item: "معجنات", estimated: 200, actual: null, supplies: [], note: "" },
    { id: "n4", name: "الليلة الرابعة", item: "قيمة لحم", estimated: 250, actual: null, supplies: [], note: "" },
    { id: "n5", name: "الليلة الخامسة", item: "فطور مسائي", estimated: 200, actual: null, supplies: [], note: "" },
    { id: "n6", name: "الليلة السادسة", item: "فاهيتا", estimated: 250, actual: null, supplies: [], note: "" },
    { id: "n7", name: "الليلة السابعة", item: "رز ودجاج", estimated: 350, actual: null, supplies: [], note: "" },
  ],
};
