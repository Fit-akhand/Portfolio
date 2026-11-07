"use client";

// Card with a soft glow that follows the cursor.
export default function Spotlight({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="project"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </article>
  );
}
