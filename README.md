# Colour Game

A creative web app where users capture a colour or theme through a 3×3 photo collage — either solo or in private multiplayer games with optional voting.

## Features

- **Solo mode** — build a 3×3 collage around a colour or theme
- **Multiplayer** — create or join a private game, each player submits their own collage
- **Voting** — players vote on each other's collages to decide a winner
- **Gallery** — browse past collages
- **Auth** — sign up, log in, update your username and avatar

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) — database, auth, and image storage
- Deployed on [Vercel](https://vercel.com)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You'll need a `.env.local` file with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
