import { motion } from "framer-motion";

interface WordCloudProps {
    keywords: { text: string; value: number }[];
    onSelect?: (word: string) => void;
}

const COLORS_DARK = [
    "text-indigo-400", "text-cyan-400", "text-violet-400",
    "text-emerald-400", "text-blue-400", "text-teal-400",
    "text-purple-400", "text-sky-400", "text-pink-400",
];

const COLORS_LIGHT = [
    "text-indigo-600", "text-cyan-600", "text-violet-600",
    "text-emerald-600", "text-blue-600", "text-teal-600",
    "text-purple-600", "text-sky-600", "text-pink-600",
];

function getSize(value: number, max: number): string {
    const ratio = value / max;
    if (ratio > 0.85) return "text-3xl font-extrabold";
    if (ratio > 0.65) return "text-2xl font-bold";
    if (ratio > 0.45) return "text-xl font-semibold";
    if (ratio > 0.25) return "text-base font-medium";
    return "text-sm font-normal";
}

function getRotation(i: number): number {
    const rotations = [0, -8, 8, 0, -5, 5, -3, 3, 0, -6, 6];
    return rotations[i % rotations.length];
}

export function WordCloud({ keywords, onSelect }: WordCloudProps) {
    if (!keywords || keywords.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center">
                <p className="text-[var(--text-muted)] text-sm">No keywords to display.</p>
            </div>
        );
    }

    const max = Math.max(...keywords.map(k => k.value), 1);
    const isDark = document.documentElement.classList.contains("dark");
    const colors = isDark ? COLORS_DARK : COLORS_LIGHT;

    return (
        <div
            className="relative flex flex-wrap gap-3 gap-y-4 items-center justify-center p-4 min-h-[180px]"
            role="list"
            aria-label="Trending keywords word cloud"
        >
            {keywords.slice(0, 30).map((kw, i) => (
                <motion.button
                    key={kw.text}
                    initial={{ opacity: 0, scale: 0.5, rotate: getRotation(i) }}
                    animate={{ opacity: 1, scale: 1, rotate: getRotation(i) }}
                    whileHover={{
                        scale: 1.3,
                        rotate: 0,
                        zIndex: 20,
                        transition: { duration: 0.15 },
                    }}
                    whileTap={{ scale: 0.9 }}
                    transition={{
                        duration: 0.5,
                        delay: i * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => onSelect?.(kw.text)}
                    className={`word-cloud-tag relative cursor-pointer rounded-lg px-2 py-0.5 
            hover:bg-[var(--glass-hover)] transition-colors
            ${getSize(kw.value, max)} 
            ${colors[i % colors.length]}`}
                    title={`${kw.text}: ${kw.value} mentions`}
                    role="listitem"
                >
                    {kw.text}
                    <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-current flex items-center justify-center"
                    >
                        <span className="text-[8px] font-bold text-white">{kw.value}</span>
                    </motion.span>
                </motion.button>
            ))}
        </div>
    );
}
