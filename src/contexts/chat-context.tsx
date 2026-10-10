import React, { createContext, useCallback, useContext, useMemo } from "react";
import { toast } from "sonner";
import { useSessionStore } from "@/lib/store/use-session-store";
import type {
  Message,
  MessageAttachment,
} from "@/lib/store/session/types";
const loadSendToSession = () => import("@/lib/ai/stream/send-stream");
import {
  STREAMING_MESSAGE_ID,
  useStreamStore,
} from "@/lib/store/use-stream-store";
import { useDraft, useDraftStore } from "@/lib/store/use-draft-store";

interface ChatInputValues {
  prompt: string;
  setPrompt: (value: string) => void;
  attachments: MessageAttachment[];
  addAttachment: (attachment: MessageAttachment) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  sendMessage: (
    text: string,
    attachments?: MessageAttachment[],
  ) => Promise<void>;
}

interface ChatMessagesValues {
  messages: Message[];
  editMessage: (messageId: string, text: string) => void;
}

const ChatInputContext = createContext<ChatInputValues | null>(null);
const ChatMessagesContext = createContext<ChatMessagesValues | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const activeId = useSessionStore((state) => state.activeId);
  const addMessage = useSessionStore((state) => state.addMessage);
  const revertMessage = useSessionStore((state) => state.revertMessage);
  const activeSession = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

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

  const addAttachment = useCallback(
    (attachment: MessageAttachment) => {
      if (activeId) useDraftStore.getState().addAttachment(activeId, attachment);
    },
    [activeId],
  );

  const removeAttachment = useCallback(
    (index: number) => {
      if (activeId) useDraftStore.getState().removeAttachment(activeId, index);
    },
    [activeId],
  );

  const clearAttachments = useCallback(() => {
    if (activeId) useDraftStore.getState().clearAttachments(activeId);
  }, [activeId]);

  const sendMessage = useCallback(
    async (text: string, sendAttachments?: MessageAttachment[]) => {
      if (!activeId) return;
      if (useStreamStore.getState().streams[activeId]) {
        toast.info("This session is already generating");
        return;
      }
      if (!text.trim() && !(sendAttachments && sendAttachments.length)) {
        toast.warning("Please enter a message");
        return;
      }
      const messageAttachments =
        sendAttachments && sendAttachments.length ? sendAttachments : undefined;
      addMessage(activeId, {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text }],
        attachments: messageAttachments,
        tokenUsage: { input: 0, output: 0 },
      });
      useDraftStore.getState().clear(activeId);
      const { sendToSession } = await loadSendToSession();
      await sendToSession(activeId, text, messageAttachments);
    },
    [activeId, addMessage],
  );

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      if (!activeId) return;

      if (!text.trim()) {
        toast.warning("Please enter a message");
        return;
      }

      const existing = useSessionStore
        .getState()
        .sessions.find((s) => s.id === activeId)
        ?.messages.find((m) => m.id === messageId);
      const existingAttachments = existing?.attachments;

      revertMessage(activeId, messageId);

      addMessage(activeId, {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text }],
        attachments: existingAttachments,
        tokenUsage: { input: 0, output: 0 },
      });
      useDraftStore.getState().clear(activeId);
      const { sendToSession } = await loadSendToSession();
      await sendToSession(activeId, text, existingAttachments);
    },
    [addMessage, activeId, revertMessage],
  );

  const messages = useMemo(() => {
    const base = activeSession?.messages ?? [];

    if (!streamSnapshot) return base;

    return [
      ...base,
      {
        id: STREAMING_MESSAGE_ID,
        role: "assistant" as const,
        modelId: activeSession?.modelId,
        parts: streamSnapshot.parts,
        toolCalls: streamSnapshot.toolCalls,
        status: streamSnapshot.status,
        tokenUsage: { input: 0, output: 0 },
        reasoning: streamSnapshot.reasoningText || undefined,
      } satisfies Message,
    ];
  }, [activeSession, streamSnapshot]);

  const inputValue = useMemo(
    () => ({
      prompt,
      setPrompt,
      attachments,
      addAttachment,
      removeAttachment,
      clearAttachments,
      sendMessage,
    }),
    [
      prompt,
      setPrompt,
      attachments,
      addAttachment,
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