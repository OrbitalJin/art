import { memo } from "react";
import { UserMessage } from "./user";
import { AssistantMessage } from "./assistant";
import { AbortedMessage } from "./aborted";
import { ErrorMessage } from "./error";
import type { Message } from "@/lib/store/session/types";

interface BrokerProps extends Message {
  onRevert?: () => void;
}

export const MessageBroker = memo(
  (props: BrokerProps) => {
    const aborted = props.role === "model" && props.status === "aborted";
    if (props.status === "error") return <ErrorMessage {...props} />;
    if (props.role === "user") return <UserMessage {...props} />;
    if (aborted) return <AbortedMessage {...props} />;
    if (props.role === "model") return <AssistantMessage {...props} />;
    return null;
  },
  (prev, next) => {
    return (
      prev.content === next.content &&
      prev.status === next.status &&
      prev.modelId === next.modelId
    );
  },
);
