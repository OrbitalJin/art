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
import { streamText, stepCountIs } from "ai";
import { useSessionStore } from "@/lib/store/use-session-store";
import type {
  Message,
  MessageStatus,
  ContentBlock,
} from "@/lib/store/session/types";
import { systemPrompt } from "@/lib/ai/prompts/system";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { providerToolsFor } from "@/lib/tools/provider";
import { customTools } from "@/lib/tools/custom";
import { modelById } from "@/lib/ai/models";

interface ChatContextValues {
  streamingSessionId: string | null;
  messages: Message[];
  isSending: boolean;
  prompt: string;
  setPrompt: (value: string) => void;
  sendMessage: (text: string) => Promise<void>;
  abortStream: () => void;
}

function toSDKMessages(messages: Message[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      // If the content is structured blocks, serialize it back to markdown text for the SDK
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

const ChatContext = createContext<ChatContextValues | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const activeId = useSessionStore((state) => state.activeId);
  const addMessage = useSessionStore((state) => state.addMessage);
  const activeSession = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const userProfile = useSettingsStore((state) => state.userProfile);
  const agentProfile = useSettingsStore((state) => state.agentProfile);

  const modelType = modelById(activeSession?.modelId).type;
  const mode = activeSession?.mode;
  const traits = activeSession?.traits;

  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<State>({
    sessionId: null,
    isSending: false,
    blocks: [],
    status: "thinking",
  });

  const abortRef = useRef<AbortController | null>(null);
  const google = useMemo(() => createGoogleGenerativeAI({ apiKey }), [apiKey]);

  const send = useCallback(
    async (text: string) => {
      if (!activeId || !apiKey) return;

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
          model: google(modelType),
          stopWhen: stepCountIs(5),
          abortSignal: controller.signal,
          system: systemPrompt({
            mode,
            traits,
            userProfile,
            agentProfile,
          }),
          tools: {
            ...providerToolsFor({ provider: google, session: activeSession }),
            ...customTools(),
          },
          messages: [
            ...toSDKMessages(activeSession?.messages ?? []),
            { role: "user", content: text },
          ],
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
              // still runs the finally block
              return;
            }

            case "error": {
              status = "error";
              // still runs the finally block
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
          modelId: activeSession?.modelId,
          grounded: activeSession?.searchGrounding,
          tokenUsage: usage?.outputTokens || 0,
        });
      }
    },
    [
      activeId,
      apiKey,
      activeSession,
      addMessage,
      google,
      agentProfile,
      userProfile,
      mode,
      modelType,
      traits,
    ],
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
        tokenUsage: 0,
      });
      setPrompt("");
      await send(text);
    },
    [activeId, state.isSending, addMessage, send],
  );

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const messages = useMemo(() => {
    const base = activeSession?.messages ?? [];

    if (!state.isSending || state.sessionId !== activeId) return base;

    return [
      ...base,
      {
        id: "streaming-response",
        role: "assistant" as const,
        modelId: activeSession?.modelId,
        grounded: activeSession?.searchGrounding,
        content: state.blocks,
        status: state.status,
        tokenUsage: 0,
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

  const value = useMemo(
    () => ({
      streamingSessionId: state.isSending ? state.sessionId : null,
      messages,
      prompt,
      setPrompt,
      sendMessage,
      abortStream,
      isSending: state.isSending,
    }),
    [
      state.sessionId,
      messages,
      state.isSending,
      prompt,
      sendMessage,
      abortStream,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
