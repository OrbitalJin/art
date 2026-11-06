import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
/** Height of each nav chevron in px; reserved on top of the bar stack. */
const CHEVRON_SIZE = 28;
const CHEVRON_BAND = CHEVRON_SIZE * 2;
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
  const buttonClassName = cn(
    "group/bar pointer-events-auto flex w-8 cursor-pointer items-center justify-end",
    "rounded-full outline-none opacity-60 hover:opacity-100",
  );

  // Every bar shares one resting width so the stack reads evenly; state is
  // carried by opacity (and the ring on the reading position) instead.
  const stateClassName = isCurrent
    ? "w-4 bg-foreground opacity-80 ring-4 ring-foreground/10"
    : isVisible
      ? "w-4 bg-foreground opacity-70"
      : "w-4 bg-foreground opacity-30";

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

interface RailChevronProps {
  direction: "up" | "down";
  disabled: boolean;
  onJump: () => void;
}

/** Step to the previous/next message. Revealed while the rail is hovered. */
const RailChevron: React.FC<RailChevronProps> = ({
  direction,
  disabled,
  onJump,
}) => {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;

  const className = cn(
    "pointer-events-none flex w-8 shrink-0 cursor-pointer items-center justify-end",
    "rounded-full text-muted-foreground outline-none select-none",
    "scale-95 opacity-0 transition-[opacity,scale,color] duration-200 ease-out",
    "motion-reduce:transition-none",
    "group-hover/rail:pointer-events-auto group-hover/rail:scale-100 group-hover/rail:opacity-100",
    "group-focus-within/rail:pointer-events-auto group-focus-within/rail:scale-100 group-focus-within/rail:opacity-100",
    "focus-visible:pointer-events-auto focus-visible:scale-100 focus-visible:opacity-100",
    "hover:text-foreground disabled:cursor-default disabled:text-muted-foreground/40",
  );

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={direction === "up" ? "Previous message" : "Next message"}
      onClick={onJump}
      className={className}
      style={{ height: `${CHEVRON_SIZE}px` }}
    >
      <Icon className="size-3.5" />
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
 * the chat pane with a small gap. Bars brighten as their message enters the
 * viewport; clicking one scrolls to it. A chevron above and below the stack
 * steps to the previous/next message and is revealed while the rail is
 * hovered or focused. Thickness and spacing scale down for long threads so the
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
      const usable =
        scroller.clientHeight * RAIL_FRACTION - CHEVRON_BAND;
      setScale(
        Math.min(1, Math.max(0, usable) / (count * (BAR_MAX + GAP_MAX))),
      );
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
  const tooltipTop =
    hovered === null ? 0 : CHEVRON_SIZE + hovered * row + row / 2;

  // The anchor is the message at the reading position; fall back to the first
  // visible one so the rail always has a highlight while scrolling.
  const anchorExists = messages.some((m) => m.id === currentAnchorId);
  const activeId = anchorExists
    ? currentAnchorId
    : (visibleMessageIds[0] ?? null);

  const activeIndex = messages.findIndex((m) => m.id === activeId);

  const jumpTo = (index: number) => {
    const target = messages[index];
    if (target) scrollToMessage(target.id, { behavior: "smooth" });
  };

  const railClassName = cn(
    "group/rail pointer-events-none absolute right-3 z-10 hidden -translate-y-1/2",
    "flex-col items-end @[54rem]:flex",
  );

  return (
    <div
      ref={railRef}
      data-slot="message-rail"
      className={railClassName}
      style={{ top: "50%" }}
    >
      <RailChevron
        direction="up"
        disabled={activeIndex <= 0}
        onJump={() => jumpTo(activeIndex - 1)}
      />

      {messages.map((message, index) => (
        <RailBar
          key={message.id}
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

      <RailChevron
        direction="down"
        disabled={activeIndex < 0 || activeIndex >= count - 1}
        onJump={() => jumpTo(activeIndex + 1)}
      />

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
