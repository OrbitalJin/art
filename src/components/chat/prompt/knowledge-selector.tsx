import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { selectDirectory } from "@/lib/fs";
import { useSessionStore } from "@/lib/store/use-session-store";
import { Book, BookOpen } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

export const KnowledgeSelector = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const setKnowledgeBase = useSessionStore((state) => state.setKnowledgeBase);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === activeId),
  );

  const knowledgeRoot = session?.knowledgeBase;

  const handleSelectKnowledgeBase = useCallback(async () => {
    const root = await selectDirectory();
    if (!root) {
      toast.warning("No folder was selected.");
      return;
    }
    setKnowledgeBase(activeId!, root);
    toast.info("Knowledge Base folder connected");
  }, [setKnowledgeBase, activeId]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={"outline"}
          size="icon"
          onClick={handleSelectKnowledgeBase}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          {knowledgeRoot ? <BookOpen className="h-4 w-4" /> : <Book />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs truncate">
        {knowledgeRoot ? knowledgeRoot : "Knowledge Base"}
      </TooltipContent>
    </Tooltip>
  );
};
