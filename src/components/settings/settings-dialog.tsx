import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Palette, BookOpen } from "lucide-react";
import { ChatSettingsTab } from "./tabs/chat";
import { JournalSettingsTab } from "./tabs/journal";
import { AppearanceSettingTab } from "./tabs/appearance";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-scroll p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>Manage your preferences.</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="appearance"
          className="flex h-full min-h-0 flex-col gap-0"
        >
          <div className="border-b bg-muted/20 p-2">
            <TabsList className="w-full justify-start gap-6 bg-transparent p-0">
              <TabsTrigger value="appearance">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </div>
              </TabsTrigger>

              <TabsTrigger value="chat">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
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
            <TabsContent value="appearance" className="m-0 space-y-4 p-6">
              <AppearanceSettingTab />
            </TabsContent>

            <TabsContent value="chat" className="m-0 space-y-4 p-6">
              <ChatSettingsTab open={open} />
            </TabsContent>

            <TabsContent value="journal" className="m-0 space-y-4 p-6">
              <JournalSettingsTab />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t px-6 py-3">
          <AppVersion />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
