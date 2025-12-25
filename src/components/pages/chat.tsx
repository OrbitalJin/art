import { useState } from "react";
import Prompt from "@/components/chat/prompt/prompt";
import { useChat } from "@/contexts/chat-context";
import { MessageList } from "../chat/messages/list";
import { FloatingSidebar } from "../chat/sidebar/floating";
import { StaticSidebar } from "../chat/sidebar/static";

export function ChatPage() {
  const chat = useChat();
  const [autoScroll, setAutoScroll] = useState<boolean>(false);

  return (
    <div className="relative flex-1 flex flex-row">
      <FloatingSidebar />
      <StaticSidebar />
      <div className="flex-1 flex flex-col selection:bg-primary/50 selection:text-white min-w-0">
        <MessageList messages={chat.messages} />
        <Prompt autoScroll={autoScroll} setAutoScroll={setAutoScroll} />
      </div>
    </div>
  );
}
