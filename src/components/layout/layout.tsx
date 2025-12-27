import { CommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { LayoutDashboard, MessageCircle } from "lucide-react";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="relative flex flex-row h-screen w-screen bg-background font-sans antialiased p-2 gap-2">
      <aside className="flex flex-col items-center h-full border rounded-md p-2 gap-2">
        <Button size="icon" variant="outline" onClick={() => navigate("/")}>
          <LayoutDashboard />
        </Button>
        <Button size="icon" variant="outline" onClick={() => navigate("/chat")}>
          <MessageCircle />
        </Button>
      </aside>
      <main
        className={cn(
          "flex-1 flex transition-all duration-300 border rounded-md",
        )}
      >
        {children}
      </main>
      <Toaster position="top-center" expand={false} />
      <CommandPalette />
    </div>
  );
}
