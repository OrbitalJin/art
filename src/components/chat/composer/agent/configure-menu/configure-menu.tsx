import { useEffect, useRef, useState } from "react";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHasKey, useKeysLoading } from "@/lib/store/use-settings-store";
import type { SessionMeta } from "@/lib/store/session/types";
import type { Category } from "./groups";
import { TOOL_GROUPS } from "./groups";
import { groupsInCategory } from "./helpers";
import { cn } from "@/lib/utils";
import { ART_KEY_NOTICE, KeyNotice } from "../../key-notice";
import { CategoryPage } from "./category-page";
import { FilesPage } from "./files-page";
import { MainPage } from "./main-page";
import { Button } from "@/components/ui/button";
import { composerControlClasses } from "../../toolbar";

type MenuPage =
  | { name: "main" }
  | { name: "category"; category: Category }
  | { name: "files"; category: Category };

const MAIN_PAGE: MenuPage = { name: "main" };

export const ConfigureMenu: React.FC<{
  disabled: boolean;
  session: SessionMeta;
  onAddFolder: () => void;
  onRemoveFolder: (folderId: string) => void;
  onToggle: (key: string, value: boolean) => void;
  onRevokeAll: () => void;
}> = ({
  disabled,
  session,
  onAddFolder,
  onRemoveFolder,
  onToggle,
  onRevokeAll,
}) => {
  const hasExa = useHasKey("exa");
  const keysLoading = useKeysLoading();
  const contentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<MenuPage>(MAIN_PAGE);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [page]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPage(MAIN_PAGE);
  };

  const contentClasses = cn(
    "w-80 max-w-[calc(100vw-2rem)] rounded-xl p-0 shadow-lg",
    "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto",
    "border-border/60",
  );

  const renderPage = () => {
    if (page.name === "category") {
      const category = page.category;
      return (
        <CategoryPage
          category={category}
          session={session}
          onBack={() => setPage(MAIN_PAGE)}
          onOpenFiles={() => setPage({ name: "files", category })}
          onToggle={onToggle}
        />
      );
    }

    if (page.name === "files") {
      const category = page.category;
      return (
        <FilesPage
          folders={session.folders ?? []}
          onBack={() => setPage({ name: "category", category })}
          onAdd={onAddFolder}
          onRemove={onRemoveFolder}
        />
      );
    }

    return (
      <MainPage
        session={session}
        onOpenCategory={(category) => setPage({ name: "category", category })}
        onRevokeAll={onRevokeAll}
      />
    );
  };

  const visibleGroups =
    page.name === "main"
      ? TOOL_GROUPS
      : page.name === "category"
        ? groupsInCategory(page.category)
        : [];

  const showExaKeyNotice =
    !keysLoading &&
    !hasExa &&
    visibleGroups.some((g) => g.requiresKey === "exa");

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button size="icon" variant="ghost" className={composerControlClasses}>
          <Settings2 className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        ref={contentRef}
        side="top"
        align="end"
        avoidCollisions={false}
        className={contentClasses}
      >
        {renderPage()}

        {showExaKeyNotice && (
          <KeyNotice className="border-t border-border/50 px-3.5 py-2.5">
            {ART_KEY_NOTICE}.
          </KeyNotice>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
