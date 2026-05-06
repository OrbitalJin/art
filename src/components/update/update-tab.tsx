import {
  AlertTriangle,
  CheckCircle2,
  CloudDownload,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useAppUpdater } from "@/hooks/use-app-updater";
import { StatusCard } from "./status-card";

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(date?: string | null) {
  if (!date) return "Unknown date";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const UpdateTab: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const {
    status,
    updateInfo,
    error,
    downloaded,
    contentLength,
    progress,
    notes,
    checkForUpdates,
    downloadAndInstall,
    restartToFinish,
  } = useAppUpdater(enabled);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-4">
          {status === "checking" && (
            <StatusCard
              icon={<Loader2 className="size-5 animate-spin" />}
              title="Checking for updates"
              description="Looking for the latest available version."
            />
          )}

          {status === "unavailable" && (
            <StatusCard
              icon={<CheckCircle2 className="size-5 text-green-600" />}
              title="You're up to date"
              description="You already have the latest version installed."
              tone="success"
            />
          )}

          {status === "error" && (
            <StatusCard
              icon={<AlertTriangle className="size-5 text-red-600" />}
              title="Couldn't install update"
              description={error ?? "Something went wrong while updating."}
              tone="error"
            />
          )}

          {(status === "available" ||
            status === "downloading" ||
            status === "installing" ||
            status === "installed") &&
            updateInfo && (
              <>
                <StatusCard
                  icon={
                    status === "installed" ? (
                      <RefreshCw className="size-5 text-green-600" />
                    ) : status === "installing" ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : status === "downloading" ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <CloudDownload className="size-5 text-blue-600" />
                    )
                  }
                  title={
                    status === "available"
                      ? "Update available"
                      : status === "downloading"
                        ? "Downloading update"
                        : status === "installing"
                          ? "Installing update"
                          : "Update ready"
                  }
                  description={
                    status === "available"
                      ? "A newer version is available to download and install."
                      : status === "downloading"
                        ? "Your update is currently being downloaded."
                        : status === "installing"
                          ? "Finalizing the installation."
                          : "The update was installed successfully. Restart to finish."
                  }
                  badge={`v${updateInfo.version}`}
                  tone={status === "installed" ? "success" : "info"}
                />

                <div className="grid grid-cols-2 gap-3 rounded-xl border bg-background p-4 text-sm">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Version
                    </div>
                    <div className="mt-1 font-medium">{updateInfo.version}</div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Released
                    </div>
                    <div className="mt-1 font-medium">
                      {formatDate(updateInfo.date)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    What's new
                  </div>

                  <ScrollArea className="max-h-40 rounded-xl border bg-muted/20">
                    <div className="px-4 py-3">
                      {notes.length > 0 ? (
                        <ul className="space-y-2 text-sm text-foreground/90">
                          {notes.map((line, index) => (
                            <li
                              key={`${line}-${index}`}
                              className="flex items-start gap-2"
                            >
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No release notes provided for this update.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {(status === "downloading" ||
                  status === "installing" ||
                  status === "installed") && (
                  <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {status === "downloading"
                          ? "Downloading update"
                          : status === "installing"
                            ? "Installing update"
                            : "Installation complete"}
                      </span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>

                    <Progress value={progress} />

                    <div className="text-xs text-muted-foreground">
                      {status === "downloading" &&
                        `${formatBytes(downloaded)} of ${formatBytes(contentLength)} downloaded`}
                      {status === "installing" && "Finalizing installation..."}
                      {status === "installed" &&
                        "Update installed successfully. Restart the app to finish."}
                    </div>
                  </div>
                )}
              </>
            )}

          {status === "idle" && (
            <StatusCard
              icon={<CloudDownload className="size-5" />}
              title="Check for updates"
              description="See whether a newer version of the app is available."
            />
          )}
        </div>
      </div>

      <div className="border-t px-6 py-4">
        <div className="flex w-full items-center justify-between gap-2">
          <div />

          <div className="flex gap-2">
            {(status === "idle" ||
              status === "unavailable" ||
              status === "error" ||
              status === "checking") && (
              <Button
                onClick={checkForUpdates}
                disabled={status === "checking"}
              >
                {status === "checking" && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Check for updates
              </Button>
            )}

            {status === "available" && (
              <Button onClick={downloadAndInstall}>
                <CloudDownload className="mr-2 size-4" />
                Update
              </Button>
            )}

            {status === "installed" && (
              <Button onClick={restartToFinish}>
                <RefreshCw className="mr-2 size-4" />
                Restart to finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
