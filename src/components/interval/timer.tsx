import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, RotateCcw, Settings2, SkipForward } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

interface Props {
  className?: string;
}

type SessionVariant = "focus" | "short" | "long";

export const Timer: React.FC<Props> = ({ className }) => {
  const totalSessions = 5;
  const currentSession = 1;
  const currentTime = "25:00";
  const variant: SessionVariant = "focus";

  return (
    <div
      className={cn(
        className,
        "group relative flex h-full flex-col",
        "items-center justify-center rounded-md border bg-card/50 p-2 shadow-sm",
      )}
    >
      <div className="absolute -z-10 h-full w-full bg-secondary/5" />
      <TimerFill variant={variant} progress={0} />

      <ResponsiveTimerSettings />

      <div className="mx-auto flex flex-col items-center gap-4">
        <p className="tracking-widest text-muted-foreground">Focus</p>
        <p
          className="text-5xl lg:text-6xl text-foreground/80"
          style={{ fontFamily: "monospace" }}
        >
          {currentTime}
        </p>
        <div className="mx-auto flex w-[9.5rem] flex-wrap justify-center gap-2">
          {[...Array(totalSessions).keys()].map((i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-2 rounded-full",
                i < currentSession ? "bg-primary" : "bg-primary/30",
              )}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-[15%] flex items-center gap-2 rounded-full border bg-background/70 p-1.5 shadow-sm backdrop-blur",
          "opacity-0 transition-opacity duration-200 group-hover:opacity-80",
        )}
      >
        <Button variant="ghost" size="icon" className="rounded-full">
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button size="icon" className="rounded-full shadow-sm">
          <Play className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const ResponsiveTimerSettings = () => {
  const [open, setOpen] = React.useState(false);
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
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SettingRow
          label="Focus"
          hint="Minutes per focus session"
          control={<StepInput value={25} suffix="min" />}
        />

        <SettingRow
          label="Short break"
          hint="Minutes between focus sessions"
          control={<StepInput value={5} suffix="min" />}
        />

        <SettingRow
          label="Long break"
          hint="Minutes after a full cycle"
          control={<StepInput value={15} suffix="min" />}
        />

        <SettingRow
          label="Long break every"
          hint="Number of focus sessions"
          control={<StepInput value={4} suffix="sesh" />}
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
};

const StepInput = ({ value, suffix }: StepInputProps) => {
  return (
    <div className="flex items-center rounded-full bg-card/50 shadow-md">
      <Button variant="ghost" className="rounded-full text-muted-foreground">
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

      <Button variant="ghost" className="rounded-full text-muted-foreground">
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
      : variant === "short"
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
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
};
