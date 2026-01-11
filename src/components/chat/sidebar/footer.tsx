import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useUsage } from "@/hooks/use-usage";
import { useTradeSession } from "@/hooks/use-trade-session";

export const SidebarFooter = () => {
  const { usage } = useUsage();

  return (
    <div className="border-t bg-card/50">
      <UsageIndicator usage={usage} />
      <ExportButton />
    </div>
  );
};

export const ExportButton = () => {
  const { exportCurrentSession, importSession } = useTradeSession();

  return (
    <div className="flex gap-2 p-2 ">
      <Button
        className="flex-1"
        variant="outline"
        onClick={exportCurrentSession}
      >
        <Upload className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button className="flex-1" variant="outline" onClick={importSession}>
        <Download className="h-4 w-4 mr-2" />
        Import
      </Button>
    </div>
  );
};

const UsageIndicator = ({ usage }: { usage?: string }) => {
  if (!usage) return null;

  return (
    <div className="px-4 py-3 space-y-2 border-b">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Memory</span>
        <span className="font-medium text-foreground">{usage}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
        <div
          className="h-full bg-primary/80 transition-all duration-500 ease-out"
          style={{ width: usage }}
        />
      </div>
    </div>
  );
};
