import { z } from 'zod';
import { insertArticleSchema, insertWatchlistSchema, articles, watchlists, sentimentHistory, users, loginSchema, registerSchema } from './schema';

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

const userPublic = z.object({
  id: z.number(),
  email: z.string(),
  fullName: z.string(),
  avatarInitials: z.string().nullable(),
  createdAt: z.string().or(z.date()).nullable(),
});

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: registerSchema,
      responses: {
        201: userPublic,
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: loginSchema,
      responses: {
        200: z.object({ user: userPublic }),
        401: errorSchemas.validation,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: userPublic,
        401: errorSchemas.validation,
      }
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalArticles: z.number(),
          avgSentiment: z.number(),
          activeAlerts: z.number(),
          positiveCount: z.number(),
          negativeCount: z.number(),
          neutralCount: z.number(),
          trendDirection: z.string(),
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
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/sentiment/analyze' as const,
      responses: {
        200: z.object({
          score: z.number(),
          label: z.string(),
          confidence: z.number(),
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
