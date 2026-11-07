type Props = { email: string; phone: string };

// Three ways to reach me, shown at the bottom of the page.
export default function ContactOptions({ email, phone }: Props) {
  const digits = phone.replace(/\D/g, "");
  const items = [
    { label: "WhatsApp", sub: "Chat with me", icon: "💬", external: true, href: `https://wa.me/${digits}?text=${encodeURIComponent("Hi Akhand, I saw your portfolio.")}` },
    { label: "Email", sub: email, icon: "✉", href: `mailto:${email}` },
    { label: "Call", sub: phone, icon: "☎", href: `tel:+${digits}` },
  ];
  return (
    <div className="c-options">
      {items.map((i) => (
        <a key={i.label} href={i.href} {...(i.external ? { target: "_blank", rel: "noreferrer" } : {})}>
          <span className="ci">{i.icon}</span>
          <span className="ct"><b>{i.label}</b><small>{i.sub}</small></span>
        </a>
      ))}
    </div>
  );
}
