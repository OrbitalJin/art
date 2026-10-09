// chat-settings-tab.tsx
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTradeSession } from "@/hooks/use-trade-session";
import { MODELS, type ModelId } from "@/lib/ai/models";
import { MODES, type ModeId } from "@/lib/ai/prompts/modes";
import type { AccessMode } from "@/lib/ai/tools/registry";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const ACCESS_MODES: ReadonlyArray<{
  id: AccessMode;
  label: string;
  description: string;
}> = [
  {
    id: "readonly",
    label: "Read only",
    description: "The agent can read, search, and ask questions, but cannot create, edit, or delete anything.",
  },
  {
    id: "confirm",
    label: "Ask to write",
    description: "Reads run freely; every create, edit, or delete pauses for your approval first.",
  },
  {
    id: "autonomous",
    label: "Autonomous",
    description: "The agent runs tools immediately, including writes, without waiting for you.",
  },
];

const Section: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="flex flex-col gap-4 py-6 first:pt-0">
    <div className="flex flex-col gap-0.5">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </section>
);

const SettingRow: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="flex items-center justify-between gap-6 py-6">
    <div className="flex min-w-0 flex-col gap-0.5">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </section>
);

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

  const dirty = draft !== value;

  const handleSave = () => {
    if (!dirty) return;
    onSave(draft);
    toast.success("Settings saved");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") handleSave();
  };

  const toggleClasses = cn(
    "absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-sm",
    "text-[11px] text-muted-foreground/70 outline-none transition-colors duration-150",
    "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <p className="text-[13px] font-medium text-foreground/90">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            type={showKey ? "text" : "password"}
            placeholder={placeholder}
            aria-label={label}
            autoComplete="off"
            spellCheck={false}
            className="pr-14 font-mono text-sm"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => setShowKey((show) => !show)}
            aria-pressed={showKey}
            className={toggleClasses}
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>

        <Button
          type="button"
          size="sm"
          variant={dirty ? "default" : "ghost"}
          disabled={!dirty}
          onClick={handleSave}
          className="w-16"
        >
          {dirty ? "Save" : "Saved"}
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
  const defaultAgentModel = useSettingsStore(
    (state) => state.defaultAgentModel,
  );
  const setDefaultAgentModel = useSettingsStore(
    (state) => state.setDefaultAgentModel,
  );
  const defaultMode = useSettingsStore((state) => state.defaultMode);
  const setDefaultMode = useSettingsStore((state) => state.setDefaultMode);
  const defaultAccessMode = useSettingsStore(
    (state) => state.defaultAccessMode,
  );
  const setDefaultAccessMode = useSettingsStore(
    (state) => state.setDefaultAccessMode,
  );
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
    <div className="flex max-w-3xl flex-col">
      <header className="mb-6 flex flex-col gap-0.5">
        <h2 className="text-lg font-medium tracking-tight">Chat & Agent</h2>
        <p className="text-sm text-muted-foreground">
          Configure your chat and agent experience.
        </p>
      </header>

      <div className="flex flex-col divide-y divide-border/50">
        <Section title="Keys" description="Stored on this device.">
          <div className="flex flex-col gap-5">
            <SecretKeyField
              label="Gateway"
              description="Vercel AI gateway key."
              placeholder="secret key"
              value={apiKey}
              onSave={setApiKey}
            />
            <SecretKeyField
              label="Web discovery"
              description="Exa web discovery key."
              placeholder="secret key"
              value={searchApiKey}
              onSave={setSearchApiKey}
            />
          </div>
        </Section>

        <SettingRow
          title="Default chat model"
          description="Model used for new chat sessions."
        >
          <Select
            value={defaultModel}
            onValueChange={(value: ModelId) => setDefaultModel(value)}
          >
            <SelectTrigger className="w-52" aria-label="Default chat model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent position="item-aligned">
              {MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          title="Default chat mode"
          description="Behavior mode used for new chat sessions."
        >
          <Select
            value={defaultMode}
            onValueChange={(value: ModeId) => setDefaultMode(value)}
          >
            <SelectTrigger className="w-52" aria-label="Default chat mode">
              <SelectValue placeholder="Select a mode" />
            </SelectTrigger>
            <SelectContent position="item-aligned">
              {Object.values(MODES).map((mode) => (
                <SelectItem key={mode.id} value={mode.id}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          title="Enter to send"
          description="Press Enter to send, Shift+Enter for a new line."
        >
          <Switch
            checked={enterKeySends}
            onCheckedChange={setEnterKeySends}
            aria-label="Enter to send"
          />
        </SettingRow>

        <Section
          title="Agent"
          description="Defaults applied to new agent sessions."
        >
          <SettingRow
            title="Default agent model"
            description="Model used for new agent sessions."
          >
            <Select
              value={defaultAgentModel}
              onValueChange={(value: ModelId) => setDefaultAgentModel(value)}
            >
              <SelectTrigger className="w-52" aria-label="Default agent model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            title="Default access mode"
            description="Tool access policy used for new agent sessions."
          >
            <Select
              value={defaultAccessMode}
              onValueChange={(value: AccessMode) => setDefaultAccessMode(value)}
            >
              <SelectTrigger className="w-52" aria-label="Default access mode">
                <SelectValue placeholder="Select an access mode" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {ACCESS_MODES.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        </Section>

        <SettingRow
          title="Sessions"
          description="Export all sessions, or import them from a file."
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={exportAllSessions}
              disabled={sortedSessions.length === 0}
            >
              Export all
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={importSessions}
            >
              Import
            </Button>
          </div>
        </SettingRow>

        <SettingRow
          title="Delete chat history"
          description="Permanently delete all conversations."
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Delete all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  Every session will be permanently deleted. This can't be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleClearHistory}
                >
                  Delete all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SettingRow>
      </div>
    </div>
  );
};
