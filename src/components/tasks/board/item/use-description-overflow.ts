import { useLayoutEffect, useRef, useState } from "react";

export const useDescriptionOverflow = (description: string) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [canExpand, setCanExpand] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || expanded) return;

    const checkOverflow = () => {
      setCanExpand(element.scrollHeight > element.clientHeight + 1);
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [description, expanded]);

  return {
    ref,
    canExpand,
    expanded,
    toggle: () => setExpanded((value) => !value),
  };
};
