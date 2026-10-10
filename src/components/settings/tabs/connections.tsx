// connections.tsx
import { useEffect } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { SUPPORTED_TOOLKITS, TOOLKIT_LABELS } from "@/lib/services/composio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./settings-layout";

type ConnectionState = "active" | "pending" | "idle";

const ConnectionMonogram: React.FC<{ label: string; active: boolean }> = ({
  label,
  active,
}) => {
  const monogramClasses = cn(
    "flex size-9 shrink-0 items-center justify-center rounded-lg border",
    "text-[13px] font-medium transition-colors duration-150",
    active
      ? "border-foreground/15 bg-foreground/[0.04] text-foreground"
      : "border-border/60 bg-muted/40 text-muted-foreground",
  );

  return <span className={monogramClasses}>{label.charAt(0)}</span>;
};

const ConnectionStatus: React.FC<{ state: ConnectionState }> = ({ state }) => {
  const textClasses = cn(
    "text-xs",
    state === "active" ? "text-foreground/70" : "text-muted-foreground",
  );

  const text =
    state === "active"
      ? "Connected"
      : state === "pending"
        ? "Waiting for authorization…"
        : "Not connected";

  return (
    <span className="flex items-center gap-1.5">
      <span className={textClasses}>{text}</span>
    </span>
  );
};

interface ConnectionRowProps {
  label: string;
  state: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectionRow: React.FC<ConnectionRowProps> = ({
  label,
  state,
  onConnect,
  onDisconnect,
}) => {
  const active = state === "active";
  const pending = state === "pending";

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <ConnectionMonogram label={label} active={active} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[13px] font-medium text-foreground">
            {label}
          </span>
          <ConnectionStatus state={state} />
        </div>
      </div>

      {active ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs text-muted-foreground shadow-none hover:bg-destructive/10 hover:text-destructive"
          onClick={onDisconnect}
        >
          Disconnect
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant={pending ? "outline" : "default"}
          className="h-8 text-xs shadow-none"
          onClick={onConnect}
        >
          {pending ? "Reopen" : "Connect"}
        </Button>
      )}
    </div>
  );
};

interface ConnectionsFooterProps {
  error: string | null;
  showRefresh: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

const ConnectionsFooter: React.FC<ConnectionsFooterProps> = ({
  error,
  showRefresh,
  refreshing,
  onRefresh,
}) => (
  <div className="flex items-center justify-between gap-4 bg-muted/20 px-4 py-2.5">
    <p className="min-w-0 text-xs leading-snug text-destructive">
      {error ?? ""}
    </p>
    {showRefresh && (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 px-2.5 text-xs text-muted-foreground hover:text-foreground"
        disabled={refreshing}
        onClick={onRefresh}
      >
        {refreshing ? "Refreshing tools…" : "Refresh tools"}
      </Button>
    )}
  </div>
);

export const ConnectionsSettings: React.FC = () => {
  const toolkits = useConnectionsStore((state) => state.toolkits);
  const refreshing = useConnectionsStore((state) => state.refreshing);
  const error = useConnectionsStore((state) => state.error);
  const connect = useConnectionsStore((state) => state.connect);
  const disconnect = useConnectionsStore((state) => state.disconnect);
  const awaitConnection = useConnectionsStore((state) => state.awaitConnection);
  const refreshTools = useConnectionsStore((state) => state.refreshTools);
  const syncConnections = useConnectionsStore((state) => state.syncConnections);

  useEffect(() => {
    void syncConnections();
  }, [syncConnections]);

  const handleConnect = async (toolkit: string) => {
    const url = await connect(toolkit);
    if (!url) return;
    await openUrl(url);
    await awaitConnection(toolkit);
  };

  const anyActive = SUPPORTED_TOOLKITS.some(
    (toolkit) => toolkits[toolkit]?.status === "ACTIVE",
  );

  const showFooter = anyActive || Boolean(error);

  const rows = SUPPORTED_TOOLKITS.map((toolkit) => {
    const status = toolkits[toolkit]?.status ?? "NOT_CONNECTED";
    const pending = status === "INITIATED" || status === "INITIALIZING";
    const state: ConnectionState =
      status === "ACTIVE" ? "active" : pending ? "pending" : "idle";

    return (
      <ConnectionRow
        key={toolkit}
        label={TOOLKIT_LABELS[toolkit]}
        state={state}
        onConnect={() => void handleConnect(toolkit)}
        onDisconnect={() => void disconnect(toolkit)}
      />
    );
  });

  return (
    <SettingsCard>
      {rows}
      {showFooter && (
        <ConnectionsFooter
          error={error}
          showRefresh={anyActive}
          refreshing={refreshing}
          onRefresh={() => void refreshTools()}
        />
      )}
    </SettingsCard>
  );
};
