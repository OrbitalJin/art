import { Button } from "@/components/ui/button";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { Session } from "@/lib/store/session/types";
import {
  CATEGORY_ORDER,
  TOOL_FAMILIES,
  type ToolCategory,
} from "@/lib/ai/tools/registry";
import { CategoryLink } from "./rows";
import { familiesInCategory, familyEnabled } from "./helpers";

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
  session: Session;
  onOpenCategory: (category: ToolCategory) => void;
  onRevokeAll: () => void;
}> = ({ session, onOpenCategory, onRevokeAll }) => {
  const toolkits = useConnectionsStore((state) => state.toolkits);
  const nothingToRevoke = !TOOL_FAMILIES.some(
    (family) =>
      family.source !== "folders" && familyEnabled(session, family, toolkits),
  );

  return (
    <>
      <MainHeader nothingToRevoke={nothingToRevoke} onRevokeAll={onRevokeAll} />

      <div className="flex flex-col gap-0.5 p-1.5">
        {CATEGORY_ORDER.map((category) => {
          if (!familiesInCategory(category).length) return null;

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
