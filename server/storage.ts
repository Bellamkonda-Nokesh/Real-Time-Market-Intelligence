import { db } from "./db";
import {
  articles, watchlists, sentimentHistory,
  type Article, type Watchlist, type SentimentHistory,
  type InsertArticle, type InsertWatchlist, type InsertSentimentHistory
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
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
    trendingKeywords: {text: string; value: number}[];
  }>;
  getSentimentDistribution(): Promise<{
    positive: number;
    negative: number;
    neutral: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(50);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async insertArticle(article: InsertArticle): Promise<Article> {
    const [inserted] = await db.insert(articles).values(article).returning();
    return inserted;
  }

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

  async getSentimentHistory(): Promise<SentimentHistory[]> {
    return await db.select().from(sentimentHistory).orderBy(sentimentHistory.date).limit(30);
  }

  async insertSentimentHistory(history: InsertSentimentHistory): Promise<SentimentHistory> {
    const [inserted] = await db.insert(sentimentHistory).values(history).returning();
    return inserted;
  }

  async getDashboardStats() {
    const allArticles = await db.select().from(articles);
    const totalArticles = allArticles.length;
    const avgSentiment = allArticles.reduce((sum, a) => sum + (a.processedSentiment || 0), 0) / (totalArticles || 1);
    
    // Calculate simple trending keywords based on article keywords
    const keywordCounts: Record<string, number> = {};
    allArticles.forEach(a => {
      if (a.keywords) {
        a.keywords.forEach(k => {
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
      activeAlerts: Math.max(0, allWatchlists.length), // Dummy metric for active alerts
      trendingKeywords
    };
  }

  async getSentimentDistribution() {
    const allArticles = await db.select().from(articles);
    return {
      positive: allArticles.filter(a => a.sentimentLabel === 'positive').length,
      negative: allArticles.filter(a => a.sentimentLabel === 'negative').length,
      neutral: allArticles.filter(a => a.sentimentLabel === 'neutral').length,
    };
  }
}

export const storage = new DatabaseStorage();
