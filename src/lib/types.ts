export type AIActions = "summarize" | "rephrase" | "bullet" | "organize";

export type Actions = {
  dialogs: {
    ai: {
      setAction: (action: AIActions) => void;
      setOpen: (open: boolean) => void;
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