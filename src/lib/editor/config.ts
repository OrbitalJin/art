import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { CharacterCount } from "@tiptap/extension-character-count";
import { ListKit } from "@tiptap/extension-list";
import { Highlight } from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";
import { TagHighlighter } from "@/lib/extensions/tag-highlighter";

export const editorExtensions = [
  StarterKit,
  TableKit,
  ListKit,
  Highlight,
  HorizontalRule,
  TagHighlighter,
  Image.configure({
    inline: true,
    allowBase64: true,
    resize: {
      enabled: true,
      directions: ["bottom-right"],
      minWidth: 100,
      minHeight: 100,
      alwaysPreserveAspectRatio: true,
    },
  }),
  Markdown.configure({
    html: true,
    transformPastedText: true,
    transformCopiedText: true,
  }),
  CharacterCount.configure({ limit: 50000 }),
];

export const editorProps = {
  attributes: {
    class: "tiptap focus:outline-none",
    spellcheck: "false",
  },
  handleClick: (_: unknown, __: unknown, event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest("a");

    if (link && link.href) {
      event.preventDefault();
      openUrl(link.href);
      toast.info("Opening link...");
      return true;
    }

    return false;
  },
};