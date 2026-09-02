import type { Metadata } from "next";
import BookingApp from "./components/BookingApp";
import { publicInfo, type PublicInfo } from "./model";
import { getSettings } from "./store";

export const dynamic = "force-dynamic";

async function loadInfo(): Promise<PublicInfo | null> {
  try {
    return publicInfo(await getSettings());
  } catch (err) {
    console.error("meetings SSR settings fetch failed:", err);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const info = await loadInfo();
  return {
    title: `${info?.title ?? "حجز موعد"} — حسين الزاير`,
    description: info?.description || "اختر اليوم والوقت المناسب لحجز موعد.",
  };
}

export default async function MeetingsPage() {
  return <BookingApp initialInfo={await loadInfo()} />;
}
