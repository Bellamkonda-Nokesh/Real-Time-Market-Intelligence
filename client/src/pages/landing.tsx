import { Link } from "wouter";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, Zap, Globe } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

export default function Landing() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden pt-20 pb-32">
      {/* Decorative background meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/20 blur-[120px]" />

      <nav className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 glass-panel border-x-0 border-t-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">Sentix</span>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/dashboard" 
            className="px-6 py-2.5 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-md"
          >
            Sign In
          </Link>
          <Link 
            href="/dashboard" 
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hidden sm:block"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center mt-12"
      >
        <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-cyan-500/30 bg-cyan-500/5 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-cyan-300 text-sm font-semibold uppercase tracking-wider">Introducing Real-Time Intel</span>
        </motion.div>

        <motion.h1 variants={item} className="text-5xl md:text-7xl font-display font-extrabold text-white leading-tight max-w-4xl">
          Decode the markets with <br/>
          <span className="text-gradient">Glass Intelligence</span>
        </motion.h1>

        <motion.p variants={item} className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl">
          Instantly analyze financial news, track corporate sentiment, and get ahead of the curve using our real-time AI processing engine.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/dashboard" 
            className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:scale-105 transition-all duration-300"
          >
            Launch Dashboard
          </Link>
        </motion.div>

        <motion.div variants={container} className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <GlassCard variant="hover">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
              <Zap className="text-indigo-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Real-Time Processing</h3>
            <p className="text-white/60">We ingest thousands of articles globally, processing sentiment in milliseconds to keep you updated.</p>
          </GlassCard>

          <GlassCard variant="hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
              <Globe className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Market Coverage</h3>
            <p className="text-white/60">Comprehensive scanning of major financial outlets, niche blogs, and verified corporate press releases.</p>
          </GlassCard>

          <GlassCard variant="hover">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-6">
              <ShieldAlert className="text-rose-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Threshold Alerts</h3>
            <p className="text-white/60">Set custom watchlists and let our engine notify you the moment sentiment shifts beyond your parameters.</p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
