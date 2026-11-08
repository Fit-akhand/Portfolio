"use client";
import { useEffect, useRef } from "react";

// A field of tiny dashes. Each one turns toward the cursor and grows/brightens as the
// cursor gets close. With no pointer (touch, idle) a virtual cursor drifts on its own.
type Dot = { x: number; y: number; jx: number; jy: number; seed: number };

export default function CursorField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, small = false, dots: Dot[] = [], raf = 0;
    let color = "255,122,26";
    const target = { x: -9999, y: -9999, active: false };
    const cur = { x: 0, y: 0 };
    let lastMove = 0;

    const readColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      const m = v.match(/^#([0-9a-f]{6})$/i);
      if (m) {
        const n = parseInt(m[1], 16);
        color = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
      }
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      small = w < 720;
      const gap = small ? 56 : 48;
      dots = [];
      for (let y = gap / 2; y < h + gap; y += gap)
        for (let x = gap / 2; x < w + gap; x += gap)
          dots.push({ x, y, jx: (Math.random() - 0.5) * gap * 0.5, jy: (Math.random() - 0.5) * gap * 0.5, seed: Math.random() * 6.28 });
      cur.x = w * 0.6; cur.y = h * 0.4;
    };

    const onMove = (e: PointerEvent) => { target.x = e.clientX; target.y = e.clientY; target.active = true; lastMove = performance.now(); };
    const onLeave = () => { target.active = false; };

    let frame = 0;
    const draw = (t: number) => {
      frame++;
      if (frame % 40 === 0) readColor();
      // idle: a virtual cursor wanders slowly
      const idle = !target.active || t - lastMove > 3500;
      const tx = idle ? w * (0.5 + 0.3 * Math.sin(t / 3200)) : target.x;
      const ty = idle ? h * (0.45 + 0.28 * Math.cos(t / 2700)) : target.y;
      cur.x += (tx - cur.x) * 0.12;
      cur.y += (ty - cur.y) * 0.12;

      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      const sr = small ? 150 : 230;
      const sigma2 = 2 * sr * sr;
      const maxLen = small ? 7 : 12;
      const peak = small ? 0.4 : 0.55;
      for (const d of dots) {
        const bx = d.x + d.jx, by = d.y + d.jy;
        const dx = cur.x - bx, dy = cur.y - by;
        const dist2 = dx * dx + dy * dy;
        const k = Math.exp(-dist2 / sigma2); // 0..1 influence
        const ang = Math.atan2(dy, dx) + (1 - k) * Math.sin(t / 1600 + d.seed) * 0.6;
        const len = 2 + k * maxLen;
        const pull = k * (small ? 6 : 10);
        const dist = Math.sqrt(dist2) || 1;
        const px = bx + (dx / dist) * pull, py = by + (dy / dist) * pull;
        const ca = Math.cos(ang) * len * 0.5, sa = Math.sin(ang) * len * 0.5;
        ctx.strokeStyle = `rgba(${color},${0.06 + k * peak})`;
        ctx.lineWidth = 1 + k * (small ? 0.6 : 1.1);
        ctx.beginPath();
        ctx.moveTo(px - ca, py - sa);
        ctx.lineTo(px + ca, py + sa);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };

    readColor();
    build();
    window.addEventListener("resize", build);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    if (reduce) {
      // single static frame
      const t0 = performance.now();
      draw(t0); cancelAnimationFrame(raf);
    } else raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="cursor-field" />;
}
