export type LLMActions = "summarize" | "rephrase" | "bullet" | "organize";

export type Actions = {
  dialogs: {
    llm: {
      open: boolean;
      setOpen: (open: boolean) => void;
      action: LLMActions | null;
      setAction: (action: LLMActions | null) => void;
    };
    link: {
      setOpen: (open: boolean) => void;
    };
  };
  handlers: {
    handleImageClick: () => void;
  };
  isBusy: boolean;
};

export interface EditorState {
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isHighlight: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  isTable: boolean;
  isCodeBlock: boolean;
  isLink: boolean;
  hasSelection: boolean;
}