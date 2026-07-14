import { SidebarFooter } from "./footer";
import { SidebarHeader } from "./header";
import { SidebarNav } from "./nav";

interface Props {
  onClose?: () => void;
  onNewCapture?: () => void;
}

export const SidebarContent: React.FC<Props> = ({ onClose, onNewCapture }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl">
      <SidebarHeader onClose={onClose} onNewCapture={onNewCapture} />
      <SidebarNav />
      <SidebarFooter />
    </div>
  );
};
