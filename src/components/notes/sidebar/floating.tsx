import { FloatingSidebar as SharedFloatingSidebar } from "@/components/ui/floating-sidebar";
import { SidebarContent } from "@/components/notes/sidebar/content";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const FloatingSidebar: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  return (
    <SharedFloatingSidebar isOpen={isOpen} onOpenChange={setIsOpen}>
      <SidebarContent onClose={(open) => setIsOpen(open)} />
    </SharedFloatingSidebar>
  );
};
