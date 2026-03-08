import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, BarChart3, Newspaper, Crosshair, LogOut, Menu } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Overview", url: "/dashboard", icon: Activity },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "News Feed", url: "/news", icon: Newspaper },
  { title: "Watchlists", url: "/watchlists", icon: Crosshair },
];

function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-white/5 bg-background/50 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-wide">Sentix</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                          isActive 
                            ? "bg-white/10 text-white shadow-sm border border-white/10" 
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5", isActive ? "text-cyan-400" : "")} />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-6">
        <Link 
          href="/" 
          className="flex items-center gap-3 text-white/50 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Exit</span>
        </Link>
      </div>
    </Sidebar>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-[600px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <AppSidebar />
        
        <div className="flex flex-col flex-1 relative z-10">
          <header className="flex items-center h-16 px-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-20">
            <SidebarTrigger className="text-white/70 hover:text-white md:hidden mr-4" />
            <div className="ml-auto flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-xs font-medium text-white/70">Live Data</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white/20" />
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
