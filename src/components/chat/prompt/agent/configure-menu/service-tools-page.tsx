import { Button } from "@/components/ui/button";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { Session } from "@/lib/store/session/types";
import { serviceById } from "@/lib/services/catalog";
import type { ToolGroup } from "./groups";
import { SubPageHeader } from "./category-page";
import { ToolRow } from "./rows";
import { groupEnabled, groupToolKeys, serviceConnected } from "./helpers";
import { cn } from "@/lib/utils";

/**
 * Detail page for a collapsed service group. Lists every child tool so the user
 * can cherry-pick individually or toggle the whole set. Turning every tool off
 * leaves the parent group deselected, since its state is derived from children.
 */
export const ServiceToolsPage: React.FC<{
  group: ToolGroup;
  session: Session;
  onBack: () => void;
  onToggle: (key: string, value: boolean) => void;
}> = ({ group, session, onBack, onToggle }) => {
  const connections = useConnectionsStore((state) => state.connections);
  const children = group.children ?? [];
  const connected = serviceConnected(group, connections);
  const allOn = groupEnabled(session, group, connections);
  const service = group.service ? serviceById(group.service) : undefined;

  const handleToggleAll = () => {
    if (!connected) return;
    const value = !allOn;
    for (const child of children) onToggle(child.key, value);
  };

  const rowsClasses = cn(
    "flex flex-col gap-0.5 p-1.5",
    !connected && "pointer-events-none opacity-50",
  );

  return (
    <>
      <SubPageHeader
        title={group.label}
        onBack={onBack}
        trailing={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground shadow-none hover:text-foreground"
            onClick={handleToggleAll}
            disabled={!connected}
          >
            {allOn ? "All off" : "All on"}
          </Button>
        }
      />

      <div className={rowsClasses}>
        {children.map((child) => {
          const enabled = connected && session.groups?.[child.key] === true;
          return (
            <ToolRow
              key={child.key}
              label={child.label}
              subtitle={child.description}
              enabled={enabled}
              onToggle={() => onToggle(child.key, !enabled)}
            />
          );
        })}
      </div>

      {!connected && (
        <p className="border-t border-border/50 px-3.5 py-2.5 text-[11px] leading-snug text-muted-foreground">
          Connect {service?.label ?? "this service"} in Settings to use these
          tools.
        </p>
      )}

      {connected && (
        <p className="border-t border-border/50 px-3.5 py-2.5 text-[11px] leading-snug text-muted-foreground">
          {groupToolKeys(group).length} tools · turning all off deselects{" "}
          {group.label}.
        </p>
      )}
    </>
  );
};
