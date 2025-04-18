import ThemeToggle from "./theme-toggle";
import Image from "next/image";
import UserImg from "@/public/images/graduation-image.jpg";
import HeaderImg01 from "@/public/images/mostqbli-image.jpg";
import HeaderImg03 from "@/public/images/pressentation-image.png";

export default function Header() {
  return (
    <header className="text-center pt-6">
      {/* Dark mode toggle */}
      <ThemeToggle />
      {/* Intro */}
      <div className="flex flex-col items-center mb-10">
        <div className="self-center w-[70px] h-[70px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden mb-2 zmd:mb-3">
          <Image
            className="w-full h-full object-cover inline-flex rounded-full shadow-lg mb-4"
            src={UserImg}
            width={100}
            height={100}
            alt="Hussain Alzayer"
            priority
          />
        </div>

        <div className="mb-5">
          <h1 className="font-inter-tight font-bold text-gray-800 dark:text-gray-100 text-2xl mb-1">
            Hussain Alzayer
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Full-Stack developer from SA 🇸🇦
          </p>
        </div>
        <a
          className="btn-sm w-fit text-gray-200 dark:text-gray-800 bg-linear-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow-xs relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-[45deg,transparent_25%,var(--color-white)_50%,transparent_75%,transparent_100%] before:opacity-20 dark:before:opacity-100 dark:before:bg-linear-[45deg,transparent_25%,var(--color-white)_50%,transparent_75%,transparent_100%] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-1500"
          href="#0"
        >
          Available For Work
        </a>
      </div>
      <div className="group flex justify-center gap-4">
      <div className="w-[245px] h-[160px] rounded-xl overflow-hidden">
        <Image
          className="w-full h-full object-cover transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg even:rotate-2 odd:-rotate-2 even:group-hover:rotate-0 odd:group-hover:rotate-0"
          src={HeaderImg01}
          alt="Header 01"
          priority
        />
      </div>

      <div className="w-[245px] h-[160px] rounded-xl overflow-hidden">
        <Image
          className="w-full h-full object-cover object-[center_40%] transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg even:rotate-2 odd:-rotate-2 even:group-hover:rotate-0 odd:group-hover:rotate-0"
          src={UserImg}
          alt="Header 02"
          priority
        />
      </div>


      <div className="w-[245px] h-[160px] rounded-xl overflow-hidden">
        <Image
          className="w-full h-full object-cover object-[center_55%] transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg even:rotate-2 odd:-rotate-2 even:group-hover:rotate-0 odd:group-hover:rotate-0"
          src={HeaderImg03}
          alt="Header 03"
          priority
        />
      </div>

      </div>
    </header>
  );
}
