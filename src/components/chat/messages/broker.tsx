import React from "react";
import type { Message } from "@/lib/llm/common/memory/types";
import { UserMessage } from "./user";
import { AssistantMessage } from "./assistant";
import { AbortedMessage } from "./aborted";
import { ErrorMessage } from "./error";

export const MessageBroker: React.FC<Message> = (props) => {
  const aborted = props.role === "assistant" && props.status === "aborted";
  if (props.role === "system") return null;
  if (props.status === "error") return <ErrorMessage {...props} />;
  if (props.role === "user") return <UserMessage {...props} />;
  if (aborted) return <AbortedMessage {...props} />;
  if (props.role === "assistant") return <AssistantMessage {...props} />;
  return null;
};
