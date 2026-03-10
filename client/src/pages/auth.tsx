import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, Eye, EyeOff, LogIn, UserPlus, ArrowRight, Sparkles, ChevronLeft,
} from "lucide-react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme";

type Tab = "login" | "register";

export default function AuthPage() {
    const [, navigate] = useLocation();
    const [tab, setTab] = useState<Tab>("login");
    const [showPw, setShowPw] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const login = useLogin();
    const register = useRegister();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login.mutateAsync({ email: loginEmail, password: loginPassword });
            navigate("/dashboard");
        } catch (err: any) {
            toast({ title: "Login failed", description: err.message, variant: "destructive" });
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register.mutateAsync({ email: regEmail, password: regPassword, fullName: regName });
            navigate("/dashboard");
        } catch (err: any) {
            toast({ title: "Registration failed", description: err.message, variant: "destructive" });
        }
    };

    const inputCls = `w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${isDark
            ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            : "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 shadow-sm"
        }`;

    const labelCls = `block text-sm font-semibold mb-1.5 ${isDark ? "text-white/65" : "text-gray-600"}`;

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDark ? "bg-[hsl(222_47%_5%)]" : "bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white"
            }`}>
            {/* Background blobs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
                style={{ background: isDark ? "rgba(99,102,241,0.14)" : "rgba(99,102,241,0.08)" }} />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
                style={{ background: isDark ? "rgba(6,182,212,0.10)" : "rgba(6,182,212,0.06)" }} />

            {/* Theme toggle top-right */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                <ThemeToggle />
            </div>

            {/* Back link */}
            <motion.a
                href="/"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`fixed top-4 left-4 flex items-center gap-1.5 text-sm font-medium transition-colors z-50 ${isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"
                    }`}
            >
                <ChevronLeft className="w-4 h-4" /> Home
            </motion.a>

            {/* Auth card */}
            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${isDark
                        ? "bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-black/50"
                        : "bg-white border border-gray-100 shadow-blue-100/40"
                    }`}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Card top gradient stripe */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

                <div className="p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4"
                        >
                            <Activity className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className={`font-display text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Sentix
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                            Intelligence Dashboard
                        </p>
                    </div>

                    {/* Tab switcher */}
                    <div className={`flex rounded-xl p-1 mb-8 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"}`}>
                        {(["login", "register"] as Tab[]).map(t => (
                            <motion.button
                                key={t}
                                onClick={() => setTab(t)}
                                layout
                                className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10 ${tab === t
                                        ? "text-white"
                                        : isDark ? "text-white/45 hover:text-white/70" : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab === t && (
                                    <motion.div
                                        layoutId="tabBg"
                                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-md"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {t === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                    {t === "login" ? "Sign In" : "Register"}
                                </span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Forms */}
                    <AnimatePresence mode="wait">
                        {tab === "login" ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.22 }}
                                onSubmit={handleLogin}
                                className="space-y-4"
                            >
                                <div>
                                    <label className={labelCls}>Email Address</label>
                                    <input id="login-email" type="email" required value={loginEmail}
                                        onChange={e => setLoginEmail(e.target.value)}
                                        placeholder="you@example.com" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Password</label>
                                    <div className="relative">
                                        <input id="login-password" type={showPw ? "text" : "password"} required
                                            value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                                            placeholder="••••••••" className={`${inputCls} pr-12`} />
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isDark ? "text-white/35 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`}>
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    id="login-submit"
                                    type="submit"
                                    disabled={login.isPending}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full mt-3 py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                                >
                                    {login.isPending
                                        ? <div className="w-5 h-5 rounded-full border-2 border-t-white border-white/30 animate-spin" />
                                        : <><LogIn className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" /></>
                                    }
                                </motion.button>

                                <p className={`text-center text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>
                                    Don't have an account?{" "}
                                    <button type="button" onClick={() => setTab("register")} className="text-indigo-400 hover:text-indigo-300 font-semibold">
                                        Register free
                                    </button>
                                </p>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="register"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.22 }}
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <div>
                                    <label className={labelCls}>Full Name</label>
                                    <input id="reg-name" type="text" required minLength={2}
                                        value={regName} onChange={e => setRegName(e.target.value)}
                                        placeholder="John Doe" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Email Address</label>
                                    <input id="reg-email" type="email" required
                                        value={regEmail} onChange={e => setRegEmail(e.target.value)}
                                        placeholder="you@example.com" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Password <span className={`text-xs font-normal ${isDark ? "text-white/30" : "text-gray-400"}`}>(min 6 chars)</span>
                                    </label>
                                    <div className="relative">
                                        <input id="reg-password" type={showPw ? "text" : "password"} required minLength={6}
                                            value={regPassword} onChange={e => setRegPassword(e.target.value)}
                                            placeholder="••••••••" className={`${inputCls} pr-12`} />
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isDark ? "text-white/35 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`}>
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    id="register-submit"
                                    type="submit"
                                    disabled={register.isPending}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full mt-3 py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                                >
                                    {register.isPending
                                        ? <div className="w-5 h-5 rounded-full border-2 border-t-white border-white/30 animate-spin" />
                                        : <><Sparkles className="w-4 h-4" /> Create Account</>
                                    }
                                </motion.button>

                                <p className={`text-center text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>
                                    Already have an account?{" "}
                                    <button type="button" onClick={() => setTab("login")} className="text-indigo-400 hover:text-indigo-300 font-semibold">
                                        Sign in
                                    </button>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
