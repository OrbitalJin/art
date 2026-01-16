import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./sidebar";
import { SettingsDialog } from "./settings-dialog";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const settingsDialogOpen = useSettingsStore(
    (state) => state.settingsDialogOpen,
  );
  const setSettingsDialogOpen = useSettingsStore(
    (state) => state.setSettingsDialogOpen,
  );

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
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
      <Toaster position="top-center" expand={false} />
    </>
  );
}
