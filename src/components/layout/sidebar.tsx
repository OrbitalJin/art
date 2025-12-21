import { Home, MessageSquare } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends React.HTMLProps<HTMLElement> {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: Home,
  },
  {
    path: "/chat",
    label: "Chat AI",
    icon: MessageSquare,
  },
];

export const Sidebar: React.FC<Props> = ({ collapsed, className }) => {
  const location = useLocation();

  return (
    <div className={cn("flex flex-col gap-2 p-2 border rounded-xl", className)}>
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link key={item.path} to={item.path}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                collapsed ? "h-10 w-10 px-0 mx-auto" : "h-10 px-3",
              )}
            >
              <Icon className="h-5 w-5" />
              {collapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          </Link>
        );
      })}
    </div>
  );
};
