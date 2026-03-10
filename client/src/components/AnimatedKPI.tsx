import { motion, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedKPIProps {
    value: number | string;
    label: string;
    icon: React.ReactNode;
    sub?: string;
    subColor?: string;
    iconBg?: string;
    isLoading?: boolean;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    delay?: number;
}

export function AnimatedKPI({
    value, label, icon, sub, subColor = "text-[var(--text-muted)]",
    iconBg = "bg-indigo-500/15 text-indigo-400", isLoading = false,
    prefix = "", suffix = "", decimals = 0, delay = 0
}: AnimatedKPIProps) {
    const counterRef = useRef<HTMLSpanElement>(null);
    const numericValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;

    useEffect(() => {
        if (isLoading || !counterRef.current || typeof value !== "number") return;
        const controls = animate(0, numericValue, {
            duration: 1.2,
            delay,
            ease: [0.22, 1, 0.36, 1],
            onUpdate(latest) {
                if (counterRef.current) {
                    counterRef.current.textContent = prefix + latest.toFixed(decimals) + suffix;
                }
            },
        });
        return () => controls.stop();
    }, [value, isLoading, delay, decimals, prefix, suffix, numericValue]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: delay * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-default"
        >
            {/* Background shimmer on hover */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(6,182,212,0.05) 100%)"
                }}
            />

            {/* Top reflection */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <span className="text-[var(--text-secondary)] font-medium text-sm">{label}</span>
                    <motion.div
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        className={`p-2.5 rounded-xl ${iconBg} transition-colors`}
                    >
                        {icon}
                    </motion.div>
                </div>

                <div className="flex items-end gap-2">
                    {isLoading ? (
                        <div className="h-10 w-24 shimmer rounded-xl" />
                    ) : (
                        <span
                            className="text-4xl font-display font-extrabold text-[var(--text-primary)] tracking-tight"
                            style={{ fontFamily: "'JetBrains Mono', 'Outfit', monospace" }}
                        >
                            {typeof value === "number" ? (
                                <span ref={counterRef}>{prefix}0{suffix}</span>
                            ) : (
                                value
                            )}
                        </span>
                    )}
                </div>

                {sub && (
                    <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold ${subColor}`}>{sub}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ── Sentiment Gauge ────────────────────────────────────────────── */
interface GaugeProps {
    score: number;   // -1 to 1
    size?: number;
    isLoading?: boolean;
}

export function SentimentGauge({ score, size = 160, isLoading = false }: GaugeProps) {
    const normalised = (score + 1) / 2;          // 0–1
    const degrees = normalised * 180;           // 0–180 degrees (half circle)
    const color = score >= 0.05 ? "#10b981" : score <= -0.05 ? "#f43f5e" : "#f59e0b";
    const label = score >= 0.05 ? "Bullish" : score <= -0.05 ? "Bearish" : "Neutral";

    // SVG gauge path
    const r = 60;
    const cx = size / 2;
    const cy = size * 0.68;

    // Convert angle to coordinates (starting at left = 180°, right = 0°)
    const toXY = (angleDeg: number) => {
        const rad = ((180 - angleDeg) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
    };

    const start = toXY(0);
    const end = toXY(180);
    const arcBg = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;

    // Needle tip
    const needleRad = ((180 - degrees) * Math.PI) / 180;
    const nx = cx + r * Math.cos(needleRad);
    const ny = cy - r * Math.sin(needleRad);

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
                {/* Background arc */}
                <path d={arcBg} fill="none" stroke="var(--glass-border)" strokeWidth={14} strokeLinecap="round" />

                {/* Coloured progress arc */}
                <motion.path
                    d={arcBg}
                    fill="none"
                    stroke={color}
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeDasharray={`${Math.PI * r * normalised} ${Math.PI * r * (1 - normalised)}`}
                    initial={{ strokeDasharray: `0 ${Math.PI * r}` }}
                    animate={{ strokeDasharray: `${Math.PI * r * normalised} ${Math.PI * r * (1 - normalised)}` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Needle */}
                {!isLoading && (
                    <motion.line
                        x1={cx} y1={cy}
                        initial={{ x2: cx, y2: cy - r }}
                        animate={{ x2: nx, y2: ny }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        stroke={color}
                        strokeWidth={3}
                        strokeLinecap="round"
                    />
                )}

                {/* Center dot */}
                <circle cx={cx} cy={cy} r={6} fill={color} />

                {/* Labels */}
                <text x={14} y={cy + 20} fontSize={9} fill="var(--text-muted)" textAnchor="middle">−1</text>
                <text x={cx} y={cy - r - 8} fontSize={9} fill="var(--text-muted)" textAnchor="middle">0</text>
                <text x={size - 14} y={cy + 20} fontSize={9} fill="var(--text-muted)" textAnchor="middle">+1</text>
            </svg>

            {/* Score label */}
            <div className="text-center">
                <motion.p
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-2xl font-mono font-bold"
                    style={{ color }}
                >
                    {score >= 0 ? "+" : ""}{score.toFixed(3)}
                </motion.p>
                <p className="text-sm font-semibold text-[var(--text-muted)] mt-0.5">{label}</p>
            </div>
        </div>
    );
}
