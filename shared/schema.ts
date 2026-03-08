import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(),
  url: text("url").notNull().unique(),
  publishedAt: timestamp("published_at"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
  rawSentiment: real("raw_sentiment"),
  processedSentiment: real("processed_sentiment"),
  sentimentLabel: text("sentiment_label"), // 'positive', 'negative', 'neutral'
  keywords: text("keywords").array(),
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  keywords: text("keywords"),
  alertThreshold: real("alert_threshold").default(0.2),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sentimentHistory = pgTable("sentiment_history", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // Stored as YYYY-MM-DD
  avgSentiment: real("avg_sentiment"),
  articleCount: integer("article_count"),
  positiveCount: integer("positive_count"),
  negativeCount: integer("negative_count"),
  neutralCount: integer("neutral_count"),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, fetchedAt: true });
export const insertWatchlistSchema = createInsertSchema(watchlists).omit({ id: true, createdAt: true });
export const insertSentimentHistorySchema = createInsertSchema(sentimentHistory).omit({ id: true });

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type SentimentHistory = typeof sentimentHistory.$inferSelect;
export type InsertSentimentHistory = z.infer<typeof insertSentimentHistorySchema>;
