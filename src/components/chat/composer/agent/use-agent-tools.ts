import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { grantFolder, makeRoot, selectDirectory } from "@/lib/fs";
import type { SessionMeta, ToolCallBlock } from "@/lib/store/session/types";

export const useAgentTools = (
  session: SessionMeta | undefined,
  toolCalls: ToolCallBlock[],
) => {
  const addFolder = useSessionIndex((state) => state.addFolder);
  const removeFolder = useSessionIndex((state) => state.removeFolder);
  const setGroup = useSessionIndex((state) => state.setGroup);
  const disableAllGroups = useSessionIndex((state) => state.disableAllGroups);

  const onAddFolder = useCallback(async () => {
    if (!session) return;

    const path = await selectDirectory();
    if (!path) {
      toast.warning("No folder was selected.");
      return;
    }

    try {
      await grantFolder(path);
    } catch (error) {
      toast.error(`Cannot connect folder: ${String(error)}`);
      return;
    }

    const root = await makeRoot(path, session.folders ?? []);
    addFolder(session.id, root);
    toast.info(`Folder "${root.name}" connected`);
  }, [session, addFolder]);

  const onRemoveFolder = useCallback(
    (folderId: string) => {
      if (!session) return;
      removeFolder(session.id, folderId);
    },
    [session, removeFolder],
  );

  const onToggle = useCallback(
    (key: string, value: boolean) => {
      if (!session) return;
      setGroup(session.id, key, value);
    },
    [session, setGroup],
  );

  const onRevokeAll = useCallback(() => {
    if (!session) return;
    disableAllGroups(session.id);
  }, [session, disableAllGroups]);

  const running = useMemo(
    () =>
      toolCalls.filter(
        (call) => call.state === "executing" && call.toolName !== DONE_TOOL_NAME,
      ).length,
    [toolCalls],
  );

  return { running, onAddFolder, onRemoveFolder, onToggle, onRevokeAll };
};
