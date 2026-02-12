import { useMemo, useState } from "react";
import { useCopy } from "@/hooks/use-copy";

interface UseCodeBlockOptions {
  code: string;
  defaultExpanded?: boolean;
}

export const useCodeBlock = ({
  code,
  defaultExpanded = false,
}: UseCodeBlockOptions) => {
  const lineCount = useMemo(() => code.split("\n").length, [code]);

  const shouldCollapse = lineCount > 10;

  const previewCode = useMemo(
    () => code.split("\n").slice(0, 10).join("\n"),
    [code],
  );

  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || !shouldCollapse,
  );

  const [wraps, setWraps] = useState(true);
  const copyState = useCopy(code);

  return {
    lineCount,
    shouldCollapse,
    previewCode,
    isExpanded,
    setIsExpanded,
    wraps,
    setWraps,
    copyState,
  };
};
