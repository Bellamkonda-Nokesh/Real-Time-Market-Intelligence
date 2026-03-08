import { z } from 'zod';
import { insertArticleSchema, insertWatchlistSchema, articles, watchlists, sentimentHistory } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalArticles: z.number(),
          avgSentiment: z.number(),
          activeAlerts: z.number(),
          trendingKeywords: z.array(z.object({
            text: z.string(),
            value: z.number(),
          }))
        })
      }
    }
  },
  articles: {
    list: {
      method: 'GET' as const,
      path: '/api/articles' as const,
      responses: {
        200: z.array(z.custom<typeof articles.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/articles/:id' as const,
      responses: {
        200: z.custom<typeof articles.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  sentiment: {
    timeline: {
      method: 'GET' as const,
      path: '/api/sentiment/timeline' as const,
      responses: {
        200: z.array(z.custom<typeof sentimentHistory.$inferSelect>()),
      }
    },
    distribution: {
      method: 'GET' as const,
      path: '/api/sentiment/distribution' as const,
      responses: {
        200: z.object({
          positive: z.number(),
          negative: z.number(),
          neutral: z.number(),
        })
      }
    }
  },
  watchlists: {
    list: {
      method: 'GET' as const,
      path: '/api/watchlists' as const,
      responses: {
        200: z.array(z.custom<typeof watchlists.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/watchlists' as const,
      input: insertWatchlistSchema,
      responses: {
        201: z.custom<typeof watchlists.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/watchlists/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
