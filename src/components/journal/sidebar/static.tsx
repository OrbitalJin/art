import { StaticSidebar as SharedStaticSidebar } from "@/components/ui/static-sidebar";
import { SidebarContent } from "@/components/journal/sidebar/content";
import type React from "react";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// notes
export const StaticSidebar: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  return (
    <SharedStaticSidebar isOpen={isOpen} onOpenChange={setIsOpen}>
      <SidebarContent onClose={(open) => setIsOpen(open)} />
    </SharedStaticSidebar>
  );
};
