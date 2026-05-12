import { cn } from "@/lib/utils";
import {
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";

export const EditorItemRenderer = ({ item }: { item: any }) => {
  const Icon = item.icon;

  if (item.items) {
    return (
      <ContextMenuSub>
        <ContextMenuSubTrigger
          disabled={item.isDisabled}
          className={cn(item.isActive && "bg-accent")}
        >
          <Icon className="mr-2 h-4 w-4" />
          <span>{item.label}</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {item.items.map((sub: any) => (
            <EditorItemRenderer key={sub.label} item={sub} />
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
    );
  }

  return (
    <ContextMenuItem
      onClick={item.action}
      disabled={item.isDisabled}
      className={cn(item.isActive && "bg-accent")}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </ContextMenuItem>
  );
};
