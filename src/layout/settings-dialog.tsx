import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Keyboard,
  Trash2,
  Download,
  Upload,
  FileText,
} from "lucide-react";
import { useTradeSession } from "@/hooks/use-trade-session";
import {
  useSettingsStore,
  type FontSize,
  type CornerRadius,
} from "@/lib/store/use-settings-store";
import { MODELS, type ModelId } from "@/lib/llm/common/types";
import type { Session } from "@/lib/store/session/types";
import { useSessionStore } from "@/lib/store/use-session-store";
import {
  useTheme,
  type ThemeColor,
  type ThemeMode,
} from "@/contexts/theme-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

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

const FONT_SIZE_OPTIONS: Array<{
  value: FontSize;
  label: string;
  size: string;
}> = [
  { value: "small", label: "Small", size: "14px" },
  { value: "medium", label: "Medium", size: "16px" },
  { value: "large", label: "Large", size: "18px" },
] as const;

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { mode, setMode, color, setColor } = useTheme();

  const apiKey = useSettingsStore((state) => state.apiKey);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const fontSize = useSettingsStore((state) => state.fontSize);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const cornerRadius = useSettingsStore((state) => state.cornerRadius);
  const defaultModel = useSettingsStore((state) => state.defaultModel);
  const setDefaultModel = useSettingsStore((state) => state.setDefaultModel);
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const setEnterKeySends = useSettingsStore((state) => state.setEnterKeySends);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);
  const compactMode = useSettingsStore((state) => state.compactMode);
  const setCompactMode = useSettingsStore((state) => state.setCompactMode);

  const purgeSessions = useSessionStore((state) => state.purge);

  const { sortedSessions, exportSession, exportAllSessions, importSessions } =
    useTradeSession();

  const [showKey, setShowKey] = React.useState(false);
  const [value, setValue] = React.useState(apiKey);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

  React.useEffect(() => {
    const root = window.document.documentElement;
    const sizeMap: Record<FontSize, string> = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    root.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const radiusMap: Record<CornerRadius, string> = {
      none: "0rem",
      small: "0.25rem",
      medium: "0.5rem",
      large: "1rem",
    };
    root.style.setProperty("--radius", radiusMap[cornerRadius]);
  }, [cornerRadius]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [reducedMotion]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }
  }, [compactMode]);

  const handleClearHistory = () => {
    purgeSessions();
    toast.success("Chat history cleared");
  };

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
            <TabsContent value="chat" className="m-0 p-6 space-y-4">
              <div className="max-w-3xl">
                <h3 className="text-lg font-medium">Model Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the model.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="space-y-4">
                  <p className="text-base font-medium">Secret Key</p>
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

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="space-y-4">
                  <p className="text-base font-medium">Default Model</p>
                  <p className="text-sm text-muted-foreground">
                    Model used for new sessions.
                  </p>
                  <div className="pt-2">
                    <Select
                      value={defaultModel}
                      onValueChange={(val: ModelId) => setDefaultModel(val)}
                    >
                      <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select default model" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELS.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <span>{m.id}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium">Enter to Send</p>
                      <Keyboard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Press Enter to send, Shift+Enter for newlines.
                    </p>
                  </div>
                  <Switch
                    checked={enterKeySends}
                    onCheckedChange={setEnterKeySends}
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-base font-medium">Trade</p>
                    <p className="text-sm text-muted-foreground">
                      Export sessions or import from a file.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <ExportSessionDialog
                      sessions={sortedSessions}
                      onExport={exportSession}
                      formatDate={formatDate}
                    />
                    <Button
                      variant="outline"
                      onClick={exportAllSessions}
                      disabled={sortedSessions.length === 0}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                    <Button variant="outline" onClick={importSessions}>
                      <Download className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 shadow-sm max-w-3xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-medium">Clear Chat History</p>
                    <p className="text-sm text-muted-foreground">
                      Delete all conversations.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="default"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your conversations.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearHistory}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="m-0 p-6 space-y-4">
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
                      { id: "light" as ThemeMode, icon: Sun, label: "Light" },
                      { id: "dark" as ThemeMode, icon: Moon, label: "Dark" },
                      {
                        id: "system" as ThemeMode,
                        icon: Monitor,
                        label: "System",
                      },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMode(t.id)}
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

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-base font-medium">Font Size</p>
                    <p className="text-sm text-muted-foreground">
                      Adjust the text size across the application.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Select
                      value={fontSize}
                      onValueChange={(val: FontSize) => setFontSize(val)}
                    >
                      <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_SIZE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span>{option.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-medium">Reduced Motion</p>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations throughout the app.
                    </p>
                  </div>
                  <Switch
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Use tighter spacing for denser layouts.
                    </p>
                  </div>
                  <Switch
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ExportSessionDialogProps {
  sessions: Session[];
  onExport: (id: string) => void;
  formatDate: (timestamp: number) => string;
}

function ExportSessionDialog({
  sessions,
  onExport,
  formatDate,
}: ExportSessionDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleExport = (id: string) => {
    onExport(id);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Export Session
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Export Session</AlertDialogTitle>
          <AlertDialogDescription>
            Select a session to export. Sessions are sorted by most recent
            first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[300px] overflow-y-auto border rounded-md">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No sessions to export
            </div>
          ) : (
            <div className="divide-y">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleExport(session.id)}
                  className="w-full p-3 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{session.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
