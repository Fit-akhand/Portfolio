"use client";
import { useEffect, useRef, useState } from "react";

// One character: Akhand with headphones. It blinks, its eyes follow the cursor,
// and it hops when you click it.
const SKIN = "#d29c6f";
const SKIN_DARK = "#b07a52";
const HAIR = "#15110f";
const INK = "#1a1210";

function Eye({ x }: { x: number }) {
  return (
    <g className="eye">
      <g className="pupil">
        <ellipse cx={x} cy="44.5" rx="2.4" ry="3" fill={INK} />
        <circle cx={x + 1} cy="43.3" r=".9" fill="#fff" />
      </g>
    </g>
  );
}

function Character() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      {/* blazer, shirt, lapels */}
      <path d="M6 100 C8 78 26 72 50 72 C74 72 92 78 94 100Z" fill="#1d2a52" />
      <path d="M38 73 L50 90 L62 73 L56 71 L50 78 L44 71Z" fill="#ffffff" />
      <path d="M38 73 L31 100 L44 100 L50 90Z" fill="#16203f" />
      <path d="M62 73 L69 100 L56 100 L50 90Z" fill="#16203f" />
      {/* neck, ears, face */}
      <path d="M42 62 H58 V74 Q50 80 42 74Z" fill={SKIN_DARK} />
      <circle cx="29" cy="49" r="4.6" fill={SKIN} />
      <circle cx="71" cy="49" r="4.6" fill={SKIN} />
      <ellipse cx="50" cy="47" rx="21.5" ry="24" fill={SKIN} />
      {/* light beard */}
      <path d="M28.5 51 C29 69 40 73 50 73 C60 73 71 69 71.5 51 C67 62 59 63 50 63 C41 63 33 62 28.5 51Z" fill={HAIR} opacity=".5" />
      {/* swept-up hair */}
      <path d="M27.5 44 C24 22 38 14 52 15 C68 15 78 26 72.5 44 C71 36 68 32 63 30 C58 34 48 33 42 29 C36 31 30 36 27.5 44Z" fill={HAIR} />
      <path d="M44 18 L46 10 L51 17Z M54 17 L58 9 L61 18Z M34 22 L33 14 L41 20Z" fill={HAIR} />
      {/* brows, eyes */}
      <path d="M35 38.5 Q41 35 47 38" stroke={HAIR} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M53 38 Q59 35 65 38.5" stroke={HAIR} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Eye x={42} />
      <Eye x={58} />
      {/* nose, mustache, smile */}
      <path d="M48 47 Q50 52 52.5 49" stroke={SKIN_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M40 55.5 Q45 52 50 54.5 Q55 52 60 55.5 Q55 57.2 50 56.2 Q45 57.2 40 55.5Z" fill={HAIR} />
      <path d="M41 59 Q50 70 59 59 Q50 62.5 41 59Z" fill="#ffffff" stroke="#3b1313" strokeWidth="1.3" strokeLinejoin="round" />
      {/* round glasses */}
      <circle cx="42" cy="44.5" r="7" fill="none" stroke="#2b2b33" strokeWidth="1.8" />
      <circle cx="58" cy="44.5" r="7" fill="none" stroke="#2b2b33" strokeWidth="1.8" />
      <path d="M49 44.5 H51" stroke="#2b2b33" strokeWidth="1.8" />
      {/* headphones */}
      <path d="M26 46 C23 8 77 8 74 46" stroke="#2b2b33" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <rect className="cup" x="20.5" y="42" width="8.5" height="15" rx="3.2" fill="#ff7a1a" />
      <rect className="cup" x="71" y="42" width="8.5" height="15" rx="3.2" fill="#ff7a1a" />
    </svg>
  );
}

export default function Avatar() {
  const btn = useRef<HTMLButtonElement>(null);
  const [hops, setHops] = useState(0);

  // eyes look toward the cursor (skipped for reduced motion)
  useEffect(() => {
    const el = btn.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 220);
        el.style.setProperty("--ex", `${((dx / d) * 1.7 * k).toFixed(2)}px`);
        el.style.setProperty("--ey", `${((dy / d) * 1.4 * k).toFixed(2)}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="avatar-wrap">
      <button ref={btn} className="avatar" onClick={() => setHops((n) => n + 1)} aria-label="Akhand's avatar. Press for a little reaction.">
        <span key={hops} className={hops > 0 ? "av-body hop" : "av-body"}>
          <Character />
        </span>
      </button>
    </div>
  );
}
