import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { GlassCard } from "@/components/GlassCard";
import { useDashboardStats, useArticles } from "@/hooks/use-dashboard";
import { useSentimentTimeline } from "@/hooks/use-sentiment";
import { useArticles as useRecentArticles } from "@/hooks/use-articles";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Newspaper, BellRing, TrendingUp, ChevronRight, Activity } from "lucide-react";
import { Link } from "wouter";
import { SentimentBadge } from "@/components/SentimentBadge";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: timeline, isLoading: timelineLoading } = useSentimentTimeline();
  const { data: articles, isLoading: articlesLoading } = useRecentArticles();

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-display font-bold text-white">Overview</h1>
            <p className="text-white/60">Welcome back. Here's the pulse of the market today.</p>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 font-medium">Articles Scanned</span>
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Newspaper className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-display font-bold text-white">
                  {statsLoading ? "..." : stats?.totalArticles.toLocaleString()}
                </h2>
                <span className="text-emerald-400 text-sm font-medium mb-1">+12% today</span>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 font-medium">Market Sentiment</span>
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-display font-bold text-white">
                  {statsLoading ? "..." : stats?.avgSentiment.toFixed(2)}
                </h2>
                <span className="text-emerald-400 text-sm font-medium mb-1">Bullish</span>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 font-medium">Active Alerts</span>
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <BellRing className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-display font-bold text-white">
                  {statsLoading ? "..." : stats?.activeAlerts}
                </h2>
                <span className="text-amber-400 text-sm font-medium mb-1">Needs review</span>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <GlassCard className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-white">30-Day Sentiment Trend</h3>
                <Link href="/analytics" className="text-cyan-400 text-sm font-medium hover:text-cyan-300 flex items-center gap-1">
                  Full Analytics <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="h-[300px] w-full">
                {!timelineLoading && timeline && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} minTickGap={30} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                          backdropFilter: 'blur(12px)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px', 
                          color: '#fff',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                        }}
                        itemStyle={{ color: '#06b6d4', fontWeight: 600 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="avgSentiment" 
                        stroke="#06b6d4" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSentiment)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                {timelineLoading && <div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-t-cyan-500 border-white/10 animate-spin" /></div>}
              </div>
            </GlassCard>

            {/* Trending Keywords */}
            <GlassCard className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-indigo-400 w-5 h-5" />
                <h3 className="text-lg font-display font-bold text-white">Trending Topics</h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {statsLoading ? (
                  <div className="w-full space-y-3">
                    <div className="h-8 w-24 bg-white/5 rounded-full animate-pulse" />
                    <div className="h-8 w-32 bg-white/5 rounded-full animate-pulse" />
                  </div>
                ) : (
                  stats?.trendingKeywords?.map((kw, i) => (
                    <div 
                      key={i} 
                      className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80 text-sm backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer"
                      style={{ opacity: 1 - (i * 0.1) }}
                    >
                      {kw.text} <span className="text-cyan-400 ml-1 font-mono text-xs">{kw.value}</span>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* Recent News */}
          <GlassCard className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-white">Recent Intel</h3>
              <Link href="/news" className="text-cyan-400 text-sm font-medium hover:text-cyan-300">View All</Link>
            </div>

            <div className="flex flex-col gap-4">
              {articlesLoading ? (
                <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
              ) : (
                articles?.slice(0, 4).map((article) => (
                  <a 
                    key={article.id} 
                    href={article.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/10 transition-all group"
                  >
                    <div className="flex flex-col gap-1.5 max-w-2xl">
                      <h4 className="text-white font-medium group-hover:text-cyan-300 transition-colors">{article.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt || article.fetchedAt || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                    <SentimentBadge score={article.processedSentiment || 0} label={article.sentimentLabel || undefined} />
                  </a>
                ))
              )}
              {articles?.length === 0 && !articlesLoading && (
                <div className="text-center py-8 text-white/40">No recent articles found.</div>
              )}
            </div>
          </GlassCard>
          
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
