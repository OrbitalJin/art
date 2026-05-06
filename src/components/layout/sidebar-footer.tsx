import { SettingsDialog } from "../settings/settings-dialog";
import { UpdaterDialog } from "../updater-dialog";

export const SidebarFooter = () => {
  return (
    <div className="flex flex-col gap-2 px-2 mt-auto">
      <UpdaterDialog />
      <SettingsDialog />
    </div>
  );
};
