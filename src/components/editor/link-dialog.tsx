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
import { Input } from "@/components/ui/input";
import { Link as LinkIcon } from "lucide-react";

interface Props {
  onAddLink: (url: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkDialog = ({ onAddLink, isOpen, onOpenChange }: Props) => {
  const [url, setUrl] = useState("");

  const handleAddLink = () => {
    if (url.trim()) {
      onAddLink(url.trim());
      setUrl("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Add Link
          </DialogTitle>
          <DialogDescription>
            Enter the URL you want to link to. The link will be added to your
            selected text.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium leading-none">
              URL
            </label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setUrl("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddLink}>Add Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
