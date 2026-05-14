import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div
        className={cn(
          "relative flex flex-row h-screen w-screen bg-background",
          "antialiased p-2 gap-2 select-none overflow-hidden",
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
      <Toaster position="top-center" expand={false} />
    </>
  );
}
