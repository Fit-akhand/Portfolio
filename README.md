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
