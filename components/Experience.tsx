import Solutions from "@/public/images/solutions-logo.jpeg";
import Moueen from "@/public/images/moueen.jpeg";
import Image from "next/image";

const Svg1 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <path
      fill="#9C76EC"
      d="M7.567 7.6c-1.814-.137-3.56-.885-4.874-2.204A7.662 7.662 0 0 1 .5.5c1.868.136 3.56.884 4.874 2.203A7.662 7.662 0 0 1 7.567 7.6Zm.865 0c1.814-.137 3.56-.885 4.873-2.204C14.62 4.076 15.364 2.322 15.5.5c-1.869.136-3.629.884-4.874 2.203A7.662 7.662 0 0 0 8.432 7.6Zm4.873 3.005c-1.313-1.32-3.06-2.068-4.873-2.204a7.662 7.662 0 0 0 2.193 4.896c1.313 1.32 3.06 2.067 4.874 2.204-.136-1.877-.88-3.645-2.194-4.896ZM7.636 8.4c-1.882.136-3.629.884-4.942 2.204C1.38 11.854.622 13.623.5 15.5c1.868-.123 3.56-.884 4.942-2.204a7.662 7.662 0 0 0 2.193-4.896Z"
    />
  </svg>
);

const Svg2 = () => (
  <svg
    className="fill-gray-700 dark:fill-gray-100"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="11"
  >
    <path d="M5.077 0c2.803 0 5.076 2.418 5.076 5.4s-2.273 5.4-5.076 5.4C2.273 10.8 0 8.382 0 5.4S2.273 0 5.077 0Zm8.106.316c1.402 0 2.538 2.276 2.538 5.084 0 2.807-1.136 5.084-2.538 5.084S10.645 8.207 10.645 5.4c0-2.807 1.136-5.084 2.538-5.084ZM18 5.4c0-2.515-.4-4.554-.893-4.554-.492 0-.892 2.04-.892 4.554 0 2.515.4 4.555.892 4.555.494 0 .893-2.04.893-4.555Z" />
  </svg>
);

const Svg3 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16">
    <path
      fill="#00ADEF"
      d="M17.995 3.602c-.075 1.725-1.274 4.124-3.674 7.198-2.474 3.15-4.499 4.799-6.223 4.799-1.05 0-1.95-.975-2.7-2.924-.45-1.8-.974-3.524-1.424-5.324-.525-1.95-1.125-2.924-1.725-2.924-.15 0-.6.3-1.424.825L0 4.202c.9-.75 1.8-1.575 2.624-2.325 1.2-1.05 2.1-1.574 2.7-1.65 1.424-.15 2.249.826 2.549 2.85.375 2.175.6 3.6.75 4.124.375 1.8.825 2.774 1.35 2.774.374 0 .974-.6 1.724-1.8.75-1.199 1.125-2.099 1.2-2.698.075-1.05-.3-1.575-1.2-1.575-.45 0-.9.075-1.35.3.9-2.924 2.55-4.274 5.099-4.199 1.8.075 2.624 1.275 2.55 3.599Z"
    />
  </svg>
);

export default function Experience() {
  const items = [
    {
      title: "Intern Software Developer at Solutions by 42",
      link: "#0",
      icon: <Image
              className="w-full h-full rounded-full object-cover object-[center_55%] transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg even:rotate-2 odd:-rotate-2 even:group-hover:rotate-0 odd:group-hover:rotate-0"
              src={Solutions}
              alt="Header 03"
              priority
            />,
      date: "June 2024 - August 2024",
      location: "Dammam, SA",
      description:
        [
        'Developed Wadaef, a web platform for the Wadaef Job Fair by Asharqia Chamber, enabling event overview and job applications with a fully functional CMS website using Django and Wagtail, leveraging Python technologies.',
        'Designed a responsive and interactive front-end utilizing Django templates.',
        'Built a complete backend application with Nest.js, Prisma, and PostgreSQL, integrated with Kong API Manager.'
        ]
    },
    {
      title: "Full-Stack Software Developer at Moueen",
      link: "#0",
      icon: <Image
              className="w-full h-full rounded-full object-cover object-[center_55%] transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg even:rotate-2 odd:-rotate-2 even:group-hover:rotate-0 odd:group-hover:rotate-0"
              src={Moueen}
              alt="Header 03"
              priority
            />,
      date: "September 2024 - October 2024",
      location: "Dahran, SA",
      description:
        [
          "Developing a fully functional multi-step regestration form",
          "Fixing bugs",
          "working under pressure"
        ],
    },
  ];

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Experience
      </h2>
      <div className="space-y-1">
        {items.map((item, index) => (
          <article
            key={index}
            className="p-5 rounded-xl odd:bg-linear-to-tr odd:from-gray-100 odd:to-gray-50 dark:odd:bg-linear-to-tr dark:odd:from-gray-800 dark:odd:to-gray-800/[0.65]"
          >
            <div className="sm:flex gap-5">
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/[0.65] shadow-xs max-sm:mb-3 sm:mt-5">
                {item.icon}
              </div>
              <div>
                <div className="space-y-1.5 mb-3">
                  <div className="text-[13px] italic text-gray-500/70">
                    {item.date}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    <a
                      className="hover:underline decoration-2 decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
                      href={item.link}
                    >
                      {item.title}
                    </a>
                  </h3>
                  <div className="text-[13px] font-medium text-gray-600dark:text-gray-400">
                    {item.location}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {
                    item.description.length > 1 ?
                    
                    item.description.map((desc, i) => (
                      <li key={i} className="mb-2 last:mb-0 list-disc list-inside">
                        {desc}
                      </li>
                    )):
                    item.description[0]
                    }
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
