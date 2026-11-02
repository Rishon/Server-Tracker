declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

const TRACKING_COOKIE = /^(_ga|_gid|_gat|_clck|_clsk)/;

export function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  window.clarity?.("event", name);
}

export function revokeAnalytics() {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  window.clarity?.("consent", false);

  const domains = location.hostname
    .split(".")
    .map((_, i, parts) => parts.slice(i).join("."));

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!TRACKING_COOKIE.test(name)) continue;

    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
    }
  }
}
