import { cn } from "@/lib/utils";
import { ReactNode, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "hover" | "stat" | "gradient";
  tilt?: boolean;
  glow?: "none" | "primary" | "cyan" | "emerald" | "rose" | "violet";
  gradientFrom?: string;
  gradientTo?: string;
  delay?: number;
}

const glowMap = {
  none: "",
  primary: "hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]",
  cyan: "hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]",
  emerald: "hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]",
  rose: "hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]",
  violet: "hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]",
};

export function GlassCard({
  children, className, variant = "default", tilt = false,
  glow = "none", gradientFrom, gradientTo, delay = 0, ...props
}: GlassCardProps) {

  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 25 });
  const springY = useSpring(y, { stiffness: 200, damping: 25 });
  const rotateX = useTransform(springY, [-50, 50], [4, -4]);
  const rotateY = useTransform(springX, [-50, 50], [-4, 4]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }, [tilt, x, y]);

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const cardStyle = tilt ? {
    rotateX, rotateY,
    transformStyle: "preserve-3d" as const,
    transformPerspective: 1000,
  } : {};

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: delay * 0.08 }}
      style={cardStyle}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        "glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
        variant === "hover" && "hover:bg-[var(--glass-hover)] hover:-translate-y-1",
        variant === "stat" && "hover:-translate-y-2 cursor-default",
        variant === "gradient" && gradientFrom && gradientTo && `bg-gradient-to-br ${gradientFrom} ${gradientTo}`,
        glowMap[glow],
        className
      )}
      {...(props as any)}
    >
      {/* Top edge reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      {/* 3D inner shine on hover */}
      {tilt && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)" }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
