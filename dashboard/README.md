# Analyst

Progress dashboard for Andy Lee's training log. Estimated 1RM, period volume, weekly tonnage, bodyweight, recent top sets, and approach touch. Everything is in pounds.

This app lives in `dashboard/`. The plan markdown elsewhere in the repo is unchanged.

## Vercel

Project: `training`.

| Setting | Value |
|---|---|
| Root Directory | `dashboard` |
| Framework Preset | Next.js |

`vercel.json` sets `"framework": "nextjs"`. The project was previously saved as Python, which fails with `PYTHON_ENTRYPOINT_NOT_FOUND` because this repo has no Python entrypoint. The framework preset in the Vercel project has to be Next.js as well. A saved Python preset overrides detection even when this file is present.

Production and Preview need two server-only environment variables:

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://vtruwlvekfnmfgaundhp.supabase.co` |
| `SUPABASE_KEY` | Project API key. Do not prefix it with `NEXT_PUBLIC_`. Do not commit it. |

Add them, then redeploy. The page is generated on the server and revalidated about every five minutes (`revalidate = 300`), so new sessions show up without another code deploy.

A production build without those variables fails on purpose. Preview and local builds without them render the fixture and label it **Fixture data**.

`DASHBOARD_DATA_SOURCE=fixture` forces the fixture even when the keys are set.

## Local

```bash
cd dashboard
npm install
npm test
npm run build
npm run dev
```

Copy `.env.example` to `.env.local` and fill in `SUPABASE_KEY` to read the live log. The key stays on the server. The browser only receives the aggregated numbers.

## How the numbers are made

Reads are GET requests to PostgREST (`/rest/v1/...`). Pages are 1000 rows, ordered by id, until a short page. Nothing is inserted or updated.

- Pounds are the logged pound value. Kilograms use `weight_kg`, or `weight_value / 0.45359237`, which is the inverse of the generated `weight_kg` column. Bodyweight and zero loads are not tonnage.
- Estimated 1RM is Epley, `load × (1 + reps / 30)`, for sets of 1–10 reps. The chart is the best estimate on each day.
- Tonnage is pounds × reps on loaded sets.
- `Power Clean and Jerk` and `Clean & Jerk` are one series, Clean & Jerk. Hang and block variants stay separate. Goals: back squat 405, power clean 225, clean & jerk 225.
- 2 weeks and 4 weeks are windows ending today. Month is the calendar month. Block is a 4-week block from arc week 1 (Sunday, May 24, 2026). The next arc's weeks restart November 8, 2026. Training days are America/Los_Angeles.
- Approach touch is a height in the set note (`10'2"`, `122 in`). An `18" box` note is a box, not a touch. With no height, the panel says **Not logged yet**.

## Fixture

`lib/fixture.ts` is a synthetic log used only when the Supabase variables are missing (outside production) or when `DASHBOARD_DATA_SOURCE=fixture`. It is not the training log. The live path is `lib/supabase.ts`.
