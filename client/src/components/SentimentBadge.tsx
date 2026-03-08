import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentBadgeProps {
  score: number;
  label?: string;
  className?: string;
}

export function SentimentBadge({ score, label, className }: SentimentBadgeProps) {
  const isPositive = score > 0.1;
  const isNegative = score < -0.1;
  
  let computedLabel = label;
  if (!computedLabel) {
    if (isPositive) computedLabel = "Positive";
    else if (isNegative) computedLabel = "Negative";
    else computedLabel = "Neutral";
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border",
      isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
      isNegative ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : 
      "bg-slate-500/10 text-slate-400 border-slate-500/20",
      className
    )}>
      {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
      {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
      {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
      {computedLabel} ({score > 0 ? '+' : ''}{score.toFixed(2)})
    </div>
  );
}
