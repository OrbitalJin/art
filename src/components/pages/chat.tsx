import { useActiveSession } from "@/contexts/active-session-context";
import { MessageList } from "../chat/messages/list";
import { FloatingSidebar } from "../chat/sidebar/floating";
import { StaticSidebar } from "../chat/sidebar/static";
import { Prompt } from "@/components/chat/prompt/prompt";

export function ChatPage() {
  const chat = useActiveSession();

  return (
    <div className="relative flex-1 flex flex-row select-none">
      <FloatingSidebar />
      <StaticSidebar />
      <div className="flex-1 flex flex-col selection:bg-primary/50 selection:text-white min-w-0">
        <MessageList messages={chat.messages} />
        <Prompt />
      </div>
    </div>
  );
}
