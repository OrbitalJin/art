import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./sidebar";
import { HiddenPlayer } from "@/components/audio/hidden-player";
import { QuickCapture } from "@/components/capture/quick-capture";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div
        className={cn(
          "relative flex flex-row h-screen w-screen bg-background border rounded-md",
          "antialiased select-none overflow-hidden",
        )}
      >
        <main
          className={cn(
            "flex-1 flex transition-all duration-300 overflow-hidden border-r",
          )}
        >
          {children}
        </main>
        <Sidebar />
      </div>
      <HiddenPlayer />
      <QuickCapture />
      <Toaster position="top-center" expand={false} />
    </>
  );
}
