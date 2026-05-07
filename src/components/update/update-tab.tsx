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
    <div className="flex h-full flex-col bg-background">
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="mx-auto max-w-3xl px-6 py-6">
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-medium tracking-tight">Updates</h1>
              <p className="text-sm text-muted-foreground">
                Keep your app up to date with the latest improvements and fixes.
              </p>
            </div>

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

              {showUpdateCard && updateInfo && (
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/50">
                  <div className="border-b border-border/50 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          {status === "installed" ? (
                            <RefreshCw className="size-4 text-green-600" />
                          ) : status === "installing" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : status === "downloading" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CloudDownload className="size-4 text-blue-600" />
                          )}

                          <h2 className="text-base font-medium tracking-tight">
                            {status === "available"
                              ? "Update available"
                              : status === "downloading"
                                ? "Downloading update"
                                : status === "installing"
                                  ? "Installing update"
                                  : "Update ready"}
                          </h2>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {status === "available"
                            ? "A newer version is available to download and install."
                            : status === "downloading"
                              ? "Your update is currently being downloaded."
                              : status === "installing"
                                ? "Finalizing the installation."
                                : "The update was installed successfully. Restart to finish."}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground/80">
                        v{updateInfo.version}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-medium">
                          {updateInfo.version}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Released</span>
                        <span className="font-medium">
                          {formatDate(updateInfo.date)}
                        </span>
                      </div>
                    </div>

                    {(status === "downloading" ||
                      status === "installing" ||
                      status === "installed") && (
                      <div className="space-y-3 rounded-xl bg-muted/20 px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">
                            {status === "downloading"
                              ? "Downloading update"
                              : status === "installing"
                                ? "Installing update"
                                : "Installation complete"}
                          </span>

                          <span className="text-muted-foreground">
                            {progress}%
                          </span>
                        </div>

                        <Progress value={progress} />

                        <p className="text-xs text-muted-foreground">
                          {status === "downloading" &&
                            `${formatBytes(downloaded)} of ${formatBytes(contentLength)} downloaded`}
                          {status === "installing" &&
                            "Finalizing installation..."}
                          {status === "installed" &&
                            "Update installed successfully. Restart the app to finish."}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
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
        </ScrollArea>
      </div>

      <div className="border-t border-border/60 bg-background/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-2">
          {(status === "idle" ||
            status === "unavailable" ||
            status === "error" ||
            status === "checking") && (
            <Button onClick={checkForUpdates} disabled={status === "checking"}>
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
  );
};
