import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Palette,
  BookOpen,
  Settings2,
  UserCircle,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { ChatSettingsTab } from "./tabs/chat";
import { IdentitiesSettingsTab } from "./tabs/identities";
import { JournalSettingsTab } from "./tabs/journal";
import { AppearanceSettingTab } from "./tabs/appearance";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { toast } from "sonner";

function AppVersion() {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;

    async function loadVersion() {
      try {
        const appVersion = await getVersion();
        if (mounted) {
          setVersion(appVersion);
        }
      } catch (error) {
        console.error("Failed to get app version:", error);
        if (mounted) {
          setVersion("Unknown");
        }
      }
    }

    void loadVersion();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <p className="text-sm text-muted-foreground">
      {version ? `v${version}` : "Loading version..."}
    </p>
  );
}

export const SettingsDialog = () => {
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const settingsOpen = useUIStateStore((state) => state.settingsDialogOpen);
  const setSettingsOpen = useUIStateStore(
    (state) => state.setSettingsDialogOpen,
  );

  const [showResetDialog, setShowResetDialog] = useState(false);
  const handleReset = () => {
    resetSettings();
    localStorage.removeItem("vite-ui-theme-mode");
    localStorage.removeItem("vite-ui-theme-color");
    setShowResetDialog(false);
    toast.success("Settings reset to defaults");
    window.location.reload();
  };
  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-10 w-10 text-muted-foreground hover:text-foreground transition-all",
            settingsOpen && "text-foreground bg-accent",
          )}
          aria-label="Settings"
        >
          <Settings2 size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-scroll p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>Manage your preferences.</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="chat"
          className="flex h-full min-h-0 flex-col gap-0"
        >
          <div className="border-b bg-muted/20 p-2">
            <TabsList className="w-full justify-start gap-6 bg-transparent p-0">
              <TabsTrigger value="chat">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </div>
              </TabsTrigger>

              <TabsTrigger value="identities">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Identities
                </div>
              </TabsTrigger>

              <TabsTrigger value="appearance">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </div>
              </TabsTrigger>

              <TabsTrigger value="journal">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Journal
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="scrollbar-thin overflow-y-auto bg-background">
            <TabsContent value="chat" className="m-0 space-y-4 p-6">
              <ChatSettingsTab />
            </TabsContent>

            <TabsContent value="identities" className="m-0 space-y-4 p-6">
              <IdentitiesSettingsTab />
            </TabsContent>

            <TabsContent value="appearance" className="m-0 space-y-4 p-6">
              <AppearanceSettingTab />
            </TabsContent>

            <TabsContent value="journal" className="m-0 space-y-4 p-6">
              <JournalSettingsTab />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t px-6 py-3">
          <div className="flex flex-row items-center justify-between flex-1">
            <AlertDialog
              open={showResetDialog}
              onOpenChange={setShowResetDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-35 hover:opacity-100 hover:text-destructive"
                >
                  <RotateCcw />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to Factory?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently erase all your settings and restore
                    defaults. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleReset}
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div />
            <AppVersion />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
