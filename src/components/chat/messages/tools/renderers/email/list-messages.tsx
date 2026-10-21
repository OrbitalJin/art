import type { FC } from "react";
import { Mail } from "lucide-react";
import {
  EmptyNote,
  ListRow,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { gmailListMessagesInput, messageIdListOutputSchema } from "./schema";
import type { GmailListMessagesInput, MessageIdListOutput } from "./schema";

const Summary: FC<RendererProps<GmailListMessagesInput, MessageIdListOutput>> =
  ({ block, input, output }) => {
    const query = input?.q ?? null;
    const count = output?.messages.length ?? 0;

    return (
      <SummaryRow>
        {query ? <SummaryText title={query}>{query}</SummaryText> : null}
        <SummaryStatus block={block}>
          <ResultBadge>{formatCount(count, "id")}</ResultBadge>
        </SummaryStatus>
      </SummaryRow>
    );
  };

const Detail: FC<RendererProps<GmailListMessagesInput, MessageIdListOutput>> =
  ({ block, output }) => {
    if (block.state === "executing") return <EmptyNote>Fetching…</EmptyNote>;

    const messages = output?.messages ?? [];
    if (messages.length === 0) return <EmptyNote>No messages found.</EmptyNote>;

    return (
      <RowList maxHeightClass="max-h-72">
        {messages.map((message) => (
          <ListRow key={message.id}>
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="min-w-0 truncate font-mono text-[11px] text-foreground/80">
                {message.id}
              </span>
              <span className="ml-auto shrink-0 truncate font-mono text-[10px] text-muted-foreground/40">
                {message.threadId}
              </span>
            </div>
          </ListRow>
        ))}
      </RowList>
    );
  };

export const renderer = defineRenderer<
  GmailListMessagesInput,
  MessageIdListOutput
>({
  icon: Mail,
  title: "Listed messages",
  executingTitle: "Listing messages",
  inputSchema: gmailListMessagesInput,
  outputSchema: messageIdListOutputSchema,
  Summary,
  Detail,
});
