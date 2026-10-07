import { useEffect } from "react";
import { grantFolder } from "@/lib/fs";
import { useSessionStore } from "@/lib/store/use-session-store";

export const useRestoreFolderScope = () => {
  const hydrated = useSessionStore((state) => state.hydrated);
  const folderPaths = useSessionStore((state) =>
    state.sessions
      .flatMap((session) =>
        (session.folders ?? []).map((folder) => folder.path),
      )
      .sort()
      .join("\n"),
  );

  useEffect(() => {
    if (!hydrated || !folderPaths) return;

    for (const path of folderPaths.split("\n")) {
      grantFolder(path).catch(() => {});
    }
  }, [hydrated, folderPaths]);
};
