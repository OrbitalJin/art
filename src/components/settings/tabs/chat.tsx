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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTradeSession } from "@/hooks/use-trade-session";
import { MODELS, type ModelId } from "@/lib/llm/common/types";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import {
  Check,
  Download,
  Eye,
  EyeOff,
  FileText,
  Save,
  Search,
  Shredder,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export const ChatSettingsTab: React.FC = () => {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const defaultModel = useSettingsStore((state) => state.defaultModel);
  const setDefaultModel = useSettingsStore((state) => state.setDefaultModel);
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const setEnterKeySends = useSettingsStore((state) => state.setEnterKeySends);
  const purgeSessions = useSessionStore((state) => state.purge);
  const { sortedSessions, exportSession, exportAllSessions, importSessions } =
    useTradeSession();

  const [showKey, setShowKey] = useState(false);
  const [value, setValue] = useState(apiKey);

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

  const handleClearHistory = () => {
    purgeSessions();
    toast.success("Chat history cleared");
  };

  useEffect(() => {
    setValue(apiKey);
    setShowKey(false);
  }, [apiKey]);
  return (
    <>
      <div className="max-w-3xl">
        <h3 className="text-lg font-medium">Chat</h3>
        <p className="text-sm text-muted-foreground">
          Configure your chat experience.
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
          <div className="space-y-1">
            <p className="text-base font-medium">Default Model</p>
            <p className="text-sm text-muted-foreground">
              Model used for new sessions.
            </p>
          </div>
          <div className="pt-2">
            <Select
              value={defaultModel}
              onValueChange={(val: ModelId) => setDefaultModel(val)}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select default model" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectGroup>
                  <SelectLabel>Models</SelectLabel>
                  {MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span>{m.displayName}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
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
            </div>
            <p className="text-sm text-muted-foreground">
              Press Enter to send, Shift+Enter for newlines.
            </p>
          </div>
          <Switch checked={enterKeySends} onCheckedChange={setEnterKeySends} />
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
            <p className="text-base font-medium">Purge Chat History</p>
            <p className="text-sm text-muted-foreground">
              Delete all conversations.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Shredder />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your sessions. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearHistory}
                  variant="destructive"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
};

interface ExportSessionDialogProps {
  sessions: Array<{ id: string; title: string; createdAt: number }>;
  onExport: (id: string) => void;
  formatDate: (timestamp: number) => string;
}

function ExportSessionDialog({
  sessions,
  onExport,
  formatDate,
}: ExportSessionDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const sortedSessions = [...sessions].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  const filtered = !query
    ? sortedSessions
    : sessions.filter((session) =>
        session.title.toLowerCase().includes(query.toLowerCase()),
      );

  const handleExport = (id: string) => {
    onExport(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Export Session
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 shadow-xl">
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Export Session</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Select a session to export. Sessions are sorted by most recent
            first.
          </p>
        </div>

        <div className="p-2 border-b">
          <div className="flex items-center gap-2 p-2 rounded-md border">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Search sessions..."
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {query ? "No sessions found" : "No sessions to export"}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleExport(session.id)}
                  className="w-full p-3 text-left border rounded-md hover:bg-accent/30 transition-colors"
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
