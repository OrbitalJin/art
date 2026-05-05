import { useEffect, useMemo, useState } from "react";
import { CloudDownload, Loader2 } from "lucide-react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

type UpdaterStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "downloading"
  | "installing"
  | "installed"
  | "error";

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

export const UpdaterDialog = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<UpdaterStatus>("idle");
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(0);
  const [contentLength, setContentLength] = useState(0);

  const progress = useMemo(() => {
    if (!contentLength) return 0;
    return Math.min(100, Math.round((downloaded / contentLength) * 100));
  }, [downloaded, contentLength]);

  const notes = useMemo(() => {
    if (!updateInfo?.body) return [];

    return updateInfo.body
      .split("\n")
      .map((line: string) => line.trim())
      .filter(Boolean);
  }, [updateInfo]);

  const handleCheckForUpdates = async () => {
    try {
      setStatus("checking");
      setError(null);
      setDownloaded(0);
      setContentLength(0);

      const update = await check();

      if (!update) {
        setUpdateInfo(null);
        setStatus("unavailable");
        return;
      }

      setUpdateInfo(update);
      setStatus("available");
    } catch (err) {
      console.error("Failed to check for updates:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  const handleDownloadAndInstall = async () => {
    if (!updateInfo) return;

    try {
      setStatus("downloading");
      setError(null);
      setDownloaded(0);
      setContentLength(0);

      await updateInfo.downloadAndInstall((event: any) => {
        switch (event.event) {
          case "Started":
            setContentLength(event.data.contentLength ?? 0);
            setDownloaded(0);
            break;

          case "Progress":
            setDownloaded((prev: number) => prev + event.data.chunkLength);
            break;

          case "Finished":
            setStatus("installing");
            break;
        }
      });

      setStatus("installed");
    } catch (err) {
      console.error("Failed to download/install update:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  const handleRelaunch = async () => {
    try {
      await relaunch();
    } catch (err) {
      console.error("Failed to relaunch app:", err);
      setError(err instanceof Error ? err.message : "Failed to restart app");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!open) return;
    void handleCheckForUpdates();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 text-muted-foreground transition-colors hover:text-foreground"
        >
          <CloudDownload className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[min(520px,calc(100vw-2rem))] p-0 overflow-hidden">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Updater</DialogTitle>
          <DialogDescription>
            Download and install the latest app update.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          {status === "checking" && (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>Checking for updates...</span>
            </div>
          )}

          {status === "unavailable" && (
            <div className="space-y-2 py-2">
              <Badge variant="outline">Up to date</Badge>
              <p className="text-sm text-muted-foreground">
                You already have the latest version installed.
              </p>
            </div>
          )}

          {(status === "available" ||
            status === "downloading" ||
            status === "installing" ||
            status === "installed") &&
            updateInfo && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">
                      Version {updateInfo.version}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(updateInfo.date)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {status === "available" && (
                      <Badge variant="outline">Update available</Badge>
                    )}
                    {status === "downloading" && (
                      <Badge variant="outline">Downloading</Badge>
                    )}
                    {status === "installing" && (
                      <Badge variant="outline">Installing</Badge>
                    )}
                    {status === "installed" && (
                      <Badge variant="outline">Ready to restart</Badge>
                    )}
                  </div>
                </div>

                {notes.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Notes
                    </div>

                    <ScrollArea className="max-h-32 rounded-md border">
                      <div className="px-3 py-2">
                        <ul className="space-y-2 text-sm text-foreground/90">
                          {notes.map((line, index) => (
                            <li key={`${line}-${index}`}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {(status === "downloading" ||
                  status === "installing" ||
                  status === "installed") && (
                  <div className="space-y-2">
                    <Progress value={progress} />

                    <div className="text-xs text-muted-foreground">
                      {status === "downloading" &&
                        `${formatBytes(downloaded)} of ${formatBytes(contentLength)} downloaded (${progress}%)`}
                      {status === "installing" && "Finalizing installation..."}
                      {status === "installed" &&
                        "Update installed successfully. Restart to finish."}
                    </div>
                  </div>
                )}
              </div>
            )}

          {status === "error" && (
            <div className="space-y-2 py-2">
              <Badge variant="outline">Update failed</Badge>
              <p className="text-sm text-muted-foreground">
                {error ?? "Something went wrong while updating."}
              </p>
            </div>
          )}

          {status === "idle" && (
            <div className="py-2 text-sm text-muted-foreground">
              Open the updater to check for available updates.
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <div className="flex w-full items-center justify-between gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>

            <div className="flex gap-2">
              {(status === "idle" ||
                status === "unavailable" ||
                status === "error") && (
                <Button
                  onClick={handleCheckForUpdates}
                  disabled={status === "checking"}
                >
                  Check for updates
                </Button>
              )}

              {status === "available" && (
                <Button onClick={handleDownloadAndInstall}>Update now</Button>
              )}

              {status === "installed" && (
                <Button onClick={handleRelaunch}>Restart app</Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
