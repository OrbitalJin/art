import { useEffect } from "react";
import { grantFolder } from "@/lib/fs";
import { useSessionIndex } from "@/lib/store/session/index-store";

export const useRestoreFolderScope = () => {
  const hydrated = useSessionIndex((state) => state.hydrated);
  const folderPaths = useSessionIndex((state) =>
    state.sessions
      .flatMap((session) =>
        (session.folders ?? []).map((folder) => folder.path),
      )
      .sort()
      .join("\n"),
  );

  useEffect(() => {
    if (!hydrated || !folderPaths) return;

    const { sessions, removeFolder } = useSessionIndex.getState();

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
