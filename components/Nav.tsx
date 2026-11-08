"use client";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

const sections = ["work", "thinking", "skills", "contact"];

export default function Nav() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [active, setActive] = useState("");

  function flip() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
  }

  useEffect(() => {
    setTheme((document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark");
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey && !["INPUT", "TEXTAREA"].includes(t.tagName)) flip();
    };
    window.addEventListener("keydown", onKey);

    const els = sections.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => window.scrollY < 200 && setActive("");
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const cls = (id: string, extra = "") => `${extra} ${active === id ? "active" : ""}`.trim();

  return (
    <nav>
      <div className="wrap">
        <div className="brand">
          <Avatar />
          <a href="#top" className="logo">akhand<span>.</span>dev</a>
        </div>
        <div className="links">
          <a href="#work" className={cls("work", "hide-m")}>Work</a>
          <a href="#thinking" className={cls("thinking", "hide-m")}>Thinking</a>
          <a href="#skills" className={cls("skills", "hide-m")}>Skills</a>
          <a href="#contact" className={cls("contact")}>Contact</a>
          <button className="toggle" onClick={flip} aria-label="Toggle theme" title="Toggle theme (T)">
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </nav>
  );
}
