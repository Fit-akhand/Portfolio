# Akhand Raj Singh — Portfolio

Next.js (App Router) + Framer Motion. Minimal, dark and light mode (press `T` to toggle).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## How to update the portfolio

**All content lives in one file: `data/content.ts`.** You never need to touch the components.

| I want to… | Edit |
|---|---|
| Add a new project | Add an entry to `projects` |
| Add a live demo / GitHub button | Fill `live: "https://..."` and `repo: "https://..."` on that project (empty = button hidden) |
| Change headline, email, links, status | `profile` |
| Update numbers (LeetCode, etc.) | `stats` |
| Add skills / experience | `skills`, `experience` |
| Replace resume | Replace `public/Akhand_Raj_Singh_Resume.pdf` (same filename) |

## Deploy (free, auto-updates on every push)

1. Push this folder to a GitHub repo:
   ```bash
   git init && git add . && git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/Fit-akhand/portfolio.git
   git push -u origin main
   ```
2. Go to vercel.com → **Add New Project** → import the repo → **Deploy**.
3. From then on: edit `data/content.ts` → `git add . && git commit -m "Update" && git push`. Vercel redeploys automatically.

## Update habits

- After every new project, add it within 10 minutes.
- Every ~3 months, remove weak projects. Quality beats quantity.
- Check that every live link still works.

## AI chat assistant (optional)

The chat button answers questions about the site's content. It works in these modes:

- **Groq (free tier):** set `GROQ_API_KEY`. An open model (default `openai/gpt-oss-120b`) answers using only the facts in `data/content.ts`.
- **Claude (paid):** set `ANTHROPIC_API_KEY` instead. If both keys exist, Groq is used (force one with `AI_PROVIDER=groq` or `claude`).
- **Built-in mode** (no key, or any error / rate limit): a keyword assistant answers locally. The site never breaks.

### Turn on AI mode
1. **Groq (free):** sign up at console.groq.com (no card), then API Keys -> Create API Key (starts with `gsk_`).
   **Claude (paid):** create a key at console.anthropic.com, add credit, and set a **monthly spend limit** there.
2. Locally: copy `.env.example` to `.env.local` and put the key in `GROQ_API_KEY` (or `ANTHROPIC_API_KEY`). Restart `npm run dev`.
3. On Vercel: Project -> Settings -> Environment Variables -> add the same name -> redeploy.
4. Check: open `/api/chat` on your site. You should see `{"ai":true,"provider":"groq"}`.

**Never commit a key or paste it into chat, code or GitHub.** `.env.local` is git-ignored. If a key leaks, delete it in its console and create a new one.

### Limits and abuse protection
- Replies are capped at 500 tokens and messages at 400 characters. Defaults: Groq `openai/gpt-oss-120b` (`GROQ_MODEL` to change; Groq retires models, so if chat suddenly falls back, check its Models page), Claude `claude-haiku-5-5` (`CLAUDE_MODEL`).
- Limits per visitor (`CHAT_IP_LIMIT`) and per day (`CHAT_DAILY_LIMIT`). In-memory limits are per server instance on Vercel, so for shared limits add a free Upstash Redis and set the two `UPSTASH_*` variables.
- Groq's free tier has its own rate limits (see your Groq console). When it is reached, the chat falls back to the built-in assistant automatically.
- The endpoint only accepts requests from the site's own pages.
- The assistant is told to use only the site's facts and to say "ask Akhand directly" when unsure. AI can still make mistakes, so keep `data/content.ts` accurate.
