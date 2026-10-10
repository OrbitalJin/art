import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  CodePanel,
  EmptyNote,
  ErrorNote,
  KeyValueList,
} from "../../primitives";
import { errorOf, messageOf, messagesOf, toEmail } from "./helpers";
import { LabelChips, MessageIdsDetail, MessagesDetail } from "./parts";

export const FetchEmailsDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <MessagesDetail
    block={block}
    emptyLabel="No emails found."
    executingLabel="Searching…"
  />
);

export const ListMessagesDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <MessageIdsDetail block={block} />
);

export const ThreadDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <MessagesDetail block={block} emptyLabel="No messages in thread." />
);

export const SingleMessageDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const messages = messagesOf(block.output);
  const email = toEmail(messageOf(block.output));
  if (!email.id && !email.subject && messages.length === 0) {
    return <EmptyNote>Message not found.</EmptyNote>;
  }

  const entries = [
    email.sender ? { label: "From", value: email.sender } : null,
    email.recipient ? { label: "To", value: email.recipient } : null,
    email.subject ? { label: "Subject", value: email.subject } : null,
    email.date ? { label: "Date", value: email.date } : null,
  ].filter((entry): entry is { label: string; value: string } => entry !== null);

  return (
    <div className="flex flex-col gap-3">
      {entries.length > 0 ? <KeyValueList entries={entries} /> : null}
      <LabelChips labels={email.labels} />
      {email.snippet ? (
        <CodePanel maxHeightClass="max-h-72">{email.snippet}</CodePanel>
      ) : null}
    </div>
  );
};
