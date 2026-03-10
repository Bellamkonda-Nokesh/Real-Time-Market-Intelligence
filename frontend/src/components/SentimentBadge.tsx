import { motion } from "framer-motion";

interface SentimentBadgeProps {
  score: number;
  label?: string;
}

export function SentimentBadge({ score, label }: SentimentBadgeProps) {
  const resolved = label ?? (score >= 0.05 ? "positive" : score <= -0.05 ? "negative" : "neutral");

  const config = {
    positive: {
      dot: "bg-emerald-400",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/25",
      label: "Positive",
      emoji: "↑",
    },
    negative: {
      dot: "bg-rose-400",
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-200 dark:border-rose-500/25",
      label: "Negative",
      emoji: "↓",
    },
    neutral: {
      dot: "bg-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/25",
      label: "Neutral",
      emoji: "→",
    },
  }[resolved] ?? {
    dot: "bg-slate-400", text: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-500/10", border: "border-slate-200 dark:border-slate-500/25",
    label: "Unknown", emoji: "–",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${config.bg} ${config.border} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.emoji} {config.label}
      <span className="ml-0.5 font-mono opacity-70">
        {score >= 0 ? "+" : ""}{score.toFixed(2)}
      </span>
    </motion.div>
  );
}
