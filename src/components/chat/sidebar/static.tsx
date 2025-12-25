import React from "react";
import { cn } from "@/lib/utils";
import { SidebarContent } from "./content";

export const StaticSidebar: React.FC = () => {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-[260px]",
        "rounded-xl border bg-card/70 backdrop-blur",
        "m-2 shadow-sm shrink-0",
      )}
    >
      <SidebarContent />
    </aside>
  );
};
