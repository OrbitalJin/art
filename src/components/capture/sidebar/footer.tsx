import { useMemo, useState } from "react";
import { Inbox, Star, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCaptureStore } from "@/lib/store/use-capture-store";

export const SidebarFooter: React.FC = () => {
  const captures = useCaptureStore((state) => state.captures);
  const clear = useCaptureStore((state) => state.clear);
  const [clearOpen, setClearOpen] = useState(false);

  const { starred } = useMemo(() => {
    return {
      starred: captures.filter((capture) => capture.starred).length,
    };
  }, [captures]);

  return (
    <div className="border-t bg-muted/30">
      <div className="flex items-center justify-around px-4 py-3 text-xs">
        <StatItem icon={Inbox} value={captures.length} label="total" />
        <StatItem icon={Star} value={starred} label="starred" />
      </div>

      <div className="flex items-center gap-2 p-2 border-t">
        <Button
          variant="outline"
          className={cn("flex-1 transition-all", "hover:text-destructive")}
          disabled={captures.length === 0}
          onClick={() => setClearOpen(true)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Clear all
        </Button>
      </div>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all captures?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes all {captures.length} capture
              {captures.length === 1 ? "" : "s"}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                clear();
                setClearOpen(false);
              }}
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}

const StatItem = ({ icon: Icon, value, label }: StatItemProps) => {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium text-foreground">
        {value.toLocaleString()}
      </span>
      <span>{label}</span>
    </div>
  );
};
