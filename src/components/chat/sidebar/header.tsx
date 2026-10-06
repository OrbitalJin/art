import { Button } from "@/components/ui/button";
import {
  Drama,
  MessageCircle,
  PanelLeftClose,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SessionType } from "@/lib/store/session/types";
import { useCallback } from "react";

interface Props {
  onClose?: () => void;
  query: string;
  setQuery: (query: string) => void;
}

const isSessionType = (value: string | undefined): value is SessionType =>
  value === "chat" || value === "agent";

export const SidebarHeader: React.FC<Props> = ({
  onClose,
  query,
  setQuery,
}) => {
  const create = useSessionStore((state) => state.create);
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const routeType = isSessionType(type) ? type : "chat";

  const handleCreate = useCallback(() => {
    const id = create(routeType, `New ${routeType === "chat" ? "Chat" : "Agent"}`);
    navigate(`/session/${routeType}/${id}`);
  }, [create, navigate, routeType]);

  return (
    <div className="flex flex-col">
      <div className="flex border-b p-2 gap-2">
        <Button
          variant="outline"
          className="flex-1 items-center"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" /> New{" "}
          {routeType === "chat" ? "Chat" : "Agent"}
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
      <div className="flex p-2 border-b">
        <Tabs
          className="flex-1"
          value={routeType}
          onValueChange={(v) => navigate(`/session/${v}`)}
        >
          <TabsList className="flex-1 w-full">
            <TabsTrigger value="chat">
              <MessageCircle />
            </TabsTrigger>
            <TabsTrigger value="agent">
              <Drama />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
