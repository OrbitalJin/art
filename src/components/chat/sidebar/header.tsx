import { Button } from "@/components/ui/button";
import { PanelLeftClose, Plus } from "lucide-react";
import { useSessionStore } from "@/lib/store/use-session-store";

interface Props {
  onClose?: () => void;
}

export const SidebarHeader: React.FC<Props> = ({ onClose }) => {
  const { create } = useSessionStore();
  return (
    <div className="flex flex-col">
      <div className="flex border-b p-2 gap-2">
        <Button
          variant="outline"
          className="flex-1 items-center"
          onClick={() => create("New Session")}
        >
          <Plus className="h-4 w-4" /> New Session
        </Button>
        {onClose && (
          <Button variant="outline" size="icon" onClick={onClose}>
            <PanelLeftClose />
          </Button>
        )}
      </div>
    </div>
  );
};
