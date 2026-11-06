import { cn } from "@/lib/utils";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";

export const ART_KEY_NOTICE = "Add your art key in Settings";

export const KeyNotice: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const openSettings = useUIStateStore((state) => state.setSettingsDialogOpen);

  return (
    <button
      type="button"
      onClick={() => openSettings(true)}
      className={cn(
        "flex w-full min-w-0 cursor-pointer items-center gap-2 text-left",
        "text-[11px] leading-snug text-muted-foreground outline-none",
        "transition-colors duration-150 hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="min-w-0">{children}</span>
    </button>
  );
};
