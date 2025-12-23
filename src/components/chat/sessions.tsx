import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import type { Session } from "@/lib/llm/common/session/type";
import { cn } from "@/lib/utils";

interface Props {
  disabled?: boolean;
  sessions: Session[];
  activeId: string | null;
  switchToById: (id: string) => void;
  create: (title?: string, systemPrompt?: string) => Session;
}

export const SessionSwitcher: React.FC<Props> = ({
  disabled,
  sessions,
  activeId,
  switchToById,
  create,
}) => {
  if (!activeId) return null;

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2 p-2 bg-card rounded-md border",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      )}
    >
      <Tabs
        value={activeId}
        onValueChange={(value: string) => !disabled && switchToById(value)}
      >
        <TabsList className="shadow-md backdrop-blur-2xl">
          {sessions.map((session) => (
            <TabsTrigger
              key={session.id}
              value={session.id}
              disabled={disabled}
            >
              {session.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Button
        variant="outline"
        size="icon"
        disabled={disabled}
        onClick={() => {
          create();
        }}
      >
        <Plus />
      </Button>
    </div>
  );
};
