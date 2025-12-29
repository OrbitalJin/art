import { useActiveSession } from "@/contexts/active-session-context";
import { MessageList } from "../chat/messages/list";
import { Sidebar } from "../chat/sidebar/sidebar";
import { Prompt } from "@/components/chat/prompt/prompt";

export function ChatPage() {
  const chat = useActiveSession();

  return (
    <div className="relative flex-1 flex flex-row select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col selection:bg-primary/50 selection:text-white min-w-0">
        <MessageList messages={chat.messages} />
        <Prompt />
      </div>
    </div>
  );
}
