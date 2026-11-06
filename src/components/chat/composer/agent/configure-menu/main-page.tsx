import { Button } from "@/components/ui/button";
import type { SessionMeta } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { CATEGORY_ORDER, TOOL_GROUPS, type Category } from "./groups";
import { CategoryLink } from "./rows";
import { groupEnabled, groupsInCategory } from "./helpers";

const MainHeader: React.FC<{
  nothingToRevoke: boolean;
  onRevokeAll: () => void;
}> = ({ nothingToRevoke, onRevokeAll }) => {
  const headerClassName = cn(
    "flex items-center justify-between gap-2",
    "border-b border-border/40 py-2 pl-4 pr-2",
  );

  const labelClassName = cn(
    "text-[10px] font-medium uppercase tracking-wider",
    "text-muted-foreground/60",
  );

  const revokeClassName = cn(
    "h-7 rounded-full px-2.5 text-[11px] text-muted-foreground shadow-none",
    "hover:bg-destructive/10 hover:text-destructive",
  );

  return (
    <div className={headerClassName}>
      <p className={labelClassName}>Configure agent</p>
      <Button
        variant="ghost"
        size="sm"
        className={revokeClassName}
        onClick={onRevokeAll}
        disabled={nothingToRevoke}
      >
        Revoke all
      </Button>
    </div>
  );
};

export const MainPage: React.FC<{
  session: SessionMeta;
  onOpenCategory: (category: Category) => void;
  onRevokeAll: () => void;
}> = ({ session, onOpenCategory, onRevokeAll }) => {
  const nothingToRevoke = !TOOL_GROUPS.some(
    (group) => group.source !== "files" && groupEnabled(session, group),
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
