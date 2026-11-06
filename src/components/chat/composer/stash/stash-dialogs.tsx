import type { RefObject } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStashUiStore } from "@/lib/store/use-stash-ui-store";
import type { ComposerHandle } from "../editor";
import { StashFormDialog } from "./stash-form-dialog";
import { TemplateDialog } from "./template-dialog";

interface Props {
  composerRef: RefObject<ComposerHandle | null>;
}

const DeletePromptDialog: React.FC<{
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ open, title, onCancel, onConfirm }) => (
  <AlertDialog
    open={open}
    onOpenChange={(next) => {
      if (!next) onCancel();
    }}
  >
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>Delete saved prompt?</AlertDialogTitle>
        <AlertDialogDescription>
          <span className="font-medium text-foreground">“{title}”</span> will be
          removed from your stash. This can’t be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

/**
 * Single host for the stash dialogs, driven by `useStashUiStore` so the inline
 * "@" picker and the toolbar save button can open them without prop drilling.
 */
export const StashDialogs: React.FC<Props> = ({ composerRef }) => {
  const form = useStashUiStore((state) => state.form);
  const template = useStashUiStore((state) => state.template);
  const pendingDelete = useStashUiStore((state) => state.pendingDelete);
  const closeForm = useStashUiStore((state) => state.closeForm);
  const closeTemplate = useStashUiStore((state) => state.closeTemplate);
  const cancelDelete = useStashUiStore((state) => state.cancelDelete);
  const confirmDelete = useStashUiStore((state) => state.confirmDelete);

  const deleteTitle = pendingDelete?.title || "Untitled";

  const handleFormOpenChange = (open: boolean) => {
    if (!open) closeForm();
  };

  const handleTemplateOpenChange = (open: boolean) => {
    if (!open) closeTemplate();
  };

  const handleInsert = (text: string) => {
    composerRef.current?.insertText(text);
  };

  const handleConfirmDelete = () => {
    confirmDelete();
    toast.success("Prompt deleted");
  };

  return (
    <>
      <StashFormDialog
        key={form.key}
        open={form.open}
        entry={form.entry}
        initialContent={form.initialContent}
        initialTitle={form.initialTitle}
        onOpenChange={handleFormOpenChange}
      />

      <TemplateDialog
        entry={template.entry}
        open={template.open}
        onOpenChange={handleTemplateOpenChange}
        onInsert={handleInsert}
      />

      <DeletePromptDialog
        open={pendingDelete !== null}
        title={deleteTitle}
        onCancel={cancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
