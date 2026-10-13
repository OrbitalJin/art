import { Mail, MailOpen, Mails, Tags } from "lucide-react";
import {
  emailListOutputSchema,
  emailOutputSchema,
  gmailFetchEmailsInput,
  gmailFetchMessageInput,
  gmailListLabelsInput,
  gmailListMessagesInput,
  labelListOutputSchema,
  messageIdListOutputSchema,
} from "./schema";
import {
  EmailDetail,
  EmailListDetail,
  EmailListSummary,
  EmailSummary,
  LabelListDetail,
  LabelListSummary,
  MessageIdListDetail,
  MessageIdListSummary,
} from "./parts";

export const emailRenderers = {
  GMAIL_FETCH_EMAILS: {
    icon: Mails,
    title: "Searched emails",
    executingTitle: "Searching emails",
    inputSchema: gmailFetchEmailsInput,
    outputSchema: emailListOutputSchema,
    Summary: EmailListSummary,
    Detail: EmailListDetail,
  },
  GMAIL_LIST_MESSAGES: {
    icon: Mail,
    title: "Listed messages",
    executingTitle: "Listing messages",
    inputSchema: gmailListMessagesInput,
    outputSchema: messageIdListOutputSchema,
    Summary: MessageIdListSummary,
    Detail: MessageIdListDetail,
  },
  GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID: {
    icon: MailOpen,
    title: "Read email",
    executingTitle: "Reading email",
    inputSchema: gmailFetchMessageInput,
    outputSchema: emailOutputSchema,
    Summary: EmailSummary,
    Detail: EmailDetail,
  },
  GMAIL_LIST_LABELS: {
    icon: Tags,
    title: "Listed labels",
    executingTitle: "Listing labels",
    inputSchema: gmailListLabelsInput,
    outputSchema: labelListOutputSchema,
    Summary: LabelListSummary,
    Detail: LabelListDetail,
  },
};
