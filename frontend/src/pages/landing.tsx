import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Activity, BarChart3, Brain, Shield, TrendingUp,
  Zap, Globe, ArrowRight, ChevronDown, Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme";
import { useRef, useState, useEffect } from "react";

// ── Animated counter ───────────────────────────────────────────────
function Counter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

// ── Floating particle ──────────────────────────────────────────────
function Particle({ x, y, delay, size, color }: { x: number; y: number; delay: number; size: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

const PARTICLES = [
  { x: 10, y: 20, d: 0, s: 6, c: "rgba(99,102,241,0.6)" },
  { x: 85, y: 15, d: 1.2, s: 4, c: "rgba(6,182,212,0.6)" },
  { x: 75, y: 70, d: 0.8, s: 8, c: "rgba(16,185,129,0.5)" },
  { x: 20, y: 75, d: 2.1, s: 5, c: "rgba(139,92,246,0.6)" },
  { x: 50, y: 10, d: 1.5, s: 3, c: "rgba(236,72,153,0.5)" },
  { x: 92, y: 45, d: 0.4, s: 7, c: "rgba(245,158,11,0.5)" },
  { x: 5, y: 50, d: 2.8, s: 4, c: "rgba(99,102,241,0.4)" },
  { x: 60, y: 85, d: 1.9, s: 6, c: "rgba(6,182,212,0.4)" },
];

// ── Feature card ───────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, title, description, color, delay,
}: {
  icon: any; title: string; description: string; color: string; delay: number;
}) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: delay * 0.1, ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative rounded-2xl p-6 border overflow-hidden group cursor-default ${theme === "light"
        ? "bg-white border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-blue-100/50"
        : "bg-white/[0.04] border-white/8 backdrop-blur-xl hover:bg-white/[0.07]"
        }`}
    >
      {/* Gradient corner glow */}
      <div className={`absolute -top-6 -right-6 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${color}`} />

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-15 text-white`}>
        <Icon className="w-6 h-6" />
      </div>

      <h3 className={`font-display font-bold text-lg mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
        {description}
      </p>
    </motion.div>
  );
}

// ── Stat bubble ────────────────────────────────────────────────────
function StatBubble({ value, suffix, label, color, delay }: {
  value: number; suffix?: string; label: string; color: string; delay: number;
}) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: delay * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`text-center p-6 rounded-2xl border ${theme === "light"
        ? "bg-white border-gray-100 shadow-md"
        : "bg-white/5 border-white/8"
        }`}
    >
      <div className={`text-4xl font-display font-black mb-1 ${color}`}>
        <Counter end={value} suffix={suffix} />
      </div>
      <div className={`text-sm font-medium ${theme === "dark" ? "text-white/50" : "text-gray-500"}`}>
        {label}
      </div>
    </motion.div>
  );
}

// ── Main Landing ───────────────────────────────────────────────────
export default function Landing() {
  const { theme } = useTheme();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDark ? "bg-[hsl(222_47%_5%)]" : "bg-gradient-to-br from-slate-50 via-blue-50/50 to-white"}`}>

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b backdrop-blur-xl ${isDark
          ? "bg-[hsl(222_47%_5%/0.7)] border-white/5"
          : "bg-white/70 border-blue-100/60 shadow-sm"
          }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className={`font-display font-extrabold text-xl ${isDark ? "text-white" : "text-gray-900"}`}>
            Sentix
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/auth"
            className={`hidden sm:block px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${isDark
              ? "border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5"
              : "border-gray-200 text-gray-600 hover:text-gray-900 hover:border-blue-200 hover:bg-blue-50/50"
              }`}
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated particles */}
        {PARTICLES.map((p, i) => (
          <Particle key={i} x={p.x} y={p.y} delay={p.d} size={p.s} color={p.c} />
        ))}

        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
          style={{ background: isDark ? "rgba(79,70,229,0.12)" : "rgba(79,70,229,0.06)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] rounded-full blur-[130px] pointer-events-none"
          style={{ background: isDark ? "rgba(6,182,212,0.10)" : "rgba(6,182,212,0.06)" }} />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-8 ${isDark
              ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300"
              : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Market Intelligence
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`text-5xl md:text-7xl font-display font-black leading-tight mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Understand the{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="text-gradient">Market Pulse</span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full origin-left"
              />
            </span>
            {" "}in Real Time
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className={`text-xl md:text-2xl leading-relaxed mb-10 max-w-2xl mx-auto ${isDark ? "text-white/60" : "text-gray-500"}`}
          >
            Sentix combines live news ingestion, NLP sentiment analysis, 7-day forecasting,
            and beautiful analytics into one powerful intelligence platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/auth"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
              >
                Launch Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/auth"
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg border transition-all ${isDark
                  ? "border-white/15 text-white/80 hover:bg-white/5 hover:border-white/30"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
              >
                Free Account
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className={`w-6 h-6 ${isDark ? "text-white/30" : "text-gray-300"}`} />
        </motion.div>
      </section>

      {/* ── Stats row ───────────────────────────────────────────── */}
      <section className={`py-20 px-6 border-y ${isDark ? "border-white/5" : "border-gray-100"}`}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatBubble value={15000} suffix="+" label="Articles Analyzed" color="text-indigo-500" delay={0} />
          <StatBubble value={98} suffix="%" label="Sentiment Accuracy" color="text-cyan-500" delay={1} />
          <StatBubble value={7} suffix="-day" label="Forecast Horizon" color="text-emerald-500" delay={2} />
          <StatBubble value={24} suffix="/7" label="Live Monitoring" color="text-violet-500" delay={3} />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-display font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Everything you need to{" "}
              <span className="text-gradient">stay ahead</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-white/50" : "text-gray-500"}`}>
              A complete platform for market intelligence, from raw news to actionable insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: "Multi-Source News", description: "Fetch live articles from NewsAPI and multiple sources. Filter by keyword, topic, or sentiment in real time.", color: "bg-indigo-500", delay: 0 },
              { icon: Brain, title: "AI Sentiment Analysis", description: "VADER-inspired NLP engine scores every headline instantly. Positive, negative, or neutral — know the market mood.", color: "bg-violet-500", delay: 1 },
              { icon: TrendingUp, title: "7-Day Forecasting", description: "Linear regression trend prediction using your historical sentiment data. Plan ahead with confidence intervals.", color: "bg-cyan-500", delay: 2 },
              { icon: BarChart3, title: "Source Leaderboard", description: "Track which news sources skew bullish or bearish. Understand bias and weight your information accordingly.", color: "bg-emerald-500", delay: 3 },
              { icon: Zap, title: "Live Analyzer", description: "Paste any text and get instant sentiment scoring with confidence level and historical tracking.", color: "bg-amber-500", delay: 4 },
              { icon: Shield, title: "Watchlist Alerts", description: "Monitor specific companies and entities. Set custom alert thresholds to get notified of sentiment shifts.", color: "bg-rose-500", delay: 5 },
            ].map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={`max-w-4xl mx-auto rounded-3xl overflow-hidden relative ${isDark ? "border border-white/10" : "shadow-2xl shadow-blue-100"
            }`}
          style={{ background: "linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4)" }}
        >
          {/* Animated background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-cyan-300/15 blur-2xl" />
          </div>

          <div className="relative z-10 text-center py-16 px-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-12 h-12 text-white/80" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
              Start monitoring markets today
            </h2>
            <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
              Free account. No credit card. Powered by real-time AI.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-600 font-bold text-lg hover:shadow-xl hover:shadow-indigo-900/30 transition-all"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className={`py-10 px-6 text-center border-t ${isDark ? "border-white/5 text-white/30" : "border-gray-100 text-gray-400"} text-sm`}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className={`font-display font-bold ${isDark ? "text-white/60" : "text-gray-600"}`}>Sentix</span>
        </div>
        <p>Real-Time Market Intelligence &amp; Sentiment Analysis Platform</p>
        <p className="mt-1 opacity-60">&copy; {new Date().getFullYear()}Nokesh Bellamkonda. All rights reserved.</p>
      </footer>
    </div>
  );
}
