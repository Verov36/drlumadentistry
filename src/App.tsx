import { useState, useEffect, useCallback } from "react";
import { useReviews } from "./hooks/useReviews";
import { track } from "./analytics";
import { useScrollMotion, Cursor } from "./motion";
import type { Review } from "./hooks/useReviews";
import logoImg from "./imports/logo.jpeg";
import adaImg from "./imports/ada.png";
import vdaImg from "./imports/vda.jpeg";
import drLumaImg from "./imports/Dr._Luma.jpeg";
import porcelainCrownImg from "./imports/pic-porcelain-crown-before-after.jpg";
import implantRestorationImg from "./imports/implants2-2-scaled.jpg";
import smileMakeoverImg from "./imports/smile-makeover-before-after.jpg";
import crownTryInImg from "./imports/crown-try-in.jpg";
import frontCrownsImg from "./imports/front-crowns-final.jpg";
import invisalignProviderImg from "./imports/invisalign-provider.png";
import careCreditImg from "./imports/carecredit.png";
import philipsZoomImg from "./imports/philips-zoom.jpg";
import iteroWandImg from "./imports/itero-lumina-wand.jpg";
import invisalignSmileImg from "./imports/invisalign-smile.jpg";
import viveraImg from "./imports/vivera-provider.jpg";
import privacyPdf from "./imports/Notice_of_Privacy_Practices_2026.pdf?url";
import grievanceDocx from "./imports/1557_notice_and_grievance_policy.docx?url";

/* ── Constants ────────────────────────────────────────────── */
const PHONE   = "757-430-2600";
const FAX     = "757-460-2600";
const EMAIL   = "dora@drluma.com";
const ADDRESS = "1244 Perimeter Pkwy, Suite 444, Virginia Beach, VA 23454";
/* Google Business Profile — "Dr. Evelyn E. Luma, DDS, PLC" */
const GOOGLE_PLACE_ID  = "ChIJf_6--JTBuokRzP4vNAnSwwk";
const GOOGLE_LISTING_URL = `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`;
const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
/* Shown until the live reviews API is configured; the API overrides these. */
const GOOGLE_RATING_FALLBACK = 4.9;
const GOOGLE_REVIEW_COUNT_FALLBACK = 543;
/* Add the practice's Facebook Page URL to show the Facebook review button. */
const FACEBOOK_PAGE_URL: string = "";

const MAPS_URL = GOOGLE_LISTING_URL;
const MAPS_EMBED_URL = "https://www.google.com/maps?q=" + encodeURIComponent(ADDRESS) + "&z=15&output=embed";

/*
 * HERO IMAGE — temporary stock photo. To use a real practice photo:
 *   1. Save it as src/imports/hero.jpg (landscape, ~1600px wide, under 250 KB)
 *   2. Add:  import heroImg from "./imports/hero.jpg";   and set HERO_IMAGE = heroImg
 *   3. Update the <link rel="preload"> href in index.html to match (or remove it)
 */
const HERO_IMAGE = "https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?w=1400&h=900&fit=crop&auto=format&crop=top";

/* ── Data ─────────────────────────────────────────────────── */
const navLinks = [
  { label: "Services",   href: "#services"    },
  { label: "About",      href: "#about"        },
  { label: "Our Team",   href: "#team"         },
  { label: "Gallery",    href: "#gallery"      },
  { label: "Reviews",    href: "#reviews"      },
  { label: "Disclosure", href: "#disclosure"   },
  { label: "Contact",    href: "#book"         },
];

const stats = [
  { value: "4.9★",      label: "Google Rating"         },
  { value: "25",        label: "Years of Experience"   },
  { value: "2,000+",    label: "Smiles Transformed"    },
  { value: "Same-Day",  label: "Emergency Care"         },
];

const pillars = [
  { title: "High Standards",       desc: "Comprehensive treatment planning and emergency care — restoring your smile using conservative, state-of-the-art procedures." },
  { title: "Education & Prevention", desc: "Dental health care, not just disease care. Every visit includes exams, cancer screenings, and home hygiene guidance." },
  { title: "Uncompromising Safety", desc: "All sterilization and infection control protocols follow current ADA, OSHA, and CDC standards — every visit, every time." },
  { title: "Continuing Expertise",  desc: "Our full team attends dental lectures, conventions, and continuing education to stay at the forefront of modern dentistry." },
];

const cosmeticServices = [
  { emoji: "⬡", title: "Dental Implant Restoration", desc: "Custom crowns, bridges, and implant-supported dentures secured to your dental implants — restoring full chewing function and a natural, permanent-looking smile after tooth loss." },
  { emoji: "◇", title: "Composite Fillings",     desc: "Tooth-colored fillings matched to your teeth. Used for decay, chips, cracks, or closing gaps — completed in a single appointment." },
  { emoji: "◉", title: "Porcelain Crowns",       desc: "Natural-looking crowns that restore strength and appearance to damaged or weakened teeth, crafted to blend seamlessly." },
  { emoji: "▲", title: "Porcelain Bridges",      desc: "Fixed restorations that fill gaps from missing teeth, anchored to neighboring teeth for a stable, natural-looking result." },
  { emoji: "✦", title: "BruxZir® Crowns",        desc: "Solid zirconia crowns for grinders — virtually unbreakable, with natural translucency that mimics real tooth structure." },
  { emoji: "◈", title: "Empress® Restorations",  desc: "All-ceramic restorations with exceptional esthetics and strength for front and back teeth with lifelike translucency." },
  { emoji: "⊕", title: "Inlays & Onlays",        desc: "Conservative alternatives to full crowns — custom-fabricated to repair moderate decay while preserving natural tooth structure." },
  { emoji: "◎", title: "Dentures & Partials",    desc: "Full and partial dentures custom-fitted to restore your smile, function, and confidence after tooth loss." },
];

const preventiveServices = [
  { emoji: "✦", title: "Invisalign®",             desc: "Straighten teeth discreetly with clear aligners. No wires, no brackets — gradual, comfortable alignment on your schedule." },
  { emoji: "◉", title: "Philips Zoom! Whitening", desc: "In-office whitening up to 8 shades brighter in a single visit. Safe, fast, and professionally monitored." },
  { emoji: "◈", title: "Comprehensive Exams",     desc: "Full diagnostic x-rays, oral cancer screening (face, neck, lips, tongue, throat, tissues, gums), gum eval, and decay check." },
  { emoji: "⬡", title: "Professional Cleanings",  desc: "Performed by our Registered Dental Hygienists — calculus and tartar removal, plaque removal, and professional polishing." },
  { emoji: "◇", title: "Digital X-Rays",          desc: "Low-radiation digital imaging with instant results. Full-mouth series for new patients; annual or biannual bite-wings detect decay, bone loss, abscesses, and more." },
  { emoji: "▲", title: "Fluoride Treatments",     desc: "Dr. Luma recommends fluoride for all of her patients, not just children. Topical and systemic treatments strengthen enamel and guard against decay — especially for exposed roots or high decay risk." },
  { emoji: "⊕", title: "Periodontal Disease Care",desc: "Diagnosis, treatment, and long-term maintenance for gum disease. We address the mouth-body connection: diabetes, heart disease, and more." },
  { emoji: "◎", title: "Orthodontics",            desc: "Invisalign®, Vivera™ retainers, and malocclusion correction. Straight teeth are healthier teeth for patients of all ages." },
];

/*
 * TEAM PHOTOS — add a `photo` to any member to replace the initials monogram:
 *   import doraImg from "./imports/team/dora-scott.jpg";
 *   { name: "Dora Scott", photo: doraImg, ... }
 * Square crops (~600x600, under 120 KB) look best.
 */
type TeamMember = { name: string; role: string; bio: string; photo?: string };
const team: TeamMember[] = [
  { name: "Dora Scott",        role: "Office Manager",                          bio: "Dora keeps Atlantic Dental Care running smoothly for every patient and provider. With decades of dental office experience, she ensures your visit is seamless from the moment you call to the moment you leave." },
  { name: "Michelle Boone",    role: "Front Office Coordinator",                bio: "Michelle is often the first friendly voice you hear when you contact our office. She handles patient communications, insurance questions, and helps make every experience welcoming and stress-free." },
  { name: "Amanda McBride",    role: "Front Office Agent & Scheduling Coordinator", bio: "Amanda specializes in keeping the schedule organized so patients are seen on time and get the appointments they need. She makes booking easy and works hard to accommodate your busy life." },
  { name: "Christine Nguyen",  role: "Dental Hygienist",                        bio: "Christine brings precision and warmth to every hygiene appointment. Her thorough cleanings and patient education help patients build lasting habits for a healthier smile." },
  { name: "Laurie Harwood",    role: "Dental Hygienist",                        bio: "Laurie is dedicated to making cleanings comfortable and informative. She takes time with every patient to ensure their gum health and overall oral wellness are on the right track." },
  { name: "Sharmie Woodall",   role: "Dental Assistant",                        bio: "Sharmie's chairside skill and calm presence make a real difference — especially for patients who feel anxious. She supports Dr. Luma with expertise and genuine care for every patient." },
  { name: "Fabie Orndorff",    role: "Dental Assistant · Se habla español",    bio: "Fabie brings energy and attention to detail to every procedure she assists with. Fluent in Spanish, she is our go-to for Spanish-speaking patients, and her reassuring nature keeps every visit moving smoothly." },
  { name: "Julia Alpert",      role: "Dental Assistant",                        bio: "Julia is committed to delivering a comfortable experience at every appointment. Her attentiveness and clinical support help Dr. Luma deliver the high-quality care our patients expect." },
];

/*
 * TREATMENT GALLERY
 * Stock photos are Unsplash-licensed (free for commercial use, hotlinking is how
 * Unsplash prefers to be used). Photographer credit kept here as a courtesy.
 * To replace one with a real case photo: import the file, set `img` to it, and
 * set `patient: true` so it earns the "Actual patient result" badge — only do
 * that with signed photo consent on file.
 */
const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=900&q=75`;
type GalleryItem = { label: string; img: string; alt: string; patient?: boolean; contain?: boolean };
const galleryItems: GalleryItem[] = [
  { label: "Smile Makeover — Upper Front Crowns", img: smileMakeoverImg, patient: true, alt: "Before and after: discolored, uneven upper front teeth restored with porcelain crowns — actual Atlantic Dental Care patient" },
  { label: "Dental Implant Restoration", img: implantRestorationImg, contain: true, alt: "Dental implant restoration — implant posts before, and the finished implant-supported crowns after" },
  { label: "Porcelain Crowns",    img: porcelainCrownImg, patient: true, alt: "Porcelain crown before and after — actual Atlantic Dental Care patient" },
  { label: "Porcelain Crown Try-In", img: crownTryInImg, patient: true, alt: "A new porcelain crown being tried in on a prepared upper front tooth — actual Atlantic Dental Care patient" },
  { label: "Front Teeth Crowns",     img: frontCrownsImg, patient: true, alt: "Finished porcelain crowns on the upper front teeth, side view — actual Atlantic Dental Care patient" },
  { label: "Composite Fillings",  img: unsplash("photo-1766338390573-ec092d69cdcb"), alt: "Dentist placing a filling with instruments and a curing light" },      // Roby Allario
  { label: "Dentures & Partials", img: unsplash("photo-1525893277997-207c04d47d65"), alt: "Dental technician holding a finished full denture" },                  // Matthew Poetker
  { label: "Invisalign®",         img: unsplash("photo-1609840114035-3c981b782dfe"), alt: "Person placing a clear Invisalign-style aligner over their teeth" },   // Diana Polekhina
  { label: "Zoom! Whitening",     img: unsplash("photo-1684607632910-5afbe351a2cd"), alt: "Patient wearing protective glasses during an in-office whitening treatment" }, // Shedrack Salami
];

/* Source badge component */
function SourceBadge({ source }: { source: "google" | "facebook" }) {
  if (source === "google") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Google G */}
        <svg width="16" height="16" viewBox="0 0 48 48" aria-label="Google review">
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.96 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#5a6a5e", letterSpacing: "0.06em", textTransform: "uppercase" }}>Google</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {/* Facebook F */}
      <svg width="16" height="16" viewBox="0 0 24 24" aria-label="Facebook review">
        <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#5a6a5e", letterSpacing: "0.06em", textTransform: "uppercase" }}>Facebook</span>
    </div>
  );
}

/* ── Trust badge shell ───────────────────────────────────── */
function TrustBadge({ accent, bg, border, children }: {
  accent: string; bg: string; border: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      border: `1px solid ${border}`, borderRadius: 6,
      padding: "0.625rem 1rem", background: bg, gap: 5, minWidth: 100,
    }}>
      {children}
    </div>
  );
}

/* Invisalign Provider — official logo supplied by the practice */
function InvisalignBadge({ dark = false }: { dark?: boolean }) {
  return (
    <TrustBadge accent="#009CDE" bg={dark ? "#fff" : "#f4f9fc"} border={dark ? "rgba(255,255,255,0.2)" : "#cfe3ee"}>
      <img src={invisalignProviderImg} alt="Invisalign Provider" width={992} height={257} loading="lazy" decoding="async" style={{ height: 30, width: "auto", display: "block" }} />
    </TrustBadge>
  );
}

/* CareCredit — official logo */
function CareCredit({ dark = false }: { dark?: boolean }) {
  return (
    <TrustBadge accent="#00704a" bg={dark ? "#fff" : "#f2faf6"} border={dark ? "rgba(255,255,255,0.2)" : "#c6e6d6"}>
      <img src={careCreditImg} alt="CareCredit" width={710} height={97} loading="lazy" decoding="async" style={{ height: 22, width: "auto", display: "block" }} />
      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#4d8a6c", lineHeight: 1 }}>Accepted</span>
    </TrustBadge>
  );
}

/* Philips Zoom! — official logo */
function PhilipsZoom({ dark = false }: { dark?: boolean }) {
  return (
    <TrustBadge accent="#0045A0" bg={dark ? "#fff" : "#f0f4ff"} border={dark ? "rgba(255,255,255,0.2)" : "#b8caef"}>
      <img src={philipsZoomImg} alt="Philips Zoom! whitening" width={400} height={400} loading="lazy" decoding="async" style={{ height: 40, width: "auto", display: "block", mixBlendMode: "multiply" }} />
      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5070a8", lineHeight: 1 }}>Certified</span>
    </TrustBadge>
  );
}

/* ADA Member */

type LangOption = { label: string; code: string };
const languages: LangOption[] = [
  { label: "English",    code: "en" },
  { label: "Spanish",    code: "es" },
  { label: "Korean",     code: "ko" },
  { label: "Vietnamese", code: "vi" },
  { label: "Chinese",    code: "zh-CN" },
  { label: "Arabic",     code: "ar" },
  { label: "Tagalog",    code: "tl" },
  { label: "Farsi",      code: "fa" },
  { label: "Amharic",    code: "am" },
  { label: "Urdu",       code: "ur" },
  { label: "French",     code: "fr" },
  { label: "Russian",    code: "ru" },
  { label: "Hindi",      code: "hi" },
  { label: "German",     code: "de" },
  { label: "Bengali",    code: "bn" },
  { label: "Igbo",       code: "ig" },
  { label: "Yoruba",     code: "yo" },
];

function switchLanguage(code: string) {
  if (code === "en") {
    const exp = "expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = `googtrans=; ${exp}`;
    document.cookie = `googtrans=; domain=${window.location.hostname}; ${exp}`;
    window.scrollTo({ top: 0, behavior: "instant" });
    window.location.reload();
    return;
  }

  const trySwitch = () => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
      window.scrollTo({ top: 0, behavior: "instant" });
      return true;
    }
    return false;
  };

  if (!trySwitch()) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (trySwitch() || attempts >= 20) clearInterval(interval);
    }, 100);
  }
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join("");

/* Stagger delay for the hero's load-in animations (see .reveal-item / .fade-up in index.css) */
const motionDelay = (seconds: number) => ({ "--d": `${seconds}s` } as React.CSSProperties);

/* Section headings: each line rises out of its own clipping mask when scrolled into view */
function SplitLines({ lines, base = 0 }: { lines: React.ReactNode[]; base?: number }) {
  return (
    <span className="rv lines">
      {lines.map((line, i) => (
        <span key={i} className="ln"><span className="ln-i" style={motionDelay(base + i * 0.12)}>{line}</span></span>
      ))}
    </span>
  );
}

/* Hero stat that counts up from zero on load (only when the value starts with a number) */
function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const m = value.match(/^([\d,]*\.?\d+)(.*)$/);
  const target = m ? parseFloat(m[1]!.replace(/,/g, "")) : NaN;
  const suffix = m ? m[2]! : "";
  const decimals = m && m[1]!.includes(".") ? 1 : 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (Number.isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(target); return; }
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / 1400));
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay]);
  const shown = Number.isNaN(target)
    ? value
    : n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  return (
    <div>
      <p className="serif" style={{ color: "#fff", fontSize: "clamp(20px,3vw,28px)" }}>{shown}</p>
      <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>{label}</p>
    </div>
  );
}

const tickerItems = [
  "Dental Implant Restoration", "Invisalign® Provider", "Philips Zoom! Whitening", "Laser Dentistry",
  "Digital X-Rays", "iTero™ 3D Scanning", "Same-Day Emergency Care", "Se habla español",
  "CareCredit Accepted", "25 Years of Experience",
];

/* Visible FAQ — keep in sync with the FAQPage JSON-LD in index.html */
const faqs = [
  { q: "Is Dr. Luma accepting new patients in Virginia Beach?",
    a: "Yes! Atlantic Dental Care welcomes new patients. Call 757-430-2600 or book online. Same-day appointments are often available." },
  { q: "What dental services does Atlantic Dental Care offer?",
    a: "We offer dental implant restoration, Invisalign, Philips Zoom whitening, porcelain crowns and bridges, composite fillings, dentures, BruxZir crowns, inlays and onlays, cleanings, exams, fluoride treatments, periodontal disease treatment, and more." },
  { q: "Does Dr. Luma recommend fluoride for adults?",
    a: "Yes. Dr. Luma recommends fluoride for all of her patients, not just children. Professional fluoride strengthens enamel and helps prevent decay, especially for patients with exposed roots, dry mouth, or a history of cavities." },
  { q: "What technology does Atlantic Dental Care use?",
    a: "Our Virginia Beach office uses laser treatments, digital x-rays, and intraoral cameras, so you can see exactly what our team sees and understand every recommendation." },
  { q: "Does Dr. Luma accept CareCredit?",
    a: "Yes, Atlantic Dental Care accepts CareCredit financing, making it easy to get the care you need without delay." },
  { q: "What are the office hours?",
    a: "The office is open Monday through Thursday, 8:30 AM to 5:30 PM. The office is closed Friday through Sunday." },
  { q: "Where is Atlantic Dental Care located?",
    a: "We are located at 1244 Perimeter Pkwy, Suite 444, Virginia Beach, VA 23454." },
];

const technology = [
  { emoji: "✧", title: "Laser Treatments",  desc: "Precise, gentle laser dentistry for soft-tissue procedures — less bleeding, less discomfort, and faster healing than traditional methods." },
  { emoji: "◫", title: "Digital X-Rays",    desc: "Instant, high-resolution images with a fraction of the radiation of film x-rays — easy to enlarge and review together chairside." },
  { emoji: "◉", title: "Intraoral Cameras", desc: "A tiny camera shows you exactly what our team sees inside your mouth, on screen, in real time — so you understand every recommendation." },
  { emoji: "◈", title: "iTero™ Lumina 3D Scanner", desc: "Digital impressions in minutes with a small wand instead of goopy trays. The scan builds a 3D model of your teeth and drives your Invisalign® plan." },
];

const steps = [
  { n: "01", title: "Book Online",  desc: "Fill out our quick form — takes 90 seconds." },
  { n: "02", title: "We Confirm",   desc: "Our team calls within one business day."       },
  { n: "03", title: "Come In",      desc: "Relax. We handle everything from there."       },
];

/* ── Component ────────────────────────────────────────────── */
export default function App() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activeTab,  setActiveTab]  = useState<"cosmetic"|"preventive">("cosmetic");
  const [lightbox,   setLightbox]   = useState<GalleryItem | null>(null);

  useScrollMotion();

  // Close the gallery lightbox on Escape
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({ name:"", phone:"", email:"", service:"", date:"", note:"" });

  const { reviews: displayReviews, loading: reviewsLoading, configured, summary } = useReviews(6);
  const googleRating = summary?.rating ?? GOOGLE_RATING_FALLBACK;
  const googleReviewCount = summary?.count ?? GOOGLE_REVIEW_COUNT_FALLBACK;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hero parallax: the photo drifts slower than the page while the copy drifts
  // ahead and fades, so the frame feels like it has depth as you scroll away.
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const height = hero.offsetHeight || 1;
      const y = Math.min(window.scrollY, height);
      hero.style.setProperty("--hero-y", `${y}px`);
      hero.style.setProperty("--hero-fade", String(Math.max(0, 1 - y / (height * 0.7))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Google Translate pushes <body> down (top: 40px) while its bar is showing.
  // Keep the fixed nav below the bar instead of underneath it.
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".nav-root");
    if (!nav) return;
    const sync = () => {
      const offset = parseFloat(getComputedStyle(document.body).top) || 0;
      nav.style.top = offset > 0 ? `${offset}px` : "";
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { childList: true, attributes: true, attributeFilter: ["style", "class"] });
    mo.observe(document.head, { childList: true });
    sync();
    return () => mo.disconnect();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: "" /* honeypot */ }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setSubmitted(true);
      track("generate_lead", { method: "booking_form", service: form.service });
    } catch (err) {
      setSubmitError(String(err instanceof Error ? err.message : err));
    } finally {
      setSubmitting(false);
    }
  }, [form, submitting]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "var(--ink)", overflowX: "hidden" }}>
      <Cursor />

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.label} onClick={() => setLightbox(null)} data-lenis-prevent>
          <img src={lightbox.img} alt={lightbox.alt} onClick={e => e.stopPropagation()} />
          <button type="button" className="lightbox-close" aria-label="Close" onClick={() => setLightbox(null)}>✕</button>
          <p className="lightbox-caption">
            {lightbox.label}{lightbox.patient ? " · Actual patient result" : " · Illustrative photo"}
          </p>
        </div>
      )}

      {/* ══ NAV ══════════════════════════════════════════════ */}
      <nav
        className={`nav-root${scrolled ? " scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          {/* Brand logo */}
          <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <div style={{
              background: scrolled ? "transparent" : "rgba(255,255,255,0.92)",
              borderRadius: 8,
              padding: scrolled ? "0" : "5px 14px",
              display: "inline-flex",
              alignItems: "center",
              backdropFilter: scrolled ? "none" : "blur(8px)",
              WebkitBackdropFilter: scrolled ? "none" : "blur(8px)",
              transition: "background 0.35s, padding 0.35s, backdrop-filter 0.35s",
            }}>
              <img
                src={logoImg}
                alt="Atlantic Dental Care — Dr. Evelyn E. Luma, DDS"
                width={474} height={84}
                style={{ height: 62, width: "auto", display: "block", objectFit: "contain", transition: "height 0.35s" }}
              />
            </div>
          </a>

          {/* Desktop links */}
          <div style={{ alignItems: "center", gap: "1.25rem" }} className="hidden lg:flex">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} style={{ color: scrolled ? "var(--mist)" : "rgba(255,255,255,0.72)", fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = scrolled ? "var(--ink)" : "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = scrolled ? "var(--mist)" : "rgba(255,255,255,0.72)")}
              >{l.label}</a>
            ))}

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: scrolled ? "var(--line)" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=100063797662154"
              target="_blank" rel="noopener noreferrer"
              aria-label="Atlantic Dental Care on Facebook"
              title="Visit us on Facebook"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: scrolled ? "#f0f4ff" : "rgba(255,255,255,0.12)", transition: "background 0.2s", flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1877F2")}
              onMouseLeave={e => (e.currentTarget.style.background = scrolled ? "#f0f4ff" : "rgba(255,255,255,0.12)")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill={scrolled ? "#1877F2" : "#fff"} d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>

            {/* Google Business */}
            <a
              href="https://www.google.com/maps/search/Atlantic+Dental+Care+1244+Perimeter+Pkwy+Virginia+Beach+VA"
              target="_blank" rel="noopener noreferrer"
              aria-label="Atlantic Dental Care on Google"
              title="Find us on Google"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: scrolled ? "#f5f5f5" : "rgba(255,255,255,0.12)", transition: "background 0.2s", flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.background = scrolled ? "#f5f5f5" : "rgba(255,255,255,0.12)")}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.96 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </a>

            <a href="#book" className="btn-green" style={{ fontSize: 13, padding: "0.6rem 1.25rem" }}>Book Now</a>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{ background: "none", border: "none", fontSize: 22, color: scrolled ? "var(--ink)" : "#fff", cursor: "pointer", padding: "0.25rem", lineHeight: 1 }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={closeMenu} style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, textDecoration: "none", fontWeight: 500 }}>
              {l.label}
            </a>
          ))}
          <a href={`tel:${PHONE}`} style={{ color: "var(--green-muted)", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>{PHONE}</a>
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
            <a href="https://www.facebook.com/profile.php?id=100063797662154" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              Facebook
            </a>
            <a href="https://www.google.com/maps/search/Atlantic+Dental+Care+1244+Perimeter+Pkwy+Virginia+Beach+VA" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.96 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </a>
          </div>
          <a href="#book" onClick={closeMenu} className="btn-green" style={{ marginTop: "0.5rem" }}>Book an Appointment</a>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════ */}
      <section className="hero" aria-label="Welcome to Atlantic Dental Care">
        {/* Media sits in its own layer so the scroll parallax and the load-in zoom don't fight over `transform` */}
        <div className="hero-media" aria-hidden="true">
          <img
            src={HERO_IMAGE}
            alt=""
            className="hero-img"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <div style={{ maxWidth: 640 }}>
            <div className="badge-strip fade-up" style={motionDelay(0.05)}>
              <span style={{ width: 6, height: 6, background: "#6fcf97", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                New Patients Welcome · Same-Day Appointments Available
              </span>
            </div>

            {/* Each line rises out of its own clipping mask, one after the other */}
            <h1 className="serif" style={{ fontSize: "clamp(42px,7.5vw,88px)", color: "#fff", lineHeight: 1.02, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
              <span className="reveal"><span className="reveal-item" style={motionDelay(0.2)}>Your smile is</span></span>
              <span className="reveal"><em className="reveal-item" style={{ ...motionDelay(0.35), color: "var(--green-muted)" }}>our top priority.</em></span>
            </h1>

            <p className="fade-up" style={{ ...motionDelay(0.55), color: "rgba(255,255,255,0.66)", fontSize: "clamp(15px,1.8vw,18px)", lineHeight: 1.65, fontWeight: 300, marginBottom: "2.25rem", maxWidth: 500 }}>
              Dr. Evelyn Luma and her team deliver personalized, gentle dental care in Virginia Beach — from routine cleanings to complete smile transformations.
            </p>

            <div className="hero-cta fade-up" style={motionDelay(0.7)}>
              <a href="#book" className="btn-green">Book an Appointment →</a>
              <a href={`tel:${PHONE}`} className="btn-outline">{PHONE}</a>
            </div>

            <div className="stats-row fade-up" style={motionDelay(0.9)}>
              {stats.map((s, i) => (
                <Stat key={s.label} value={s.value} label={s.label} delay={1 + i * 0.12} />
              ))}
            </div>
          </div>
        </div>

        <div className="scroll-hint" style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", textAlign: "center" }} aria-hidden="true">
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>scroll</p>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.18)", margin: "6px auto 0" }} />
        </div>
      </section>

      {/* ══ TICKER — slow continuous strip of what we do ═══ */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map(k => (
            <div key={k} className="ticker-run">
              {tickerItems.map(t => <span key={t}>{t}<i /></span>)}
            </div>
          ))}
        </div>
      </div>

      {/* ══ TRUST BADGES — certifications and affiliations ══ */}
      <section style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "1.5rem 0" }} aria-label="Certifications and affiliations">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap", justifyContent: "center" }}>
            <InvisalignBadge />
            <CareCredit />
            <PhilipsZoom />
            {/* Real ADA logo */}
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", border: "1px solid #d0ebc8", borderRadius: 6, padding: "0.5rem 0.875rem", background: "#f5fbf3" }}>
              <img src={adaImg} alt="American Dental Association member" loading="lazy" decoding="async" style={{ height: 48, width: "auto", objectFit: "contain" }} />
            </div>
            {/* Real VDA logo */}
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", border: "1px solid #e8d0d0", borderRadius: 6, padding: "0.5rem 0.875rem", background: "#fdf5f5" }}>
              <img src={vdaImg} alt="Virginia Dental Association member" loading="lazy" decoding="async" style={{ height: 48, width: "auto", objectFit: "contain" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ PILLARS ══════════════════════════════════════════ */}
      <section style={{ background: "var(--green)", padding: "3.5rem 0" }} aria-label="Our practice philosophy">
        <div className="container">
          <p className="tag" style={{ color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: "2.5rem" }}>Our Practice Philosophy</p>
          <div className="pillars-grid">
            {pillars.map((p, i) => (
              <div key={p.title} className="rv" style={{ ...motionDelay(i * 0.08), background: i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", padding: "2rem 1.75rem" }}>
                <h3 className="serif" style={{ color: "#fff", fontSize: "clamp(17px,1.8vw,21px)", marginBottom: "0.75rem" }}>{p.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, fontWeight: 300 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ════════════════════════════════════════ */}
      <section id="services" className="section-pad" style={{ background: "var(--smoke)" }} aria-label="Dental services">
        <div className="container">
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <div className="md:col-span-1">
              <span className="tag">Our Services — Virginia Beach, VA</span>
              <h2 className="h-section">
                <SplitLines lines={["Everything your", <em key="e" style={{ color: "var(--green)" }}>smile needs</em>]} />
              </h2>
            </div>
            <p style={{ color: "var(--mist)", fontSize: "clamp(14px,1.5vw,16px)", lineHeight: 1.7, fontWeight: 300 }}>
              From your first cleaning to a complete cosmetic transformation, our Virginia Beach practice offers comprehensive dental care with the personal touch that keeps patients coming back for life.
            </p>
          </div>

          {/* Tab toggle */}
          <div style={{ display: "flex", gap: 2, marginBottom: 2, flexWrap: "wrap" }}>
            {(["cosmetic","preventive"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: activeTab === tab ? "var(--green)" : "#e8e3dc",
                color: activeTab === tab ? "#fff" : "var(--mist)",
                border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 700, padding: "0.7rem 1.25rem",
                borderRadius: 2, letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.2s",
              }}>
                {tab === "cosmetic" ? "Cosmetic & Restorative" : "Preventive & Orthodontics"}
              </button>
            ))}
          </div>

          <div className="grid-4">
            {(activeTab === "cosmetic" ? cosmeticServices : preventiveServices).map((svc, i) => (
              <article key={svc.title} className="svc-card rv" style={motionDelay(i * 0.06)}>
                <span style={{ fontSize: 20, color: "var(--green)", display: "block", marginBottom: "0.875rem" }}>{svc.emoji}</span>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: "0.5rem" }}>{svc.title}</h3>
                <p style={{ fontSize: 13, color: "var(--mist)", lineHeight: 1.65, fontWeight: 300, marginBottom: "0.875rem" }}>{svc.desc}</p>
                <a href="#book" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", fontWeight: 700, letterSpacing: "0.04em" }}>Book This →</a>
              </article>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <a href="#book" className="btn-green">Schedule Your Appointment →</a>
          </div>
        </div>
      </section>

      {/* ══ TECHNOLOGY ══════════════════════════════════════ */}
      <section id="technology" className="section-pad" style={{ background: "var(--ink)" }} aria-label="Advanced dental technology">
        <div className="container">
          <div className="tech-layout">
            <div>
              <span className="tag" style={{ color: "var(--green-muted)" }}>Modern Technology</span>
              <h2 className="serif" style={{ fontSize: "clamp(32px,4vw,54px)", color: "#fff", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
                <SplitLines lines={["High-tech care,", <em key="e" style={{ color: "var(--green-muted)" }}>human touch.</em>]} />
              </h2>
              <p className="rv" style={{ ...motionDelay(0.2), color: "rgba(255,255,255,0.56)", fontSize: "clamp(14px,1.5vw,16px)", lineHeight: 1.75, fontWeight: 300, maxWidth: 440 }}>
                Dr. Luma invests in the tools that make dentistry more accurate, more comfortable, and easier to understand — so you see what we see and know exactly what's happening with your smile.
              </p>
              <div className="pw tech-photo rv" data-amp="0.7" style={motionDelay(0.3)}>
                <img src={iteroWandImg} alt="iTero Lumina intraoral scanner wand" width={1400} height={785} loading="lazy" decoding="async" style={{ objectFit: "cover", objectPosition: "center" }} />
              </div>
            </div>
            <div className="tech-grid">
              {technology.map((t, i) => (
                <article key={t.title} className="tech-card rv" style={motionDelay(0.15 + i * 0.1)}>
                  <span aria-hidden="true" style={{ fontSize: 22, color: "var(--green-muted)", display: "block", marginBottom: "0.875rem" }}>{t.emoji}</span>
                  <h3 className="serif" style={{ fontSize: "clamp(18px,2vw,22px)", color: "#fff", marginBottom: "0.5rem" }}>{t.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, fontWeight: 300 }}>{t.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <section className="section-pad" style={{ background: "#fff" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="tag">It's Simple</span>
            <h2 className="h-section">
              <SplitLines lines={["Your first visit in", <em key="e" style={{ color: "var(--green)" }}>3 easy steps</em>]} />
            </h2>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={step.n} className="rv" style={{ ...motionDelay(i * 0.1), background: i === 1 ? "var(--green)" : "var(--smoke)", padding: "clamp(2rem,4vw,3.25rem) clamp(1.5rem,3vw,2.5rem)", position: "relative" }}>
                <span className="serif" style={{ fontSize: "clamp(56px,7vw,80px)", color: i === 1 ? "rgba(255,255,255,0.1)" : "#e8e3dc", lineHeight: 1, display: "block", marginBottom: "1.25rem" }}>{step.n}</span>
                <h3 className="serif" style={{ fontSize: "clamp(20px,2.5vw,26px)", color: i === 1 ? "#fff" : "var(--ink)", marginBottom: "0.625rem" }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: i === 1 ? "rgba(255,255,255,0.62)" : "var(--mist)", lineHeight: 1.6, fontWeight: 300 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <a href="#book" className="btn-green">Start Step 1 — Book Now</a>
          </div>
        </div>
      </section>

      {/* ══ ABOUT DR. LUMA ══════════════════════════════════ */}
      <section id="about" className="section-pad" style={{ background: "var(--ink)" }} aria-label="About Dr. Evelyn Luma">
        <div className="container">
          <div className="about-layout">
            {/* Photo placeholder */}
            <div style={{ position: "relative" }}>
              <div style={{ background: "var(--green-dark)", position: "absolute", top: -12, left: -12, right: "2rem", bottom: "2rem", borderRadius: 2 }} aria-hidden="true" />
              <div className="pw" style={{ position: "relative", height: "clamp(320px,45vw,520px)", borderRadius: 2 }}>
                <img
                  src={drLumaImg}
                  alt="Dr. Evelyn E. Luma, DDS — Atlantic Dental Care, Virginia Beach"
                  width={480} height={480} loading="lazy" decoding="async"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
              </div>
              {/* Rating card */}
              <div style={{ position: "absolute", bottom: -20, right: -16, background: "#fff", padding: "1.25rem 1.5rem", borderRadius: 2, boxShadow: "0 16px 48px rgba(0,0,0,0.28)", zIndex: 2 }}>
                <p className="serif" style={{ fontSize: 30, color: "var(--green)", lineHeight: 1 }}>{googleRating}★</p>
                <p style={{ fontSize: 10, color: "var(--mist)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>Google Rating</p>
                <p style={{ fontSize: 11, color: "var(--pebble)", marginTop: 2 }}>{googleReviewCount.toLocaleString()} reviews</p>
              </div>
            </div>

            {/* Bio */}
            <div style={{ paddingTop: "1rem" }}>
              <span className="tag" style={{ color: "var(--green-muted)" }}>Meet Your Doctor</span>
              <h2 className="serif" style={{ fontSize: "clamp(32px,4vw,54px)", color: "#fff", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
                <SplitLines lines={["Dr. Evelyn E. Luma,", <em key="e" style={{ color: "var(--green-muted)" }}>DDS</em>]} />
              </h2>

              <p style={{ color: "rgba(255,255,255,0.52)", fontSize: 15, lineHeight: 1.8, fontWeight: 300, marginBottom: "0.875rem" }}>
                Dr. Luma earned her BS in Chemistry from <strong style={{ color: "rgba(255,255,255,0.75)" }}>Southwestern Oklahoma State University</strong> (1993) and her DDS from <strong style={{ color: "rgba(255,255,255,0.75)" }}>Meharry Medical College</strong> in Nashville, TN (May 2000).
              </p>
              <p style={{ color: "rgba(255,255,255,0.52)", fontSize: 15, lineHeight: 1.8, fontWeight: 300, marginBottom: "0.875rem" }}>
                She completed her general practice residency at <strong style={{ color: "rgba(255,255,255,0.75)" }}>St. Elizabeth's Hospital</strong> in Washington, D.C., then practiced in Northern Virginia and Hampton, VA before establishing her solo practice here in Virginia Beach — bringing 25 years of experience to every patient she sees.
              </p>
              <p style={{ color: "rgba(255,255,255,0.52)", fontSize: 15, lineHeight: 1.8, fontWeight: 300, marginBottom: "2rem" }}>
                She is an award recipient from the <strong style={{ color: "rgba(255,255,255,0.75)" }}>American Academy of Periodontology</strong> and an honorable member of <strong style={{ color: "rgba(255,255,255,0.75)" }}>Manchester's Who's Who of Executives and Professionals</strong>.
              </p>

              <div className="about-creds">
                {["ADA Member","Zoom! Certified","Invisalign Provider","CareCredit Accepted","AAP Award Recipient","25 Years of Experience"].map(b => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%", flexShrink: 0 }} />
                    <span style={{ color: "rgba(255,255,255,0.58)", fontSize: 13 }}>{b}</span>
                  </div>
                ))}
              </div>

              <a href="#book" className="btn-green">Schedule a Consultation →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TEAM ════════════════════════════════════════════ */}
      <section id="team" className="section-pad" style={{ background: "var(--smoke)" }} aria-label="Our dental team">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="tag">Meet Our Team</span>
            <h2 className="h-section">
              <SplitLines lines={["Experienced. Caring.", <em key="e" style={{ color: "var(--green)" }}>All yours.</em>]} />
            </h2>
          </div>

          {/* Dr. Luma featured */}
          <div className="team-featured rv" style={{ background: "var(--green)", marginBottom: 2, borderRadius: 2, overflow: "hidden" }}>
            <div className="pw" data-amp="0.6" style={{ minHeight: 240 }}>
              <img
                src={drLumaImg}
                alt="Dr. Evelyn E. Luma, DDS"
                width={480} height={480} loading="lazy" decoding="async"
                style={{ minHeight: 240, objectFit: "cover", objectPosition: "center top" }}
              />
            </div>
            <div style={{ padding: "2.25rem 2.5rem" }}>
              <p style={{ color: "var(--green-muted)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Practice Owner & Lead Dentist</p>
              <h3 className="serif" style={{ color: "#fff", fontSize: "clamp(20px,2.5vw,28px)", marginBottom: "0.75rem" }}>Dr. Evelyn E. Luma, DDS</h3>
              <p style={{ color: "rgba(255,255,255,0.56)", fontSize: 14, lineHeight: 1.75, fontWeight: 300 }}>
                BS Chemistry — Southwestern Oklahoma State University (1993) · DDS — Meharry Medical College, Nashville, TN (2000) · General Practice Residency — St. Elizabeth's Hospital, Washington D.C. · Award recipient, American Academy of Periodontology · Member, Manchester's Who's Who of Executives and Professionals.
              </p>
            </div>
          </div>

          {/* Rest of team */}
          <div className="team-grid">
            {team.map((member, i) => (
              <article key={member.name} className="rv" style={{ ...motionDelay((i % 4) * 0.08), background: "#fff", overflow: "hidden" }}>
                {member.photo ? (
                  <div className="pw" data-amp="0.6" style={{ aspectRatio: "1/1" }}>
                    <img
                      src={member.photo}
                      alt={`${member.name}, ${member.role}`}
                      width={600} height={600} loading="lazy" decoding="async"
                      style={{ objectFit: "cover", objectPosition: "center top" }}
                    />
                  </div>
                ) : (
                  <div className="monogram" aria-hidden="true">
                    <span>{initials(member.name)}</span>
                  </div>
                )}
                <div style={{ padding: "1.375rem 1.25rem" }}>
                  <p style={{ color: "var(--green)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>{member.role}</p>
                  <h4 style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: "0.625rem" }}>{member.name}</h4>
                  <p style={{ fontSize: 12, color: "var(--mist)", lineHeight: 1.7, fontWeight: 300 }}>{member.bio}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Spanish note */}
          <div style={{ marginTop: "1.5rem", background: "var(--green-light)", padding: "1rem 1.375rem", borderLeft: "3px solid var(--green)", borderRadius: 2 }}>
            <p style={{ fontSize: 13, color: "var(--mist)" }}>
              <strong style={{ color: "var(--green)" }}>Se habla español.</strong> Our bilingual dental assistant Fabie is fluent in Spanish and happy to assist Spanish-speaking patients throughout their entire visit.
            </p>
          </div>
        </div>
      </section>

      {/* ══ SMILE GALLERY ════════════════════════════════════ */}
      <section id="gallery" style={{ background: "var(--ink)", padding: "0" }} aria-label="Treatment gallery">

        {/* Header band — dark with oversized serif number */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "clamp(3rem,6vw,5rem) 0 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", marginBottom: "2.5rem" }}>

              {/* Top row: label + stat */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <span className="tag" style={{ color: "var(--green-muted)" }}>Our Treatments</span>
                <div className="gal-stats">
                  {[[String(galleryItems.length), "Treatments Shown"], [googleReviewCount.toLocaleString(), "Google Reviews"]].map(([val, lbl]) => (
                    <div key={lbl} style={{ textAlign: "right" }}>
                      <p className="serif" style={{ color: "#fff", fontSize: "clamp(18px,2.5vw,24px)", lineHeight: 1 }}>{val}</p>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Big headline */}
              <div className="gal-headline-row">
                <h2 className="serif" style={{ fontSize: "clamp(38px,6vw,80px)", color: "#fff", lineHeight: 1.0, letterSpacing: "-0.03em", maxWidth: 700 }}>
                  <SplitLines lines={["See what's possible", <em key="e" style={{ color: "var(--green-muted)" }}>at our practice.</em>]} />
                </h2>
                <a href="#book" className="btn-green" style={{ flexShrink: 0, alignSelf: "flex-end" }}>
                  Book a Consultation →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery grid — responsive */}
        <div className="gal-grid" aria-label="Treatment gallery">
          {galleryItems.map((item, i) => {
            const { label, img, alt, patient, contain } = item;
            return (
            <div
              key={label}
              className="rv gal-tile"
              role="button" tabIndex={0}
              aria-label={`View larger: ${label}`}
              data-cursor="view"
              onClick={() => setLightbox(item)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightbox(item); } }}
              style={{ ...motionDelay((i % 3) * 0.1), position: "relative", overflow: "hidden", background: i % 2 === 0 ? "#0e2244" : "#0a1c3a" }}
            >
              <div className="pw" data-amp={contain ? "0.35" : "1"} style={{ width: "100%", aspectRatio: "1/1" }}>
                <img
                  src={img}
                  alt={alt}
                  width={900} height={900}
                  loading="lazy" decoding="async"
                  style={{ objectFit: contain ? "contain" : "cover", objectPosition: contain ? "center" : "center top" }}
                />
              </div>
              {/* Label */}
              <div style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>{label}</span>
                {patient && (
                  <span style={{ color: "var(--green)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Actual patient result</span>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="container" style={{ paddingBlock: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontStyle: "italic" }}>
            Treatment photos are illustrative except where marked "Actual patient result." Individual results vary — ask about real case photos at your consultation.
          </p>
        </div>
      </section>

      {/* ══ INVISALIGN PROMO ═══════════════════════════════ */}
      <section id="invisalign" className="section-pad" style={{ background: "var(--green-light)" }} aria-label="Invisalign at Atlantic Dental Care">
        <div className="container">
          <div className="promo-layout">
            <div className="promo-media">
              <div className="pw rv" data-amp="1.2" style={{ aspectRatio: "4 / 3", borderRadius: 2 }}>
                <img src={invisalignSmileImg} alt="Patient smiling at a digital preview of her Invisalign treatment" width={1500} height={1047} loading="lazy" decoding="async" style={{ objectFit: "cover", objectPosition: "center" }} />
              </div>
              <div className="promo-tile pw rv" data-amp="0.5" style={motionDelay(0.25)}>
                <img src={viveraImg} alt="Vivera retainers — Atlantic Dental Care is a Vivera provider" width={800} height={800} loading="lazy" decoding="async" style={{ objectFit: "cover" }} />
              </div>
            </div>
            <div>
              <span className="tag">Invisalign® Provider · Vivera™ Provider</span>
              <h2 className="h-section">
                <SplitLines lines={["Get a jump on", <em key="e" style={{ color: "var(--green)" }}>your new smile.</em>]} />
              </h2>
              <p className="rv" style={{ ...motionDelay(0.25), color: "var(--mist)", fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.7, fontWeight: 300, marginTop: "1.25rem", marginBottom: "1.5rem", maxWidth: 460 }}>
                Clear aligners, no wires. We scan your teeth with the iTero™ Lumina in minutes — no impression trays — and show you a digital preview of how your smile could look before you commit. Vivera™ retainers keep it that way.
              </p>
              <div className="rv" style={{ ...motionDelay(0.35), marginBottom: "2rem" }}>
                <img src={invisalignProviderImg} alt="Invisalign Provider" width={992} height={257} loading="lazy" decoding="async" style={{ height: 36, width: "auto", display: "block" }} />
              </div>
              <div className="rv" style={motionDelay(0.45)}>
                <a href="#book" className="btn-green">Book an Invisalign Consult →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ═════════════════════════════════════════ */}
      <section id="reviews" className="section-pad" style={{ background: "var(--smoke)" }} aria-label="Patient reviews">
        <div className="container">

          {/* Section header — asymmetric pull-quote style */}
          <div style={{ marginBottom: "3.5rem" }}>
            {/* Top rule + label row */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ height: 1, flex: 1, background: "var(--line)" }} />
              <span className="tag" style={{ marginBottom: 0 }}>
                {configured.google || configured.facebook ? "Live Google & Facebook Reviews" : "Patient Reviews"}
              </span>
              <div style={{ height: 1, flex: 1, background: "var(--line)" }} />
            </div>

            {/* Oversized opening quote + headline */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
              <div style={{ position: "relative" }}>
                {/* Decorative large quotation mark */}
                <span className="serif" style={{
                  position: "absolute", top: "-1.5rem", left: "-0.5rem",
                  fontSize: "clamp(80px,12vw,140px)", color: "var(--green)", opacity: 0.12,
                  lineHeight: 1, pointerEvents: "none", userSelect: "none",
                }}>
                  &ldquo;
                </span>
                <h2 className="serif" style={{ fontSize: "clamp(34px,5vw,68px)", color: "var(--ink)", lineHeight: 1.05, letterSpacing: "-0.03em", position: "relative" }}>
                  <SplitLines lines={["Don’t take our word for it —", <em key="e" style={{ color: "var(--green)" }}>hear it from Virginia Beach.</em>]} />
                </h2>
              </div>

              {/* Sub-row: descriptor + call link */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", paddingTop: "0.5rem", borderTop: "1px solid var(--line)" }}>
                <p style={{ color: "var(--mist)", fontSize: 14, fontWeight: 300, maxWidth: 420, lineHeight: 1.6 }}>
                  {configured.google || configured.facebook
                    ? "A new selection of reviews loads every time you visit — pulled live from Google and Facebook."
                    : `Rated ${googleRating} out of 5 by ${googleReviewCount.toLocaleString()} patients on Google.`}
                </p>
                <a href={`tel:${PHONE}`} style={{ color: "var(--green)", fontWeight: 700, fontSize: 14, textDecoration: "none", letterSpacing: "0.04em", whiteSpace: "nowrap", borderBottom: "1px solid var(--green)", paddingBottom: 2 }}>
                  {PHONE}
                </a>
              </div>
            </div>
          </div>

          {/* Loading skeleton */}
          {reviewsLoading && (
            <div className="grid-3">
              {[0,1,2].map(i => (
                <div key={i} style={{ background: "#fff", padding: "2.25rem", borderRadius: 2 }}>
                  <div style={{ height: 12, background: "#e8e3dc", borderRadius: 2, width: "40%", marginBottom: "1rem" }} />
                  <div style={{ height: 10, background: "#f0ede8", borderRadius: 2, marginBottom: 8 }} />
                  <div style={{ height: 10, background: "#f0ede8", borderRadius: 2, marginBottom: 8, width: "85%" }} />
                  <div style={{ height: 10, background: "#f0ede8", borderRadius: 2, width: "70%" }} />
                </div>
              ))}
            </div>
          )}

          {/* No live reviews yet — link out to the real ones */}
          {!reviewsLoading && displayReviews.length === 0 && (
            <div className="google-summary">
              <div>
                <p className="serif" style={{ fontSize: "clamp(56px,8vw,96px)", lineHeight: 1, color: "var(--ink)", letterSpacing: "-0.03em" }}>{googleRating}</p>
                <div style={{ display: "flex", gap: 3, margin: "0.5rem 0 0.375rem" }} aria-label={`${googleRating} out of 5 stars`}>
                  {[1,2,3,4,5].map(star => <span key={star} style={{ fontSize: 22, color: "#f4b400" }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: "var(--mist)", fontWeight: 300 }}>
                  from <strong style={{ color: "var(--ink)", fontWeight: 700 }}>{googleReviewCount.toLocaleString()}</strong> Google reviews
                </p>
              </div>
              <div>
                <p className="serif" style={{ fontSize: "clamp(22px,2.5vw,30px)", color: "var(--ink)", lineHeight: 1.2, marginBottom: "1rem" }}>
                  Hundreds of Virginia Beach families have shared their experience with Dr. Luma and the team.
                </p>
                <p style={{ fontSize: 15, color: "var(--mist)", lineHeight: 1.7, fontWeight: 300, marginBottom: "1.5rem" }}>
                  Read what patients say about their visits — the kind staff, the welcoming atmosphere, and the care they receive — directly on our Google Business Profile.
                </p>
                <a href={GOOGLE_LISTING_URL} target="_blank" rel="noopener noreferrer" className="btn-green" style={{ display: "inline-block" }}>
                  Read our reviews on Google →
                </a>
              </div>
            </div>
          )}

          {/* Live reviews */}
          {!reviewsLoading && displayReviews.length > 0 && (
            <div className="grid-3">
              {displayReviews.map((r, i) => (
                <article
                  key={r.id}
                  className="rv"
                  style={{
                    ...motionDelay((i % 3) * 0.1),
                    background: i === 0 ? "var(--green)" : "#fff",
                    padding: "clamp(1.75rem,3vw,3rem) clamp(1.5rem,2.5vw,2.25rem)",
                    display: "flex", flexDirection: "column",
                  }}
                >
                  {/* Source + stars row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.125rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    {/* Stars */}
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{
                          fontSize: 13,
                          color: star <= r.rating
                            ? (i === 0 ? "var(--green-muted)" : "var(--green)")
                            : (i === 0 ? "rgba(255,255,255,0.2)" : "#e8e3dc"),
                        }}>★</span>
                      ))}
                    </div>
                    {/* Source badge */}
                    <div style={{ opacity: i === 0 ? 0.7 : 1 }}>
                      <SourceBadge source={r.source} />
                    </div>
                  </div>

                  {/* Review text */}
                  <blockquote
                    className="serif"
                    style={{
                      fontSize: "clamp(14px,1.5vw,17px)",
                      lineHeight: 1.58,
                      color: i === 0 ? "#fff" : "var(--ink)",
                      marginBottom: "1.75rem",
                      fontStyle: "italic",
                      flex: 1,
                    }}
                  >
                    &ldquo;{r.text}&rdquo;
                  </blockquote>

                  {/* Reviewer */}
                  <div style={{ borderTop: `1px solid ${i === 0 ? "rgba(255,255,255,0.14)" : "var(--line)"}`, paddingTop: "1.125rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {/* Avatar */}
                    {r.photo ? (
                      <img
                        src={r.photo}
                        alt={r.name}
                        loading="lazy"
                        width={36}
                        height={36}
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: i === 0 ? "rgba(255,255,255,0.15)" : "var(--green-light)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700,
                        color: i === 0 ? "rgba(255,255,255,0.7)" : "var(--green)",
                      }}>
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: i === 0 ? "#fff" : "var(--ink)" }}>{r.name}</p>
                      {r.time > 0 && (
                        <p style={{ fontSize: 11, color: i === 0 ? "rgba(255,255,255,0.45)" : "var(--pebble)", marginTop: 1 }}>
                          {new Date(r.time * 1000).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Links to review profiles */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={GOOGLE_WRITE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontWeight: 700, fontSize: 13, textDecoration: "none", border: "1px solid var(--green)", padding: "0.625rem 1.25rem", borderRadius: 2 }}
            >
              <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.96 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Leave a Google Review
            </a>
            {FACEBOOK_PAGE_URL && (
            <a
              href={`${FACEBOOK_PAGE_URL.replace(/\/$/, "")}/reviews`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, color: "#1877F2", fontWeight: 700, fontSize: 13, textDecoration: "none", border: "1px solid #1877F2", padding: "0.625rem 1.25rem", borderRadius: 2 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              Leave a Facebook Review
            </a>
            )}
          </div>
        </div>
      </section>

      {/* ══ DISCLOSURE ══════════════════════════════════════ */}
      <section id="disclosure" className="section-pad" style={{ background: "var(--ink)" }} aria-label="Disclosure and nondiscrimination policy">
        <div className="container">
          <span className="tag" style={{ color: "var(--green-muted)" }}>Legal & Accessibility</span>
          <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#fff", letterSpacing: "-0.03em", marginBottom: "3rem", lineHeight: 1.1 }}>
            Disclosure &<br />
            <em style={{ color: "var(--green-muted)" }}>Nondiscrimination Policy</em>
          </h2>

          <div className="disclosure-grid">

            {/* Nondiscrimination */}
            <div style={{ background: "rgba(255,255,255,0.04)", padding: "2.25rem" }}>
              <h3 className="serif" style={{ color: "var(--green-muted)", fontSize: 20, marginBottom: "1.125rem" }}>Notice of Nondiscrimination</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.8, fontWeight: 300, marginBottom: "1rem" }}>
                Atlantic Dental Care, PLC complies with applicable Federal civil rights laws and does not discriminate on the basis of race, color, national origin, age, disability, or sex.
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.8, fontWeight: 300 }}>
                We provide at no charge: qualified sign language interpreters, written information in alternate formats (large print, audio, accessible electronic), and qualified language interpreters for non-English-speaking patients.
              </p>
            </div>

            {/* Grievance */}
            <div style={{ background: "rgba(255,255,255,0.04)", padding: "2.25rem" }}>
              <h3 className="serif" style={{ color: "var(--green-muted)", fontSize: 20, marginBottom: "1.125rem" }}>Grievance Procedure</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  ["Submit complaint within",          "60 days of the alleged incident"],
                  ["Written decision issued within",   "30 days of complaint"],
                  ["Appeal to leadership within",      "15 days of coordinator's decision"],
                  ["External complaint (HHS / OCR) within", "180 days"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
                    <span style={{ color: "rgba(255,255,255,0.42)", fontSize: 13 }}>{label}</span>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Civil Rights Coordinator */}
            <div style={{ background: "var(--green)", padding: "2.25rem" }}>
              <h3 className="serif" style={{ color: "#fff", fontSize: 20, marginBottom: "1.125rem" }}>Civil Rights Coordinator</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {[["Name","Dora Scott"],["Phone",PHONE],["Fax",FAX],["Email",EMAIL],["Address",ADDRESS]].map(([field, val]) => (
                  <div key={field}>
                    <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>{field}</p>
                    <p style={{ color: "#fff", fontSize: 14 }}>{val}</p>
                  </div>
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: "1.25rem" }}>Policy dated: October 16, 2016</p>
            </div>

            {/* Languages */}
            <div style={{ background: "rgba(255,255,255,0.04)", padding: "2.25rem" }}>
              <h3 className="serif" style={{ color: "var(--green-muted)", fontSize: 20, marginBottom: "0.5rem" }}>Multilingual Notices Available</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: "1.25rem" }}>Nondiscrimination notices provided at no cost in:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {languages.map(({ label, code }) => (
                  <button
                    key={code}
                    onClick={() => switchLanguage(code)}
                    style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.62)", fontSize: 12, padding: "4px 10px", borderRadius: 2, fontWeight: 500, border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--green)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.62)"; }}
                  >{label}</button>
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, marginTop: "1rem" }}>Click a language to translate this page. Click English to restore the original.</p>
            </div>

          </div>

          {/* HHS filing */}
          <div style={{ marginTop: 2, background: "rgba(255,255,255,0.04)", padding: "1.625rem 2.25rem" }}>
            <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 13, lineHeight: 1.75 }}>
              <strong style={{ color: "rgba(255,255,255,0.72)" }}>External Complaints:</strong> If you believe Atlantic Dental Care, PLC has failed to provide these services or discriminated in another way, you may file a civil rights complaint with the U.S. Department of Health and Human Services, Office for Civil Rights (OCR), within 180 days of the alleged act — electronically at <strong style={{ color: "var(--green-muted)" }}>ocrportal.hhs.gov</strong> or by mail to U.S. HHS, 200 Independence Avenue SW, Room 509F, HHH Building, Washington, DC 20201.
            </p>
          </div>

          {/* Official documents — clickable */}
          <div style={{ marginTop: 2, background: "rgba(255,255,255,0.04)", padding: "1.75rem 2.25rem" }}>
            <h4 className="serif" style={{ color: "#fff", fontSize: 18, marginBottom: "0.375rem" }}>Official Practice Documents</h4>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: "1.375rem" }}>
              Click any document below to view or download. These are available at no charge upon request.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

              {/* Notice of Privacy Practices — PDF */}
              <a
                href={privacyPdf}
                target="_blank"
                rel="noopener noreferrer"
                download="Notice_of_Privacy_Practices_2026.pdf"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: "1rem", flexWrap: "wrap",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 4, padding: "1rem 1.375rem",
                  textDecoration: "none", transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  {/* PDF icon */}
                  <div style={{ width: 36, height: 36, borderRadius: 4, background: "#e53935", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.04em" }}>PDF</span>
                  </div>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Notice of Privacy Practices — 2026</p>
                    <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 12 }}>HIPAA-compliant notice explaining how your health information is used and protected</p>
                  </div>
                </div>
                <span style={{ color: "var(--green-muted)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>View / Download ↗</span>
              </a>

              {/* Section 1557 Notice & Grievance Policy — DOCX */}
              <a
                href={grievanceDocx}
                target="_blank"
                rel="noopener noreferrer"
                download="1557_Notice_and_Grievance_Policy.docx"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: "1rem", flexWrap: "wrap",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 4, padding: "1rem 1.375rem",
                  textDecoration: "none", transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  {/* DOCX icon */}
                  <div style={{ width: 36, height: 36, borderRadius: 4, background: "#1565c0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.02em" }}>DOCX</span>
                  </div>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Section 1557 — Notice &amp; Grievance Policy</p>
                    <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 12 }}>Nondiscrimination notice and grievance procedure under the ACA Section 1557</p>
                  </div>
                </div>
                <span style={{ color: "var(--green-muted)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>View / Download ↗</span>
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* ══ COVID SAFETY ════════════════════════════════════ */}
      <section style={{ background: "var(--green-light)", padding: "2.75rem 0" }}>
        <div className="container">
          <div className="covid-inner">
            <div style={{ flex: 1, minWidth: 260 }}>
              <h4 style={{ fontWeight: 700, fontSize: 13, color: "var(--green)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.625rem" }}>
                Our Safety Commitment
              </h4>
              <p style={{ fontSize: 14, color: "var(--mist)", lineHeight: 1.75, fontWeight: 300 }}>
                We follow ADA, CDC, and OSHA infection control recommendations at every appointment. Pre-screening questions asked before and upon arrival. Hand sanitizer throughout the office. Text check-in — wait in your car until we're ready for you.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["ADA Guidelines","CDC Protocols","OSHA Standards","Text Check-In"].map(b => (
                <span key={b} style={{ background: "var(--green)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 2, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ═════════════════════════════════════════════ */}
      <section id="faq" className="section-pad" style={{ background: "#fff" }} aria-label="Frequently asked questions">
        <div className="container">
          <div className="faq-layout">
            <div>
              <span className="tag">Questions &amp; Answers</span>
              <h2 className="h-section">Before you call,<br /><em style={{ color: "var(--green)" }}>the answers.</em></h2>
              <p style={{ color: "var(--mist)", fontSize: 15, lineHeight: 1.7, fontWeight: 300, marginTop: "1rem", maxWidth: 380 }}>
                Still have a question? Dora and the front office team are happy to help at{" "}
                <a href={`tel:${PHONE}`} style={{ color: "var(--green)", fontWeight: 700, textDecoration: "none" }}>{PHONE}</a>.
              </p>
            </div>
            <div className="faq-list">
              {faqs.map((f, i) => (
                <details key={f.q} className="faq-item rv" style={motionDelay(i * 0.06)}>
                  <summary>
                    <span>{f.q}</span>
                    <span className="faq-icon" aria-hidden="true">+</span>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ BOOKING FORM ════════════════════════════════════ */}
      <section id="book" className="section-pad" style={{ background: "var(--smoke)" }} aria-label="Book an appointment">
        <div className="container">
          <div className="book-layout">

            {/* Left — sticky copy */}
            <div className="book-sticky">
              <span className="tag">Book an Appointment</span>
              <h2 className="serif" style={{ fontSize: "clamp(36px,4.5vw,60px)", color: "var(--ink)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
                <SplitLines lines={["Ready for a", "smile you", <em key="e" style={{ color: "var(--green)" }}>love?</em>]} />
              </h2>
              <p style={{ color: "var(--mist)", fontSize: 16, lineHeight: 1.7, fontWeight: 300, marginBottom: "2rem" }}>
                Submit the form and we'll reach out to confirm within one business day. New and returning patients always welcome.
              </p>
              <a href={`tel:${PHONE}`} className="serif" style={{ display: "block", fontSize: "clamp(22px,3vw,28px)", color: "var(--green)", textDecoration: "none", marginBottom: "2rem" }}>{PHONE}</a>

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1.375rem", marginBottom: "1.25rem" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pebble)", marginBottom: "0.625rem" }}>Office Hours</p>
                <p style={{ fontSize: 14, color: "var(--ink)", marginBottom: 3 }}>Mon–Thu: <strong>8:30 AM – 5:30 PM</strong></p>
                <p style={{ fontSize: 14, color: "var(--pebble)" }}>Fri–Sun: Closed</p>
              </div>

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1.375rem", marginBottom: "1.25rem" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pebble)", marginBottom: "0.625rem" }}>Location</p>
                <p style={{ fontSize: 14, color: "var(--mist)", lineHeight: 1.7 }}>1244 Perimeter Pkwy, Suite 444<br />Virginia Beach, VA 23454</p>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "0.5rem", fontSize: 13, color: "var(--green)", fontWeight: 700, textDecoration: "none" }}>Get directions →</a>
                <iframe
                  title="Map to Atlantic Dental Care, 1244 Perimeter Pkwy Suite 444, Virginia Beach"
                  src={MAPS_EMBED_URL}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  style={{ display: "block", width: "100%", height: 190, border: 0, borderRadius: 2, marginTop: "0.875rem", filter: "saturate(0.85)" }}
                />
              </div>

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1.375rem", marginBottom: "1.375rem" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pebble)", marginBottom: "0.625rem" }}>Email</p>
                <a href={`mailto:${EMAIL}`} style={{ fontSize: 14, color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>{EMAIL}</a>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.75rem" }}>
                <InvisalignBadge />
                <CareCredit />
                <PhilipsZoom />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["New Patients Welcome","Se habla español"].map(b => (
                  <span key={b} style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", background: "var(--green-light)", padding: "4px 9px", borderRadius: 2 }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div style={{ background: "#fff", padding: "clamp(1.75rem,4vw,3.25rem)", borderRadius: 2 }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "3.5rem 0" }}>
                  <div style={{ width: 60, height: 60, background: "var(--green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.375rem", fontSize: 26, color: "#fff" }}>✓</div>
                  <h3 className="serif" style={{ fontSize: 28, color: "var(--ink)", marginBottom: "0.75rem" }}>You're on the list!</h3>
                  <p style={{ fontSize: 15, color: "var(--mist)", lineHeight: 1.6, marginBottom: "2rem", fontWeight: 300 }}>
                    Thank you, {form.name}! We'll call {form.phone} within one business day to confirm your appointment.
                  </p>
                  <a href={`tel:${PHONE}`} className="btn-green">Call to Confirm Faster</a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h3 className="serif" style={{ fontSize: "clamp(22px,2.5vw,28px)", color: "var(--ink)", marginBottom: "0.375rem" }}>Request Your Visit</h3>
                  <p style={{ fontSize: 14, color: "var(--mist)", marginBottom: "2rem", fontWeight: 300 }}>New and returning patients welcome</p>

                  <div className="form-grid-2" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label className="field-label" htmlFor="name">Full Name *</label>
                      <input id="name" className="field" type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Jane Smith" autoComplete="name" />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="phone">Phone Number *</label>
                      <input id="phone" className="field" type="tel" name="phone" required value={form.phone} onChange={handleChange} placeholder="(757) 000-0000" autoComplete="tel" />
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label className="field-label" htmlFor="email">Email Address</label>
                    <input id="email" className="field" type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@email.com" autoComplete="email" />
                  </div>

                  <div className="form-grid-2" style={{ marginBottom: "1rem" }}>
                    <div>
                      <label className="field-label" htmlFor="service">Service Needed *</label>
                      <select id="service" className="field" name="service" required value={form.service} onChange={handleChange} style={{ color: form.service ? "var(--ink)" : "var(--pebble)", cursor: "pointer" }}>
                        <option value="">Select a service…</option>
                        <optgroup label="Cosmetic & Restorative">
                          <option>Dental Implant Restoration</option>
                          <option>Porcelain Crowns</option>
                          <option>Porcelain Bridges</option>
                          <option>Composite Fillings</option>
                          <option>Dentures / Partial Dentures</option>
                          <option>BruxZir® Crowns</option>
                          <option>Empress® Restorations</option>
                          <option>Inlays &amp; Onlays</option>
                        </optgroup>
                        <optgroup label="Preventive & Orthodontics">
                          <option>Invisalign®</option>
                          <option>Zoom! Whitening</option>
                          <option>New Patient Exam &amp; X-Rays</option>
                          <option>Teeth Cleaning</option>
                          <option>Fluoride Treatment</option>
                          <option>Periodontal Care</option>
                        </optgroup>
                        <option>Cosmetic Consultation</option>
                        <option>Emergency Appointment</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="date">Preferred Date</label>
                      <input id="date" className="field" type="date" name="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.625rem" }}>
                    <label className="field-label" htmlFor="note">Notes / Questions</label>
                    <textarea id="note" className="field" name="note" value={form.note} onChange={handleChange} rows={3} placeholder="Insurance questions, concerns, or anything else we should know…" style={{ resize: "none" }} />
                  </div>

                  <button type="submit" className="btn-green" disabled={submitting} style={{ width: "100%", fontSize: 15, padding: "1.125rem", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Sending…" : "Request My Appointment →"}
                  </button>

                  {submitError && (
                    <p role="alert" style={{ fontSize: 13, color: "#b42318", textAlign: "center", marginTop: "0.875rem", lineHeight: 1.5 }}>
                      We couldn't send your request online. Please call us at{" "}
                      <a href={`tel:${PHONE}`} style={{ color: "#b42318", fontWeight: 700 }}>{PHONE}</a> and we'll get you scheduled.
                    </p>
                  )}

                  <p style={{ fontSize: 12, color: "var(--pebble)", textAlign: "center", marginTop: "1rem" }}>
                    Or call us at{" "}
                    <a href={`tel:${PHONE}`} style={{ color: "var(--green)", fontWeight: 700, textDecoration: "none" }}>{PHONE}</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MOBILE STICKY CTA ═══════════════════════════════ */}
      <div className="mobile-cta-bar" role="region" aria-label="Quick contact">
        <a href={`tel:${PHONE}`} className="mobile-cta-call">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.7 2z"/></svg>
          Call
        </a>
        <a href="#book" className="mobile-cta-book">Book an Appointment →</a>
      </div>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <footer style={{ background: "var(--ink)", padding: "3.5rem 0 2.25rem" }}>
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              {/* Logo on dark — frosted white pill */}
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.96)", borderRadius: 10, padding: "8px 18px", marginBottom: "1.25rem", backdropFilter: "blur(4px)" }}>
                <img
                  src={logoImg}
                  alt="Atlantic Dental Care — Dr. Evelyn E. Luma, DDS"
                  style={{ height: 68, width: "auto", display: "block", objectFit: "contain" }}
                />
              </div>
              <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 13, lineHeight: 1.7, marginBottom: "0.75rem" }}>
                1244 Perimeter Pkwy, Suite 444<br />Virginia Beach, VA 23454
              </p>
              <a href={`tel:${PHONE}`} style={{ color: "var(--green-muted)", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "block", marginBottom: 5 }}>{PHONE}</a>
              <a href={`mailto:${EMAIL}`} style={{ color: "rgba(255,255,255,0.32)", fontSize: 13, textDecoration: "none" }}>{EMAIL}</a>

              {/* ADA + VDA association logos */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
                <div style={{ background: "#fff", borderRadius: 4, padding: "5px 10px" }}>
                  <img src={adaImg} alt="American Dental Association member" style={{ height: 44, width: "auto", display: "block", objectFit: "contain" }} />
                </div>
                <div style={{ background: "#fff", borderRadius: 4, padding: "5px 10px" }}>
                  <img src={vdaImg} alt="Virginia Dental Association member" style={{ height: 44, width: "auto", display: "block", objectFit: "contain" }} />
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1rem" }}>Services</p>
              {["Dental Implant Restoration","Invisalign®","Zoom! Whitening","Porcelain Crowns","Cleanings & Exams","Periodontal Care"].map(s => (
                <a key={s} href="#services" style={{ display: "block", color: "rgba(255,255,255,0.42)", fontSize: 13, textDecoration: "none", marginBottom: "0.5rem" }}>{s}</a>
              ))}
            </div>

            {/* Office */}
            <div>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1rem" }}>Office</p>
              <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 13, marginBottom: 4 }}>Mon–Thu: 8:30 AM – 5:30 PM</p>
              <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 13, marginBottom: "1.25rem" }}>Fri–Sun: Closed</p>
              {[["Disclosure & Nondiscrimination","#disclosure"],["Accessibility Policy","#disclosure"]].map(([label, href]) => (
                <a key={label} href={href} style={{ display: "block", color: "rgba(255,255,255,0.32)", fontSize: 12, textDecoration: "none", marginBottom: "0.4rem" }}>{label}</a>
              ))}
              <a href={privacyPdf} target="_blank" rel="noopener noreferrer" download="Notice_of_Privacy_Practices_2026.pdf"
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.32)", fontSize: 12, textDecoration: "none", marginBottom: "0.4rem" }}>
                <span style={{ background: "#e53935", color: "#fff", fontSize: 8, fontWeight: 800, padding: "1px 4px", borderRadius: 2 }}>PDF</span>
                Notice of Privacy Practices
              </a>
              <a href={grievanceDocx} target="_blank" rel="noopener noreferrer" download="1557_Notice_and_Grievance_Policy.docx"
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.32)", fontSize: 12, textDecoration: "none", marginBottom: "0.4rem" }}>
                <span style={{ background: "#1565c0", color: "#fff", fontSize: 8, fontWeight: 800, padding: "1px 4px", borderRadius: 2 }}>DOC</span>
                Section 1557 Grievance Policy
              </a>
            </div>

            {/* CTA */}
            <div>
              <a href="#book" className="btn-green" style={{ display: "block", width: "100%", marginBottom: "0.625rem" }}>Book an Appointment</a>
              <a href={`tel:${PHONE}`} style={{ display: "block", width: "100%", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)", fontWeight: 500, fontSize: 14, padding: "1rem 1.5rem", borderRadius: 2, textDecoration: "none", textAlign: "center" }}>
                {PHONE}
              </a>
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "1rem", flexWrap: "wrap" }}>
                {["CareCredit Accepted","ADA Member","Se habla español"].map(b => (
                  <span key={b} style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.38)", fontSize: 11, padding: "4px 9px", borderRadius: 2 }}>{b}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.375rem", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, lineHeight: 1.65 }}>
              © {new Date().getFullYear()} Atlantic Dental Care, PLC / Evelyn Luma DDS PLLC · 1244 Perimeter Pkwy Suite 444, Virginia Beach, VA 23454<br />
              Serving Virginia Beach, Chesapeake, Norfolk &amp; all of Hampton Roads · All content protected by copyright. Reproduction strictly prohibited.
            </p>
          </div>
        </div>
      </footer>

      {/* ══ ACCESSIBILITY WIDGET (desktop only) ════════════ */}
      <AccessibilityWidget />

    </div>
  );
}

/* ── Accessibility Widget ─────────────────────────────────── */
type A11yState = {
  invertColors: boolean; monochrome: boolean;
  darkContrast: boolean; lightContrast: boolean;
  lowSaturation: boolean; highSaturation: boolean;
  highlightLinks: boolean; highlightHeadings: boolean;
  screenReader: boolean; readMode: boolean;
  contentScale: number; fontSize: number;
  lineHeight: number; letterSpacing: number;
};

const defaultA11y: A11yState = {
  invertColors: false, monochrome: false,
  darkContrast: false, lightContrast: false,
  lowSaturation: false, highSaturation: false,
  highlightLinks: false, highlightHeadings: false,
  screenReader: false, readMode: false,
  contentScale: 100, fontSize: 100, lineHeight: 100, letterSpacing: 100,
};

const a11yToggles: { key: keyof A11yState; label: string; icon: React.ReactNode }[] = [
  { key: "invertColors",     label: "Invert colors",       icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" stroke="none"/></svg> },
  { key: "monochrome",       label: "Monochrome",          icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
  { key: "darkContrast",     label: "Dark contrast",       icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
  { key: "lightContrast",    label: "Light contrast",      icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
  { key: "lowSaturation",    label: "Low saturation",      icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg> },
  { key: "highSaturation",   label: "High saturation",     icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> },
  { key: "highlightLinks",   label: "Highlight links",     icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
  { key: "highlightHeadings",label: "Highlight headings",  icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M8 8h8M8 16h5"/></svg> },
  { key: "screenReader",     label: "Screen reader",       icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/></svg> },
  { key: "readMode",         label: "Read mode",           icon: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/></svg> },
];

const a11ySliders: { key: "contentScale"|"fontSize"|"lineHeight"|"letterSpacing"; label: string; min: number; max: number }[] = [
  { key: "contentScale",  label: "Content scaling", min: 75, max: 150 },
  { key: "fontSize",      label: "Font size",       min: 75, max: 150 },
  { key: "lineHeight",    label: "Line height",     min: 75, max: 200 },
  { key: "letterSpacing", label: "Letter spacing",  min: 75, max: 200 },
];

function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [a11y, setA11y] = useState<A11yState>(defaultA11y);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const f: string[] = [];
    if (a11y.invertColors)    f.push("invert(1)");
    if (a11y.monochrome)      f.push("grayscale(1)");
    if (a11y.darkContrast)    f.push("contrast(160%) brightness(75%)");
    if (a11y.lightContrast)   f.push("contrast(130%) brightness(115%)");
    if (a11y.lowSaturation)   f.push("saturate(20%)");
    if (a11y.highSaturation)  f.push("saturate(250%)");
    html.style.filter = f.join(" ");

    html.style.fontSize = a11y.fontSize !== 100 ? `${a11y.fontSize}%` : "";
    (html.style as CSSStyleDeclaration & { zoom: string }).zoom = a11y.contentScale !== 100 ? `${a11y.contentScale}%` : "";

    body.style.setProperty("--a11y-lh", a11y.lineHeight    !== 100 ? String(a11y.lineHeight / 100 * 1.6)       : "");
    body.style.setProperty("--a11y-ls", a11y.letterSpacing !== 100 ? `${(a11y.letterSpacing - 100) * 0.002}em` : "");

    body.classList.toggle("a11y-links",    a11y.highlightLinks);
    body.classList.toggle("a11y-headings", a11y.highlightHeadings);
    body.classList.toggle("a11y-read",     a11y.readMode);
    body.classList.toggle("a11y-sr",       a11y.screenReader);

    return () => {
      html.style.filter = "";
      html.style.fontSize = "";
      (html.style as CSSStyleDeclaration & { zoom: string }).zoom = "";
    };
  }, [a11y]);

  const toggle = (key: keyof A11yState) => setA11y(prev => {
    const next = { ...prev, [key]: !prev[key] } as A11yState;
    if (key === "darkContrast"   && next.darkContrast)   next.lightContrast  = false;
    if (key === "lightContrast"  && next.lightContrast)  next.darkContrast   = false;
    if (key === "lowSaturation"  && next.lowSaturation)  next.highSaturation = false;
    if (key === "highSaturation" && next.highSaturation) next.lowSaturation  = false;
    return next;
  });

  const setSlider = (key: "contentScale"|"fontSize"|"lineHeight"|"letterSpacing", val: number) =>
    setA11y(prev => ({ ...prev, [key]: val }));

  const activeBtnStyle: React.CSSProperties = { background: "#0078d4", border: "1px solid #0078d4", borderRadius: 8, padding: "0.625rem 0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", textAlign: "left", width: "100%", color: "#fff", transition: "background 0.15s" };
  const inactiveBtnStyle: React.CSSProperties = { ...activeBtnStyle, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" };
  const smBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" };

  return (
    <div className="a11y-widget" style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999, flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
      <div aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        {a11y.screenReader ? "Screen reader mode active. Use your device screen reader for full functionality." : ""}
      </div>

      {open && (
        <div role="dialog" aria-label="Accessibility options" style={{ background: "#1a1d23", borderRadius: 14, padding: "1.25rem", width: 340, boxShadow: "0 24px 64px rgba(0,0,0,0.55)", maxHeight: "78vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.125rem" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}>Accessibility Options</span>
            <button onClick={() => setA11y(defaultA11y)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>Reset all</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.375rem" }}>
            {a11yToggles.map(t => (
              <button key={t.key as string} onClick={() => toggle(t.key)} style={a11y[t.key] ? activeBtnStyle : inactiveBtnStyle} aria-pressed={!!a11y[t.key]}>
                <span style={{ flexShrink: 0 }}>{t.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.25, fontFamily: "inherit" }}>{t.label}</span>
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: "1.125rem" }} />

          {a11ySliders.map(s => (
            <div key={s.key} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "inherit" }}>{s.label}</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>{a11y[s.key]}%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="range" min={s.min} max={s.max} step={5} value={a11y[s.key] as number}
                  onChange={e => setSlider(s.key, Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#0078d4" }} aria-label={s.label}
                />
                <button onClick={() => setSlider(s.key, Math.max(s.min, (a11y[s.key] as number) - 5))} style={smBtn} aria-label={`Decrease ${s.label}`}>−</button>
                <button onClick={() => setSlider(s.key, Math.min(s.max, (a11y[s.key] as number) + 5))} style={smBtn} aria-label={`Increase ${s.label}`}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setOpen(o => !o)} aria-label="Accessibility options" aria-expanded={open}
        style={{ width: 54, height: 54, borderRadius: "50%", background: "#0078d4", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,120,212,0.45)", transition: "transform 0.15s, box-shadow 0.15s", flexShrink: 0 }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,120,212,0.6)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,120,212,0.45)"; }}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
          {/* Head */}
          <circle cx="12" cy="4" r="2.2" fill="#fff"/>
          {/* Body */}
          <line x1="12" y1="6.2" x2="12" y2="15" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"/>
          {/* Arms — one line across */}
          <line x1="6.5" y1="10.5" x2="17.5" y2="10.5" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"/>
          {/* Left leg */}
          <line x1="12" y1="15" x2="8.5" y2="21" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"/>
          {/* Right leg */}
          <line x1="12" y1="15" x2="15.5" y2="21" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
