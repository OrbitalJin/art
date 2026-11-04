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
import { MODELS, type ModelId } from "@/lib/ai/models";
import { PERSONAS, type PersonaId } from "@/lib/ai/prompts/personas";
import { purgeSessions } from "@/lib/store/session/commands";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { ACCESS_MODE_TONES, type AccessMode } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

type KeysStatus = ReturnType<typeof useSettingsStore.getState>["keysStatus"];

const maskKey = (key: string) => {
  const tail = key.length > 8 ? key.slice(-4) : "";
  return `••••••••${tail}`;
};

interface KeyEditorProps {
  label: string;
  placeholder: string;
  value: string;
  onSave: (value: string) => void;
  onRemove: () => void;
  onCancel: () => void;
}

const KeyEditor: React.FC<KeyEditorProps> = ({
  label,
  placeholder,
  value,
  onSave,
  onRemove,
  onCancel,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
    setShowKey(false);
  }, [value]);

  const trimmed = draft.trim();
  const canSave = trimmed.length > 0 && trimmed !== value;
  const canRemove = value.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(trimmed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") handleSave();
    if (event.key === "Escape") onCancel();
  };

  const wrapperClasses = cn(
    "flex flex-col gap-2 px-4 pb-4",
    "animate-in fade-in-0 slide-in-from-top-1 duration-150",
  );

  const inputClasses = cn(INPUT_CLASSES, "pr-9 font-mono");

  const toggleClasses = cn(
    "absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 cursor-pointer",
    "items-center justify-center rounded-sm text-muted-foreground/70",
    "outline-none transition-colors duration-150",
    "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const removeClasses = cn(
    "cursor-pointer rounded-sm text-xs text-muted-foreground",
    "outline-none transition-colors duration-150",
    "hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const ToggleIcon = showKey ? EyeOff : Eye;
  const toggleLabel = showKey ? "Hide key" : "Show key";

  return (
    <div className={wrapperClasses}>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            type={showKey ? "text" : "password"}
            placeholder={placeholder}
            aria-label={label}
            autoComplete="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            autoFocus
            className={inputClasses}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => setShowKey((show) => !show)}
            aria-label={toggleLabel}
            aria-pressed={showKey}
            className={toggleClasses}
          >
            <ToggleIcon className="size-3.5" aria-hidden />
          </button>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={!canSave}
          onClick={handleSave}
          className="h-8 w-16 text-xs shadow-none"
        >
          Save
        </Button>
      </div>

      {canRemove && (
        <div className="flex justify-end">
          <button type="button" onClick={onRemove} className={removeClasses}>
            Remove key
          </button>
        </div>
      )}
    </div>
  );
};

interface SecretKeyFieldProps {
  label: string;
  placeholder: string;
  value: string;
  status: KeysStatus;
  error: string | null;
  onSave: (value: string) => void;
}

const SecretKeyField: React.FC<SecretKeyFieldProps> = ({
  label,
  placeholder,
  value,
  status,
  error,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);

  const configured = value.length > 0;
  const loading = configured && status === "loading";
  const failed = configured && status === "error";
  const preview = maskKey(value);
  const buttonText = editing ? "Cancel" : configured ? "Edit" : "Add";
  const buttonVariant = editing || configured ? "outline" : "default";
  const errorText = error ?? "Could not resolve the art key.";
  const description = failed ? errorText : "Stored on this device.";

  const previewClasses = cn(
    "font-mono text-xs",
    failed ? "text-destructive" : "text-muted-foreground",
  );

  const handleSave = (next: string) => {
    onSave(next);
    setEditing(false);
    toast.success("Key saved");
  };

  const handleRemove = () => {
    onSave("");
    setEditing(false);
    toast.success("Key removed");
  };

  const handleCancel = () => setEditing(false);

  return (
    <div className="flex flex-col">
      <SettingRow title={label} description={description}>
        <div className="flex items-center gap-3">
          {loading && (
            <Loader2
              className="size-3 animate-spin text-muted-foreground"
              aria-label="Resolving key"
            />
          )}
          {configured && <span className={previewClasses}>{preview}</span>}
          <Button
            type="button"
            size="sm"
            variant={buttonVariant}
            className="h-8 text-xs shadow-none"
            onClick={() => setEditing((open) => !open)}
          >
            {buttonText}
          </Button>
        </div>
      </SettingRow>

      {editing && (
        <KeyEditor
          label={label}
          placeholder={placeholder}
          value={value}
          onSave={handleSave}
          onRemove={handleRemove}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

interface AccessModeOptionProps {
  mode: AccessMode;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const AccessModeOption: React.FC<AccessModeOptionProps> = ({
  mode,
  label,
  description,
  selected,
  onSelect,
}) => {
  const tone = ACCESS_MODE_TONES[mode];

  const optionClasses = cn(
    "flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left",
    "outline-none transition-colors duration-150",
    "hover:bg-muted/40 focus-visible:bg-muted/40",
    selected && tone.fill,
  );

  const indicatorClasses = cn(
    "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border",
    "transition-colors duration-150",
    selected ? tone.dot : "border-muted-foreground/40",
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
        {selected && <span className="size-1.5 rounded-full bg-background" />}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={labelClasses}>{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
};

export const ChatSettingsTab: React.FC = () => {
  const artKey = useSettingsStore((state) => state.artKey);
  const setArtKey = useSettingsStore((state) => state.setArtKey);
  const keysStatus = useSettingsStore((state) => state.keysStatus);
  const keysError = useSettingsStore((state) => state.keysError);
  const defaultModel = useSettingsStore((state) => state.defaultModel);
  const setDefaultModel = useSettingsStore((state) => state.setDefaultModel);
  const defaultAgentModel = useSettingsStore(
    (state) => state.defaultAgentModel,
  );
  const setDefaultAgentModel = useSettingsStore(
    (state) => state.setDefaultAgentModel,
  );
  const defaultPersona = useSettingsStore((state) => state.defaultPersona);
  const setDefaultPersona = useSettingsStore(
    (state) => state.setDefaultPersona,
  );
  const defaultAccessMode = useSettingsStore(
    (state) => state.defaultAccessMode,
  );
  const setDefaultAccessMode = useSettingsStore(
    (state) => state.setDefaultAccessMode,
  );
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const setEnterKeySends = useSettingsStore((state) => state.setEnterKeySends);
  const groupToolCalls = useSettingsStore((state) => state.groupToolCalls);
  const setGroupToolCalls = useSettingsStore(
    (state) => state.setGroupToolCalls,
  );

  const handleClearHistory = () => {
    purgeSessions();
    toast.success("Chat history cleared");
  };

  const modelItems = MODELS.map((model) => (
    <SelectItem key={model.id} value={model.id}>
      {model.displayName}
    </SelectItem>
  ));

  const personaItems = Object.values(PERSONAS).map((persona) => (
    <SelectItem key={persona.id} value={persona.id}>
      {persona.label}
    </SelectItem>
  ));

  return (
    <SettingsPage
      title="Chat & Agent"
      description="Configure your chat and agent experience."
    >
      <SettingsSection title="Access">
        <SettingsCard>
          <SecretKeyField
            label="Art key"
            placeholder="art key"
            value={artKey}
            status={keysStatus}
            error={keysError}
            onSave={setArtKey}
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
            title="Default chat persona"
            description="Persona used for new chat sessions."
          >
            <Select
              value={defaultPersona}
              onValueChange={(value: PersonaId) => setDefaultPersona(value)}
            >
              <SelectTrigger
                className={SELECT_TRIGGER_CLASSES}
                aria-label="Default chat persona"
              >
                <SelectValue placeholder="Select a persona" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                {personaItems}
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

          <SettingRow
            title="Group tool calls"
            description="Collapse consecutive tool calls into one expandable summary row."
          >
            <Switch
              checked={groupToolCalls}
              onCheckedChange={setGroupToolCalls}
              aria-label="Group tool calls"
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
            mode="readonly"
            label="Read only"
            description="The agent can read, search, and ask questions, but cannot create, edit, or delete anything."
            selected={defaultAccessMode === "readonly"}
            onSelect={() => setDefaultAccessMode("readonly")}
          />
          <AccessModeOption
            mode="confirm"
            label="Ask to write"
            description="Reads run freely; every create, edit, or delete pauses for your approval first."
            selected={defaultAccessMode === "confirm"}
            onSelect={() => setDefaultAccessMode("confirm")}
          />
          <AccessModeOption
            mode="autonomous"
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
