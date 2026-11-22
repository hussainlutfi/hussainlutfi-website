import type { Metadata } from "next";
import { listCvRequests } from "@/app/cv/store";
import type { CvRequestDoc } from "@/app/cv/model";
import ReviewList from "@/app/cv/review/ReviewList";
import { requireAdminPage } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مراجعة طلبات السير الذاتية",
  robots: { index: false, follow: false },
};

export default async function CvReviewPage() {
  await requireAdminPage();
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
