# Train dashboard

Next.js app that visualizes workout progress from Supabase.

```bash
npm install
npm run dev     # http://localhost:3000 → redirects to /strength
```

Env: reads `SUPABASE_URL`, `SUPABASE_KEY` (or `SUPABASE_ANON_KEY`) and `TRAIN_USER_ID` from the repo-root `.env` (loaded in `next.config.ts`); a local `.env.local` overrides it.

Routes: `/strength` (Upper / Lower / Power views), `/progress/[slug]` (one lift), `/progress/[slug]/[date]` (one session).

See the repo-root `CLAUDE.md` for where things live.
