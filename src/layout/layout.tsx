import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

const HiddenPlayer = lazy(() =>
  import("@/components/audio/hidden-player").then((m) => ({
    default: m.HiddenPlayer,
  })),
);

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
            "flex-1 flex transition-all duration-300 overflow-hidden",
          )}
        >
          {children}
        </main>

        <Sidebar />
      </div>
      <Suspense fallback={null}>
        <HiddenPlayer />
      </Suspense>
      <Toaster position="top-center" expand={false} />
    </>
  );
}
