import { Button } from "@/components/ui/button";
import { PanelLeftClose, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";

interface Props {
  onClose?: () => void;
  onNewCapture?: () => void;
}

export const SidebarHeader: React.FC<Props> = ({ onClose, onNewCapture }) => {
  const search = useUIStateStore((state) => state.captureState.search);
  const setCaptureState = useUIStateStore((state) => state.setCaptureState);

  return (
    <div className="flex flex-col">
      <div className="flex border-b p-2 gap-2">
        <Button
          variant="outline"
          className="flex-1 items-center"
          onClick={onNewCapture}
        >
          <Plus className="h-4 w-4" /> New Capture
        </Button>
        {onClose && (
          <Button variant="outline" size="icon" onClick={onClose}>
            <PanelLeftClose />
          </Button>
        )}
      </div>
      <div className="flex p-2 border-b">
        <div
          className={cn(
            "flex-1 flex flex-row p-2 gap-2 items-center",
            "bg-card border text-foreground/70 text-sm rounded-md",
          )}
        >
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setCaptureState({ search: e.target.value })}
            className="outline-none flex-1"
            placeholder="Search captures..."
          />
          {search && (
            <X
              size={16}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setCaptureState({ search: "" })}
            />
          )}
        </div>
      </div>
    </div>
  );
};
