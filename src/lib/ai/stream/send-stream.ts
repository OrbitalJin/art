import { toast } from "sonner";
import { createGateway, smoothStream, streamText } from "ai";
import type {
  Message,
  MessageAttachment,
  MessageStatus,
} from "@/lib/store/session/types";
import { messageText } from "@/lib/store/session/types";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { sessionDataStore } from "@/lib/store/session/data-store";
import { appendMessage } from "@/lib/store/session/commands";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { modelTypeById } from "@/lib/ai/models";
import { generateSessionTitle } from "@/lib/ai/generate-session-title";
import { nativeFetch } from "@/lib/native-fetch";
import {
  applyStreamEvent,
  initialAccumulator,
  isTerminal,
  type StreamAccumulator,
} from "@/lib/ai/stream/stream-accumulator";
import { presetFor } from "@/lib/ai/stream/presets";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";
import { useTodoStore } from "@/lib/store/use-todo-store";
import { useStreamStore } from "@/lib/store/use-stream-store";

function attachmentToImagePart(attachment: MessageAttachment) {
  return {
    type: "image" as const,
    image: attachment.base64,
    mediaType: attachment.mediaType,
  };
}

function toSDKMessages(messages: Message[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const text = messageText(m);
      if (m.role === "user" && m.attachments?.length) {
        return {
          role: "user" as const,
          content: [
            { type: "text" as const, text },
            ...m.attachments.map(attachmentToImagePart),
          ],
        };
      }
      return {
        role: m.role as "user" | "assistant",
        content: text,
      };
    });
}

export async function sendToSession(
  sessionId: string,
  text: string,
  attachments?: MessageAttachment[],
): Promise<void> {
  const apiKey = useSettingsStore.getState().apiKey;
  if (!apiKey) {
    toast.error("Add a gateway key in Settings to send messages.");
    return;
  }

  const session = useSessionIndex.getState().getMeta(sessionId);
  if (!session) return;

  const { userProfile, agentProfile } = useSettingsStore.getState();
  const profiles = { user: userProfile, agent: agentProfile };

  const controller = useStreamStore.getState().begin(sessionId);
  useTodoStore.getState().clear(sessionId);

  let acc = initialAccumulator;
  let status: MessageStatus = "streaming";
  let stream: ReturnType<typeof streamText> | null = null;

  let frame = 0;
  let pending: StreamAccumulator | null = null;

  const cancelPending = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    pending = null;
  };

  const flush = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (pending) {
      useStreamStore.getState().setSnapshot(sessionId, pending);
      pending = null;
    }
  };

  const schedule = (snapshot: StreamAccumulator) => {
    pending = snapshot;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      flush();
    });
  };

  try {
    await sessionDataStore.getState().ensure(sessionId);
    const history =
      sessionDataStore.getState().cache[sessionId]?.messages ?? [];
    const trailing =
      history.length > 0 && history[history.length - 1].role === "user"
        ? history.slice(0, -1)
        : history;

    const currentUserContent = attachments?.length
      ? [
          { type: "text" as const, text },
          ...attachments.map(attachmentToImagePart),
        ]
      : text;

    stream = streamText({
      model: createGateway({ apiKey, fetch: nativeFetch })(
        modelTypeById(session.modelId),
      ),
      abortSignal: controller.signal,
      messages: [
        ...toSDKMessages(trailing),
        { role: "user" as const, content: currentUserContent },
      ],
      experimental_transform: smoothStream({
        delayInMs: 5,
        chunking: "word",
      }),
      ...(await presetFor({
        session,
        profiles,
      })),
    });

    for await (const event of stream.fullStream) {
      acc = applyStreamEvent(acc, event);
      if (isTerminal(acc)) {
        status = acc.status;
        break;
      }
      schedule(acc);
    }
    flush();
  } catch (err) {
    cancelPending();
    if (controller.signal.aborted) {
      status = "aborted";
      acc = { ...acc, status: "aborted" };
    } else {
      status = "error";
      acc = { ...acc, status: "error" };
      console.error(err);
    }
  } finally {
    useApprovalStore.getState().clear(sessionId);
    useQuestionStore.getState().clear(sessionId);
    useTodoStore.getState().clear(sessionId);
    useStreamStore.getState().end(sessionId);

    const stillExists = useSessionIndex.getState().getMeta(sessionId);
    if (stillExists) {
      const label = stillExists.title ? ` in “${stillExists.title}”` : "";
      if (status === "error") toast.error(`Something went wrong${label}`);
      else if (status === "aborted") toast.info(`Stream aborted${label}`);
    }

    let usage: Awaited<ReturnType<typeof streamText>["usage"]> | undefined;
    if (stream && status !== "aborted" && status !== "error") {
      try {
        usage = await stream.usage;
      } catch {
        usage = undefined;
      }
    }

    await appendMessage(sessionId, {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: acc.parts.length
        ? acc.parts
        : [{ type: "text" as const, text: " " }],
      toolCalls: acc.toolCalls.length ? acc.toolCalls : undefined,
      status: status !== "streaming" ? status : "complete",
      modelId: session.modelId,
      tokenUsage: {
        input: usage?.inputTokens ?? 0,
        output: usage?.outputTokens ?? 0,
      },
      reasoning: acc.reasoningText || undefined,
    });

    if (status === "streaming") {
      const ss = useSessionIndex.getState().getMeta(sessionId);
      const messages = sessionDataStore.getState().cache[sessionId]?.messages;
      if (ss && !ss.titleGenerated && messages?.length === 2) {
        generateSessionTitle(sessionId);
      }
    }
  }
}
