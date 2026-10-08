import { WindowControls } from "@/components/layout/window-controls";
import { Navigation } from "@/components/layout/navigation";
import { SidebarFooter } from "@/components/layout/sidebar-footer";

export const Sidebar = () => (
  <aside className="flex h-full w-[60px] flex-col items-center border-l bg-card/50 pt-3 pb-2 backdrop-blur-sm">
    <WindowControls />
    <Navigation />
    <SidebarFooter />
  </aside>
);
