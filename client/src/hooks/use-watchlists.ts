import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertWatchlist } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    return data as T;
  }
  return result.data;
}

export function useWatchlists() {
  return useQuery({
    queryKey: [api.watchlists.list.path],
    queryFn: async () => {
      const res = await fetch(api.watchlists.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error("Failed to fetch watchlists");
      }
      const data = await res.json();
      return parseWithLogging(api.watchlists.list.responses[200], data, "watchlists.list");
    },
  });
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertWatchlist) => {
      const res = await fetch(api.watchlists.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create watchlist");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.watchlists.list.path] });
    },
  });
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.watchlists.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Watchlist not found");
        throw new Error("Failed to delete watchlist");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.watchlists.list.path] });
    },
  });
}
