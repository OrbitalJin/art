import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Save,
  Eye,
  EyeOff,
  Check,
  Palette,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useTheme, type ThemeColor } from "@/contexts/theme-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const THEME_COLORS: Array<{ value: ThemeColor; label: string }> = [
  {
    value: "amethyst haze",
    label: "Amethyst Haze",
  },

  {
    value: "cosmic night",
    label: "Cosmic Night",
  },
  {
    value: "midnight bloom",
    label: "Midnight Bloom",
  },
  {
    value: "violet bloom",
    label: "Violet Bloom",
  },
  {
    value: "quantum rose",
    label: "Quantum Rose",
  },
  {
    value: "flutter shy",
    label: "Flutter Shy",
  },
  {
    value: "pastel dreams",
    label: "Pastel Dreams",
  },

  {
    value: "claude",
    label: "Claude",
  },
] as const;

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { mode, setMode, color, setColor } = useTheme();

  const apiKey = useSettingsStore((state) => state.apiKey);
  const setApiKey = useSettingsStore((state) => state.setApiKey);

  const [showKey, setShowKey] = React.useState(false);
  const [value, setValue] = React.useState(apiKey);

  const handleSave = () => {
    setApiKey(value);
    toast.success("Settings saved");
  };

  React.useEffect(() => {
    if (open) {
      setValue(apiKey);
      setShowKey(false);
    }
  }, [open, apiKey]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 shrink-0">
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>Manage your preferences.</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="chat"
          className="flex-1 flex flex-col overflow-hidden p-2"
        >
          <TabsList className="w-full">
            <TabsTrigger value="chat">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </div>
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto bg-background p-8">
            <TabsContent value="chat" className="mt-0 space-y-8 max-w-3xl">
              <div>
                <h3 className="text-lg font-medium">Model Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the AI model used for generating notes and chatting.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-base font-medium">API Key</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <div className="relative flex-1 max-w-xl">
                      <Input
                        id="apiKey"
                        type={showKey ? "text" : "password"}
                        placeholder="sk-..."
                        className="pr-10 font-mono text-sm"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none"
                      >
                        {showKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={value === apiKey}
                      className="min-w-[100px]"
                    >
                      {value === apiKey ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* === APPEARANCE TAB === */}
            <TabsContent
              value="appearance"
              className="mt-0 space-y-8 max-w-3xl"
            >
              <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the application.
                </p>
              </div>

              {/* Mode Selection */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-base font-medium">Interface Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred background mode.
                    </p>
                  </div>
                  <div className="grid max-w-md grid-cols-3 gap-4 pt-2">
                    <button
                      onClick={() => setMode("light")}
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md",
                        "border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                        mode === "light" && "border-primary bg-accent",
                      )}
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => setMode("dark")}
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md",
                        "border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                        mode === "dark" && "border-primary bg-accent",
                      )}
                    >
                      <Moon className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                    <button
                      onClick={() => setMode("system")}
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md",
                        "border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                        mode === "system" && "border-primary bg-accent",
                      )}
                    >
                      <Monitor className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Selection (Dropdown) */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-base font-medium">Accent Color</p>
                    <p className="text-sm text-muted-foreground">
                      Select the color palette for the application.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Select
                      value={color}
                      onValueChange={(val: ThemeColor) => setColor(val)}
                    >
                      <SelectTrigger className="w-full max-w-[280px]">
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {THEME_COLORS.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/20",
                                  "bg-primary border border-border",
                                )}
                              />
                              <span>{theme.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
