import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { GlassCard } from "@/components/GlassCard";
import { useWatchlists, useCreateWatchlist, useDeleteWatchlist } from "@/hooks/use-watchlists";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Watchlists() {
  const { data: watchlists, isLoading } = useWatchlists();
  const createWatchlist = useCreateWatchlist();
  const deleteWatchlist = useDeleteWatchlist();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [threshold, setThreshold] = useState("0.2");
  const [keywords, setKeywords] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    try {
      await createWatchlist.mutateAsync({
        companyName: companyName.trim(),
        keywords: keywords.trim() || undefined,
        alertThreshold: parseFloat(threshold),
      });
      setCompanyName("");
      setKeywords("");
      setThreshold("0.2");
      toast({ title: "Watchlist created successfully", className: "bg-emerald-500/20 text-emerald-100 border-emerald-500/50 backdrop-blur-xl" });
    } catch (err: any) {
      toast({ 
        title: "Error creating watchlist", 
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWatchlist.mutateAsync(id);
      toast({ title: "Watchlist removed", className: "bg-indigo-500/20 text-indigo-100 border-indigo-500/50 backdrop-blur-xl" });
    } catch (err: any) {
      toast({ 
        title: "Error removing watchlist", 
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-display font-bold text-white">Watchlists</h1>
            <p className="text-white/60">Monitor specific entities and set alert thresholds.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form */}
            <div className="lg:col-span-1">
              <GlassCard>
                <div className="flex items-center gap-2 mb-6">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white font-display">New Tracker</h2>
                </div>
                
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/70">Company / Entity Name</label>
                    <input 
                      type="text" 
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Nvidia"
                      className="glass-input px-4 py-2.5 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/70">Keywords (comma separated)</label>
                    <input 
                      type="text" 
                      value={keywords}
                      onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. NVDA, AI, GPU"
                      className="glass-input px-4 py-2.5 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/70">Alert Threshold (-1.0 to 1.0)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="-1" max="1" step="0.1"
                        value={threshold}
                        onChange={e => setThreshold(e.target.value)}
                        className="flex-1 accent-cyan-400"
                      />
                      <span className="text-cyan-400 font-mono w-8 text-right">{threshold}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={createWatchlist.isPending}
                    className="glass-button w-full py-3 rounded-xl mt-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {createWatchlist.isPending ? "Adding..." : (
                      <><Plus className="w-5 h-5" /> Add to Watchlist</>
                    )}
                  </button>
                </form>
              </GlassCard>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <GlassCard key={i} className="h-32 animate-pulse" />
                  ))
                ) : watchlists?.length ? (
                  watchlists.map(item => (
                    <GlassCard key={item.id} className="flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">{item.companyName}</h3>
                          {item.keywords && (
                            <p className="text-xs text-white/40 mt-1 font-mono">{item.keywords}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteWatchlist.isPending}
                          className="p-2 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-sm text-white/50">Alert Trigger</span>
                        <span className="text-sm font-bold text-cyan-400">{item.alertThreshold?.toFixed(2)}</span>
                      </div>
                    </GlassCard>
                  ))
                ) : (
                  <div className="sm:col-span-2 py-12 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <ShieldAlert className="w-10 h-10 text-white/20 mb-3" />
                    <p className="text-white/60 font-medium">No watchlists configured</p>
                    <p className="text-sm text-white/40 mt-1">Add your first entity to start tracking sentiment alerts.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
