// ─────────────────────────────────────────────────────────────
// ALL portfolio content lives here. To update the site, edit this
// file, then `git push` (Vercel redeploys automatically).
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Akhand Raj Singh",
  role: "Full Stack Developer",
  location: "Noida, India",
  // The hook. Short, specific, memorable.
  headline: "I don't just build pages.",
  headlineAccent: "I design systems that hold up under real users.",
  intro:
    "Final-year B.Tech CS student building multi-role, production-minded web products: clean architecture, secure auth, and data that stays where it belongs.",
  email: "akhandrajsingh30@gmail.com",
  phone: "+91 73796 60997",
  github: "https://github.com/Fit-akhand",
  linkedin: "https://linkedin.com/in/akhand-raj-singh",
  resume: "/Akhand_Raj_Singh_Resume.pdf",
  // Warm line shown beside your photo in the contact section.
  contactLine:
    "I reply to every message personally. If you have an idea, a role, or just a question, I'd love to hear it.",
  status: "Open to internships & full-time roles · 2027 batch",
};

export const stats = [
  { value: 1, suffix: "", label: "Product used in a real hostel" },
  { value: 5, suffix: "", label: "RBAC roles in one system" },
  { value: 310, suffix: "+", label: "LeetCode problems solved" },
  { value: 2, suffix: "", label: "Hackathons" },
];

export type Project = {
  title: string;
  tagline: string;
  status: string; // e.g. "In real use", "Live", "Working"
  problem: string;
  highlights: string[];
  // The "how I think" part: the architecture, shown as a flow.
  flow: string[];
  stack: string[];
  role?: string; // your part in a team project
  results?: { value: string; label: string }[]; // measured outcomes
  live?: string; // add the live demo URL here to show the button
  repo?: string; // add the GitHub repo URL here to show the button
};

// Skills that orbit around the hero. Keep ~12, shown on 3 rings.
export const orbit = {
  inner: ["React", "Next.js", "Node.js"],
  middle: ["MongoDB", "TypeScript", "Express", "JWT"],
  outer: ["Python", "Flask", "RAG", "Tailwind", "C++"],
};

export const projects: Project[] = [
  {
    title: "The Hostel Yard",
    tagline: "Hostel management SaaS for owners, landlords, managers, staff and tenants.",
    status: "In real use",
    problem:
      "Hostels run on spreadsheets and phone calls. One platform needed to serve five different roles across many organizations without ever leaking data between them.",
    highlights: [
      "Running in a real hostel today, used by actual staff and tenants, not a demo",
      "Organization-level data isolation with permission-based RBAC across 5 roles",
      "JWT in HTTP-only cookies, Bcrypt, OTP verification, token versioning, expiring hashed reset & invite tokens",
      "Allocation-conflict checks so a bed can never be double-booked, plus a reporting dashboard",
    ],
    flow: ["Properties", "Rooms", "Beds", "Tenants", "Bookings", "Rent", "Payments"],
    stack: ["React.js", "Node.js", "Express.js", "MongoDB", "Mongoose", "JWT", "Bcrypt", "Zod"],
    live: "https://the-hostel-yard-phi.vercel.app/",
    repo: "https://github.com/Fit-akhand/the-hostel-yard",
  },
  {
    title: "NovaCart",
    tagline: "Full-stack e-commerce platform with customer, seller and admin roles.",
    status: "Live",
    problem:
      "A marketplace has to be trusted with money. Prices, payments and stock are all decided on the server, never taken on faith from the browser.",
    highlights: [
      "Razorpay payments verified on the server: HMAC signature check, pending order saved with server-computed prices, a webhook for dropped connections, and atomic stock deduction so stock can never go negative",
      "JWT access and refresh tokens in HttpOnly cookies, bcrypt hashing, and role-based protection on every page and API (customer, seller, admin)",
      "Found and fixed real security holes: client-trusted payment flags and an endpoint that let any user mark an order as paid",
      "Admin dashboard for users, categories, hero banners and the whole catalog; category and subcategory discounts enforced on the server",
      "Split 1,700-line pages into small shared components; light and dark themes with a mobile-first design system",
    ],
    flow: ["Cart", "Delivery", "Payment", "Server verify", "Order + stock"],
    stack: ["Next.js 16", "React 19", "Node.js", "MongoDB", "Mongoose", "Tailwind CSS", "Razorpay", "JWT", "Cloudinary"],
    live: "https://nova-cart-ashy.vercel.app/",
    repo: "https://github.com/Fit-akhand/NovaCart",
  },
  {
    title: "WellMind AI",
    tagline: "A mental wellness web app with a retrieval-backed support chatbot and built-in crisis safety.",
    status: "Working",
    problem:
      "Placement season, career pressure and family problems hit many students, and not everyone can reach a counsellor quickly. The chatbot answers from real therapist-written advice instead of guessing.",
    highlights: [
      "RAG chatbot: each message is matched to the most similar answers from CounselChat (1,477 therapist-answered Q&A records), then an LLM writes an empathetic reply grounded in them",
      "Crisis safety layer: if a message contains self-harm language, the app shows helpline resources instead of a generated reply",
      "Mood tracking, surveys and wellness activities in the same app; works with Mistral-7B-Instruct and Groq, Together or Hugging Face endpoints",
    ],
    flow: ["User message", "Safety check", "MiniLM vector", "FAISS top 3", "LLM reply"],
    results: [
      { value: "84.2%", label: "relevant answer in top 3 (dense retrieval)" },
      { value: "69.2%", label: "TF-IDF baseline" },
      { value: "71.2%", label: "BM25 baseline" },
      { value: "0.79", label: "MRR" },
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "MongoDB", "Python", "Flask", "FAISS", "Sentence-Transformers", "Mistral-7B"],
    live: "",
    repo: "https://github.com/Fit-akhand/WellMind-AI",
  },
];

export const principles = [
  {
    title: "Isolate by default",
    body: "Every record belongs to someone. Data isolation and permissions are designed first, not patched in later.",
  },
  {
    title: "Layers, not spaghetti",
    body: "Route → Controller → Service → Model. Each layer has one job, so the code stays testable and easy to change.",
  },
  {
    title: "Security is a feature",
    body: "HTTP-only cookies, hashed tokens, token versioning, input validation. Treated as product work, not an afterthought.",
  },
  {
    title: "Model the real world",
    body: "Properties → Rooms → Beds → Tenants → Payments. Good schemas mirror reality and reject impossible states.",
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["JavaScript (ES6+)", "TypeScript", "Python", "C++"] },
  { group: "Frontend", items: ["React.js", "Next.js (App Router)", "Tailwind CSS", "HTML5 / CSS3"] },
  { group: "Backend", items: ["Node.js", "Express.js", "Flask", "REST APIs"] },
  { group: "Data", items: ["MongoDB", "Mongoose", "Atlas", "Vector databases"] },
  { group: "Auth & Security", items: ["JWT", "HTTP-only cookies", "Bcrypt", "OTP", "RBAC", "Zod"] },
  { group: "Tools", items: ["Git & GitHub", "Postman", "Cloudinary", "Vercel"] },
  { group: "Fundamentals", items: ["DSA", "OOP", "MVC & layered architecture", "Debugging"] },
  { group: "AI exposure", items: ["LLM integration", "RAG", "NLP"] },
];

export const experience = [
  {
    role: "Backend Developer · Smart India Hackathon",
    when: "Sept – Oct 2025",
    detail:
      "Problem 25010: Smart Crop Advisory System for Small and Marginal Farmers. Designed server-side structure and core flow, built secure auth, and modeled the database.",
  },
  {
    role: "Frontend Developer · Tech Hackathon",
    when: "Nov – Dec 2024",
    detail:
      "JSS Academy of Technical Education. Built responsive UI with React.js, Tailwind CSS and React Router for a service-booking platform under deadline.",
  },
];

export const education = {
  school: "JSS Academy of Technical Education, Noida",
  degree: "B.Tech, Computer Science",
  when: "Expected 2027",
};
