<div align="center">

# ⚡ SENTIX

### *Real-Time Market Intelligence & Sentiment Analysis*

> **Every day, millions of financial signals are generated. Sentix reads them all — so you don't have to.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 🖼️ Platform Preview

### Landing Page — *The First Impression*
![Sentix Landing Page](./landing.png)
> A bold glassmorphism hero — live news ingestion, NLP sentiment scoring, 7-day forecasting, and beautiful analytics, unified into one intelligence platform.

---

### Feature Suite — *Everything in One Place*
![Sentix Features](./features.png)
> Six production-grade modules covering the full intelligence pipeline: from multi-source news ingestion and AI sentiment scoring to live text analysis and entity watchlist alerts.

---

### Market Overview Dashboard — *Your Command Center*
![Sentix Dashboard](./dashboard.png)
> Real-time pulse on the market. Articles scanned, live aggregate sentiment, bullish signal count, a 30-day trend line chart, and a visual market gauge — all live, all in one view.

---

## 📖 What Is Sentix?

**Sentix** is an autonomous market intelligence platform that solves the fundamental problem of financial information overload. It ingests live global news via NewsAPI, runs every article through a VADER-inspired NLP sentiment engine, and renders the results as an animated, type-safe glassmorphism dashboard — from raw headline to actionable insight in real time.

| Attribute | Detail |
|---|---|
| 🎯 Sentiment Scale | `-1.0` (Bearish) → `+1.0` (Bullish) |
| 📡 Data Source | NewsAPI (live headlines) |
| 🗄️ Database | PostgreSQL 16 via Drizzle ORM |
| 🔒 Auth | Session-based + bcryptjs password hashing |
| 🖥️ UI Paradigm | Glassmorphism SPA · Framer Motion animations |

---

## ✨ Core Intelligence Modules

| Module | What It Does |
|---|---|
| 🧠 **AI Sentiment Analysis** | VADER-inspired NLP scores every headline with confidence intervals |
| 📝 **AI Executive Summary** | Auto-generates human-readable market condition summaries |
| 📈 **Sentiment Timeline** | Interactive time-series charts tracking market mood over time |
| 🔮 **7-Day Forecasting** | Linear regression on historical sentiment data with confidence bands |
| 📊 **Source Leaderboard** | Identifies which outlets skew bullish or bearish — weight your data |
| ☁️ **Keyword Word Cloud** | Animated real-time keyword extraction across all processed stories |
| 🚨 **Watchlist Alerts** | Monitor tickers/sectors with custom sentiment shift thresholds |
| 📥 **Bulk CSV Export** | Download processed intelligence directly into Excel or Python pipelines |

---

## 🏗️ Technical Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        SENTIX STACK                              │
├──────────────────────────────┬───────────────────────────────────┤
│        FRONTEND              │           BACKEND                 │
│                              │                                   │
│  React 18 + TypeScript       │  Express.js REST API              │
│  Tailwind CSS (Glassmorphism)│  PostgreSQL 16 (Session Store)    │
│  Framer Motion (Animations)  │  Drizzle ORM (Type-safe DB)       │
│  Recharts (Data Viz)         │  bcryptjs (Auth Hashing)          │
│  TanStack Query (State)      │  NewsAPI Integration              │
│  Shadcn/UI Components        │  VADER-inspired NLP Engine        │
└──────────────────────────────┴───────────────────────────────────┘
```

**Key design decisions:**
- **End-to-end type safety** — shared TypeScript types + Zod schemas flow from PostgreSQL → Drizzle ORM → API → UI
- **TanStack Query** handles server-state caching so the dashboard stays snappy under heavy polling
- **Session-based auth** over JWTs for simpler revocation and PostgreSQL-native session storage

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v16+
- Free [NewsAPI](https://newsapi.org/register) key

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/sentix.git
cd sentix
npm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/sentix_db
NEWS_API_KEY=your_news_api_key_here
SESSION_SECRET=a_strong_random_secret
PORT=5000
NODE_ENV=development
```

### 3. Initialize Database

```bash
npm run db:push
```

### 4. Launch

```bash
npm run dev
```

Open **[http://localhost:5000](http://localhost:5000)** — your intelligence platform is live.

---

## 📁 Project Structure

```
sentix/
├── backend/                  # Express server, API routes & NLP logic
├── frontend/
│   └── src/
│       ├── components/       # Shadcn UI & custom glassmorphism components
│       ├── pages/            # Dashboard, Analytics, Auth, Landing
│       └── lib/              # API clients & utility functions
├── shared/                   # Shared TypeScript types & Zod schemas
├── scripts/                  # Build & utility scripts
└── drizzle/                  # DB migrations & configuration
```

---

## 🗺️ Roadmap

- [ ] GPT-4 powered article summarization layer
- [ ] Portfolio-level sentiment correlation scoring
- [ ] Real-time WebSocket sentiment push (replace polling)
- [ ] Multi-language support (EN, DE, ZH)
- [ ] Docker Compose one-command deployment

---

<div align="center">

**Built for the modern investor with ❤️ and Data.**

*© 2026 Sentix — Real-Time Market Intelligence by Nokesh Bellamkonda. All rights reserved.*

⭐ *If Sentix sharpens your edge, consider starring the repo.*

</div>
