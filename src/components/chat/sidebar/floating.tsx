import React from "react";
import { FloatingSidebar as SharedFloatingSidebar } from "@/components/ui/floating-sidebar";
import { SidebarContent } from "./content";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const FloatingSidebar: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  return (
    <SharedFloatingSidebar isOpen={isOpen} onOpenChange={setIsOpen}>
      <SidebarContent
        onClose={() => setIsOpen(false)}
        onSessionSwitch={() => {}}
      />
    </SharedFloatingSidebar>
  );
};
