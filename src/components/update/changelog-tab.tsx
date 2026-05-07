import { useChangelog, type ChangelogEntry } from "@/hooks/use-changelog";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

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

interface GroupedByType {
  [type: string]: ChangelogEntry[];
}

function groupByType(entries: ChangelogEntry[]): GroupedByType {
  const grouped: GroupedByType = {};

  for (const entry of entries) {
    if (!grouped[entry.type]) {
      grouped[entry.type] = [];
    }

    grouped[entry.type].push(entry);
  }

  return grouped;
}

function getSectionAccent(type: string) {
  switch (type) {
    case "feat":
    case "added":
      return "text-emerald-700 dark:text-emerald-300";
    case "fix":
    case "fixed":
      return "text-rose-700 dark:text-rose-300";
    case "updated":
      return "text-sky-700 dark:text-sky-300";
    case "refactor":
      return "text-amber-700 dark:text-amber-300";
    case "tweaks":
      return "text-violet-700 dark:text-violet-300";
    case "semantics":
      return "text-pink-700 dark:text-pink-300";
    case "patch":
      return "text-orange-700 dark:text-orange-300";
    case "ci/cd":
      return "text-cyan-700 dark:text-cyan-300";
    case "chore":
      return "text-zinc-700 dark:text-zinc-300";
    default:
      return "text-foreground";
  }
}

function getTypeLabel(type: string) {
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
}

export const ChangelogTab: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const { versionGroups, loading, error } = useChangelog(enabled);

  return (
    <div className="min-h-0 h-full flex-1 bg-background">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-3xl px-5 py-6">
          <div className="mb-6 space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Release notes
            </p>
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              What’s new
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Improvements, fixes, and updates across recent releases.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card/60 py-14">
              <p className="text-sm text-muted-foreground">
                Loading changelog...
              </p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card/60 py-14">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : versionGroups.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card/60 py-14">
              <p className="text-sm text-muted-foreground">
                No changelog entries found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {versionGroups.map((group) => {
                const groupedEntries = groupByType(group.entries);

                const sortedTypes = Object.entries(groupedEntries).sort(
                  ([a], [b]) => {
                    const aIndex = TYPE_ORDER.indexOf(a);
                    const bIndex = TYPE_ORDER.indexOf(b);

                    const safeA =
                      aIndex === -1 ? Number.POSITIVE_INFINITY : aIndex;
                    const safeB =
                      bIndex === -1 ? Number.POSITIVE_INFINITY : bIndex;

                    return safeA - safeB;
                  },
                );

                const isUnreleased = group.version === "Unreleased";
                const isPreRelease = group.version === "Pre-release";

                return (
                  <section
                    key={`${group.version}-${group.date}`}
                    className="rounded-2xl border border-border/60 bg-card/50"
                  >
                    <div className="flex flex-col gap-2 border-b border-border/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-base font-medium tracking-tight text-foreground">
                          {isUnreleased
                            ? "Unreleased"
                            : isPreRelease
                              ? "Pre-release"
                              : `v${group.version}`}
                        </h2>

                        {isUnreleased ? (
                          <Badge
                            variant="outline"
                            className="h-5 rounded-full border-primary/15 bg-primary/5 px-2 text-[10px] font-medium text-primary"
                          >
                            In progress
                          </Badge>
                        ) : isPreRelease ? (
                          <Badge
                            variant="outline"
                            className="h-5 rounded-full border-border/60 bg-muted/40 px-2 text-[10px] font-medium text-muted-foreground"
                          >
                            Preview
                          </Badge>
                        ) : null}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {group.date}
                      </p>
                    </div>

                    <div className="px-5 py-4">
                      {group.entries.length === 0 ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                          No user-facing changelog entries for this release.
                        </p>
                      ) : (
                        <div className="space-y-5">
                          {sortedTypes.map(([type, entries]) => (
                            <div key={type} className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full bg-current",
                                    getSectionAccent(type),
                                  )}
                                />
                                <h3
                                  className={cn(
                                    "font-medium",
                                    getSectionAccent(type),
                                  )}
                                >
                                  {getTypeLabel(type)}
                                </h3>
                              </div>

                              <ul className="space-y-2 pl-3.5">
                                {entries.map((entry, index) => (
                                  <li
                                    key={`${entry.hash}-${entry.message}-${index}`}
                                    className="text-sm leading-6 text-foreground/90"
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                                      <div className="min-w-0">
                                        <span>{entry.message}</span>

                                        <span className="ml-2 font-mono text-[10px] text-muted-foreground/55">
                                          {entry.hash}
                                        </span>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
