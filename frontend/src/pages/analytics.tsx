import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { GlassCard } from "@/components/GlassCard";
import { useSentimentDistribution } from "@/hooks/use-sentiment";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ReferenceLine,
} from "recharts";
import { BarChart3, TrendingUp, Download, Brain, RefreshCw, Hash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme";
import { motion } from "framer-motion";

interface SourceStat {
  source: string;
  totalArticles: number;
  avgSentiment: number;
  positive: number;
  negative: number;
  neutral: number;
}

interface KeywordStat {
  text: string;
  value: number;
}

interface ForecastPoint {
  date: string;
  avgSentiment: number;
  isForecast?: boolean;
  upperBound?: number;
  lowerBound?: number;
}

// ── Custom Tooltip ─────────────────────────────────────────────────
const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-gray-500 dark:text-white/60 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(3) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: distribution, isLoading: distLoading } = useSentimentDistribution();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const axisColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(55,65,81,0.6)";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const refLineColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)";

  // Fetch source stats
  const { data: sources, isLoading: srcLoading } = useQuery<SourceStat[]>({
    queryKey: ["/api/analytics/sources"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/sources");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Fetch forecast
  const { data: forecast, isLoading: forecastLoading, refetch: refetchForecast } = useQuery<ForecastPoint[]>({
    queryKey: ["/api/sentiment/forecast"],
    queryFn: async () => {
      const res = await fetch("/api/sentiment/forecast");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Fetch AI market summary
  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<{ summary: string; generatedAt: string; articleCount: number }>({
    queryKey: ["/api/analytics/summary"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/summary");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Fetch keywords
  const { data: keywords, isLoading: kwLoading } = useQuery<KeywordStat[]>({
    queryKey: ["/api/analytics/keywords"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/keywords");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const pieData = distribution ? [
    { name: "Positive", value: distribution.positive, color: "#10b981" },
    { name: "Neutral", value: distribution.neutral, color: "#64748b" },
    { name: "Negative", value: distribution.negative, color: "#f43f5e" },
  ] : [];

  // Source bar chart data (top 8)
  const sourceBarData = sources?.slice(0, 8).map(s => ({
    source: s.source.length > 18 ? s.source.slice(0, 18) + "..." : s.source,
    avgSentiment: s.avgSentiment,
    articles: s.totalArticles,
    fill: s.avgSentiment >= 0.05 ? "#10b981" : s.avgSentiment <= -0.05 ? "#f43f5e" : "#64748b",
  })) || [];

  const handleExportCSV = () => {
    window.open("/api/articles/export/csv", "_blank");
    toast({ title: "Downloading CSV…", description: "Your sentiment data export has started." });
  };

  const spinnerCls = `w-8 h-8 rounded-full border-2 border-t-cyan-500 ${isDark ? "border-white/10" : "border-gray-200"} animate-spin`;

  return (
    <DashboardLayout>
      <PageTransition>
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Analytics Deep Dive</h1>
              <p className="text-[var(--text-secondary)]">Granular sentiment analytics, forecasting, and source intelligence.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="glass-button flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </motion.div>

          {/* Row 1: Distribution Pie + Source Leaderboard */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Pie Chart */}
            <GlassCard className="flex flex-col gap-6">
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Sentiment Distribution</h3>
              <div className="h-[280px] w-full flex items-center justify-center">
                {distLoading ? (
                  <div className={spinnerCls} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)",
                          backdropFilter: "blur(16px)",
                          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                          borderRadius: "12px",
                          color: isDark ? "#fff" : "#111827",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value) => <span style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(17,24,39,0.8)" }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Stats below pie */}
              {distribution && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Positive", val: distribution.positive, color: "text-emerald-500", bg: isDark ? "bg-emerald-500/10" : "bg-emerald-50 border border-emerald-100" },
                    { label: "Neutral", val: distribution.neutral, color: "text-slate-500", bg: isDark ? "bg-slate-500/10" : "bg-slate-50 border border-slate-200" },
                    { label: "Negative", val: distribution.negative, color: "text-rose-500", bg: isDark ? "bg-rose-500/10" : "bg-rose-50 border border-rose-100" },
                  ].map(item => (
                    <div key={item.label} className={`rounded-xl p-3 ${item.bg} text-center`}>
                      <p className={`text-2xl font-bold font-display ${item.color}`}>{item.val}</p>
                      <p className="text-[var(--text-muted)] text-xs mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Source Leaderboard */}
            <GlassCard className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-indigo-400 w-5 h-5" />
                <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Source Leaderboard</h3>
              </div>
              {srcLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className={spinnerCls} />
                </div>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                  {sources?.map((s, i) => {
                    const sentColor = s.avgSentiment >= 0.05 ? "text-emerald-500" : s.avgSentiment <= -0.05 ? "text-rose-500" : "text-amber-500";
                    const barColor = s.avgSentiment >= 0.05 ? "bg-emerald-500" : s.avgSentiment <= -0.05 ? "bg-rose-500" : "bg-amber-500";
                    const barWidth = Math.abs(s.avgSentiment) * 100;
                    return (
                      <div key={s.source} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                        <span className="text-[var(--text-muted)] text-xs font-mono w-5">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[var(--text-primary)] text-sm font-medium truncate">{s.source}</span>
                            <span className={`text-xs font-bold font-mono ml-2 ${sentColor}`}>
                              {s.avgSentiment >= 0 ? "+" : ""}{s.avgSentiment.toFixed(3)}
                            </span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(100, barWidth)}%` }} />
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
                            <span>📰 {s.totalArticles}</span>
                            <span className="text-emerald-500">▲ {s.positive}</span>
                            <span className="text-rose-500">▼ {s.negative}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Row 2: Source Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="flex flex-col gap-6">
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Average Sentiment by Source</h3>
              <div className="h-[260px]">
                {srcLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className={spinnerCls} />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceBarData} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="source" stroke={axisColor} fontSize={10} angle={-30} textAnchor="end" tickMargin={5} />
                      <YAxis stroke={axisColor} fontSize={11} domain={[-1, 1]} />
                      <ReferenceLine y={0} stroke={refLineColor} strokeDasharray="4 4" />
                      <RechartsTooltip content={<GlassTooltip />} />
                      <Bar dataKey="avgSentiment" name="Avg Sentiment" radius={[4, 4, 0, 0]}>
                        {sourceBarData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Row 3: 7-Day Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-cyan-400 w-5 h-5" />
                  <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">7-Day Sentiment Forecast</h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-medium">
                    Linear Regression
                  </span>
                </div>
                <button
                  onClick={() => refetchForecast()}
                  className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="h-[260px]">
                {forecastLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className={spinnerCls} />
                  </div>
                ) : forecast && forecast.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="date" stroke={axisColor} fontSize={11} tickMargin={10} />
                      <YAxis stroke={axisColor} fontSize={11} domain={[-1, 1]} />
                      <ReferenceLine y={0} stroke={refLineColor} strokeDasharray="4 4" />
                      <RechartsTooltip content={<GlassTooltip />} />
                      <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="rgba(167,139,250,0.1)" strokeWidth={0} name="Upper Bound" />
                      <Area type="monotone" dataKey="avgSentiment" stroke="#a78bfa" strokeWidth={3} fill="url(#forecastGrad)" dot={{ fill: "#a78bfa", strokeWidth: 2, stroke: isDark ? "#fff" : "#6d28d9", r: 4 }} activeDot={{ r: 6 }} name="Forecast" />
                      <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="transparent" strokeWidth={0} name="Lower Bound" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                    Insufficient historical data for forecasting. Add more articles first.
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {forecast?.slice(0, 3).map((f, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-center ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                    <p className="text-[var(--text-muted)] text-xs">{f.date}</p>
                    <p className={`text-lg font-bold font-mono mt-1 ${f.avgSentiment >= 0.05 ? "text-emerald-500" : f.avgSentiment <= -0.05 ? "text-rose-500" : "text-amber-500"}`}>
                      {f.avgSentiment >= 0 ? "+" : ""}{f.avgSentiment.toFixed(3)}
                    </p>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5">
                      {f.avgSentiment >= 0.05 ? "📈 Bullish" : f.avgSentiment <= -0.05 ? "📉 Bearish" : "➡️ Neutral"}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Row 4: AI Market Summary & Keyword Cloud */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="flex flex-col gap-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="text-violet-400 w-5 h-5" />
                  <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">AI Market Summary</h3>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium">
                    NLP Report
                  </span>
                </div>
                <button
                  onClick={() => refetchSummary()}
                  className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {summaryLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className={`h-4 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} style={{ width: `${70 + i * 6}%` }} />)}
                </div>
              ) : summaryData ? (
                <div className={`rounded-xl border p-5 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"}`}>
                  <div className="prose max-w-none">
                    {summaryData.summary.split("\n\n").map((para, i) => (
                      <p key={i} className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3 last:mb-0">
                        {para.split("**").map((part, j) =>
                          j % 2 === 1 ? <strong key={j} className="text-[var(--text-primary)] font-semibold">{part}</strong> : part
                        )}
                      </p>
                    ))}
                  </div>
                  <div className={`mt-4 pt-4 border-t flex items-center gap-4 text-xs text-[var(--text-muted)] ${isDark ? "border-white/5" : "border-gray-200"}`}>
                    <span>📊 Based on {summaryData.articleCount} articles</span>
                    <span>🕐 Generated {new Date(summaryData.generatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ) : null}
            </GlassCard>

            <GlassCard className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Hash className="text-pink-400 w-5 h-5" />
                <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Trending Topics</h3>
              </div>
              <div className="flex-1 flex flex-wrap content-start gap-1 overflow-y-auto pr-2">
                {kwLoading ? (
                  <div className="w-full h-32 flex items-center justify-center"><div className={spinnerCls} /></div>
                ) : keywords && keywords.length > 0 ? (
                  keywords.map((kw, i) => {
                    const maxVal = Math.max(...keywords.map(k => k.value));
                    const ratio = kw.value / maxVal;
                    const size = 0.8 + ratio * 0.9;
                    const opacity = 0.4 + ratio * 0.6;
                    const colorClasses = [isDark ? "text-indigo-300" : "text-indigo-600", isDark ? "text-cyan-300" : "text-cyan-600", isDark ? "text-emerald-300" : "text-emerald-600", isDark ? "text-violet-300" : "text-violet-600", isDark ? "text-pink-300" : "text-pink-600"];
                    const color = colorClasses[i % colorClasses.length];
                    return (
                      <span
                        key={kw.text + i}
                        className={`word-cloud-tag font-bold ${color}`}
                        style={{ fontSize: `${size}rem`, opacity, padding: "0.2rem 0.4rem" }}
                      >
                        {kw.text}
                      </span>
                    )
                  })
                ) : (
                  <div className="w-full h-32 flex items-center justify-center text-[var(--text-muted)] text-sm">No keywords found</div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  );
}
