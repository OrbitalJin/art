import type React from "react";
import { cn } from "@/lib/utils";

interface Props {
  collapsed: boolean;
  children: React.ReactNode;
}

export const CollapsibleRow = ({ collapsed, children }: Props) => {
  const collapseStyle = collapsed
    ? "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100"
    : "grid-rows-[1fr] opacity-100";

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        collapseStyle,
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
};
