import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatInput } from "@/contexts/chat-context";
import { selectDirectory } from "@/lib/fs";
import { Book, BookOpen } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

export const KnowledgeSelector = () => {
  const { knowledgeRoot, setKnowledgeRoot } = useChatInput();
  const handleSelectKnowledgeBase = useCallback(async () => {
    const root = await selectDirectory();
    if (!root) {
      toast.warning("No folder was selected.");
      return setKnowledgeRoot(undefined);
    }
    setKnowledgeRoot(root);
    toast.info("Knowledge Base folder connected");
  }, [setKnowledgeRoot]);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={knowledgeRoot ? "default" : "outline"}
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
