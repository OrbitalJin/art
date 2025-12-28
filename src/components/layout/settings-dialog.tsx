import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Copy, Eye, EyeOff, MessageCircle, Save } from "lucide-react";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { toast } from "sonner";
import { useCopy } from "@/hooks/use-copy";

type SettingsTab = "chat";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [tab, setTab] = React.useState<SettingsTab>("chat");
  const apiKey = useSettingsStore((state) => state.apiKey);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const [showKey, setShowKey] = React.useState(false);
  const [value, setValue] = React.useState(apiKey);
  const { copied, copy } = useCopy(value);

  const saveApiKey = () => {
    setApiKey(value);
    toast.success("API key saved successfully");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state);
        setValue(apiKey);
        setShowKey(false);
      }}
    >
      <DialogContent className="max-w-4xl p-0 gap-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-40 border-r p-2">
            <button
              onClick={() => setTab("chat")}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                tab === "chat"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted",
              )}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </button>
          </aside>

          {/* Content */}
          <div className="flex-1 p-6">
            {tab === "chat" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Chat Settings</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowKey((v) => !v)}
                    >
                      {showKey ? <EyeOff /> : <Eye />}
                    </Button>
                    <Input
                      id="apiKey"
                      type={showKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                    <Button onClick={saveApiKey}>
                      <Save />
                    </Button>
                    <Button variant="outline" onClick={copy}>
                      {copied ? <Check /> : <Copy />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
