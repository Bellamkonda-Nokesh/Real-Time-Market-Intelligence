import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

const DashboardStatsSchema = z.object({
  totalArticles: z.number(),
  avgSentiment: z.number(),
  activeAlerts: z.number(),
  positiveCount: z.number(),
  negativeCount: z.number(),
  neutralCount: z.number(),
  trendDirection: z.string(),
  trendingKeywords: z.array(z.object({ text: z.string(), value: z.number() })),
});

type DashboardStats = z.infer<typeof DashboardStatsSchema>;

const MOCK_STATS: DashboardStats = {
  totalArticles: 0,
  avgSentiment: 0,
  activeAlerts: 0,
  positiveCount: 0,
  negativeCount: 0,
  neutralCount: 0,
  trendDirection: "stable",
  trendingKeywords: [],
};

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return MOCK_STATS;
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await res.json();
      const parsed = DashboardStatsSchema.safeParse(data);
      return parsed.success ? parsed.data : (data as DashboardStats);
    },
  });
}

export function useArticles() {
  return useQuery({
    queryKey: [api.articles.list.path],
    queryFn: async () => {
      const res = await fetch(api.articles.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      return res.json();
    },
  });
}
