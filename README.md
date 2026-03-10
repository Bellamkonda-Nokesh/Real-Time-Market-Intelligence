<div align="center">
  <img src="https://via.placeholder.com/150x150/6366f1/ffffff?text=Sentix" alt="Sentix Logo" width="120" height="120" />
  <h1>Sentix — Real-Time Market Intelligence</h1>
  <p><i>AI-powered market sentiment analysis, live news ingestion, & predictive forecasting in one beautiful dashboard.</i></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18.x-blueviolet)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-teal)](https://tailwindcss.com/)
  [![Express.js](https://img.shields.io/badge/Express-Backend-lightgrey)](https://expressjs.com/)
</div>

<br />

![Sentix Dashboard Preview](./docs/dashboard.png)

---

## 📖 The Problem

**Imagine trying to drink from a firehose of global financial news.** Every second, countless articles, earnings reports, and market gossip hit the wire. For retail investors and analysts, the sheer volume of unstructured data makes it impossible to manually gauge the *actual* mood of the market. Is the overall trajectory bullish or bearish? Are news outlets skewing a specific narrative about NVIDIA or the Federal Reserve? 

Without a way to quantify this noise, investors are left reacting to headlines rather than anticipating trends. We asked ourselves: *What if you could distill the entire financial news cycle into actionable data using Natural Language Processing (NLP)?*

## 💡 The Solution

Enter **Sentix**. We built an autonomous intelligence platform that reads the news so you don't have to. 

Sentix acts as your personal market radar. By seamlessly hooking into live global news streams, it ingests, processes, and grades hundreds of articles on a continuous feed. Our NLP engine scores each headline and article body to assign it a precise sentiment weight. 

Instead of reading 100 articles, you can glance at your Sentix dashboard and immediately see:
1. **The Pulse**: A breakdown of bullish vs. bearish market momentum.
2. **The Predictions**: A 7-Day algorithmic forecast of where sentiment is heading using linear regression models.
3. **The Bias**: A leaderboard decoding which specific news sources are consistently spinning positive or negative narratives.

Sentix transforms paralyzing information overload into a sleek, dark-mode command center.

---

## ✨ Dynamic Features

![Features Preview](./docs/features.png)

- � **Mass News Ingestion**: Actively pulls 30+ simultaneous articles directly from [NewsAPI](https://newsapi.org) triggered by your custom search queries.
- 🧠 **NLP Sentiment Engine**: VADER-inspired logic that computes confidence intervals and scores text as Positive, Negative, or Neutral.
- 📉 **7-Day Predictive Forecasting**: Employs mathematical linear regression to forecast future market sentiment based on recent historical trajectories.
- ☁️ **Trending Word Cloud**: Real-time extraction of the most frequently mentioned keywords across all processed news, scaled dynamically in a beautiful hover-animated cloud.
- 🚨 **Watchlist Alerts**: Monitor specific tickers or entities (e.g. "OpenAI" or "Tesla"). Set custom sentiment thresholds and get alerted when public perception shifts.
- 🎭 **Smooth Framer Motion Interactions**: A highly responsive, animated UI where cards glide, charts sequence into view, and feeds update gracefully without harsh screen stutters.
- 📊 **CSV Bulk Export**: Downstream your raw scraped data and sentiment values directly into a spreadsheet for secondary modeling.
- 🌓 **Adaptive Theming**: Seamless transitioning between a stunning dark mode (Glassmorphism borders) and a clean light mode.

---

## 🛠 Tech Stack

Sentix is built using a modern, type-safe, and highly scalable stack:

**Frontend Ecosystem**
- **React 18** & **TypeScript** — Core framework
- **Vite** — Lightning-fast build tooling
- **Framer Motion** — Physics-based fluid animations
- **Tailwind CSS v3** — Utility-first styling & Glassmorphism effects
- **TanStack Query (React Query)** — Server-state management & caching
- **Recharts** — Responsive, composable SVG charting
- **Lucide React** — Crisp, beautiful iconography

**Backend & Infrastructure**
- **Express.js (Node)** — High-performance REST API routing
- **PostgreSQL 16** — Robust relational database
- **Drizzle ORM** — Type-safe SQL schema & queries
- **bcryptjs** — Secure credential hashing
- **NewsAPI** — External data sourcing for global headlines

---

## � Getting Started

Want to run Sentix locally? Follow these steps:

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- A free [NewsAPI key](https://newsapi.org/register)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/sentix.git
cd sentix
npm install
```

### 2. Configure Environment
Copy the `.env.example` to `.env` and fill in your secrets:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sentix_db
NEWS_API_KEY=your_newsapi_key_here
PORT=5000
NODE_ENV=development
```

### 3. Initialize Database
Push the Drizzle schema to your local PostgreSQL instance:
```bash
npm run db:push
```

### 4. Boot the Engines
Start the backend server and frontend Vite runtime concurrently:
```bash
npm run dev
```
> Navigate to **[http://localhost:5000](http://localhost:5000)** and create a free account to begin analyzing the market!

---

<div align="center">
  <p>&copy; 2026 Sentix by Nokesh Bellamkonda. All rights reserved.</p>
  <p>Built with ❤️ and Data.</p>
</div>
