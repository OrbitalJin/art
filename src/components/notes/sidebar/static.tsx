import { useState } from "react";
import { StaticSidebar as SharedStaticSidebar } from "@/components/ui/static-sidebar";
import { SidebarContent } from "@/components/notes/sidebar/content";

export const StaticSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SharedStaticSidebar
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className="m-2"
      width={380}
    >
      <SidebarContent onClose={(open) => setIsOpen(open)} />
    </SharedStaticSidebar>
  );
};
