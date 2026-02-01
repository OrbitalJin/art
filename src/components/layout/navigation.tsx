import { useLocation, useNavigate } from "react-router-dom";
import {
  Book,
  BookOpen,
  MessageCircle,
  MessageCircleDashed,
  Square,
  SquareCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Command } from "../command";

export interface NavigationItem {
  href: string;
  name: string;
  icon: LucideIcon;
  activeIcon: LucideIcon;
  shortcut: string;
  description: string;
}

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSelected = (path: string): boolean => location.pathname === path;

  const items: NavigationItem[] = [
    {
      href: "/chat",
      name: "Chat",
      description: "Chat",
      icon: MessageCircleDashed,
      activeIcon: MessageCircle,
      shortcut: "Alt+1",
    },
    {
      icon: Book,
      activeIcon: BookOpen,
      name: "Journal",
      description: "Journal",
      href: "/Journal",
      shortcut: "Alt+2",
    },
    {
      icon: Square,
      activeIcon: SquareCheck,
      name: "Tasks",
      description: "Tasks",
      href: "/tasks",
      shortcut: "Alt+3",
    },
  ];

  return (
    <nav className="flex flex-col gap-2 flex-1 w-full px-2 items-center">
      {items.map((item) => (
        <Button
          key={item.href}
          className={cn(
            "hover:scale-110 transition-all",
            isSelected(item.href) && "text-primary",
          )}
          variant="ghost"
          size="icon"
          onClick={() => navigate(item.href)}
        >
          {isSelected(item.href) ? (
            <item.activeIcon size={20} />
          ) : (
            <item.icon size={20} />
          )}
        </Button>
      ))}

      <Command items={items} />
    </nav>
  );
};
