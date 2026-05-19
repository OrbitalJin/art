import { Progress } from "@/components/ui/progress";
import { useUsage } from "@/hooks/use-usage";

export const SidebarFooter = () => {
  const { usage } = useUsage();

  return (
    <div className="border-t bg-card/50">
      <UsageIndicator usage={usage} />
    </div>
  );
};

const UsageIndicator = ({ usage }: { usage?: number }) => {
  if (!usage) return null;

  return (
    <div className="space-y-2 px-4 py-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Memory</span>
        <span className="font-medium tabular-nums text-foreground">
          {usage} %
        </span>
      </div>

      <Progress value={Math.min(usage, 100)} className="h-2 bg-muted/70" />
    </div>
  );
};
