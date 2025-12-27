import React from "react";
import { cn } from "@/lib/utils";
import { SidebarContent } from "./content";

export const StaticSidebar: React.FC = () => {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-[300px]",
        "rounded-md border backdrop-blur bg-card/50 hover:border-primary/30 transition-colors",
        "m-2 shadow-sm shrink-0",
      )}
    >
      <SidebarContent />
    </aside>
  );
};
