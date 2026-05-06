import { useEffect, useMemo, useState } from "react";
import {
  check,
  type DownloadEvent,
  type Update,
} from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

type UpdaterStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "downloading"
  | "installing"
  | "installed"
  | "error";

export const useAppUpdater = (enabled: boolean) => {
  const [status, setStatus] = useState<UpdaterStatus>("idle");
  const [updateInfo, setUpdateInfo] = useState<Update | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(0);
  const [contentLength, setContentLength] = useState(0);

  const progress = useMemo(() => {
    if (!contentLength) {
      return status === "installed" ? 100 : 0;
    }

    return Math.min(100, Math.round((downloaded / contentLength) * 100));
  }, [contentLength, downloaded, status]);

  const notes = useMemo(() => {
    if (!updateInfo?.body) return [];

    return updateInfo.body
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [updateInfo]);

  const checkForUpdates = async () => {
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

  const downloadAndInstall = async () => {
    if (!updateInfo) return;

    try {
      setStatus("downloading");
      setError(null);
      setDownloaded(0);
      setContentLength(0);

      await updateInfo.downloadAndInstall((event: DownloadEvent) => {
        switch (event.event) {
          case "Started":
            setContentLength(event.data.contentLength ?? 0);
            setDownloaded(0);
            break;
          case "Progress":
            setDownloaded((prev) => prev + event.data.chunkLength);
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

  const restartToFinish = async () => {
    try {
      await relaunch();
    } catch (err) {
      console.error("Failed to relaunch app:", err);
      setError(err instanceof Error ? err.message : "Failed to restart app");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!enabled) return;
    void checkForUpdates();
  }, [enabled]);

  return {
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
  };
};
