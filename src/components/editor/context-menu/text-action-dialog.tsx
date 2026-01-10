import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TONES } from "@/lib/ai/common/prompts";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProcess: (tone: string, instructions?: string) => void;
  action: "summarize" | "rephrase" | "bullet";
  isProcessing?: boolean;
}

export const TextActionDialog = ({
  isOpen,
  onOpenChange,
  onProcess,
  action,
  isProcessing = false,
}: Props) => {
  const [tone, setTone] = useState("professional");
  const [instructions, setInstructions] = useState("");

  const handleProcess = () => {
    onProcess(tone, instructions.trim() || undefined);
    setInstructions("");
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleProcess();
    }
  };

  const label = action.charAt(0).toUpperCase() + action.slice(1);
  const description =
    action === "summarize"
      ? "Summarize the selected text with your preferred tone and style."
      : action === "rephrase"
        ? "Rephrase the selected text while keeping the original meaning."
        : "Generate a bullet point list of the selected text with your preferred tone and style.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="tone" className="text-sm font-medium leading-none">
              Tone
            </label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="instructions"
              className="text-sm font-medium leading-none"
            >
              Custom Instructions (Optional)
            </label>
            <Textarea
              id="instructions"
              placeholder="Add any specific instructions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setInstructions("");
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handleProcess} disabled={isProcessing}>
            {isProcessing ? "Processing..." : label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
