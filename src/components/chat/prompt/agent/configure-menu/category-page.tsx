import { ChevronLeft } from "lucide-react";
import type { Session } from "@/lib/store/session/types";
import { CATEGORY_LABELS, type Category } from "./groups";
import { GroupRow } from "./rows";
import { groupsInCategory } from "./helpers";

export const SubPageHeader: React.FC<{ title: string; onBack: () => void }> = ({
  title,
  onBack,
}) => (
  <div className="flex items-center gap-1 border-b border-border/50 py-2 pr-3.5 pl-2">
    <button
      type="button"
      onClick={onBack}
      aria-label="Back"
      className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
    >
      <ChevronLeft size={16} aria-hidden />
    </button>
    <p className="text-[13px] font-medium text-foreground">{title}</p>
  </div>
);

export const CategoryPage: React.FC<{
  category: Category;
  session: Session;
  onBack: () => void;
  onOpenFiles: () => void;
  onToggle: (key: string, value: boolean) => void;
}> = ({ category, session, onBack, onOpenFiles, onToggle }) => {
  const groups = groupsInCategory(category);

  return (
    <>
      <SubPageHeader title={CATEGORY_LABELS[category]} onBack={onBack} />

      <div className="flex flex-col gap-0.5 p-1.5">
        {groups.map((group) => (
          <GroupRow
            key={group.key}
            group={group}
            session={session}
            onOpenFiles={onOpenFiles}
            onToggle={onToggle}
          />
        ))}
      </div>
    </>
  );
};
