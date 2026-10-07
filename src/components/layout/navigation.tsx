import { useLocation, useNavigate } from "react-router-dom";
import {
  Book,
  Bookmark,
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
import { useSessionStore } from "@/lib/store/use-session-store";
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
  const activeType = useSessionStore((state) => {
    const active = state.sessions.find((s) => s.id === state.activeId);
    return active?.type ?? "chat";
  });

  const isSelected = (path: string): boolean =>
    path === "/session/chat"
      ? location.pathname.startsWith("/session")
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const items: NavigationItem[] = [
    {
      href: `/session/${activeType}`,
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
    {
      icon: Bookmark,
      activeIcon: Bookmark,
      label: "Capture",
      href: "/capture",
      shortcut: "5",
    },
  ];

  return (
    <nav className="flex flex-col gap-2 flex-1 w-full px-2 items-center">
      {items.map((item) => (
        <Button
          key={item.href}
          className={cn(
            "text-muted-foreground hover:text-foreground h-10 w-10",
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
