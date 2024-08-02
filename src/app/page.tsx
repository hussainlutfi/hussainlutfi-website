"use client";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { Tajawal } from "next/font/google";

const tajawal = Tajawal({
  subsets: ["latin"],
  variable: "--font-tajawal",
  weight: "400",
});

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
    });
  }, []);
  return (
    <main
      className={`flex bg-gray-200 min-h-screen flex-col items-center pt-12 sm:p-0 sm:justify-center ${tajawal.className}`}
    >
      <div className="flex sm:flex-row flex-col items-center  ">
        <img
          data-aos="fade-left"
          src="/assets/profile.jpg"
          alt="About services"
          className="sm:w-[300px] w-[200px] rounded-full drop-shadow-2xl m-5 "
        />
        <div className="sm:text-left text-center" data-aos="fade-right">
          <h1 className="font-extrabold sm:text-4xl text-2xl text-black">
            Hussain Alzayer | حسين الزاير
          </h1>
          <h1 className="font-bold text-lg sm:text-2xl text-black mt-1 sm:mt-3">
            Software Engineer | مهندس برمجيات
          </h1>
          <div className="flex mb-2 mt-5">
            {/* <a
              href="https://www.instagram.com/7ussain16m/"
              className="w-[25px] mx-auto opacity-70 transition ease-in-out delay-150 hover:scale-125"
            >
              <img src="/assets/social/insta.svg" alt="About services" />
            </a> */}
            <a
              href="https://www.linkedin.com/in/hussainlutfi/"
              className="w-[25px] mx-auto opacity-70 transition ease-in-out delay-150 hover:scale-125"
            >
              <img src="/assets/social/linked-in.svg" alt="About services" />
            </a>
            <a
              href="https://x.com/7ussainlz"
              className="w-[25px] mx-auto opacity-70 transition ease-in-out delay-150 hover:scale-125"
            >
              <img src="/assets/social/x.svg" alt="About services" />
            </a>
            <a
              href="https://www.youtube.com/@hussainlutfi6240/videos"
              className="w-[25px] mx-auto opacity-70 transition ease-in-out delay-150 hover:scale-125"
            >
              <img src="/assets/social/youtube.svg" alt="About services" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
