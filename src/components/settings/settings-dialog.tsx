import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageCircle, Palette, BookOpen } from "lucide-react";
import { ChatSettingsTab } from "./tabs/chat";
import { JournalSettingsTab } from "./tabs/journal";
import { AppearanceSettingTab } from "./tabs/appearance";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 overflow-scroll max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>Manage your preferences.</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="appearance"
          className="flex flex-col min-h-0 h-full gap-0"
        >
          <div className="p-2 border-b bg-muted/20">
            <TabsList className="w-full justify-start p-0 bg-transparent gap-6">
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

          <div className="overflow-y-auto bg-background scrollbar-thin">
            <TabsContent value="appearance" className="m-0 p-6 space-y-4">
              <AppearanceSettingTab />
            </TabsContent>

            <TabsContent value="chat" className="m-0 p-6 space-y-4">
              <ChatSettingsTab open={open} />
            </TabsContent>

            <TabsContent value="journal" className="m-0 p-6 space-y-4">
              <JournalSettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
