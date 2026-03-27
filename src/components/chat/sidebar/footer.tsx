import { useUsage } from "@/hooks/use-usage";

export const SidebarFooter = () => {
  const { usage } = useUsage();

  return (
    <div className="border-t bg-card/50">
      <UsageIndicator usage={usage} />
    </div>
  );
};

const UsageIndicator = ({ usage }: { usage?: string }) => {
  if (!usage) return null;

  return (
    <div className="px-4 py-3 space-y-2">
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
