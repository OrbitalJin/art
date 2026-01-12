import React, { useState } from "react";
import { StaticSidebar as SharedStaticSidebar } from "@/components/ui/static-sidebar";
import { SidebarContent } from "./content";

export const StaticSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SharedStaticSidebar
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className="m-2"
      width={300}
    >
      <SidebarContent onClose={() => setIsOpen(false)} />
    </SharedStaticSidebar>
  );
};
