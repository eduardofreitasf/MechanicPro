import { FolderOpen } from "lucide-react";
import { BackupConfig } from "../types/config";

interface BackupConfigFormProps {
  backupData: BackupConfig;
  onBackupChange: <K extends keyof BackupConfig>(field: K, value: BackupConfig[K]) => void;
}

export function BackupConfigForm({ backupData, onBackupChange }: BackupConfigFormProps) {
  const handleFolderSelect = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({ directory: true, multiple: false });
      if (selected && typeof selected === "string") {
        onBackupChange("localPath", selected);
      }
    } catch (err) {
      console.error("Failed to open directory dialog:", err);
    }
  };

  return (
    <div className="settings-data-section">
      <div className="card form-card-padding">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={backupData.enabled}
              onChange={(e) => onBackupChange("enabled", e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
            />
            <span>Ativar Backups Automáticos</span>
          </label>

          {backupData.enabled && (
            <>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Frequência</label>
                  <select
                    className="form-input"
                    value={backupData.frequency}
                    onChange={(e) => onBackupChange("frequency", e.target.value as any)}
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Método de Backup</label>
                  <select
                    className="form-input"
                    value={backupData.method}
                    onChange={(e) => onBackupChange("method", e.target.value as any)}
                  >
                    <option value="local">Pasta Local</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              {backupData.method === "local" && (
                <div className="form-group">
                  <label className="form-label">Pasta de Destino</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="form-input"
                      value={backupData.localPath}
                      readOnly
                      placeholder="Selecione uma pasta..."
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleFolderSelect}
                      style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}
                    >
                      <FolderOpen size={16} /> Selecionar
                    </button>
                  </div>
                </div>
              )}

              {backupData.method === "email" && (
                <div className="smtp-config-container">
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "var(--primary)", fontWeight: 700 }}>
                    Configurações SMTP
                  </h4>
                  
                  <div className="form-grid-2" style={{ marginBottom: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">Host SMTP</label>
                      <input
                        type="text"
                        className="form-input"
                        value={backupData.emailHost}
                        onChange={(e) => onBackupChange("emailHost", e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Porta</label>
                      <input
                        type="number"
                        className="form-input"
                        value={backupData.emailPort}
                        onChange={(e) => onBackupChange("emailPort", parseInt(e.target.value) || 587)}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "12px" }}>
                    <label className="form-label">Email Remetente (Username)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={backupData.emailUser}
                      onChange={(e) => onBackupChange("emailUser", e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: "12px" }}>
                    <label className="form-label">Password (App Password)</label>
                    <input
                      type="password"
                      className="form-input"
                      value={backupData.emailPass}
                      onChange={(e) => onBackupChange("emailPass", e.target.value)}
                      placeholder="****"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email Destino (Para onde enviar?)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={backupData.emailTo}
                      onChange={(e) => onBackupChange("emailTo", e.target.value)}
                      placeholder="teu-backup@email.com"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
