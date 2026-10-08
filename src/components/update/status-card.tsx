import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "error" | "info";

interface Props {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  badge?: string;
  tone?: Tone;
  busy?: boolean;
  docked?: boolean;
  children?: React.ReactNode;
}

const TONE_DOT: Record<Tone, string> = {
  default: "bg-muted-foreground/40",
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

const TONE_SURFACE: Record<Tone, string> = {
  default: "border-border/50 bg-muted/10",
  success: "border-border/50 bg-muted/10",
  error: "border-destructive/20 bg-destructive/5",
  info: "border-border/50 bg-muted/10",
};

const Lead: React.FC<{
  icon?: React.ReactNode;
  tone: Tone;
  busy: boolean;
  className?: string;
}> = ({ icon, tone, busy, className }) => {
  if (icon) {
    return (
      <span className={cn("shrink-0", TONE_ICON[tone], className)}>{icon}</span>
    );
  }

  const dotClasses = cn(
    "size-1.5 shrink-0 rounded-full",
    TONE_DOT[tone],
    busy && "animate-pulse motion-reduce:animate-none",
    className,
  );

  return <span aria-hidden className={dotClasses} />;
};

export const StatusCard: React.FC<Props> = ({
  icon,
  title,
  description,
  badge,
  tone = "default",
  busy = false,
  docked = false,
  children,
}) => {
  if (docked) {
    return (
      <div className="flex items-center gap-2.5 border-b border-border/50 bg-muted/10 px-3 py-2">
        <Lead icon={icon} tone={tone} busy={busy} />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {title ? (
            <p className="shrink-0 text-xs font-medium text-foreground/90">
              {title}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    );
  }

  const cardClasses = cn(
    "flex items-start gap-3 rounded-lg border px-4 py-3",
    TONE_SURFACE[tone],
  );

  return (
    <div className={cardClasses}>
      <Lead
        icon={icon}
        tone={tone}
        busy={busy}
        className={icon ? "mt-0.5" : "mt-[7px]"}
      />

      <div className="min-w-0 flex-1">
        {title || badge ? (
          <div className="flex flex-wrap items-center gap-2">
            {title ? (
              <p className="text-[13px] font-medium text-foreground/90">
                {title}
              </p>
            ) : null}
            {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          </div>
        ) : null}

        {children ??
          (description ? (
            <p className="mt-0.5 text-xs leading-snug break-words text-muted-foreground">
              {description}
            </p>
          ) : null)}
      </div>
    </div>
  );
};
