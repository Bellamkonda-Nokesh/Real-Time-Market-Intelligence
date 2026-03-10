import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggle } = useTheme();

    return (
        <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`relative w-10 h-10 rounded-xl overflow-hidden border transition-all duration-300 flex items-center justify-center ${theme === "dark"
                    ? "border-white/15 bg-white/8 hover:bg-white/15 hover:border-indigo-400/40"
                    : "border-blue-200/60 bg-white/80 hover:bg-blue-50 hover:border-blue-400/60 shadow-sm"
                } ${className}`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -90, scale: 0, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: 90, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                        <Moon className="w-4 h-4 text-indigo-300" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ rotate: 90, scale: 0, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: -90, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                        <Sun className="w-4 h-4 text-amber-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
