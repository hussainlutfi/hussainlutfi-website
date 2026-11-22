import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  // صفحات المراجعة القديمة انتقلت إلى لوحة الإدارة
  async redirects() {
    return [
      { source: "/cv/review", destination: "/admin/cv", permanent: false },
      { source: "/meetings/admin", destination: "/admin/meetings", permanent: false },
      { source: "/zawaj/results", destination: "/admin/zawaj", permanent: false },
      { source: "/forms", destination: "/admin/forms", permanent: false },
      { source: "/forms/:path*", destination: "/admin/forms/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
