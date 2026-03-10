import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { GlassCard } from "@/components/GlassCard";
import { AnimatedKPI, SentimentGauge } from "@/components/AnimatedKPI";
import { WordCloud } from "@/components/WordCloud";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useSentimentTimeline } from "@/hooks/use-sentiment";
import { useArticles } from "@/hooks/use-articles";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import {
  Newspaper, BellRing, TrendingUp, ChevronRight,
  Activity, ThumbsUp, ThumbsDown, Send, Sparkles,
  RefreshCw, BarChart3, Zap, Globe,
} from "lucide-react";
import { Link } from "wouter";
import { SentimentBadge } from "@/components/SentimentBadge";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

// ── Container animation ────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.5 } },
};

// ── Live Sentiment Analyzer ────────────────────────────────────────
function SentimentAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ score: number; label: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ text: string; score: number; label: string }[]>([]);

  const analyze = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sentiment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
      setHistory(prev => [{ text: text.slice(0, 80), score: data.score, label: data.label }, ...prev.slice(0, 4)]);
    } finally { setLoading(false); }
  }, [text]);

  const sentimentConfig = result ? {
    positive: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <ThumbsUp className="w-4 h-4" /> },
    negative: { color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: <ThumbsDown className="w-4 h-4" /> },
    neutral: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: <Activity className="w-4 h-4" /> },
  }[result.label] : null;

  return (
    <GlassCard tilt delay={6} className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-[var(--text-primary)]">Live Sentiment Analyzer</h3>
          <p className="text-xs text-[var(--text-muted)]">Paste any headline or text for instant analysis</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. 'NVIDIA reports record-breaking earnings, stock soars 15%...'"
          className="glass-input w-full px-4 py-3 rounded-xl resize-none h-24 text-sm"
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze(); }}
        />
        <span className="absolute bottom-3 right-3 text-[var(--text-muted)] text-xs">Ctrl+↵</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          onClick={analyze}
          disabled={loading || !text.trim()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-t-white border-white/30 animate-spin" />
          ) : <Send className="w-4 h-4" />}
          Analyze
        </motion.button>

        <AnimatePresence mode="wait">
          {result && sentimentConfig && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.9 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${sentimentConfig.color} ${sentimentConfig.bg}`}
            >
              {sentimentConfig.icon}
              <span className="capitalize">{result.label}</span>
              <span className="text-[var(--text-muted)] text-xs font-mono">
                {result.score >= 0 ? "+" : ""}{result.score.toFixed(3)}
              </span>
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[var(--glass-bg)] text-[var(--text-muted)] text-xs">
                {(result.confidence * 100).toFixed(0)}% conf.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-[var(--glass-border)] pt-4 flex flex-col gap-2"
          >
            <p className="text-xs text-[var(--text-muted)] font-medium">Recent Analyses</p>
            {history.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--glass-bg)]"
              >
                <span className="text-[var(--text-secondary)] truncate flex-1 mr-4">"{h.text}…"</span>
                <span className={`font-mono font-semibold flex-shrink-0 ${h.label === "positive" ? "text-emerald-400" : h.label === "negative" ? "text-rose-400" : "text-amber-400"}`}>
                  {h.score >= 0 ? "+" : ""}{h.score.toFixed(3)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ── Custom chart tooltip ───────────────────────────────────────────
const GlassChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const color = val >= 0.05 ? "#10b981" : val <= -0.05 ? "#f43f5e" : "#f59e0b";
  return (
    <div className="glass-panel px-4 py-3 rounded-xl text-sm min-w-[140px]">
      <p className="text-[var(--text-muted)] text-xs mb-1">{label}</p>
      <p className="font-mono font-bold text-lg" style={{ color }}>
        {val >= 0 ? "+" : ""}{typeof val === "number" ? val.toFixed(3) : val}
      </p>
      <p className="text-[var(--text-muted)] text-xs mt-0.5">
        {val >= 0.05 ? "📈 Bullish" : val <= -0.05 ? "📉 Bearish" : "➡️ Neutral"}
      </p>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: timeline, isLoading: timelineLoading } = useSentimentTimeline();
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [searchWord, setSearchWord] = useState("");

  const handleQuickFetch = useCallback(async (query: string) => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/news/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, pageSize: 10 }),
      });
      const data = await res.json();
      if (data.inserted > 0) {
        qc.invalidateQueries({ queryKey: [api.articles.list.path] });
        qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        toast({ title: `✅ ${data.inserted} new articles fetched!` });
      } else {
        toast({ title: "No new articles or API key not set.", description: "Add NEWS_API_KEY to .env from newsapi.org" });
      }
    } finally { setIsFetching(false); }
  }, [qc, toast]);

  const trendDir = stats?.trendDirection;
  const trendLabel = trendDir === "up" ? "↑ Bullish" : trendDir === "down" ? "↓ Bearish" : "→ Stable";
  const trendColor = trendDir === "up" ? "text-emerald-400" : trendDir === "down" ? "text-rose-400" : "text-amber-400";

  const negCount = (stats?.totalArticles ?? 0) - (stats?.positiveCount ?? 0) - (stats?.neutralCount ?? 0);

  return (
    <DashboardLayout>
      <PageTransition>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >
          {/* ── Header ──────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 rounded-full mb-3 max-w-[200px]"
              />
              <h1 className="text-3xl font-display font-extrabold text-[var(--text-primary)]">
                Market Overview
              </h1>
              <p className="text-[var(--text-muted)] mt-1">AI-powered real-time sentiment intelligence dashboard.</p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => handleQuickFetch("artificial intelligence market economy")}
                disabled={isFetching}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="glass-button flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {isFetching
                  ? <div className="w-4 h-4 rounded-full border-2 border-t-cyan-400 border-[var(--glass-border)] animate-spin" />
                  : <RefreshCw className="w-4 h-4 text-cyan-400" />
                }
                Fetch News
              </motion.button>
            </div>
          </motion.div>

          {/* ── 4-Column KPIs ────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatedKPI
              label="Articles Scanned"
              value={statsLoading ? 0 : (stats?.totalArticles ?? 0)}
              icon={<Newspaper className="w-5 h-5" />}
              iconBg="bg-indigo-500/15 text-indigo-400"
              sub="+12% today"
              subColor="text-emerald-400"
              isLoading={statsLoading}
              delay={0}
            />
            <AnimatedKPI
              label="Market Sentiment"
              value={statsLoading ? 0 : (stats?.avgSentiment ?? 0)}
              icon={<Activity className="w-5 h-5" />}
              iconBg="bg-cyan-500/15 text-cyan-400"
              sub={statsLoading ? "" : trendLabel}
              subColor={trendColor}
              isLoading={statsLoading}
              decimals={3}
              prefix={!statsLoading && (stats?.avgSentiment ?? 0) >= 0 ? "+" : ""}
              delay={1}
            />
            <AnimatedKPI
              label="Bullish Signals"
              value={statsLoading ? 0 : (stats?.positiveCount ?? 0)}
              icon={<ThumbsUp className="w-5 h-5" />}
              iconBg="bg-emerald-500/15 text-emerald-400"
              sub="Positive articles"
              subColor="text-emerald-400"
              isLoading={statsLoading}
              delay={2}
            />
            <AnimatedKPI
              label="Active Watchlists"
              value={statsLoading ? 0 : (stats?.activeAlerts ?? 0)}
              icon={<BellRing className="w-5 h-5" />}
              iconBg="bg-amber-500/15 text-amber-400"
              sub="Monitoring entities"
              subColor="text-amber-400"
              isLoading={statsLoading}
              delay={3}
            />
          </motion.div>

          {/* ── Chart Row: Area + Sentiment Gauge ───────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area chart */}
            <GlassCard delay={4} className="lg:col-span-2 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-display font-bold text-[var(--text-primary)]">30-Day Sentiment Trend</h3>
                </div>
                <Link href="/analytics" className="flex items-center gap-1 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">
                  Full Analytics <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="h-[260px]">
                {timelineLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-t-cyan-500 border-[var(--glass-border)] animate-spin" />
                  </div>
                ) : timeline ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickMargin={10} minTickGap={40} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} domain={[-1, 1]} />
                      <ReferenceLine y={0} stroke="var(--glass-border)" strokeDasharray="4 4" />
                      <Tooltip content={<GlassChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="avgSentiment"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#trendGrad)"
                        dot={false}
                        activeDot={{ r: 5, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </GlassCard>

            {/* Sentiment Gauge */}
            <GlassCard delay={5} tilt className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 self-start mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-[var(--text-primary)]">Market Gauge</h3>
              </div>
              {statsLoading ? (
                <div className="w-8 h-8 rounded-full border-2 border-t-cyan-500 border-[var(--glass-border)] animate-spin" />
              ) : (
                <SentimentGauge score={stats?.avgSentiment ?? 0} isLoading={statsLoading} />
              )}
              <div className="grid grid-cols-3 gap-2 w-full mt-3">
                {[
                  { label: "Pos", val: stats?.positiveCount ?? 0, color: "text-emerald-400" },
                  { label: "Neu", val: (stats?.totalArticles ?? 0) - (stats?.positiveCount ?? 0) - negCount, color: "text-amber-400" },
                  { label: "Neg", val: negCount, color: "text-rose-400" },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-xl bg-[var(--glass-bg)]">
                    <p className={`text-lg font-mono font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[var(--text-muted)] text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* ── Word Cloud ───────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <GlassCard delay={5} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-display font-bold text-[var(--text-primary)]">Trending Topics</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
                    {stats?.trendingKeywords?.length ?? 0} keywords
                  </span>
                </div>
                <Link href="/news" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                  Browse news →
                </Link>
              </div>
              {statsLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-t-cyan-500 border-[var(--glass-border)] animate-spin" />
                </div>
              ) : (
                <WordCloud
                  keywords={stats?.trendingKeywords ?? []}
                  onSelect={(word) => {
                    setSearchWord(word);
                    handleQuickFetch(word);
                  }}
                />
              )}
            </GlassCard>
          </motion.div>

          {/* ── Live Sentiment Analyzer ──────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SentimentAnalyzer />
          </motion.div>

          {/* ── Recent Intel ─────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <GlassCard delay={7} className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-display font-bold text-[var(--text-primary)]">Recent Intelligence</h3>
                </div>
                <Link href="/news" className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">
                  View all →
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {articlesLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 shimmer rounded-xl" />
                  ))
                ) : (
                  articles?.slice(0, 6).map((article, i) => (
                    <motion.a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-hover)] hover:border-[hsl(var(--primary)/0.2)] transition-all group"
                    >
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-cyan-400 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--glass-bg)] font-medium">{article.source}</span>
                          <span>•</span>
                          <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>
                      <SentimentBadge score={article.processedSentiment || 0} label={article.sentimentLabel || undefined} />
                    </motion.a>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  );
}
