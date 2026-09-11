/**
 * Google Analytics 4 — loads only when VITE_GA_ID is set (e.g. G-XXXXXXXXXX),
 * so local dev and preview builds send nothing.
 *
 * Conversion events sent:
 *   generate_lead  — booking form submitted successfully (fired from App.tsx)
 *   phone_call     — any tel: link tapped (nav, hero, sticky bar, footer…)
 *   email_click    — any mailto: link clicked
 *
 * In GA4: Admin → Events → mark `generate_lead` and `phone_call` as key events,
 * then link the property to Search Console (Admin → Product links) so
 * Search Console verification happens automatically.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

export function track(event: string, params: Record<string, string | number | undefined> = {}) {
  if (typeof window.gtag === "function") window.gtag("event", event, params);
}

export function initAnalytics() {
  if (!GA_ID || typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) { window.dataLayer!.push(args); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);

  // One delegated listener catches every tel:/mailto: link on the page.
  document.addEventListener("click", (e) => {
    const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("tel:"))    track("phone_call",  { number: href.slice(4), location: link.closest("section, nav, footer, .mobile-cta-bar")?.getAttribute("aria-label") ?? "page" });
    if (href.startsWith("mailto:")) track("email_click", { address: href.slice(7) });
  });
}
