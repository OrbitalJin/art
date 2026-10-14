import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import {
  KEY_LABELS,
  useHasKey,
  type KeyType,
} from "@/lib/store/use-settings-store";
import type { Session } from "@/lib/store/session/types";
import type { Category, ToolGroup } from "./groups";
import { TOOL_GROUPS } from "./groups";
import { groupsInCategory } from "./helpers";
import { cn } from "@/lib/utils";
import { KeyNotice } from "../../key-notice";
import { CategoryPage } from "./category-page";
import { FilesPage } from "./files-page";
import { MainPage } from "./main-page";
import { ServiceToolsPage } from "./service-tools-page";

type MenuPage =
  | { name: "main" }
  | { name: "category"; category: Category }
  | { name: "files"; category: Category }
  | { name: "service"; category: Category; group: ToolGroup };

const MAIN_PAGE: MenuPage = { name: "main" };

export const ConfigureMenu: React.FC<{
  disabled: boolean;
  session: Session;
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
  const syncConnections = useConnectionsStore((state) => state.syncConnections);
  const hasComposio = useHasKey("composio");
  const hasYoutube = useHasKey("youtube");
  const contentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<MenuPage>(MAIN_PAGE);

  useEffect(() => {
    if (open) void syncConnections();
  }, [open, syncConnections]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [page]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPage(MAIN_PAGE);
  };

  const triggerClasses = cn(
    "flex shrink-0 cursor-pointer items-center rounded-md px-2 py-0.5 h-7",
    "text-xs whitespace-nowrap text-muted-foreground ring-1 ring-border/60 outline-none",
    "transition-colors duration-150 hover:bg-muted/60 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    "data-[state=open]:bg-muted/60 data-[state=open]:text-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
  );

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
          onOpenGroupTools={(group) =>
            setPage({ name: "service", category, group })
          }
          onToggle={onToggle}
        />
      );
    }

    if (page.name === "service") {
      return (
        <ServiceToolsPage
          group={page.group}
          session={session}
          onBack={() => setPage({ name: "category", category: page.category })}
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
        : page.name === "service"
          ? (page.group.children ?? [page.group])
          : [];

  const missingKeys: KeyType[] = [];
  if (visibleGroups.some((g) => g.requiresKey === "composio") && !hasComposio)
    missingKeys.push("composio");
  if (visibleGroups.some((g) => g.requiresKey === "youtube") && !hasYoutube)
    missingKeys.push("youtube");

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button type="button" className={triggerClasses}>
          Configure
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        ref={contentRef}
        side="top"
        align="end"
        avoidCollisions={false}
        className={contentClasses}
      >
        {renderPage()}

        {missingKeys.map((type) => (
          <KeyNotice
            key={type}
            className="border-t border-border/50 px-3.5 py-2.5"
          >
            Add a {KEY_LABELS[type]} key in Settings.
          </KeyNotice>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
