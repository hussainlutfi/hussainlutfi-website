import type { Metadata } from "next";
import { listCvRequests } from "../store";
import type { CvRequestDoc } from "../model";
import ReviewList from "./ReviewList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مراجعة طلبات السير الذاتية",
  robots: { index: false, follow: false },
};

export default async function CvReviewPage() {
  let requests: CvRequestDoc[] = [];
  let failed = false;
  try {
    requests = await listCvRequests();
  } catch (err) {
    console.error("cv review fetch failed:", err);
    failed = true;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ReviewList requests={requests} failed={failed} />
    </div>
  );
}
