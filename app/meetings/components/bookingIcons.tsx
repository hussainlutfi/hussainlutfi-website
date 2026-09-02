type P = { className?: string };

export const IconCalendarCheck = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm4.5 8 2 2 4-4"
    />
  </svg>
);

export const IconArrowBack = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4m7-7-7 7 7 7" />
  </svg>
);
