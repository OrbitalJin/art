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

    const { sessions, removeFolder } = useSessionStore.getState();

    for (const session of sessions) {
      for (const folder of session.folders ?? []) {
        grantFolder(folder.path).catch((error) => {
          console.warn(
            `Removing folder "${folder.name}" (${folder.path}): ${String(error)}`,
          );
          removeFolder(session.id, folder.id);
        });
      }
    }
  }, [hydrated, folderPaths]);
};
