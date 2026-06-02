# English ↔ Hebrew Translator

A minimal translation web app powered by Claude (Haiku). Supports direction control, register selection, and Hebrew vowel pointing (nikud).

## Stack

- **Frontend**: Vite + React, plain CSS
- **Backend**: Single Vercel serverless function at `/api/translate`
- **Model**: `claude-haiku-4-5-20251001`

## Local development

### Prerequisites

- Node.js 18+
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env
# Edit .env — fill in ANTHROPIC_API_KEY and APP_PASSWORD

# 3. Run with Vercel dev (serves both frontend and /api routes)
vercel dev
```

Open [http://localhost:3000](http://localhost:3000) and enter the password you set in `APP_PASSWORD`.

> **Note:** `vercel dev` is required for the `/api/translate` route to work locally.
> If you just want the frontend UI without API calls, `npm run dev` works too,
> but translation requests will 404.

## Deploy to Vercel

```bash
# One-time: link the project
vercel

# Set environment variables (done once, or via the Vercel dashboard)
vercel env add ANTHROPIC_API_KEY
vercel env add APP_PASSWORD

# Deploy to production
vercel --prod
```

After deploying, Vercel will give you a URL. The `/api/translate` serverless function is picked up automatically from the `api/` directory.

## Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (never sent to the client) |
| `APP_PASSWORD` | A password users must enter to use the app |

See `.env.example` for the format. **Never commit a real `.env` file.**

## Features

- **Auto-detect** source language, or lock to English→Hebrew / Hebrew→English
- **Register control**: auto, formal, or casual
- **Nikud** (Hebrew vowel pointing) toggle
- Direction-aware text areas (RTL for Hebrew, LTR for English)
- Password protected — session-persisted via `sessionStorage`
- ⌘ Enter keyboard shortcut to translate
- Copy button on result
