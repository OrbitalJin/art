import { Mail, MailOpen, Mails, MessagesSquare } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  FetchEmailsDetail,
  ListMessagesDetail,
  SingleMessageDetail,
  ThreadDetail,
} from "./details";
import {
  FetchEmailsSummary,
  ListMessagesSummary,
  MessageSummary,
  ThreadSummary,
} from "./summaries";

export const gmailRenderers: Record<string, ToolRenderer> = {
  GMAIL_FETCH_EMAILS: {
    icon: Mails,
    title: "Fetched emails",
    Summary: FetchEmailsSummary,
    Detail: FetchEmailsDetail,
  },
  GMAIL_LIST_MESSAGES: {
    icon: Mail,
    title: "Listed messages",
    Summary: ListMessagesSummary,
    Detail: ListMessagesDetail,
  },
  GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID: {
    icon: MailOpen,
    title: "Read email",
    Summary: MessageSummary,
    Detail: SingleMessageDetail,
  },
  GMAIL_FETCH_MESSAGE_BY_THREAD_ID: {
    icon: MessagesSquare,
    title: "Read thread",
    Summary: ThreadSummary,
    Detail: ThreadDetail,
  },
};
