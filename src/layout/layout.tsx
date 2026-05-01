import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./sidebar";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { cn } from "@/lib/utils";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const open = useUIStateStore((state) => state.settingsDialogOpen);
  const setOpen = useUIStateStore((state) => state.setSettingsDialogOpen);

  return (
    <>
      <div
        className={cn(
          "relative flex flex-row h-screen w-screen bg-background",
          "font-sans antialiased p-2 gap-2 select-none overflow-hidden",
        )}
      >
        <main
          className={cn(
            "flex-1 flex transition-all duration-300 border rounded-md overflow-hidden",
          )}
        >
          {children}
        </main>
        <Sidebar />
      </div>
      <SettingsDialog open={open} onOpenChange={setOpen} />
      <Toaster position="top-center" expand={false} />
    </>
  );
}
