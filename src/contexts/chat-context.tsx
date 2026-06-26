import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { streamText, stepCountIs, smoothStream } from "ai";
import { useSessionStore } from "@/lib/store/use-session-store";
import type { Message, MessageStatus } from "@/lib/store/session/types";
import { systemPrompt } from "@/lib/ai/prompts/system";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { toolsFor } from "@/lib/ai/tools/tools";
import { modelTypeById } from "@/lib/ai/models";
import { generateSessionTitle } from "@/lib/ai/generate-session-title";
import { useGateway } from "@/hooks/use-gateway";
import {
  applyStreamEvent,
  initialAccumulator,
  isTerminal,
  type StreamAccumulator,
} from "@/lib/ai/stream/stream-accumulator";

const STREAMING_MESSAGE_ID = "streaming-response";

interface ChatStreamValues {
  streamingSessionId: string | null;
  streamingMessageId: string | null;
  isSending: boolean;
  abortStream: () => void;
}

interface ChatInputValues {
  prompt: string;
  setPrompt: (value: string) => void;
  sendMessage: (text: string) => Promise<void>;
}

interface ChatMessagesValues {
  messages: Message[];
  editMessage: (messageId: string, text: string) => void;
}

const ChatStreamContext = createContext<ChatStreamValues | null>(null);
const ChatInputContext = createContext<ChatInputValues | null>(null);
const ChatMessagesContext = createContext<ChatMessagesValues | null>(null);

function toSDKMessages(messages: Message[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      let contentString = "";
      if (Array.isArray(m.content)) {
        contentString = m.content
          .map((block) => (block.type === "text" ? block.text : ""))
          .join("");
      } else {
        contentString = m.content;
      }

      return {
        role: m.role as "user" | "assistant",
        content: contentString,
      };
    });
}

interface State {
  sessionId: string | null;
  isSending: boolean;
  snapshot: StreamAccumulator;
}

const INITIAL_STATE: State = {
  sessionId: null,
  isSending: false,
  snapshot: initialAccumulator,
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const activeId = useSessionStore((state) => state.activeId);
  const addMessage = useSessionStore((state) => state.addMessage);
  const revertMessage = useSessionStore((state) => state.revertMessage);
  const activeSession = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const gateway = useGateway();

  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<State>(INITIAL_STATE);

  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      if (!activeId || !apiKey) return;

      const session = useSessionStore
        .getState()
        .sessions.find((s) => s.id === activeId);
      if (!session) return;

      const { userProfile, agentProfile } = useSettingsStore.getState();

      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        sessionId: activeId,
        isSending: true,
        snapshot: initialAccumulator,
      });

      let acc: StreamAccumulator = initialAccumulator;
      let status: MessageStatus = "streaming";
      let stream: ReturnType<typeof streamText> | null = null;

      try {
        stream = streamText({
          model: gateway(modelTypeById(session.modelId)),
          stopWhen: stepCountIs(10),
          abortSignal: controller.signal,
          system: systemPrompt({
            mode: session.mode,
            traits: session.traits,
            userProfile,
            agentProfile,
          }),
          tools: toolsFor({ session }),
          messages: [
            ...toSDKMessages(
              useSessionStore.getState().sessions.find((s) => s.id === activeId)
                ?.messages ?? [],
            ),
            { role: "user", content: text },
          ],
          experimental_transform: smoothStream({
            delayInMs: 5,
            chunking: "word",
          }),
        });

        for await (const event of stream.fullStream) {
          acc = applyStreamEvent(acc, event);
          if (isTerminal(acc)) {
            status = acc.status;
            break;
          }
          setState((prev) => ({ ...prev, snapshot: acc }));
        }
      } catch (err) {
        if (controller.signal.aborted) {
          status = "aborted";
          acc = { ...acc, status: "aborted" };
        } else {
          status = "error";
          acc = { ...acc, status: "error" };
          console.error(err);
        }
      } finally {
        abortRef.current = null;

        setState({
          sessionId: activeId,
          isSending: false,
          snapshot: initialAccumulator,
        });

        if (status === "error") toast.error("Something went wrong");
        else if (status === "aborted") toast.info("Stream aborted");

        let usage: Awaited<ReturnType<typeof streamText>["usage"]> | undefined;
        if (stream && status !== "aborted" && status !== "error") {
          try {
            usage = await stream.usage;
          } catch {
            usage = undefined;
          }
        }

        addMessage(activeId, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: acc.blocks,
          status: status !== "streaming" ? status : "complete",
          modelId: session.modelId,
          tokenUsage: {
            input: usage?.inputTokens ?? 0,
            output: usage?.outputTokens ?? 0,
          },
          reasoning: acc.reasoningText || undefined,
        });

        if (status === "streaming") {
          const ss = useSessionStore
            .getState()
            .sessions.find((s) => s.id === activeId);
          if (ss && !ss.titleGenerated && ss.messages.length === 2) {
            generateSessionTitle(activeId);
          }
        }
      }
    },
    [activeId, apiKey, addMessage, gateway],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeId) return;
      if (state.isSending) {
        toast.info("Please wait for the current response to finish");
        return;
      }
      if (!text.trim()) {
        toast.warning("Please enter a message");
        return;
      }
      addMessage(activeId, {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        tokenUsage: { input: 0, output: 0 },
      });
      setPrompt("");
      await send(text);
    },
    [activeId, state.isSending, addMessage, send],
  );

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      if (!activeId) return;

      if (!text.trim()) {
        toast.warning("Please enter a message");
        return;
      }

      revertMessage(activeId, messageId);

      addMessage(activeId, {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        tokenUsage: { input: 0, output: 0 },
      });
      setPrompt("");
      await send(text);
    },
    [addMessage, send, setPrompt, activeId, revertMessage],
  );

  const messages = useMemo(() => {
    const base = activeSession?.messages ?? [];

    if (!state.isSending || state.sessionId !== activeId) return base;

    return [
      ...base,
      {
        id: STREAMING_MESSAGE_ID,
        role: "assistant" as const,
        modelId: activeSession?.modelId,
        content: state.snapshot.blocks,
        status: state.snapshot.status,
        tokenUsage: { input: 0, output: 0 },
        reasoning: state.snapshot.reasoningText || undefined,
      } satisfies Message,
    ];
  }, [
    activeSession,
    state.isSending,
    state.snapshot,
    state.sessionId,
    activeId,
  ]);

  const streamValue = useMemo(
    () => ({
      streamingSessionId: state.isSending ? state.sessionId : null,
      streamingMessageId: state.isSending ? STREAMING_MESSAGE_ID : null,
      isSending: state.isSending,
      abortStream,
    }),
    [state.isSending, state.sessionId, abortStream],
  );

  const inputValue = useMemo(
    () => ({
      prompt,
      setPrompt,
      sendMessage,
    }),
    [prompt, setPrompt, sendMessage],
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
      <ChatStreamContext.Provider value={streamValue}>
        <ChatInputContext.Provider value={inputValue}>
          {children}
        </ChatInputContext.Provider>
      </ChatStreamContext.Provider>
    </ChatMessagesContext.Provider>
  );
};

export const useChatStream = () => {
  const context = useContext(ChatStreamContext);
  if (!context) {
    throw new Error("useChatStream must be used within ChatProvider");
  }
  return context;
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

export const useChat = (): ChatStreamValues &
  ChatInputValues &
  ChatMessagesValues => {
  return { ...useChatStream(), ...useChatInput(), ...useChatMessages() };
};
