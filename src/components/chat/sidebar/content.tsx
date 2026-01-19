import { useState } from "react";
import { SidebarFooter } from "@/components/chat/sidebar/footer";
import { SidebarHeader } from "@/components/chat/sidebar/header";
import { SessionList } from "@/components/chat/sidebar/session/list";

interface Props {
  onClose?: () => void;
  onSessionSwitch?: () => void;
}

export const SidebarContent: React.FC<Props> = ({
  onSessionSwitch,
  onClose,
}) => {
  const [query, setQuery] = useState<string>("");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl">
      <SidebarHeader onClose={onClose} query={query} setQuery={setQuery} />
      <SessionList onSessionSwitch={onSessionSwitch} query={query} />
      <SidebarFooter />
    </div>
  );
};
