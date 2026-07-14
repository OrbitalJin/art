import React from "react";
import { StaticSidebar as SharedStaticSidebar } from "@/components/ui/static-sidebar";
import { SidebarContent } from "./content";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNewCapture?: () => void;
}

export const StaticSidebar: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  onNewCapture,
}) => {
  return (
    <SharedStaticSidebar
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className="m-2"
    >
      <SidebarContent
        onClose={() => setIsOpen(false)}
        onNewCapture={onNewCapture}
      />
    </SharedStaticSidebar>
  );
};
