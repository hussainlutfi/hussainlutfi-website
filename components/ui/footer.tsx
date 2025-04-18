import Image from "next/image";
import NameImg from "@/public/images/name-dicoration.png";
import NameImgWhite from "@/public/images/name-dicoration-white.png";

export default function Footer() {
  return (
    <footer className="space-y-12 text-center pb-16">
      {/* Initials logo */}
      <div className="flex justify-center">
      <Image
          className="w-[245px] dark:hidden"
          src={NameImg}
          alt="Header 03"
          priority
      />
      <Image
          className="w-[245px] opacity-75 light:hidden"
          src={NameImgWhite}
          alt="Header 03"
          priority
      />
      </div>
      <div className="space-y-6">
        {/* Social icons */}
        <ul className="inline-flex gap-4">
          <li>
            <a
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/[0.65] shadow-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              href="https://x.com/7ussainLz"
              aria-label="X"
            >
              <svg
                className="fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="14"
              >
                <path d="M16 14h-4.938L7.197 9.108 2.771 14H.316l5.736-6.342L0 0h5.063l3.496 4.476L12.601 0h2.454L9.697 5.932 16 14Zm-4.26-1.422h1.36L4.323 1.347H2.865l8.875 11.231Z" />
              </svg>
            </a>
          </li>
          <li>
            <a
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/[0.65] shadow-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              href="https://github.com/hussainlutfi"
              aria-label="GitHub"
            >
              <svg
                className="fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
              >
                <path d="M7.95 0C3.578 0 0 3.578 0 7.95c0 3.479 2.286 6.46 5.466 7.553.397.1.497-.199.497-.397v-1.392c-2.187.497-2.683-.994-2.683-.994-.398-.894-.895-1.192-.895-1.192-.696-.497.1-.497.1-.497.795.1 1.192.795 1.192.795.696 1.292 1.888.894 2.286.696.1-.497.298-.895.497-1.093-1.79-.2-3.578-.895-3.578-3.976 0-.894.298-1.59.795-2.087-.1-.198-.397-.993.1-2.086 0 0 .695-.2 2.186.795a6.408 6.408 0 0 1 1.987-.299c.696 0 1.392.1 1.988.299 1.49-.994 2.186-.796 2.186-.796.398 1.094.199 1.889.1 2.087.496.597.795 1.292.795 2.087 0 3.081-1.889 3.677-3.677 3.876.298.398.596.895.596 1.59v2.187c0 .198.1.496.596.397C13.714 14.41 16 11.43 16 7.95 15.9 3.578 12.323 0 7.95 0Z" />
              </svg>
            </a>
          </li>
          <li>
            <a
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/[0.65] shadow-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              href="https://www.linkedin.com/in/hussainlutfi/"
              aria-label="LinkedIn"
            >
              <svg
              className="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              >
              <path d="M12.225 0H1.771C.792 0 0 .792 0 1.771v10.454C0 13.208.792 14 1.771 14h10.454C13.208 14 14 13.208 14 12.225V1.771C14 .792 13.208 0 12.225 0ZM4.243 11.914H2.354V5.354h1.889v6.56ZM3.299 4.514a1.094 1.094 0 1 1 0-2.188 1.094 1.094 0 0 1 0 2.188ZM11.646 11.914H9.757V8.457c0-.823-.016-1.883-1.146-1.883-1.146 0-1.32.896-1.32 1.823v3.517H5.402V5.354h1.812v.899h.026c.252-.477.869-1.146 1.788-1.146 1.91 0 2.268 1.257 2.268 2.891v3.916Z" />
              </svg>
            </a>
          </li>
        </ul>
        {/* Copyright notes */}
        <p className="text-sm text-gray-400 dark:text-gray-600">
          &copy; 2025 Hussain Alzayer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
