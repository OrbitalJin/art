import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "error" | "info";

interface Props {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  badge?: string;
  tone?: Tone;
  /**
   * Docked mode squares the bottom edge and drops the outer border so the card
   * can merge with the surface directly below it (e.g. the prompt input).
   */
  docked?: boolean;
  children?: React.ReactNode;
}

const TONE_RAIL: Record<Tone, string> = {
  default: "bg-border",
  success: "bg-emerald-500",
  error: "bg-destructive",
  info: "bg-amber-500",
};

const TONE_ICON: Record<Tone, string> = {
  default: "text-muted-foreground",
  success: "text-emerald-500",
  error: "text-destructive",
  info: "text-amber-500",
};

export const StatusCard: React.FC<Props> = ({
  icon,
  title,
  description,
  badge,
  tone = "default",
  docked = false,
  children,
}) => {
  const rail = (
    <span
      aria-hidden
      className={cn("absolute inset-y-0 left-0 w-0.5", TONE_RAIL[tone])}
    />
  );

  if (docked) {
    return (
      <div className="relative flex items-center gap-3 overflow-hidden border-b border-border/60 bg-muted/10 py-2 pr-3 pl-3">
        {rail}

        {icon ? (
          <span className={cn("shrink-0", TONE_ICON[tone])}>{icon}</span>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {title ? (
            <p className="shrink-0 text-xs font-semibold tracking-tight">
              {title}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-border/60 bg-card/50 py-3 pr-4 pl-4">
      {rail}

      <div className="flex items-start gap-3">
        {icon ? (
          <div className={cn("mt-0.5 shrink-0", TONE_ICON[tone])}>{icon}</div>
        ) : null}

        <div className="min-w-0 flex-1">
          {title || badge ? (
            <div className="flex flex-wrap items-center gap-2">
              {title ? <p className="text-sm font-medium">{title}</p> : null}
              {badge ? <Badge variant="secondary">{badge}</Badge> : null}
            </div>
          ) : null}

          {children ??
            (description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null)}
        </div>
      </div>
    </div>
  );
};
