import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { GlassCard } from "@/components/GlassCard";
import { useSentimentDistribution } from "@/hooks/use-sentiment";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Filter, GitCompare } from "lucide-react";

export default function Analytics() {
  const { data: distribution, isLoading } = useSentimentDistribution();

  const pieData = distribution ? [
    { name: 'Positive', value: distribution.positive, color: '#10b981' },
    { name: 'Neutral', value: distribution.neutral, color: '#64748b' },
    { name: 'Negative', value: distribution.negative, color: '#f43f5e' },
  ] : [];

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-display font-bold text-white">Analytics Deep Dive</h1>
              <p className="text-white/60">Granular view of market sentiment and distributions.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="glass-button flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                <Filter className="w-4 h-4" />
                Last 30 Days
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <GlassCard className="flex flex-col gap-6">
              <h3 className="text-lg font-display font-bold text-white">Sentiment Distribution</h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full border-2 border-t-cyan-500 border-white/10 animate-spin" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                          backdropFilter: 'blur(12px)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px', 
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 500 }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-6">
              <div className="flex items-center gap-2 mb-2">
                <GitCompare className="text-indigo-400 w-5 h-5" />
                <h3 className="text-lg font-display font-bold text-white">Entity Comparison</h3>
              </div>
              
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex gap-4">
                  <input type="text" placeholder="Entity A (e.g. AAPL)" className="glass-input px-4 py-3 rounded-xl w-full" defaultValue="AAPL" />
                  <input type="text" placeholder="Entity B (e.g. MSFT)" className="glass-input px-4 py-3 rounded-xl w-full" defaultValue="MSFT" />
                </div>
                
                <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                  <div className="flex w-full items-center justify-between mb-8 px-4">
                    <div className="text-2xl font-bold text-emerald-400">+0.68</div>
                    <div className="text-white/40 font-medium">Vs</div>
                    <div className="text-2xl font-bold text-cyan-400">+0.42</div>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>AAPL Volume</span>
                        <span>MSFT Volume</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-400" style={{width: '60%'}}></div>
                        <div className="h-full bg-cyan-400" style={{width: '40%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/40 text-sm mt-8">Mock comparison data displayed.</p>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
