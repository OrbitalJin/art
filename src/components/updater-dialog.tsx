import { useState } from "react";
import { CloudDownload } from "lucide-react";

import { useUIStateStore } from "@/lib/store/use-ui-state-store";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateTab } from "./update/update-tab";
import { ChangelogTab } from "./update/changelog-tab";
import { useAppUpdater } from "@/hooks/use-app-updater";

export const UpdaterDialog = () => {
  const open = useUIStateStore((state) => state.updateDialogOpen);
  const setOpen = useUIStateStore((state) => state.setUpdateDialogOpen);
  const [tab, setTab] = useState("update");
  const { status } = useAppUpdater(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant={status === "available" ? "outline" : "ghost"}
          className="relative h-10 w-10 text-muted-foreground transition-colors hover:text-foreground"
        >
          <CloudDownload
            className={status === "available" ? "text-green-400" : ""}
          />
          {status === "available" && (
            <div className="absolute top-0 right-0 h-1 w-1 rounded-full opacity-80 bg-green-400 animate-ping" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="shrink-0 border-b bg-muted/20 px-6 py-5">
          <DialogTitle>Updates</DialogTitle>
          <DialogDescription className="mt-1">
            Check for app updates and review recent changes.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex h-full min-h-0 flex-col gap-0"
        >
          <div className="border-b p-2">
            <TabsList className="flex flex-row w-full">
              <TabsTrigger value="update">Update</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto">
            <TabsContent
              value="update"
              className="mt-0 flex min-h-0 flex-1 flex-col"
            >
              <UpdateTab enabled={open && tab === "update"} />
            </TabsContent>

            <TabsContent
              value="changelog"
              className="mt-0 flex min-h-0 flex-1 flex-col"
            >
              <ChangelogTab enabled={open && tab === "changelog"} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
