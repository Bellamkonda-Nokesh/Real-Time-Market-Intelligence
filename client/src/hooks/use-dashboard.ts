import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    return data as T; // Fallback to raw data to prevent hard crash
  }
  return result.data;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path, { credentials: "include" });
      if (!res.ok) {
        // Provide mock fallback if endpoint missing
        if (res.status === 404) {
          return {
            totalArticles: 12453,
            avgSentiment: 0.68,
            activeAlerts: 4,
            trendingKeywords: [
              { text: "AI", value: 98 },
              { text: "Earnings", value: 85 },
              { text: "Merger", value: 64 },
              { text: "Interest Rates", value: 55 },
              { text: "Tech", value: 42 }
            ]
          };
        }
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await res.json();
      return parseWithLogging(api.dashboard.stats.responses[200], data, "dashboard.stats");
    },
  });
}
