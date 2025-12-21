import { cn } from "@/lib/utils";
import React from "react";

interface Props extends React.HTMLProps<HTMLSpanElement> {
  className?: string;
  children: React.ReactNode;
}

export const ShimmerText: React.FC<Props> = ({
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground",
        "bg-[length:200%_100%] bg-clip-text text-transparent",
        "animate-[shimmer_1s_linear_infinite]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
