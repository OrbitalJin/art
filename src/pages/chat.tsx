import { useActiveSession } from "@/contexts/active-session-context";
import { MessageList } from "@/components/chat/messages/list";
import { StaticSidebar } from "@/components/chat/sidebar/static";
import { Prompt } from "@/components/chat/prompt/prompt";
import { FloatingSidebar } from "@/components/chat/sidebar/floating";

export const Chat = () => {
  const chat = useActiveSession();
  return (
    <div className="relative flex-1 flex flex-row select-none">
      <StaticSidebar />
      <FloatingSidebar />
      <div className="flex-1 flex flex-col selection:bg-primary/50 selection:text-white min-w-0">
        <MessageList messages={chat.messages} />
        <Prompt />
      </div>
    </div>
  );
};
