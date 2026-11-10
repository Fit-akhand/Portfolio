"use client";
import { useEffect, useRef, useState } from "react";
import { answer, starterChips, parseAiReply, type BotLink, type BotReply } from "@/lib/bot";

type Msg = { id: number; role: "bot" | "user"; text: string; links?: BotLink[]; chips?: string[] };

// tiny formatter: "• " bullets, **bold**, blank lines
function Text({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        if (line === "") return <div key={i} className="b-gap" />;
        const bullet = line.startsWith("• ");
        const body = bullet ? line.slice(2) : line;
        const parts = body.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? <b key={j}>{p.slice(2, -2)}</b> : <span key={j}>{p}</span>
        );
        return <div key={i} className={bullet ? "b-li" : "b-line"}>{parts}</div>;
      })}
    </>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 0,
      role: "bot",
      text: "Hi! I'm Akhand's portfolio assistant. Ask me about projects, skills, experience, or how to get in touch.",
      chips: starterChips,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [ai, setAi] = useState<boolean | null>(null); // null = not checked yet
  const [provider, setProvider] = useState<"groq" | "claude" | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const idRef = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  useEffect(() => {
    if (open && ai === null) {
      fetch("/api/chat")
        .then((r) => r.json())
        .then((d: { ai?: boolean; provider?: "groq" | "claude" | null }) => {
          setAi(Boolean(d.ai));
          setProvider(d.provider ?? null);
        })
        .catch(() => setAi(false));
    }
  }, [open, ai]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); fabRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(timer.current); };
  }, []);

  async function askAi(history: { role: "user" | "assistant"; content: string }[]): Promise<BotReply | null> {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 25000);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      });
      if (!r.ok) {
        if (r.status === 503) setAi(false);
        return null;
      }
      const data = (await r.json()) as { reply?: string };
      return data.reply ? parseAiReply(data.reply) : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function send(raw: string) {
    const t = raw.trim();
    if (!t || typing) return;
    const history = [...msgs.map((m) => ({ role: (m.role === "bot" ? "assistant" : "user") as "user" | "assistant", content: m.text })), { role: "user" as const, content: t }];
    setMsgs((m) => [...m, { id: idRef.current++, role: "user", text: t }]);
    setInput("");
    setTyping(true);

    let reply: BotReply | null = null;
    if (ai !== false) reply = await askAi(history); // AI first
    if (!reply) {
      // AI off, busy or failed: the built-in keyword assistant still answers
      reply = answer(t);
      await new Promise((res) => { timer.current = setTimeout(res, 420 + Math.min(reply!.text.length * 2.5, 650)); });
    }
    const final = reply;
    setMsgs((m) => [...m, { id: idRef.current++, role: "bot", ...final }]);
    setTyping(false);
  }

  const lastBotId = [...msgs].reverse().find((m) => m.role === "bot")?.id;

  return (
    <>
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Akhand's portfolio assistant">
          <div className="chat-head">
            <img src="/akhand.jpg" alt="" />
            <div className="t">
              <b>Ask about Akhand</b>
              <small>{ai ? `AI assistant · powered by ${provider === "groq" ? "Groq" : "Claude"}` : "Portfolio assistant · replies instantly"}</small>
            </div>
            <button className="chat-x" onClick={() => { setOpen(false); fabRef.current?.focus(); }} aria-label="Close chat">✕</button>
          </div>

          <div className="chat-log" ref={logRef} aria-live="polite">
            {msgs.map((m) => (
              <div key={m.id} className={`msg ${m.role}`}>
                <Text text={m.text} />
                {m.links && m.links.length > 0 && (
                  <div className="bchips">
                    {m.links.map((l) => (
                      <a
                        key={l.label + l.href}
                        className="bchip"
                        href={l.href}
                        {...(l.href.startsWith("#") ? { onClick: () => setOpen(false) } : { target: "_blank", rel: "noreferrer" })}
                      >
                        {l.label} {l.href.startsWith("#") ? "↓" : "↗"}
                      </a>
                    ))}
                  </div>
                )}
                {m.role === "bot" && m.id === lastBotId && m.chips && m.chips.length > 0 && !typing && (
                  <div className="bchips">
                    {m.chips.map((c) => (
                      <button key={c} className="bchip" onClick={() => send(c)}>{c}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && <div className="typing" aria-label="Assistant is typing"><i /><i /><i /></div>}
          </div>

          <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about projects, skills…"
              aria-label="Your question"
              maxLength={200}
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || typing} aria-label="Send">Send</button>
          </form>
          <div className="chat-note">
            {ai
              ? `Replies are written by an AI using this site's content. Your messages are sent to ${provider === "groq" ? "Groq" : "Anthropic"} to generate replies, so please don't share sensitive info.`
              : "Answers come from this site's content. Nothing leaves your browser."}
          </div>
        </div>
      )}

      <button
        ref={fabRef}
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Ask about Akhand"}
      >
        <span className="spark">{open ? "✕" : "✦"}</span>
        <span className="lbl">{open ? "Close" : "Ask about me"}</span>
        {!open && <span className="ping" />}
      </button>
    </>
  );
}
