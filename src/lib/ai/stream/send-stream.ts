import { toast } from "sonner";
import { createGateway, smoothStream, streamText } from "ai";
import type {
  Message,
  MessageAttachment,
  MessageStatus,
} from "@/lib/store/session/types";
import { messageText } from "@/lib/store/session/types";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { modelTypeById } from "@/lib/ai/models";
import { generateSessionTitle } from "@/lib/ai/generate-session-title";
import { nativeFetch } from "@/lib/native-fetch";
import {
  applyStreamEvent,
  initialAccumulator,
  isTerminal,
} from "@/lib/ai/stream/stream-accumulator";
import { presetFor } from "@/lib/ai/stream/presets";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";
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
  if (!apiKey) return;

  const session = useSessionStore
    .getState()
    .sessions.find((s) => s.id === sessionId);
  if (!session) return;

  const { userProfile, agentProfile } = useSettingsStore.getState();
  const profiles = { user: userProfile, agent: agentProfile };

  const controller = useStreamStore.getState().begin(sessionId);

  let acc = initialAccumulator;
  let status: MessageStatus = "streaming";
  let stream: ReturnType<typeof streamText> | null = null;

  try {
    const history =
      useSessionStore.getState().sessions.find((s) => s.id === sessionId)
        ?.messages ?? [];
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
      ...presetFor({
        session,
        profiles,
      }),
    });

    for await (const event of stream.fullStream) {
      acc = applyStreamEvent(acc, event);
      if (isTerminal(acc)) {
        status = acc.status;
        break;
      }
      useStreamStore.getState().setSnapshot(sessionId, acc);
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
    useApprovalStore.getState().clear(sessionId);
    useQuestionStore.getState().clear(sessionId);
    useStreamStore.getState().end(sessionId);

    const stillExists = useSessionStore
      .getState()
      .sessions.find((s) => s.id === sessionId);
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

    useSessionStore.getState().addMessage(sessionId, {
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
      const ss = useSessionStore
        .getState()
        .sessions.find((s) => s.id === sessionId);
      if (ss && !ss.titleGenerated && ss.messages.length === 2) {
        generateSessionTitle(sessionId);
      }
    }
  }
}
