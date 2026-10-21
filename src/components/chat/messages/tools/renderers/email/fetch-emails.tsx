import type { FC } from "react";
import { Mails } from "lucide-react";
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
import { senderName } from "./helpers";
import { emailListOutputSchema, gmailFetchEmailsInput } from "./schema";
import type { EmailListOutput, GmailFetchEmailsInput } from "./schema";

const Summary: FC<RendererProps<GmailFetchEmailsInput, EmailListOutput>> = ({
  block,
  input,
  output,
}) => {
  const query = input?.query ?? null;
  const count = output?.emails.length ?? 0;

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(count, "email")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<GmailFetchEmailsInput, EmailListOutput>> = ({
  block,
  output,
}) => {
  if (block.state === "executing") return <EmptyNote>Searching…</EmptyNote>;

  const emails = output?.emails ?? [];
  if (emails.length === 0) return <EmptyNote>No emails found.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {emails.map((email, index) => (
        <ListRow key={email.id ?? index}>
          <span
            className="min-w-0 truncate text-[12px] font-medium text-foreground/90"
            title={email.subject ?? undefined}
          >
            {email.subject ?? "(no subject)"}
          </span>

          {email.from ? (
            <span className="truncate text-[10px] text-muted-foreground/70">
              {senderName(email.from)}
            </span>
          ) : null}

          {email.preview ? (
            <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground/70">
              {email.preview}
            </p>
          ) : null}
        </ListRow>
      ))}
    </RowList>
  );
};

export const renderer = defineRenderer<GmailFetchEmailsInput, EmailListOutput>({
  icon: Mails,
  title: "Searched emails",
  executingTitle: "Searching emails",
  inputSchema: gmailFetchEmailsInput,
  outputSchema: emailListOutputSchema,
  Summary,
  Detail,
});
