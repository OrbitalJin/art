import type { Message } from "@/lib/store/session/types";
import { Renderer } from "./renderer";

export const UserMessage: React.FC<Message> = ({ content }) => {
  return (
    <div className="flex w-full flex-row-reverse animate-in fade-in duration-100 select-auto overflow-scroll">
      <div className="relative rounded-md rounded-tr-none border bg-muted/40 px-3 text-sm text-foreground/80 shadow-sm">
        <Renderer content={content} />
      </div>
    </div>
  );
};
