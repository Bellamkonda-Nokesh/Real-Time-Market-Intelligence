<div align="center">

<img src="https://via.placeholder.com/80x80/6366f1/ffffff?text=⚡" width="80" height="80" />

# SENTIX v2.0

### *Real-Time Strategic Market Intelligence*

> **Transform the firehose of global financial news into sharp, actionable insights — instantly.**

[![Python](https://img.shields.io/badge/Python-3.7+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![NLTK](https://img.shields.io/badge/NLTK-NLP_Engine-4CAF50?style=for-the-badge)](https://www.nltk.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)](./LICENSE)

</div>

---

## 🖼️ Platform Preview

### Landing Page — *Where Intelligence Begins*

![Sentix Landing Page](docs/landing.png)

> A bold, glassmorphism-styled hero section designed for instant clarity. One platform. One mission: know the market before it moves.

---

### Feature Suite — *Everything You Need to Stay Ahead*

![Sentix Features Grid](docs/features.png)

> Six production-grade intelligence modules — from multi-source news ingestion and AI sentiment scoring to live analysis and watchlist alerts — available out of the box.

---

### Market Overview Dashboard — *Your Command Center*

![Sentix Dashboard](docs/dashboard.png)

> A real-time intelligence hub displaying live sentiment scores, bullish signals, 30-day trend charts, and a visual market gauge — all in one unified view.

---

## ⚡ What Is Sentix?

**Sentix v2.0** is an autonomous AI-powered market intelligence platform that reads, scores, and forecasts the news for you. Built atop a lean FastAPI + NLTK stack, it ingests live articles from NewsAPI, applies VADER-inspired NLP sentiment scoring, and renders everything through a silky-smooth glassmorphism SPA — no heavy frameworks, just raw performance.

| Metric | Value |
|---|---|
| ⚡ Initial Load | `< 2 seconds` |
| 🎯 Sentiment Precision | VADER-calibrated confidence intervals |
| 📡 News Latency | Real-time via NewsAPI |
| 🗄️ Database | SQLite WAL Mode (zero-config, concurrent R/W) |
| 🖥️ Frontend | Vanilla JS SPA — zero framework overhead |

---

## 🧠 Core Intelligence Modules

| Module | Description |
|---|---|
| 🌐 **Multi-Source News** | Fetches & filters live articles by keyword, topic, or sentiment in real time |
| 🤖 **AI Sentiment Analysis** | VADER-inspired NLP engine scores every headline: Positive / Neutral / Negative |
| 📈 **7-Day Forecasting** | Linear regression trend prediction with confidence intervals |
| 📊 **Source Leaderboard** | Tracks which outlets skew bullish or bearish — weight your data accordingly |
| ⚡ **Live Analyzer** | Paste any text, get instant sentiment scoring + historical tracking |
| 🚨 **Watchlist Alerts** | Monitor companies or entities; get Slack-pinged on sentiment shifts |
| ☁️ **Trending Word Cloud** | Real-time keyword extraction across all processed stories |
| 📥 **Data Export** | CSV / JSON export into downstream modeling pipelines |

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SENTIX v2.0 STACK                        │
├────────────────────────┬────────────────────────────────────┤
│     FRONTEND (SPA)     │         BACKEND (Engine)           │
│                        │                                    │
│  Vanilla JS            │  FastAPI  (3x faster than Flask)   │
│  Tailwind CSS          │  Python + NLTK (NLP Sentiment)     │
│  GSAP Animations       │  SQLite WAL (Concurrent R/W)       │
│  Chart.js              │  Async/Await I/O                   │
│  Phosphor Icons        │  Pydantic Validation               │
│  Inter Font            │  NewsAPI + Slack Webhook           │
└────────────────────────┴────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Python `3.7+`
- A free API key from [NewsAPI](https://newsapi.org/register)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/sentix.git
cd sentix
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
NEWS_API_KEY=your_newsapi_key_here
SLACK_WEBHOOK_URL=your_optional_slack_webhook
DATABASE_URL=sqlite:///./intelligence.db
```

### 3. Launch

```bash
uvicorn app.main:app --reload
```

Open **[http://localhost:8000](http://localhost:8000)** — your dashboard is live.
Auto-generated API docs available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 📁 Project Structure

```
sentix/
├── app/
│   ├── main.py            # FastAPI entry point
│   ├── models.py          # Pydantic schemas
│   ├── sentiment.py       # NLTK/VADER NLP engine
│   ├── news.py            # NewsAPI ingestion layer
│   └── alerts.py          # Slack webhook integration
├── static/
│   ├── index.html         # SPA shell
│   ├── app.js             # Vanilla JS SPA logic
│   └── style.css          # Tailwind + glassmorphism
├── intelligence.db        # SQLite WAL database
├── requirements.txt
└── .env
```

---

## 🗺️ Roadmap

- [ ] Portfolio sentiment correlation scoring
- [ ] Multi-language support (EN, DE, ZH)
- [ ] Redis caching for sub-100ms API responses
- [ ] Docker Compose one-command deployment

---

<div align="center">

**Built to transform information overload into an intelligence advantage.**

*© 2026 Sentix — Real-Time Strategic Intelligence by Rajath M S. All rights reserved.*

⭐ Star this repo if Sentix adds value to your workflow.

</div>
