// Answer engine for the portfolio assistant.
// It is a keyword/intent matcher, not an LLM. Every answer is built from
// data/content.ts, so editing that file updates the bot too.
import { profile, stats, projects, principles, skills, experience, education } from "@/data/content";
import type { Project } from "@/data/content";

export type BotLink = { label: string; href: string };
export type BotReply = { text: string; links?: BotLink[]; chips?: string[] };

export const starterChips = [
  "Tell me about Akhand",
  "Show projects",
  "What are the skills?",
  "Is Akhand available?",
  "How can I contact?",
];

const clean = (s: string) =>
  " " + s.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim() + " ";

// short keywords must match as whole words; longer ones may match inside words (plurals etc.)
const has = (q: string, kw: string) => (kw.length <= 3 ? q.includes(" " + kw + " ") : q.includes(kw));
const word = (q: string, w: string) => q.includes(" " + w + " ");

const digits = profile.phone.replace(/\D/g, "");
export const contactLinks = (): BotLink[] => [
  { label: "WhatsApp", href: `https://wa.me/${digits}?text=${encodeURIComponent("Hi Akhand, I saw your portfolio.")}` },
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "Call", href: `tel:+${digits}` },
];

const projectChips = projects.map((p) => p.title);

/* ───────── project answers ───────── */
const SEC_Q = /secur|auth|jwt|token|hmac|payment|razorpay|rbac|login|safe/;
const SEC_H = /jwt|auth|security|hmac|token|rbac|isolation|verified|payment|safety/i;

function projectReply(p: Project, q = ""): BotReply {
  // a security/payment question about a specific project gets the matching highlights first
  const focused = SEC_Q.test(q) ? p.highlights.filter((h) => SEC_H.test(h)) : [];
  if (focused.length) {
    const links: BotLink[] = [];
    if (p.repo) links.push({ label: "Source code", href: p.repo });
    if (p.live) links.push({ label: "Live demo", href: p.live });
    return {
      text: `**${p.title}: security & payments**\n` + focused.map((h) => "• " + h).join("\n"),
      links,
      chips: [`More about ${p.title}`, ...projectChips.filter((t) => t !== p.title)],
    };
  }
  const lines = [`**${p.title}** · ${p.status}`, p.tagline, "", p.problem, "", ...p.highlights.slice(0, 3).map((h) => "• " + h)];
  if (p.results?.length) lines.push("", "Results: " + p.results.map((r) => `${r.value} ${r.label}`).join(" · "));
  lines.push("", "Stack: " + p.stack.join(", "));
  const links: BotLink[] = [];
  if (p.live) links.push({ label: "Live demo", href: p.live });
  if (p.repo) links.push({ label: "Source code", href: p.repo });
  return {
    text: lines.join("\n"),
    links,
    chips: [...projectChips.filter((t) => t !== p.title), "Security & auth work"],
  };
}

const projectKeywords: Record<string, string[]> = {
  "the hostel yard": ["hostel", "yard", "tenant", "landlord", "rent", "booking", "property", "saas", "pg", "payroll", "upi", "utr", "attendance", "receipt", "scheduler", "late fee", "bank statement", "occupancy", "twilio"],
  novacart: ["nova", "cart", "ecommerce", "e-commerce", "commerce", "marketplace", "razorpay", "shop", "seller", "checkout"],
  "wellmind ai": ["wellmind", "well mind", "mental", "wellness", "therap", "rag", "faiss", "llm", "counsel", "emotion", "mistral", "embedding", "retrieval", "helpline", "ai"],
};

/** Titles of the projects a piece of text is about (used to keep AI prompts small). */
export function matchedProjects(text: string): string[] {
  const q = clean(text);
  return projects
    .filter((p) => (projectKeywords[p.title.toLowerCase()] ?? [p.title.toLowerCase()]).some((k) => has(q, k)))
    .map((p) => p.title);
}

/* ───────── tech questions ───────── */
const TECH = [
  { name: "React", al: ["react", "reactjs", "react.js"], key: "react" },
  { name: "Next.js", al: ["next.js", "nextjs", "next js"], key: "next.js" },
  { name: "Node.js", al: ["node", "node.js", "nodejs"], key: "node.js" },
  { name: "Express", al: ["express", "expressjs", "express.js"], key: "express" },
  { name: "MongoDB", al: ["mongo", "mongodb", "mongoose"], key: "mongo" },
  { name: "TypeScript", al: ["typescript", "ts"], key: "typescript" },
  { name: "JavaScript", al: ["javascript", "js", "es6"], key: "javascript" },
  { name: "Python", al: ["python"], key: "python" },
  { name: "Flask", al: ["flask"], key: "flask" },
  { name: "C++", al: ["c++", "cpp"], key: "c++" },
  { name: "Tailwind CSS", al: ["tailwind", "tailwindcss"], key: "tailwind" },
  { name: "JWT", al: ["jwt"], key: "jwt" },
  { name: "Razorpay", al: ["razorpay"], key: "razorpay" },
  { name: "Cloudinary", al: ["cloudinary"], key: "cloudinary" },
  { name: "FAISS", al: ["faiss"], key: "faiss" },
  { name: "Zod", al: ["zod"], key: "zod" },
  { name: "Bcrypt", al: ["bcrypt"], key: "bcrypt" },
  { name: "Vercel", al: ["vercel"], key: "vercel" },
  { name: "Postman", al: ["postman"], key: "postman" },
];
const NOT_LISTED = [
  "java", "angular", "vue", "docker", "aws", "kubernetes", "django", "spring", "golang", "rust", "postgres",
  "postgresql", "mysql", "sql", "graphql", "redux", "php", "swift", "kotlin", "flutter", "c#", "ruby", "laravel",
  "firebase", "supabase", "prisma",
];

function techReply(q: string): BotReply | null {
  const hit = TECH.filter((t) => t.al.some((a) => word(q, a)));
  if (hit.length) {
    const lines = hit.map((t) => {
      const used = projects.filter((p) => (p.stack.join(" ") + " " + p.highlights.join(" ")).toLowerCase().includes(t.key));
      const groups = skills.filter((g) => g.items.some((i) => i.toLowerCase().includes(t.key))).map((g) => g.group);
      let s = `• **${t.name}**`;
      if (groups.length) s += ` is in Akhand's toolbox (${groups.join(", ")})`;
      else s += ` shows up in Akhand's project work`;
      if (used.length) s += `. Used in: ${used.map((p) => p.title).join(", ")}`;
      return s + ".";
    });
    return { text: lines.join("\n"), chips: projectChips.slice(0, 3).concat("What are the skills?") };
  }
  const miss = NOT_LISTED.filter((t) => word(q, t));
  if (miss.length) {
    return {
      text: `I don't see ${miss.join(", ")} listed in Akhand's skills or projects.\n\nThe toolbox covers: ${skills
        .slice(0, 5)
        .map((g) => g.items[0])
        .join(", ")} and more. For anything not listed, the best move is to ask Akhand directly.`,
      links: contactLinks(),
      chips: ["What are the skills?", "Show projects"],
    };
  }
  return null;
}

/* ───────── intents ───────── */
type Intent = { id: string; kw: string[]; reply: (q: string) => BotReply };

const intents: Intent[] = [
  {
    id: "greet",
    kw: ["hi", "hii", "hello", "hey", "namaste", "hola", "yo", "good morning", "good evening", "good afternoon"],
    reply: () => ({
      text: "Hi! I'm Akhand's portfolio assistant. Ask me about projects, skills, experience, or how to get in touch.",
      chips: starterChips,
    }),
  },
  {
    id: "thanks",
    kw: ["thanks", "thank you", "thx", "shukriya", "dhanyavad", "awesome", "great job"],
    reply: () => ({ text: "You're welcome! Anything else you'd like to know about Akhand's work?", chips: starterChips.slice(0, 3) }),
  },
  {
    id: "smalltalk",
    kw: ["how are you", "how r u", "whats up", "what's up", "how is it going", "how are things"],
    reply: () => ({
      text: "Doing well, thanks for asking! I'm here to help with questions about Akhand's work. What would you like to know?",
      chips: starterChips,
    }),
  },
  {
    id: "bye",
    kw: ["bye", "goodbye", "see you ", "tata", "take care"],
    reply: () => ({ text: "Thanks for stopping by! If you'd like to talk, Akhand is a message away.", links: contactLinks() }),
  },
  {
    id: "meta",
    kw: ["this chatbot", "this bot", "this assistant", "are you ai", "are you a bot", "are you real", "how do you work", "how does this work", "this website", "this site", "this portfolio", "built with", "made with", "who made you", "who built you", "chatgpt", "gpt", "claude"],
    reply: () => ({
      text: "This portfolio is built with Next.js, React, TypeScript and Framer Motion, with a dark/light theme and a canvas particle field.\n\nI'm a lightweight keyword-based assistant, not a large language model. My answers come straight from the content of this site, and nothing you type leaves your browser.",
      chips: ["Show projects", "How can I contact?"],
    }),
  },
  ...projects.map<Intent>((p) => ({
    id: p.title,
    kw: projectKeywords[p.title.toLowerCase()] ?? [p.title.toLowerCase()],
    reply: (q) => projectReply(p, q),
  })),
  {
    id: "capable",
    kw: ["capable", "capability", "competent", "able to", "can akhand", "can he", "can she", "can they", "real world", "real-world", "production", "ready for", "deliver", "reliable", "good enough", "suitable", "trust", "handle", "build for me", "build an app", "build a website"],
    reply: () => ({
      text:
        "Yes, and there's proof rather than promises:\n" +
        projects.map((p) => `• **${p.title}** (${p.status}): ${p.highlights[0]}`).join("\n") +
        "\n\nAlso worked in team settings under deadlines: " +
        experience.map((e) => e.role).join(" and ") +
        ".",
      links: [
        ...projects.filter((p) => p.live).map((p) => ({ label: `${p.title} demo`, href: p.live as string })),
        { label: "See all work", href: "#work" },
      ],
      chips: ["Security & auth work", "Why hire Akhand?", "Is Akhand available?"],
    }),
  },
  {
    id: "why",
    kw: ["why hire", "why should", "strength", "best at", "special", "unique", "stand out", "impressive", "proud", "achievement", "highlight", "accomplish", "good developer", "worth hiring"],
    reply: () => ({
      text:
        "A few reasons Akhand stands out:\n" +
        principles.map((p) => `• **${p.title}:** ${p.body}`).join("\n") +
        "\n\nProof, not promises: " +
        stats.map((s) => `${s.value}${s.suffix} ${s.label.toLowerCase()}`).join(" · ") +
        ".",
      links: [{ label: "See the work", href: "#work" }],
      chips: ["Show projects", "Is Akhand available?"],
    }),
  },
  {
    id: "security",
    kw: ["secure", "security", "auth", "jwt", "login", "token", "hmac", "rbac", "permission", "encrypt", "bcrypt", "otp", "payment safety", "protect"],
    reply: () => {
      const hits = projects.flatMap((p) =>
        p.highlights.filter((h) => /jwt|auth|security|hmac|token|rbac|isolation|verified/i.test(h)).map((h) => `• **${p.title}:** ${h}`)
      );
      return {
        text: "Security is treated as product work. Here's what Akhand has built:\n" + hits.join("\n"),
        chips: projectChips,
      };
    },
  },
  {
    id: "architecture",
    kw: ["architecture", "how do you think", "principle", "approach", "philosophy", "design pattern", "clean code", "layer", "mvc", "how does akhand think", "how akhand thinks"],
    reply: () => ({
      text: "How Akhand approaches building software:\n" + principles.map((p) => `• **${p.title}:** ${p.body}`).join("\n"),
      links: [{ label: "How I think", href: "#thinking" }],
      chips: ["Show projects", "Security & auth work"],
    }),
  },
  {
    id: "leetcode",
    kw: ["leetcode", "dsa", "algorithm", "data structure", "problem solving", "competitive", "coding problems", "problems solved"],
    reply: () => {
      const lc = stats.find((s) => /leetcode/i.test(s.label));
      const fund = skills.find((g) => g.group === "Fundamentals");
      return {
        text: `${lc ? `${lc.value}${lc.suffix} LeetCode problems solved. ` : ""}Fundamentals include ${fund ? fund.items.join(", ") : "DSA and OOP"}.`,
        links: [{ label: "GitHub", href: profile.github }],
        chips: ["What are the skills?", "Show projects"],
      };
    },
  },
  {
    id: "experience",
    kw: ["experience", "hackathon", "sih", "smart india", "worked", "employment", "career", "crop", "work history"],
    reply: () => ({
      text: experience.map((e) => `**${e.role}** (${e.when})\n${e.detail}`).join("\n\n"),
      chips: ["Show projects", "Education"],
    }),
  },
  {
    id: "education",
    kw: ["education", "college", "university", "degree", "btech", "b.tech", "study", "studying", "graduat", "batch", "school", "padhai", "qualification", "jss", "student"],
    reply: () => ({
      text: `${education.degree} at ${education.school} (${education.when}).\n\n${profile.status}`,
      chips: ["Hackathons & experience", "Is Akhand available?"],
    }),
  },
  {
    id: "resume",
    kw: ["resume", "cv", "curriculum"],
    reply: () => ({
      text: "Here's the resume. It opens as a PDF.",
      links: [{ label: "Open resume", href: profile.resume }],
      chips: ["How can I contact?", "Show projects"],
    }),
  },
  {
    id: "availability",
    kw: ["available", "availability", "open to", "opportunit", "job", "full-time", "full time", "internship", "freelance", "joining", "notice period", "looking for", "recruit", "hire", "hiring"],
    reply: () => ({
      text: `${profile.status}.\n\nIf you have a role, an internship or a project in mind, Akhand would be glad to hear about it.`,
      links: contactLinks(),
      chips: ["Why hire Akhand?", "Open resume"],
    }),
  },
  {
    id: "contact",
    kw: ["contact", "reach", "email", "mail", "phone", "call", "number", "whatsapp", "message", "connect", "get in touch", "talk", "dm"],
    reply: () => ({
      text: `You can reach Akhand here:\n• Email: ${profile.email}\n• Phone / WhatsApp: ${profile.phone}`,
      links: contactLinks(),
      chips: ["Open resume", "Is Akhand available?"],
    }),
  },
  {
    id: "links",
    kw: ["github", "linkedin", "social", "profile link", "repo", "source code", "repository"],
    reply: () => ({
      text: "Here are the profiles and code:",
      links: [
        { label: "GitHub", href: profile.github },
        { label: "LinkedIn", href: profile.linkedin },
        ...projects.filter((p) => p.repo).map((p) => ({ label: `${p.title} code`, href: p.repo as string })),
      ],
      chips: ["Show projects"],
    }),
  },
  {
    id: "location",
    kw: ["location", "located", "city", "based", "noida", "lives", "live in", "reside", "kahan", "kaha", "country"],
    reply: () => ({ text: `Akhand is based in ${profile.location}.`, chips: ["Is Akhand available?", "How can I contact?"] }),
  },
  {
    id: "skills",
    kw: ["skill", "tech stack", "technolog", "stack", "languages", "tools", "toolbox", "expertise", "good at", "mern", "full stack", "fullstack", "frontend", "backend", "front end", "back end", "database"],
    reply: () => ({
      text: skills.map((g) => `**${g.group}:** ${g.items.join(", ")}`).join("\n"),
      links: [{ label: "See toolbox", href: "#skills" }],
      chips: ["Show projects", "Security & auth work"],
    }),
  },
  {
    id: "projects",
    kw: ["project", "products", "apps", "showcase", "selected work", "what has", "made", "created", "portfolio work", "work samples"],
    reply: () => ({
      text:
        "Akhand's main projects:\n" +
        projects.map((p) => `• **${p.title}** (${p.status}): ${p.tagline}`).join("\n") +
        "\n\nPick one to dive in.",
      links: [{ label: "See all work", href: "#work" }],
      chips: projectChips,
    }),
  },
  {
    id: "about",
    kw: ["who is akhand", "who is he", "who is this", "who are you", "about", "yourself", "introduce", "intro", "tell me about", "kaun", "background", "summary", "describe", "overview"],
    reply: () => ({
      text:
        `**${profile.name}** is a ${profile.role} based in ${profile.location}.\n\n${profile.intro}\n\n` +
        stats.map((s) => `• ${s.value}${s.suffix} ${s.label.toLowerCase()}`).join("\n"),
      chips: ["Show projects", "What are the skills?", "Is Akhand available?"],
    }),
  },
];

/* things a portfolio bot should not guess about */
const DECLINE = ["expected salary", "salary expectation", "your salary", "his salary", "her salary", "their salary", "akhand salary", "akhands salary", "current salary", "ctc", "expected pay", "age", "girlfriend", "boyfriend", "married", "relationship", "religion", "politic", "caste", "home address", "family", "income"];

/* HR questions whose answers aren't on the site: point to Akhand instead of guessing */
const HR_DIRECT = [
  "weakness", "relocate", "relocation", "notice period", "when can you join", "when can he join", "when can akhand join",
  "joining date", "5 years", "five years", "career goal", "why do you want", "why this job", "why this role", "why this company",
  " visa ", "work authorization", "gap year", "backlog", "cgpa", "percentage", " marks ",
];

export function answer(input: string): BotReply {
  const q = clean(input);

  if (HR_DIRECT.some((d) => has(q, d))) {
    return {
      text: `That one is best answered by Akhand directly, since the site doesn't cover it. What is on record: ${profile.status}.`,
      links: contactLinks(),
      chips: ["Why hire Akhand?", "Show projects"],
    };
  }

  if (DECLINE.some((d) => has(q, d))) {
    return {
      text: "That's not something I have information on, and it's better coming from Akhand directly.",
      links: contactLinks(),
      chips: ["Show projects", "Is Akhand available?"],
    };
  }

  // just the name, e.g. "akhand" or "akhand raj singh"
  if (q.replace(/akhand|raj|singh/g, "").trim() === "") return intents.find((i) => i.id === "about")!.reply(q);

  let best: Intent | null = null;
  let bestScore = 0;
  for (const it of intents) {
    const score = it.kw.reduce((n, k) => n + (has(q, k) ? 1 : 0), 0);
    if (score > bestScore) { best = it; bestScore = score; }
  }

  // specific technology questions ("does Akhand know React?")
  const tech = techReply(q);
  if (tech && bestScore < 2) return tech;

  if (best) return best.reply(q);

  return {
    text: "I only answer questions about Akhand: projects, skills, experience, education and how to get in touch. General questions are outside what I can help with. Try one of these:",
    chips: starterChips,
  };
}

/** Turns the AI's text into a reply: strips markdown bullets and expands [[contact]] / [[work]] into buttons. */
export function parseAiReply(raw: string): BotReply {
  const links: BotLink[] = [];
  if (/\[\[contact\]\]/i.test(raw)) links.push(...contactLinks());
  if (/\[\[work\]\]/i.test(raw)) links.push({ label: "See the work", href: "#work" });
  const text = raw
    .replace(/\[\[(contact|work)\]\]/gi, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/^#+\s*/gm, "")
    .trim();
  return { text, links, chips: ["Show projects", "How can I contact?", "Why hire Akhand?"] };
}
