import type { Message } from "@/lib/llm/common/memory/types";
import { Renderer } from "./renderer";

export const UserMessage: React.FC<Message> = ({ content }) => {
  return (
    <div className="flex w-full flex-row-reverse gap-3 animate-in fade-in duration-100 select-auto overflow-scroll">
      <div className="relative rounded-md border bg-muted/40 px-4 text-sm text-foreground/80 shadow-sm">
        <Renderer content={content} />
      </div>
    </div>
  );
};
