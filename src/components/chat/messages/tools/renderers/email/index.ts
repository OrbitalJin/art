import type { ToolRenderer } from "../../types";
import { renderer as fetchEmails } from "./fetch-emails";
import { renderer as fetchMessage } from "./fetch-message";
import { renderer as listLabels } from "./list-labels";
import { renderer as listMessages } from "./list-messages";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const emailRenderers = {
  GMAIL_FETCH_EMAILS: fetchEmails,
  GMAIL_LIST_MESSAGES: listMessages,
  GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID: fetchMessage,
  GMAIL_LIST_LABELS: listLabels,
} satisfies Record<string, AnyRenderer>;
