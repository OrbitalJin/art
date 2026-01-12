import { WindowControls } from "@/components/layout/window-controls";
import { Navigation } from "@/components/layout/navigation";
import { SidebarFooter } from "@/components/layout/sidebar-footer";

export const Sidebar = () => (
  <div className="flex flex-col h-full gap-2">
    <aside className="flex flex-col items-center w-[60px] h-full border rounded-lg bg-card/50 backdrop-blur-sm py-3 transition-all duration-300">
      <WindowControls />
      <Navigation />
      <SidebarFooter />
    </aside>
  </div>
);
