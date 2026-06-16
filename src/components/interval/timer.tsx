import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Coffee,
  Maximize,
  Minimize,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  SkipForward,
  Sunset,
  Timer as TimerIcon,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "../ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import {
  useIntervalTimer,
  type SessionVariant,
} from "@/contexts/interval-context";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

interface TimerProps {
  className?: string;
  fullscreen?: boolean;
  setFullscreen?: (fullscreen: boolean) => void;
}

export const Timer: React.FC<TimerProps> = ({
  className,
  fullscreen,
  setFullscreen,
}) => {
  const totalSessions = useIntervalStore((s) => s.sessionCount);
  const session = useIntervalTimer();

  return (
    <div
      className={cn(
        className,
        "group relative flex h-full flex-col",
        "items-center justify-center rounded-tl-md lg:rounded-l-md border bg-card/50 p-2 shadow-sm",
        fullscreen ? "rounded-l-md" : "rounded-tl-md lg:rounded-l-md",
      )}
    >
      <div className="absolute -z-10 h-full w-full bg-secondary/5" />

      <TimerFill
        fullscreen={fullscreen}
        variant={session.variant}
        progress={session.current ?? 0}
      />

      {!session.isRunning && (
        <TimerSettings fullscreen={fullscreen} setFullscreen={setFullscreen} />
      )}

      <div className="mx-auto flex flex-col items-center gap-4">
        <p className="tracking-widest text-muted-foreground">
          {capitalize(session.variant)}
        </p>

        <p
          className={cn(
            "text-5xl lg:text-6xl text-foreground/80",
            "transition-opacity opacity-70 group-hover:opacity-100",
          )}
          style={{ fontFamily: "monospace" }}
        >
          {session.minutes}:
          {session.seconds < 10 ? `0${session.seconds}` : session.seconds}
        </p>

        <SessionDots current={session.current} total={totalSessions} />
      </div>

      <TimerControls session={session} />
    </div>
  );
};

interface SessionDotsProps {
  current: number;
  total: number;
}

const SessionDots: React.FC<SessionDotsProps> = ({ current, total }) => (
  <div className="mx-auto flex w-[9.5rem] flex-wrap justify-center gap-2">
    {[...Array(total).keys()].map((i) => (
      <div
        key={i}
        className={cn(
          "h-4 w-2 rounded-full",
          i < current ? "bg-primary" : "bg-primary/30",
        )}
      />
    ))}
  </div>
);

interface TimerControlsProps {
  session: ReturnType<typeof useIntervalTimer>;
}

const TimerControls: React.FC<TimerControlsProps> = ({ session }) => (
  <div
    className={cn(
      "absolute bottom-[15%] flex items-center",
      "gap-2 rounded-full border bg-background/70 p-2 shadow-sm backdrop-blur",
      "opacity-0 transition-opacity duration-200 group-hover:opacity-80",
    )}
  >
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={session.reset}
    >
      <RotateCcw className="h-4 w-4" />
    </Button>

    <Button
      size="icon"
      className="rounded-full shadow-sm"
      onClick={session.isRunning ? session.pause : session.resume}
    >
      {session.isRunning ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>

    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={session.skip}
    >
      <SkipForward className="h-4 w-4" />
    </Button>
  </div>
);

interface TimerSettingsProps {
  fullscreen?: boolean;
  setFullscreen?: (fullscreen: boolean) => void;
}

const TimerSettings: React.FC<TimerSettingsProps> = ({
  fullscreen,
  setFullscreen,
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const settingsTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-2 right-2 h-8 w-8 rounded-full",
        "opacity-0 transition-all duration-200",
        "group-hover:opacity-60 hover:opacity-100 focus-visible:opacity-100",
      )}
    >
      <Settings2 className="h-4 w-4" />
    </Button>
  );

  const fullscreenButton = (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setFullscreen?.(!fullscreen)}
      className={cn(
        "absolute bottom-2 right-2 h-8 w-8 rounded-full",
        "opacity-0 transition-all duration-200",
        "group-hover:opacity-60 hover:opacity-100 focus-visible:opacity-100",
      )}
    >
      {fullscreen ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {fullscreenButton}
        <DialogTrigger asChild>{settingsTrigger}</DialogTrigger>
        <DialogContent className="gap-0 p-0 sm:max-w-sm sm:rounded-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <DialogTitle className="text-base font-semibold">
              Timer settings
            </DialogTitle>
          </div>
          <div className="px-5 pb-6 pt-2">
            <TimerSettingsContent />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {fullscreenButton}
      <Drawer open={open} onOpenChange={setOpen} direction="bottom">
        <DrawerTrigger asChild>{settingsTrigger}</DrawerTrigger>
        <DrawerContent className="rounded-t-2xl">
          <div className="mx-auto w-full max-w-md">
            <div className="mx-auto mb-4 mt-3 h-1 w-10 rounded-full bg-muted-foreground/20" />
            <div className="px-4 pb-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold">Timer settings</h2>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
              <TimerSettingsContent />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
const TimerSettingsContent = () => {
  const sessionCount = useIntervalStore((s) => s.sessionCount);
  const focusTime = useIntervalStore((s) => s.focusTime);
  const shortBreakTime = useIntervalStore((s) => s.shortBreakTime);
  const longBreakTime = useIntervalStore((s) => s.longBreakTime);

  const setSessionCount = useIntervalStore((s) => s.setSessionCount);
  const setFocusTime = useIntervalStore((s) => s.setFocusTime);
  const setShortBreakTime = useIntervalStore((s) => s.setShortBreakTime);
  const setLongBreakTime = useIntervalStore((s) => s.setLongBreakTime);

  return (
    <div className="space-y-1 pt-2">
      <SettingRow
        icon={<TimerIcon className="h-4 w-4" />}
        label="Focus"
        hint="Per session"
        value={focusTime}
        suffix="min"
        onIncrement={() => setFocusTime(focusTime + 5)}
        onDecrement={() => setFocusTime(Math.max(5, focusTime - 5))}
      />
      <SettingRow
        icon={<Coffee className="h-4 w-4" />}
        label="Short break"
        hint="Between sessions"
        value={shortBreakTime}
        suffix="min"
        onIncrement={() => setShortBreakTime(shortBreakTime + 5)}
        onDecrement={() => setShortBreakTime(Math.max(5, shortBreakTime - 5))}
      />
      <SettingRow
        icon={<Sunset className="h-4 w-4" />}
        label="Long break"
        hint="After full cycle"
        value={longBreakTime}
        suffix="min"
        onIncrement={() => setLongBreakTime(longBreakTime + 5)}
        onDecrement={() => setLongBreakTime(Math.max(5, longBreakTime - 5))}
      />
      <div className="pt-1">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Sessions
        </p>
        <SessionCountPicker value={sessionCount} onChange={setSessionCount} />
      </div>
    </div>
  );
};

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: number;
  suffix: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  hint,
  value,
  suffix,
  onIncrement,
  onDecrement,
}) => (
  <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/40">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium leading-none">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
    <StepInput
      value={value}
      suffix={suffix}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
    />
  </div>
);

interface StepInputProps {
  value: number;
  suffix: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

const StepInput: React.FC<StepInputProps> = ({
  value,
  suffix,
  onIncrement,
  onDecrement,
}) => (
  <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
      onClick={onDecrement}
    >
      <Minus className="h-3 w-3" />
    </Button>
    <span className="min-w-[3.5rem] text-center text-sm font-medium tabular-nums">
      {value}
      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
        {suffix}
      </span>
    </span>
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
      onClick={onIncrement}
    >
      <Plus className="h-3 w-3" />
    </Button>
  </div>
);

interface SessionCountPickerProps {
  value: number;
  onChange: (n: number) => void;
}

const SESSION_OPTIONS = [2, 3, 4, 5, 6];

const SessionCountPicker: React.FC<SessionCountPickerProps> = ({
  value,
  onChange,
}) => (
  <div className="flex gap-2">
    {SESSION_OPTIONS.map((n) => (
      <button
        key={n}
        onClick={() => onChange(n)}
        className={cn(
          "flex h-9 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
          value === n
            ? "border-primary bg-primary text-primary-foreground"
            : "border-transparent bg-muted text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        {n}
      </button>
    ))}
  </div>
);

const VARIANT_BG: Record<SessionVariant, string> = {
  focus: "bg-primary",
  shortBreak: "bg-green-300",
  longBreak: "bg-blue-300",
};

interface TimerFillProps {
  fullscreen?: boolean;
  progress: number;
  variant: SessionVariant;
}

const TimerFill: React.FC<TimerFillProps> = ({
  progress,
  variant,
  fullscreen,
}) => {
  const clamped = 100 - Math.max(0, Math.min(100, progress));

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-[8px]",
        "overflow-hidden rounded-tl lg:rounded-l-md transition-all group-hover:inset-0",
        fullscreen ? "rounded-l-md" : "rounded-tl-md lg:rounded-l-md",
      )}
    >
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 opacity-10 transition-[height] duration-300 ease-linear",
          VARIANT_BG[variant],
        )}
        style={{ height: `${clamped}%` }}
      />
    </div>
  );
};
