document.getElementById("year").textContent = new Date().getFullYear();

// Depth reveal: each block comes from the back to the front as it enters the screen; siblings follow one after another
(() => {
  if (!("IntersectionObserver" in window)) return;
  const targets = document.querySelectorAll(
    ".hero-text > *, main .eyebrow, main h2, .role, .section-lead, .questions li, .card, .features li, .bullets li, .split-img, .cta .btn"
  );
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  for (const el of targets) {
    const siblings = [...el.parentElement.children].filter((s) => s.matches(".card, .features li, .questions li, .bullets li, .hero-text > *"));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty("--d", Math.min(i, 6) * 0.12 + "s");
    el.classList.add("reveal");
    observer.observe(el);
  }
})();

// Preloader: the bar follows the images that load up front and reaches 100 % when the page is complete
(() => {
  const root = document.documentElement;
  const preloader = document.querySelector(".preloader");
  if (!preloader || !root.classList.contains("is-loading")) return;
  // Always start at the top so the hero entrance is seen, unless the link points to a section
  if (!location.hash) {
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
  }
  const bar = document.getElementById("preloader-bar");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const minTime = reduced ? 0 : 1400; // long enough to see the count, even when everything is cached
  const start = performance.now();

  const images = [...document.images].filter((img) => img.loading !== "lazy");
  let loaded = 0;
  let pageDone = false;
  let shown = 0;
  for (const img of images) {
    if (img.complete) { loaded++; continue; }
    const count = () => {
      loaded++;
      img.removeEventListener("load", count);
      img.removeEventListener("error", count);
    };
    img.addEventListener("load", count);
    img.addEventListener("error", count);
  }

  const finish = () => {
    root.classList.remove("is-loading");
    root.classList.add("is-ready");
    preloader.classList.add("is-done");
  };

  const tick = (now) => {
    const real = pageDone ? 1 : 0.9 * (images.length ? loaded / images.length : 1);
    const time = minTime ? Math.min(1, (now - start) / minTime) : 1;
    // Never runs ahead of what has really loaded, nor faster than the minimum time
    const target = Math.min(real, time) * 100;
    shown += Math.max(0.6, (target - shown) * 0.12);
    shown = Math.min(shown, target);
    bar.style.width = shown + "%";
    if (shown >= 100) setTimeout(finish, 250);
    else requestAnimationFrame(tick);
  };

  if (document.readyState === "complete") pageDone = true;
  else addEventListener("load", () => (pageDone = true), { once: true });
  setTimeout(() => (pageDone = true), 8000); // never keep the page hidden on a slow connection
  requestAnimationFrame(tick);
})();

// Motion while scrolling: blue sparks in the hero, the hero zooms into the chart, and the images float a little
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const dust = document.querySelector(".hero-dust");
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("i");
    const r = (min, max) => min + Math.random() * (max - min);
    p.style.cssText = `--x:${r(2, 98)}%;--s:${r(2, 5)}px;--t:${r(7, 14)}s;--d:${r(0, 8)}s;--dx:${r(-40, 40)}px`;
    dust?.append(p);
  }

  const media = document.querySelector(".hero-media");
  const spacer = document.querySelector(".hero-spacer");
  const imgs = document.querySelectorAll(".split-img img");
  let queued = false;
  const update = () => {
    queued = false;
    const vh = innerHeight;
    if (media && spacer) {
      const p = Math.min(1, Math.max(0, scrollY / spacer.offsetHeight)); // 0 at the top, 1 when the pin ends
      const ease = p * p * (3 - 2 * p);
      media.style.setProperty("--hz", (1 + ease * 2.4).toFixed(3));
      media.style.setProperty("--ho", (p < 0.75 ? 1 : 1 - (p - 0.75) * 2.8).toFixed(3));
    }
    for (const img of imgs) {
      const box = img.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) continue;
      const offset = (box.top + box.height / 2 - vh / 2) / vh; // -1 … 1 around the middle of the screen
      img.style.setProperty("--py", (offset * -36).toFixed(1) + "px");
    }
  };
  addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener("resize", update);
  update();
})();

// Every «Quiero empezar» button opens the registration link set in <meta name="registro">
const registro = document.querySelector('meta[name="registro"]')?.content.trim();
if (registro) {
  for (const link of document.querySelectorAll(".js-registro")) {
    link.href = registro;
    link.target = "_blank";
    link.rel = "noopener";
  }
}
