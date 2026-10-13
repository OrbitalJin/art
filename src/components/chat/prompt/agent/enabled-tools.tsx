import { TOOL_FAMILIES } from "@/lib/ai/tools/registry";
import { toolkitEnabled } from "@/lib/ai/tools/toolkits";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { Session } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { basename, familyEnabled } from "./configure-menu/helpers";

const ToolTag: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => {
  const tagClasses = cn(
    "flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5",
    "bg-muted/50 text-xs whitespace-nowrap text-foreground/80 ring-1 ring-border/60",
  );

  return (
    <span className={tagClasses}>
      <span className={value ? "text-muted-foreground" : ""}>{label}</span>
      {value ? <span className="font-medium">{value}</span> : null}
    </span>
  );
};

export const EnabledTools: React.FC<{ session: Session }> = ({ session }) => {
  const toolkits = useConnectionsStore((state) => state.toolkits);

  const tags: { label: string; value?: string }[] = [];
  for (const family of TOOL_FAMILIES) {
    if (family.source === "folders") {
      const folders = session.folders ?? [];
      if (folders.length && toolkitEnabled(session, family.key)) {
        tags.push({
          label: family.label,
          value:
            folders.length === 1
              ? basename(folders[0].path)
              : `${folders.length} folders`,
        });
      }
      continue;
    }

    if (familyEnabled(session, family, toolkits)) {
      tags.push({ label: family.label });
    }
  }

  if (tags.length === 0) {
    return (
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/50">
        No tools enabled
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scroll-fade-x">
      {tags.map((tag) => (
        <ToolTag key={tag.label} label={tag.label} value={tag.value} />
      ))}
    </span>
  );
};
