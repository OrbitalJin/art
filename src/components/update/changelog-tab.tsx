import { useChangelog, type ChangelogEntry } from "@/hooks/use-changelog";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

type VersionGroup = ReturnType<typeof useChangelog>["versionGroups"][number];

interface GroupedByType {
  [type: string]: ChangelogEntry[];
}

const TYPE_ORDER = [
  "feat",
  "added",
  "fix",
  "fixed",
  "updated",
  "refactor",
  "tweaks",
  "semantics",
  "patch",
  "ci/cd",
  "chore",
];

const groupByType = (entries: ChangelogEntry[]): GroupedByType => {
  const grouped: GroupedByType = {};

  for (const entry of entries) {
    if (!grouped[entry.type]) {
      grouped[entry.type] = [];
    }

    grouped[entry.type].push(entry);
  }

  return grouped;
};

const sortTypes = (grouped: GroupedByType): [string, ChangelogEntry[]][] => {
  const rank = (type: string): number => {
    const index = TYPE_ORDER.indexOf(type);
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };

  return Object.entries(grouped).sort(([a], [b]) => rank(a) - rank(b));
};

const getTypeDot = (type: string): string => {
  switch (type) {
    case "feat":
    case "added":
      return "bg-emerald-500/70";
    case "fix":
    case "fixed":
      return "bg-rose-500/70";
    case "updated":
      return "bg-sky-500/70";
    case "refactor":
      return "bg-amber-500/70";
    case "tweaks":
      return "bg-violet-500/70";
    case "semantics":
      return "bg-pink-500/70";
    case "patch":
      return "bg-orange-500/70";
    case "ci/cd":
      return "bg-cyan-500/70";
    case "chore":
      return "bg-zinc-500/70";
    default:
      return "bg-muted-foreground/50";
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case "feat":
      return "Features";
    case "added":
      return "Added";
    case "fix":
    case "fixed":
      return "Fixes";
    case "updated":
      return "Updated";
    case "refactor":
      return "Refinements";
    case "tweaks":
      return "Tweaks";
    case "semantics":
      return "Semantics";
    case "patch":
      return "Patch";
    case "ci/cd":
      return "Infrastructure";
    case "chore":
      return "Chores";
    default:
      return type;
  }
};

const getVersionLabel = (version: string): string => {
  if (version === "Unreleased") return "Unreleased";
  if (version === "Pre-release") return "Pre-release";
  return `v${version}`;
};

const getVersionNote = (version: string): string | null => {
  if (version === "Unreleased") return "In progress";
  if (version === "Pre-release") return "Preview";
  return null;
};

const StateMessage: React.FC<{
  children: React.ReactNode;
  tone?: "default" | "error";
}> = ({ children, tone = "default" }) => (
  <div className="flex items-center justify-center py-20">
    <p
      className={cn(
        "text-sm",
        tone === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {children}
    </p>
  </div>
);

const EntryRow: React.FC<{ entry: ChangelogEntry }> = ({ entry }) => (
  <li className="text-[13px] leading-6 break-words text-foreground/80">
    {entry.message}
    <span className="ml-2 font-mono text-[10px] text-muted-foreground/40">
      {entry.hash}
    </span>
  </li>
);

const TypeSection: React.FC<{
  type: string;
  entries: ChangelogEntry[];
}> = ({ type, entries }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", getTypeDot(type))}
      />
      <h3 className="text-xs font-medium text-muted-foreground">
        {getTypeLabel(type)}
      </h3>
    </div>

    <ul className="flex flex-col gap-0.5 pl-3.5">
      {entries.map((entry, index) => (
        <EntryRow key={`${entry.hash}-${index}`} entry={entry} />
      ))}
    </ul>
  </div>
);

const VersionBlock: React.FC<{ group: VersionGroup }> = ({ group }) => {
  const sections = sortTypes(groupByType(group.entries));
  const note = getVersionNote(group.version);

  return (
    <section className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0">
      <header className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-medium text-foreground">
            {getVersionLabel(group.version)}
          </h2>
          {note && (
            <span className="text-[11px] text-muted-foreground/60">{note}</span>
          )}
        </div>
        <p className="shrink-0 text-[11px] text-muted-foreground/60">
          {group.date}
        </p>
      </header>

      {sections.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          No user-facing changes in this release.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.map(([type, entries]) => (
            <TypeSection key={type} type={type} entries={entries} />
          ))}
        </div>
      )}
    </section>
  );
};

export const ChangelogTab: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const { versionGroups, loading, error } = useChangelog(enabled);

  return (
    <ScrollArea className="scroll-fade-y min-h-0 flex-1 [&>[data-radix-scroll-area-viewport]>div]:block!">
      <div className="min-w-0 px-5 py-5">
        {loading ? (
          <StateMessage>Loading changelog…</StateMessage>
        ) : error ? (
          <StateMessage tone="error">{error}</StateMessage>
        ) : versionGroups.length === 0 ? (
          <StateMessage>No changelog entries found.</StateMessage>
        ) : (
          <div className="flex flex-col divide-y divide-border/40">
            {versionGroups.map((group) => (
              <VersionBlock
                key={`${group.version}-${group.date}`}
                group={group}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
