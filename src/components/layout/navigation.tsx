import { useLocation } from "react-router-dom";
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
import { useSessionIndex } from "@/lib/store/session/index-store";

export interface NavigationItem {
  href: string;
  base: string;
  icon: LucideIcon;
  activeIcon: LucideIcon;
  shortcut: string;
  label: string;
}

export const useNavigation = () => {
  const { pathname } = useLocation();

  const activeType = useSessionIndex((state) => {
    const active = state.sessions.find((s) => s.id === state.activeId);
    return active?.type ?? "chat";
  });

  const items: NavigationItem[] = [
    {
      href: `/session/${activeType}`,
      base: "/session",
      label: "Chat",
      icon: MessageCircleDashed,
      activeIcon: MessageCircle,
      shortcut: "1",
    },
    {
      href: "/journal",
      base: "/journal",
      label: "Journal",
      icon: Book,
      activeIcon: BookOpen,
      shortcut: "2",
    },
    {
      href: "/tasks",
      base: "/tasks",
      label: "Tasks",
      icon: SquareCheck,
      activeIcon: SquareCheckBig,
      shortcut: "3",
    },
    {
      href: "/interval",
      base: "/interval",
      label: "Intervals",
      icon: ClockFading,
      activeIcon: Clock,
      shortcut: "4",
    },
  ];

  const isSelected = (item: NavigationItem) =>
    pathname === item.base || pathname.startsWith(`${item.base}/`);

  return { items, isSelected };
};
