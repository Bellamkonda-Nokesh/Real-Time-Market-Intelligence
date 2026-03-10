import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { GlassCard } from "@/components/GlassCard";
import { useArticles } from "@/hooks/use-articles";
import { SentimentBadge } from "@/components/SentimentBadge";
import { Search, ExternalLink, RefreshCw, Download, Newspaper, ThumbsUp, ThumbsDown, Minus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { useTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

type FilterLabel = "all" | "positive" | "negative" | "neutral";

const PRESET_QUERIES = [
  "artificial intelligence",
  "stock market",
  "cryptocurrency",
  "tech earnings",
  "federal reserve",
  "electric vehicles",
  "startups",
  "supply chain",
];

export default function NewsFeed() {
  const { data: articles, isLoading } = useArticles();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterLabel>("all");
  const [fetchQuery, setFetchQuery] = useState("artificial intelligence market economy");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const filtered = articles?.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.source.toLowerCase().includes(search.toLowerCase()) ||
      (a.keywords || []).some(k => k.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "all" || a.sentimentLabel === filter;
    return matchesSearch && matchesFilter;
  }) || [];

  const filterCounts = {
    all: articles?.length || 0,
    positive: articles?.filter(a => a.sentimentLabel === "positive").length || 0,
    negative: articles?.filter(a => a.sentimentLabel === "negative").length || 0,
    neutral: articles?.filter(a => a.sentimentLabel === "neutral").length || 0,
  };

  const handleFetchNews = async () => {
    setIsFetching(true);
    setFetchResult(null);
    try {
      const res = await fetch("/api/news/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: fetchQuery, pageSize: 30 }),
      });
      const data = await res.json();
      setFetchResult(data.message || `Fetched ${data.inserted} articles`);
      if (data.inserted > 0) {
        qc.invalidateQueries({ queryKey: [api.articles.list.path] });
        qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        qc.invalidateQueries({ queryKey: ["/api/analytics/sources"] });
        toast({ title: `✅ ${data.inserted} new articles fetched!`, description: `Analyzed and added to database.` });
      } else {
        toast({ title: data.message, description: "Add your NEWS_API_KEY in .env file from newsapi.org (free)" });
      }
    } catch {
      toast({ title: "Fetch failed", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleExport = () => {
    window.open("/api/articles/export/csv", "_blank");
    toast({ title: "Downloading CSV…" });
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">News Feed</h1>
              <p className="text-[var(--text-secondary)]">Live stream of analyzed financial content from multiple sources.</p>
            </div>
            <button onClick={handleExport} className="glass-button flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium self-start sm:self-auto">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Live Fetch Panel */}
          <GlassCard className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-5 h-5 text-cyan-500" />
              <h3 className="text-base font-display font-bold text-[var(--text-primary)]">Fetch Live News</h3>
              <span className="text-[var(--text-muted)] text-xs">(requires NEWS_API_KEY in .env)</span>
            </div>

            {/* Preset queries */}
            <div className="flex flex-wrap gap-2">
              {PRESET_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => setFetchQuery(q)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${fetchQuery === q
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-300"
                    : isDark
                      ? "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                      : "border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400"
                    }`}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={fetchQuery}
                onChange={e => setFetchQuery(e.target.value)}
                placeholder="Search topic (e.g. NVIDIA earnings, crypto market)"
                className="glass-input flex-1 px-4 py-2.5 rounded-xl text-sm"
                onKeyDown={e => e.key === "Enter" && handleFetchNews()}
              />
              <button
                onClick={handleFetchNews}
                disabled={isFetching || !fetchQuery.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
              >
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isFetching ? "Fetching…" : "Fetch News"}
              </button>
            </div>

            {fetchResult && (
              <div className={`px-4 py-2.5 rounded-xl border text-sm ${isDark
                ? "bg-white/5 border-white/10 text-white/70"
                : "bg-blue-50 border-blue-100 text-blue-700"
                }`}>
                📡 {fetchResult}
              </div>
            )}
          </GlassCard>

          {/* Search + Filter */}
          <GlassCard className="!p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search articles, sources, or keywords…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {([
                { key: "all", label: "All", icon: Newspaper, activeClass: isDark ? "bg-white/10 border-white/20 text-white" : "bg-gray-100 border-gray-300 text-gray-800" },
                { key: "positive", label: "Positive", icon: ThumbsUp, activeClass: "bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300" },
                { key: "neutral", label: "Neutral", icon: Minus, activeClass: "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-300" },
                { key: "negative", label: "Negative", icon: ThumbsDown, activeClass: "bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-300" },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as FilterLabel)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${filter === f.key
                    ? f.activeClass
                    : isDark
                      ? "border-white/10 text-white/40 hover:text-white/70"
                      : "border-gray-200 text-gray-400 hover:text-gray-700"
                    }`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                  <span className="ml-0.5 opacity-50">({filterCounts[f.key]})</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Stats row */}
          {!isLoading && articles && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Articles", val: articles.length, numColor: isDark ? "text-indigo-300" : "text-indigo-700", bgClass: isDark ? "from-indigo-500/20 to-cyan-500/20 border-indigo-500/20" : "from-indigo-50 to-cyan-50 border-indigo-200" },
                { label: "Positive", val: filterCounts.positive, numColor: isDark ? "text-emerald-300" : "text-emerald-700", bgClass: isDark ? "from-emerald-500/20 to-teal-500/20 border-emerald-500/20" : "from-emerald-50 to-teal-50 border-emerald-200" },
                { label: "Negative", val: filterCounts.negative, numColor: isDark ? "text-rose-300" : "text-rose-700", bgClass: isDark ? "from-rose-500/20 to-red-500/20 border-rose-500/20" : "from-rose-50 to-red-50 border-rose-200" },
                { label: "Neutral", val: filterCounts.neutral, numColor: isDark ? "text-amber-300" : "text-amber-700", bgClass: isDark ? "from-amber-500/20 to-yellow-500/20 border-amber-500/20" : "from-amber-50 to-yellow-50 border-amber-200" },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-2xl bg-gradient-to-br ${s.bgClass} border`}>
                  <p className="text-[var(--text-muted)] text-xs">{s.label}</p>
                  <p className={`text-2xl font-display font-bold mt-1 ${s.numColor}`}>{s.val}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <GlassCard key={i} className="h-32 animate-pulse"><div /></GlassCard>)
            ) : filtered.length > 0 ? (
              <AnimatePresence>
                {filtered.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                  >
                    <GlassCard className={`flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group ${isDark ? "hover:border-white/20 hover:bg-white/10" : "hover:border-blue-200 hover:shadow-md"}`}>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${isDark ? "bg-white/10 text-white/80 border-white/5" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {article.source}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleString() : article.fetchedAt ? new Date(article.fetchedAt).toLocaleString() : "Unknown date"}
                          </span>
                        </div>
                        <a href={article.url} target="_blank" rel="noreferrer" className={`text-lg sm:text-xl font-bold transition-colors line-clamp-2 ${isDark ? "text-white group-hover:text-cyan-300" : "text-gray-900 group-hover:text-blue-600"}`}>
                          {article.title}
                        </a>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{article.content}</p>

                        {article.keywords && article.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {article.keywords.slice(0, 5).map((kw, i) => (
                              <span key={i} onClick={() => setSearch(kw)} className={`text-xs font-mono cursor-pointer transition-colors ${isDark ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-800"}`}>
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between gap-4 md:min-w-[130px]">
                        <SentimentBadge score={article.processedSentiment || 0} label={article.sentimentLabel || undefined} />
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isDark ? "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/50" : "bg-gray-50 border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300"}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-20 text-center">
                <Newspaper className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)] font-medium">No articles match your search.</p>
                <button onClick={() => { setSearch(""); setFilter("all"); }} className="mt-3 text-cyan-500 dark:text-cyan-400 text-sm hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
