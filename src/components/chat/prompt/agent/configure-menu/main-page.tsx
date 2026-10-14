import { Button } from "@/components/ui/button";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { SessionMeta } from "@/lib/store/session/types";
import { CATEGORY_ORDER, TOOL_GROUPS, type Category } from "./groups";
import { CategoryLink } from "./rows";
import { groupEnabled, groupsInCategory } from "./helpers";

const MainHeader: React.FC<{
  nothingToRevoke: boolean;
  onRevokeAll: () => void;
}> = ({ nothingToRevoke, onRevokeAll }) => (
  <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 pr-2 pl-3.5">
    <p className="text-[13px] font-medium text-foreground">Configure agent</p>
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-muted-foreground shadow-none hover:text-destructive"
      onClick={onRevokeAll}
      disabled={nothingToRevoke}
    >
      Revoke all
    </Button>
  </div>
);

export const MainPage: React.FC<{
  session: SessionMeta;
  onOpenCategory: (category: Category) => void;
  onRevokeAll: () => void;
}> = ({ session, onOpenCategory, onRevokeAll }) => {
  const connections = useConnectionsStore((state) => state.connections);
  const nothingToRevoke = !TOOL_GROUPS.some(
    (group) =>
      group.source !== "files" && groupEnabled(session, group, connections),
  );

  return (
    <>
      <MainHeader nothingToRevoke={nothingToRevoke} onRevokeAll={onRevokeAll} />

      <div className="flex flex-col gap-0.5 p-1.5">
        {CATEGORY_ORDER.map((category) => {
          if (!groupsInCategory(category).length) return null;

          return (
            <CategoryLink
              key={category}
              category={category}
              session={session}
              onOpen={() => onOpenCategory(category)}
            />
          );
        })}
      </div>
    </>
  );
};
