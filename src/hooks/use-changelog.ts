import { useEffect, useState } from "react";

export interface ChangelogEntry {
  hash: string;
  type: string;
  message: string;
  date: string;
}

export interface VersionGroup {
  version: string;
  date: string;
  entries: ChangelogEntry[];
}

export const useChangelog = (enabled: boolean) => {
  const [versionGroups, setVersionGroups] = useState<VersionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/changelog.json", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch changelog");
        }

        const data = (await response.json()) as VersionGroup[];

        if (!cancelled) {
          setVersionGroups(data);
        }
      } catch (err) {
        console.error("Failed to load changelogs:", err);

        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load changelog",
          );
          setVersionGroups([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    versionGroups,
    loading,
    error,
  };
};
