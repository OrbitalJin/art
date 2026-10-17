import { WindowControls } from "@/components/layout/window-controls";
import { Navigation } from "@/components/layout/navigation";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import cn from "cnfast";

export const Sidebar = () => (
  <aside
    className={cn(
      "flex h-full w-[50px] flex-col items-center",
      "border-l bg-card/30 pt-3 pb-2 backdrop-blur-sm",
      "border-border/50",
    )}
  >
    <WindowControls />
    <Navigation />
    <SidebarFooter />
  </aside>
);
