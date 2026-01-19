import { Button } from "@/components/ui/button";
import { PanelLeftClose, Plus, Search, X } from "lucide-react";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn } from "@/lib/utils";

interface Props {
  onClose?: () => void;
  query: string;
  setQuery: (query: string) => void;
}

export const SidebarHeader: React.FC<Props> = ({
  onClose,
  query,
  setQuery,
}) => {
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
      <div className="flex p-2 border-b">
        <div
          className={cn(
            "flex-1 flex flex-row p-2 gap-2 items-center",
            "bg-card border text-foreground/70 text-sm rounded-md",
          )}
        >
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none flex-1"
            placeholder="Search sessions..."
          />
          {query && (
            <X
              size={16}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setQuery("")}
            />
          )}
        </div>
      </div>
    </div>
  );
};
