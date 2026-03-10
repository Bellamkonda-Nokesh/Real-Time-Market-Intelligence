import { db } from "./db";
import {
  articles, watchlists, sentimentHistory, users,
  type Article, type Watchlist, type SentimentHistory, type User,
  type InsertArticle, type InsertWatchlist, type InsertSentimentHistory, type InsertUser,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Auth / Users
  createUser(user: InsertUser): Promise<Omit<User, 'password'>>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleByUrl(url: string): Promise<Article | undefined>;
  insertArticle(article: InsertArticle): Promise<Article>;

  // Watchlists
  getWatchlists(): Promise<Watchlist[]>;
  createWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  deleteWatchlist(id: number): Promise<void>;

  // Sentiment History
  getSentimentHistory(): Promise<SentimentHistory[]>;
  insertSentimentHistory(history: InsertSentimentHistory): Promise<SentimentHistory>;

  // Stats
  getDashboardStats(): Promise<{
    totalArticles: number;
    avgSentiment: number;
    activeAlerts: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    trendDirection: string;
    trendingKeywords: { text: string; value: number }[];
  }>;
  getSentimentDistribution(): Promise<{
    positive: number;
    negative: number;
    neutral: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // ── Users ──────────────────────────────────────────────────────────
  async createUser(user: InsertUser): Promise<Omit<User, 'password'>> {
    const hashed = await bcrypt.hash(user.password, 12);
    const initials = user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const [inserted] = await db
      .insert(users)
      .values({ ...user, password: hashed, avatarInitials: initials })
      .returning();

    const { password: _, ...safe } = inserted;
    return safe;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // ── Articles ───────────────────────────────────────────────────────
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(50);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getArticleByUrl(url: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.url, url));
    return article;
  }

  async insertArticle(article: InsertArticle): Promise<Article> {
    const [inserted] = await db.insert(articles).values(article).returning();
    return inserted;
  }

  // ── Watchlists ─────────────────────────────────────────────────────
  async getWatchlists(): Promise<Watchlist[]> {
    return await db.select().from(watchlists).orderBy(desc(watchlists.createdAt));
  }

  async createWatchlist(watchlist: InsertWatchlist): Promise<Watchlist> {
    const [inserted] = await db.insert(watchlists).values(watchlist).returning();
    return inserted;
  }

  async deleteWatchlist(id: number): Promise<void> {
    await db.delete(watchlists).where(eq(watchlists.id, id));
  }

  // ── Sentiment History ──────────────────────────────────────────────
  async getSentimentHistory(): Promise<SentimentHistory[]> {
    return await db.select().from(sentimentHistory).orderBy(sentimentHistory.date).limit(30);
  }

  async insertSentimentHistory(history: InsertSentimentHistory): Promise<SentimentHistory> {
    const [inserted] = await db.insert(sentimentHistory).values(history).returning();
    return inserted;
  }

  // ── Stats ──────────────────────────────────────────────────────────
  async getDashboardStats() {
    const allArticles = await db.select().from(articles);
    const totalArticles = allArticles.length;
    const avgSentiment =
      allArticles.reduce((sum, a) => sum + (a.processedSentiment || 0), 0) /
      (totalArticles || 1);

    const positiveCount = allArticles.filter((a) => a.sentimentLabel === "positive").length;
    const negativeCount = allArticles.filter((a) => a.sentimentLabel === "negative").length;
    const neutralCount = allArticles.filter((a) => a.sentimentLabel === "neutral").length;

    const trendDirection =
      avgSentiment > 0.1 ? "up" : avgSentiment < -0.1 ? "down" : "stable";

    // Trending keywords
    const keywordCounts: Record<string, number> = {};
    allArticles.forEach((a) => {
      if (a.keywords) {
        a.keywords.forEach((k) => {
          keywordCounts[k] = (keywordCounts[k] || 0) + 1;
        });
      }
    });

    const trendingKeywords = Object.entries(keywordCounts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    const allWatchlists = await db.select().from(watchlists);

    return {
      totalArticles,
      avgSentiment,
      activeAlerts: Math.max(0, allWatchlists.length),
      positiveCount,
      negativeCount,
      neutralCount,
      trendDirection,
      trendingKeywords,
    };
  }

  async getSentimentDistribution() {
    const allArticles = await db.select().from(articles);
    return {
      positive: allArticles.filter((a) => a.sentimentLabel === "positive").length,
      negative: allArticles.filter((a) => a.sentimentLabel === "negative").length,
      neutral: allArticles.filter((a) => a.sentimentLabel === "neutral").length,
    };
  }
}

export const storage = new DatabaseStorage();
