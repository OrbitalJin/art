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
  { value: "amethyst haze", label: "Amethyst Haze" },
  { value: "cosmic night", label: "Cosmic Night" },
  { value: "midnight bloom", label: "Midnight Bloom" },
  { value: "violet bloom", label: "Violet Bloom" },
  { value: "quantum rose", label: "Quantum Rose" },
  { value: "flutter shy", label: "Flutter Shy" },
  { value: "pastel dreams", label: "Pastel Dreams" },
  { value: "t3 chat", label: "T3 Chat" },
  { value: "claude", label: "Claude" },
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
      <DialogContent className="flex flex-col gap-0 p-0 overflow-scroll max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>Manage your preferences.</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="chat"
          className="flex flex-col min-h-0 h-full gap-0"
        >
          <div className="p-2 border-b bg-muted/20">
            <TabsList className="w-full justify-start p-0 bg-transparent gap-6">
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
          </div>

          <div className="overflow-y-auto bg-background scrollbar-thin">
            {/* Chat Tab */}
            <TabsContent value="chat" className="m-0 p-6 space-y-8">
              <div className="max-w-3xl">
                <h3 className="text-lg font-medium">Model Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the model.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="space-y-4">
                  <p className="text-base font-medium">Secrect Key</p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        type={showKey ? "text" : "password"}
                        placeholder="secret key"
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
                      className="min-w-[100px] w-full sm:w-auto"
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

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="m-0 p-6 space-y-8">
              <div className="max-w-3xl">
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the application.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-base font-medium">Interface Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred background mode.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {[
                      { id: "light", icon: Sun, label: "Light" },
                      { id: "dark", icon: Moon, label: "Dark" },
                      { id: "system", icon: Monitor, label: "System" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMode(t.id as any)}
                        className={cn(
                          "flex items-center gap-3 sm:flex-col sm:justify-between rounded-md border-2 p-4 transition-all",
                          mode === t.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-muted bg-popover hover:bg-accent text-muted-foreground",
                        )}
                      >
                        <t.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-sm font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
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
                      <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {THEME_COLORS.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            <span>{theme.label}</span>
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
