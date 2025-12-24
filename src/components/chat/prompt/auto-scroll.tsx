import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, LockOpen } from "lucide-react";

interface Props {
  setAutoScroll: (value: boolean) => void;
  autoScroll: boolean;
}

export const AutoScrollToggle: React.FC<Props> = ({
  setAutoScroll,
  autoScroll,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setAutoScroll(!autoScroll);
          }}
        >
          {autoScroll ? <Lock /> : <LockOpen />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle Auto Scroll</TooltipContent>
    </Tooltip>
  );
};
