import React, { createContext, useCallback, useContext, useMemo } from "react";
import { toast } from "sonner";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { useSession, sessionDataStore } from "@/lib/store/session/data-store";
import {
  appendMessage,
  revertMessage,
} from "@/lib/store/session/commands";
import type {
  ChatAttachment,
  Message,
} from "@/lib/store/session/types";
import { toPersistedAttachment } from "@/lib/upload/pocketbase";
import {
  parseJournalRefIds,
  stripJournalRefs,
  type JournalRef,
} from "@/lib/journal/ref";
import { useJournalIndex } from "@/lib/store/journal/index-store";
const loadSendToSession = () => import("@/lib/ai/stream/send-stream");
import {
  STREAMING_MESSAGE_ID,
  useStreamStore,
} from "@/lib/store/use-stream-store";
import { useDraft, useDraftStore } from "@/lib/store/use-draft-store";

interface ChatInputValues {
  prompt: string;
  setPrompt: (value: string) => void;
  attachments: ChatAttachment[];
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  sendMessage: (
    text: string,
    attachments?: ChatAttachment[],
  ) => Promise<void>;
}

interface ChatMessagesValues {
  messages: Message[];
  editMessage: (messageId: string, text: string) => void;
}

const ChatInputContext = createContext<ChatInputValues | null>(null);
const ChatMessagesContext = createContext<ChatMessagesValues | null>(null);

/** Resolve the reference tokens in a draft to the entries that still exist. */
const resolveRefs = (text: string): JournalRef[] => {
  const get = useJournalIndex.getState().getPage;
  return parseJournalRefIds(text).flatMap((id) => {
    const page = get(id);
    return page ? [{ id: page.id, title: page.title }] : [];
  });
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const activeId = useSessionIndex((state) => state.activeId);
  const activeMeta = useSessionIndex((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const sessionData = useSession(activeId);

  const draft = useDraft(activeId);
  const prompt = draft.prompt;
  const attachments = draft.attachments;

  const streamSnapshot = useStreamStore((state) =>
    activeId ? state.streams[activeId]?.snapshot : undefined,
  );

  const setPrompt = useCallback(
    (value: string) => {
      if (activeId) useDraftStore.getState().setPrompt(activeId, value);
    },
    [activeId],
  );

  const removeAttachment = useCallback(
    (id: string) => {
      if (activeId) useDraftStore.getState().removeAttachment(activeId, id);
    },
    [activeId],
  );

  const clearAttachments = useCallback(() => {
    if (activeId) useDraftStore.getState().clearAttachments(activeId);
  }, [activeId]);

  const sendMessage = useCallback(
    async (text: string, sendAttachments?: ChatAttachment[]) => {
      if (!activeId) return;
      if (useStreamStore.getState().streams[activeId]) {
        toast.info("This session is already generating");
        return;
      }
      if (!text.trim() && !(sendAttachments && sendAttachments.length)) {
        toast.warning("Please enter a message");
        return;
      }
      const messageAttachments = sendAttachments
        ?.filter((a) => a.status === undefined || a.status === "done")
        .map(toPersistedAttachment);
      const persistedAttachments = messageAttachments?.length
        ? messageAttachments
        : undefined;
      const refs = resolveRefs(text);
      const body = stripJournalRefs(text);
      await appendMessage(activeId, {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: body }],
        attachments: persistedAttachments,
        refs: refs.length ? refs : undefined,
        tokenUsage: { input: 0, output: 0 },
        createdAt: Date.now(),
      });
      useDraftStore.getState().clear(activeId);
      const { sendToSession } = await loadSendToSession();
      await sendToSession(activeId, body, persistedAttachments, refs);
    },
    [activeId],
  );

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      if (!activeId) return;

      if (!text.trim()) {
        toast.warning("Please enter a message");
        return;
      }

      const data = sessionDataStore.getState().cache[activeId];
      const existing = data?.messages.find((m) => m.id === messageId);
      const existingAttachments = existing?.attachments;
      const existingRefs = existing?.refs;

      await revertMessage(activeId, messageId);

      await appendMessage(activeId, {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text }],
        attachments: existingAttachments,
        refs: existingRefs,
        tokenUsage: { input: 0, output: 0 },
        createdAt: Date.now(),
      });
      useDraftStore.getState().clear(activeId);
      const { sendToSession } = await loadSendToSession();
      await sendToSession(activeId, text, existingAttachments, existingRefs);
    },
    [activeId],
  );

  const messages = useMemo(() => {
    const base = sessionData?.messages ?? [];

    if (!streamSnapshot) return base;

    return [
      ...base,
      {
        id: STREAMING_MESSAGE_ID,
        role: "assistant" as const,
        modelId: activeMeta?.modelId,
        parts: streamSnapshot.parts,
        toolCalls: streamSnapshot.toolCalls,
        status: streamSnapshot.status,
        tokenUsage: { input: 0, output: 0 },
      } satisfies Message,
    ];
  }, [sessionData, activeMeta, streamSnapshot]);

  const inputValue = useMemo(
    () => ({
      prompt,
      setPrompt,
      attachments,
      removeAttachment,
      clearAttachments,
      sendMessage,
    }),
    [
      prompt,
      setPrompt,
      attachments,
      removeAttachment,
      clearAttachments,
      sendMessage,
    ],
  );

  const messagesValue = useMemo(
    () => ({
      messages,
      editMessage,
    }),
    [messages, editMessage],
  );

  return (
    <ChatMessagesContext.Provider value={messagesValue}>
      <ChatInputContext.Provider value={inputValue}>
        {children}
      </ChatInputContext.Provider>
    </ChatMessagesContext.Provider>
  );
};

export const useChatInput = () => {
  const context = useContext(ChatInputContext);
  if (!context) {
    throw new Error("useChatInput must be used within ChatProvider");
  }
  return context;
};

export const useChatMessages = () => {
  const context = useContext(ChatMessagesContext);
  if (!context) {
    throw new Error("useChatMessages must be used within ChatProvider");
  }
  return context;
};