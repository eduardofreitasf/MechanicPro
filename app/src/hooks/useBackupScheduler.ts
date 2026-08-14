import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "../store/useSettingsStore";
import { format, differenceInDays } from "date-fns";

export function useBackupScheduler() {
  const { backupConfig, updateBackupConfig, loadSettings, isLoading } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (isLoading || !backupConfig.enabled) return;

    const checkAndRunBackup = async () => {
      const now = new Date();
      let shouldRun = false;

      if (!backupConfig.lastBackupDate) {
        shouldRun = true;
      } else {
        const lastDate = new Date(backupConfig.lastBackupDate);
        const diffDays = differenceInDays(now, lastDate);

        if (backupConfig.frequency === "daily" && diffDays >= 1) {
          shouldRun = true;
        } else if (backupConfig.frequency === "weekly" && diffDays >= 7) {
          shouldRun = true;
        } else if (backupConfig.frequency === "monthly" && diffDays >= 30) {
          shouldRun = true;
        }
      }

      if (shouldRun) {
        try {
          console.log(`Running scheduled backup via ${backupConfig.method}...`);
          if (backupConfig.method === "local" && backupConfig.localPath) {
            const filename = `mechanicpro_backup_${format(now, "yyyy-MM-dd_HH-mm")}.db`;
            await invoke("backup_local_db", {
              targetDir: backupConfig.localPath,
              filename,
            });
            console.log("Local backup successful.");
          } else if (backupConfig.method === "email" && backupConfig.emailHost) {
            await invoke("send_email_backup", {
              host: backupConfig.emailHost,
              port: backupConfig.emailPort,
              username: backupConfig.emailUser,
              password: backupConfig.emailPass,
              toEmail: backupConfig.emailTo,
            });
            console.log("Email backup successful.");
          }

          // Update last backup date only if it succeeded
          await updateBackupConfig({ lastBackupDate: now.toISOString() });
        } catch (error) {
          console.error("Backup failed:", error);
        }
      }
    };

    // Run once on load
    checkAndRunBackup();

    // Check periodically (every hour) while the app is open
    const interval = setInterval(checkAndRunBackup, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [backupConfig, isLoading, updateBackupConfig]);
}
