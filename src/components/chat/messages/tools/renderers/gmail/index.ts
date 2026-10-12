import { Mail, MailOpen, Mails } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  gmailMessageOutput,
  gmailMessagesOutput,
  type GmailToolName,
} from "@/lib/ai/tools/gmail";
import {
  FetchEmailsDetail,
  ListMessagesDetail,
  SingleMessageDetail,
} from "./details";
import {
  FetchEmailsSummary,
  ListMessagesSummary,
  MessageSummary,
} from "./summaries";

export const gmailRenderers = {
  gmail_fetch_emails: {
    icon: Mails,
    title: "Fetched emails",
    schema: gmailMessagesOutput,
    Summary: FetchEmailsSummary,
    Detail: FetchEmailsDetail,
  },
  gmail_list_messages: {
    icon: Mail,
    title: "Listed messages",
    schema: gmailMessagesOutput,
    Summary: ListMessagesSummary,
    Detail: ListMessagesDetail,
  },
  gmail_fetch_message_by_id: {
    icon: MailOpen,
    title: "Read email",
    schema: gmailMessageOutput,
    Summary: MessageSummary,
    Detail: SingleMessageDetail,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Partial<Record<GmailToolName, ToolRenderer<any>>>;
