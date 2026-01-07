import { useCallback, useRef } from 'react';

export const useDebounce = (
  callback: (content: string) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((content: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(content), delay);
  }, [callback, delay]);
};