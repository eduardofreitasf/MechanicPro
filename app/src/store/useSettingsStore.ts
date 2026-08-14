import { create } from "zustand";
import { getDb } from "../db";
import { BackupConfig, DEFAULT_BACKUP_CONFIG, DEFAULT_PDF_CONFIG, PdfTemplateConfig } from "../types/config";

interface SettingsState {
  pdfConfig: PdfTemplateConfig;
  backupConfig: BackupConfig;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updatePdfConfig: (partial: Partial<PdfTemplateConfig>) => Promise<void>;
  resetPdfConfig: () => Promise<void>;
  updateBackupConfig: (partial: Partial<BackupConfig>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  pdfConfig: DEFAULT_PDF_CONFIG,
  backupConfig: DEFAULT_BACKUP_CONFIG,
  isLoading: true,

  loadSettings: async () => {
    try {
      const db = await getDb();
      const rows = await db.select<{ key: string; value: string }[]>(
        "SELECT key, value FROM settings WHERE key IN ('pdf_config', 'backup_config')"
      );

      let loadedPdfConfig = DEFAULT_PDF_CONFIG;
      let loadedBackupConfig = DEFAULT_BACKUP_CONFIG;

      if (rows.length > 0) {
        rows.forEach(row => {
            if (row.key === 'pdf_config') {
                try {
                    const parsed = JSON.parse(row.value) as Partial<PdfTemplateConfig>;
                    loadedPdfConfig = { ...DEFAULT_PDF_CONFIG, ...parsed };
                } catch (e) {
                    console.error("Failed to parse pdf_config setting:", e);
                }
            } else if (row.key === 'backup_config') {
                try {
                    const parsed = JSON.parse(row.value) as Partial<BackupConfig>;
                    loadedBackupConfig = { ...DEFAULT_BACKUP_CONFIG, ...parsed };
                } catch (e) {
                    console.error("Failed to parse backup_config setting:", e);
                }
            }
        });
      }
      
      set({
        pdfConfig: loadedPdfConfig,
        backupConfig: loadedBackupConfig,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to load settings from DB:", err);
      set({ isLoading: false });
    }
  },

  updatePdfConfig: async (partial) => {
    const current = get().pdfConfig;
    const updated: PdfTemplateConfig = { ...current, ...partial };
    
    // Immediate state update for smooth real-time preview UX
    set({ pdfConfig: updated });

    try {
      const db = await getDb();
      const valStr = JSON.stringify(updated);
      await db.execute(
        `INSERT INTO settings (key, value, updated_at) VALUES ('pdf_config', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
        [valStr]
      );
    } catch (err) {
      console.error("Failed to save pdf_config to DB:", err);
    }
  },

  updateBackupConfig: async (partial) => {
    const current = get().backupConfig;
    const updated: BackupConfig = { ...current, ...partial };
    
    set({ backupConfig: updated });

    try {
      const db = await getDb();
      const valStr = JSON.stringify(updated);
      await db.execute(
        `INSERT INTO settings (key, value, updated_at) VALUES ('backup_config', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
        [valStr]
      );
    } catch (err) {
      console.error("Failed to save backup_config to DB:", err);
    }
  },

  resetPdfConfig: async () => {
    set({ pdfConfig: DEFAULT_PDF_CONFIG });
    try {
      const db = await getDb();
      const valStr = JSON.stringify(DEFAULT_PDF_CONFIG);
      await db.execute(
        `INSERT INTO settings (key, value, updated_at) VALUES ('pdf_config', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
        [valStr]
      );
    } catch (err) {
      console.error("Failed to reset pdf_config in DB:", err);
    }
  },
}));
