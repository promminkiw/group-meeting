import type { NextConfig } from "next";

const securityHeaders = [
  // กัน clickjacking: ห้ามเว็บอื่นฝังหน้าใน iframe (X-Frame-Options สำหรับ browser เก่า)
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // URL /join/<code> เป็นความลับ ไม่ให้ path รั่วไปกับ Referer ข้ามเว็บ
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
