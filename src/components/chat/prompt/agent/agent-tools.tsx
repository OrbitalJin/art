import { useCallback } from "react";
import { toast } from "sonner";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useSessionStore } from "@/lib/store/use-session-store";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/names";
import { grantFolder, makeRoot, selectDirectory } from "@/lib/fs";
import { ConfigureMenu } from "./configure-menu";
import { EnabledTools } from "./enabled-tools";
import { ToolActivity } from "./tool-activity";

interface AgentToolsProps {
  active: boolean;
}

export const AgentTools: React.FC<AgentToolsProps> = ({ active }) => {
  const activeId = useSessionStore((state) => state.activeId);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const addFolder = useSessionStore((state) => state.addFolder);
  const removeFolder = useSessionStore((state) => state.removeFolder);
  const setToolkit = useSessionStore((state) => state.setToolkit);
  const disableAllToolkits = useSessionStore(
    (state) => state.disableAllToolkits,
  );
  const { isSending, toolCalls } = useChatStream();

  const handleAddFolder = useCallback(async () => {
    if (!activeId || !session) return;

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
    addFolder(activeId, root);
    toast.info(`Folder "${root.name}" connected`);
  }, [activeId, session, addFolder]);

  const handleRemoveFolder = useCallback(
    (folderId: string) => {
      if (!activeId) return;
      removeFolder(activeId, folderId);
    },
    [activeId, removeFolder],
  );

  const handleToggle = useCallback(
    (key: string, value: boolean) => {
      if (!activeId) return;
      setToolkit(activeId, key, value);
    },
    [activeId, setToolkit],
  );

  const handleRevokeAll = useCallback(() => {
    if (!activeId) return;
    disableAllToolkits(activeId);
  }, [activeId, disableAllToolkits]);

  if (!session) return null;

  const running = toolCalls.filter(
    (call) => call.state === "executing" && call.toolName !== DONE_TOOL_NAME,
  ).length;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {active ? (
        <ToolActivity toolCalls={toolCalls} running={running} />
      ) : (
        <EnabledTools session={session} />
      )}

      <ConfigureMenu
        disabled={isSending}
        session={session}
        onAddFolder={handleAddFolder}
        onRemoveFolder={handleRemoveFolder}
        onToggle={handleToggle}
        onRevokeAll={handleRevokeAll}
      />
    </div>
  );
};
