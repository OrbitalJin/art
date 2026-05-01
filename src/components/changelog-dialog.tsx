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

  entries.forEach((entry) => {
    if (!grouped[entry.date]) {
      grouped[entry.date] = {};
    }
    if (!grouped[entry.date][entry.type]) {
      grouped[entry.date][entry.type] = [];
    }
    grouped[entry.date][entry.type].push(entry);
  });

  return grouped;
}

function getTypeColor(type: string) {
  switch (type) {
    case "feat":
    case "added":
      return "bg-green-100 text-green-800";

    case "fix":
    case "fixed":
      return "bg-red-100 text-red-800";

    case "updated":
      return "bg-blue-100 text-blue-800";

    case "refactor":
      return "bg-yellow-100 text-yellow-800";

    case "tweaks":
      return "bg-purple-100 text-purple-800";

    case "semantics":
      return "bg-pink-100 text-pink-800";

    case "patch":
      return "bg-orange-100 text-orange-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function ChangelogDialog() {
  const open = useUIStateStore((state) => state.changelogDialogOpen);
  const setOpen = useUIStateStore((state) => state.setChangelogDialogOpen);
  const [versionGroups, setVersionGroups] = useState<VersionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/changelog.json")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch changelog");
          return response.json();
        })
        .then((data: VersionGroup[]) => {
          setVersionGroups(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load changelogs:", error);
          setLoading(false);
        });
    }
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLoading(true);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-xl">Changelog</DialogTitle>
          <DialogDescription>Recent updates and changes.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading changelog...</p>
              </div>
            ) : versionGroups.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  No changelog entries found.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {versionGroups.map((group) => (
                  <div key={group.version}>
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-lg font-semibold whitespace-nowrap">
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
                      <div className="flex-1 border-t border-border" />
                      <span className="text-sm text-muted-foreground">
                        {group.date}
                      </span>
                    </div>

                    <div className="space-y-4 pl-2">
                      {Object.entries(groupByDateAndType(group.entries))
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([date, types]) => (
                          <div key={date} className="space-y-2">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {date}
                            </h3>
                            {Object.entries(types).map(([type, entries]) => (
                              <div key={type} className="space-y-1 ml-2">
                                <Badge
                                  className={getTypeColor(type)}
                                  variant="secondary"
                                >
                                  {type}
                                </Badge>
                                <ul className="space-y-1">
                                  {entries.map((entry) => (
                                    <li
                                      key={entry.hash}
                                      className="text-sm flex items-start gap-2"
                                    >
                                      <span className="text-muted-foreground font-mono text-xs mt-0.5">
                                        {entry.hash}
                                      </span>
                                      <span>{entry.message}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
