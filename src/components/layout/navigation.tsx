import { useLocation, useNavigate } from "react-router-dom";
import {
  Book,
  BookOpen,
  Bookmark,
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

interface NavItemProps {
  item: NavigationItem;
  selected: boolean;
}

const NavItem = ({ item, selected }: NavItemProps) => {
  const navigate = useNavigate();
  const Icon = selected ? item.activeIcon : item.icon;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={item.label}
      aria-current={selected ? "page" : undefined}
      onClick={() => navigate(item.href)}
      className={cn(
        "size-10 text-muted-foreground hover:text-foreground",
        selected && "text-primary",
      )}
    >
      <Icon size={20} />
    </Button>
  );
};

export const Navigation = () => {
  const { pathname } = useLocation();

  const activeType = useSessionStore((state) => {
    const active = state.sessions.find((s) => s.id === state.activeId);
    return active?.type ?? "chat";
  });

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const chat: NavigationItem = {
    href: `/session/${activeType}`,
    label: "Chat",
    icon: MessageCircleDashed,
    activeIcon: MessageCircle,
    shortcut: "1",
  };

  const journal: NavigationItem = {
    href: "/journal",
    label: "Journal",
    icon: Book,
    activeIcon: BookOpen,
    shortcut: "2",
  };

  const tasks: NavigationItem = {
    href: "/tasks",
    label: "Tasks",
    icon: SquareCheck,
    activeIcon: SquareCheckBig,
    shortcut: "3",
  };

  const intervals: NavigationItem = {
    href: "/interval",
    label: "Intervals",
    icon: ClockFading,
    activeIcon: Clock,
    shortcut: "4",
  };

  const capture: NavigationItem = {
    href: "/capture",
    label: "Capture",
    icon: Bookmark,
    activeIcon: Bookmark,
    shortcut: "5",
  };

  const items = [chat, journal, tasks, intervals, capture];

  return (
    <nav className="flex w-full flex-1 flex-col items-center gap-2 px-2">
      <NavItem item={chat} selected={pathname.startsWith("/session")} />
      <NavItem item={journal} selected={isActive(journal.href)} />
      <NavItem item={tasks} selected={isActive(tasks.href)} />
      <NavItem item={intervals} selected={isActive(intervals.href)} />
      <NavItem item={capture} selected={isActive(capture.href)} />

      <Command items={items} />
    </nav>
  );
};
