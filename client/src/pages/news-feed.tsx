import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { GlassCard } from "@/components/GlassCard";
import { useArticles } from "@/hooks/use-articles";
import { SentimentBadge } from "@/components/SentimentBadge";
import { Search, SlidersHorizontal, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function NewsFeed() {
  const { data: articles, isLoading } = useArticles();
  const [search, setSearch] = useState("");

  const filtered = articles?.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.source.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-display font-bold text-white">News Feed</h1>
            <p className="text-white/60">Live stream of analyzed financial content.</p>
          </div>

          <GlassCard className="!p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" 
                placeholder="Search articles, companies, or keywords..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
              />
            </div>
            <button className="glass-button px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </GlassCard>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <GlassCard key={i} className="h-32 animate-pulse" />
              ))
            ) : filtered.length > 0 ? (
              filtered.map((article) => (
                <GlassCard key={article.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-white/20 hover:bg-white/10 group">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-white/80">{article.source}</span>
                      <span className="text-xs text-white/40">{new Date(article.publishedAt || article.fetchedAt || '').toLocaleString()}</span>
                    </div>
                    <a href={article.url} target="_blank" rel="noreferrer" className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
                      {article.title}
                    </a>
                    <p className="text-sm text-white/60 line-clamp-2 mt-1">{article.content}</p>
                    
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {article.keywords.slice(0, 3).map((kw, i) => (
                          <span key={i} className="text-xs text-indigo-300 font-mono">#{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-4 md:min-w-[120px]">
                    <SentimentBadge score={article.processedSentiment || 0} label={article.sentimentLabel || undefined} />
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="py-20 text-center text-white/50">
                No articles found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
