import { useState } from "react";
import { FloatingSidebar as SharedFloatingSidebar } from "@/components/ui/floating-sidebar";
import { SidebarContent } from "@/components/notes/sidebar/content";

export const FloatingSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SharedFloatingSidebar isOpen={isOpen} onOpenChange={setIsOpen}>
      <SidebarContent onClose={(open) => setIsOpen(open)} />
    </SharedFloatingSidebar>
  );
};
