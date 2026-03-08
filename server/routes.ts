import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingArticles = await storage.getArticles();
  if (existingArticles.length === 0) {
    console.log("Seeding database with initial data...");
    
    // Seed Articles
    await storage.insertArticle({
      title: "Tech Giants Announce New AI Models",
      content: "Several major technology companies have unveiled their latest artificial intelligence models, promising unprecedented capabilities and efficiency.",
      source: "TechNews Daily",
      url: "https://example.com/news/1",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      rawSentiment: 0.85,
      processedSentiment: 0.82,
      sentimentLabel: "positive",
      keywords: ["AI", "Technology", "Innovation", "Tech Giants"]
    });
    
    await storage.insertArticle({
      title: "Market Reacts to Supply Chain Disruptions",
      content: "Global supply chain issues continue to impact manufacturing sectors, causing slight dips in stock prices across major indices.",
      source: "Financial Times Mock",
      url: "https://example.com/news/2",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      rawSentiment: -0.65,
      processedSentiment: -0.60,
      sentimentLabel: "negative",
      keywords: ["Supply Chain", "Market", "Manufacturing", "Stocks"]
    });

    await storage.insertArticle({
      title: "Quarterly Earnings Report Released",
      content: "The latest quarterly earnings reports show stable growth for most mid-cap companies, meeting analyst expectations.",
      source: "Business Insider Fake",
      url: "https://example.com/news/3",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      rawSentiment: 0.10,
      processedSentiment: 0.15,
      sentimentLabel: "neutral",
      keywords: ["Earnings", "Q3", "Market", "Growth"]
    });

    // Seed Watchlists
    await storage.createWatchlist({
      companyName: "Acme Corp",
      keywords: "tech, innovation",
      alertThreshold: 0.5,
    });

    await storage.createWatchlist({
      companyName: "Global Logistics",
      keywords: "supply, shipping",
      alertThreshold: -0.3,
    });

    // Seed Sentiment History (Last 7 days mock)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      await storage.insertSentimentHistory({
        date: dateStr,
        avgSentiment: Math.random() * 2 - 1, // between -1 and 1
        articleCount: Math.floor(Math.random() * 50) + 10,
        positiveCount: Math.floor(Math.random() * 20),
        negativeCount: Math.floor(Math.random() * 20),
        neutralCount: Math.floor(Math.random() * 10),
      });
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Dashboard Stats
  app.get(api.dashboard.stats.path, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Articles List
  app.get(api.articles.list.path, async (req, res) => {
    try {
      const articlesList = await storage.getArticles();
      res.json(articlesList);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Article Get
  app.get(api.articles.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID", field: "id" });
      }
      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sentiment Timeline
  app.get(api.sentiment.timeline.path, async (req, res) => {
    try {
      const timeline = await storage.getSentimentHistory();
      res.json(timeline);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sentiment Distribution
  app.get(api.sentiment.distribution.path, async (req, res) => {
    try {
      const distribution = await storage.getSentimentDistribution();
      res.json(distribution);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Watchlists List
  app.get(api.watchlists.list.path, async (req, res) => {
    try {
      const wLists = await storage.getWatchlists();
      res.json(wLists);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Watchlist Create
  app.post(api.watchlists.create.path, async (req, res) => {
    try {
      const input = api.watchlists.create.input.parse(req.body);
      const newWatchlist = await storage.createWatchlist(input);
      res.status(201).json(newWatchlist);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Watchlist Delete
  app.delete(api.watchlists.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID", field: "id" });
      }
      await storage.deleteWatchlist(id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data on startup
  seedDatabase().catch(console.error);

  return httpServer;
}
