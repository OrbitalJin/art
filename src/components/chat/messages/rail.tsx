import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller";
import { messageText, type Message } from "@/lib/store/session/types";

interface Props {
  messages: readonly Message[];
}

/** Target bar thickness and spacing in px; both scale down for long threads. */
const BAR_MAX = 3;
const BAR_MIN = 1;
const GAP_MAX = 10;
/** Share of the scroll area the stack is allowed to occupy. */
const RAIL_FRACTION = 0.6;

const previewOf = (message: Message): string => {
  const text = messageText(message).replace(/\s+/g, " ").trim();
  if (text) return text;
  if (message.attachments?.length) return "Attachment";
  if (message.toolCalls?.length) return "Tool call";
  return "Empty message";
};

interface RailBarProps {
  role: Message["role"];
  position: number;
  total: number;
  thickness: number;
  rowHeight: number;
  isCurrent: boolean;
  isVisible: boolean;
  onJump: () => void;
  onHover: () => void;
  onLeave: () => void;
}

const RailBar: React.FC<RailBarProps> = ({
  role,
  position,
  total,
  thickness,
  rowHeight,
  isCurrent,
  isVisible,
  onJump,
  onHover,
  onLeave,
}) => {
  const isUser = role === "user";

  const buttonClassName = cn(
    "group/bar pointer-events-auto flex w-8 cursor-pointer items-center justify-end",
    "rounded-full outline-none",
  );

  const stateClassName = isCurrent
    ? "w-7 bg-foreground opacity-80 ring-4 ring-foreground/10"
    : isVisible
      ? cn("bg-foreground opacity-70", isUser ? "w-5" : "w-3.5")
      : cn("bg-foreground opacity-30", isUser ? "w-4" : "w-2.5");

  const barClassName = cn(
    "rounded-full transition-[width,opacity,box-shadow] duration-300 ease-out",
    "motion-reduce:transition-none",
    stateClassName,
    "group-hover/bar:w-7 group-hover/bar:opacity-100",
    "group-focus-visible/bar:w-7 group-focus-visible/bar:opacity-100",
  );

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`Jump to message ${position} of ${total}`}
      aria-current={isCurrent ? "true" : undefined}
      onClick={onJump}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={buttonClassName}
      style={{ height: `${rowHeight}px` }}
    >
      <span className={barClassName} style={{ height: `${thickness}px` }} />
    </button>
  );
};

interface RailTooltipProps {
  message: Message;
  position: number;
  total: number;
  top: number;
}

const RailTooltip: React.FC<RailTooltipProps> = ({
  message,
  position,
  total,
  top,
}) => {
  const roleLabel = message.role === "user" ? "You" : "Assistant";

  const tooltipClassName = cn(
    "pointer-events-none absolute right-full mr-3 w-56 max-w-[40vw] -translate-y-1/2",
    "rounded-lg border border-border bg-popover/95 px-3 py-2",
    "shadow-lg shadow-black/10 backdrop-blur-md",
    "animate-in fade-in slide-in-from-right-1 duration-150",
  );

  const headerClassName = cn(
    "flex items-center justify-between text-[10px] font-medium tracking-wide",
    "text-muted-foreground",
  );

  const bodyClassName = cn(
    "mt-1 line-clamp-3 text-[11.5px] leading-snug text-foreground",
  );

  return (
    <div
      role="tooltip"
      className={tooltipClassName}
      style={{ top: `${top}px` }}
    >
      <p className={headerClassName}>
        <span>{roleLabel}</span>
        <span className="tabular-nums">
          {position} / {total}
        </span>
      </p>
      <p className={bodyClassName}>{previewOf(message)}</p>
    </div>
  );
};

/**
 * A quiet vertical stack of bars, one per message, pinned to the right edge of
 * the chat pane with a small gap. Bars grow and brighten as their message
 * enters the viewport; clicking one scrolls to it. User bars are longer than
 * assistant bars. Thickness and spacing scale down for long threads so the
 * stack always stays inside its slot.
 */
export const MessageRail: React.FC<Props> = ({ messages }) => {
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId, visibleMessageIds } = useMessageScrollerVisibility();
  const railRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [hovered, setHovered] = useState<number | null>(null);

  const visible = useMemo(
    () => new Set(visibleMessageIds),
    [visibleMessageIds],
  );
  const count = messages.length;

  useEffect(() => {
    const scroller = railRef.current?.parentElement;
    if (!scroller || count === 0) return;

    const measure = () => {
      const usable = scroller.clientHeight * RAIL_FRACTION;
      setScale(Math.min(1, usable / (count * (BAR_MAX + GAP_MAX))));
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [count]);

  if (count < 2) return null;

  const gap = GAP_MAX * scale;
  const bar = Math.max(BAR_MIN, BAR_MAX * scale);
  const row = bar + gap;
  const hoveredMessage = hovered === null ? null : messages[hovered];
  const tooltipTop = hovered === null ? 0 : hovered * row + row / 2;

  // The anchor is the message at the reading position; fall back to the first
  // visible one so the rail always has a highlight while scrolling.
  const anchorExists = messages.some((m) => m.id === currentAnchorId);
  const activeId = anchorExists
    ? currentAnchorId
    : (visibleMessageIds[0] ?? null);

  const railClassName = cn(
    "pointer-events-none absolute right-3 z-10 hidden -translate-y-1/2",
    "flex-col items-end @[54rem]:flex",
  );

  return (
    <div
      ref={railRef}
      data-slot="message-rail"
      className={railClassName}
      style={{ top: "calc(50% - var(--prompt-height, 0px) / 2)" }}
    >
      {messages.map((message, index) => (
        <RailBar
          key={message.id}
          role={message.role}
          position={index + 1}
          total={count}
          thickness={bar}
          rowHeight={row}
          isCurrent={message.id === activeId}
          isVisible={visible.has(message.id)}
          onJump={() => scrollToMessage(message.id, { behavior: "smooth" })}
          onHover={() => setHovered(index)}
          onLeave={() =>
            setHovered((value) => (value === index ? null : value))
          }
        />
      ))}

      {hoveredMessage && hovered !== null && (
        <RailTooltip
          message={hoveredMessage}
          position={hovered + 1}
          total={count}
          top={tooltipTop}
        />
      )}
    </div>
  );
};
