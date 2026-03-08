import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "hover";
}

export function GlassCard({ children, className, variant = "default", ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass-panel rounded-2xl p-6 relative overflow-hidden",
        variant === "hover" && "transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.4)]",
        className
      )} 
      {...props}
    >
      {/* Subtle top reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
