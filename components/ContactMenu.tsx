"use client";
import { useEffect, useRef, useState } from "react";

type Props = { email: string; phone: string };

export default function ContactMenu({ email, phone }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const digits = phone.replace(/\D/g, ""); // 917379660997

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { label: "WhatsApp", sub: "Chat with me", href: `https://wa.me/${digits}?text=${encodeURIComponent("Hi Akhand, I saw your portfolio.")}`, external: true, icon: "💬" },
    { label: "Email", sub: email, href: `mailto:${email}`, icon: "✉" },
    { label: "Call", sub: phone, href: `tel:+${digits}`, icon: "☎" },
  ];

  return (
    <div className="cmenu" ref={ref}>
      <button className="btn primary" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        Contact me <span className="caret" style={{ fontSize: 11, opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="cmenu-pop" role="menu">
          {items.map((i) => (
            <a
              key={i.label}
              role="menuitem"
              href={i.href}
              {...(i.external ? { target: "_blank", rel: "noreferrer" } : {})}
              onClick={() => setOpen(false)}
            >
              <span className="ci">{i.icon}</span>
              <span><b>{i.label}</b><small>{i.sub}</small></span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
