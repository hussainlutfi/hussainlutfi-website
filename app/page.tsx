"use client";

import { Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  const handleServiceRequest = () => {
    router.push("/service");
  };
  return (
    <div className="md:min-h-[95vh] min-h-[95vh]  flex items-end justify-center bg-white font-[Tajawal] pt-4 md:pt-0">
      <div className="container mx-auto px-4 md:py-8 w-[90%] md:w-[100%]">
        <div
          className="grid grid-cols-1 md:grid-cols-2 md:gap-12 md:items-center pb-10"
          dir="rtl"
        >
          {/* Image Section */}
          <div className="order-2 md:order-2 flex justify-center items-center">
            <div className="relative w-100 h-95 md:w-220 md:h-190 lg:w-250 lg:h-230">
              <Image
                src="/images/unfilldedPersonal.png"
                alt="حسين الزاير"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-3 md:items-start order-1 md:order-1 text-center md:text-right space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#16b1a1] leading-tight">
                حياك الله،
              </h1>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#16b1a1] leading-tight">
                أنا م. حسين الزاير 👋
              </h1>
              <p className="text-lg md:text-xl font-bold text-gray-500 max-w-2xl mx-auto md:mx-0">
                مهندس برمجيات ومصمم واجهات حديثة، أعمل على بناء مواقع والتطبيقات
                مميزة
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button
                onClick={handleServiceRequest}
                sx={{
                  borderRadius: "2rem",
                  backgroundColor: "#16b1a1",
                  color: "white",
                  fontWeight: "bold",
                  padding: "0.75rem 2rem",
                  fontFamily: "Tajawal",
                  "&:hover": {
                    backgroundColor: "#0e8e81",
                  },
                }}
              >
                طلب خدمة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
