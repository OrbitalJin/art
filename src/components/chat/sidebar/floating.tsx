import React, { useState } from "react";
import { FloatingSidebar as SharedFloatingSidebar } from "@/components/ui/floating-sidebar";
import { SidebarContent } from "./content";

export const FloatingSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SharedFloatingSidebar isOpen={isOpen} onOpenChange={setIsOpen}>
      <SidebarContent onClose={() => setIsOpen(false)} onSessionSwitch={() => {}} />
    </SharedFloatingSidebar>
  );
};
