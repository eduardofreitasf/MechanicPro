import { create } from "zustand";
import { getDb } from "../db";
import { PdfTemplateConfig, DEFAULT_PDF_CONFIG } from "../types/config";

interface SettingsState {
  pdfConfig: PdfTemplateConfig;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updatePdfConfig: (partial: Partial<PdfTemplateConfig>) => Promise<void>;
  resetPdfConfig: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  pdfConfig: DEFAULT_PDF_CONFIG,
  isLoading: true,

  loadSettings: async () => {
    try {
      const db = await getDb();
      const rows = await db.select<{ key: string; value: string }[]>(
        "SELECT key, value FROM settings WHERE key = 'pdf_config'"
      );

      if (rows.length > 0) {
        try {
          const parsed = JSON.parse(rows[0].value) as Partial<PdfTemplateConfig>;
          set({
            pdfConfig: { ...DEFAULT_PDF_CONFIG, ...parsed },
            isLoading: false,
          });
          return;
        } catch (e) {
          console.error("Failed to parse pdf_config setting:", e);
        }
      }
      set({ isLoading: false });
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
