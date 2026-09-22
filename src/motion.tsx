/*
 * Site motion system — the "depth" layer.
 *
 *  1. Smooth inertial scrolling (Lenis) so every scroll-driven effect feels
 *     continuous instead of stepped.
 *  2. Reveal-on-enter: anything with class `rv` fades/rises in the first time
 *     it scrolls into view. Stagger siblings with an inline `--d` delay.
 *  3. Parallax windows: a `pw` frame clips its first child image, which slides
 *     and breathes inside the frame at a different rate than the page.
 *     `data-amp="0.4"` softens the effect (used for contain-fit photos).
 *  4. Custom cursor: a brand dot plus a lagging ring. Mouse-only — never shown
 *     on touch devices — and it grows over links and photos.
 *
 * Everything here is skipped for prefers-reduced-motion. Without JS (or with
 * reduced motion) the page renders fully static via the `html.motion` gate
 * in index.css.
 */
import { useEffect } from "react";
import Lenis from "lenis";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer   = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* ── Scroll motion: smooth scroll + reveals + parallax windows ───────── */
export function useScrollMotion() {
  useEffect(() => {
    const html = document.documentElement;
    if (reducedMotion()) return;
    html.classList.add("motion");

    // 1. Smooth scroll. Native touch scrolling is left alone (Lenis default).
    //    Anchor links get the eased scroll too, offset for the fixed nav.
    const lenis = new Lenis({ autoRaf: true, lerp: 0.07, anchors: { offset: -88 } });

    // 2. Reveal-on-enter. A MutationObserver picks up cards that mount later
    //    (service tab switches, reviews arriving from the API).
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    const observeWithin = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>(".rv:not(.is-in)").forEach(el => io.observe(el));
    observeWithin(document);
    const mo = new MutationObserver(muts => {
      for (const m of muts) m.addedNodes.forEach(n => {
        if (!(n instanceof HTMLElement)) return;
        if (n.matches(".rv:not(.is-in)")) io.observe(n);
        observeWithin(n);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // 3. Parallax windows. Progress p runs 0 → 1 as the frame travels from
    //    below the viewport to above it; the image slides the opposite way.
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>(".pw").forEach(frame => {
        const img = frame.firstElementChild as HTMLElement | null;
        if (!img) return;
        const r = frame.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        const amp = parseFloat(frame.dataset.amp ?? "1");
        const p = clamp01((vh - r.top) / (vh + r.height));
        const y = (0.5 - p) * 22 * amp;          // +11% → -11% of the image height
        const s = 1 + 0.22 * amp;                // headroom so the slide never shows an edge
        // Written as custom properties so CSS can layer a hover zoom on top (see .pw in index.css)
        img.style.setProperty("--py", `${y.toFixed(2)}%`);
        img.style.setProperty("--ps", s.toFixed(3));
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      lenis.destroy();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      html.classList.remove("motion");
    };
  }, []);
}

/* ── Custom cursor ───────────────────────────────────────────────────── */
export function Cursor() {
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const html = document.documentElement;

    const dot = document.createElement("div");
    dot.className = "cur-dot";
    dot.innerHTML = "<i></i>";
    const ring = document.createElement("div");
    ring.className = "cur-ring";
    ring.innerHTML = "<i><span>View</span></i>";
    document.body.append(dot, ring);
    html.classList.add("has-cursor");

    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0, shown = false;
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform  = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const setMode = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      // The accessibility panel applies CSS filters to <html>, which turns it
      // into the containing block for fixed elements and breaks tracking —
      // fall back to the native cursor while any filter is active.
      const broken = html.style.filter !== "";
      const native = !!el?.closest("input, textarea, iframe, [data-cursor='native']");
      const view   = !!el?.closest("[data-cursor='view']");
      const link   = !view && !!el?.closest("a, button, summary, label, select, [role='button']");
      html.classList.toggle("cursor-off",  broken || native);
      html.classList.toggle("cursor-link", link);
      html.classList.toggle("cursor-view", view);
    };

    const onMove  = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; rx = mx; ry = my; html.classList.add("cursor-on"); }
    };
    const onOver  = (e: MouseEvent) => setMode(e.target);
    const onLeave = () => { shown = false; html.classList.remove("cursor-on"); };
    const onDown  = () => html.classList.add("cursor-down");
    const onUp    = () => html.classList.remove("cursor-down");

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("mouseup", onUp, { passive: true });
    html.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      html.removeEventListener("mouseleave", onLeave);
      dot.remove(); ring.remove();
      html.classList.remove("has-cursor", "cursor-on", "cursor-off", "cursor-link", "cursor-view", "cursor-down");
    };
  }, []);
  return null;
}
