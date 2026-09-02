type P = { className?: string };

const Svg = ({ className = "h-5 w-5", d, extra }: P & { d: string; extra?: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    {extra}
  </svg>
);

export const IconCalendar = (p: P) => (
  <Svg {...p} d="M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
);

export const IconClock = (p: P) => (
  <Svg {...p} d="M12 7v5l3 2" extra={<circle cx="12" cy="12" r="9" strokeLinecap="round" />} />
);

export const IconCheck = (p: P) => <Svg {...p} d="m5 13 4 4L19 7" />;

export const IconCheckCircle = (p: P) => (
  <Svg {...p} d="m8.5 12.5 2.5 2.5 4.5-5" extra={<circle cx="12" cy="12" r="9" />} />
);

export const IconUser = (p: P) => (
  <Svg {...p} d="M4.5 20a7.5 7.5 0 0 1 15 0" extra={<circle cx="12" cy="8" r="3.75" />} />
);

export const IconLink = (p: P) => (
  <Svg {...p} d="M10 13a4 4 0 0 0 5.66 0l2.5-2.5a4 4 0 1 0-5.66-5.66L11.5 6M14 11a4 4 0 0 0-5.66 0l-2.5 2.5a4 4 0 1 0 5.66 5.66L12.5 18" />
);

export const IconTrash = (p: P) => (
  <Svg {...p} d="M4 7h16M10 11v6m4-6v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
);

export const IconPlus = (p: P) => <Svg {...p} d="M12 5v14M5 12h14" />;

export const IconChevronRight = (p: P) => <Svg {...p} d="m10 6 6 6-6 6" />;

export const IconChevronLeft = (p: P) => <Svg {...p} d="m14 6-6 6 6 6" />;

export const IconRefresh = (p: P) => (
  <Svg {...p} d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4m-4 5a8 8 0 0 0 14.9 3M20 20v-4h-4" />
);

export const IconClose = (p: P) => <Svg {...p} d="M6 6l12 12M18 6 6 18" />;

export const IconCopy = (p: P) => (
  <Svg {...p} d="M9 9V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-4M5 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
);

export const IconDownload = (p: P) => <Svg {...p} d="M12 4v11m0 0 4-4m-4 4-4-4M4 19h16" />;

export const IconBan = (p: P) => (
  <Svg {...p} d="m6 6 12 12" extra={<circle cx="12" cy="12" r="9" />} />
);

export const IconSettings = (p: P) => (
  <Svg
    {...p}
    d="M11 3.5h2l.4 2.1a6.6 6.6 0 0 1 1.6.9l2-.8 1 1.7-1.6 1.4a6.6 6.6 0 0 1 0 1.8l1.6 1.4-1 1.7-2-.8a6.6 6.6 0 0 1-1.6.9l-.4 2.1h-2l-.4-2.1a6.6 6.6 0 0 1-1.6-.9l-2 .8-1-1.7 1.6-1.4a6.6 6.6 0 0 1 0-1.8L6 7.4l1-1.7 2 .8a6.6 6.6 0 0 1 1.6-.9Z"
    extra={<circle cx="12" cy="11" r="2.4" />}
  />
);

export const IconList = (p: P) => (
  <Svg {...p} d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
);

export const IconLock = (p: P) => (
  <Svg {...p} d="M8 10V7a4 4 0 1 1 8 0v3M5.5 10h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
);

export const IconSearch = (p: P) => (
  <Svg {...p} d="m20 20-3.5-3.5" extra={<circle cx="11" cy="11" r="6.5" />} />
);

export const IconPhone = (p: P) => (
  <Svg {...p} d="M5 4h3.5l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L15 13l4 1.5V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 7.2 2 2 0 0 1 6 5Z" />
);

export const IconNote = (p: P) => (
  <Svg {...p} d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8m-5-5 5 5m-5-5v5h5M8 13h7M8 17h5" />
);

export const IconSpark = (p: P) => (
  <Svg {...p} d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9L4.5 10.8 10.2 9 12 3.5Z" />
);
