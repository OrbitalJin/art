import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="relative flex gap-2 p-2 flex-row h-dvh w-full bg-background font-sans antialiased">
      <Sidebar
        className="absolute left-4 top-4 z-20"
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          "flex-1 flex transition-all duration-300 border rounded-md",
        )}
      >
        {children}
      </main>
      <Toaster position="bottom-right" expand={false} />
      <CommandPalette />
    </div>
  );
}
