import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";

interface ChangelogEntry {
  hash: string;
  type: string;
  message: string;
  date: string;
}

interface VersionGroup {
  version: string;
  date: string;
  entries: ChangelogEntry[];
}

interface GroupedByDateAndType {
  [date: string]: {
    [type: string]: ChangelogEntry[];
  };
}

function groupByDateAndType(entries: ChangelogEntry[]): GroupedByDateAndType {
  const grouped: GroupedByDateAndType = {};

  for (const entry of entries) {
    if (!grouped[entry.date]) {
      grouped[entry.date] = {};
    }

    if (!grouped[entry.date][entry.type]) {
      grouped[entry.date][entry.type] = [];
    }

    grouped[entry.date][entry.type].push(entry);
  }

  return grouped;
}

function getTypeColor(type: string) {
  switch (type) {
    case "feat":
    case "added":
      return "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300";

    case "fix":
    case "fixed":
      return "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300";

    case "updated":
      return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300";

    case "refactor":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";

    case "tweaks":
      return "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300";

    case "semantics":
      return "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-300";

    case "patch":
      return "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function ChangelogDialog() {
  const open = useUIStateStore((state) => state.changelogDialogOpen);
  const setOpen = useUIStateStore((state) => state.setChangelogDialogOpen);
  const [versionGroups, setVersionGroups] = useState<VersionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);

    fetch("/changelog.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch changelog");
        }

        return response.json();
      })
      .then((data: VersionGroup[]) => {
        setVersionGroups(data);
      })
      .catch((error) => {
        console.error("Failed to load changelogs:", error);
        setVersionGroups([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[85vh] w-[min(860px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-xl">Changelog</DialogTitle>
          <DialogDescription>Recent updates and changes.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="px-6 py-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">
                    Loading changelog...
                  </p>
                </div>
              ) : versionGroups.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No changelog entries found.
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {versionGroups.map((group) => {
                    const groupedEntries = groupByDateAndType(group.entries);

                    return (
                      <section
                        key={`${group.version}-${group.date}`}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-4">
                          <h2 className="shrink-0 text-lg font-semibold tracking-tight">
                            {group.version === "Unreleased" ? (
                              <span className="text-primary">Unreleased</span>
                            ) : group.version === "Pre-release" ? (
                              <span className="text-muted-foreground">
                                Pre-release
                              </span>
                            ) : (
                              <span>v{group.version}</span>
                            )}
                          </h2>

                          <div className="h-px flex-1 bg-border" />

                          <span className="shrink-0 text-sm text-muted-foreground">
                            {group.date}
                          </span>
                        </div>

                        {group.entries.length === 0 ? (
                          <div className="pl-1 text-sm text-muted-foreground">
                            No changelog entries for this release.
                          </div>
                        ) : (
                          <div className="space-y-6 pl-1">
                            {Object.entries(groupedEntries)
                              .sort(([a], [b]) => b.localeCompare(a))
                              .map(([date, types]) => (
                                <div key={date} className="space-y-3">
                                  <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                    {date}
                                  </h3>

                                  <div className="space-y-4 pl-3">
                                    {Object.entries(types).map(
                                      ([type, entries]) => (
                                        <div key={type} className="space-y-2.5">
                                          <Badge
                                            variant="outline"
                                            className={getTypeColor(type)}
                                          >
                                            {type}
                                          </Badge>

                                          <ul className="space-y-2">
                                            {entries.map((entry, index) => (
                                              <li
                                                key={`${entry.hash}-${entry.message}-${index}`}
                                                className="flex items-start gap-3 text-sm leading-6"
                                              >
                                                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground/80">
                                                  {entry.hash}
                                                </span>
                                                <span className="min-w-0 text-foreground/90">
                                                  {entry.message}
                                                </span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
