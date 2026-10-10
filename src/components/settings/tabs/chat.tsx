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
import { useSessionStore } from "@/lib/store/use-session-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConnectionsSettings } from "./connections";
import {
  CARD_CLASSES,
  INPUT_CLASSES,
  SELECT_TRIGGER_CLASSES,
  SettingRow,
  SettingsCard,
  SettingsPage,
  SettingsSection,
} from "./settings-layout";

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

  const inputClasses = cn(INPUT_CLASSES, "pr-14 font-mono");

  const toggleClasses = cn(
    "absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-sm",
    "text-[11px] text-muted-foreground/70 outline-none transition-colors duration-150",
    "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex flex-col gap-0.5">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
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
            className={inputClasses}
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
          className="h-8 w-16 text-xs"
        >
          {dirty ? "Save" : "Saved"}
        </Button>
      </div>
    </div>
  );
};

interface AccessModeOptionProps {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const AccessModeOption: React.FC<AccessModeOptionProps> = ({
  label,
  description,
  selected,
  onSelect,
}) => {
  const optionClasses = cn(
    "flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left",
    "outline-none transition-colors duration-150",
    "hover:bg-muted/40 focus-visible:bg-muted/40",
    selected && "bg-muted/50",
  );

  const indicatorClasses = cn(
    "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border",
    "transition-colors duration-150",
    selected ? "border-foreground" : "border-muted-foreground/40",
  );

  const labelClasses = cn(
    "text-[13px] font-medium",
    selected ? "text-foreground" : "text-foreground/80",
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={optionClasses}
    >
      <span className={indicatorClasses}>
        {selected && <span className="size-1.5 rounded-full bg-foreground" />}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={labelClasses}>{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
};

export const ChatSettingsTab: React.FC = () => {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const searchApiKey = useSettingsStore((state) => state.searchApiKey);
  const setSearchApiKey = useSettingsStore((state) => state.setSearchApiKey);
  const composioApiKey = useSettingsStore((state) => state.composioApiKey);
  const setComposioApiKey = useSettingsStore(
    (state) => state.setComposioApiKey,
  );
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

  const modelItems = MODELS.map((model) => (
    <SelectItem key={model.id} value={model.id}>
      {model.displayName}
    </SelectItem>
  ));

  const modeItems = Object.values(MODES).map((mode) => (
    <SelectItem key={mode.id} value={mode.id}>
      {mode.label}
    </SelectItem>
  ));

  return (
    <SettingsPage
      title="Chat & Agent"
      description="Configure your chat and agent experience."
    >
      <SettingsSection title="Keys" description="Stored on this device.">
        <SettingsCard>
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
          <SecretKeyField
            label="Connections"
            description="Composio key for Gmail, Notion, Slack etc."
            placeholder="secret key"
            value={composioApiKey}
            onSave={setComposioApiKey}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Chat">
        <SettingsCard>
          <SettingRow
            title="Default chat model"
            description="Model used for new chat sessions."
          >
            <Select
              value={defaultModel}
              onValueChange={(value: ModelId) => setDefaultModel(value)}
            >
              <SelectTrigger
                className={SELECT_TRIGGER_CLASSES}
                aria-label="Default chat model"
              >
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {modelItems}
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
              <SelectTrigger
                className={SELECT_TRIGGER_CLASSES}
                aria-label="Default chat mode"
              >
                <SelectValue placeholder="Select a mode" />
              </SelectTrigger>
              <SelectContent position="item-aligned">{modeItems}</SelectContent>
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
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Agent"
        description="Defaults applied to new agent sessions."
      >
        <SettingsCard>
          <SettingRow
            title="Default agent model"
            description="Model used for new agent sessions."
          >
            <Select
              value={defaultAgentModel}
              onValueChange={(value: ModelId) => setDefaultAgentModel(value)}
            >
              <SelectTrigger
                className={SELECT_TRIGGER_CLASSES}
                aria-label="Default agent model"
              >
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {modelItems}
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Tool access"
        description="Default policy for new agent sessions."
      >
        <div
          role="radiogroup"
          aria-label="Default access mode"
          className={CARD_CLASSES}
        >
          <AccessModeOption
            label="Read only"
            description="The agent can read, search, and ask questions, but cannot create, edit, or delete anything."
            selected={defaultAccessMode === "readonly"}
            onSelect={() => setDefaultAccessMode("readonly")}
          />
          <AccessModeOption
            label="Ask to write"
            description="Reads run freely; every create, edit, or delete pauses for your approval first."
            selected={defaultAccessMode === "confirm"}
            onSelect={() => setDefaultAccessMode("confirm")}
          />
          <AccessModeOption
            label="Autonomous"
            description="The agent runs tools immediately, including writes, without waiting for you."
            selected={defaultAccessMode === "autonomous"}
            onSelect={() => setDefaultAccessMode("autonomous")}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Connections"
        description="Services the agent can use. Connect once here, then enable per session."
      >
        <ConnectionsSettings />
      </SettingsSection>

      <SettingsSection title="Data">
        <SettingsCard>
          <SettingRow
            title="Sessions"
            description="Export all sessions, or import them from a file."
          >
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs shadow-none"
                onClick={exportAllSessions}
                disabled={sortedSessions.length === 0}
              >
                Export all
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs shadow-none"
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
                  className="h-8 text-xs text-destructive shadow-none hover:bg-destructive/10 hover:text-destructive"
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
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
};
