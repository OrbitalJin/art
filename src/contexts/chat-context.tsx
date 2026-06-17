import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, stepCountIs, smoothStream } from "ai";
import { useSessionStore } from "@/lib/store/use-session-store";
import type {
  Message,
  MessageStatus,
  ContentBlock,
} from "@/lib/store/session/types";
import { systemPrompt } from "@/lib/ai/prompts/system";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { providerTools } from "@/lib/ai/tools/provider";
import { customToolsFor } from "@/lib/ai/tools/custom";
import { modelById } from "@/lib/ai/models";
import { generateSessionTitle } from "@/lib/ai/generate-session-title";

// --- Stream context ---
interface ChatStreamValues {
  streamingSessionId: string | null;
  isSending: boolean;
  abortStream: () => void;
}

// --- Input context ---
interface ChatInputValues {
  prompt: string;
  setPrompt: (value: string) => void;
  sendMessage: (text: string) => Promise<void>;
}

// --- Messages context ---
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
  blocks: ContentBlock[];
  status: MessageStatus;
}

const INITIAL_STATE: State = {
  sessionId: null,
  isSending: false,
  blocks: [],
  status: "thinking",
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

  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<State>(INITIAL_STATE);

  const abortRef = useRef<AbortController | null>(null);
  const provider = useMemo(
    () => createGoogleGenerativeAI({ apiKey }),
    [apiKey],
  );

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
        blocks: [],
        status: "thinking",
      });

      let currentBlocks: ContentBlock[] = [];
      let status: MessageStatus = "streaming";
      let stream: ReturnType<typeof streamText> | null = null;

      try {
        stream = streamText({
          model: provider(modelById(session.modelId).type),
          stopWhen: stepCountIs(10),
          abortSignal: controller.signal,
          system: systemPrompt({
            mode: session.mode,
            traits: session.traits,
            userProfile,
            agentProfile,
          }),
          tools: {
            ...providerTools({ provider }),
            ...customToolsFor({ session }),
          },
          messages: [
            ...toSDKMessages(
              useSessionStore.getState().sessions.find((s) => s.id === activeId)
                ?.messages ?? [],
            ),
            { role: "user", content: text },
          ],
          experimental_transform: smoothStream({
            delayInMs: 15,
            chunking: "word",
          }),
        });

        for await (const event of stream.fullStream) {
          switch (event.type) {
            case "text-delta": {
              const lastBlock = currentBlocks[currentBlocks.length - 1];

              if (lastBlock && lastBlock.type === "text") {
                currentBlocks = [
                  ...currentBlocks.slice(0, -1),
                  { ...lastBlock, text: lastBlock.text + event.text },
                ];
              } else {
                currentBlocks = [
                  ...currentBlocks,
                  { type: "text", text: event.text },
                ];
              }

              setState((prev) => ({
                ...prev,
                blocks: currentBlocks,
              }));
              break;
            }

            case "tool-call": {
              currentBlocks.push({
                type: "tool-call",
                id: event.toolCallId,
                toolName: event.toolName,
                input: event.input,
                state: "executing",
              });

              setState((prev) => ({
                ...prev,
                blocks: [...currentBlocks],
              }));
              break;
            }

            case "tool-result": {
              currentBlocks = currentBlocks.map((block) => {
                if (
                  block.type === "tool-call" &&
                  block.id === event.toolCallId
                ) {
                  return {
                    ...block,
                    state: "result" as const,
                    output: event.output,
                  };
                }
                return block;
              });

              setState((prev) => ({
                ...prev,
                blocks: [...currentBlocks],
              }));
              break;
            }

            case "abort": {
              status = "aborted";
              return;
            }

            case "error": {
              status = "error";
              return;
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) {
          status = "aborted";
        } else {
          status = "error";
          console.error(err);
        }
      } finally {
        abortRef.current = null;

        setState({
          sessionId: activeId,
          isSending: false,
          blocks: [],
          status: "thinking",
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
          content: currentBlocks,
          status: status !== "streaming" ? status : "complete",
          modelId: session.modelId,
          grounded: session.grounding,
          tokenUsage: {
            input: usage?.inputTokens ?? 0,
            output: usage?.outputTokens ?? 0,
          },
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
    [activeId, apiKey, addMessage, provider],
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
        id: "streaming-response",
        role: "assistant" as const,
        modelId: activeSession?.modelId,
        grounded: activeSession?.grounding,
        content: state.blocks,
        status: state.status,
        tokenUsage: { input: 0, output: 0 },
      } satisfies Message,
    ];
  }, [
    activeSession,
    state.isSending,
    state.blocks,
    state.status,
    state.sessionId,
    activeId,
  ]);

  const streamValue = useMemo(
    () => ({
      streamingSessionId: state.isSending ? state.sessionId : null,
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
