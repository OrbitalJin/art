import { SidebarFooter } from "@/components/chat/sidebar/footer";
import { SidebarHeader } from "@/components/chat/sidebar/header";
import { SessionList } from "@/components/chat/sidebar/session/list";

interface Props {
  onSessionSwitch?: () => void;
}

export const SidebarContent: React.FC<Props> = ({ onSessionSwitch }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl">
      <SidebarHeader />
      <SessionList onSessionSwitch={onSessionSwitch} />
      <SidebarFooter />
    </div>
  );
};
