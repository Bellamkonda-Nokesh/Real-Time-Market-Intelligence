import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity, BarChart3, Newspaper, Crosshair,
  LogOut, Menu, X, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

const navItems = [
  { title: "Overview", url: "/dashboard", icon: Activity, color: "text-cyan-400" },
  { title: "Analytics", url: "/analytics", icon: BarChart3, color: "text-violet-400" },
  { title: "News Feed", url: "/news", icon: Newspaper, color: "text-blue-400" },
  { title: "Watchlists", url: "/watchlists", icon: Crosshair, color: "text-emerald-400" },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const [location] = useLocation();
  const { data: user } = useAuth();
  const logout = useLogout();
  const { theme } = useTheme();

  const handleLogout = async () => {
    await logout.mutateAsync();
    window.location.href = "/";
  };

  const isLight = theme === "light";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${isLight
                ? "bg-white/25 shadow-white/20"
                : "bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-indigo-500/40"
              }`}
          >
            <Activity className={`w-5 h-5 ${isLight ? "text-white" : "text-white"}`} />
          </motion.div>
          <div>
            <span className={`font-display font-extrabold text-xl ${isLight ? "text-white" : "text-white"}`}>
              Sentix
            </span>
            <div className={`text-xs ${isLight ? "text-white/60" : "text-white/40"} font-medium -mt-0.5`}>
              Intelligence Platform
            </div>
          </div>
        </Link>
      </div>

      {/* Live status */}
      <div className="px-4 mb-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${isLight ? "bg-white/15 text-white/80" : "bg-white/5 text-white/60"
          }`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 status-pulse flex-shrink-0" />
          Live Data Active
        </div>
      </div>

      {/* Nav label */}
      <div className={`px-6 mb-2 text-xs font-semibold uppercase tracking-widest ${isLight ? "text-white/50" : "text-white/30"}`}>
        Navigation
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {navItems.map((item, i) => {
          const isActive = location === item.url;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={item.url}
                onClick={onNav}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                  isActive
                    ? isLight
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white border border-white/10"
                    : isLight
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-white/55 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className={`absolute inset-0 rounded-xl ${isLight ? "bg-white/15" : "bg-white/8"}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? item.color : "")} />
                <span className="font-medium text-sm relative z-10">{item.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className={`ml-auto w-1.5 h-1.5 rounded-full relative z-10 ${item.color.replace("text-", "bg-")
                      }`}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom: user card + logout */}
      <div className="p-4 mt-auto space-y-3">
        <Link
          href="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${isLight ? "text-white/50 hover:text-white hover:bg-white/10" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
        >
          <Home className="w-4 h-4" />
          Landing Page
        </Link>

        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center gap-3 p-3 rounded-xl border ${isLight ? "bg-white/15 border-white/20" : "bg-white/5 border-white/10"
              }`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
              {user.avatarInitials ?? user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isLight ? "text-white" : "text-white"}`}>
                {user.fullName}
              </p>
              <p className={`text-xs truncate ${isLight ? "text-white/60" : "text-white/40"}`}>
                {user.email}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isLight ? "bg-white/10 border-white/15" : "bg-white/5 border-white/10"}`}>
            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 bg-white/15 rounded animate-pulse w-20" />
              <div className="h-2 bg-white/10 rounded animate-pulse w-28" />
            </div>
          </div>
        )}

        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 3 }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm border border-transparent ${isLight
              ? "text-white/60 hover:text-red-200 hover:bg-red-500/15 hover:border-red-300/20"
              : "text-white/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20"
            }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const { data: user } = useAuth();
  const isLight = theme === "light";

  const sidebarBg = isLight
    ? "bg-gradient-to-b from-blue-600 to-blue-800"
    : "bg-[hsl(222_47%_6%/0.95)] backdrop-blur-xl";

  return (
    <div className={`flex min-h-screen w-full relative ${isLight ? "bg-[hsl(210_40%_96%)]" : "bg-[hsl(222_47%_5%)]"}`}>
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[700px] h-[500px] rounded-full blur-[130px] pointer-events-none z-0"
        style={{ background: "var(--bg-blob-1)" }} />
      <div className="fixed bottom-0 left-56 w-[500px] h-[400px] rounded-full blur-[100px] pointer-events-none z-0"
        style={{ background: "var(--bg-blob-2)" }} />

      {/* ── Desktop sidebar ── */}
      <aside className={`hidden md:flex flex-col w-72 fixed inset-y-0 left-0 z-30 border-r ${isLight
          ? "border-blue-700/30 shadow-xl shadow-blue-900/20"
          : "border-white/5"
        } ${sidebarBg}`}>
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className={`fixed inset-y-0 left-0 w-72 z-50 md:hidden border-r ${isLight ? "border-blue-700/30" : "border-white/5"
                } ${sidebarBg}`}
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col md:ml-72 relative z-10 min-h-screen">
        {/* Topbar */}
        <header className={`sticky top-0 z-20 h-16 flex items-center px-4 md:px-6 gap-4 border-b backdrop-blur-xl ${isLight
            ? "bg-white/70 border-blue-100/60 shadow-sm"
            : "bg-[hsl(222_47%_5%/0.7)] border-white/5"
          }`}>
          <button
            onClick={() => setMobileOpen(true)}
            className={`md:hidden p-2 rounded-xl transition-colors ${isLight ? "text-gray-600 hover:bg-blue-50" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb / page title placeholder */}
          <div className="flex-1" />

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${isLight
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-white/5 border-white/10 text-white/60"
                }`}
            >
              <div className={`w-2 h-2 rounded-full status-pulse ${isLight ? "bg-emerald-500" : "bg-emerald-400"}`} />
              Live
            </motion.div>

            <ThemeToggle />

            {/* User avatar */}
            {user && (
              <motion.div
                whileHover={{ scale: 1.06 }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-default"
                title={user.fullName}
              >
                {user.avatarInitials ?? user.fullName.slice(0, 2).toUpperCase()}
              </motion.div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
