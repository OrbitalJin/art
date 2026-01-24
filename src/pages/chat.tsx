import { useActiveSession } from "@/contexts/active-session-context";
import { MessageList } from "@/components/chat/messages/list";
import { StaticSidebar } from "@/components/chat/sidebar/static";
import { Prompt } from "@/components/chat/prompt/prompt";
import { FloatingSidebar } from "@/components/chat/sidebar/floating";
import { useSettingsStore } from "@/lib/store/use-settings-store";

export const Chat = () => {
  const chat = useActiveSession();
  const isOpen = useSettingsStore((state) => state.chatSidebarOpen);
  const setIsOpen = useSettingsStore((state) => state.setChatSidebarOpen);

  return (
    <div className="relative flex-1 flex flex-row select-none">
      <StaticSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <FloatingSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="relative flex-1 flex flex-col selection:bg-primary/50 min-w-0">
        <MessageList messages={chat.messages} />
        <Prompt />
      </div>
    </div>
  );
};
