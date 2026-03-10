# 📊 Sentix — Real-Time Market Intelligence Platform

> AI-powered market sentiment analysis, live news ingestion, and 7-day forecasting in one beautiful dashboard.

---

## ✨ Features

- **Live News Fetching** — Pulls articles from [NewsAPI](https://newsapi.org) using your free API key
- **NLP Sentiment Analysis** — VADER-inspired engine scores every headline as positive, negative, or neutral
- **7-Day Forecasting** — Linear regression trend prediction with confidence intervals
- **Source Leaderboard** — Track which news sources skew bullish or bearish
- **Live Text Analyzer** — Paste any text for instant sentiment scoring
- **Watchlist Alerts** — Monitor companies with custom sentiment threshold alerts
- **CSV Export** — Download all analyzed articles as a spreadsheet
- **Dark / Light Mode** — Fully themed UI with smooth transitions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- A free [NewsAPI key](https://newsapi.org/register)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd sentix-intelligence-platform
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sentix_db
NEWS_API_KEY=your_newsapi_key_here
PORT=5000
NODE_ENV=development
```

### 3. Set Up the Database

```bash
npm run db:push
```

### 4. Run in Development

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000)

---

## 🗂 Project Structure

```
sentix-intelligence-platform/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # DashboardLayout, sidebar, topbar
│   │   │   └── ui/           # shadcn/ui primitives
│   │   ├── hooks/            # React Query hooks (auth, data)
│   │   ├── lib/              # Utilities, theme, query client
│   │   └── pages/            # Route pages
│   │       ├── landing.tsx   # Marketing landing page
│   │       ├── auth.tsx      # Sign in / Register
│   │       ├── dashboard.tsx # Main overview dashboard
│   │       ├── analytics.tsx # Charts & sentiment timeline
│   │       ├── news-feed.tsx # Live news fetching & browsing
│   │       └── watchlists.tsx# Company watchlist manager
│   └── index.html
├── server/                   # Express backend
│   ├── index.ts              # Entry point (dotenv + express setup)
│   ├── routes.ts             # All API routes + NewsAPI integration
│   ├── storage.ts            # Database abstraction layer
│   ├── db.ts                 # Drizzle ORM + pg pool
│   └── vite.ts               # Vite dev server integration
├── shared/                   # Shared types & schema (client + server)
│   ├── schema.ts             # Drizzle schema + Zod validators
│   └── routes.ts             # Type-safe API route definitions
├── .env                      # Your environment variables (gitignored)
├── package.json
├── drizzle.config.ts
├── vite.config.ts
└── tailwind.config.ts
```

---

## 🔑 API Keys

| Service | Where to Get | Free |
|---------|-------------|------|
| NewsAPI | [newsapi.org/register](https://newsapi.org/register) | ✅ Yes (dev tier) |

> **Note:** The NewsAPI free plan works on `localhost` only. For production deployments, upgrade to a paid plan.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Framer Motion |
| Styling | Tailwind CSS v3, shadcn/ui |
| Backend | Express 5, TypeScript, tsx |
| Database | PostgreSQL 16, Drizzle ORM |
| Auth | Express Session + bcryptjs |
| Charts | Recharts |
| State | TanStack Query v5 |

---

## 📄 License

MIT
