import { useCallback, useRef } from "react";

export const useDebounce = (
  callback: (content: string) => void,
  delay: number,
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (content: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(content), delay);
    },
    [callback, delay],
  );
}
