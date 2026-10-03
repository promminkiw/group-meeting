import type { ComponentType } from "react";

// ใช้ได้ทั้ง LucideIcon และ SVG component ที่เขียนเอง
export type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
