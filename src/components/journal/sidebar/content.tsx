import { useState } from "react";
import { SidebarHeader } from "@/components/journal/sidebar/header";
import { PageList } from "@/components/journal/sidebar/page/list";
import { SidebarFooter } from "@/components/journal/sidebar/footer";

interface Props {
  onClose: (open: boolean) => void;
}

export const SidebarContent: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl">
      <SidebarHeader
        onClose={onClose}
        query={query}
        setQuery={setQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      <PageList query={query} selectedTags={selectedTags} />
      <SidebarFooter />
    </div>
  );
};
