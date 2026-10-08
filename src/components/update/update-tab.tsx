import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppUpdater } from "@/hooks/use-app-updater";
import { cn } from "@/lib/utils";
import { StatusCard } from "./status-card";

type UpdaterStatus = ReturnType<typeof useAppUpdater>["status"];

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = value >= 100 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
};

const formatDate = (date?: string | null): string | null => {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getUpdateTitle = (status: UpdaterStatus): string => {
  if (status === "downloading") return "Downloading update";
  if (status === "installing") return "Installing update";
  if (status === "installed") return "Update ready";
  return "Update available";
};

const getUpdateDescription = (status: UpdaterStatus): string => {
  if (status === "downloading") return "Your update is being downloaded.";
  if (status === "installing") return "Finalizing the installation.";
  if (status === "installed") return "Installed. Restart the app to finish.";
  return "A newer version is ready to download and install.";
};

const UpdateCard: React.FC<{
  status: UpdaterStatus;
  version: string;
  date?: string | null;
  progress: number;
  downloaded: number;
  contentLength: number;
}> = ({ status, version, date, progress, downloaded, contentLength }) => {
  const released = formatDate(date);
  const showProgress = status === "downloading" || status === "installing";

  const progressDetail =
    status === "downloading"
      ? `${formatBytes(downloaded)} of ${formatBytes(contentLength)}`
      : "Finalizing…";

  const dotClasses = cn(
    "size-1.5 shrink-0 rounded-full",
    status === "installed" ? "bg-emerald-500" : "bg-amber-500",
    showProgress && "animate-pulse motion-reduce:animate-none",
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span aria-hidden className={dotClasses} />
            <h2 className="text-[13px] font-medium text-foreground/90">
              {getUpdateTitle(status)}
            </h2>
          </div>
          <p className="pl-3.5 text-xs text-muted-foreground">
            {getUpdateDescription(status)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="font-mono text-xs text-foreground/80">
            v{version}
          </span>
          {released && (
            <span className="text-[11px] text-muted-foreground/60">
              {released}
            </span>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="flex flex-col gap-1.5">
          <Progress value={progress} className="h-1" />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
            <span className="tabular-nums">{progressDetail}</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
        </div>
      )}
    </section>
  );
};

const UpdateActions: React.FC<{
  status: UpdaterStatus;
  onCheck: () => void;
  onUpdate: () => void;
  onRestart: () => void;
}> = ({ status, onCheck, onUpdate, onRestart }) => {
  if (status === "checking") {
    return (
      <Button type="button" size="sm" disabled>
        Checking…
      </Button>
    );
  }

  if (status === "available") {
    return (
      <Button type="button" size="sm" onClick={onUpdate}>
        Update
      </Button>
    );
  }

  if (status === "downloading") {
    return (
      <Button type="button" size="sm" disabled>
        Downloading…
      </Button>
    );
  }

  if (status === "installing") {
    return (
      <Button type="button" size="sm" disabled>
        Installing…
      </Button>
    );
  }

  if (status === "installed") {
    return (
      <Button type="button" size="sm" onClick={onRestart}>
        Restart to finish
      </Button>
    );
  }

  if (status === "error") {
    return (
      <Button type="button" size="sm" onClick={onCheck}>
        Try again
      </Button>
    );
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={onCheck}>
      Check for updates
    </Button>
  );
};

export const UpdateTab: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const {
    status,
    updateInfo,
    error,
    downloaded,
    contentLength,
    progress,
    checkForUpdates,
    downloadAndInstall,
    restartToFinish,
  } = useAppUpdater(enabled);

  const showUpdateCard =
    status === "available" ||
    status === "downloading" ||
    status === "installing" ||
    status === "installed";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {status === "idle" && (
          <StatusCard
            title="Check for updates"
            description="See whether a newer version of the app is available."
          />
        )}

        {status === "checking" && (
          <StatusCard
            busy
            tone="info"
            title="Checking for updates…"
            description="Looking for the latest version."
          />
        )}

        {status === "unavailable" && (
          <StatusCard
            tone="success"
            title="You're up to date"
            description="You already have the latest version."
          />
        )}

        {status === "error" && (
          <StatusCard
            tone="error"
            title="Couldn't install update"
            description={error ?? "Something went wrong while updating."}
          />
        )}

        {showUpdateCard && updateInfo && (
          <UpdateCard
            status={status}
            version={updateInfo.version}
            date={updateInfo.date}
            progress={progress}
            downloaded={downloaded}
            contentLength={contentLength}
          />
        )}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/50 px-5 py-3">
        <UpdateActions
          status={status}
          onCheck={checkForUpdates}
          onUpdate={downloadAndInstall}
          onRestart={restartToFinish}
        />
      </div>
    </div>
  );
};
