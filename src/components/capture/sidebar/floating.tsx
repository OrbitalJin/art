import React from "react";
import { FloatingSidebar as SharedFloatingSidebar } from "@/components/ui/floating-sidebar";
import { SidebarContent } from "./content";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNewCapture?: () => void;
}

export const FloatingSidebar: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  onNewCapture,
}) => {
  return (
    <SharedFloatingSidebar isOpen={isOpen} onOpenChange={setIsOpen}>
      <SidebarContent
        onClose={() => setIsOpen(false)}
        onNewCapture={() => {
          setIsOpen(false);
          onNewCapture?.();
        }}
      />
    </SharedFloatingSidebar>
  );
};
