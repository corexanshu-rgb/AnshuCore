import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 150;
const FRAME_PATH = (n) => `/frames/frame-${String(n).padStart(3, "0")}.webp`;

const CHECKPOINTS = [
  { from: 0, to: 0.12, text: "Anshu Core" },
  { from: 0.3, to: 0.48, text: "Software for schools, and everything after." },
  { from: 0.62, to: 0.8, text: "Building the future, one app at a time." },
];

export default function HeroCanvas() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const imagesRef = useRef([]);
  const frameIndexRef = useRef(1);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [overlayText, setOverlayText] = useState("Anshu Core");
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const isMobile = window.matchMedia("(max-width: 640px)").matches;

    // On mobile, load every other frame to keep memory/perf reasonable.
    const step = isMobile ? 2 : 1;
    const frameNumbers = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += step) frameNumbers.push(i);

    let cancelled = false;
    let loadedCount = 0;
    const images = new Array(TOTAL_FRAMES + 1);

    frameNumbers.forEach((n) => {
      const img = new Image();
      img.src = FRAME_PATH(n);
      img.onload = img.onerror = () => {
        if (cancelled) return;
        loadedCount += 1;
        images[n] = img;
        setLoaded(Math.round((loadedCount / frameNumbers.length) * 100));
        if (loadedCount === frameNumbers.length) {
          // Fill gaps (mobile skip) with nearest loaded frame.
          for (let i = 1; i <= TOTAL_FRAMES; i++) {
            if (!images[i]) {
              let j = i;
              while (j > 0 && !images[j]) j--;
              images[i] = images[j] || images[i + 1];
            }
          }
          imagesRef.current = images;
          setReady(true);
        }
      };
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw(frameIndexRef.current);
    }

    function draw(frameNumber) {
      const img = imagesRef.current[frameNumber];
      if (!img) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.width, ch / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    function onScroll() {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / total));

      const frameNumber = reducedMotion
        ? 1
        : Math.min(TOTAL_FRAMES, Math.max(1, Math.round(progress * (TOTAL_FRAMES - 1)) + 1));
      frameIndexRef.current = frameNumber;
      draw(frameNumber);

      const active = CHECKPOINTS.find((c) => progress >= c.from && progress <= c.to);
      if (active) {
        setOverlayText(active.text);
        const mid = (active.from + active.to) / 2;
        const span = (active.to - active.from) / 2;
        const fade = 1 - Math.min(1, Math.abs(progress - mid) / span);
        setOverlayOpacity(fade);
      } else {
        setOverlayOpacity(0);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ready, reducedMotion]);

  return (
    <section ref={sectionRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {!ready && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-ink">
            <div className="font-display text-2xl tracking-tight text-paper animate-pulse">
              Anshu Core
            </div>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-paper/10">
              <div
                className="h-full bg-core-500 transition-all duration-150"
                style={{ width: `${loaded}%` }}
              />
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <h1
            className="max-w-3xl text-center font-display text-4xl font-semibold tracking-tight text-paper transition-opacity duration-200 sm:text-6xl"
            style={{ opacity: ready ? overlayOpacity : 0 }}
          >
            {overlayText}
          </h1>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs font-mono uppercase tracking-widest text-paper/50">
          Scroll
        </div>
      </div>
    </section>
  );
}
