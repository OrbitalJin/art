import { CommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative flex h-screen w-screen bg-background font-sans antialiased p-2">
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
