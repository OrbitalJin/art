import { ArrowDown } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  isVisible: boolean;
  onClick: () => void;
}

export const ScrollToBottomButton: React.FC<Props> = ({
  isVisible,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 z-30",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full shadow-md bg-background/80 backdrop-blur border h-8 px-3 text-xs"
        onClick={onClick}
      >
        <ArrowDown className="mr-1 h-3 w-3" />
        Scroll to bottom
      </Button>
    </div>
  );
};
