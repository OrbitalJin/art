import { useEffect, useState } from "react";

const VIEWPORT_SELECTOR = '[data-slot="message-scroller-viewport"]';
const CONTENT_SELECTOR = '[data-slot="message-scroller-content"]';

/**
 * The id of the message at the reading position — the topmost message still
 * intersecting the top edge of the chat scroll viewport.
 *
 * The message-scroller's own visibility signal can't answer this: it drops the
 * top slice of the viewport (its peek margin) and only reports a reading anchor
 * for items explicitly marked as scroll anchors. Neither holds here, so short
 * messages parked at the top fall out of the signal and consumers end up
 * pointing at the wrong message. Reading the item geometry is reliable
 * regardless of message height.
 */
export const useActiveMessageId = (): string | null => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const viewport = document.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
    if (!viewport) return;

    const content = viewport.querySelector<HTMLElement>(CONTENT_SELECTOR);

    let frame = 0;
    const measure = () => {
      frame = 0;
      const top = viewport.getBoundingClientRect().top;
      const items = viewport.querySelectorAll<HTMLElement>("[data-message-id]");
      let id: string | null = null;
      for (const item of items) {
        if (item.getBoundingClientRect().bottom > top) {
          id = item.dataset.messageId ?? null;
          break;
        }
      }
      // Scrolled past the end: keep the last message rather than clearing.
      if (id === null && items.length > 0) {
        id = items[items.length - 1].dataset.messageId ?? null;
      }
      setActiveId((prev) => (prev === id ? prev : id));
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };

    measure();
    viewport.addEventListener("scroll", schedule, { passive: true });

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    observer?.observe(viewport);
    if (content) observer?.observe(content);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", schedule);
      observer?.disconnect();
    };
  }, []);

  return activeId;
};
