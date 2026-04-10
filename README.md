# Masters Pool 2026

Live Masters Tournament pool tracker for 4 players (Steve, Jimmy, Dave, Aaron).

## Scoring Logic

- Each player drafted 8 golfers
- Only the **4 lowest scores** (best 4 of 8) count toward a player's total
- Lower total = better position
- MC/WD/DQ golfers keep their score at time of exit
- Counting golfers are highlighted with a gold checkmark

## Name Matching

ESPN player names may differ from pool draft names. The app uses:
1. Exact normalized match (strips accents, periods, case)
2. Manual override map in `lib/namemap.ts`
3. Last name + first name substring fuzzy match

Unmatched golfers show an amber "NOT FOUND" warning in the UI.

## Setup

```bash
bash setup.sh
```

Or manually:
```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your OpenAI API key
npm run dev
```

## Deploy

```bash
bash deploy.sh
```

## Updating OpenAI Key in Vercel

```bash
vercel env rm OPENAI_API_KEY production
echo "sk-your-new-key" | vercel env add OPENAI_API_KEY production
vercel --prod
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ESPN API (no key needed)
- OpenAI GPT-4o for commentary
