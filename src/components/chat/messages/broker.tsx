import { memo } from "react";
import { UserMessage } from "./user";
import { AssistantMessage } from "./assistant";
import { AbortedMessage } from "./aborted";
import { ErrorMessage } from "./error";
import type { Message } from "@/lib/store/session/types";

export const MessageBroker = memo(
  (props: Message) => {
    const aborted = props.role === "assistant" && props.status === "aborted";
    if (props.status === "error") return <ErrorMessage {...props} />;
    if (props.role === "user") return <UserMessage {...props} />;
    if (aborted) return <AbortedMessage {...props} />;
    if (props.role === "assistant") return <AssistantMessage {...props} />;
    return null;
  },
  (prev, next) => {
    const prevContent = Array.isArray(prev.content)
      ? JSON.stringify(prev.content)
      : prev.content;
    const nextContent = Array.isArray(next.content)
      ? JSON.stringify(next.content)
      : next.content;

    return (
      prevContent === nextContent &&
      prev.status === next.status &&
      prev.modelId === next.modelId
    );
  },
);
