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

import { useTradeSession } from "@/hooks/use-trade-session";
import { MODELS, type ModelId } from "@/lib/ai/models";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import {
  Check,
  Download,
  Eye,
  EyeOff,
  Save,
  Shredder,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface SecretKeyFieldProps {
  label: string;
  description: string;
  placeholder: string;
  value: string;
  onSave: (value: string) => void;
}

const SecretKeyField: React.FC<SecretKeyFieldProps> = ({
  label,
  description,
  placeholder,
  value,
  onSave,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
    setShowKey(false);
  }, [value]);

  const handleSave = () => {
    onSave(draft);
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? "text" : "password"}
            placeholder={placeholder}
            className="pr-10 font-mono text-sm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
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
          disabled={draft === value}
          className="min-w-[100px] w-full sm:w-auto"
        >
          {draft === value ? (
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
  );
};

export const ChatSettingsTab: React.FC = () => {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const searchApiKey = useSettingsStore((state) => state.searchApiKey);
  const setSearchApiKey = useSettingsStore((state) => state.setSearchApiKey);
  const defaultModel = useSettingsStore((state) => state.defaultModel);
  const setDefaultModel = useSettingsStore((state) => state.setDefaultModel);
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const setEnterKeySends = useSettingsStore((state) => state.setEnterKeySends);
  const purgeSessions = useSessionStore((state) => state.purge);
  const { sortedSessions, exportAllSessions, importSessions } =
    useTradeSession();

  const handleClearHistory = () => {
    purgeSessions();
    toast.success("Chat history cleared");
  };

  return (
    <>
      <div className="max-w-3xl">
        <h3 className="text-lg font-medium">Chat</h3>
        <p className="text-sm text-muted-foreground">
          Configure your chat experience.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="space-y-1 mb-3">
          <p className="text-base font-medium">Secrets</p>
        </div>
        <div className="space-y-6">
          <div>
            <SecretKeyField
              label="Gateway"
              description="Vercel AI gateway key."
              placeholder="secret key"
              value={apiKey}
              onSave={setApiKey}
            />
          </div>
          <div>
            <SecretKeyField
              label="Web Discovery"
              description="Exa web discovery key."
              placeholder="secret key"
              value={searchApiKey}
              onSave={setSearchApiKey}
            />
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
            <Button
              variant="outline"
              className="flex-1"
              onClick={exportAllSessions}
              disabled={sortedSessions.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={importSessions}
            >
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
            <AlertDialogContent size="sm">
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
