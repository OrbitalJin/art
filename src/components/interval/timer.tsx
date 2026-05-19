import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, Settings2, SkipForward } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import {
  useIntervalTimer,
  type SessionVariant,
} from "@/contexts/interval-context";

interface Props {
  className?: string;
}

export const Timer: React.FC<Props> = ({ className }) => {
  const totalSessions = useIntervalStore((state) => state.sessionCount);
  const session = useIntervalTimer();

  return (
    <div
      className={cn(
        className,
        "group relative flex h-full flex-col",
        "items-center justify-center rounded-md border bg-card/50 p-2 shadow-sm",
      )}
    >
      <div className="absolute -z-10 h-full w-full bg-secondary/5" />
      <TimerFill variant={session.variant} progress={0} />

      {!session.isRunning && <ResponsiveTimerSettings />}
      <div className="mx-auto flex flex-col items-center gap-4">
        <p className="tracking-widest text-muted-foreground">
          {session.variant.charAt(0).toUpperCase() + session.variant.slice(1)}
        </p>
        <p
          className="text-5xl lg:text-6xl text-foreground/80"
          style={{ fontFamily: "monospace" }}
        >
          {session.minutes}:
          {session.seconds < 10 ? `0${session.seconds}` : session.seconds}
        </p>
        <div className="mx-auto flex w-[9.5rem] flex-wrap justify-center gap-2">
          {[...Array(totalSessions).keys()].map((i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-2 rounded-full",
                i < session.current ? "bg-primary" : "bg-primary/30",
              )}
            />
          ))}
        </div>
      </div>

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
    </div>
  );
};

const ResponsiveTimerSettings = () => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const trigger = (
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

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <TimerSettingsContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="rounded-t-xl">
        <div className="mx-auto w-full max-w-md px-4 pb-6 pt-4">
          <TimerSettingsContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const TimerSettingsContent = () => {
  const sessionCount = useIntervalStore((state) => state.sessionCount);
  const focusTime = useIntervalStore((state) => state.focusTime);
  const shortBreakTime = useIntervalStore((state) => state.shortBreakTime);
  const longBreakTime = useIntervalStore((state) => state.longBreakTime);

  const setSessionCount = useIntervalStore((state) => state.setSessionCount);
  const setFocusTime = useIntervalStore((state) => state.setFocusTime);
  const setShortBreakTime = useIntervalStore(
    (state) => state.setShortBreakTime,
  );
  const setLongBreakTime = useIntervalStore((state) => state.setLongBreakTime);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SettingRow
          label="Sessions"
          hint="Number of focus sessions"
          control={
            <StepInput
              value={sessionCount}
              increment={() => setSessionCount(sessionCount + 1)}
              decrement={() => setSessionCount(sessionCount - 1)}
            />
          }
        />

        <SettingRow
          label="Focus"
          hint="Minutes per focus session"
          control={
            <StepInput
              value={focusTime}
              suffix="min"
              increment={() => setFocusTime(focusTime + 5)}
              decrement={() => setFocusTime(focusTime - 5)}
            />
          }
        />

        <SettingRow
          label="Short break"
          hint="Minutes between focus sessions"
          control={
            <StepInput
              value={shortBreakTime}
              suffix="min"
              increment={() => setShortBreakTime(shortBreakTime + 5)}
              decrement={() => setShortBreakTime(shortBreakTime - 5)}
            />
          }
        />

        <SettingRow
          label="Long break"
          hint="Minutes after a full cycle"
          control={
            <StepInput
              value={longBreakTime}
              suffix="min"
              increment={() => setLongBreakTime(longBreakTime + 5)}
              decrement={() => setLongBreakTime(longBreakTime - 5)}
            />
          }
        />
      </div>
    </div>
  );
};

type SettingRowProps = {
  label: string;
  hint?: string;
  control: React.ReactNode;
};

const SettingRow = ({ label, hint, control }: SettingRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-background/50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-base font-medium">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
};

type StepInputProps = {
  value: number;
  suffix?: string;

  increment: () => void;
  decrement: () => void;
};

const StepInput = ({ value, suffix, increment, decrement }: StepInputProps) => {
  return (
    <div className="flex items-center rounded-full bg-card/50 shadow-md">
      <Button
        variant="ghost"
        className="rounded-full text-muted-foreground"
        onClick={decrement}
      >
        -
      </Button>

      <div className="min-w-[72px] px-2 text-center text-sm font-medium">
        {value}
        {suffix ? (
          <span className="ml-1 text-xs text-muted-foreground">
            {`${suffix}${value > 1 ? "s" : ""}`}
          </span>
        ) : null}
      </div>

      <Button
        variant="ghost"
        className="rounded-full text-muted-foreground"
        onClick={increment}
      >
        +
      </Button>
    </div>
  );
};

type TimerFillProps = {
  progress: number;
  variant: SessionVariant;
};

const TimerFill = ({ progress, variant }: TimerFillProps) => {
  const clamped = 100 - Math.max(0, Math.min(100, progress));
  const bg =
    variant === "focus"
      ? "bg-primary"
      : variant === "shortBreak"
        ? "bg-green-300"
        : "bg-blue-300";

  return (
    <div className="pointer-events-none absolute inset-[6px] overflow-hidden rounded-md transition-all group-hover:inset-0">
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 opacity-10 transition-[height] duration-300 ease-linear",
          bg,
        )}
        style={{ height: `${clamped}%` }}
      />
    </div>
  );
};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
};
