import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { loginSchema, registerSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

// ── Session augmentation ───────────────────────────────────────────
declare module "express-session" {
  interface SessionData { userId: number; }
}

// ── Built-in Sentiment Analyzer (VADER-inspired) ───────────────────
const POSITIVE_WORDS = new Set([
  "great", "good", "excellent", "amazing", "fantastic", "wonderful", "outstanding",
  "positive", "strong", "growth", "profit", "gain", "rise", "surge", "improved",
  "success", "winning", "beat", "record", "high", "best", "leading", "innovative",
  "opportunity", "promising", "recovery", "boost", "acquire", "expand", "launch",
  "upgrade", "bullish", "optimistic", "confident", "solid", "approved", "breakthrough",
  "soar", "rally", "thrive", "robust", "innovative", "accelerate", "efficient",
  "increase", "reward", "advance", "achieve", "milestone", "partnership", "award",
  "revenue", "dividend", "momentum", "upside", "outperform", "exceed", "superior",
]);
const NEGATIVE_WORDS = new Set([
  "bad", "poor", "terrible", "awful", "horrible", "negative", "weak", "loss", "drop",
  "fell", "decline", "crash", "fail", "failed", "failure", "risk", "concern", "worry",
  "warning", "crisis", "problem", "issue", "cut", "layoff", "fired", "bankrupt",
  "debt", "liability", "lawsuit", "fraud", "penalty", "fine", "bearish", "pessimistic",
  "downgrade", "resign", "investigation", "recall", "shortage", "disruption", "tariff",
  "plunge", "slump", "threat", "volatile", "uncertainty", "deficit", "downfall",
  "collapse", "default", "correction", "selloff", "tumble", "fear", "panic", "loss",
  "downside", "underperform", "miss", "disappoint", "controversy", "scandal", "probe",
]);

function analyzeSentiment(text: string): { score: number; label: string; confidence: number } {
  if (!text) return { score: 0, label: "neutral", confidence: 0.5 };
  const words = text.toLowerCase().split(/\W+/);
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }
  const total = pos + neg;
  const score = total === 0 ? 0 : (pos - neg) / (total + words.length * 0.1);
  const clamped = Math.max(-1, Math.min(1, score));
  const label = clamped >= 0.05 ? "positive" : clamped <= -0.05 ? "negative" : "neutral";
  const confidence = total === 0 ? 0.5 : Math.min(0.99, 0.5 + Math.abs(clamped) * 0.5);
  return {
    score: parseFloat(clamped.toFixed(3)),
    label,
    confidence: parseFloat(confidence.toFixed(3))
  };
}

// ── Market Summary Generator ───────────────────────────────────────
function generateMarketSummary(articles: any[]): string {
  if (articles.length === 0) return "No articles available for analysis.";
  const pos = articles.filter(a => a.sentimentLabel === "positive").length;
  const neg = articles.filter(a => a.sentimentLabel === "negative").length;
  const neu = articles.filter(a => a.sentimentLabel === "neutral").length;
  const total = articles.length;
  const avgScore = articles.reduce((s, a) => s + (a.processedSentiment || 0), 0) / total;
  const dominantSentiment = pos > neg ? "bullish" : neg > pos ? "bearish" : "mixed";

  const topPositive = articles.filter(a => a.sentimentLabel === "positive")
    .sort((a, b) => (b.processedSentiment || 0) - (a.processedSentiment || 0))[0];
  const topNegative = articles.filter(a => a.sentimentLabel === "negative")
    .sort((a, b) => (a.processedSentiment || 0) - (b.processedSentiment || 0))[0];

  const sources = Array.from(new Set(articles.map(a => a.source))).slice(0, 3).join(", ");

  let summary = `📊 **Market Intelligence Summary**\n\n`;
  summary += `Overall market sentiment is **${dominantSentiment}** based on analysis of **${total} articles** `;
  summary += `from sources including ${sources}.\n\n`;
  summary += `**Sentiment Breakdown:** ${pos} positive (${((pos / total) * 100).toFixed(0)}%) · `;
  summary += `${neg} negative (${((neg / total) * 100).toFixed(0)}%) · `;
  summary += `${neu} neutral (${((neu / total) * 100).toFixed(0)}%)\n\n`;
  summary += `**Average Sentiment Score:** ${avgScore > 0 ? "+" : ""}${avgScore.toFixed(3)}\n\n`;

  if (topPositive) {
    summary += `🟢 **Strongest Positive Signal:** "${topPositive.title}" (${topPositive.source})\n`;
  }
  if (topNegative) {
    summary += `🔴 **Notable Negative Signal:** "${topNegative.title}" (${topNegative.source})\n`;
  }

  summary += `\n**Outlook:** ${avgScore > 0.2 ? "Market showing strong positive momentum. Consider evaluating growth opportunities."
    : avgScore < -0.2 ? "Market exhibiting negative pressure. Risk management and defensive positioning advised."
      : "Mixed signals in the market. Maintain diversified approach and monitor developments closely."}`;

  return summary;
}

// ── Auth middleware ────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized – please log in" });
  }
  next();
}

// ── NewsAPI Fetcher ────────────────────────────────────────────────
async function fetchFromNewsAPI(query: string, pageSize = 20): Promise<{ articles: any[]; error?: string }> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === "YOUR_NEWSAPI_KEY_HERE") {
    return { articles: [], error: "No API key configured. Add NEWS_API_KEY to .env file from newsapi.org (free)" };
  }
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json() as any;
    if (!res.ok) {
      const errMsg = data?.message || `NewsAPI error: HTTP ${res.status}`;
      console.error(`[NewsAPI] ${res.status} – ${errMsg}`);
      return { articles: [], error: errMsg };
    }
    if (data.status === "error") {
      console.error(`[NewsAPI] API error: ${data.message}`);
      return { articles: [], error: data.message };
    }
    return { articles: data.articles || [] };
  } catch (err: any) {
    console.error("[NewsAPI] Fetch failed:", err?.message || err);
    return { articles: [], error: `Network error: ${err?.message || "Unknown error"}` };
  }
}

// ── Database seeder ────────────────────────────────────────────────
async function seedDatabase() {
  const existingArticles = await storage.getArticles();
  if (existingArticles.length === 0) {
    console.log("Seeding database with initial data...");
    const sampleArticles = [
      { title: "Tech Giants Announce New AI Models with Unprecedented Capabilities", content: "Several major technology companies unveiled their latest artificial intelligence models, promising outstanding capabilities and excellent efficiency gains. The breakthrough innovations are expected to revolutionize the industry and boost productivity across sectors.", source: "TechNews Daily", url: "https://example.com/news/1", publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), rawSentiment: 0.85, processedSentiment: 0.82, sentimentLabel: "positive", keywords: ["AI", "Technology", "Innovation", "Tech Giants", "Breakthrough"] },
      { title: "Market Reacts to Supply Chain Disruptions and Shortage Concerns", content: "Global supply chain issues continue to cause disruption in manufacturing sectors. Tariff concerns and shortage warnings are causing decline in stock prices across major indices. Analysts warn of further risk ahead.", source: "Financial Times", url: "https://example.com/news/2", publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), rawSentiment: -0.65, processedSentiment: -0.60, sentimentLabel: "negative", keywords: ["Supply Chain", "Market", "Manufacturing", "Stocks", "Tariff"] },
      { title: "Quarterly Earnings Reports Show Stable Growth for Mid-Cap Companies", content: "The latest quarterly earnings reports show stable growth for most mid-cap companies, meeting analyst expectations with solid revenue numbers.", source: "Business Insider", url: "https://example.com/news/3", publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), rawSentiment: 0.10, processedSentiment: 0.15, sentimentLabel: "neutral", keywords: ["Earnings", "Q4", "Market", "Growth", "Revenue"] },
      { title: "Startup Ecosystem Booms as Venture Capital Investment Surges to Record High", content: "Venture capital investment has surged to record-breaking highs this year, with strong interest in AI, fintech, and clean energy. Investors remain optimistic and confident about the strong potential for growth.", source: "VentureBeat", url: "https://example.com/news/4", publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), rawSentiment: 0.72, processedSentiment: 0.69, sentimentLabel: "positive", keywords: ["Venture Capital", "Startup", "Investment", "AI", "Fintech"] },
      { title: "Regulatory Crackdown on Crypto Exchanges Raises Fraud and Liability Concerns", content: "Regulators launched investigations into several major cryptocurrency exchanges for potential fraud. The investigation and pending lawsuits have raised serious concerns about penalties and liability in the sector.", source: "Reuters", url: "https://example.com/news/5", publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), rawSentiment: -0.78, processedSentiment: -0.75, sentimentLabel: "negative", keywords: ["Crypto", "Regulation", "Fraud", "Investigation", "Penalty"] },
      { title: "Electric Vehicle Sales Rise with Strong Consumer Demand and Leading Innovation", content: "Electric vehicle sales have experienced an excellent rise this quarter. Leading manufacturers are expanding production and launching new models. The record high adoption rate signals a strong outlook.", source: "AutoNews Today", url: "https://example.com/news/6", publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36), rawSentiment: 0.80, processedSentiment: 0.78, sentimentLabel: "positive", keywords: ["EV", "Electric Vehicles", "Innovation", "Clean Energy", "Expansion"] },
      { title: "Fed Signals Possible Rate Cut as Inflation Shows Signs of Easing", content: "The Federal Reserve has signaled a possible interest rate cut in the upcoming quarter as inflation shows promising signs of easing. The optimistic outlook boosted markets.", source: "Wall Street Journal", url: "https://example.com/news/7", publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18), rawSentiment: 0.55, processedSentiment: 0.52, sentimentLabel: "positive", keywords: ["Fed", "Interest Rates", "Inflation", "Economy", "Monetary Policy"] },
      { title: "Cybersecurity Threats Escalate as Major Banks Report Data Breach Incidents", content: "Several major financial institutions reported serious cybersecurity incidents this week amid escalating threats. The data breaches have raised concerns about liability and customer privacy risk.", source: "CyberNews", url: "https://example.com/news/8", publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30), rawSentiment: -0.70, processedSentiment: -0.68, sentimentLabel: "negative", keywords: ["Cybersecurity", "Banking", "Data Breach", "Privacy", "Risk"] },
    ];
    for (const article of sampleArticles) await storage.insertArticle(article as any);
    await storage.createWatchlist({ companyName: "Acme Corp", keywords: "tech, innovation", alertThreshold: 0.5 });
    await storage.createWatchlist({ companyName: "Global Logistics", keywords: "supply, shipping", alertThreshold: -0.3 });
    await storage.createWatchlist({ companyName: "TechVentures Inc", keywords: "AI, startup", alertThreshold: 0.4 });
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const base = Math.sin(i * 0.4) * 0.3;
      const rnd = (Math.random() - 0.5) * 0.2;
      const avg = parseFloat((base + rnd).toFixed(3));
      const count = Math.floor(Math.random() * 40) + 10;
      await storage.insertSentimentHistory({ date: dateStr, avgSentiment: avg, articleCount: count, positiveCount: Math.floor(count * 0.4), negativeCount: Math.floor(count * 0.25), neutralCount: Math.floor(count * 0.35) });
    }
    console.log("✅ Seeding complete.");
  }
}

// ── Route registrar ────────────────────────────────────────────────
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "sentix-super-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
  }));

  // ── Auth ───────────────────────────────────────────────────────
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = registerSchema.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) return res.status(400).json({ message: "Email already in use", field: "email" });
      const user = await storage.createUser(input);
      req.session.userId = user.id;
      return res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid email or password" });
      req.session.userId = user.id;
      const { password: _, ...safe } = user;
      return res.json({ user: safe });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => res.json({ message: "Logged out" }));
  });

  app.get(api.auth.me.path, requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) return res.status(401).json({ message: "User not found" });
      const { password: _, ...safe } = user;
      return res.json(safe);
    } catch { return res.status(500).json({ message: "Internal server error" }); }
  });

  // ── Dashboard stats ────────────────────────────────────────────
  app.get(api.dashboard.stats.path, async (_req, res) => {
    try { res.json(await storage.getDashboardStats()); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // ── Articles ───────────────────────────────────────────────────
  app.get(api.articles.list.path, async (_req, res) => {
    try { res.json(await storage.getArticles()); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.get(api.articles.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const article = await storage.getArticle(id);
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // ── Sentiment timeline / distribution / analyze / forecast ─────
  app.get(api.sentiment.timeline.path, async (_req, res) => {
    try { res.json(await storage.getSentimentHistory()); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.get(api.sentiment.distribution.path, async (_req, res) => {
    try { res.json(await storage.getSentimentDistribution()); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.post(api.sentiment.analyze.path, (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") return res.status(400).json({ message: "text field is required" });
      res.json(analyzeSentiment(text));
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // ── Sentiment 7-day forecast (linear regression on history) ────
  app.get("/api/sentiment/forecast", async (_req, res) => {
    try {
      const history = await storage.getSentimentHistory();
      if (history.length < 3) return res.json([]);

      // Simple linear trend from last 14 days
      const recent = history.slice(-14);
      const n = recent.length;
      const xs = recent.map((_, i) => i);
      const ys = recent.map(h => h.avgSentiment || 0);
      const xMean = xs.reduce((s, x) => s + x, 0) / n;
      const yMean = ys.reduce((s, y) => s + y, 0) / n;
      const slope = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0) /
        xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
      const intercept = yMean - slope * xMean;

      // Project 7 days forward
      const lastDate = new Date(history[history.length - 1].date);
      const forecast = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + i + 1);
        const xVal = n + i;
        const predicted = Math.max(-1, Math.min(1, intercept + slope * xVal));
        const noise = (Math.random() - 0.5) * 0.05;
        return {
          date: d.toISOString().split("T")[0],
          avgSentiment: parseFloat((predicted + noise).toFixed(3)),
          isForecast: true,
          upperBound: parseFloat(Math.min(1, predicted + 0.15).toFixed(3)),
          lowerBound: parseFloat(Math.max(-1, predicted - 0.15).toFixed(3)),
        };
      });
      res.json(forecast);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // ── Source leaderboard ─────────────────────────────────────────
  app.get("/api/analytics/sources", async (_req, res) => {
    try {
      const articles = await storage.getArticles();
      const sourceMap: Record<string, { total: number; sumSentiment: number; pos: number; neg: number; neu: number }> = {};
      for (const a of articles) {
        if (!sourceMap[a.source]) sourceMap[a.source] = { total: 0, sumSentiment: 0, pos: 0, neg: 0, neu: 0 };
        sourceMap[a.source].total++;
        sourceMap[a.source].sumSentiment += a.processedSentiment || 0;
        if (a.sentimentLabel === "positive") sourceMap[a.source].pos++;
        else if (a.sentimentLabel === "negative") sourceMap[a.source].neg++;
        else sourceMap[a.source].neu++;
      }
      const result = Object.entries(sourceMap).map(([source, data]) => ({
        source,
        totalArticles: data.total,
        avgSentiment: parseFloat((data.sumSentiment / data.total).toFixed(3)),
        positive: data.pos,
        negative: data.neg,
        neutral: data.neu,
      })).sort((a, b) => b.totalArticles - a.totalArticles);
      res.json(result);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // ── Keyword Cloud ──────────────────────────────────────────────
  app.get("/api/analytics/keywords", async (_req, res) => {
    try {
      const articles = await storage.getArticles();
      const wordFreq: Record<string, number> = {};
      for (const a of articles) {
        if (!a.keywords) continue;
        for (const kw of a.keywords) {
          const lower = kw.toLowerCase();
          wordFreq[lower] = (wordFreq[lower] || 0) + 1;
        }
      }
      const sorted = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 40)
        .map(([text, value]) => ({ text, value }));
      res.json(sorted);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // ── AI Market Summary ──────────────────────────────────────────
  app.get("/api/analytics/summary", async (_req, res) => {
    try {
      const articles = await storage.getArticles();
      const summary = generateMarketSummary(articles);
      res.json({ summary, generatedAt: new Date().toISOString(), articleCount: articles.length });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // ── CSV Export ─────────────────────────────────────────────────
  app.get("/api/articles/export/csv", async (_req, res) => {
    try {
      const articles = await storage.getArticles();
      const headers = ["id", "title", "source", "url", "publishedAt", "sentimentLabel", "processedSentiment", "keywords"];
      const csv = [
        headers.join(","),
        ...articles.map(a => [
          a.id,
          `"${(a.title || "").replace(/"/g, '""')}"`,
          `"${(a.source || "").replace(/"/g, '""')}"`,
          `"${(a.url || "").replace(/"/g, '""')}"`,
          a.publishedAt ? new Date(a.publishedAt).toISOString() : "",
          a.sentimentLabel || "",
          a.processedSentiment?.toFixed(4) || "0",
          `"${(a.keywords || []).join(", ")}"`,
        ].join(","))
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="sentix-articles-${new Date().toISOString().split("T")[0]}.csv"`);
      res.send(csv);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // ── Live News Fetch from NewsAPI ───────────────────────────────
  app.post("/api/news/fetch", async (req, res) => {
    try {
      const { query = "artificial intelligence market economy", pageSize = 30 } = req.body;
      const { articles: rawArticles, error: apiError } = await fetchFromNewsAPI(query, pageSize);

      if (rawArticles.length === 0) {
        return res.json({
          message: apiError || "No results found for this query.",
          inserted: 0,
          articles: []
        });
      }

      const inserted: any[] = [];
      for (const raw of rawArticles) {
        if (!raw.url || !raw.title) continue;
        const existing = await storage.getArticleByUrl(raw.url);
        if (existing) continue;

        const text = `${raw.title} ${raw.description || ""} ${raw.content || ""}`;
        const sentiment = analyzeSentiment(text);
        const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 4);
        const wordFreq: Record<string, number> = {};
        for (const w of words) wordFreq[w] = (wordFreq[w] || 0) + 1;
        const keywords = Object.entries(wordFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .map(([w]) => w);

        try {
          const article = await storage.insertArticle({
            title: raw.title.slice(0, 500),
            content: (raw.description || raw.content || raw.title).slice(0, 2000),
            source: raw.source?.name || "Unknown",
            url: raw.url,
            publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : null,
            rawSentiment: sentiment.score,
            processedSentiment: sentiment.score,
            sentimentLabel: sentiment.label,
            keywords,
          });
          inserted.push(article);
        } catch (_e) { /* duplicate URL, skip */ }
      }

      res.json({ message: `Fetched and analyzed ${inserted.length} new articles`, inserted: inserted.length, articles: inserted });
    } catch (err) {
      console.error("News fetch error:", err);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });


  // ── Watchlists ─────────────────────────────────────────────────
  app.get(api.watchlists.list.path, async (_req, res) => {
    try { res.json(await storage.getWatchlists()); }
    catch { res.status(500).json({ message: "Internal server error" }); }
  });

  app.post(api.watchlists.create.path, async (req, res) => {
    try {
      const input = api.watchlists.create.input.parse(req.body);
      res.status(201).json(await storage.createWatchlist(input));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.watchlists.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteWatchlist(id);
      res.status(204).send();
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Seed on startup
  seedDatabase().catch(console.error);
  return httpServer;
}
