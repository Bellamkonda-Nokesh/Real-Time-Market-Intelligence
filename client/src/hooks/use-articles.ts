import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    return data as T;
  }
  return result.data;
}

export function useArticles() {
  return useQuery({
    queryKey: [api.articles.list.path],
    queryFn: async () => {
      const res = await fetch(api.articles.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return []; // Graceful degradation
        throw new Error("Failed to fetch articles");
      }
      const data = await res.json();
      return parseWithLogging(api.articles.list.responses[200], data, "articles.list");
    },
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: [api.articles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.articles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch article");
      const data = await res.json();
      return parseWithLogging(api.articles.get.responses[200], data, `articles.get(${id})`);
    },
    enabled: !!id,
  });
}
