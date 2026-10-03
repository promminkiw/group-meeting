const ALLOWED_PROTOCOLS = ["http", "https"];
const HOST_PATTERN = /^[A-Za-z0-9.\-:[\]]+$/;

export type OriginSources = {
  siteUrl?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  host?: string | null;
};

// header จาก proxy อาจเป็นหลายค่าคั่นด้วย comma ใช้ค่าแรกสุด
function firstValue(value: string | null | undefined): string {
  return (value ?? "").split(",")[0].trim();
}

function originFromSiteUrl(siteUrl: string | null | undefined): string | null {
  const trimmed = (siteUrl ?? "").trim();
  if (trimmed === "") return null;
  try {
    const url = new URL(trimmed);
    const protocol = url.protocol.replace(/:$/, "");
    return ALLOWED_PROTOCOLS.includes(protocol) ? url.origin : null;
  } catch {
    return null;
  }
}

// SITE_URL มาก่อน เพราะ header ปลอมได้; ไม่มีค่อยอ่านจาก header
export function resolveOrigin(sources: OriginSources): string | null {
  const configured = originFromSiteUrl(sources.siteUrl);
  if (configured) return configured;

  const host = firstValue(sources.forwardedHost) || firstValue(sources.host);
  if (!host || !HOST_PATTERN.test(host)) return null;

  const protocol = firstValue(sources.forwardedProto).toLowerCase() || "http";
  if (!ALLOWED_PROTOCOLS.includes(protocol)) return null;

  return `${protocol}://${host}`;
}
