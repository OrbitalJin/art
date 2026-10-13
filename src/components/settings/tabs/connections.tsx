// connections.tsx
import { useEffect } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { IconType } from "react-icons";
import { TbBrandGmail } from "react-icons/tb";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { CONNECTED_SERVICES } from "@/lib/services/catalog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./settings-layout";

type ConnectionState = "active" | "pending" | "idle";

const SERVICE_ICONS: Record<string, IconType> = {
  gmail: TbBrandGmail,
};

const ServiceIcon: React.FC<{ service: string; active: boolean }> = ({
  service,
  active,
}) => {
  const Icon = SERVICE_ICONS[service] ?? TbBrandGmail;

  const iconClasses = cn(
    "flex size-9 shrink-0 items-center justify-center rounded-lg border",
    "transition-colors duration-150",
    active
      ? "border-foreground/15 bg-foreground/[0.04] text-foreground"
      : "border-border/60 bg-muted/40 text-muted-foreground",
  );

  return (
    <span className={iconClasses}>
      <Icon size={24} strokeWidth={1} aria-hidden />
    </span>
  );
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
  service: string;
  label: string;
  state: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectionRow: React.FC<ConnectionRowProps> = ({
  service,
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
        <ServiceIcon service={service} active={active} />
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
  onRefresh: () => void;
}

const ConnectionsFooter: React.FC<ConnectionsFooterProps> = ({
  error,
  showRefresh,
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
        onClick={onRefresh}
      >
        Refresh
      </Button>
    )}
  </div>
);

export const ConnectionsSettings: React.FC = () => {
  const connections = useConnectionsStore((state) => state.connections);
  const error = useConnectionsStore((state) => state.error);
  const connect = useConnectionsStore((state) => state.connect);
  const disconnect = useConnectionsStore((state) => state.disconnect);
  const awaitConnection = useConnectionsStore((state) => state.awaitConnection);
  const syncConnections = useConnectionsStore((state) => state.syncConnections);

  useEffect(() => {
    void syncConnections();
  }, [syncConnections]);

  const handleConnect = async (service: string) => {
    const url = await connect(service);
    if (!url) return;
    await openUrl(url);
    await awaitConnection(service);
  };

  const anyActive = CONNECTED_SERVICES.some(
    (service) => connections[service.id]?.isActive === true,
  );

  const showFooter = anyActive || Boolean(error);

  const rows = CONNECTED_SERVICES.map((service) => {
    const entry = connections[service.id];
    const pending =
      entry?.status === "INITIATED" || entry?.status === "INITIALIZING";
    const state: ConnectionState = entry?.isActive
      ? "active"
      : pending
        ? "pending"
        : "idle";

    return (
      <ConnectionRow
        key={service.id}
        service={service.id}
        label={service.label}
        state={state}
        onConnect={() => void handleConnect(service.id)}
        onDisconnect={() => void disconnect(service.id)}
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
          onRefresh={() => void syncConnections(true)}
        />
      )}
    </SettingsCard>
  );
};
