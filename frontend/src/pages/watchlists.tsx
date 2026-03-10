import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { GlassCard } from "@/components/GlassCard";
import { useWatchlists, useCreateWatchlist, useDeleteWatchlist } from "@/hooks/use-watchlists";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme";

export default function Watchlists() {
  const { data: watchlists, isLoading } = useWatchlists();
  const createWatchlist = useCreateWatchlist();
  const deleteWatchlist = useDeleteWatchlist();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
      toast({ title: "Watchlist created successfully" });
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
      toast({ title: "Watchlist removed" });
    } catch (err: any) {
      toast({
        title: "Error removing watchlist",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const labelCls = `text-sm font-medium text-[var(--text-secondary)]`;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Watchlists</h1>
            <p className="text-[var(--text-secondary)]">Monitor specific entities and set alert thresholds.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Form */}
            <div className="lg:col-span-1">
              <GlassCard>
                <div className="flex items-center gap-2 mb-6">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">New Tracker</h2>
                </div>

                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Company / Entity Name</label>
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
                    <label className={labelCls}>Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. NVDA, AI, GPU"
                      className="glass-input px-4 py-2.5 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Alert Threshold (-1.0 to 1.0)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="-1" max="1" step="0.1"
                        value={threshold}
                        onChange={e => setThreshold(e.target.value)}
                        className="flex-1 accent-cyan-500"
                      />
                      <span className="text-cyan-500 font-mono w-10 text-right font-bold">{threshold}</span>
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
                    <GlassCard key={i} className="h-32 animate-pulse"><div /></GlassCard>
                  ))
                ) : watchlists?.length ? (
                  watchlists.map(item => (
                    <GlassCard key={item.id} className={`flex flex-col justify-between transition-all ${isDark ? "hover:border-cyan-500/30" : "hover:border-blue-300 hover:shadow-md"}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-[var(--text-primary)]">{item.companyName}</h3>
                          {item.keywords && (
                            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{item.keywords}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteWatchlist.isPending}
                          className={`p-2 rounded-lg transition-colors ${isDark
                            ? "text-white/40 hover:bg-rose-500/20 hover:text-rose-400"
                            : "text-gray-300 hover:bg-rose-50 hover:text-rose-500"
                            }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className={`mt-6 flex items-center justify-between pt-4 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                        <span className="text-sm text-[var(--text-muted)]">Alert Trigger</span>
                        <span className="text-sm font-bold text-cyan-500">{item.alertThreshold?.toFixed(2)}</span>
                      </div>
                    </GlassCard>
                  ))
                ) : (
                  <div className={`sm:col-span-2 py-12 flex flex-col items-center justify-center text-center border border-dashed rounded-2xl ${isDark
                    ? "border-white/10 bg-white/5"
                    : "border-gray-200 bg-gray-50"
                    }`}>
                    <ShieldAlert className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                    <p className="text-[var(--text-secondary)] font-medium">No watchlists configured</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Add your first entity to start tracking sentiment alerts.</p>
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
