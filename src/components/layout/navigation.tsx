import { useLocation, useNavigate } from "react-router-dom";
import {
  Book,
  BookOpen,
  Clock,
  ClockFading,
  MessageCircle,
  MessageCircleDashed,
  SquareCheck,
  SquareCheckBig,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Command } from "../command";

export interface NavigationItem {
  href: string;
  icon: LucideIcon;
  activeIcon: LucideIcon;
  shortcut: string;
  label: string;
}

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSelected = (path: string): boolean => location.pathname === path;

  const items: NavigationItem[] = [
    {
      href: "/chat",
      label: "Chat",
      icon: MessageCircleDashed,
      activeIcon: MessageCircle,
      shortcut: "1",
    },
    {
      icon: Book,
      label: "Journal",
      activeIcon: BookOpen,
      href: "/journal",
      shortcut: "2",
    },
    {
      icon: SquareCheck,
      label: "Tasks",
      activeIcon: SquareCheckBig,
      href: "/tasks",
      shortcut: "3",
    },
    {
      icon: ClockFading,
      activeIcon: Clock,
      label: "Intervals",
      href: "/interval",
      shortcut: "4",
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
