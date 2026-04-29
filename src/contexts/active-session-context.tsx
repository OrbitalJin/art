import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useJournalStore } from "@/lib/store/use-journal-store";
import type { Message, MessageStatus } from "@/lib/store/session/types";
import {
  createUserMessage,
  createModelMessage,
} from "@/lib/llm/common/message-factories";
import { useLLM } from "@/contexts/llm-context";
import { gen } from "@/lib/llm/prompts/gen";
import { systemPrompt } from "@/lib/llm/prompts/system";
import { DEFAULT_MODE } from "@/lib/llm/prompts/modes";
import { getSessionRefsContext } from "@/hooks/use-session-refs";
import { MODELS } from "@/lib/llm/common/types";

interface ActiveSessionContextValues {
  activeId: string | null;
  streamingSessionId: string | null;
  messages: Message[];
  isSending: boolean;
  prompt: string;
  setPrompt: (value: string) => void;
  sendMessage: (text: string) => Promise<void>;
  abortStream: () => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextValues | null>(
  null,
);

export const ActiveSessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { llm } = useLLM();
  const { activeId, sessions, addMessage } = useSessionStore();

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId],
  );

  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [streamingSessionId, setStreamingSessionId] = useState<string | null>(
    null,
  );
  const [streamContent, setStreamContent] = useState("");
  const [streamStatus, setStreamStatus] = useState<
    "thinking" | "streaming" | "aborted"
  >("thinking");

  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    setStreamStatus("aborted");
    setIsSending(false);
    setStreamingSessionId(null);
    toast.info("Stream aborted");
  }, []);

  const generateTitle = useCallback(
    async (sessionId: string) => {
      if (!llm) return;

      try {
        const currentSessions = useSessionStore.getState().sessions;
        const session = currentSessions.find((s) => s.id === sessionId);
        if (!session?.messages.length) return;

        const mode = session.mode ?? DEFAULT_MODE;
        const traits = session.traits ?? [];
        const generatedSystemPrompt = systemPrompt(mode, traits);
        const journalContext = getSessionRefsContext(
          session.journalRefs ?? [],
          useJournalStore.getState(),
        );
        const modelId = session.modelId;
        const modelType = MODELS.find((m) => m.id === modelId)?.type;

        const title = await llm.genFromMessages(gen.title, session.messages, {
          model: modelType,
          systemPrompt: generatedSystemPrompt,
          context: journalContext,
        });

        if (title?.trim()) {
          useSessionStore.getState().updateTitle(sessionId, title.trim());
          useSessionStore.getState().setTitleGenerated(sessionId, true);
        }
      } catch {
        console.error("Title generation failed");
      }
    },
    [llm],
  );

  const send = useCallback(
    async (text: string) => {
      if (!activeId || !llm) return;

      const controller = new AbortController();
      controllerRef.current = controller;

      setStreamContent("");
      setStreamStatus("thinking");
      setIsSending(true);
      setStreamingSessionId(activeId);

      let fullResponse = "";
      let status: MessageStatus = "streaming";
      let errorType: string | undefined;

      try {
        const mode = activeSession?.mode ?? DEFAULT_MODE;
        const traits = activeSession?.traits ?? [];
        const generatedSystemPrompt = systemPrompt(mode, traits);
        const journalContext = getSessionRefsContext(
          activeSession?.journalRefs ?? [],
          useJournalStore.getState(),
        );
        const modelId = activeSession?.modelId;
        const modelType = MODELS.find((m) => m.id === modelId)?.type;

        const stream = llm.stream(text, activeSession?.messages || [], {
          model: modelType,
          signal: controller.signal,
          systemPrompt: generatedSystemPrompt,
          context: journalContext,
          useGoogleSearch: activeSession?.searchGrounding,
          webCtxUrls: activeSession?.webCtxUrls,
        });

        for await (const chunk of stream) {
          if (chunk.error) {
            status = chunk.error.type === "aborted" ? "aborted" : "error";
            errorType = chunk.error.type;
            break;
          }

          if (chunk.token) {
            fullResponse += chunk.token;
            setStreamContent((prev) => prev + chunk.token);
            setStreamStatus("streaming");
          }

          if (chunk.isFinal && status === "streaming") {
            status = "complete";
          }
        }
      } catch {
        status = "error";
      } finally {
        controllerRef.current = null;
        setIsSending(false);
        setStreamingSessionId(null);

        const modelMessage = createModelMessage(
          fullResponse.trim(),
          status,
          activeSession?.searchGrounding,
          activeSession?.modelId,
          errorType,
        );

        addMessage(activeId, modelMessage);

        const updatedSession = useSessionStore
          .getState()
          .sessions.find((s) => s.id === activeId);

        const shouldGenerateTitle =
          updatedSession &&
          !updatedSession.titleGenerated &&
          updatedSession.messages.length === 2 &&
          updatedSession.messages[0]?.role === "user" &&
          updatedSession.messages[1]?.role === "model" &&
          status === "complete" &&
          fullResponse.trim();

        if (shouldGenerateTitle) {
          void generateTitle(activeId);
        }

        if (status === "error") {
          toast.error("Network error occurred");
        }
      }
    },
    [activeId, llm, activeSession, addMessage, generateTitle],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeId) return;

      if (isSending) {
        toast.info("Please wait for the current stream to finish");
        return;
      }

      if (!text.trim()) {
        toast.warning("Please enter a message");
        return;
      }

      addMessage(activeId, createUserMessage(text));
      setPrompt("");
      await send(text);
    },
    [activeId, isSending, addMessage, send],
  );

  const messages = useMemo(() => {
    const base = activeSession?.messages || [];

    if (isSending && streamingSessionId === activeId) {
      return [
        ...base,
        {
          id: "streaming-response",
          role: "model" as const,
          content: streamContent,
          status: streamStatus,
          modelId: activeSession?.modelId,
          grounded: activeSession?.searchGrounding,
        } as Message,
      ];
    }

    return base;
  }, [
    activeSession,
    isSending,
    streamingSessionId,
    activeId,
    streamContent,
    streamStatus,
  ]);

  const value = useMemo(
    () => ({
      activeId,
      messages,
      isSending,
      prompt,
      streamingSessionId,
      setPrompt,
      sendMessage,
      abortStream: abort,
    }),
    [
      messages,
      isSending,
      prompt,
      streamingSessionId,
      sendMessage,
      abort,
      activeId,
    ],
  );

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  );
};

export const useActiveSession = () => {
  const context = useContext(ActiveSessionContext);

  if (!context) {
    throw new Error(
      "useActiveSession must be used within ActiveSessionProvider",
    );
  }

  return context;
};
